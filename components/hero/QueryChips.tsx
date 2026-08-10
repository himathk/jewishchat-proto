"use client";

import { useSearchContext } from "@/components/providers/SearchProvider";

const EXAMPLES = [
  "Roofing contractors in Lakewood who offer financing",
  "Contractors in Monsey for small repairs",
  "Florida WhatsApp groups for selling cars with 200+ members",
];

export function QueryChips() {
  const { query, setQuery } = useSearchContext();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-brand-green mr-1 text-[11px] font-semibold tracking-[0.18em] uppercase">
        Try
      </span>

      {EXAMPLES.map((example) => {
        const active = query === example;
        return (
          <button
            key={example}
            type="button"
            onClick={() => setQuery(example)}
            aria-pressed={active}
            className={
              active
                ? "border-ink-1 text-ink-1 inline-flex items-center rounded-full border-2 bg-white px-3.5 py-1.5 text-[12px] transition-all duration-300"
                : "border-surface-line-strong text-ink-2 hover:border-ink-1/40 hover:text-ink-1 inline-flex items-center rounded-full border bg-white/70 px-3.5 py-1.5 text-[12px] backdrop-blur-sm transition-all duration-300"
            }
          >
            {example}
          </button>
        );
      })}
    </div>
  );
}
