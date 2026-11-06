"use client";

import { useState } from "react";
import type { MatchSummary, SeriesInfo } from "@/lib/types";
import { cn, formatTime, pad } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { matchFormat, matchStatusText, teamOversText, teamScoreText } from "@/lib/match-display";
import { LiveDot } from "@/components/ui/pills";
import { TeamBadge } from "@/components/ui/team-badge";
import { EmptyState } from "@/components/ui/empty-state";

type Filter = "upcoming" | "completed" | "all";

const PAGE = 12;

function matchesFilter(match: MatchSummary, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "upcoming") return match.state !== "completed";
  return match.state === "completed";
}

export function SeriesMatches({
  groups,
}: {
  groups: SeriesInfo["matchGroups"];
}) {
  const all = groups.flatMap((group) => group.matches);
  const hasOpen = all.some((match) => match.state !== "completed");
  const [filter, setFilter] = useState<Filter>(hasOpen ? "upcoming" : "completed");
  const [limit, setLimit] = useState(PAGE);

  const counts = {
    upcoming: all.filter((match) => match.state !== "completed").length,
    completed: all.filter((match) => match.state === "completed").length,
    all: all.length,
  };

  const visible: { label: string; matches: MatchSummary[] }[] = [];
  let used = 0;
  for (const group of groups) {
    const matches = group.matches.filter((match) => matchesFilter(match, filter));
    if (matches.length === 0 || used >= limit) continue;
    const slice = matches.slice(0, limit - used);
    used += slice.length;
    visible.push({ label: group.label, matches: slice });
  }

  const total = counts[filter];
  const shown = limit >= total ? total : limit;

  function select(next: Filter) {
    setFilter(next);
    setLimit(PAGE);
  }

  if (all.length === 0) {
    return (
      <EmptyState
        title="No matches yet"
        description="The schedule has not been published."
        className="mt-4"
      />
    );
  }

  return (
    <div className="mt-4">
      <div
        className="no-scrollbar flex min-w-0 gap-0 overflow-x-auto border-b border-line"
        role="tablist"
        aria-label="Match state"
      >
        {(
          [
            ["upcoming", "Live & upcoming"],
            ["completed", "Results"],
            ["all", "All"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            data-active={filter === key}
            onClick={() => select(key)}
            className="tab-link -mb-px"
          >
            {label}
            <span className="count-badge">{counts[key]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="Nothing here" description="No matches in this view yet." className="mt-4" />
      ) : (
        <div className="mt-6 space-y-8">
          {visible.map((group, index) => (
            <section key={`${group.label}-${index}`} data-rv style={{ "--gd": `${index * 60}ms` } as React.CSSProperties}>
              <div className="flex items-baseline gap-2 border-b-2 border-slab pb-1.5">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
                  {group.label}
                </h2>
                <span className="ml-auto tnum text-[11px] text-faint">
                  {pad(group.matches.length)} {group.matches.length === 1 ? "match" : "matches"}
                </span>
              </div>
              <div>
                {group.matches.map((match) => (
                  <FixtureRow key={match.id} match={match} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {total > PAGE ? (
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="tnum text-[11px] uppercase tracking-[0.1em] text-faint">
            Showing {shown} of {total}
          </p>
          {limit < total ? (
            <button type="button" onClick={() => setLimit((value) => value + PAGE)} className="btn-ghost">
              Show {Math.min(PAGE, total - limit)} more
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FixtureRow({ match }: { match: MatchSummary }) {
  const live = match.state === "live";
  const done = match.state === "completed";
  const date = new Date(match.startTime);
  return (
    <Link
      href={`/match/${match.id}`}
      data-hot={live ? "" : undefined}
      className={cn(
        "hrow tile group grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3",
        "sm:grid-cols-[42px_minmax(0,1fr)_minmax(0,230px)_28px] sm:gap-4"
      )}
    >
      <div className="flex flex-col items-center gap-0.5 tile-rule border-r pr-2" suppressHydrationWarning>
        <span className="text-[9px] font-bold uppercase tracking-[0.1em] tile-dim text-faint">
          {date.toLocaleDateString("en-IN", { month: "short" })}
        </span>
        <span className="text-[19px] font-extrabold leading-none tracking-[-0.03em] tnum">
          {pad(date.getDate())}
        </span>
      </div>

      <div className="min-w-0 space-y-1">
        {match.teams.map((team) => {
          const score = teamScoreText(match, team);
          const overs = teamOversText(match, team);
          const winner = done && match.winnerTeamId === team.id;
          return (
            <div key={team.id} className="flex min-w-0 items-center gap-2">
              <TeamBadge team={team} size={22} />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[13px] font-bold",
                  winner && !live && "text-win"
                )}
              >
                <span className="sm:hidden">{team.shortName}</span>
                <span className="hidden sm:inline">{team.name}</span>
              </span>
              {score !== "—" && score !== "Yet to bat" ? (
                <span className="dnum shrink-0 !text-[14px]">
                  {score}
                  {overs ? (
                    <span className="ml-1 text-[10px] font-medium tile-dim text-faint">
                      {overs.replace(" ov", "")}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="col-span-3 min-w-0 sm:col-span-1">
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.08em] tile-dim text-faint">
          {matchFormat(match)}
        </p>
        <p
          className="mt-0.5 line-clamp-2 text-[12px] font-semibold tile-dim text-muted"
          suppressHydrationWarning
        >
          {live ? (
            <span className="mr-1.5 inline-flex items-center gap-1 align-middle text-live">
              <LiveDot className="tile-dot bg-live" />
              LIVE
            </span>
          ) : null}
          {match.state === "upcoming"
            ? `${formatTime(match.startTime)} · ${match.venue?.city ?? ""}`
            : matchStatusText(match)}
        </p>
      </div>

      <ChevronRight className="row-start-1 hidden h-4 w-4 shrink-0 tile-dim text-faint transition-transform group-hover:translate-x-0.5 sm:col-start-4 sm:block" />
    </Link>
  );
}
