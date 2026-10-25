import { cn } from "@/lib/utils";

function formatTone(format: string): string {
  const value = format.toUpperCase();
  if (value.includes("TEST")) return "border-pop/25 bg-pop/10 text-pop";
  if (value.includes("T20") || value.includes("T10")) {
    return "border-live/25 bg-live/10 text-live";
  }
  if (value.includes("ODI") || value.includes("ODM")) {
    return "border-aqua/25 bg-aqua/10 text-aqua";
  }
  return "border-line bg-surface2 text-muted";
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
        "inline-flex h-5 items-center rounded border px-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.06em]",
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
          "inline-flex h-6 items-center gap-1.5 rounded border border-live/20 bg-live/10 px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-live",
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
        "inline-flex h-6 items-center rounded border border-line bg-surface2 px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted",
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
    neutral: "border border-line bg-surface2 text-muted",
    accent: "border border-accent/20 bg-accent-soft text-accent",
    live: "border border-live/20 bg-live/10 text-live",
    win: "border border-win/20 bg-win/10 text-win",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
