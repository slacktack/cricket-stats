"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import type { SearchIndex } from "@/lib/types";
import { querySearchIndex } from "@/lib/search";
import { normalizeSearch } from "@/lib/utils";
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
    <div className="flex items-end gap-2 border-b border-line-strong pb-2">
      <span className="mb-1 h-2 w-2 rounded-full bg-accent" />
      <h2 className="display text-[22px] font-bold leading-none tracking-[-0.025em]">{children}</h2>
      {count !== undefined ? (
        <span className="mono ml-auto text-[9px] font-medium uppercase tracking-[0.06em] text-faint">
          {String(count).padStart(2, "0")}
        </span>
      ) : null}
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
  const suggestedTeams = useMemo(() => {
    const terms = normalizeSearch(trimmed)
      .split(/[\s,]+/)
      .filter(Boolean)
      .filter((term) => !["vs", "v", "versus"].includes(term));
    if (terms.length === 0) return [];

    const scored = index.teams
      .map((team) => {
        const name = normalizeSearch(team.name);
        const short = normalizeSearch(team.shortName);
        let score = 0;
        for (const term of terms) {
          if (name === term || short === term) score += 5;
          else if (name.startsWith(term)) score += 3;
          else if (name.includes(term)) score += 2;
          else if (short.includes(term)) score += 1;
        }
        return { team, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    const seen = new Set<string>();
    const picked: typeof index.teams = [];
    for (const { team } of scored) {
      const key = normalizeSearch(team.shortName);
      if (seen.has(key)) continue;
      seen.add(key);
      picked.push(team);
      if (picked.length === 4) break;
    }
    return picked;
  }, [index, trimmed]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    const url = value ? `/search?q=${encodeURIComponent(value)}` : "/search";
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="mt-5">
      <form onSubmit={submit} role="search">
        <div className="flex items-center rounded-xl border border-line-strong bg-surface p-1.5 transition-colors duration-150 focus-within:border-accent">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-accent text-accent-ink">
            <Search className="h-[18px] w-[18px]" />
          </span>
          <input
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search players, teams, matches or series"
            autoFocus
            aria-label="Search players, teams, matches and series"
            className="h-12 min-w-0 flex-1 bg-transparent px-3.5 text-[15px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-faint"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface2 text-faint transition-colors hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <span className="mr-2 hidden shrink-0 rounded-lg border border-line bg-surface2 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-faint sm:inline">
              Enter
            </span>
          )}
        </div>
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
                data-active={filter === item.key}
                className="chip-filter"
              >
                {item.label}
                {counts[item.key] > 0 ? (
                  <span className="text-[9px] font-extrabold tabular-nums opacity-65">
                    {counts[item.key]}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          {results.total === 0 ? (
            <EmptyState
              title={`No results for “${trimmed}”`}
              description="Try a shorter name, a team code like IND, or search for a series."
              action={
                <div className="flex flex-col items-center gap-5">
                  {suggestedTeams.length > 0 ? (
                    <div className="space-y-2">
                      <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
                        Teams in this search
                      </p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {suggestedTeams.map((team) => (
                          <Link
                            key={team.id}
                            href={`/teams/${team.id}`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface2 px-2.5 py-1 text-[11px] font-semibold transition-colors hover:border-accent/40 hover:text-accent"
                          >
                            <TeamBadge team={team} size={18} />
                            {team.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <button type="button" onClick={() => setQuery("")} className="text-xs font-semibold text-accent hover:underline">
                    Clear search
                  </button>
                </div>
              }
              className="mt-4"
            />
          ) : (
            <div className="mt-6 space-y-7">
              {show("players") && results.players.length > 0 ? (
                <section>
                  <SectionTitle count={results.players.length}>Players</SectionTitle>
                  <div className="stagger mt-2 grid gap-2 sm:grid-cols-2">
                    {results.players.map((player) => (
                      <Link key={player.id} href={`/players/${player.id}`} className="card card-hover flex items-center gap-3 p-3">
                        <PlayerAvatar player={{ id: player.id, name: player.name, faceImageId: player.imageId }} size={60} className="ring-2 ring-surface" />
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
                  <div className="stagger mt-2 grid gap-2 sm:grid-cols-2">
                    {results.teams.map((team) => (
                      <Link key={team.id} href={`/teams/${team.id}`} className="card card-hover flex items-center gap-3 p-3">
                        <TeamBadge team={team} size={32} className="rounded-lg ring-2 ring-surface" />
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
                  <div className="stagger mt-2 grid gap-2 sm:grid-cols-2">
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
        <div className="mt-7 space-y-7">
          <section>
            <SectionTitle>Trending players</SectionTitle>
            <div className="stagger mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {index.trending.map((player) => (
                <Link key={player.id} href={`/players/${player.id}`} className="card card-hover flex items-center gap-3 p-3">
                  <PlayerAvatar player={{ id: player.id, name: player.name, faceImageId: player.imageId }} size={52} className="ring-2 ring-surface" />
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
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {[
                { href: "/series", label: "All series", className: "bg-clay" },
                { href: "/rankings", label: "ICC rankings", className: "bg-sage" },
                { href: "/", label: "Live matches", className: "bg-accent-soft" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg border border-line px-3.5 py-3 text-xs font-bold text-ink transition-colors duration-150 hover:border-line-strong ${item.className}`}
                >
                  {item.label}
                  <ArrowUpRight className="h-3.5 w-3.5 text-faint" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
