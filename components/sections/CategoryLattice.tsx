"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryTile } from "@/components/ui/CategoryTile";
import { Button } from "@/components/ui/Button";
import { useReveal } from "@/lib/motion/useReveal";
import { CATEGORIES } from "@/lib/data/categories";
import { PUBLIC_GROUPS } from "@/lib/data/groups";

const LOCATIONS = [...new Set(PUBLIC_GROUPS.map((g) => g.location))];

export function CategoryLattice() {
  const gridRef = useReveal<HTMLDivElement>({ stagger: 0.045, y: 34 });
  const tickerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const track = tickerRef.current;
    if (!track) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // The row is rendered twice; scroll one full copy then reset.
      const tween = gsap.to(track, {
        xPercent: -50,
        duration: 38,
        ease: "none",
        repeat: -1,
      });
      return () => tween.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="categories" className="relative py-24 lg:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            eyebrow="Browse the directory"
            title="Twelve corners of community life."
            description="Every group is filed under a main category and can carry additional ones, so a contractor's group turns up under both trades and real estate."
          />
          <Button href="/categories" variant="secondary" size="md" className="mb-1">
            All categories
            <ArrowRight size={15} strokeWidth={2} />
          </Button>
        </div>

        <div
          ref={gridRef}
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:[&>*:nth-child(4n+2)]:translate-y-8 lg:[&>*:nth-child(4n+4)]:translate-y-8"
        >
          {CATEGORIES.map((category) => (
            <CategoryTile key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* Location ticker */}
      <div className="mt-24 lg:mt-36">
        <p className="text-ink-4 mx-auto mb-6 max-w-[1400px] px-5 text-[10.5px] font-semibold tracking-[0.18em] uppercase md:px-8">
          Active in
        </p>
        <div className="relative overflow-hidden">
          <div className="from-surface-bg pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r to-transparent" />
          <div className="from-surface-bg pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l to-transparent" />
          <div ref={tickerRef} className="flex w-max gap-3">
            {[...LOCATIONS, ...LOCATIONS].map((location, i) => (
              <span
                key={`${location}-${i}`}
                className="border-surface-line text-ink-2 font-display shrink-0 rounded-full border bg-white px-6 py-3 text-[15px] whitespace-nowrap"
              >
                {location}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
