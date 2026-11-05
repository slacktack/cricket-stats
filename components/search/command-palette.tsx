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
        className="grid h-11 w-11 place-items-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Search className="h-5 w-5" />
      </button>
    );
  }
  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={open}
        aria-label="Search"
        className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-header-ink transition-colors hover:border-line-strong"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={open}
      className="flex h-10 w-full items-center gap-2.5 rounded-lg border border-line bg-bg px-3 text-left text-[13px] text-faint transition-colors hover:border-line-strong hover:text-ink"
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">Search</span>
      <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
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
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/55 px-3 pt-[8vh] backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div className="flex max-h-[80vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface text-ink shadow-lift backdrop-blur-xl animate-pop">
            <div className="flex items-center gap-2 border-b border-line px-3">
              {loading ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-accent" />
              ) : (
                <Search className="h-5 w-5 shrink-0 text-faint" />
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
                className="h-14 min-w-0 flex-1 bg-transparent text-[16px] font-semibold outline-none placeholder:font-medium placeholder:text-faint"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="grid h-9 w-9 place-items-center rounded-md text-faint hover:bg-surface2 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-2">
              {!query.trim() ? (
                <div className="p-2">
                  <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-faint">
                    Jump to
                  </p>
                  <div className="mt-2 grid gap-1">
                    {QUICK.map((item) => (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => go(item.href)}
                        className="flex h-11 items-center justify-between rounded-lg px-3 text-left text-[14px] font-bold hover:bg-surface2"
                      >
                        {item.label}
                        <ArrowRight className="h-4 w-4 text-faint" />
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-[12px] text-faint">
                    Tip: press <kbd className="rounded border border-line px-1">/</kbd> anywhere
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
                    <p className="px-3 pb-1 pt-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-faint">
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
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors",
                            active === current ? "bg-accent-soft" : "hover:bg-surface2"
                          )}
                        >
                          {item.node}
                          <ArrowRight
                            className={cn(
                              "h-4 w-4 shrink-0",
                              active === current ? "text-accent" : "text-transparent"
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
                className="flex h-11 items-center justify-center gap-1.5 border-t border-line text-[13px] font-bold text-accent hover:bg-surface2"
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
