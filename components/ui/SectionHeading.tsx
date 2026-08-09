"use client";

import { useRef } from "react";
import { gsap, SplitText, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const root = ref.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduced } = ctx.conditions as { motion: boolean; reduced: boolean };
        const heading = root.querySelector<HTMLElement>("[data-split]");
        if (!heading) return;

        if (reduced) {
          gsap.set(root.children, { opacity: 1, y: 0 });
          return;
        }

        const split = new SplitText(heading, {
          type: "lines",
          linesClass: "overflow-hidden",
        });
        const inner = new SplitText(split.lines, { type: "lines" });

        gsap.from(inner.lines, {
          yPercent: 118,
          duration: 1.05,
          stagger: 0.08,
          ease: "power4.out",
          scrollTrigger: { trigger: root, start: "top 84%" },
        });

        gsap.from(root.querySelectorAll("[data-fade]"), {
          opacity: 0,
          y: 18,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: { trigger: root, start: "top 84%" },
        });

        return () => {
          inner.revert();
          split.revert();
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}
    >
      <p
        data-fade
        className="text-brand-green mb-4 text-[11px] font-semibold tracking-[0.18em] uppercase"
      >
        {eyebrow}
      </p>
      <h2
        data-split
        className="font-display-tight text-ink-1 text-balance text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.02]"
      >
        {title}
      </h2>
      {description ? (
        <p data-fade className="text-ink-3 mt-5 text-[17px] leading-relaxed text-balance">
          {description}
        </p>
      ) : null}
    </div>
  );
}
