"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCheck,
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
      <section className="hero-shell mt-4 overflow-hidden rounded-[1.75rem] border border-line p-5 sm:p-7">
        <div className="relative grid items-end gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(290px,0.9fr)]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow-chip bg-surface/75">
                {formatDate(feed.updatedAt, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <span className="eyebrow-chip hidden bg-surface/60 sm:inline-flex">
                Est. 2026
              </span>
            </div>

            <h1 className="display mt-4 max-w-[720px] text-[clamp(3rem,8.2vw,5.2rem)] font-medium leading-[0.9] tracking-[-0.045em] sm:mt-5">
              The day&apos;s <em className="italic text-accent">play.</em>
            </h1>

            <p className="mt-4 max-w-md text-[13px] font-medium leading-relaxed text-muted sm:text-sm">
              Every match, every ball. Live scores, full scorecards and the
              day&apos;s cricket in one place.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex h-9 items-center gap-2 rounded-full bg-live px-3.5 text-[11px] font-extrabold text-white">
                <LiveDot className="bg-white" />
                {liveCount ? `${liveCount} live` : `${counts.upcoming} upcoming`}
              </span>
              <span
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-faint"
                suppressHydrationWarning
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    stale ? "bg-warn" : "bg-win"
                  )}
                />
                {stale ? "Reconnecting" : `Updated ${timeAgo(feed.updatedAt)}`}
              </span>
              <button
                type="button"
                onClick={() => void refresh(false)}
                disabled={refreshing}
                aria-label="Refresh matches"
                className="group grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-muted transition-colors duration-150 hover:border-accent hover:text-accent disabled:opacity-50"
              >
                <RefreshCw
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    refreshing ? "animate-spin" : "group-hover:rotate-45"
                  )}
                />
              </button>
            </div>
          </div>

          {featured ? (
            <FeaturedMatch match={featured} />
          ) : (
            <div className="rounded-2xl border border-line bg-surface/70 p-5">
              <span className="eyebrow-chip">Quiet field</span>
              <p className="mt-3 text-sm font-semibold leading-snug text-muted">
                No live match on the board. The next one will land here.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-line bg-surface p-2.5 sm:mt-4 sm:p-3">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
          <div
            className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-surface2/80 p-1 sm:grid-cols-4"
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
                  className="segmented-item w-full justify-between px-3 sm:justify-center sm:px-2.5"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {item.key === "live" ? (
                      <LiveDot className="bg-current" />
                    ) : null}
                    {item.label}
                  </span>
                  <span
                    className="count-badge"
                    data-active={active}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden items-center gap-2 xl:ml-auto xl:flex">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.1em] text-faint"
              suppressHydrationWarning
            >
              {stale ? "Offline · showing last update" : "Live feed connected"}
            </span>
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                stale ? "bg-warn" : "bg-win animate-pulse-dot"
              )}
            />
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-line pt-2.5">
          <span className="eyebrow shrink-0 pl-1">Filter</span>
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
                <span
                  className="text-[9px] font-extrabold tabular-nums opacity-65"
                >
                  {count}
                </span>
              </button>
            );
          })}
          <span className="h-5 w-px shrink-0 bg-line" />
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
                "relative h-4 w-7 rounded-full transition-colors duration-200",
                following ? "bg-white/30" : "bg-line-strong/60"
              )}
            >
              <span
                className={cn(
                  "absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200",
                  following && "translate-x-3"
                )}
              />
            </span>
            <Heart
              className={cn("h-3.5 w-3.5", following && "fill-current")}
            />
            Following
            {favorites.hasFavorites ? (
              <span className="text-[9px] font-extrabold tabular-nums opacity-65">
                {favorites.teams.length + favorites.series.length}
              </span>
            ) : null}
          </button>
        </div>
      </section>

      {teamFilter ? (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/[0.055] px-3.5 py-2.5">
          <span className="text-[12px] text-muted">
            Showing matches for{" "}
            <strong className="font-extrabold text-ink">
              {selectedTeam?.name ?? `team #${teamFilter}`}
            </strong>
          </span>
          <button
            type="button"
            onClick={clearTeamFilter}
            className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-surface px-2.5 py-1.5 text-[10px] font-bold text-muted shadow-sm transition-colors hover:text-accent"
          >
            Clear
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}

      <div className="mt-5 sm:mt-6">
        {groups.length === 0 ? (
          emptyState()
        ) : (
          <div className="stagger space-y-7">
            {groups.map((group) => (
              <section key={group.key} aria-label={group.name}>
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                    <Trophy className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    {group.seriesId ? (
                      <Link
                        href={`/series/${group.seriesId}`}
                        title={group.name}
                        className="block truncate text-[16px] font-extrabold leading-tight tracking-[-0.02em] transition-colors hover:text-accent sm:text-[19px]"
                      >
                        {group.name}
                      </Link>
                    ) : (
                      <span
                        title={group.name}
                        className="block truncate text-[16px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[19px]"
                      >
                        {group.name}
                      </span>
                    )}
                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-faint">
                      {group.matches.length}{" "}
                      {group.matches.length === 1 ? "match" : "matches"}
                    </p>
                  </div>
                  {group.live > 0 ? (
                    <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-live/10 px-2 text-[9px] font-extrabold uppercase tracking-[0.08em] text-live">
                      <LiveDot />
                      {group.live} live
                    </span>
                  ) : null}
                  {group.seriesId ? (
                    <Link
                      href={`/series/${group.seriesId}`}
                      aria-label={`View ${group.name}`}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface2 text-faint transition-all duration-200 hover:bg-accent hover:text-accent-ink"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>
                <div className="mt-2.5 grid gap-2">
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
