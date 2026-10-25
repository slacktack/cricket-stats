import { extractFlight, findLastJSON } from "@/lib/cricbuzz/flight";
import { cachedValue, CricbuzzError, fetchCricbuzz } from "@/lib/cricbuzz/http";
import { normalizeMatchSummary } from "@/lib/cricbuzz/normalize";
import { getHomeFeed } from "@/lib/data/home";
import type {
  MatchState,
  MatchSummary,
  PointsRow,
  PointsTableGroup,
  SeriesInfo,
  SeriesListItem,
  SeriesMatchGroup,
  SeriesStats,
  TeamRef,
} from "@/lib/types";
import {
  asNumber,
  asOptionalNumber,
  asString,
  parseTimestamp,
  uniqueBy,
} from "@/lib/utils";

type Raw = Record<string, any>;

function statePriority(state: MatchState): number {
  if (state === "live") return 0;
  if (state === "upcoming") return 1;
  return 2;
}

function normalizeSeriesStats(raw: Raw | null, title: string): SeriesStats | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const key = Object.keys(raw).find((name) => name.endsWith("StatsList"));
  if (!key) return undefined;
  const list = raw[key] as Raw | undefined;
  const rawHeaders = Array.isArray(list?.headers) ? list.headers : [];
  const rawValues = Array.isArray(list?.values) ? list.values : [];
  if (rawHeaders.length === 0 || rawValues.length === 0) return undefined;

  const headers = rawHeaders.map((header) => asString(header));
  const hasPlayerColumn = headers[0]?.toUpperCase() === "PLAYER";
  const rows = rawValues
    .map((entry) => {
      const value = entry as Raw;
      const values = Array.isArray(value.values) ? value.values.map(String) : [];
      const id = asNumber(values[0]);
      const name = asString(values[1]);
      if (!name) return null;
      return {
        id,
        name,
        values: hasPlayerColumn ? values.slice(2) : values.slice(1),
      };
    })
    .filter((row): row is { id: number; name: string; values: string[] } => Boolean(row));

  if (rows.length === 0) return undefined;
  return {
    title,
    headers: hasPlayerColumn ? headers.slice(1) : headers,
    rows,
  };
}

function parsePoints(raw: Raw | null): PointsTableGroup[] | undefined {
  const table = Array.isArray(raw?.pointsTable) ? raw.pointsTable : [];
  if (table.length === 0) return undefined;
  const groups = table
    .map((group) => {
      const rowsRaw = Array.isArray(group?.pointsTableInfo)
        ? group.pointsTableInfo
        : [];
      const rows: PointsRow[] = rowsRaw
        .map((row: Raw) => ({
          teamId: asNumber(row.teamId),
          teamName: asString(row.teamName),
          teamFullName: asString(row.teamFullName, asString(row.teamName)),
          imageId: asOptionalNumber(row.teamImageId),
          matchesPlayed: asNumber(row.matchesPlayed),
          matchesWon: asNumber(row.matchesWon),
          matchesLost: asNumber(row.matchesLost),
          matchesTied: asNumber(row.matchesTied),
          noRes: asNumber(row.noRes),
          matchesDrawn: asNumber(row.matchesDrawn),
          nrr: asString(row.nrr),
          points: asNumber(row.points),
          form: Array.isArray(row.form) ? row.form.map(String) : [],
        }))
        .filter((row: PointsRow) => row.teamId > 0 || row.teamName)
        .sort((a: PointsRow, b: PointsRow) => {
          if (b.points !== a.points) return b.points - a.points;
          return Number.parseFloat(b.nrr) - Number.parseFloat(a.nrr);
        });
      return {
        groupName: asString(group?.groupName, "Points table"),
        rows,
      };
    })
    .filter((group) => group.rows.length > 0);
  return groups.length > 0 ? groups : undefined;
}

function buildGroups(raw: Raw): {
  groups: SeriesMatchGroup[];
  matches: MatchSummary[];
} {
  const details = Array.isArray(raw?.matchDetails) ? raw.matchDetails : [];
  const groups: Array<{
    label: string;
    matches: MatchSummary[];
  }> = [];
  const all: MatchSummary[] = [];

  details.forEach((detail, index) => {
    const map = detail?.matchDetailsMap as Raw | undefined;
    if (!map) return;
    const entries = Array.isArray(map.match) ? map.match : [];
    const matches: MatchSummary[] = entries
      .map((entry: Raw) => normalizeMatchSummary(entry.matchInfo, entry.matchScore))
      .filter((match): match is MatchSummary => Boolean(match));
    if (matches.length === 0) return;
    const label = asString(map.key, `Round ${index + 1}`);
    groups.push({ label, matches });
    all.push(...matches);
  });

  const sortedGroups = groups
    .map((group) => {
      const priority = Math.min(
        ...group.matches.map((match) => statePriority(match.state))
      );
      const earliest = Math.min(
        ...group.matches.map((match) => match.startTime || Infinity)
      );
      return { ...group, priority, earliest };
    })
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.priority === 2) return b.earliest - a.earliest;
      return a.earliest - b.earliest;
    })
    .map((group) => ({
      label: group.label,
      matches: [...group.matches].sort((a, b) => {
        const stateDiff = statePriority(a.state) - statePriority(b.state);
        if (stateDiff !== 0) return stateDiff;
        return group.priority === 2
          ? b.startTime - a.startTime
          : a.startTime - b.startTime;
      }),
    }));

  return { groups: sortedGroups, matches: all };
}

