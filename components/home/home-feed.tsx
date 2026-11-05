"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, RefreshCw, Search, X } from "lucide-react";
import type {
  HomeFeed as HomeFeedData,
  MatchCategory,
  MatchSummary,
} from "@/lib/types";
import {
  groupMatchesBySeries,
  matchFormat,
  matchStatusText,
  teamScoreText,
  upcomingLine,
} from "@/lib/match-display";
import { matchHaystack } from "@/lib/search";
import { timeAgo, cn, normalizeSearch } from "@/lib/utils";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useToast } from "@/components/providers/toast-provider";
import { centreRank, MatchStage } from "@/components/home/match-centre";
import { LiveDot } from "@/components/ui/pills";
import { TeamBadge } from "@/components/ui/team-badge";

type StateTab = "live" | "upcoming" | "completed" | "all";

const STATE_TABS: { key: StateTab; label: string }[] = [
  { key: "live", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Results" },
  { key: "all", label: "All" },
];

const CATEGORIES: MatchCategory[] = [
  "All",
  "International",
  "League",
  "Women",
  "Domestic",
];

const COLLAPSE_AFTER = 4;

export function HomeFeed({
  initialFeed,
  initialTeamId,
}: {
  initialFeed: HomeFeedData;
  initialTeamId?: number;
}) {
  const favorites = useFavorites();
  const { toast } = useToast();
  const [feed, setFeed] = useState(initialFeed);
  const [tab, setTab] = useState<StateTab>(() =>
    initialFeed.matches.some((match) => match.state === "live")
      ? "live"
      : "upcoming"
  );
  const [category, setCategory] = useState<MatchCategory>("All");
  const [following, setFollowing] = useState(false);
  const teamFilter = initialTeamId ?? null;
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [stale, setStale] = useState(false);
  const [, setTick] = useState(0);
  const lastFetch = useRef(0);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    lastFetch.current = Date.now();
    const ticker = setInterval(() => setTick((value) => value + 1), 15_000);
    return () => {
      mounted.current = false;
      clearInterval(ticker);
    };
  }, []);

  const refresh = useCallback(
    async (silent = false) => {
      if (!silent) setRefreshing(true);
      try {
        const response = await fetch("/api/home", { cache: "no-store" });
        if (!response.ok) throw new Error("Refresh failed");
        const data = (await response.json()) as HomeFeedData;
        if (!Array.isArray(data.matches)) throw new Error("Malformed feed");
        if (!mounted.current) return;
        setFeed(data);
        setStale(false);
        lastFetch.current = Date.now();
      } catch {
        if (!mounted.current) return;
        setStale(true);
        if (!silent) {
          toast("Couldn't refresh the feed. Showing the last update.", "error");
        }
      } finally {
        if (mounted.current && !silent) setRefreshing(false);
      }
    },
    [toast]
  );

  const hasLive = feed.matches.some((match) => match.state === "live");

  useEffect(() => {
    const delay = hasLive ? 30_000 : 90_000;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void refresh(true);
    }, delay);
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastFetch.current > 15_000
      ) {
        void refresh(true);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [hasLive, refresh]);

  const terms = normalizeSearch(query)
    .split(/[\s,]+/)
    .filter((term) => term && !["vs", "v", "versus"].includes(term));

  const followingBase = feed.matches.filter(
    (match) => !following || favorites.isMatchFollowed(match)
  );
  const queryBase = terms.length
    ? followingBase.filter((match) => {
        const haystack = normalizeSearch(matchHaystack(match));
        return terms.every((term) => haystack.includes(term));
      })
    : followingBase;
  const teamBase = teamFilter
    ? queryBase.filter((match) =>
        match.teams.some((team) => team.id === teamFilter)
      )
    : queryBase;
  const categoryBase = teamBase.filter(
    (match) => category === "All" || match.matchType === category
  );

  const counts = {
    live: categoryBase.filter((match) => match.state === "live").length,
    upcoming: categoryBase.filter((match) => match.state === "upcoming").length,
    completed: categoryBase.filter((match) => match.state === "completed").length,
    all: categoryBase.length,
  };

  const visible =
    tab === "all"
      ? categoryBase
      : categoryBase.filter((match) => match.state === tab);
  const groups = groupMatchesBySeries(visible);
  const filtering = terms.length > 0 || teamFilter !== null;

  const selectable = useMemo(
    () => [...feed.matches].sort((a, b) => centreRank(a) - centreRank(b)),
    [feed.matches]
  );
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const selected =
    feed.matches.find((match) => match.id === selectedId) ?? selectable[0];

  function choose(match: MatchSummary) {
    setSelectedId(match.id);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const categoryCount = (value: MatchCategory) =>
    value === "All"
      ? queryBase.length
      : queryBase.filter((match) => match.matchType === value).length;

  function toggleGroup(key: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0">
        {selected ? <MatchStage key={selected.id} match={selected} /> : null}
      </div>

      <aside className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:max-h-[calc(100vh-var(--header-h)-3rem)] lg:overflow-y-auto lg:pr-1 no-scrollbar">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-[20px] font-bold tracking-[-0.01em]">All matches</h2>
          <span className="ml-auto text-[12px] text-faint" suppressHydrationWarning>
            {stale ? "Reconnecting" : timeAgo(feed.updatedAt)}
          </span>
          <button
            type="button"
            onClick={() => void refresh(false)}
            disabled={refreshing}
            aria-label="Refresh matches"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </button>
        </div>

        <label className="relative mt-3 flex items-center">
          <span className="sr-only">Filter matches</span>
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-faint" />
          <input
            type="text"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Team, series or city"
            className="h-10 w-full rounded-xl bg-surface pl-9 pr-9 text-[14px] text-ink outline-none ring-1 ring-transparent transition placeholder:text-faint focus:ring-accent/60"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear filter"
              className="absolute right-1 grid h-8 w-8 place-items-center rounded-lg text-faint hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>

        <div className="mt-3 flex gap-4 border-b border-line text-[14px]" role="tablist" aria-label="Match state">
          {STATE_TABS.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.key)}
                className={cn(
                  "-mb-px flex items-center gap-1.5 border-b-2 pb-2.5 font-semibold transition-colors",
                  active ? "border-accent text-ink" : "border-transparent text-faint hover:text-ink"
                )}
              >
                {item.key === "live" ? <LiveDot /> : null}
                {item.label}
                <span className="tnum text-[12px] font-medium text-faint">{counts[item.key]}</span>
              </button>
            );
          })}
        </div>

        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
          {CATEGORIES.map((item) => {
            const active = category === item;
            const count = categoryCount(item);
            if (item !== "All" && count === 0) return null;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={active}
                className={cn(
                  "h-7 shrink-0 rounded-full px-3 text-[12px] font-medium transition-colors",
                  active ? "bg-ink text-bg" : "bg-surface text-muted hover:text-ink"
                )}
              >
                {item}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setFollowing((value) => !value)}
            disabled={!favorites.hydrated}
            aria-pressed={following}
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-3 text-[12px] font-medium transition-colors",
              following ? "bg-ink text-bg" : "bg-surface text-muted hover:text-ink"
            )}
          >
            <Heart className={cn("h-3 w-3", following && "fill-current")} />
            Following
          </button>
        </div>

        <div className="mt-4 space-y-5 pb-4">
          {groups.length === 0 ? (
            <div className="rounded-2xl bg-surface p-6 text-center text-[13px] text-muted">
              {following && !favorites.hasFavorites
                ? "Follow a team or series to build your own list."
                : `No ${tab === "all" ? "" : tab === "completed" ? "results " : `${tab} `}matches${query.trim() ? ` for “${query.trim()}”` : ""}.`}
              {tab !== "all" && counts.all > 0 ? (
                <button type="button" onClick={() => setTab("all")} className="mt-2 block w-full font-semibold text-accent">
                  Show all {counts.all}
                </button>
              ) : null}
            </div>
          ) : (
            groups.map((group) => {
              const collapsible = !filtering && group.matches.length > COLLAPSE_AFTER + 1;
              const open = expanded.has(group.key) || !collapsible;
              const shown = open ? group.matches : group.matches.slice(0, COLLAPSE_AFTER);
              return (
                <section key={group.key} aria-label={group.name}>
                  <div className="mb-2 flex items-center gap-2 px-1">
                    {group.seriesId ? (
                      <Link
                        href={`/series/${group.seriesId}`}
                        className="min-w-0 flex-1 truncate text-[12px] font-semibold uppercase tracking-[0.05em] text-faint hover:text-ink"
                      >
                        {group.name}
                      </Link>
                    ) : (
                      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold uppercase tracking-[0.05em] text-faint">
                        {group.name}
                      </span>
                    )}
                    <span className="text-[12px] text-faint">{group.matches.length}</span>
                  </div>
                  <div className="space-y-2">
                    {shown.map((match) => (
                      <MatchTile
                        key={match.id}
                        match={match}
                        active={selected?.id === match.id}
                        onSelect={() => choose(match)}
                      />
                    ))}
                  </div>
                  {collapsible ? (
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      className="mt-2 flex w-full items-center justify-center gap-1 py-1.5 text-[12px] font-medium text-faint hover:text-ink"
                    >
                      {open ? "Show fewer" : `${group.matches.length - COLLAPSE_AFTER} more`}
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
                    </button>
                  ) : null}
                </section>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}

function MatchTile({
  match,
  active,
  onSelect,
}: {
  match: MatchSummary;
  active: boolean;
  onSelect: () => void;
}) {
  const live = match.state === "live";
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "block w-full rounded-2xl p-3.5 text-left transition-colors",
        active
          ? "bg-gradient-to-br from-[#1d4ed8] to-[#3b6cff] text-white shadow-[0_12px_30px_-14px_rgb(37_99_235/0.9)]"
          : "bg-surface hover:bg-surface2"
      )}
    >
      <div className="flex items-center gap-2 text-[11px]">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-semibold",
            active ? "bg-white/20 text-white" : "bg-surface2 text-muted"
          )}
        >
          {matchFormat(match)}
        </span>
        <span className={cn("min-w-0 flex-1 truncate", active ? "text-white/70" : "text-faint")}>
          {match.description}
        </span>
        {live ? (
          <span className={cn("inline-flex items-center gap-1 font-semibold", active ? "text-white" : "text-live")}>
            <LiveDot className={active ? "bg-white" : undefined} />
            LIVE
          </span>
        ) : (
          <span className={cn(active ? "text-white/70" : "text-faint")} suppressHydrationWarning>
            {match.state === "upcoming" ? upcomingLine(match) : "Result"}
          </span>
        )}
      </div>
      <div className="mt-2.5 space-y-1.5">
        {match.teams.map((team) => {
          const score = teamScoreText(match, team);
          const batting = live && match.currentBattingTeamId === team.id;
          const winner = match.state === "completed" && match.winnerTeamId === team.id;
          return (
            <div key={team.id} className="flex items-center gap-2.5">
              <TeamBadge team={team} size={26} />
              <span className={cn("min-w-0 flex-1 truncate text-[14px] font-semibold", winner && !active && "text-win")}>
                {team.shortName}
                {batting ? <span className={cn("ml-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle", active ? "bg-white" : "bg-live")} /> : null}
              </span>
              <span className="tnum text-[15px] font-bold">
                {score === "—" || score === "Yet to bat" ? (
                  <span className={cn("text-[12px] font-medium", active ? "text-white/60" : "text-faint")}>
                    {score === "—" ? "" : "Yet to bat"}
                  </span>
                ) : (
                  score
                )}
              </span>
            </div>
          );
        })}
      </div>
      <p
        className={cn("mt-2.5 truncate text-[12px]", active ? "text-white/80" : "text-muted")}
        suppressHydrationWarning
      >
        {match.state === "upcoming" ? match.venue?.city ?? "" : matchStatusText(match)}
      </p>
    </button>
  );
}

export type { StateTab };
