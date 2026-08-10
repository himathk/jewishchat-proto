"use client";

import { ArrowUp, Sparkles, X } from "lucide-react";
import { useSearchContext } from "@/components/providers/SearchProvider";

export function SearchField() {
  const { query, setQuery, setFocused } = useSearchContext();

  return (
    <div className="border-surface-line bg-surface-card relative flex h-full w-full flex-col overflow-hidden rounded-[26px] border shadow-[0_24px_60px_-38px_color-mix(in_oklab,var(--color-ink-1)_38%,transparent)]">
      {/* Query row. `flex-1` means that once the dock collapses the hint row
          below, this row owns the full height and stays vertically centred —
          no separate docked layout needed. */}
      <div className="flex min-h-0 flex-1 items-center gap-3 px-5">
        <Sparkles size={19} strokeWidth={1.9} className="text-brand-green shrink-0" />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          // Delay the blur so a click on a suggestion lands before the list unmounts.
          onBlur={() => window.setTimeout(() => setFocused(false), 140)}
          placeholder="Roofing contractors in Lakewood who offer financing"
          aria-label="Search WhatsApp groups"
          className="text-ink-1 placeholder:text-ink-3 min-w-0 flex-1 bg-transparent outline-none"
          style={{ fontSize: "calc(16px - 2.5px * var(--dock-progress, 0))" }}
        />

        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="text-ink-4 hover:text-ink-2 shrink-0 transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>
        ) : null}
      </div>

      {/* Hint row — collapses to zero height as the field docks into the
          header, where there is only room for the query itself. */}
      <div
        className="border-surface-line flex shrink-0 items-center justify-between overflow-hidden border-t pr-3 pl-5"
        style={{
          height: "calc(58px * (1 - var(--dock-progress, 0)))",
          opacity: "calc(1 - var(--dock-progress, 0) * 2.4)",
        }}
      >
        <span className="text-ink-4 text-[11.5px] tracking-[0.18em] uppercase">
          Ask in plain english
        </span>

        <span className="bg-brand-green grid size-10 shrink-0 place-items-center rounded-full text-white">
          <ArrowUp size={17} strokeWidth={2.2} />
        </span>
      </div>
    </div>
  );
}
