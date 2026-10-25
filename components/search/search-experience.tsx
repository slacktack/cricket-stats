"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { SearchIndex } from "@/lib/types";
import { querySearchIndex } from "@/lib/search";
import { cn } from "@/lib/utils";
import { MatchCard } from "@/components/match-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormatPill } from "@/components/ui/pills";
import { PlayerAvatar, TeamBadge } from "@/components/ui/team-badge";

type Filter = "all" | "players" | "teams" | "matches" | "series";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "players", label: "Players" },
  { key: "teams", label: "Teams" },
  { key: "matches", label: "Matches" },
  { key: "series", label: "Series" },
];

function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center gap-2 border-b border-line pb-2">
      <h2 className="text-sm font-bold">{children}</h2>
      {count !== undefined ? <span className="text-[11px] text-faint">{count}</span> : null}
    </div>
  );
}

export function SearchExperience({
  index,
  initialQuery,
}: {
  index: SearchIndex;
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>("all");
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => querySearchIndex(index, deferredQuery, 12), [index, deferredQuery]);
  const counts = {
    all: results.total,
    players: results.players.length,
    teams: results.teams.length,
    matches: results.matches.length,
    series: results.series.length,
  };
  const trimmed = query.trim();
  const show = (key: Exclude<Filter, "all">) => filter === "all" || filter === key;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    const url = value ? `/search?q=${encodeURIComponent(value)}` : "/search";
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="mt-4">
      <form onSubmit={submit} role="search" className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-faint" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search players, teams, matches or series"
          autoFocus
          aria-label="Search players, teams, matches and series"
          className="h-12 w-full rounded-xl border border-line bg-surface pl-11 pr-11 text-sm text-ink shadow-card outline-none transition-colors placeholder:text-faint focus:border-accent"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-faint transition-colors hover:bg-surface2 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </form>

      {trimmed ? (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Search filters">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={filter === item.key}
                onClick={() => setFilter(item.key)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
                  filter === item.key ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-muted hover:text-ink"
                )}
              >
                {item.label}
                {counts[item.key] > 0 ? <span className="text-[10px] opacity-70">{counts[item.key]}</span> : null}
              </button>
            ))}
          </div>

          {results.total === 0 ? (
            <EmptyState
              title={`No results for “${trimmed}”`}
              description="Try a shorter name, a team code like IND, or search for a series."
              action={
                <button type="button" onClick={() => setQuery("")} className="text-xs font-semibold text-accent hover:underline">
                  Clear search
                </button>
              }
              className="mt-4"
            />
          ) : (
            <div className="mt-5 space-y-6">
              {show("players") && results.players.length > 0 ? (
                <section>
                  <SectionTitle count={results.players.length}>Players</SectionTitle>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {results.players.map((player) => (
                      <Link key={player.id} href={`/players/${player.id}`} className="card card-hover flex items-center gap-3 p-3">
                        <PlayerAvatar player={{ id: player.id, name: player.name, faceImageId: player.imageId }} size={36} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{player.name}</p>
                          <p className="truncate text-[11px] text-faint">{player.country ?? "Player"}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {show("teams") && results.teams.length > 0 ? (
                <section>
                  <SectionTitle count={results.teams.length}>Teams</SectionTitle>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {results.teams.map((team) => (
                      <Link key={team.id} href={`/teams/${team.id}`} className="card card-hover flex items-center gap-3 p-3">
                        <TeamBadge team={team} size={32} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{team.name}</p>
                          <p className="text-[11px] text-faint">{team.shortName}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {show("matches") && results.matches.length > 0 ? (
                <section>
                  <SectionTitle count={results.matches.length}>Matches</SectionTitle>
                  <div className="mt-1">
                    {results.matches.map((match) => (
                      <MatchCard key={match.id} match={match} compact showSeries />
                    ))}
                  </div>
                </section>
              ) : null}

              {show("series") && results.series.length > 0 ? (
                <section>
                  <SectionTitle count={results.series.length}>Series</SectionTitle>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {results.series.map((series) => (
                      <Link key={series.id} href={`/series/${series.id}`} className="card card-hover flex items-center gap-3 p-3">
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold">{series.name}</p>
                          <p className="mt-1 text-[11px] text-faint">
                            {series.matches} matches{series.live ? ` · ${series.live} live` : ""}
                          </p>
                        </div>
                        {series.format ? <FormatPill format={series.format.toUpperCase()} /> : null}
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 space-y-6">
          <section>
            <SectionTitle>Trending players</SectionTitle>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {index.trending.map((player) => (
                <Link key={player.id} href={`/players/${player.id}`} className="card card-hover flex items-center gap-3 p-3">
                  <PlayerAvatar player={{ id: player.id, name: player.name, faceImageId: player.imageId }} size={36} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{player.name}</p>
                    <p className="truncate text-[11px] text-faint">{player.country ?? "Player"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>Browse</SectionTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href="/series" className="rounded-lg border border-line bg-surface px-3 py-2 text-xs font-semibold hover:border-accent/40">All series</Link>
              <Link href="/rankings" className="rounded-lg border border-line bg-surface px-3 py-2 text-xs font-semibold hover:border-accent/40">ICC rankings</Link>
              <Link href="/" className="rounded-lg border border-line bg-surface px-3 py-2 text-xs font-semibold hover:border-accent/40">Live matches</Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
