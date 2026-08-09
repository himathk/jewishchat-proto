"use client";

import { Search, Sparkles, X } from "lucide-react";
import { useSearchContext } from "@/components/providers/SearchProvider";

export function SearchField() {
  const { query, setQuery, setFocused } = useSearchContext();

  return (
    <div className="border-surface-line bg-surface-card flex h-full w-full items-center gap-3 rounded-full border px-5">
      <Search size={19} strokeWidth={1.9} className="text-brand-green shrink-0" />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        // Delay the blur so a click on a suggestion lands before the list unmounts.
        onBlur={() => window.setTimeout(() => setFocused(false), 140)}
        placeholder="Ask for what you need — “roofing contractors in Lakewood with financing”"
        aria-label="Search WhatsApp groups"
        className="text-ink-1 placeholder:text-ink-4 min-w-0 flex-1 bg-transparent outline-none"
        style={{ fontSize: "calc(16.5px - 3px * var(--dock-progress, 0))" }}
      />

      {query ? (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="text-ink-4 hover:text-ink-2 shrink-0 transition-colors"
        >
          <X size={17} strokeWidth={2} />
        </button>
      ) : null}

      {/* Fades out as the field docks — the header has its own CTA. */}
      <span
        className="bg-brand-green hidden h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-white sm:inline-flex"
        style={{ opacity: "calc(1 - var(--dock-progress, 0) * 2.2)" }}
      >
        <Sparkles size={13} strokeWidth={2} />
        Search
      </span>
    </div>
  );
}
