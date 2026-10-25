import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { BottomNav, DesktopNav } from "@/components/nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { LiveDot } from "@/components/ui/pills";

export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-50">
      <div className="container-page flex h-[var(--header-h)] items-stretch gap-4 sm:gap-8">
        <div className="flex items-center text-header-ink">
          <Logo variant="panel" />
        </div>
        <DesktopNav />
        <div className="ml-auto flex items-center gap-2.5">
          <span className="hidden h-7 items-center gap-2 border-l border-header-ink/25 pl-4 text-[10px] font-bold uppercase tracking-[0.13em] text-header-muted md:flex">
            <LiveDot />
            Live scores
          </span>
          <Link
            href="/search"
            aria-label="Search"
            className="grid h-10 w-10 place-items-center rounded-md border border-header-ink/25 text-header-ink transition-colors duration-150 hover:border-header-ink hover:bg-header-ink/10 lg:hidden"
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function SiteNav() {
  return <BottomNav />;
}

export function SiteFooter() {
  return (
    <footer className="grain mt-16 border-t-[3px] border-ink bg-panel text-panel-ink">
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
