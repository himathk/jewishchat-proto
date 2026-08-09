import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-green text-white shadow-[0_1px_2px_color-mix(in_oklab,var(--color-ink-1)_10%,transparent),0_8px_24px_-8px_color-mix(in_oklab,var(--color-brand-green)_55%,transparent)] hover:bg-brand-deep",
  secondary:
    "bg-surface-card text-ink-1 border border-surface-line-strong hover:border-brand-green/50 hover:text-brand-deep",
  ghost: "text-ink-2 hover:text-brand-deep hover:bg-brand-soft",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-[52px] px-7 text-[15px]",
};

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium",
    "transition-all duration-300 ease-[var(--ease-out-expo)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
    "active:scale-[0.97]",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  // Scope note: no routes exist beyond "/", so links are inert by design.
  if (href) {
    return (
      <Link href="#" data-href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
