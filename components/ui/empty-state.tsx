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
        "card-vivid flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center",
        className
      )}
    >
      {icon ? (
        <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-accent-soft text-accent">
          {icon}
        </div>
      ) : null}
      <h3 className="display text-[24px] font-extrabold leading-tight tracking-[-0.03em]">
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
