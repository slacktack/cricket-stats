"use client";

import { useState } from "react";
import type { MatchSummary, SeriesInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MatchCard } from "@/components/match-card";
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
      <div className="segmented grid grid-cols-3" role="tablist" aria-label="Match state">
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
            className="segmented-item h-auto w-full flex-col-reverse gap-0.5 px-1 py-2 sm:h-10 sm:flex-row sm:gap-2 sm:py-0"
          >
            <span>{label}</span>
            <span className="count-badge" data-active={filter === key}>
              {counts[key]}
            </span>
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
              <div className="flex items-baseline gap-2 border-b border-line-strong pb-2">
                <h2 className="text-[15px] font-bold">{group.label}</h2>
                <span className="text-xs text-faint">
                  {group.matches.length}{" "}
                  {group.matches.length === 1 ? "match" : "matches"}
                </span>
              </div>
              <div>
                {group.matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
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
                "inline-flex h-11 items-center justify-center rounded-md border border-line-strong bg-surface px-6 text-sm font-bold text-ink transition-colors duration-150 hover:border-accent hover:text-accent"
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
