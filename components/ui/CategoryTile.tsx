"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { CATEGORY_ICONS } from "./categoryIcons";
import { formatCompact } from "@/lib/utils/format";
import type { Category } from "@/types";

export function CategoryTile({ category }: { category: Category }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const Icon = CATEGORY_ICONS[category.icon];

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    // Magnetic pull only on pointer-precise devices with motion allowed.
    mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo(((e.clientX - (r.left + r.width / 2)) / r.width) * 14);
        yTo(((e.clientY - (r.top + r.height / 2)) / r.height) * 14);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <Link
      ref={ref}
      href="#"
      data-href={`/${category.slug}`}
      data-reveal
      className="group border-surface-line bg-surface-card hover:border-brand-green/45 relative flex flex-col justify-between overflow-hidden rounded-[22px] border p-6 transition-colors duration-500 will-change-transform"
    >
      {/* Mint wash that grows from the icon on hover */}
      <span className="bg-brand-softer pointer-events-none absolute -top-16 -left-16 size-40 scale-0 rounded-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[3.2]" />

      <div className="relative">
        <span className="bg-brand-soft text-brand-deep group-hover:bg-brand-green mb-5 inline-flex size-12 items-center justify-center rounded-[14px] transition-colors duration-500 group-hover:text-white">
          {Icon ? <Icon size={21} strokeWidth={1.7} /> : null}
        </span>
        <h3 className="font-display text-ink-1 text-[17px] leading-snug">{category.name}</h3>
        <p className="text-ink-3 mt-2 text-[13.5px] leading-relaxed">{category.description}</p>
      </div>

      <div className="relative mt-6 flex items-center justify-between">
        <span className="text-ink-4 text-[12px] font-medium">
          {formatCompact(category.groupCount)} groups
        </span>
        <ArrowUpRight
          size={17}
          className="text-ink-4 group-hover:text-brand-green -translate-x-1 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
        />
      </div>
    </Link>
  );
}
