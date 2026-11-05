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

export function SideNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="flex flex-col items-center gap-2">
      {ITEMS.filter((item) => item.href !== "/search").map((item) => {
        const isActive = item.active(pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            title={item.label}
            className={cn(
              "group relative grid h-11 w-11 place-items-center rounded-xl transition-colors duration-150",
              isActive ? "bg-white text-[#1d4ed8]" : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.8} />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[12px] font-medium text-bg opacity-0 transition-opacity group-hover:opacity-100">
              {item.label}
            </span>
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
      className="bottom-nav fixed inset-x-0 bottom-0 z-50 border-t border-line lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {ITEMS.map((item) => {
          const isActive = item.active(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors duration-150",
                  isActive ? "text-accent" : "text-faint active:text-ink"
                )}
              >
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
