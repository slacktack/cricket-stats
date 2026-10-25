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
      <circle cx="16" cy="16" r="12.6" stroke="currentColor" strokeWidth="2.4" />
      <path
        d="M10.4 6.7c4.3 5.4 4.3 13.2 0 18.6M21.6 6.7c-4.3 5.4-4.3 13.2 0 18.6"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="m13.2 10.4 1.7.6M12.1 13.3l1.8.3M11.8 16.2l1.8-.1M12.1 19.1l1.8-.4M13.2 22l1.7-.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Chauka home"
      className={cn(
        "group flex shrink-0 items-center gap-2 rounded-lg",
        className
      )}
    >
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-ink">
        <BallMark className="h-[22px] w-[22px]" />
      </span>
      <span className="text-[23px] font-extrabold leading-none tracking-[-0.04em]">
        chauka
      </span>
    </Link>
  );
}
