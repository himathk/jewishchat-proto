"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The site's drifting gradient field, rendered as a fullscreen quad. Mounted
 * once at page level by GradientBackdrop, in a fixed canvas behind all
 * content, so it carries the whole page rather than just the hero.
 *
 * Tuning notes from the design pass, kept here because the numbers look
 * arbitrary otherwise: saturation and contrast are held low and gamma lifted
 * so the whole field stays in the top third of the luminance range and the
 * teal ink stays the darkest thing on screen. Time and warp speeds are slow
 * enough to read as "faintly alive" rather than as motion. Noise scale and
 * zoom favour fewer, larger forms — busy detail behind text is what causes
 * the "can't quite read this" feeling even when contrast passes.
 */
const PARAMS = {
  timeSpeed: 0.1,
  // Was -0.35. Combined with the blend spread below that pinned the mix
  // near zero, so the field was effectively all cream and periwinkle never
  // appeared at all. Cream still dominates, it just isn't the only colour.
  colorBalance: -0.15,
  blendSpread: 1.7,
  warpStrength: 0.6,
  warpFrequency: 3,
  warpSpeed: 0.5,
  warpAmplitude: 25,
  blendAngle: 200,
  blendSoftness: 0.4,
  rotationAmount: 120,
  noiseScale: 1.2,
  // Grain dropped: it was reading as texture over the top of the colour
  // rather than sitting under it.
  gamma: 1.2,
  // Both raised from the original 0.6 / 0.85. At those values the colours
  // were crushed toward mid-grey and the field read as flat neutral. Still
  // low enough that the teal ink stays the darkest thing on screen.
  contrast: 1.05,
  saturation: 1.0,
  centerX: -0.3,
  centerY: -0.45,
  zoom: 1.5,
  opacity: 0.55,
} as const;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // The quad is authored in clip space so it covers the viewport
    // regardless of where the shared camera happens to be.
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec3  uColor1;
  uniform vec3  uColor2;
  uniform vec3  uColor3;
  uniform float uColorBalance;
  uniform float uWarpStrength;
  uniform float uWarpFrequency;
  uniform float uWarpAmplitude;
  uniform float uBlendAngle;
  uniform float uBlendSoftness;
  uniform float uRotation;
  uniform float uNoiseScale;
  uniform float uWarpSpeed;
  uniform float uBlendSpread;
  uniform float uContrast;
  uniform float uGamma;
  uniform float uSaturation;
  uniform vec2  uCenter;
  uniform float uZoom;
  uniform float uOpacity;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
  }

  void main() {
    // Aspect-corrected, centred, then offset and zoomed so the densest
    // colour sits away from the centre content column.
    vec2 p = vUv - 0.5;
    p.x *= uResolution.x / max(uResolution.y, 1.0);
    p = (p - uCenter) / uZoom;
    p = rot(radians(uRotation)) * p;

    // Domain warp. Amplitude is authored on a 0-100 scale. Warp time is
    // separate from field time — folding them into one product ran the
    // whole thing at a twentieth of the intended speed.
    float tw = uTime * uWarpSpeed;
    vec2 w = vec2(
      fbm(p * uWarpFrequency + vec2(0.0, tw)),
      fbm(p * uWarpFrequency + vec2(5.2, 1.3 - tw))
    ) - 0.5;
    vec2 q = p + w * uWarpStrength * (uWarpAmplitude / 100.0);

    // Blend coordinate along the authored angle. The spread matters: the raw
    // dot product only spans a fraction of 0-1, so without it the mix never
    // travels far enough to reach the third colour.
    float a = radians(uBlendAngle);
    float g = dot(q, vec2(cos(a), sin(a))) * uBlendSpread;

    // Two drifting noise fields at different rates are what make the colour
    // masses move independently rather than the whole field sliding.
    g += (fbm(q * uNoiseScale + vec2(uTime * 0.6, 0.0)) - 0.5) * 1.3;
    g += (fbm(q * uNoiseScale * 0.55 - vec2(0.0, uTime * 0.35)) - 0.5) * 0.7;

    // Negative balance biases toward color1 (the dominant cream).
    float m = clamp(g + 0.5 + uColorBalance, 0.0, 1.0);

    float s = max(uBlendSoftness, 0.001);
    vec3 col = mix(uColor1, uColor2, smoothstep(0.0, 0.42 + s * 0.4, m));
    col = mix(col, uColor3, smoothstep(0.5, 1.0 + s * 0.5, m));

    // Grade. Saturation and contrast down, gamma up — all three keep the
    // field inside the top of the luminance range.
    float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = mix(vec3(luma), col, uSaturation);
    col = (col - 0.5) * uContrast + 0.5;
    col = pow(max(col, 0.0), vec3(1.0 / uGamma));

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), uOpacity);
  }
`;

function readToken(name: string, fallback: string): THREE.Color {
  if (typeof window === "undefined") return new THREE.Color(fallback);
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(value || fallback);
}

export function GrainientField({ animated }: { animated: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uColor1: { value: readToken("--color-field-cream", "#fdf8f0") },
      uColor2: { value: readToken("--color-field-mint", "#d3ebe2") },
      uColor3: { value: readToken("--color-field-green", "#a9dcc9") },
      uColorBalance: { value: PARAMS.colorBalance },
      uWarpStrength: { value: PARAMS.warpStrength },
      uWarpFrequency: { value: PARAMS.warpFrequency },
      uWarpAmplitude: { value: PARAMS.warpAmplitude },
      uBlendAngle: { value: PARAMS.blendAngle },
      uBlendSoftness: { value: PARAMS.blendSoftness },
      uRotation: { value: PARAMS.rotationAmount },
      uNoiseScale: { value: PARAMS.noiseScale },
      uWarpSpeed: { value: PARAMS.warpSpeed },
      uBlendSpread: { value: PARAMS.blendSpread },
      uContrast: { value: PARAMS.contrast },
      uGamma: { value: PARAMS.gamma },
      uSaturation: { value: PARAMS.saturation },
      uCenter: { value: new THREE.Vector2(PARAMS.centerX, PARAMS.centerY) },
      uZoom: { value: PARAMS.zoom },
      uOpacity: { value: PARAMS.opacity },
    }),
    [],
  );

  useFrame(({ clock, size }) => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uResolution.value.set(size.width, size.height);
    // Reduced motion renders a single deterministic frame: the field is
    // still there, it just never drifts.
    material.uniforms.uTime.value = animated ? clock.getElapsedTime() * PARAMS.timeSpeed : 0;
  });

  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        transparent
      />
    </mesh>
  );
}
