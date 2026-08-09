"use client";

import { useMemo, useState } from "react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GroupCard } from "@/components/ui/GroupCard";
import { FilterChips, type FilterOption } from "@/components/ui/FilterChips";
import { Button } from "@/components/ui/Button";
import { useReveal } from "@/lib/motion/useReveal";
import { PUBLIC_GROUPS } from "@/lib/data/groups";

// FR-AI-04: group-size filters. Location filtering is Phase 2 in the SRS.
const SIZE_FILTERS: FilterOption[] = [
  { id: "all", label: "All sizes" },
  { id: "s", label: "Under 1k" },
  { id: "m", label: "1k – 3k" },
  { id: "l", label: "3k+" },
];

function inBand(count: number | undefined, band: string): boolean {
  const n = count ?? 0;
  if (band === "s") return n < 1000;
  if (band === "m") return n >= 1000 && n < 3000;
  if (band === "l") return n >= 3000;
  return true;
}

export function TrendingGroups() {
  const [band, setBand] = useState("all");
  const gridRef = useReveal<HTMLDivElement>({ stagger: 0.05 });

  const groups = useMemo(
    () =>
      PUBLIC_GROUPS.filter((g) => inBand(g.memberCount, band))
        .sort((a, b) => b.metrics.uniqueViews - a.metrics.uniqueViews)
        .slice(0, 8),
    [band],
  );

  return (
    <section id="trending" className="bg-brand-softer/60 relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            eyebrow="Most active right now"
            title="Where the community is talking this week."
            description="Ranked by unique views and join-link clicks over the last seven days."
          />
          <Button href="/trending" variant="secondary" size="md" className="mb-1">
            <TrendingUp size={15} strokeWidth={2} />
            See the full ranking
          </Button>
        </div>

        <FilterChips
          options={SIZE_FILTERS}
          active={band}
          onChange={setBand}
          className="mt-10"
        />

        <div
          ref={gridRef}
          key={band}
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>

        {groups.length === 0 ? (
          <p className="text-ink-3 mt-8 text-sm">No groups in that size band yet.</p>
        ) : null}

        <div className="mt-12 flex justify-center">
          <Button href="/directory" size="lg">
            Browse all 3,961 groups
            <ArrowRight size={16} strokeWidth={2} />
          </Button>
        </div>
      </div>
    </section>
  );
}
