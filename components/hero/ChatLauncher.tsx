"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { ChatWindow } from "./ChatWindow";

const PANEL_ID = "hero-chat-panel";

/**
 * Below `lg` the hero has no room for the chat window, so it collapses to a
 * messenger-style bubble that opens it. Desktop renders the window inline in
 * the hero instead — this whole component is `lg:hidden`.
 */
export function ChatLauncher() {
  const [open, setOpen] = useState(false);
  // The window mounts on first open and stays mounted, so the conversation
  // survives closing and reopening.
  const [mounted, setMounted] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // One paused timeline built on mount, then played/reversed on toggle.
  // Creating a fresh tween per state change raced its own cleanup and left
  // the panel stuck invisible. GSAP owns opacity/transform here outright —
  // they must not also be React inline styles, or React re-applies them
  // mid-tween and clobbers the animation.
  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const panel = panelRef.current;
    if (!panel) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduced } = ctx.conditions as { motion: boolean; reduced: boolean };

        const tl = gsap.timeline({ paused: true }).fromTo(
          panel,
          { opacity: 0, y: 18, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            // Reduced motion still resolves to the right end state, it just
            // gets there instantly instead of sliding and scaling.
            duration: reduced ? 0 : 0.42,
            ease: "power3.out",
          },
        );

        tl.pause(0);
        tlRef.current = tl;

        return () => {
          tl.kill();
          tlRef.current = null;
        };
      },
    );

    return () => mm.revert();
  }, []);

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (open) tl.play();
    else tl.reverse();
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = () => {
    if (!mounted) setMounted(true);
    setOpen((v) => !v);
  };

  return (
    <div className="lg:hidden">
      <div
        ref={panelRef}
        id={PANEL_ID}
        aria-hidden={!open}
        className={
          open
            ? "fixed right-4 bottom-[88px] left-4 z-40 h-[min(64vh,520px)] origin-bottom-right"
            : "pointer-events-none fixed right-4 bottom-[88px] left-4 z-40 h-[min(64vh,520px)] origin-bottom-right"
        }
      >
        {mounted ? <ChatWindow /> : null}
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label={open ? "Close the chat" : "Ask JewishChat"}
        className="bg-brand-green hover:bg-brand-deep fixed right-4 bottom-5 z-50 grid size-14 place-items-center rounded-full text-white shadow-[0_16px_36px_-14px_color-mix(in_oklab,var(--color-brand-green)_70%,transparent)] transition-colors"
      >
        {open ? <X size={22} strokeWidth={2.1} /> : <MessageCircle size={22} strokeWidth={2} />}
      </button>
    </div>
  );
}
