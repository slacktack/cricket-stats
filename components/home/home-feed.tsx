"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
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

  return (
    <div>
      <section className="border-b-2 border-line-strong pb-6 pt-5 sm:pb-8 sm:pt-7">
        <div className="flex items-baseline justify-between gap-4">
          <p className="eyebrow">
            {formatDate(feed.updatedAt, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <p className="eyebrow hidden sm:block">Est. 2026</p>
        </div>
        <h1 className="display mt-4 max-w-[720px] text-[clamp(3.1rem,8.5vw,5.35rem)] font-medium leading-[0.9] tracking-[-0.045em] sm:mt-5">
          The day&apos;s <em className="italic text-accent">play.</em>
        </h1>
        <div className="mt-5 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-[12px] leading-relaxed text-muted sm:text-[13px]">
            Every match, every ball. Live scores, full scorecards and the day&apos;s
            cricket in one place.
          </p>
          <div className="flex shrink-0 items-center gap-4">
            <span className="mono flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-live">
              <LiveDot />
              {liveCount
                ? `${liveCount} live`
                : `${counts.upcoming} upcoming`}
            </span>
            <span
              className="mono text-[8px] uppercase tracking-[0.12em] text-faint"
              suppressHydrationWarning
            >
              {stale ? "Reconnecting" : `Updated ${timeAgo(feed.updatedAt)}`}
            </span>
          </div>
        </div>
      </section>

      <div className="mt-5 flex items-center gap-5 overflow-x-auto border-b border-line no-scrollbar">
        <div
          className="flex shrink-0 items-center gap-4 sm:gap-6"
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
                onClick={() => setTab(item.key)}
                className={cn(
                  "relative flex min-h-[45px] shrink-0 items-baseline gap-1.5 pb-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors",
                  active ? "text-ink" : "text-muted hover:text-ink"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "mono text-[8px] font-normal tnum",
                    active ? "text-accent" : "text-faint"
                  )}
                >
                  {count}
                </span>
                {active ? (
                  <span className="absolute inset-x-0 -bottom-px h-[2px] bg-accent" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3 pb-2.5">
          <span
            className="mono hidden items-center gap-1.5 text-[8px] uppercase tracking-[0.12em] text-faint md:flex"
            suppressHydrationWarning
          >
            {stale ? (
              <span className="text-warn">Offline</span>
            ) : (
              <>
                <span className="h-1 w-1 rounded-[1px] bg-win" />
                {timeAgo(feed.updatedAt)}
              </>
            )}
          </span>
          <button
            type="button"
            onClick={() => void refresh(false)}
            disabled={refreshing}
            aria-label="Refresh matches"
            className="grid h-9 w-9 place-items-center border border-line text-muted transition-colors hover:border-line-strong hover:text-ink disabled:opacity-50"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
            />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto border-b border-line py-2.5 no-scrollbar">
        <span className="eyebrow shrink-0">Filter</span>
        {CATEGORIES.map((item) => {
          const active = category === item;
          const count = categoryCount(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={active}
              className={cn(
                "mono flex shrink-0 items-center gap-1.5 text-[8px] font-medium uppercase tracking-[0.12em] transition-colors",
                active ? "text-accent" : "text-muted hover:text-ink"
              )}
            >
              {item}
              <span className="text-[7px] text-faint tnum">{count}</span>
            </button>
          );
        })}
        <span className="h-3 w-px shrink-0 bg-line" />
        <button
          type="button"
          onClick={() => setFollowing((value) => !value)}
          disabled={!favorites.hydrated}
          aria-pressed={following}
          className={cn(
            "mono flex shrink-0 items-center gap-1.5 text-[8px] font-medium uppercase tracking-[0.12em] transition-colors disabled:opacity-50",
            following ? "text-accent" : "text-muted hover:text-ink"
          )}
        >
          <Heart className={cn("h-3 w-3", following && "fill-current")} />
          Following
          {favorites.hasFavorites ? (
            <span className="text-[7px] text-faint tnum">
              {favorites.teams.length + favorites.series.length}
            </span>
          ) : null}
        </button>
      </div>

      {teamFilter ? (
        <div className="mt-4 flex items-center gap-3 border-l-2 border-accent bg-accent/[0.04] px-3 py-2.5">
          <span className="text-[11px] text-muted">
            Showing matches for{" "}
            <strong className="font-semibold text-ink">
              {selectedTeam?.name ?? `team #${teamFilter}`}
            </strong>
          </span>
          <button
            type="button"
            onClick={clearTeamFilter}
            className="mono ml-auto flex shrink-0 items-center gap-1 text-[8px] font-medium uppercase tracking-[0.12em] text-muted transition-colors hover:text-accent"
          >
            Clear
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}

      <div className="mt-6">
        {groups.length === 0 ? (
          emptyState()
        ) : (
          <div className="space-y-9">
            {groups.map((group) => (
              <section key={group.key} aria-label={group.name}>
                <div className="flex items-baseline gap-2.5">
                  {group.seriesId ? (
                    <Link
                      href={`/series/${group.seriesId}`}
                      title={group.name}
                      className="display min-w-0 truncate text-[20px] font-medium leading-tight tracking-[-0.02em] transition-colors hover:text-accent sm:text-[22px]"
                    >
                      {group.name}
                    </Link>
                  ) : (
                    <span
                      title={group.name}
                      className="display min-w-0 truncate text-[20px] font-medium leading-tight tracking-[-0.02em] sm:text-[22px]"
                    >
                      {group.name}
                    </span>
                  )}
                  {group.live > 0 ? (
                    <span className="mono flex shrink-0 items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-live">
                      <LiveDot />
                      {group.live} live
                    </span>
                  ) : null}
                  <span className="mono ml-auto shrink-0 text-[8px] uppercase tracking-[0.1em] text-faint">
                    {group.matches.length}{" "}
                    {group.matches.length === 1 ? "match" : "matches"}
                  </span>
                </div>
                <div className="mt-1.5 border-t border-line-strong">
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
