import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  eyebrow,
  actionHref,
  actionLabel,
  className,
}: {
  title: string;
  eyebrow?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-3", className)}>
      <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <div className="min-w-0">
          {eyebrow ? <p className="eyebrow mb-1.5">{eyebrow}</p> : null}
          <h2 className="display truncate text-[20px] font-medium leading-tight tracking-[-0.02em]">
            {title}
          </h2>
        </div>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="mono group inline-flex shrink-0 items-center gap-1 text-[8px] font-medium uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
          >
            {actionLabel}
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
