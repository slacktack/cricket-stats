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
import { IssueCover } from "@/components/home/issue-cover";
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
    <>
      <IssueCover matches={feed.matches} updatedAt={feed.updatedAt} />

      <div className="grid gap-6 pb-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {selected ? <MatchStage key={selected.id} match={selected} /> : null}
        </div>

      <aside className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:max-h-[calc(100vh-var(--header-h)-3rem)] lg:overflow-y-auto lg:pr-1 no-scrollbar">
        <div className="band !px-3">
          <h3>All matches</h3>
          <span className="flex items-center gap-2 shrink-0">
            <span className="dcell !text-white/70" suppressHydrationWarning>
              {stale ? "Reconnecting" : timeAgo(feed.updatedAt)}
            </span>
            <button
              type="button"
              onClick={() => void refresh(false)}
              disabled={refreshing}
              aria-label="Refresh matches"
              className="grid h-6 w-6 place-items-center text-white/70 transition-colors hover:bg-white hover:text-[rgb(var(--slab))] disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            </button>
          </span>
        </div>

        <label className="relative mt-3 flex items-center">
          <span className="sr-only">Filter matches</span>
          <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-faint" />
          <input
            type="text"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Team, series or city"
            className="h-9 w-full border border-line bg-surface pl-8 pr-8 text-[13px] text-ink outline-none transition-colors placeholder:text-faint focus:border-slab"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear filter"
              className="absolute right-1 grid h-7 w-7 place-items-center text-faint hover:text-accent"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </label>

        <div
          className="mt-3 flex items-end border-b border-line"
          role="tablist"
          aria-label="Match state"
        >
          {STATE_TABS.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.key)}
                className="tab-link !px-2"
                data-active={active ? "true" : undefined}
              >
                {item.key === "live" ? <LiveDot /> : null}
                {item.label}
                <span className="count-badge">{counts[item.key]}</span>
              </button>
            );
          })}
        </div>

        <div className="no-scrollbar mt-2.5 flex gap-1 overflow-x-auto">
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
                className="chip-filter !h-7"
                data-active={active ? "true" : undefined}
              >
                {item}
                <span className="count-badge">{categoryCount(item)}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setFollowing((value) => !value)}
            disabled={!favorites.hydrated}
            aria-pressed={following}
            className="chip-filter !h-7 inline-flex items-center gap-1.5"
            data-active={following ? "true" : undefined}
          >
            <Heart className={cn("h-3 w-3", following && "fill-current")} />
            Following
          </button>
        </div>

        <div className="mt-4 pb-4">
          {groups.length === 0 ? (
            <div className="blk px-5 py-8 text-center text-[12px] text-muted">
              {following && !favorites.hasFavorites
                ? "Follow a team or series to build your own list."
                : `No ${tab === "all" ? "" : tab === "completed" ? "results " : `${tab} `}matches${query.trim() ? ` for “${query.trim()}”` : ""}.`}
              {tab !== "all" && counts.all > 0 ? (
                <button
                  type="button"
                  onClick={() => setTab("all")}
                  className="mt-2 block w-full text-[11px] font-extrabold uppercase tracking-[0.08em] text-accent"
                >
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
                <section key={group.key} aria-label={group.name} className="mt-5 first:mt-0">
                  <div className="mb-1.5 flex items-baseline gap-2 border-b-2 border-slab pb-1">
                    {group.seriesId ? (
                      <Link
                        href={`/series/${group.seriesId}`}
                        className="min-w-0 flex-1 truncate text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent hover:text-ink"
                      >
                        {group.name}
                      </Link>
                    ) : (
                      <span className="min-w-0 flex-1 truncate text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent">
                        {group.name}
                      </span>
                    )}
                    <span className="dnum shrink-0 text-[12px] text-faint">
                      {group.matches.length}
                    </span>
                  </div>
                  <div className="border-t border-line-strong">
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
                      className="mt-1 flex w-full items-center justify-center gap-1 border-t border-line py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-faint hover:text-accent"
                    >
                      {open ? "Show fewer" : `${group.matches.length - COLLAPSE_AFTER} more`}
                      <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
                    </button>
                  ) : null}
                </section>
              );
            })
          )}
        </div>
      </aside>
    </div>
    </>
  );
}

/**
 * The list item is a ruled row, not a card: hairline top, leader dots carrying
 * the eye to the figure, and the selected row filled by the Klein slab.
 */
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
      data-hot={active ? "" : undefined}
      data-live={live ? "" : undefined}
      className="hrow tile !px-2.5 text-left"
    >
      <div className="flex items-center gap-2">
        <span className="tile-dim text-[9px] font-extrabold uppercase tracking-[0.1em] text-muted">
          {matchFormat(match)}
        </span>
        <span className="tile-mute min-w-0 flex-1 truncate text-[10px] uppercase tracking-[0.04em] text-muted">
          {match.description}
        </span>
        {live ? (
          <span className="tile-live inline-flex shrink-0 items-center gap-1 bg-live px-1 text-[9px] font-extrabold uppercase leading-[15px] tracking-[0.1em] text-[#0a1400]">
            <span className="tile-dot h-[5px] w-[5px] rounded-full bg-[#0a1400] animate-pulse-dot" />
            Live
          </span>
        ) : (
          <span className="tile-mute shrink-0 text-[9px] font-bold uppercase tracking-[0.1em] text-faint" suppressHydrationWarning>
            {match.state === "upcoming" ? upcomingLine(match) : "Result"}
          </span>
        )}
      </div>

      <div className="mt-2">
        {match.teams.map((team) => {
          const score = teamScoreText(match, team);
          const batting = live && match.currentBattingTeamId === team.id;
          const winner = match.state === "completed" && match.winnerTeamId === team.id;
          const plain = score === "—" || score === "Yet to bat";

          return (
            <div
              key={team.id}
              className="tile-rule flex items-baseline gap-2 border-t border-line py-1 first:border-t-0"
            >
              <TeamBadge team={team} size={16} className="self-center" />
              <span className="tile-ink shrink-0 text-[13px] font-extrabold uppercase leading-none tracking-[-0.03em] text-ink">
                {team.shortName}
                {batting ? (
                  <span className="tile-dot ml-1 inline-block h-[5px] w-[5px] rounded-full bg-live align-middle" />
                ) : null}
              </span>
              <span className="leaders" />
              <span
                className={cn(
                  "tile-ink dnum shrink-0 text-right !text-[14px]",
                  plain && "text-[10px] font-medium tile-mute",
                  winner && "underline decoration-2 underline-offset-4"
                )}
              >
                {plain ? (score === "—" ? "—" : "Yet to bat") : score.replace("/", "-")}
              </span>
            </div>
          );
        })}
      </div>

      <p
        className="tile-mute mt-1.5 truncate text-[11px] text-muted"
        suppressHydrationWarning
      >
        {match.state === "upcoming" ? match.venue?.city ?? "" : matchStatusText(match)}
      </p>
    </button>
  );
}

export type { StateTab };
