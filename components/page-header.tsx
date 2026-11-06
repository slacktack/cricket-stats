import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlueHero, HeroChip, HeroFolio } from "@/components/ui/blue-hero";

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
        "flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-faint",
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
  tone = "accent",
  folio,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  tone?: "ink" | "accent";
  folio?: string | number;
}) {
  return (
    <BlueHero
      tone={tone}
      className={cn(
        "mt-3 px-[var(--pad)] py-8 sm:py-10",
        tone === "accent" && "text-white",
        className
      )}
    >      <header>
        <div className="grid grid-cols-12 items-end gap-x-6 gap-y-5">
          <div className="col-span-12 min-w-0 lg:col-span-8">
            {eyebrow ? (
              <div className="mb-3 flex flex-wrap items-center gap-2.5">
                <HeroChip>{eyebrow}</HeroChip>
              </div>
            ) : null}
            <h1 className="text-[clamp(30px,4.6vw,64px)] uppercase leading-[0.92] tracking-[-0.05em]">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-[58ch] text-[13px] leading-relaxed opacity-75">
                {description}
              </p>
            ) : null}
            {meta ? (
              <div className="mt-2 text-[11px] uppercase tracking-[0.08em] opacity-60">
                {meta}
              </div>
            ) : null}
          </div>

          {folio ? (
            <div className="col-span-12 flex justify-end lg:col-span-4">
              <HeroFolio n={folio} className="!text-[clamp(72px,11vw,180px)]" />
            </div>
          ) : actions ? (
            <div className="col-span-12 flex flex-wrap items-end gap-2 lg:col-span-4 lg:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
        {actions && folio ? (
          <div className="mt-6 flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
        {children ? <div className="mt-7">{children}</div> : null}
      </header>
    </BlueHero>
  );
}
