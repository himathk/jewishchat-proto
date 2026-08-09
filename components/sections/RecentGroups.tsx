"use client";

import { Clock } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GroupCard } from "@/components/ui/GroupCard";
import { useReveal } from "@/lib/motion/useReveal";
import { PUBLIC_GROUPS } from "@/lib/data/groups";

const RECENT = [...PUBLIC_GROUPS]
  .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  .slice(0, 4);

export function RecentGroups() {
  const gridRef = useReveal<HTMLDivElement>({ stagger: 0.06 });

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <SectionHeading
          eyebrow="Just listed"
          title="Fresh from the community."
          description="Listings publish the moment a verified member submits them — no queue, no waiting."
        />

        <div ref={gridRef} className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RECENT.map((group) => (
            <GroupCard key={group.id} group={group} showDate />
          ))}
        </div>

        <p className="text-ink-4 mt-8 flex items-center gap-2 text-[12.5px]">
          <Clock size={13} strokeWidth={1.8} />
          Suspended listings are removed from the directory and from search results immediately.
        </p>
      </div>
    </section>
  );
}
