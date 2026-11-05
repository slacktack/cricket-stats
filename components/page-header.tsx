import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlueHero } from "@/components/ui/blue-hero";

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
    <BlueHero
      className={cn(
        "mt-3 px-6 py-7 sm:px-9 sm:py-8 [&_.text-faint]:text-white/60 [&_.text-muted]:text-white/75",
        className
      )}
    >
      <header>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white">
                {eyebrow}
              </div>
            ) : null}
            <h1 className="mt-4 font-display text-[30px] font-bold leading-tight tracking-[-0.02em] sm:text-[40px]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-white/75">{description}</p>
            ) : null}
            {meta ? <div className="mt-2 text-[13px] text-white/60">{meta}</div> : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1 [&_button]:border-white/30 [&_button]:bg-white/10 [&_button]:text-white">
              {actions}
            </div>
          ) : null}
        </div>
        {children ? <div className="mt-6">{children}</div> : null}
      </header>
    </BlueHero>
  );
}
