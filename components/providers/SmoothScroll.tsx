"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/motion/gsap";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerGsap();

    // Trigger positions measured before Bricolage and Geist load are wrong,
    // because the swapped-in metrics change every heading's height.
    void document.fonts.ready.then(() => ScrollTrigger.refresh());

    const mm = gsap.matchMedia();

    // Registered through matchMedia rather than a bare `if` so that toggling
    // the OS setting mid-session creates or destroys Lenis live — the same
    // way useReveal reacts. A one-shot `.matches` check in a []-deps effect
    // would strand smooth scrolling on until the next reload.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);

      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      return () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
      };
    });

    return () => mm.revert();
  }, []);

  return <>{children}</>;
}
