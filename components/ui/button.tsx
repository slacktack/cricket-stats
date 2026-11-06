import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "sheen border border-slab bg-slab text-white hover:bg-bg hover:text-ink",
  secondary: "border border-line bg-surface text-ink hover:border-slab hover:text-accent",
  ghost: "border border-transparent text-muted hover:border-line hover:text-ink",
  outline: "border border-line-strong bg-transparent text-ink hover:border-slab hover:text-accent",
};

const SIZES = {
  sm: "h-8 gap-1.5 px-3 text-[11px] uppercase tracking-[0.08em]",
  md: "h-9 gap-2 px-4 text-[11px] uppercase tracking-[0.08em]",
  lg: "h-11 gap-2 px-5 text-[12px] uppercase tracking-[0.08em]",
  icon: "h-8 w-8 p-0",
};

export function buttonClass({
  variant = "secondary",
  size = "md",
  className,
}: {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
} = {}) {
  return cn(
    "nudge inline-flex shrink-0 items-center justify-center border font-bold transition-colors duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-40",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}
