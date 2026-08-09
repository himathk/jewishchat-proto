import Link from "next/link";
import { ArrowUpRight, Lock, MapPin, Users } from "lucide-react";
import { Badge } from "./Badge";
import { categoryById } from "@/lib/data/categories";
import { formatCompact, formatRelativeDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Group } from "@/types";

export function GroupCard({
  group,
  confidence,
  showDate = false,
  className,
}: {
  group: Group;
  confidence?: number;
  showDate?: boolean;
  className?: string;
}) {
  const category = categoryById(group.categoryId);

  return (
    <Link
      href="#"
      data-href={`/${category?.slug ?? "group"}/${group.slug}`}
      data-reveal
      className={cn(
        "group border-surface-line bg-surface-card hover:border-brand-green/45 relative flex flex-col rounded-[22px] border p-5 transition-all duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(18,33,30,0.35)]",
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        {/* FR-GL-02 step 4: initials placeholder when no photo was uploaded */}
        <span className="bg-brand-soft text-brand-deep font-display grid size-11 shrink-0 place-items-center rounded-[13px] text-[15px] tracking-tight">
          {group.initials}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-ink-1 truncate text-[15.5px] leading-snug">
            {group.name}
          </h3>
          <p className="text-ink-4 mt-1 flex items-center gap-1 text-[12px]">
            <MapPin size={12} strokeWidth={1.8} />
            {group.location}
          </p>
        </div>

        <ArrowUpRight
          size={16}
          className="text-ink-4 group-hover:text-brand-green shrink-0 -translate-x-1 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
        />
      </div>

      <p className="text-ink-3 mt-3.5 line-clamp-2 text-[13.5px] leading-relaxed">
        {group.shortDescription}
      </p>

      {typeof confidence === "number" ? (
        <div className="mt-4">
          <div className="text-ink-4 mb-1.5 flex items-center justify-between text-[10.5px] font-medium tracking-wide uppercase">
            <span>Relevance</span>
            <span className="text-brand-deep">{Math.round(confidence * 100)}%</span>
          </div>
          <div className="bg-surface-line h-[3px] overflow-hidden rounded-full">
            <div
              className="bg-brand-green h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out-expo)]"
              style={{ width: `${Math.max(6, Math.round(confidence * 100))}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {category ? <Badge tone="brand">{category.name}</Badge> : null}
        {group.memberCount ? (
          <Badge tone="neutral">
            <Users size={11} strokeWidth={1.9} />
            {formatCompact(group.memberCount)}
          </Badge>
        ) : null}
        {/* FR-GV-04: owner restricted the join link to signed-in members */}
        {group.loginRestricted ? (
          <Badge tone="lock">
            <Lock size={10} strokeWidth={2.1} />
            Members only
          </Badge>
        ) : null}
        {showDate ? (
          <span className="text-ink-4 ml-auto text-[11.5px]">
            {formatRelativeDate(group.createdAt)}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
