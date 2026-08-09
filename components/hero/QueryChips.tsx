"use client";

import { ArrowUpRight } from "lucide-react";
import { useSearchContext } from "@/components/providers/SearchProvider";

const EXAMPLES = [
  "Roofing contractors in Lakewood with financing",
  "Business forums in Florida with over 100 members",
  "Daf Yomi shiurim in Jerusalem",
  "Gemachs in Lakewood",
  "Kosher restaurants in Miami",
];

export function QueryChips() {
  const { setQuery } = useSearchContext();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-ink-4 mr-1 text-[12.5px]">Try</span>
      {EXAMPLES.map((example) => (
        <button
          key={example}
          type="button"
          onClick={() => setQuery(example)}
          className="group border-surface-line-strong text-ink-2 hover:border-brand-green/55 hover:text-brand-deep hover:bg-brand-softer inline-flex items-center gap-1.5 rounded-full border bg-white/60 px-3.5 py-1.5 text-[12.5px] backdrop-blur-sm transition-all duration-300"
        >
          {example}
          <ArrowUpRight
            size={12}
            strokeWidth={2}
            className="text-ink-4 group-hover:text-brand-green transition-colors"
          />
        </button>
      ))}
    </div>
  );
}
