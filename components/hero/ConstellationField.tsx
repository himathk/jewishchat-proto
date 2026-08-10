"use client";

/**
 * This module intentionally mutates typed-array buffers in place every frame
 * (see the "use no memo" directive and the comment above `buffers` below) so
 * the WebGL scene never reallocates while animating — the standard
 * react-three-fiber pattern for driving `bufferAttribute`s imperatively.
 * That is incompatible with the React Compiler diagnostic rules'
 * pure-render assumptions, which is exactly what "use no memo" opts out of
 * at the compiler level; the eslint-plugin-react-hooks compiler-diagnostic
 * rules run independently of that directive and don't model this pattern,
 * so they're disabled for this file rather than for the rule everywhere.
 */
/* eslint-disable react-hooks/immutability */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSearchContext } from "@/components/providers/SearchProvider";
import { CATEGORIES } from "@/lib/data/categories";
import { PUBLIC_GROUPS } from "@/lib/data/groups";

const NODE_COUNT = 150;
const MAX_LINKS = 320;
const REPEL_RADIUS = 2.4;

const COLOR_IDLE = new THREE.Color("#6E9C90");
const COLOR_ACTIVE = new THREE.Color("#1E9783");
const LINE_IDLE = new THREE.Color("#9BC6BA");
const LINE_ACTIVE = new THREE.Color("#1E9783");

/** Deterministic PRNG so the layout is identical on every mount. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type FieldData = {
  base: Float32Array;
  seeds: Float32Array;
  /** Category id each node belongs to — drives cluster activation. */
  categoryIds: string[];
  /** Group id for the first 24 nodes, null for ambient nodes. */
  groupIds: (string | null)[];
  links: number[];
};

type FieldBuffers = {
  live: Float32Array;
  pointColors: Float32Array;
  pointSizes: Float32Array;
  active: Float32Array;
  target: Float32Array;
  linePositions: Float32Array;
  lineColors: Float32Array;
};

function buildBuffers(field: FieldData): FieldBuffers {
  const linkCount = field.links.length / 2;
  return {
    live: new Float32Array(field.base),
    pointColors: new Float32Array(NODE_COUNT * 3),
    pointSizes: new Float32Array(NODE_COUNT),
    active: new Float32Array(NODE_COUNT),
    target: new Float32Array(NODE_COUNT),
    linePositions: new Float32Array(linkCount * 2 * 3),
    lineColors: new Float32Array(linkCount * 2 * 3),
  };
}

function buildField(): FieldData {
  const rand = mulberry32(0x1e9783);
  const base = new Float32Array(NODE_COUNT * 3);
  const seeds = new Float32Array(NODE_COUNT);
  const categoryIds: string[] = [];
  const groupIds: (string | null)[] = [];

  // 12 hub centres, one per category, spread across a shallow slab.
  const hubs = CATEGORIES.map((_, i) => {
    const angle = (i / CATEGORIES.length) * Math.PI * 2;
    const radius = 3.6 + rand() * 2.6;
    return [Math.cos(angle) * radius * 1.65, Math.sin(angle) * radius * 0.82, (rand() - 0.5) * 3.4];
  });

  for (let i = 0; i < NODE_COUNT; i += 1) {
    const catIndex = i % CATEGORIES.length;
    const hub = hubs[catIndex];
    base[i * 3 + 0] = hub[0] + (rand() - 0.5) * 3.6;
    base[i * 3 + 1] = hub[1] + (rand() - 0.5) * 2.4;
    base[i * 3 + 2] = hub[2] + (rand() - 0.5) * 1.8;
    seeds[i] = rand() * Math.PI * 2;
    categoryIds.push(CATEGORIES[catIndex].id);
    groupIds.push(PUBLIC_GROUPS[i] ? PUBLIC_GROUPS[i].id : null);
  }

  // Join each node to its two nearest neighbours, capped.
  const links: number[] = [];
  for (let i = 0; i < NODE_COUNT && links.length < MAX_LINKS * 2; i += 1) {
    const dists: { j: number; d: number }[] = [];
    for (let j = 0; j < NODE_COUNT; j += 1) {
      if (i === j) continue;
      const dx = base[i * 3] - base[j * 3];
      const dy = base[i * 3 + 1] - base[j * 3 + 1];
      const dz = base[i * 3 + 2] - base[j * 3 + 2];
      dists.push({ j, d: dx * dx + dy * dy + dz * dz });
    }
    dists.sort((a, b) => a.d - b.d);
    for (const { j } of dists.slice(0, 2)) {
      if (i < j) links.push(i, j);
    }
  }

  return { base, seeds, categoryIds, groupIds, links };
}

