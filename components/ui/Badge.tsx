import { cn } from "@/lib/utils/cn";

type Tone = "brand" | "neutral" | "lock";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand-deep",
  neutral: "bg-surface-bg text-ink-3 border border-surface-line",
  lock: "bg-state-bg-warning text-state-warning",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-tight whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
