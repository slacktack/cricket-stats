"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Radio, Search, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    href: "/",
    label: "Matches",
    icon: Radio,
    active: (path: string) => path === "/" || path.startsWith("/match"),
  },
  {
    href: "/series",
    label: "Series",
    icon: Trophy,
    active: (path: string) => path.startsWith("/series"),
  },
  {
    href: "/rankings",
    label: "Rankings",
    icon: BarChart3,
    active: (path: string) => path.startsWith("/rankings"),
  },
  {
    href: "/search",
    label: "Search",
    icon: Search,
    active: (path: string) => path.startsWith("/search"),
  },
];

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden items-stretch self-stretch lg:flex">
      {ITEMS.map((item) => {
        const isActive = item.active(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative my-auto flex h-9 items-center border-b-2 px-3 text-[12px] font-bold transition-colors duration-150",
              isActive
                ? "border-header-ink text-header-ink"
                : "border-transparent text-header-muted hover:text-header-ink"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="bottom-nav fixed inset-x-0 bottom-0 z-50 border-t border-line-strong lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {ITEMS.map((item) => {
          const isActive = item.active(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors duration-150",
                  isActive ? "text-accent" : "text-faint active:text-ink"
                )}
              >
                {isActive ? (
                  <span className="absolute inset-x-6 top-0 h-[3px] bg-accent" />
                ) : null}
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.8} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
