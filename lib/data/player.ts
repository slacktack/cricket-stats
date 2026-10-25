import { extractFlight, findLastJSON } from "@/lib/cricbuzz/flight";
import { cachedValue, CricbuzzError, fetchCricbuzz } from "@/lib/cricbuzz/http";
import type {
  PlayerProfile,
  PlayerRanking,
  PlayerRecentRow,
  PlayerStatsTable,
} from "@/lib/types";
import {
  asNumber,
  asOptionalNumber,
  asString,
  parseTimestamp,
} from "@/lib/utils";

type Raw = Record<string, any>;

const FORMAT_LABELS: Record<string, string> = {
  test: "Test",
  odi: "ODI",
  t20: "T20",
  ipl: "IPL",
  cl: "CL",
};

function normalizeStats(raw: Raw | null): PlayerStatsTable {
  if (!raw || typeof raw !== "object") return { formats: [], rows: [] };
  const headers = Array.isArray(raw.headers) ? raw.headers.map(String) : [];
  const formats = headers.slice(1).filter(Boolean);
  const values = Array.isArray(raw.values) ? raw.values : [];
  const rows = values
    .map((entry) => {
      const value = entry as Raw;
      const rowValues = Array.isArray(value.values) ? value.values : [];
      const label = asString(rowValues[0]);
      if (!label) return null;
      const mapped: Record<string, string> = {};
      formats.forEach((format, index) => {
        const cell = asString(rowValues[index + 1], "—");
        mapped[format] = cell === "$undefined" || cell === "-" ? "—" : cell;
      });
      return { label, values: mapped };
    })
    .filter((row): row is { label: string; values: Record<string, string> } =>
      Boolean(row)
    );
  return { formats, rows };
}

function normalizeRecent(raw: Raw | null): PlayerRecentRow[] {
  const rows = Array.isArray(raw?.rows) ? raw.rows : [];
  return rows
    .map((entry) => {
      const values = Array.isArray(entry?.values) ? entry.values : [];
      const matchId = asNumber(values[0]);
      return {
        matchId: matchId > 0 ? matchId : undefined,
        score: asString(values[1]),
        opponent: asString(values[2]) || undefined,
        format: asString(values[3]) || undefined,
        date: asString(values[4]) || undefined,
      };
    })
    .filter((row) => row.score)
    .slice(0, 8);
}

function normalizeRankings(raw: Raw | null): PlayerRanking[] {
  if (!raw || typeof raw !== "object") return [];
  const rankings: PlayerRanking[] = [];
  const kinds: Array<["bat" | "bowl" | "all", PlayerRanking["kind"]]> = [
    ["bat", "batting"],
    ["bowl", "bowling"],
    ["all", "all-rounder"],
  ];
  for (const [key, kind] of kinds) {
    const group = raw[key] as Raw | undefined;
    if (!group || typeof group !== "object") continue;
    for (const format of ["test", "odi", "t20"]) {
      const rank = asOptionalNumber(group[`${format}Rank`]);
      const bestRank = asOptionalNumber(group[`${format}BestRank`]);
      const diff = asOptionalNumber(group[`${format}DiffRank`]);
      if (rank === undefined && bestRank === undefined) continue;
      rankings.push({
        format: format.toUpperCase(),
        kind,
        rank,
        bestRank,
        diff,
      });
    }
  }
  return rankings;
}

function normalizeCareer(raw: Raw | null): PlayerProfile["career"] {
  const values = Array.isArray(raw?.values) ? raw.values : [];
  return values
    .map((entry): PlayerProfile["career"][number] | null => {
      const value = entry as Raw;
      const format = asString(value.name);
      if (!format) return null;
      return {
        format: FORMAT_LABELS[format] ?? format.toUpperCase(),
        debut: asString(value.debut) || undefined,
        lastPlayed: asString(value.lastPlayed) || undefined,
      };
    })
    .filter((entry): entry is PlayerProfile["career"][number] => Boolean(entry));
}

async function loadPlayer(playerId: number): Promise<PlayerProfile> {
  if (!Number.isInteger(playerId) || playerId <= 0) {
    throw new CricbuzzError("Invalid player id", 400, "BAD_REQUEST");
  }
  const html = await fetchCricbuzz(`/profiles/${playerId}/x`, {
    ttlMs: 60 * 60_000,
    staleMs: 6 * 60 * 60_000,
  });
  const flight = extractFlight(html);
  const playerData = findLastJSON<Raw>(flight, "playerData");
  if (!playerData) {
    throw new CricbuzzError("Player not found", 404, "NOT_FOUND");
  }
  const battingStats = findLastJSON<Raw>(flight, "battingStats");
  const bowlingStats = findLastJSON<Raw>(flight, "bowlingStats");
  const career = findLastJSON<Raw>(flight, "playerCareerData");
  const recent = findLastJSON<Raw>(flight, "recentBatting");
  const name = asString(playerData.name);
  if (!name) {
    throw new CricbuzzError("Player not found", 404, "NOT_FOUND");
  }
  const teams = asString(playerData.teams)
    .split(",")
    .map((team) => team.trim())
    .filter(Boolean);
  return {
    id: playerId,
    name,
    fullName: asString(playerData.fullName, name),
    role: asString(playerData.role) || undefined,
    battingStyle: asString(playerData.bat) || undefined,
    bowlingStyle: asString(playerData.bowl) || undefined,
    birthPlace: asString(playerData.birthPlace) || undefined,
    dateOfBirth: asString(playerData.DoB) || undefined,
    age: asString(playerData.age) || undefined,
    intlTeam: asString(playerData.intlTeam) || undefined,
    imageId:
      asOptionalNumber(playerData.faceImageId) ??
      asOptionalNumber(playerData.imageId),
    teams,
    rankings: normalizeRankings(playerData.rankings as Raw | null),
    career: normalizeCareer(career),
    batting: normalizeStats(battingStats),
    bowling: normalizeStats(bowlingStats),
    recentBatting: normalizeRecent(recent),
    updatedAt: Date.now(),
  };
}

export function getPlayerProfile(playerId: number): Promise<PlayerProfile> {
  return cachedValue(`player:${playerId}`, 60 * 60_000, 6 * 60 * 60_000, () =>
    loadPlayer(playerId)
  );
}

export function playerUpdatedAt(value: unknown): number {
  return parseTimestamp(value) || Date.now();
}
