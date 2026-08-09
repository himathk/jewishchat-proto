"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { SearchField } from "./SearchField";
import { Suggestions } from "./Suggestions";

export const HERO_SLOT_ID = "search-slot-hero";
export const HEADER_SLOT_ID = "search-slot-header";
export const HERO_SECTION_ID = "hero";

export function SearchDock() {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const dock = ref.current;
    if (!dock) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 1024px)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { isDesktop, reduced } = ctx.conditions as { isDesktop: boolean; reduced: boolean };
        if (!isDesktop) return;

        const heroSlot = document.getElementById(HERO_SLOT_ID);
        const headerSlot = document.getElementById(HEADER_SLOT_ID);
        const hero = document.getElementById(HERO_SECTION_ID);
        if (!heroSlot || !headerSlot || !hero) return;

        // Interpolate the fixed dock between the two slots' live viewport rects.
        // Measuring both every frame means resize needs no cached geometry.
        const apply = (p: number) => {
          const a = heroSlot.getBoundingClientRect();
          const b = headerSlot.getBoundingClientRect();
          const lift = 1 - p;
          gsap.set(dock, {
            left: a.left + (b.left - a.left) * p,
            top: a.top + (b.top - a.top) * p,
            width: a.width + (b.width - a.width) * p,
            height: a.height + (b.height - a.height) * p,
            borderRadius: 9999,
            // Big drop shadow in the hero, none once it sits in the header bar.
            boxShadow: `0 ${20 * lift}px ${60 * lift}px -30px color-mix(in oklab, var(--color-ink-1) ${45 * lift}%, transparent)`,
          });
          dock.style.setProperty("--dock-progress", p.toFixed(4));
        };

        if (reduced) {
          // No scrubbed interpolation for reduced-motion: the dock still ends
          // up in the right slot for the current scroll position, it just
          // snaps there instead of resizing and moving continuously as the
          // page scrolls. Both rects are still measured live, so it self-
          // corrects on resize the same as the full-motion branch.
          const snap = (self: ScrollTrigger) => apply(self.progress < 1 ? 0 : 1);

          const st = ScrollTrigger.create({
            trigger: hero,
            start: "top top",
            end: "bottom top+=120",
            onUpdate: snap,
            onRefresh: snap,
          });

          apply(st.progress < 1 ? 0 : 1);

          return () => st.kill();
        }

        const st = ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom top+=120",
          scrub: true,
          onUpdate: (self) => apply(self.progress),
          onRefresh: (self) => apply(self.progress),
        });

        apply(0);

        return () => st.kill();
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-auto fixed z-50 hidden lg:block"
      style={{ left: 0, top: 0, width: 0, height: 0 }}
    >
      <div className="relative h-full w-full">
        <SearchField />
        <Suggestions />
      </div>
    </div>
  );
}
