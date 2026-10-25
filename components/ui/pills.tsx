import { cn } from "@/lib/utils";

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
        "inline-flex h-5 items-center rounded bg-ink/[0.06] px-1.5 text-[10px] font-bold text-muted",
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
        "inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-live animate-pulse-dot",
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
          "inline-flex h-6 items-center gap-1.5 rounded-full bg-live/10 px-2 text-[10px] font-bold uppercase tracking-wide text-live",
          className
        )}
      >
        <LiveDot />
        {label ?? "Live"}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full bg-surface2 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted",
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
    neutral: "bg-surface2 text-muted",
    accent: "bg-accent-soft text-accent",
    live: "bg-live/10 text-live",
    win: "bg-win/10 text-win",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
