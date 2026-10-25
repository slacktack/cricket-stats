import { cachedValue } from "@/lib/cricbuzz/http";
import { getHomeFeed } from "@/lib/data/home";
import { getRankings } from "@/lib/data/rankings";
import { getScheduleMatches } from "@/lib/data/schedule";
import { getSeriesList } from "@/lib/data/series";
import type {
  RankingCategory,
  RankingFormat,
  SearchIndex,
  SearchPlayer,
  SearchTeam,
} from "@/lib/types";
import { shortNameFrom, uniqueBy } from "@/lib/utils";

const COUNTRY_SHORT: Record<string, string> = {
  India: "IND",
  Australia: "AUS",
  England: "ENG",
  Pakistan: "PAK",
  "South Africa": "SA",
  "New Zealand": "NZ",
  "Sri Lanka": "SL",
  "West Indies": "WI",
  Bangladesh: "BAN",
  Afghanistan: "AFG",
  Zimbabwe: "ZIM",
  Ireland: "IRE",
  Scotland: "SCO",
  Netherlands: "NED",
  "United Arab Emirates": "UAE",
  Namibia: "NAM",
  "United States": "USA",
  Oman: "OMA",
  Nepal: "NEP",
  Canada: "CAN",
  "Papua New Guinea": "PNG",
  "Hong Kong": "HK",
};

function formatList(categories: Record<RankingCategory, Record<RankingFormat, any[]>>) {
  const players = new Map<number, SearchPlayer>();
  for (const category of ["batting", "bowling", "all-rounder"] as RankingCategory[]) {
    for (const format of ["odi", "test", "t20"] as RankingFormat[]) {
      for (const entry of categories[category]?.[format] ?? []) {
        const existing = players.get(entry.id);
        if (!existing || (!existing.imageId && entry.faceImageId)) {
          players.set(entry.id, {
            id: entry.id,
            name: entry.name,
            country: entry.country,
            imageId: entry.faceImageId,
          });
        }
      }
    }
  }
  return Array.from(players.values()).sort((a, b) => a.name.localeCompare(b.name));
}

async function loadSearchIndex(): Promise<SearchIndex> {
  const [feed, schedule, series, menResult, womenResult] = await Promise.all([
    getHomeFeed(),
    getScheduleMatches().catch(() => []),
    getSeriesList(),
    getRankings("men").catch(() => null),
    getRankings("women").catch(() => null),
  ]);

  const matches = uniqueBy([...feed.matches, ...schedule], (match) => match.id);

  const players = [
    ...(menResult ? formatList(menResult.categories) : []),
    ...(womenResult ? formatList(womenResult.categories) : []),
  ];

  const matchTeams = feed.matches.flatMap((match) => match.teams);
  const rankingTeams = [
    ...(menResult?.categories.teams
      ? Object.values(menResult.categories.teams).flat()
      : []),
    ...(womenResult?.categories.teams
      ? Object.values(womenResult.categories.teams).flat()
      : []),
  ].map((entry) => ({
    id: entry.id,
    name: entry.name,
    shortName: COUNTRY_SHORT[entry.name] ?? shortNameFrom(entry.name),
    imageId: entry.imageId,
  }));

  const teams = uniqueBy(
    [...matchTeams, ...rankingTeams].filter((team) => team.id > 0),
    (team) => team.id
  ).sort((a, b) => a.name.localeCompare(b.name));

  const trending = menResult
    ? (menResult.categories.batting.odi.length
        ? menResult.categories.batting.odi
        : menResult.categories.batting.t20
      )
        .slice(0, 8)
        .map((entry) => ({
          id: entry.id,
          name: entry.name,
          country: entry.country,
          imageId: entry.faceImageId,
        }))
    : players.slice(0, 8);

  return {
    players: uniqueBy(
      players.filter((player) => player.id > 0),
      (player) => player.id
    ).sort((a, b) => a.name.localeCompare(b.name)),
    teams: uniqueBy(teams, (team) => team.id),
    matches,
    series: series.map((item) => ({
      id: item.id,
      name: item.name,
      matches: item.matches,
      live: item.live,
      format: item.format,
    })),
    trending,
  };
}

export function getSearchIndex(): Promise<SearchIndex> {
  return cachedValue("search-index", 5 * 60_000, 30 * 60_000, loadSearchIndex);
}

export type { SearchPlayer, SearchTeam };
