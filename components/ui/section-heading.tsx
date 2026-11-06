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
    <div className={cn("mb-4", className)}>
      <div className="flex items-end justify-between gap-4 border-b-2 border-slab pb-2">
        <div className="min-w-0">
          {eyebrow ? <p className="eyebrow mb-1.5">{eyebrow}</p> : null}
          <h2 className="display truncate text-[clamp(20px,2.2vw,28px)] font-bold leading-none tracking-[-0.04em]">
            {title}
          </h2>
        </div>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="group inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:text-accent"
          >
            {actionLabel}
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
