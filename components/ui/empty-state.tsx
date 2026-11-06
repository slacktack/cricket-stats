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
        "flex flex-col items-center justify-center border border-line bg-surface px-6 py-14 text-center",
        className
      )}
    >
      {icon ? (
        <div className="mb-5 grid h-11 w-11 place-items-center bg-slab text-white">{icon}</div>
      ) : null}
      <h3 className="display text-[clamp(22px,3vw,30px)] font-bold leading-none tracking-[-0.04em]">
        {title}
      </h3>
      {description ? (
        <p className="mt-3 max-w-sm text-[12px] font-medium leading-relaxed text-muted">
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
