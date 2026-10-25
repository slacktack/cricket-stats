import type {
  MatchSummary,
  SearchIndex,
  SearchPlayer,
  SearchResults,
  SearchSeries,
  SearchTeam,
} from "@/lib/types";
import { normalizeSearch, uniqueBy } from "@/lib/utils";

function scoreText(primary: string, secondary: string, query: string): number {
  const one = normalizeSearch(primary);
  const two = normalizeSearch(secondary);
  if (!one && !two) return 0;
  if (one === query) return 120;
  if (one.startsWith(query)) return 100;
  if (one.split(/\s+/).some((word) => word.startsWith(query))) return 80;
  if (one.includes(query)) return 60;
  if (two === query) return 55;
  if (two.startsWith(query)) return 45;
  if (two.includes(query)) return 30;
  return 0;
}

function hasEveryTerm(value: string, terms: string[]): boolean {
  const haystack = normalizeSearch(value);
  return terms.every((term) => haystack.includes(term));
}

function rankPlayers(players: SearchPlayer[], query: string, terms: string[]) {
  return players
    .map((player) => ({
      player,
      score: hasEveryTerm(`${player.name} ${player.country ?? ""}`, terms)
        ? scoreText(player.name, player.country ?? "", query)
        : 0,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.player.name.localeCompare(b.player.name))
    .map((entry) => entry.player);
}

function rankTeams(teams: SearchTeam[], query: string, terms: string[]) {
  return teams
    .map((team) => ({
      team,
      score: hasEveryTerm(`${team.name} ${team.shortName}`, terms)
        ? scoreText(team.name, team.shortName, query)
        : 0,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.team.name.localeCompare(b.team.name))
    .map((entry) => entry.team);
}

function matchHaystack(match: MatchSummary): string {
  return [
    match.teams[0]?.name,
    match.teams[1]?.name,
    match.teams[0]?.shortName,
    match.teams[1]?.shortName,
    match.seriesName,
    match.description,
    match.formatRaw,
    match.venue?.ground,
    match.venue?.city,
    match.status,
  ]
    .filter(Boolean)
    .join(" ");
}

function rankMatches(matches: MatchSummary[], query: string, terms: string[]) {
  return matches
    .map((match) => ({
      match,
      score: hasEveryTerm(matchHaystack(match), terms)
        ? scoreText(
            `${match.teams[0]?.name ?? ""} ${match.teams[1]?.name ?? ""}`,
            `${match.seriesName} ${match.description} ${match.venue?.city ?? ""}`,
            query
          )
        : 0,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.match.startTime - a.match.startTime;
    })
    .map((entry) => entry.match);
}

function rankSeries(series: SearchSeries[], query: string, terms: string[]) {
  return series
    .map((item) => ({
      item,
      score: hasEveryTerm(`${item.name} ${item.format ?? ""}`, terms)
        ? scoreText(item.name, item.format ?? "", query)
        : 0,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .map((entry) => entry.item);
}

export function querySearchIndex(
  index: SearchIndex,
  rawQuery: string,
  limit = 10
): SearchResults {
  const query = normalizeSearch(rawQuery);
  if (!query) {
    return {
      query: "",
      players: [],
      teams: [],
      matches: [],
      series: [],
      total: 0,
    };
  }
  const terms = query.split(/\s+/).filter(Boolean);
  const players = rankPlayers(index.players, query, terms).slice(0, limit);
  const teams = rankTeams(index.teams, query, terms).slice(0, Math.min(limit, 8));
  const matches = rankMatches(index.matches, query, terms).slice(0, limit);
  const series = rankSeries(index.series, query, terms).slice(0, Math.min(limit, 8));

  return {
    query: rawQuery.trim(),
    players: uniqueBy(players, (player) => player.id),
    teams: uniqueBy(teams, (team) => team.id),
    matches: uniqueBy(matches, (match) => match.id),
    series: uniqueBy(series, (item) => item.id),
    total: players.length + teams.length + matches.length + series.length,
  };
}
