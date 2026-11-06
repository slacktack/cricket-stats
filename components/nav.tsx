"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, pad } from "@/lib/utils";

const ITEMS = [
  {
    href: "/",
    label: "Matches",
    active: (path: string) => path === "/" || path.startsWith("/match"),
  },
  {
    href: "/series",
    label: "Series",
    active: (path: string) => path.startsWith("/series"),
  },
  {
    href: "/rankings",
    label: "Rankings",
    active: (path: string) => path.startsWith("/rankings"),
  },
  {
    href: "/search",
    label: "Search",
    active: (path: string) => path.startsWith("/search"),
  },
];

/** The print rail: a contents column, not an icon strip. */
export function SideNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="w-full">
      <p className="kicker mb-2 !text-[9px]">Contents</p>
      <ul className="border-t border-line">
        {ITEMS.map((item, i) => {
          const isActive = item.active(pathname);
          return (
            <li key={item.href} className="border-b border-line">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative isolate flex h-10 items-center gap-2.5 overflow-hidden px-1 text-[12px] font-bold uppercase tracking-[0.04em] transition-colors duration-150",
                  isActive ? "text-white" : "text-muted hover:text-white"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "w-[18px] shrink-0 text-[10px] font-normal tabular-nums transition-opacity",
                    isActive ? "text-white/70" : "text-faint opacity-60"
                  )}
                >
                  {pad(i + 1)}
                </span>
                <span className="relative z-10 truncate">{item.label}</span>
                <span
                  className={cn(
                    "absolute inset-0 -z-0 bg-slab transition-transform duration-[450ms]",
                    isActive
                      ? "scale-x-100"
                      : "scale-x-0 origin-left group-hover:scale-x-100"
                  )}
                  style={{ transitionTimingFunction: "var(--ease)" }}
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="bottom-nav fixed inset-x-0 bottom-0 z-50 lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 divide-x divide-line">
        {ITEMS.map((item, i) => {
          const isActive = item.active(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-[52px] flex-col items-center justify-center gap-0.5 text-[9px] font-bold uppercase tracking-[0.08em] transition-colors duration-150",
                  isActive ? "text-ink" : "text-faint active:text-muted"
                )}
              >
                <span className="tabular-nums text-[9px] text-faint">
                  {pad(i + 1)}
                </span>
                {item.label}
                {isActive ? (
                  <span className="absolute inset-x-5 top-0 h-[2px] bg-slab" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
