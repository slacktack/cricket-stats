import { cn } from "@/lib/utils";
import { Grain } from "@/components/motion";

/**
 * Two spreads, alternating down the page like printed sections:
 *   ink    — the stock everything else is set on (default, quiet)
 *   accent — one Klein slab, reserved for the live match
 * No radius, no blur. Depth comes from the stock texture and hairlines.
 */
export function BlueHero({
  children,
  className,
  tone = "ink",
  grain = true,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "ink" | "accent";
  grain?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden",
        tone === "accent"
          ? "sheet-accent"
          : "border border-line bg-surface text-ink",
        className
      )}
    >
      {tone === "ink" ? null : grain ? <Grain /> : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function HeroChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border-l-2 border-current pl-1.5 text-[10px] font-bold uppercase leading-none tracking-[0.12em]",
        className
      )}
    >
      {children}
    </span>
  );
}

export function HeroStat({
  value,
  label,
  className,
}: {
  value: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-[88px] border-t border-current/25 pt-2", className)}>
      <p className="num-lg">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase leading-none tracking-[0.1em] opacity-60">
        {label}
      </p>
    </div>
  );
}

/**
 * The oversized outlined match number. Grid's cover move: a figure you read as
 * architecture rather than data.
 */
export function HeroFolio({
  n,
  className,
}: {
  n: string | number;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={cn("num-hero block", className)}>
      {n}
    </span>
  );
}
