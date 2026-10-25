"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  Heart,
  Radio,
  RefreshCw,
  Search,
  Trophy,
  X,
} from "lucide-react";
import type { HomeFeed as HomeFeedData, MatchCategory } from "@/lib/types";
import { groupMatchesBySeries } from "@/lib/match-display";
import { formatDate, timeAgo, cn } from "@/lib/utils";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useToast } from "@/components/providers/toast-provider";
import { MatchCard } from "@/components/match-card";
import { FallingBall } from "@/components/falling-ball";
import { FeaturedMatch } from "@/components/home/featured-match";
import { EmptyState } from "@/components/ui/empty-state";
import { LiveDot } from "@/components/ui/pills";
import { buttonClass } from "@/components/ui/button";

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
  "Domestic",
  "Women",
];

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
  const [teamFilter, setTeamFilter] = useState<number | null>(
    initialTeamId ?? null
  );
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

  const followingBase = feed.matches.filter(
    (match) => !following || favorites.isMatchFollowed(match)
  );
  const teamBase = teamFilter
    ? followingBase.filter((match) =>
        match.teams.some((team) => team.id === teamFilter)
      )
    : followingBase;
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
  const selectedTeam = teamFilter
    ? feed.matches
        .flatMap((match) => match.teams)
        .find((team) => team.id === teamFilter)
    : undefined;
  const liveCount = feed.matches.filter((match) => match.state === "live").length;

  const categoryCount = (value: MatchCategory) =>
    value === "All"
      ? teamBase.length
      : teamBase.filter((match) => match.matchType === value).length;

  function clearTeamFilter() {
    setTeamFilter(null);
    if (initialTeamId && typeof window !== "undefined") {
      window.history.replaceState(null, "", "/");
    }
  }

  function emptyState() {
    if (following && !favorites.hasFavorites) {
      return (
        <EmptyState
          icon={<Heart className="h-5 w-5" />}
          title="Build your own card"
          description="Follow a team or series and their matches will appear here, across formats and tours."
          actionHref="/search"
          actionLabel="Find a team"
        />
      );
    }
    if (teamFilter) {
      return (
        <EmptyState
          icon={<Search className="h-5 w-5" />}
          title={`No ${tab === "all" ? "" : `${tab} `}matches for ${
            selectedTeam?.shortName ?? "this team"
          }`}
          description="Try another tab, or clear the team filter to see everything on right now."
          action={
            <button
              type="button"
              onClick={clearTeamFilter}
              className={buttonClass({ variant: "primary", size: "sm" })}
            >
              Clear team filter
            </button>
          }
        />
      );
    }
    if (tab === "live") {
      return (
        <EmptyState
          icon={<Radio className="h-5 w-5" />}
          title="No live matches right now"
          description={
            counts.upcoming
              ? `${counts.upcoming} match${counts.upcoming === 1 ? "" : "es"} coming up. Settle in for the next one.`
              : "The field is quiet. Check results, or come back at the next toss."
          }
          action={
            counts.upcoming > 0 ? (
              <button
                type="button"
                onClick={() => setTab("upcoming")}
                className={buttonClass({ variant: "primary", size: "sm" })}
              >
                See upcoming matches
              </button>
            ) : (
              <Link
                href="/series"
                className={buttonClass({ variant: "primary", size: "sm" })}
              >
                Browse series
              </Link>
            )
          }
        />
      );
    }
    if (tab === "upcoming") {
      return (
        <EmptyState
          icon={<CalendarDays className="h-5 w-5" />}
          title="Nothing on the schedule"
          description="No upcoming matches in this view. Try another category or check the results."
          action={
            <button
              type="button"
              onClick={() => setTab("all")}
              className={buttonClass({ variant: "primary", size: "sm" })}
            >
              Show all matches
            </button>
          }
        />
      );
    }
    if (tab === "completed") {
      return (
        <EmptyState
          icon={<CheckCheck className="h-5 w-5" />}
          title="No results yet"
          description="Completed matches will collect here with full scorecards."
          action={
            <button
              type="button"
              onClick={() => setTab("all")}
              className={buttonClass({ variant: "primary", size: "sm" })}
            >
              Show all matches
            </button>
          }
        />
      );
    }
    return (
      <EmptyState
        icon={<Trophy className="h-5 w-5" />}
        title="No matches in this view"
        description="Try a different category, or clear your filters to see the full feed."
      />
    );
  }

  const featured =
    feed.matches.find(
      (match) => match.state === "live" && match.innings.length > 0
    ) ??
    feed.matches.find((match) => match.state === "live") ??
    feed.matches.find((match) => match.state === "upcoming");

  return (
    <div>
      <section className="grain relative mt-5 overflow-hidden border border-panel-ink/20 bg-panel text-panel-ink">
        <FallingBall className="absolute -right-24 -top-32 z-0 hidden h-[640px] w-[640px] text-panel-ink opacity-20 sm:block" />
        <div className="relative z-10 grid xl:grid-cols-[minmax(0,1.02fr)_minmax(330px,0.78fr)]">
          <div className="flex flex-col justify-between px-5 py-6 sm:px-8 sm:py-10">
            <div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-panel-ink/80">
                  {formatDate(feed.updatedAt, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
                <span className="hidden h-3 w-px bg-panel-ink/30 sm:block" />
                <span className="hidden font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-panel-muted sm:inline">
                  Live from around the world
                </span>
              </div>

              <h1 className="display mt-4 max-w-[680px] text-[clamp(2.25rem,7vw,5.9rem)] uppercase leading-[0.88] sm:mt-6">
                The day&apos;s
                <span className="block">cricket.</span>
              </h1>

              <p className="mt-6 hidden max-w-md text-sm font-medium leading-relaxed text-panel-ink/75 sm:block">
                Live scores, full scorecards and the day&apos;s results from
                around the world.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mt-8">
              <span className="inline-flex h-10 items-center gap-2 bg-panel-ink px-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-panel">
                <LiveDot />
                {liveCount ? `${liveCount} live` : `${counts.upcoming} upcoming`}
              </span>
              <span
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-panel-muted"
                suppressHydrationWarning
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    stale ? "bg-warn" : "bg-panel-ink"
                  )}
                />
                {stale ? "Reconnecting" : `Updated ${timeAgo(feed.updatedAt)}`}
              </span>
              <button
                type="button"
                onClick={() => void refresh(false)}
                disabled={refreshing}
                aria-label="Refresh matches"
                className="ml-auto grid h-10 w-10 place-items-center border border-panel-ink/30 text-panel-ink/80 transition-colors duration-150 hover:border-panel-ink hover:text-panel-ink disabled:opacity-50 sm:ml-0"
              >
                <RefreshCw
                  className={cn(
                    "h-3.5 w-3.5",
                    refreshing && "animate-spin"
                  )}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-panel-ink/20 px-4 py-4 sm:px-5 sm:py-5 xl:border-l xl:border-t-0">
            {featured ? (
              <FeaturedMatch match={featured} />
            ) : (
              <div className="flex h-full min-h-44 flex-col justify-center border-[5px] border-panel-ink bg-bg p-5 text-ink">
                <span className="eyebrow">Quiet field</span>
                <p className="mt-2 max-w-xs text-sm font-semibold leading-snug text-muted">
                  No live match on the board. The next one will land here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-line bg-surface p-2.5 sm:p-3">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
          <div
            className="grid grid-cols-4 gap-0.5 rounded-lg border border-line bg-surface2 p-0.5"
            role="tablist"
            aria-label="Match state"
          >
            {STATE_TABS.map((item) => {
              const active = tab === item.key;
              const count = counts[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-active={active}
                  data-live={item.key === "live"}
                  onClick={() => setTab(item.key)}
                  className="segmented-item h-auto w-full flex-col-reverse gap-0.5 px-1 py-2 text-[11px] sm:h-10 sm:flex-row sm:gap-2 sm:px-3 sm:py-0 sm:text-xs"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {item.key === "live" ? (
                      <LiveDot className="bg-current" />
                    ) : null}
                    {item.label}
                  </span>
                  <span className="count-badge" data-active={active}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden items-center gap-2 xl:ml-auto xl:flex">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.12em] text-faint"
              suppressHydrationWarning
            >
              {stale ? "Offline · showing last update" : "Live feed connected"}
            </span>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                stale ? "bg-warn" : "bg-win animate-pulse-dot"
              )}
            />
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-1.5 border-t border-line pt-2.5">
          <span className="eyebrow hidden shrink-0 pl-1 pr-1 sm:inline">Type</span>
          <div className="hidden flex-wrap items-center gap-1.5 sm:flex">
            {CATEGORIES.map((item) => {
              const active = category === item;
              const count = categoryCount(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={active}
                  data-active={active}
                  className="chip-filter"
                >
                  {item}
                  <span className="font-mono text-[10px] font-medium tabular-nums opacity-60">
                    {count}
                  </span>
                </button>
              );
            })}
            <span className="h-4 w-px shrink-0 bg-line" />
          </div>
          <label className="relative min-w-0 sm:hidden">
            <span className="sr-only">Match type</span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as MatchCategory)
              }
              className="h-10 max-w-[170px] appearance-none truncate rounded-md border border-line bg-surface pl-3 pr-8 text-xs font-bold text-ink"
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item} ({categoryCount(item)})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
          </label>
          <button
            type="button"
            onClick={() => setFollowing((value) => !value)}
            disabled={!favorites.hydrated}
            role="switch"
            aria-checked={following}
            data-active={following}
            className="chip-filter chip-follow disabled:opacity-50"
          >
            <span
              aria-hidden="true"
              className={cn(
                "relative h-3.5 w-6 rounded-full transition-colors duration-200",
                following ? "bg-bg/25" : "bg-line-strong/50"
              )}
            >
              <span
                className={cn(
                  "absolute left-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-surface shadow-sm transition-transform duration-200",
                  following && "translate-x-2.5"
                )}
              />
            </span>
            <Heart
              className={cn("h-3 w-3", following && "fill-current")}
            />
            Following
            {favorites.hasFavorites ? (
              <span className="font-mono text-[10px] font-medium opacity-60">
                {favorites.teams.length + favorites.series.length}
              </span>
            ) : null}
          </button>
        </div>
      </section>

      {teamFilter ? (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-accent/25 bg-accent-soft/70 px-3.5 py-2.5">
          <span className="text-[12px] text-muted">
            Showing matches for{" "}
            <strong className="font-bold text-ink">
              {selectedTeam?.name ?? `team #${teamFilter}`}
            </strong>
          </span>
          <button
            type="button"
            onClick={clearTeamFilter}
            className="ml-auto flex shrink-0 items-center gap-1 rounded border border-line bg-surface px-2.5 py-1 text-[10px] font-bold text-muted transition-colors hover:text-accent"
          >
            Clear
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}

      <div className="mt-7">
        {groups.length === 0 ? (
          emptyState()
        ) : (
          <div className="stagger space-y-8">
            {groups.map((group) => (
              <section key={group.key} aria-label={group.name}>
                <div className="flex items-start gap-3 border-b border-line-strong pb-3">
                  <div className="min-w-0 flex-1">
                    {group.seriesId ? (
                      <Link
                        href={`/series/${group.seriesId}`}
                        className="display block text-[19px] font-bold leading-snug tracking-[-0.02em] [text-wrap:balance] transition-colors hover:text-accent sm:text-[22px]"
                      >
                        {group.name}
                      </Link>
                    ) : (
                      <span className="display block text-[19px] font-bold leading-snug tracking-[-0.02em] [text-wrap:balance] sm:text-[22px]">
                        {group.name}
                      </span>
                    )}
                    <p className="mt-1.5 flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-faint">
                      <span>
                        {group.matches.length}{" "}
                        {group.matches.length === 1 ? "match" : "matches"}
                      </span>
                      {group.live > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-live">
                          <LiveDot />
                          {group.live} live
                        </span>
                      ) : null}
                    </p>
                  </div>
                  {group.seriesId ? (
                    <Link
                      href={`/series/${group.seriesId}`}
                      aria-label={`View ${group.name}`}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded border border-line bg-surface text-faint transition-colors duration-150 hover:border-accent hover:text-accent"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)]">
                  {group.matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export type { StateTab };
