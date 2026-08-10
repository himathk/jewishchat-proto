"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ConstellationField } from "./ConstellationField";
import { LatticeBackdrop } from "@/components/ui/LatticeBackdrop";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";

export function Constellation() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  // Desktop gating and reduced-motion detection both live in one
  // gsap.matchMedia() so neither branch is a bare `if` and both stay in
  // sync automatically whenever a query's match state changes.
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

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(host);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* The old opaque mint wash lived here. It was removed when the gradient
          field moved to a site-wide fixed layer — being opaque, it painted
          over the field for the whole height of the hero. */}
      <div className="bg-brand-soft/45 absolute top-[-18%] left-1/2 size-[52rem] -translate-x-1/2 rounded-full blur-[120px]" />

      {enabled ? (
        <Canvas
          camera={{ position: [0, 0, 15], fov: 46 }}
          dpr={[1, 1.75]}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          frameloop={reduced ? "demand" : visible ? "always" : "never"}
          className="absolute inset-0"
        >
          <ConstellationField />
        </Canvas>
      ) : (
        <LatticeBackdrop />
      )}
    </div>
  );
}
