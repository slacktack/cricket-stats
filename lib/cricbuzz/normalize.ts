import type {
  CommentaryBall,
  CommentaryData,
  CommentaryOverGroup,
  InningsSummary,
  MatchSummary,
  MatchTalkItem,
  Official,
  SquadPlayer,
  TeamRef,
  WinProbability,
} from "@/lib/types";
import {
  asBoolean,
  asNumber,
  asOptionalNumber,
  asString,
  cleanSeriesName,
  displayFormat,
  normalizeState,
  parseTimestamp,
  sanitizeText,
  shortNameFrom,
} from "@/lib/utils";
import { isPlaceholderTeam } from "@/lib/colors";

type Raw = Record<string, any>;

export function normalizeTeam(raw: Raw | undefined | null): TeamRef {
  const id = asNumber(raw?.teamId ?? raw?.id);
  const name = asString(raw?.teamName ?? raw?.name, "TBC");
  const shortName = asString(
    raw?.teamSName ?? raw?.shortName,
    shortNameFrom(name || "TBC")
  );
  const imageId = asOptionalNumber(raw?.imageId);
  return { id, name, shortName, imageId };
}

export function normalizeVenue(
  raw: Raw | undefined | null
): { ground: string; city: string; timezone?: string; country?: string } | undefined {
  const ground = asString(raw?.ground);
  const city = asString(raw?.city);
  if (!ground && !city) return undefined;
  return {
    ground: ground || city,
    city,
    timezone: asString(raw?.timezone) || undefined,
    country: asString(raw?.country) || undefined,
  };
}

function normalizeInningsBlock(raw: Raw | undefined, team: TeamRef): InningsSummary[] {
  if (!raw || typeof raw !== "object") return [];
  const entries = Object.entries(raw)
    .filter(([, value]) => value && typeof value === "object")
    .map(([key, value], index) => ({
      key,
      index,
      value: value as Raw,
    }))
    .sort((a, b) => {
      const aId = asNumber(a.value.inningsId, a.index + 1);
      const bId = asNumber(b.value.inningsId, b.index + 1);
      return aId - bId;
    });

  return entries.map(({ value, index }) => ({
    inningsId: asNumber(value.inningsId, index + 1),
    runs: asNumber(value.runs),
    wickets: asNumber(value.wickets),
    overs: asNumber(value.overs),
    declared: asBoolean(value.isDeclared ?? value.declared),
    followOn: asBoolean(value.isFollowOn ?? value.followOn),
    battingTeamId: team.id,
    battingTeamName: team.name,
  }));
}

export function normalizeInnings(
  rawScore: Raw | undefined,
  team1: TeamRef,
  team2: TeamRef
): InningsSummary[] {
  if (!rawScore || typeof rawScore !== "object") return [];
  return [
    ...normalizeInningsBlock(rawScore.team1Score as Raw | undefined, team1),
    ...normalizeInningsBlock(rawScore.team2Score as Raw | undefined, team2),
  ].sort((a, b) => a.inningsId - b.inningsId);
}

function inferWinnerId(
  rawInfo: Raw,
  team1: TeamRef,
  team2: TeamRef
): number | undefined {
  const stateTitle = asString(rawInfo.stateTitle);
  const status = asString(rawInfo.status);
  const haystacks = [stateTitle, status].filter(Boolean);
  const teams = [team1, team2].filter((team) => team.id > 0);

  for (const haystack of haystacks) {
    const lower = haystack.toLowerCase();
    if (!/\bwon\b/.test(lower)) continue;
    for (const team of teams) {
      const name = team.name.toLowerCase();
      const shortName = team.shortName.toLowerCase();
      if (
        lower.startsWith(`${name} `) ||
        lower.startsWith(`${shortName} `) ||
        lower.startsWith(`${shortName} won`) ||
        lower.startsWith(`${name} won`)
      ) {
        return team.id;
      }
    }
    for (const team of teams) {
      if (lower.includes(team.name.toLowerCase())) return team.id;
      if (lower.includes(` ${team.shortName.toLowerCase()} `)) return team.id;
    }
  }
  return undefined;
}

