"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { gsap, registerGsap } from "@/lib/motion/gsap";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "jc-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Live-updated by the gsap.matchMedia() context below so the click handler
  // never needs its own bare `window.matchMedia(...).matches` check.
  const reducedRef = useRef(false);

  // Read storage after mount only — reading during render would desync SSR.
  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY)) return;
    const t = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    registerGsap();
    const el = ref.current;

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduced } = ctx.conditions as { motion: boolean; reduced: boolean };
        reducedRef.current = reduced;
        if (!visible || !el) return;

        if (reduced) {
          gsap.set(el, { opacity: 1, y: 0 });
          return;
        }

        const tween = gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" },
        );
        return () => {
          tween.kill();
        };
      },
    );

    return () => mm.revert();
  }, [visible]);

  const decide = (choice: "all" | "essential") => {
    window.localStorage.setItem(STORAGE_KEY, choice);
    const el = ref.current;
    if (!el || reducedRef.current) {
      setVisible(false);
      return;
    }
    gsap.to(el, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => setVisible(false),
    });
  };

  if (!visible) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="border-surface-line bg-surface-card fixed right-4 bottom-4 left-4 z-[60] rounded-[22px] border p-5 shadow-[0_28px_70px_-28px_color-mix(in_oklab,var(--color-ink-1)_50%,transparent)] sm:right-6 sm:bottom-6 sm:left-auto sm:max-w-[26rem]"
    >
      <span className="bg-brand-soft text-brand-deep mb-4 inline-flex size-10 items-center justify-center rounded-[12px]">
        <Cookie size={19} strokeWidth={1.8} />
      </span>

      <h2 className="font-display text-ink-1 text-[16px]">Cookies on JewishChat</h2>
      <p className="text-ink-3 mt-2 text-[13px] leading-relaxed">
        We use essential cookies to keep the site working, and optional ones to understand which
        groups people find useful. Nothing optional is set until you say yes.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => decide("all")}>
          Accept all
        </Button>
        <Button variant="secondary" size="sm" onClick={() => decide("essential")}>
          Essential only
        </Button>
      </div>

      <Link
        href="#"
        data-href="/cookies"
        className="text-ink-4 hover:text-brand-deep mt-4 inline-block text-[12px] underline underline-offset-2 transition-colors"
      >
        Read the cookie policy
      </Link>
    </div>
  );
}
