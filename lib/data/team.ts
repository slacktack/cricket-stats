import { CricbuzzError } from "@/lib/cricbuzz/http";
import { getHomeFeed } from "@/lib/data/home";
import { getSearchIndex } from "@/lib/data/search";
import type { SearchSeries, TeamOverview, TeamRef } from "@/lib/types";
import { uniqueBy } from "@/lib/utils";

export async function getTeamOverview(teamId: number): Promise<TeamOverview> {
  if (!Number.isInteger(teamId) || teamId <= 0) {
    throw new CricbuzzError("Invalid team id", 400, "BAD_REQUEST");
  }

  const [feed, search] = await Promise.all([
    getHomeFeed(),
    getSearchIndex().catch(() => null),
  ]);

  const fromFeed = feed.matches
    .flatMap((match) => match.teams)
    .find((team) => team.id === teamId);
  const fromSearch = search?.teams.find((team) => team.id === teamId);
  const team: TeamRef | undefined =
    fromFeed ??
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

  const matches = feed.matches.filter((match) =>
    match.teams.some((entry) => entry.id === teamId)
  );

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