export function normalizeMatchSummary(
  rawInfo: Raw,
  rawScore?: Raw,
  fallbackType?: string
): MatchSummary | null {
  if (!rawInfo || typeof rawInfo !== "object") return null;
  const id = asNumber(rawInfo.matchId ?? rawInfo.id);
  if (!id) return null;

  const team1 = normalizeTeam(rawInfo.team1);
  const team2 = normalizeTeam(rawInfo.team2);
  const seriesId = asNumber(rawInfo.seriesId);
  const seriesName = cleanSeriesName(
    seriesId,
    asString(rawInfo.seriesName ?? rawInfo.seriesDesc, "Series")
  );
  const stateRaw = asString(
    rawInfo.state,
    asBoolean(rawInfo.complete) ? "Complete" : "Upcoming"
  );
  const state = asBoolean(rawInfo.complete) ? "completed" : normalizeState(stateRaw);
  const startTime = parseTimestamp(
    rawInfo.startDate ?? rawInfo.matchStartTimestamp
  );
  const endTime = parseTimestamp(
    rawInfo.endDate ?? rawInfo.matchCompleteTimestamp
  );
  const status =
    asString(rawInfo.status ?? rawInfo.shortStatus) ||
    (state === "upcoming" ? "Match yet to begin" : state === "live" ? "Live" : "Match complete");

  return {
    id,
    seriesId,
    seriesName,
    description: asString(rawInfo.matchDesc ?? rawInfo.matchDescription, "Match"),
    format: displayFormat(asString(rawInfo.matchFormat), asString(rawInfo.matchType)),
    formatRaw: asString(rawInfo.matchFormat),
    matchType: asString(rawInfo.matchType ?? fallbackType),
    state,
    stateRaw,
    status,
    startTime,
    endTime: endTime || undefined,
    teams: [team1, team2],
    innings: rawScore ? normalizeInnings(rawScore, team1, team2) : [],
    venue: normalizeVenue(rawInfo.venueInfo ?? rawInfo.venue),
    currentBattingTeamId: asOptionalNumber(rawInfo.currBatTeamId),
    winnerTeamId: inferWinnerId(rawInfo, team1, team2),
    isDayNight: asBoolean(rawInfo.dayNight),
    isTournament: asBoolean(rawInfo.isTournament ?? rawInfo.series?.tournament),
    isTbc:
      isPlaceholderTeam(team1.name, team1.imageId) &&
      isPlaceholderTeam(team2.name, team2.imageId),
  };
}

export function normalizeOfficials(richInfo: Raw | null): Official[] {
  if (!richInfo) return [];
  const officials: Official[] = [];
  const roles: Array<[string, string]> = [
    ["umpire1", "Umpire"],
    ["umpire2", "Umpire"],
    ["umpire3", "Third umpire"],
    ["referee", "Match referee"],
  ];
  for (const [key, role] of roles) {
    const value = richInfo[key];
    if (value && typeof value === "object" && asString(value.name)) {
      officials.push({
        role,
        name: asString(value.name),
        country: asString(value.country) || undefined,
      });
    }
  }
  return officials;
}

export function normalizeSquadPlayer(raw: Raw): SquadPlayer | null {
  const id = asNumber(raw?.id ?? raw?.playerId);
  const name = asString(raw?.name ?? raw?.playerName ?? raw?.fullName);
  if (!id || !name) return null;
  return {
    id,
    name,
    fullName: asString(raw?.fullName) || undefined,
    role: asString(raw?.role) || undefined,
    captain: asBoolean(raw?.captain),
    keeper: asBoolean(raw?.keeper),
    substitute: asBoolean(raw?.substitute),
    battingStyle: asString(raw?.battingStyle) || undefined,
    bowlingStyle: asString(raw?.bowlingStyle) || undefined,
    faceImageId:
      asOptionalNumber(raw?.faceImageId) ??
      asOptionalNumber(raw?.imageDetails?.imageId) ??
      asOptionalNumber(raw?.imageId),
    isOverseas: asBoolean(raw?.isOverseas),
  };
}

export function normalizeWinProbability(raw: Raw | null | undefined): WinProbability | undefined {
  if (!raw || typeof raw !== "object" || !raw.team1 || !raw.team2) return undefined;
  const team1Percent = asNumber(raw.team1.percent);
  const team2Percent = asNumber(raw.team2.percent);
  const draw = asNumber(raw.drawTiePercent);
  if (team1Percent + team2Percent + draw <= 0) return undefined;
  const getColor = (value: unknown) => {
    const text = asString(value);
    return text ? text.split("|")[0] : undefined;
  };
  return {
    team1: {
      id: asNumber(raw.team1.id),
      name: asString(raw.team1.name),
      shortName: asString(raw.team1.shortName),
      percent: team1Percent,
      color: getColor(raw.team1.color),
    },
    team2: {
      id: asNumber(raw.team2.id),
      name: asString(raw.team2.name),
      shortName: asString(raw.team2.shortName),
      percent: team2Percent,
      color: getColor(raw.team2.color),
    },
    drawTiePercent: draw,
    lastUpdatedOver: asOptionalNumber(raw.lastUpdatedOver),
  };
}