async function loadSeriesInfo(seriesId: number): Promise<SeriesInfo> {
  if (!Number.isInteger(seriesId) || seriesId <= 0) {
    throw new CricbuzzError("Invalid series id", 400, "BAD_REQUEST");
  }

  const [matchesResult, pointsResult, runsResult, wicketsResult] =
    await Promise.allSettled([
      fetchCricbuzz(`/cricket-series/${seriesId}/x/matches`, {
        ttlMs: 60_000,
        staleMs: 10 * 60_000,
      }),
      fetchCricbuzz(`/cricket-series/${seriesId}/x/points-table`, {
        ttlMs: 60_000,
        staleMs: 10 * 60_000,
      }),
      fetchCricbuzz(
        `/cricket-series/${seriesId}/x/stats?statsType=mostRuns`,
        { ttlMs: 5 * 60_000, staleMs: 60 * 60_000 }
      ),
      fetchCricbuzz(
        `/cricket-series/${seriesId}/x/stats?statsType=mostWickets`,
        { ttlMs: 5 * 60_000, staleMs: 60 * 60_000 }
      ),
    ]);

  if (matchesResult.status === "rejected") {
    throw matchesResult.reason;
  }

  const matchesFlight = extractFlight(matchesResult.value);
  const rawMatches = findLastJSON<Raw>(matchesFlight, "matchesData");
  if (!rawMatches) {
    throw new CricbuzzError("Series not found", 404, "NOT_FOUND");
  }

  const { groups, matches } = buildGroups(rawMatches);
  if (matches.length === 0) {
    throw new CricbuzzError("No matches found for this series", 404, "NOT_FOUND");
  }

  const first = matches[0];
  if (!first) {
    throw new CricbuzzError("No matches found for this series", 404, "NOT_FOUND");
  }
  const teams = uniqueBy(
    matches.flatMap((match) => match.teams),
    (team) => team.id
  ).filter((team) => team.id > 0);
  const startDate = Math.min(
    ...matches.map((match) => match.startTime).filter(Boolean)
  );
  const endDate = Math.max(
    ...matches.map((match) => match.endTime || match.startTime).filter(Boolean)
  );
  const format = matches.find((match) => match.formatRaw)?.formatRaw;

  const pointsRaw =
    pointsResult.status === "fulfilled"
      ? findLastJSON<Raw>(extractFlight(pointsResult.value), "pointsTableData")
      : null;
  const pointsTable = parsePoints(pointsRaw);
  const pointsUpdatedAt = parseTimestamp(pointsRaw?.lastUpdated) || undefined;

  const runsRaw =
    runsResult.status === "fulfilled"
      ? findLastJSON<Raw>(extractFlight(runsResult.value), "initialStats")
      : null;
  const wicketsRaw =
    wicketsResult.status === "fulfilled"
      ? findLastJSON<Raw>(extractFlight(wicketsResult.value), "initialStats")
      : null;

  return {
    id: seriesId,
    name: first.seriesName,
    format,
    startDate: Number.isFinite(startDate) ? startDate : undefined,
    endDate: Number.isFinite(endDate) ? endDate : undefined,
    matchGroups: groups,
    matches,
    teams,
    pointsTable,
    pointsUpdatedAt,
    stats: normalizeSeriesStats(runsRaw, "Most runs"),
    statsWickets: normalizeSeriesStats(wicketsRaw, "Most wickets"),
  };
}

export function getSeriesInfo(seriesId: number): Promise<SeriesInfo> {
  return cachedValue(`series:${seriesId}`, 60_000, 10 * 60_000, () =>
    loadSeriesInfo(seriesId)
  );
}

export async function getSeriesList(): Promise<SeriesListItem[]> {
  const feed = await getHomeFeed();
  const groups = new Map<
    number,
    {
      id: number;
      name: string;
      format?: string;
      startDate?: number;
      endDate?: number;
      teams: TeamRef[];
      matches: number;
      live: number;
      upcoming: number;
      completed: number;
      isTournament: boolean;
    }
  >();

  for (const match of feed.matches) {
    if (!match.seriesId) continue;
    const existing = groups.get(match.seriesId) ?? {
      id: match.seriesId,
      name: match.seriesName,
      format: match.formatRaw || undefined,
      startDate: match.startTime,
      endDate: match.endTime || match.startTime,
      teams: [],
      matches: 0,
      live: 0,
      upcoming: 0,
      completed: 0,
      isTournament: Boolean(match.isTournament),
    };
    existing.matches += 1;
    if (match.state === "live") existing.live += 1;
    else if (match.state === "upcoming") existing.upcoming += 1;
    else existing.completed += 1;
    if (match.startTime && (!existing.startDate || match.startTime < existing.startDate)) {
      existing.startDate = match.startTime;
    }
    const end = match.endTime || match.startTime;
    if (end && (!existing.endDate || end > existing.endDate)) {
      existing.endDate = end;
    }
    for (const team of match.teams) {
      if (team.id > 0 && !existing.teams.some((item) => item.id === team.id)) {
        existing.teams.push(team);
      }
    }
    existing.isTournament = existing.isTournament || Boolean(match.isTournament);
    groups.set(match.seriesId, existing);
  }

  return Array.from(groups.values())
    .map(
      (group): SeriesListItem => ({
        ...group,
        state:
          group.live > 0
            ? "live"
            : group.upcoming > 0
              ? "upcoming"
              : "completed",
      })
    )
    .sort((a, b) => {
      if (statePriority(a.state) !== statePriority(b.state)) {
        return statePriority(a.state) - statePriority(b.state);
      }
      if (a.state === "completed") {
        return (b.endDate || 0) - (a.endDate || 0);
      }
      return (a.endDate || 0) - (b.endDate || 0);
    });
}
