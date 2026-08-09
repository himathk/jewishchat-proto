"use client";

import { useRef } from "react";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { PLATFORM_STATS } from "@/lib/data/stats";

export function StatBand() {
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
        const nodes = gsap.utils.toArray<HTMLElement>("[data-count]", root);

        if (reduced) {
          nodes.forEach((node) => {
            const end = Number(node.dataset.count ?? "0");
            node.textContent = end.toLocaleString("en-US");
          });
          return;
        }

        const tweens = nodes.map((node) => {
          const end = Number(node.dataset.count ?? "0");
          const proxy = { v: 0 };
          return gsap.to(proxy, {
            v: end,
            duration: 1.7,
            ease: "power3.out",
            scrollTrigger: { trigger: root, start: "top 88%" },
            onUpdate: () => {
              node.textContent = Math.round(proxy.v).toLocaleString("en-US");
            },
          });
        });

        return () => tweens.forEach((t) => t.kill());
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="border-surface-line bg-surface-card/60 relative z-10 border-y backdrop-blur-sm"
    >
      <dl className="mx-auto grid max-w-[1400px] grid-cols-2 px-5 md:px-8 lg:grid-cols-4">
        {PLATFORM_STATS.map((stat, i) => (
          <div
            key={stat.id}
            className={`border-surface-line py-8 lg:py-10 ${i % 2 === 1 ? "border-l pl-6" : "pr-6"} ${i < 2 ? "border-b lg:border-b-0" : ""} ${i === 2 ? "lg:border-l lg:pl-6" : ""}`}
          >
            <dd className="font-display-tight text-ink-1 text-[clamp(1.9rem,3.4vw,2.9rem)] leading-none">
              <span data-count={stat.value}>{stat.value.toLocaleString("en-US")}</span>
              {stat.suffix ? <span className="text-brand-green">{stat.suffix}</span> : null}
            </dd>
            <dt className="text-ink-3 mt-2.5 text-[13px]">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