function commentaryBadge(item: Raw, text: string): CommentaryBall["badge"] {
  const events = Array.isArray(item.event)
    ? item.event.map((event: unknown) => String(event).toLowerCase())
    : [];
  if (events.includes("wicket")) return "W";
  if (events.includes("six")) return "6";
  if (events.includes("four")) return "4";
  const lower = text.toLowerCase();
  if (/^(wide|wides)\b/.test(lower)) return "wd";
  if (/^no ball\b/.test(lower)) return "nb";
  if (/\bwicket\b/.test(lower) && /\bout\b/.test(lower)) return "W";
  return undefined;
}

function parseBallMetric(value: unknown): number | undefined {
  if (value === "$undefined" || value === null || value === undefined) return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function normalizeCommentary(
  raw: Raw | null | undefined,
  updatedAtFallback = Date.now()
): CommentaryData {
  const items = raw?.matchCommentary && typeof raw.matchCommentary === "object"
    ? Object.values(raw.matchCommentary as Record<string, Raw>)
    : [];

  if (items.length === 0) {
    return { overs: [], talk: [], updatedAt: updatedAtFallback, available: false };
  }

  const summaryByOver = new Map<
    number,
    { summary?: string; runs?: number; score?: string }
  >();
  const ballItems: Array<Raw & { metric: number }> = [];
  const talkItems: MatchTalkItem[] = [];

  for (const item of items) {
    if (item.commType === "over-separator") {
      const separator = item.overSeparator as Raw | undefined;
      const overNumber = asNumber(separator?.overNumber);
      if (overNumber > 0) {
        const scoreRaw = asString(separator?.batTeamObj?.teamScore);
        summaryByOver.set(overNumber, {
          summary: asString(separator?.overSummary) || undefined,
          runs: asOptionalNumber(separator?.overRuns),
          score: scoreRaw ? scoreRaw.replace("-", "/") : undefined,
        });
      }
      continue;
    }

    const text = sanitizeText(asString(item.commText));
    if (!text || /^\$\d+$/.test(text)) continue;
    const metric = parseBallMetric(item.ballMetric);
    if (metric) {
      ballItems.push({ ...item, metric });
    } else if (text.length > 3) {
      talkItems.push({
        id: String(item.timestamp ?? item.commentaryId ?? text.slice(0, 24)),
        text,
        timestamp: parseTimestamp(item.timestamp),
      });
    }
  }

  const groups = new Map<number, CommentaryBall[]>();
  for (const item of ballItems) {
    const over = Math.floor(item.metric) + 1;
    const text = sanitizeText(asString(item.commText));
    const events = Array.isArray(item.event)
      ? item.event.map((event: unknown) => String(event).toLowerCase())
      : [];
    const ball: CommentaryBall = {
      id: `${item.metric}-${asString(item.timestamp)}-${text.slice(0, 24)}`,
      ballMetric: item.metric,
      over,
      ballInOver: Math.round((item.metric - Math.floor(item.metric)) * 10),
      text,
      badge: commentaryBadge(item, text),
      event: events,
      timestamp: parseTimestamp(item.timestamp),
    };
    const list = groups.get(over) ?? [];
    list.push(ball);
    groups.set(over, list);
  }

  const overs: CommentaryOverGroup[] = Array.from(groups.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([over, balls]) => {
      const sortedBalls = balls.sort((a, b) => b.timestamp - a.timestamp);
      const summary = summaryByOver.get(over);
      return {
        over,
        runs: summary?.runs,
        summary: summary?.summary,
        score: summary?.score,
        balls: sortedBalls,
      };
    });

  const talk = talkItems
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((item, index, list) => {
      const duplicate = list.findIndex((other) => other.text === item.text);
      return duplicate === index;
    })
    .slice(0, 6);

  return {
    overs,
    talk,
    updatedAt: parseTimestamp(raw?.responseLastUpdated) || updatedAtFallback,
    available: overs.length > 0 || talk.length > 0,
  };
}
