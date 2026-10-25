"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronRight,
  Menu,
  Radio,
  Search,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

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

export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="grid h-9 w-9 place-items-center rounded-md border border-header-ink/25 text-header-ink transition-colors duration-150 hover:border-header-ink hover:bg-header-ink/10 lg:hidden"
      >
        {open ? (
          <X className="h-[18px] w-[18px]" />
        ) : (
          <Menu className="h-[18px] w-[18px]" />
        )}
      </button>

      {open ? (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
          />
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="relative mx-3 mt-2 overflow-hidden rounded-xl border border-line-strong bg-surface shadow-[0_24px_70px_-24px_rgba(7,9,18,0.6)]"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="eyebrow">Menu</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-live" />
                Live scores
              </span>
            </div>

            <nav aria-label="Mobile" className="p-2">
              {ITEMS.map((item) => {
                const isActive = item.active(pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex h-11 items-center gap-3 rounded-lg px-3 text-[14px] font-bold transition-colors duration-150",
                      isActive
                        ? "bg-accent-soft text-accent"
                        : "text-muted hover:bg-surface2 hover:text-ink"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className="h-4 w-4 opacity-40" />
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center justify-between border-t border-line px-4 py-3">
              <div>
                <p className="text-[12px] font-bold">Appearance</p>
                <p className="mt-0.5 text-[10px] text-faint">Light or dark</p>
              </div>
              <ThemeToggle variant="panel" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
