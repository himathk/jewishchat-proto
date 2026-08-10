"use client";

import { useMemo, useRef } from "react";
import { GroupCard } from "@/components/ui/GroupCard";
import { useSearchContext } from "@/components/providers/SearchProvider";
import { PUBLIC_GROUPS } from "@/lib/data/groups";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import type { Group } from "@/types";

type ClusterCard = { group: Group; confidence?: number };

/**
 * Curated so the idle state shows category + city variety on first paint —
 * Torah, chesed, and marketplace, across Jerusalem, Baltimore, and Monsey.
 * Hard-coded rather than picked at random so the empty state is intentional.
 */
const DEFAULT_IDS = ["g-03", "g-11", "g-17"];

const DEFAULT_TRIO: ClusterCard[] = DEFAULT_IDS.map((id) =>
  PUBLIC_GROUPS.find((g) => g.id === id),
).filter((g): g is Group => Boolean(g)).map((group) => ({ group }));

/** Floating layout per slot: index 0/1/2 top-to-bottom on the right edge. */
const SLOTS = [
  { top: "0%", right: "12%", rotate: -4, width: 248 },
  { top: "24%", right: "-4%", rotate: 3, width: 262 },
  { top: "40%", right: "14%", rotate: -2.5, width: 244 },
] as const;

export function HeroGroupCluster() {
  const { results, isSearching } = useSearchContext();
  const rootRef = useRef<HTMLDivElement>(null);

  const cards = useMemo<ClusterCard[]>(() => {
    if (!isSearching) return DEFAULT_TRIO;
    return results.slice(0, 3).map((r) => ({ group: r.group, confidence: r.confidence }));
  }, [isSearching, results]);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduced } = ctx.conditions as { motion: boolean; reduced: boolean };
        const slots = root.querySelectorAll<HTMLElement>("[data-cluster-slot]");

        if (reduced) {
          gsap.set(slots, { opacity: 1, y: 0 });
          return;
        }

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(slots, { opacity: 0, y: 34, duration: 1, stagger: 0.14 }, 0.3);

        const floats = Array.from(slots).map((slot, i) =>
          gsap.to(slot, {
            y: i % 2 === 0 ? -14 : 12,
            duration: 3.4 + i * 0.5,
            delay: 0.3 + i * 0.14 + 1,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          }),
        );

        return () => {
          tl.kill();
          floats.forEach((f) => f.kill());
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[300px] lg:block xl:w-[340px]"
    >
      {SLOTS.map((slot, i) => {
        const card = cards[i];
        if (!card) return null;
        return (
          <div
            key={i}
            data-cluster-slot
            className="pointer-events-auto absolute"
            style={{
              top: slot.top,
              right: slot.right,
              width: slot.width,
              transform: `rotate(${slot.rotate}deg)`,
            }}
          >
            <GroupCard
              group={card.group}
              confidence={card.confidence}
              className="bg-white/78 border-white/60 shadow-[0_22px_50px_-26px_color-mix(in_oklab,var(--color-ink-1)_40%,transparent)] backdrop-blur-md hover:rotate-0"
            />
          </div>
        );
      })}
    </div>
  );
}
