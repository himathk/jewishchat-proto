"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu, Plus, Search, X } from "lucide-react";
import { gsap, ScrollTrigger, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { HEADER_SLOT_ID, HERO_SECTION_ID } from "@/components/hero/SearchDock";
import { CATEGORIES } from "@/lib/data/categories";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduced } = ctx.conditions as { motion: boolean; reduced: boolean };

        // The backdrop-blur/border fade is a 500ms CSS transition driven by the
        // is-stuck class below; skip it for reduced-motion so the header still
        // reflects the right state for the scroll position, it just doesn't
        // animate into it.
        el.style.transitionDuration = reduced ? "0ms" : "";

        // Active from 40px of scroll to the bottom of the document.
        const st = ScrollTrigger.create({
          trigger: `#${HERO_SECTION_ID}`,
          start: "top top-=40",
          end: "max",
          onToggle: (self) => el.classList.toggle("is-stuck", self.isActive),
        });

        return () => {
          st.kill();
          el.style.transitionDuration = "";
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <header
      ref={ref}
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-[72px] transition-all duration-500 lg:h-[78px]",
        "[&.is-stuck]:bg-surface-bg/80 [&.is-stuck]:border-surface-line [&.is-stuck]:border-b [&.is-stuck]:backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-6 px-5 md:px-8">
        <Link href="#" data-href="/" className="flex shrink-0 items-center gap-2.5">
          <Logo />
          <span className="font-display text-ink-1 text-[19px] tracking-tight">JewishChat</span>
        </Link>

        {/* Docking target for the desktop search bar — reserves space only. */}
        <div
          id={HEADER_SLOT_ID}
          aria-hidden="true"
          className="mx-auto hidden h-11 w-full max-w-[440px] lg:block"
        />

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <Link
            href="#categories"
            className="text-ink-2 hover:text-brand-deep hover:bg-brand-soft rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors"
          >
            Categories
          </Link>
          <Link
            href="#trending"
            className="text-ink-2 hover:text-brand-deep hover:bg-brand-soft rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors"
          >
            Trending
          </Link>
          <Link
            href="#"
            data-href="/login"
            className="text-ink-2 hover:text-brand-deep hover:bg-brand-soft rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors"
          >
            Log in
          </Link>
          {/* FR-GL-01: Add Group is prominent for guests and signed-in users alike */}
          <Button href="/add-group" size="sm" className="ml-2">
            <Plus size={15} strokeWidth={2.3} />
            Add a group
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <a
            href={`#${HERO_SECTION_ID}`}
            aria-label="Search groups"
            className="border-surface-line-strong text-ink-2 grid size-10 place-items-center rounded-full border"
          >
            <Search size={16} strokeWidth={1.9} />
          </a>
          <Button href="/add-group" size="sm" className="px-3.5">
            <Plus size={15} strokeWidth={2.3} />
            Add
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="border-surface-line-strong text-ink-2 grid size-10 place-items-center rounded-full border"
          >
            {open ? <X size={16} strokeWidth={2} /> : <Menu size={16} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-surface-line bg-surface-bg/95 max-h-[70dvh] overflow-y-auto border-y px-5 py-5 backdrop-blur-xl lg:hidden">
          <p className="text-ink-4 mb-3 text-[10.5px] font-semibold tracking-[0.16em] uppercase">
            Categories
          </p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  href="#"
                  data-href={`/${c.slug}`}
                  className="text-ink-2 block py-2 text-[14px]"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-surface-line mt-4 flex gap-2 border-t pt-4">
            <Button href="/login" variant="secondary" size="sm" className="flex-1">
              Log in
            </Button>
            <Button href="/register" size="sm" className="flex-1">
              Create account
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
