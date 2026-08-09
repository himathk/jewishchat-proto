"use client";

import { cn } from "@/lib/utils/cn";

export type FilterOption = { id: string; label: string };

export function FilterChips({
  options,
  active,
  onChange,
  className,
}: {
  options: FilterOption[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={active === o.id}
          className={cn(
            "h-9 rounded-full px-4 text-[13px] font-medium transition-all duration-300",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
            active === o.id
              ? "bg-ink-1 text-white"
              : "border-surface-line-strong text-ink-2 hover:border-brand-green/50 hover:text-brand-deep border bg-transparent",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
