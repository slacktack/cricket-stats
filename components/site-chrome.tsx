import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CommandPalette, SearchButton } from "@/components/search/command-palette";
import { BallMark, Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { BottomNav, SideNav } from "@/components/nav";

export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-50 lg:hidden">
      <div className="container-page flex h-[var(--header-h)] items-center gap-3">
        <Logo variant="panel" />
        <div className="ml-auto flex items-center gap-2">
          <SearchButton variant="icon" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function SiteSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[76px] flex-col items-center bg-gradient-to-b from-[#2563eb] to-[#1e3a8a] py-5 lg:flex">
      <Link
        href="/"
        aria-label="Chauka home"
        className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#1d4ed8]"
      >
        <BallMark className="h-6 w-6" />
      </Link>
      <div className="mt-8">
        <SearchButton variant="rail" />
      </div>
      <div className="mt-3">
        <SideNav />
      </div>
      <div className="mt-auto">
        <ThemeToggle variant="rail" />
      </div>
    </aside>
  );
}

export function SiteNav() {
  return (
    <>
      <BottomNav />
      <CommandPalette />
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-panel text-panel-ink">
      <div className="container-page py-10">
        <div className="grid gap-10 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div>
            <Logo variant="panel" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-panel-muted">
              Live scores, full scorecards and the day&apos;s cricket from
              around the world. Built for the game, without the noise.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:justify-items-end">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.17em] text-panel-muted">
                Cricket
              </p>
              <div className="grid gap-2.5 text-sm text-panel-ink/80">
                <Link href="/" className="transition-colors hover:text-panel-ink">
                  Live matches
                </Link>
                <Link href="/series" className="transition-colors hover:text-panel-ink">
                  Series
                </Link>
                <Link href="/rankings" className="transition-colors hover:text-panel-ink">
                  ICC rankings
                </Link>
                <Link href="/search" className="transition-colors hover:text-panel-ink">
                  Search
                </Link>
              </div>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.17em] text-panel-muted">
                Data
              </p>
              <div className="grid gap-2.5 text-sm text-panel-ink/80">
                <a
                  href="https://www.cricbuzz.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-panel-ink"
                >
                  Cricbuzz
                  <ArrowUpRight className="h-3 w-3" />
                </a>
                <span>ICC rankings</span>
                <span>Updated live</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-panel-ink/15 pt-4 text-[11px] leading-relaxed text-panel-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Not affiliated with the ICC, BCCI or Cricbuzz. Scores are provided
            as-is.
          </p>
          <p className="font-semibold uppercase tracking-[0.12em]">
            Chauka · 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
