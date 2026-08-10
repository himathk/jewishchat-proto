"use client";

import { useRef } from "react";
import { ArrowDown, ShieldCheck } from "lucide-react";
import { gsap, SplitText, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { Constellation } from "./Constellation";
import { SearchField } from "./SearchField";
import { Suggestions } from "./Suggestions";
import { QueryChips } from "./QueryChips";
import { ChatWindow } from "./ChatWindow";
import { HERO_SECTION_ID, HERO_SLOT_ID } from "./SearchDock";

export function Hero() {
  const ref = useRef<HTMLElement>(null);

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
        const items = root.querySelectorAll("[data-hero-item]");
        const heading = root.querySelector<HTMLElement>("[data-hero-title]");

        if (reduced || !heading) {
          gsap.set(items, { opacity: 1, y: 0 });
          return;
        }

        const outer = new SplitText(heading, { type: "lines", linesClass: "overflow-hidden" });
        const inner = new SplitText(outer.lines, { type: "lines" });

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.from(inner.lines, { yPercent: 120, duration: 1.15, stagger: 0.09 })
          .from(items, { opacity: 0, y: 26, duration: 0.9, stagger: 0.11 }, "-=0.75");

        return () => {
          tl.kill();
          inner.revert();
          outer.revert();
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={ref}
      id={HERO_SECTION_ID}
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden pt-[104px] pb-16 lg:pt-[132px]"
    >
      <Constellation />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 md:px-8">
        <div className="max-w-4xl">
          <span
            data-hero-item
            className="border-brand-green/25 text-brand-deep mb-7 inline-flex items-center gap-2 rounded-full border bg-white/70 px-3.5 py-1.5 text-[12px] font-medium backdrop-blur-sm"
          >
            <ShieldCheck size={13} strokeWidth={2} />
            Every listing submitted by a verified member
          </span>

          <h1
            data-hero-title
            className="font-display-tight text-ink-1 text-balance text-[clamp(2.6rem,7vw,5.75rem)] leading-[0.94]"
          >
            Find the group your community is{" "}
            <span className="text-brand-green">already in</span>.
          </h1>

          <p
            data-hero-item
            className="text-ink-2 mt-7 max-w-2xl text-[clamp(1rem,1.5vw,1.2rem)] leading-relaxed"
          >
            A directory of WhatsApp groups for Jewish business, learning, shuls, chesed and
            everyday community life. Ask the way you would ask a friend — every result comes
            back ranked by how well it actually fits.
          </p>

          {/* Desktop: reserved space the fixed SearchDock docks into. */}
          <div
            id={HERO_SLOT_ID}
            aria-hidden="true"
            data-hero-item
            className="mt-10 hidden h-[68px] w-full max-w-[760px] lg:block"
          />

          {/* Mobile and tablet: the field lives inline, no morph. */}
          <div data-hero-item className="relative mt-9 h-[60px] w-full lg:hidden">
            <SearchField />
            <Suggestions />
          </div>

          <div data-hero-item className="mt-6">
            <QueryChips />
          </div>

          <p data-hero-item className="text-ink-4 mt-8 text-[12.5px]">
            Free to browse · No account needed to search · 3,961 groups across 46 cities
          </p>
        </div>
      </div>

      {/* Positioned against the section's own box (full viewport height),
          not the text column above — that column is vertically centered by
          the section's `justify-center` and its height varies with content,
          which would make a nested absolute position drift. Anchored near
          the top so a full-height window never reaches into the cookie
          banner's bottom-right region on first load. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-full lg:flex">
        <div className="mx-auto flex h-full w-full max-w-[1400px] items-start justify-end px-5 pt-[136px] md:px-8">
          <div className="pointer-events-auto h-[420px] w-[360px]">
            <ChatWindow />
          </div>
        </div>
      </div>

      <a
        href="#categories"
        aria-label="Scroll to categories"
        className="text-ink-4 hover:text-brand-green absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] tracking-[0.16em] uppercase transition-colors lg:flex"
      >
        Browse
        <ArrowDown size={14} strokeWidth={1.8} className="animate-bounce" />
      </a>
    </section>
  );
}
