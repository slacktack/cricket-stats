import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Breadcrumbs({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-faint",
        className
      )}
    >
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          {index > 0 ? <ChevronRight className="h-3 w-3 shrink-0" /> : null}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-accent">
              {item.label}
            </Link>
          ) : (
            <span className="text-muted">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  children,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("border-b border-line-strong pb-6 pt-2 sm:pb-7", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="h-px w-5 bg-accent" />
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
                {eyebrow}
              </div>
            </div>
          ) : null}
          <h1 className="display mt-3 text-[clamp(2rem,6vw,4.5rem)] leading-[0.96] tracking-[-0.035em]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-[13px] font-medium leading-relaxed text-muted sm:text-sm">
              {description}
            </p>
          ) : null}
          {meta ? (
            <div className="mt-3 text-[11px] font-medium text-faint">{meta}</div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1">
            {actions}
          </div>
        ) : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </header>
  );
}
