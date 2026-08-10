"use client";

import { Grainient } from "@/components/ui/Grainient";

/**
 * The site-wide drifting gradient, fixed behind every section. `html` carries
 * the flat background colour and `body` is transparent, which is what lets a
 * negative z-index layer show through.
 *
 * Sections that set their own opaque background (the dark trust band, the
 * green add-group band, the footer) deliberately paint over it.
 */
export function GradientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <Grainient
        color1="#FDF8F0"
        color2="#D3EBE2"
        color3="#A9DCC9"
        timeSpeed={0.05}
        colorBalance={-0.35}
        warpStrength={0.6}
        warpFrequency={3}
        warpSpeed={0.5}
        warpAmplitude={25}
        blendAngle={200}
        blendSoftness={0.4}
        rotationAmount={120}
        noiseScale={1.2}
        grainAmount={0.07}
        grainScale={1.5}
        grainAnimated={false}
        contrast={0.85}
        gamma={1.2}
        saturation={0.6}
        centerX={-0.3}
        centerY={-0.45}
        zoom={1.5}
      />
    </div>
  );
}
