import Link from "next/link";
import { cn } from "@/lib/utils";

export function BallMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.4" />
      <path
        d="M14.6 3.2c2.6 8.4 2.6 17.2 0 25.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M11.70 8h2.5M17.40 8h2.5M12.20 11.5h2.5M17.90 11.5h2.5M12.45 15h2.5M18.15 15h2.5M12.35 18.5h2.5M18.05 18.5h2.5M11.95 22h2.5M17.65 22h2.5M11.30 25.2h2.5M17.00 25.2h2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "panel";
}) {
  return (
    <Link
      href="/"
      aria-label="Chauka home"
      className={cn(
        "group flex shrink-0 items-center gap-2 rounded-lg",
        className
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded",
          variant === "panel"
            ? "bg-panel-ink text-panel"
            : "bg-accent text-accent-ink"
        )}
      >
        <BallMark className="h-[22px] w-[22px]" />
      </span>
      <span className="font-display text-[26px] font-bold leading-none tracking-[-0.05em]">
        chauka
      </span>
    </Link>
  );
}
