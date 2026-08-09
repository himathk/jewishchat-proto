"use client";

import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LatticeBackdrop } from "@/components/ui/LatticeBackdrop";
import { useReveal } from "@/lib/motion/useReveal";

export function AddGroupBand() {
  const ref = useReveal<HTMLDivElement>({ stagger: 0.09, y: 30 });

  return (
    <section className="px-5 py-24 md:px-8 lg:py-32">
      <div className="bg-brand-green relative mx-auto max-w-[1400px] overflow-hidden rounded-[32px] px-8 py-16 text-white md:px-14 lg:py-24">
        <LatticeBackdrop className="text-white/50 opacity-45" />
        <div className="absolute -right-24 -bottom-32 size-[34rem] rounded-full bg-white/[0.07] blur-2xl" />

        <div ref={ref} className="relative max-w-3xl">
          <p
            data-reveal
            className="mb-5 text-[11px] font-semibold tracking-[0.18em] text-white/70 uppercase"
          >
            Run a group?
          </p>
          <h2
            data-reveal
            className="font-display-tight text-balance text-[clamp(2.1rem,5vw,4rem)] leading-[0.98]"
          >
            List it once. Let the right people find it for years.
          </h2>
          <p data-reveal className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/80">
            Your listing gets its own indexed page, a clean permanent URL, and a place in every
            relevant search. Keep the join link public, or reserve it for signed-in members —
            your call.
          </p>

          <div data-reveal className="mt-10 flex flex-wrap gap-3">
            <Button href="/add-group" variant="secondary" size="lg">
              <Plus size={17} strokeWidth={2.2} />
              Add a group
            </Button>
            <Button
              href="/register"
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/12 hover:text-white"
            >
              Create an account
              <ArrowRight size={16} strokeWidth={2} />
            </Button>
          </div>

          <p data-reveal className="mt-7 text-[12.5px] text-white/60">
            You will verify an email address and a WhatsApp number before your first listing
            publishes.
          </p>
        </div>
      </div>
    </section>
  );
}
