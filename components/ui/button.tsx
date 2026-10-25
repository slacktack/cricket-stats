import { cn } from "@/lib/utils";

const VARIANTS = {
  primary:
    "bg-accent text-accent-ink hover:bg-accent/90",
  secondary:
    "border border-line bg-surface text-ink hover:border-line-strong hover:bg-surface2",
  ghost: "text-muted hover:bg-surface2 hover:text-ink",
  outline:
    "border border-line-strong bg-surface text-ink hover:border-accent hover:bg-surface2",
};

const SIZES = {
  sm: "h-9 gap-1.5 px-3.5 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-11 gap-2 px-5 text-sm",
  icon: "h-9 w-9 p-0",
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
    "inline-flex shrink-0 items-center justify-center rounded-lg font-bold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}
