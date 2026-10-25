import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { DesktopNav } from "@/components/nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { LiveDot } from "@/components/ui/pills";

export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-50 shadow-[0_1px_0_rgba(0,0,0,0.12)]">
      <div className="container-page flex h-16 items-stretch gap-3 sm:gap-6">
        <div className="flex items-center text-header-ink">
          <Logo />
        </div>
        <DesktopNav />
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 text-[12px] font-medium text-header-muted md:flex">
            <LiveDot />
            Live scores
          </span>
          <Link
            href="/search"
            aria-label="Search players, teams, matches and series"
            className="grid h-9 w-9 place-items-center rounded-lg border border-header-ink/25 text-header-ink transition-colors hover:bg-header-ink/10 lg:hidden"
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-line bg-surface pb-24 pt-10 lg:pb-10">
      <div className="container-page">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm text-ink">
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Cricket, without the noise. Live scores, scorecards and the
              stories behind them.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <div>
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">
                Explore
              </p>
              <div className="grid gap-2 text-sm text-muted">
                <Link href="/" className="transition-colors hover:text-accent">
                  Live matches
                </Link>
                <Link href="/series" className="transition-colors hover:text-accent">
                  Series
                </Link>
                <Link href="/rankings" className="transition-colors hover:text-accent">
                  ICC rankings
                </Link>
                <Link href="/search" className="transition-colors hover:text-accent">
                  Search
                </Link>
              </div>
            </div>
            <div>
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">
                Data
              </p>
              <div className="grid gap-2 text-sm text-muted">
                <a
                  href="https://www.cricbuzz.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-accent"
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
        <div className="mt-9 flex flex-col gap-2 border-t border-line pt-4 text-xs leading-relaxed text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            Built for the love of the game. Not affiliated with the ICC, BCCI or
            Cricbuzz.
          </p>
          <p className="font-semibold text-muted">chauka · 2026</p>
        </div>
      </div>
    </footer>
  );
}
