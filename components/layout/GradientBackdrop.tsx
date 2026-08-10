"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { GrainientField } from "@/components/hero/GrainientField";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";

/**
 * The site-wide drifting gradient. Fixed behind every section, so it reads as
 * one continuous field rather than a hero treatment — `html` carries the flat
 * background colour and `body` is transparent, which is what lets a negative
 * z-index layer show through.
 *
 * Sections that set their own opaque background (the dark trust band, the
 * green add-group band, the footer) deliberately paint over it.
 */
export function GradientBackdrop() {
  const [enabled, setEnabled] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Desktop gating and reduced-motion both resolved in one gsap.matchMedia so
  // neither is a bare `if` and both re-evaluate when the match state changes.
  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 1024px)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { isDesktop, reduced: prefersReduced } = ctx.conditions as {
          isDesktop: boolean;
          reduced: boolean;
        };
        setEnabled(isDesktop);
        setReduced(prefersReduced);
      },
    );

    return () => mm.revert();
  }, []);

  if (!enabled) {
    // No WebGL below lg — the static approximation costs nothing on the
    // devices least able to afford a continuously running shader.
    return <div aria-hidden className="grainient-static pointer-events-none fixed inset-0 -z-10" />;
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        orthographic
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        frameloop={reduced ? "demand" : "always"}
        className="absolute inset-0"
      >
        <GrainientField animated={!reduced} />
      </Canvas>
    </div>
  );
}
