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
              "relative my-auto flex h-9 items-center border-b-2 px-3.5 text-[13px] font-bold transition-colors duration-150",
              isActive
                ? "border-accent text-header-ink"
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

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/92 shadow-[0_-12px_35px_-24px_rgba(12,20,35,0.5)] backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "max(0.3rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {ITEMS.map((item) => {
          const isActive = item.active(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex min-h-[58px] flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors",
                isActive ? "text-accent" : "text-muted hover:text-ink"
              )}
            >
              <span className="grid h-7 w-10 place-items-center">
                <Icon
                  className={cn(
                    "h-[19px] w-[19px]",
                    isActive && "animate-pop"
                  )}
                  strokeWidth={isActive ? 2.4 : 1.9}
                />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
