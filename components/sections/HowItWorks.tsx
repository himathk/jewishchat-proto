"use client";

import { useRef } from "react";
import { Camera, Link2, MessageSquare, ShieldCheck, Tags } from "lucide-react";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import type { LucideIcon } from "lucide-react";

type Step = { icon: LucideIcon; title: string; body: string };

const STEPS: Step[] = [
  {
    icon: Link2,
    title: "Paste the group link",
    body: "Drop in the WhatsApp invite link with a name and a short description. Duplicate links are caught before you submit — the URL is normalised first, so extra query parameters never sneak a second copy in.",
  },
  {
    icon: Tags,
    title: "Categorise it",
    body: "Pick a main category, add secondary ones, and set the location. Say whether the join link should be public or reserved for signed-in members.",
  },
  {
    icon: ShieldCheck,
    title: "Verify your number",
    body: "A code arrives on WhatsApp. Verifying proves the listing came from a real person — it is the one thing standing between the directory and spam.",
  },
  {
    icon: Camera,
    title: "Add a photo, or skip",
    body: "Upload a square image, or skip it and the listing shows a clean initials avatar. You can add the photo later from My Groups.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();

    // Pin and pan only where there is room and motion is welcome. Below the
    // 1024px breakpoint, or with reduced motion requested, the track already
    // stacks vertically via the lg:motion-reduce:* classes below — this
    // branch just makes sure no leftover pin/transform survives a resize.
    mm.add(
      {
        pan: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        stacked: "(max-width: 1023px), (prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { stacked } = ctx.conditions as { pan: boolean; stacked: boolean };

        if (stacked) {
          gsap.set(track, { clearProps: "x" });
          return;
        }

        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 120);

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.5}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:motion-safe:flex lg:motion-safe:min-h-dvh lg:motion-safe:flex-col lg:motion-safe:justify-center lg:motion-safe:py-0"
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8">
        <SectionHeading
          eyebrow="Listing a group"
          title="Four steps, about two minutes."
          description="Verified submissions publish instantly. Nothing sits in a moderation queue waiting for someone to notice it."
        />
      </div>

      <div className="mt-14 lg:mt-20">
        <div
          ref={trackRef}
          className="flex flex-col gap-4 px-5 md:px-8 lg:gap-6 lg:motion-safe:w-max lg:motion-safe:flex-row lg:motion-safe:pr-[12vw] lg:motion-safe:pl-[max(1.25rem,calc((100vw-1400px)/2+2rem))] lg:motion-reduce:flex-col"
        >
          {STEPS.map((step, i) => (
            <article
              key={step.title}
              className="border-surface-line bg-surface-card relative flex flex-col justify-between rounded-[26px] border p-8 lg:motion-safe:h-[26rem] lg:motion-safe:w-[24rem] lg:motion-safe:shrink-0"
            >
              <div>
                <span className="text-brand-green/25 font-display-tight block text-[3.5rem] leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="bg-brand-soft text-brand-deep mt-6 inline-flex size-12 items-center justify-center rounded-[15px]">
                  <step.icon size={21} strokeWidth={1.7} />
                </span>
                <h3 className="font-display text-ink-1 mt-5 text-[20px] leading-snug">
                  {step.title}
                </h3>
                <p className="text-ink-3 mt-3 text-[14px] leading-relaxed">{step.body}</p>
              </div>
            </article>
          ))}

          <article className="bg-brand-green relative flex flex-col justify-between overflow-hidden rounded-[26px] p-8 text-white lg:motion-safe:h-[26rem] lg:motion-safe:w-[24rem] lg:motion-safe:shrink-0">
            <MessageSquare
              size={140}
              strokeWidth={0.6}
              className="absolute -right-8 -bottom-8 text-white/15"
            />
            <div className="relative">
              <h3 className="font-display-tight text-[28px] leading-[1.05]">
                Your group, in front of the people looking for it.
              </h3>
              <p className="mt-4 text-[14px] leading-relaxed text-white/85">
                Each listing gets its own indexed page and a clean URL, so it turns up in search
                long after you post it.
              </p>
            </div>
            <Button href="/add-group" variant="secondary" size="lg" className="relative mt-8 w-fit">
              Add a group
            </Button>
          </article>
        </div>
      </div>
    </section>
  );
}
