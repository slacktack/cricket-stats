"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import type { SearchResults } from "@/lib/types";
import { matchFormat, matchStatusText, teamScoreText } from "@/lib/match-display";
import { cn } from "@/lib/utils";
import { FormatPill, LiveDot } from "@/components/ui/pills";
import { PlayerAvatar, TeamBadge } from "@/components/ui/team-badge";

type Item = { key: string; href: string; node: React.ReactNode };

const QUICK = [
  { href: "/", label: "Live matches" },
  { href: "/series", label: "All series" },
  { href: "/rankings", label: "ICC rankings" },
];

const OPEN_EVENT = "chauka:open-search";

export function SearchButton({ variant }: { variant: "sidebar" | "icon" | "rail" }) {
  const open = () => window.dispatchEvent(new Event(OPEN_EVENT));
  if (variant === "rail") {
    return (
      <button
        type="button"
        onClick={open}
        aria-label="Search (⌘K)"
        title="Search (⌘K)"
        className="flex h-8 w-full items-center gap-2 border border-line px-2 text-[11px] font-bold uppercase tracking-[0.06em] text-faint transition-colors hover:border-slab hover:text-accent"
      >
        <Search className="h-3.5 w-3.5" />
        Search
        <span className="ml-auto font-mono text-[9px] tracking-normal normal-case">
          ⌘K
        </span>
      </button>
    );
  }
  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={open}
        aria-label="Search"
        className="grid h-9 w-9 place-items-center border border-line bg-surface text-header-ink transition-colors hover:border-slab hover:text-accent"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={open}
      className="flex h-8 w-full items-center gap-2 border border-line px-2 text-[11px] font-bold uppercase tracking-[0.06em] text-faint transition-colors hover:border-slab hover:text-accent"
    >
      <Search className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 truncate normal-case tracking-normal">Search</span>
      <kbd className="border border-line px-1 font-mono text-[9px]">⌘K</kbd>
    </button>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults(null);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        setOpen(true);
      }
    }
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = previous;
      cancelAnimationFrame(id);
    };
  }, [open]);

  useEffect(() => {
    const value = query.trim();
    if (!open || !value) {
      setResults(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(value)}&limit=6`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("search failed");
        setResults((await response.json()) as SearchResults);
        setActive(0);
      } catch {
        if (!controller.signal.aborted) setResults(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 140);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, open]);

  const sections = useMemo(() => {
    if (!results) return [];
    const out: { title: string; items: Item[] }[] = [];
    if (results.matches.length) {
      out.push({
        title: "Matches",
        items: results.matches.map((match) => ({
          key: `m${match.id}`,
          href: `/match/${match.id}`,
          node: (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex shrink-0 -space-x-2">
                <TeamBadge team={match.teams[0]} size={30} className="ring-2 ring-surface" />
                <TeamBadge team={match.teams[1]} size={30} className="ring-2 ring-surface" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[14px] font-bold text-ink">
                  <span className="truncate">
                    {match.teams[0].shortName} vs {match.teams[1].shortName}
                  </span>
                  <FormatPill format={matchFormat(match)} />
                  {match.state === "live" ? <LiveDot /> : null}
                </p>
                <p className="truncate text-[12px] text-faint">
                  {match.state !== "upcoming"
                    ? `${teamScoreText(match, match.teams[0])} · ${teamScoreText(match, match.teams[1])} · `
                    : ""}
                  {matchStatusText(match)}
                </p>
              </div>
            </div>
          ),
        })),
      });
    }
    if (results.teams.length) {
      out.push({
        title: "Teams",
        items: results.teams.map((team) => ({
          key: `t${team.id}`,
          href: `/teams/${team.id}`,
          node: (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <TeamBadge team={team} size={32} />
              <span className="truncate text-[14px] font-bold text-ink">{team.name}</span>
              <span className="text-[12px] font-semibold text-faint">{team.shortName}</span>
            </div>
          ),
        })),
      });
    }
    if (results.players.length) {
      out.push({
        title: "Players",
        items: results.players.map((player) => ({
          key: `p${player.id}`,
          href: `/players/${player.id}`,
          node: (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <PlayerAvatar
                player={{ id: player.id, name: player.name, faceImageId: player.imageId }}
                size={32}
              />
              <span className="truncate text-[14px] font-bold text-ink">{player.name}</span>
              <span className="truncate text-[12px] font-semibold text-faint">
                {player.country}
              </span>
            </div>
          ),
        })),
      });
    }
    if (results.series.length) {
      out.push({
        title: "Series",
        items: results.series.map((series) => ({
          key: `s${series.id}`,
          href: `/series/${series.id}`,
          node: (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-ink">
                {series.name}
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-faint">
                {series.matches} matches
                {series.live ? ` · ${series.live} live` : ""}
              </span>
            </div>
          ),
        })),
      });
    }
    return out;
  }, [results]);

  const flat = sections.flatMap((section) => section.items);
  const allHref = `/search?q=${encodeURIComponent(query.trim())}`;

  function go(href: string) {
    close();
    router.push(href);
  }

  function onInputKey(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") close();
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(flat.length - 1, value + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(0, value - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (flat[active]) go(flat[active].href);
      else if (query.trim()) go(allHref);
    }
  }

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let index = -1;

  return (
    <>
      {open ? (
        <div
          className="scrim fixed inset-0 z-[90] flex items-start justify-center px-3 pt-[8vh]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div className="flex max-h-[80vh] w-full max-w-[640px] flex-col overflow-hidden border border-line-strong bg-surface text-ink animate-pop">
            <div className="flex items-center gap-2 border-b-2 border-slab bg-slab px-3">
              {loading ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-white" />
              ) : (
                <Search className="h-5 w-5 shrink-0 text-white/70" />
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKey}
                placeholder="Team, player, series or “IND vs AUS”"
                aria-label="Search"
                autoComplete="off"
                spellCheck={false}
                className="h-12 min-w-0 flex-1 bg-transparent text-[15px] font-bold text-white outline-none placeholder:font-medium placeholder:text-white/45"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="grid h-8 w-8 place-items-center text-white/60 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-2">
              {!query.trim() ? (
                <div className="p-2">
                  <p className="kicker">Jump to</p>
                  <div className="mt-2">
                    {QUICK.map((item) => (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => go(item.href)}
                        className="hrow flex items-center justify-between text-left text-[13px] font-bold"
                      >
                        {item.label}
                        <ArrowRight className="h-4 w-4 opacity-50" />
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 px-1 text-[11px] text-faint">
                    Tip: press <kbd className="border border-line px-1 font-mono">/</kbd> anywhere
                    to search.
                  </p>
                </div>
              ) : results && flat.length === 0 && !loading ? (
                <p className="px-3 py-10 text-center text-[14px] text-muted">
                  Nothing for “{query.trim()}”. Try a team code like IND or a city.
                </p>
              ) : (
                sections.map((section) => (
                  <div key={section.title} className="mb-2">
                    <p className="kicker px-3 pb-1 pt-2">
                      {section.title}
                    </p>
                    {section.items.map((item) => {
                      index += 1;
                      const current = index;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          data-index={current}
                          onMouseEnter={() => setActive(current)}
                          onClick={() => go(item.href)}
                          className="hrow tile flex w-full items-center gap-2 text-left"
                          data-hot={active === current ? "" : undefined}
                        >
                          {item.node}
                          <ArrowRight
                            className={cn(
                              "h-4 w-4 shrink-0",
                              active === current ? "opacity-70" : "opacity-0"
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {query.trim() ? (
              <button
                type="button"
                onClick={() => go(allHref)}
                className="flex h-11 items-center justify-center gap-1.5 border-t border-line text-[11px] font-bold uppercase tracking-[0.08em] text-accent transition-colors hover:bg-slab hover:text-white"
              >
                See all results for “{query.trim()}”
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
