import { cn } from "@/lib/utils";

/**
 * Match format is a structural label, not a rainbow: Test/ODI/T20 all read as
 * hairline ink chips, differentiated by weight. Only LIVE gets a saturated hue.
 */
function formatTone(format: string): string {
  const value = format.toUpperCase();
  if (value.includes("TEST")) return "border-ink/50 text-ink font-extrabold";
  if (value.includes("T20") || value.includes("T10"))
    return "border-accent/60 text-accent";
  if (value.includes("ODI") || value.includes("ODM"))
    return "border-line-strong text-muted";
  return "border-line text-faint";
}

export function FormatPill({
  format,
  className,
}: {
  format: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center border px-1.5 text-[10px] font-bold uppercase leading-none tracking-[0.08em]",
        formatTone(format),
        className
      )}
    >
      {format}
    </span>
  );
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-live animate-pulse-dot",
        className
      )}
    />
  );
}

export function StatePill({
  state,
  label,
  className,
}: {
  state: "live" | "upcoming" | "completed";
  label?: string;
  className?: string;
}) {
  if (state === "live") {
    return (
      <span
        className={cn(
          "statelive inline-flex h-[19px] items-center gap-1.5 px-1.5 text-[10px] font-extrabold uppercase leading-none tracking-[0.1em]",
          className
        )}
      >
        <span className="inline-block h-[6px] w-[6px] shrink-0 rounded-full bg-current animate-pulse-dot" />
        {label ?? "Live"}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-[19px] items-center border-l-2 border-slab pl-1.5 text-[10px] font-bold uppercase leading-none tracking-[0.1em] text-muted",
        className
      )}
    >
      {label ?? (state === "upcoming" ? "Upcoming" : "Result")}
    </span>
  );
}

export function TonePill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "live" | "win";
  className?: string;
}) {
  const tones = {
    neutral: "border-line text-muted",
    accent: "border-slab bg-slab text-white",
    live: "border-live text-live",
    win: "border-ink/40 text-ink",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-[0.08em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
