import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CommandPalette, SearchButton } from "@/components/search/command-palette";
import { BallMark, Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { PaletteSwitch } from "@/components/palette-switch";
import { BottomNav, SideNav } from "@/components/nav";
import { LiveDot } from "@/components/ui/pills";

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

/** Grid's print rail: masthead, contents, colophon. Reads like a journal. */
export function SiteSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[var(--rail)] flex-col overflow-y-auto border-r border-line bg-bg px-4 pb-5 pt-5 lg:flex [scrollbar-width:none]">
      <Link
        href="/"
        aria-label="Chauka home"
        className="group flex items-center gap-2"
      >
        <span className="grid h-6 w-6 shrink-0 place-items-center bg-slab text-white transition-transform duration-300 group-hover:rotate-[18deg]">
          <BallMark className="h-4 w-4" />
        </span>
        <span className="text-[17px] font-extrabold uppercase leading-none tracking-[-0.05em]">
          Chauka
        </span>
      </Link>
      <p className="mt-1.5 text-[9px] font-bold uppercase leading-none tracking-[0.14em] text-faint">
        Live cricket · No. 01
      </p>

      <div className="mt-6">
        <SearchButton variant="rail" />
      </div>

      <div className="mt-6">
        <SideNav />
      </div>

      <div className="mt-auto pt-8">
        <div className="flex items-center gap-2 border-t border-line pt-3">
          <LiveDot />
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
            Updated live
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.1em] text-faint">
            IST
          </span>
          <ThemeToggle variant="rail" />
        </div>
        <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.14em] text-faint">
          Colourway
        </p>
        <PaletteSwitch className="mt-1.5" />
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
    <footer className="sheet-accent relative z-10 mt-16">
      <div className="on-slab container-page py-12">
        <div className="sec-head !pb-8">
          <p className="kicker">
            <b>04</b>
            Colophon
          </p>
          <h2 className="col-span-12 text-[clamp(32px,5vw,72px)] uppercase leading-[0.9]">
            Every figure
            <br />
            is a receipt.
          </h2>
        </div>

        <div className="gcols border-t border-line pt-0 text-[12px]">
          <div>
            <Logo variant="panel" />
            <p className="mt-3 max-w-[26ch] leading-relaxed text-muted">
              Live scores, full scorecards and the day&apos;s cricket from
              around the world. Built for the game, without the noise.
            </p>
          </div>
          <div>
            <p className="kicker mb-2">Cricket</p>
            <div className="grid gap-1.5 text-ink/80">
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
            <p className="kicker mb-2">Data</p>
            <div className="grid gap-1.5 text-ink/80">
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
              <span>Polled live</span>
            </div>
          </div>
          <div>
            <p className="kicker mb-2">Method</p>
            <p className="leading-relaxed text-muted">
              Scores are scraped, normalised and cached server-side. Times are
              shown in India Standard Time.
            </p>
            <p className="kicker mt-4 mb-1.5">Colourway</p>
            <PaletteSwitch />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-4 text-[10px] uppercase leading-relaxed tracking-[0.1em] text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            Not affiliated with the ICC, BCCI or Cricbuzz. Scores provided
            as-is.
          </p>
          <p className="font-bold text-muted">Chauka · 2026</p>
        </div>
      </div>
    </footer>
  );
}
