import { extractFlight, findLastJSON } from "@/lib/cricbuzz/flight";
import { cachedValue, CricbuzzError, fetchCricbuzz } from "@/lib/cricbuzz/http";
import { normalizeMatchSummary } from "@/lib/cricbuzz/normalize";
import { getHomeFeed } from "@/lib/data/home";
import { getSearchIndex } from "@/lib/data/search";
import { getScheduleMatches } from "@/lib/data/schedule";
import type { MatchSummary, SearchSeries, TeamOverview, TeamRef } from "@/lib/types";
import { uniqueBy } from "@/lib/utils";

type Raw = Record<string, any>;

async function loadTeamPageMatches(teamId: number): Promise<MatchSummary[]> {
  const html = await fetchCricbuzz(`/cricket-team/team/${teamId}/matches`, {
    ttlMs: 60_000,
    staleMs: 10 * 60_000,
  });
  const flight = extractFlight(html);
  const raw = findLastJSON<Raw>(flight, "matchesList");
  const entries = Array.isArray(raw?.matches) ? raw.matches : [];
  const matches = new Map<number, MatchSummary>();

  for (const entry of entries) {
    const bundled = entry?.match ?? entry;
    const info = bundled?.matchInfo;
    if (!info) continue;
    const summary = normalizeMatchSummary(
      info,
      bundled?.matchScore,
      info.matchType
    );
    if (summary && !matches.has(summary.id)) {
      matches.set(summary.id, summary);
    }
  }

  return Array.from(matches.values());
}

function getTeamPageMatches(teamId: number): Promise<MatchSummary[]> {
  return cachedValue(
    `team-page-matches:${teamId}`,
    60_000,
    10 * 60_000,
    () => loadTeamPageMatches(teamId)
  );
}

export async function getTeamOverview(teamId: number): Promise<TeamOverview> {
  if (!Number.isInteger(teamId) || teamId <= 0) {
    throw new CricbuzzError("Invalid team id", 400, "BAD_REQUEST");
  }

  const [feed, search, schedule, teamPage] = await Promise.all([
    getHomeFeed(),
    getSearchIndex().catch(() => null),
    getScheduleMatches().catch(() => []),
    getTeamPageMatches(teamId).catch(() => []),
  ]);
  const allMatches = [...feed.matches, ...schedule, ...teamPage];

  const fromMatches = allMatches
    .flatMap((match) => match.teams)
    .find((team) => team.id === teamId);
  const fromSearch = search?.teams.find((team) => team.id === teamId);
  const team: TeamRef | undefined =
    fromMatches ??
    (fromSearch
      ? {
          id: fromSearch.id,
          name: fromSearch.name,
          shortName: fromSearch.shortName,
          imageId: fromSearch.imageId,
        }
      : undefined);

  if (!team) {
    throw new CricbuzzError("Team not found", 404, "NOT_FOUND");
  }

  const matches = uniqueBy(
    allMatches.filter((match) =>
      match.teams.some((entry) => entry.id === teamId)
    ),
    (match) => match.id
  ).sort((a, b) => {
    const order = { live: 0, upcoming: 1, completed: 2 } as const;
    const stateDiff = order[a.state] - order[b.state];
    if (stateDiff !== 0) return stateDiff;
    if (a.state === "upcoming") return a.startTime - b.startTime;
    return b.startTime - a.startTime;
  });

  const series: SearchSeries[] = uniqueBy(
    matches.map((match) => ({
      id: match.seriesId,
      name: match.seriesName,
      matches: matches.filter((item) => item.seriesId === match.seriesId).length,
      live: matches.filter(
        (item) => item.seriesId === match.seriesId && item.state === "live"
      ).length,
      format: match.formatRaw || undefined,
    })),
    (item) => item.id
  );

  return {
    team,
    matches,
    series,
    updatedAt: feed.updatedAt,
  };
}
