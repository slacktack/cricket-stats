import { cn } from "@/lib/utils";

const FORMAT_STYLES: Record<string, string> = {
  TEST: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
  ODI: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300",
  T20I: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-400/15 dark:text-fuchsia-300",
  T20: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-400/15 dark:text-fuchsia-300",
  T10: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  "LIST A": "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300",
  FC: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
  "100B": "bg-lime-100 text-lime-800 dark:bg-lime-400/15 dark:text-lime-300",
};

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
        "inline-flex h-5 items-center rounded-md px-1.5 text-[10px] font-bold",
        FORMAT_STYLES[format] ?? "bg-surface2 text-muted",
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
