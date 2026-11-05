"use client";

import { useState } from "react";
import type { MatchSummary, SeriesInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { matchFormat, matchStatusText, teamOversText, teamScoreText } from "@/lib/match-display";
import { formatTime } from "@/lib/utils";
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
      <div className="flex gap-1.5" role="tablist" aria-label="Match state">
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
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-colors",
              filter === key ? "bg-accent text-accent-ink" : "bg-surface text-muted hover:text-ink"
            )}
          >
            {label}
            <span className="tnum text-[12px] opacity-70">{counts[key]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="Nothing here"
          description="No matches in this view yet."
          className="mt-4"
        />
      ) : (
        <div className="mt-5 space-y-7">
          {visible.map((group, index) => (
            <section key={`${group.label}-${index}`}>
              <div className="flex items-baseline gap-2">
                <h2 className="font-display text-[17px] font-bold">{group.label}</h2>
                <span className="text-xs text-faint">
                  {group.matches.length}{" "}
                  {group.matches.length === 1 ? "match" : "matches"}
                </span>
              </div>
              <div className="mt-3 space-y-2.5">
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
          <p className="text-xs text-faint">
            Showing {shown} of {total}
          </p>
          {limit < total ? (
            <button
              type="button"
              onClick={() => setLimit((value) => value + PAGE)}
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-full bg-surface px-6 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-surface2"
              )}
            >
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
      className={cn(
        "group grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl p-3 transition-colors sm:grid-cols-[64px_minmax(0,1fr)_minmax(0,220px)_auto] sm:gap-5 sm:p-4",
        live ? "bg-gradient-to-r from-[#0f2a8a] to-[#2a5cff] text-white" : "bg-surface hover:bg-surface2"
      )}
    >
      <div
        className={cn(
          "flex h-14 flex-col items-center justify-center rounded-xl sm:h-16",
          live ? "bg-white/15" : "bg-surface2"
        )}
        suppressHydrationWarning
      >
        <span className={cn("text-[11px] font-semibold uppercase", live ? "text-white/70" : "text-faint")}>
          {date.toLocaleDateString("en-IN", { month: "short" })}
        </span>
        <span className="tnum font-display text-[22px] font-bold leading-none">{date.getDate()}</span>
      </div>

      <div className="min-w-0 space-y-1.5">
        {match.teams.map((team) => {
          const score = teamScoreText(match, team);
          const overs = teamOversText(match, team);
          const winner = done && match.winnerTeamId === team.id;
          return (
            <div key={team.id} className="flex min-w-0 items-center gap-2.5">
              <TeamBadge team={team} size={26} />
              <span className={cn("min-w-0 flex-1 truncate text-[14px] font-semibold", winner && !live && "text-win")}>
                <span className="sm:hidden">{team.shortName}</span>
                <span className="hidden sm:inline">{team.name}</span>
              </span>
              {score !== "—" && score !== "Yet to bat" ? (
                <span className="tnum shrink-0 text-[15px] font-bold">
                  {score}
                  {overs ? <span className={cn("ml-1 text-[11px] font-normal", live ? "text-white/60" : "text-faint")}>({overs.replace(" ov", "")})</span> : null}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="col-span-3 min-w-0 sm:col-span-1">
        <p className={cn("text-[12px] font-medium", live ? "text-white/70" : "text-faint")}>
          {matchFormat(match)} · {match.description}
        </p>
        <p
          className={cn(
            "mt-0.5 line-clamp-2 text-[13px] font-semibold",
            live ? "text-white" : done ? "text-win" : "text-ink"
          )}
          suppressHydrationWarning
        >
          {live ? (
            <span className="mr-1.5 inline-flex items-center gap-1 text-[#4ade80]">
              <LiveDot className="bg-[#4ade80]" />
              LIVE
            </span>
          ) : null}
          {match.state === "upcoming" ? `${formatTime(match.startTime)} · ${match.venue?.city ?? ""}` : matchStatusText(match)}
        </p>
      </div>

      <ChevronRight
        className={cn(
          "row-start-1 hidden h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 sm:col-start-4 sm:block",
          live ? "text-white/70" : "text-faint"
        )}
      />
    </Link>
  );
}
