"use client";

import Link from "next/link";
import { CornerDownLeft, SearchX } from "lucide-react";
import { useSearchContext } from "@/components/providers/SearchProvider";
import { categoryById } from "@/lib/data/categories";
import { formatCompact } from "@/lib/utils/format";

export function Suggestions() {
  const { suggestions, isSearching, focused, results } = useSearchContext();

  if (!focused || !isSearching) return null;

  return (
    <div
      role="listbox"
      className="border-surface-line bg-surface-card absolute top-[calc(100%+10px)] right-0 left-0 z-50 overflow-hidden rounded-[22px] border shadow-[0_28px_70px_-30px_color-mix(in_oklab,var(--color-ink-1)_45%,transparent)]"
    >
      {suggestions.length === 0 ? (
        <div className="text-ink-3 flex items-center gap-3 px-5 py-6 text-sm">
          <SearchX size={17} strokeWidth={1.8} className="text-ink-4" />
          No groups match that yet — try a place, a trade, or a topic.
        </div>
      ) : (
        <>
          <p className="text-ink-4 border-surface-line border-b px-5 py-2.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase">
            {results.length} matches · ranked by relevance
          </p>
          <ul>
            {suggestions.map(({ group, confidence }) => {
              const category = categoryById(group.categoryId);
              return (
                <li key={group.id}>
                  <Link
                    href="#"
                    data-href={`/${category?.slug ?? "group"}/${group.slug}`}
                    className="hover:bg-brand-softer flex items-center gap-3.5 px-5 py-3 transition-colors"
                  >
                    <span className="bg-brand-soft text-brand-deep font-display grid size-9 shrink-0 place-items-center rounded-[11px] text-[13px]">
                      {group.initials}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="text-ink-1 block truncate text-[14px] font-medium">
                        {group.name}
                      </span>
                      <span className="text-ink-4 block truncate text-[12px]">
                        {category?.name} · {group.location}
                        {group.memberCount ? ` · ${formatCompact(group.memberCount)} members` : ""}
                      </span>
                    </span>

                    <span className="flex shrink-0 items-center gap-2">
                      <span className="bg-surface-line hidden h-[3px] w-14 overflow-hidden rounded-full sm:block">
                        <span
                          className="bg-brand-green block h-full rounded-full"
                          style={{ width: `${Math.max(8, Math.round(confidence * 100))}%` }}
                        />
                      </span>
                      <span className="text-brand-deep w-8 text-right text-[11.5px] font-semibold">
                        {Math.round(confidence * 100)}%
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="text-ink-4 border-surface-line flex items-center gap-2 border-t px-5 py-2.5 text-[11.5px]">
            <CornerDownLeft size={12} strokeWidth={2} />
            Press enter to see every match
          </p>
        </>
      )}
    </div>
  );
}
