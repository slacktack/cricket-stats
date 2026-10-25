import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";

export function EmptyState({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center",
        className
      )}
    >
      {icon ? (
        <div className="mb-4 grid h-10 w-10 place-items-center rounded-md border border-accent/15 bg-accent-soft text-accent">
          {icon}
        </div>
      ) : null}
      <h3 className="display text-[26px] font-bold leading-tight tracking-[-0.025em]">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-sm text-[12px] font-medium leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
      {!action && actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className={cn(buttonClass({ variant: "primary", size: "sm" }), "mt-6")}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