export function ConstellationField() {
  // This component intentionally mutates typed-array buffers in place every
  // frame (see the comment above `buffersRef`) so the WebGL scene never
  // reallocates while animating. That pattern is incompatible with React
  // Compiler's memoization assumptions, so this component opts out.
  "use no memo";

  const { results, isSearching } = useSearchContext();
  const field = useMemo(() => buildField(), []);
  const { viewport } = useThree();

  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Mutable per-frame buffers, kept stable for the component's lifetime and
  // written to in place every frame (see the "use no memo" directive above
  // — that mutation is deliberate, not a bug).
  const buffers = useMemo(() => buildBuffers(field), [field]);

  // Recompute activation targets whenever the query results change.
  // useEffect, not useMemo — this writes to a buffer, it does not derive a value.
  useEffect(() => {
    const top = results.slice(0, 10);
    const groupHits = new Set(top.map((r) => r.group.id));
    const categoryHits = new Set(top.map((r) => r.group.categoryId));

    for (let i = 0; i < NODE_COUNT; i += 1) {
      const gid = field.groupIds[i];
      if (!isSearching) buffers.target[i] = 0;
      else if (gid && groupHits.has(gid)) buffers.target[i] = 1;
      else if (categoryHits.has(field.categoryIds[i])) buffers.target[i] = 0.45;
      else buffers.target[i] = 0;
    }
  }, [results, isSearching, field, buffers]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const { live, active, target, pointColors, pointSizes, linePositions, lineColors } = buffers;

    const mx = (state.pointer.x * viewport.width) / 2;
    const my = (state.pointer.y * viewport.height) / 2;
    const ease = Math.min(1, delta * 4);
    const color = new THREE.Color();

    for (let i = 0; i < NODE_COUNT; i += 1) {
      active[i] += (target[i] - active[i]) * ease;
      const a = active[i];
      const seed = field.seeds[i];

      let x = field.base[i * 3] + Math.sin(t * 0.24 + seed) * 0.34;
      let y = field.base[i * 3 + 1] + Math.cos(t * 0.19 + seed * 1.7) * 0.28;
      const z = field.base[i * 3 + 2] + Math.sin(t * 0.15 + seed * 0.6) * 0.2;

      // Active nodes drift toward the centre of the field.
      x -= x * a * 0.34;
      y -= y * a * 0.34;

      // Cursor repulsion in the z=0 plane.
      const dx = x - mx;
      const dy = y - my;
      const dist = Math.hypot(dx, dy);
      if (dist < REPEL_RADIUS && dist > 0.0001) {
        const push = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * 0.85;
        x += (dx / dist) * push;
        y += (dy / dist) * push;
      }

      live[i * 3] = x;
      live[i * 3 + 1] = y;
      live[i * 3 + 2] = z;

      color.copy(COLOR_IDLE).lerp(COLOR_ACTIVE, a);
      pointColors[i * 3] = color.r;
      pointColors[i * 3 + 1] = color.g;
      pointColors[i * 3 + 2] = color.b;
      pointSizes[i] = 6.5 + a * 10.5;
    }

    // Rebuild line vertices from the live node positions.
    for (let k = 0; k < field.links.length; k += 2) {
      const i = field.links[k];
      const j = field.links[k + 1];
      const strength = Math.max(active[i], active[j]);
      color.copy(LINE_IDLE).lerp(LINE_ACTIVE, strength);

      for (const [slot, node] of [
        [k, i],
        [k + 1, j],
      ] as const) {
        linePositions[slot * 3] = live[node * 3];
        linePositions[slot * 3 + 1] = live[node * 3 + 1];
        linePositions[slot * 3 + 2] = live[node * 3 + 2];
        lineColors[slot * 3] = color.r;
        lineColors[slot * 3 + 1] = color.g;
        lineColors[slot * 3 + 2] = color.b;
      }
    }

    const pg = pointsRef.current?.geometry;
    if (pg) {
      pg.attributes.position.needsUpdate = true;
      pg.attributes.color.needsUpdate = true;
      pg.attributes.size.needsUpdate = true;
    }
    const lg = linesRef.current?.geometry;
    if (lg) {
      lg.attributes.position.needsUpdate = true;
      lg.attributes.color.needsUpdate = true;
    }
  });

  return (
    <group>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[buffers.linePositions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[buffers.lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.72} />
      </lineSegments>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[buffers.live, 3]} />
          <bufferAttribute attach="attributes-color" args={[buffers.pointColors, 3]} />
          <bufferAttribute attach="attributes-size" args={[buffers.pointSizes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          vertexShader={`
            attribute float size;
            varying vec3 vColor;
            void main() {
              vColor = color;
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size * (14.0 / -mv.z);
              gl_Position = projectionMatrix * mv;
            }
          `}
          fragmentShader={`
            varying vec3 vColor;
            void main() {
              float d = length(gl_PointCoord - vec2(0.5));
              if (d > 0.5) discard;
              float alpha = smoothstep(0.5, 0.06, d);
              gl_FragColor = vec4(vColor, alpha * 0.92);
            }
          `}
          vertexColors
        />
      </points>
    </group>
  );
}
