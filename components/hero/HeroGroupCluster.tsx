"use client";

import { useMemo, useRef } from "react";
import { GroupCard } from "@/components/ui/GroupCard";
import { useSearchContext } from "@/components/providers/SearchProvider";
import { PUBLIC_GROUPS } from "@/lib/data/groups";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import type { Group } from "@/types";

type ClusterCard = { group: Group };

/**
 * Confidence is deliberately never rendered here. GroupCard's relevance bar
 * adds real height, and this cluster's vertical rhythm is sized for a fixed
 * card height so the two slots can never overlap regardless of state — a
 * card that's taller when searching than when idle would break that
 * guarantee. Relevance is already visible in the Suggestions dropdown;
 * here, which two groups are shown *is* the relevance signal.
 */

/**
 * Curated so the idle state shows category + city variety on first paint —
 * Torah learning in Jerusalem and a marketplace in Monsey. Two, not three:
 * a third card has nowhere to sit in this column without either overlapping
 * one of these two or drifting into the cookie-consent banner's corner.
 * Both names are short enough to render in full at this card width — long
 * names ("Bikur Cholim Volunteers") were deliberately swapped out rather
 * than shipped truncated.
 */
const DEFAULT_IDS = ["g-03", "g-17"];

const DEFAULT_DUO: ClusterCard[] = DEFAULT_IDS.map((id) =>
  PUBLIC_GROUPS.find((g) => g.id === id),
).filter((g): g is Group => Boolean(g)).map((group) => ({ group }));

/**
 * A loose staggered column, not a fan: each slot's vertical span is clear of
 * the next, so nothing is ever sliced by the card below it. Horizontal
 * offset and rotation are both small enough to read as "placed by hand"
 * rather than "randomly scattered." `right` is measured from the hero's own
 * padded edge, which already sits ~20px inside the 1440px viewport, so a
 * 56px+ offset leaves real, comfortable margin to the window edge.
 */
const SLOTS = [
  { top: "0%", right: 56, rotate: -0.6, width: 312 },
  { top: "34%", right: 88, rotate: 0.5, width: 312 },
] as const;

export function HeroGroupCluster() {
  const { results, isSearching } = useSearchContext();
  const rootRef = useRef<HTMLDivElement>(null);

  const cards = useMemo<ClusterCard[]>(() => {
    if (!isSearching) return DEFAULT_DUO;
    return results.slice(0, SLOTS.length).map((r) => ({ group: r.group }));
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
            y: i % 2 === 0 ? -12 : 10,
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
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[400px] lg:block"
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
              className="bg-white/80 border-white/60 shadow-[0_16px_34px_-22px_color-mix(in_oklab,var(--color-ink-1)_38%,transparent)] backdrop-blur-md hover:rotate-0"
            />
          </div>
        );
      })}
    </div>
  );
}
