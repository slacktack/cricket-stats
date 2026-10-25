import { extractFlight, findLastJSON, findRichestJSON } from "@/lib/cricbuzz/flight";
import { cachedValue, CricbuzzError, fetchCricbuzz } from "@/lib/cricbuzz/http";
import {
  normalizeCommentary,
  normalizeMatchSummary,
  normalizeOfficials,
  normalizeSquadPlayer,
  normalizeVenue,
  normalizeWinProbability,
} from "@/lib/cricbuzz/normalize";
import { findMatchSummary } from "@/lib/data/home";
import type {
  BatsmanRow,
  BowlerRow,
  CommentaryData,
  Extras,
  FallOfWicket,
  InningsDetail,
  LiveBowler,
  LiveBatter,
  LiveState,
  MatchDetail,
  MatchSummary,
  Official,
  Partnership,
  SquadPlayer,
  TeamRef,
  TeamSquad,
} from "@/lib/types";
import {
  asBoolean,
  asNumber,
  asOptionalNumber,
  asString,
  ballsFromOvers,
  ballsLimit,
  cleanSeriesName,
  parseTimestamp,
  sanitizeText,
} from "@/lib/utils";

type Raw = Record<string, any>;

const EMPTY_EXTRAS: Extras = {
  byes: 0,
  legByes: 0,
  noBalls: 0,
  penalty: 0,
  total: 0,
  wides: 0,
};

function keyOrder(key: string): number {
  const match = key.match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function mergeTeam(team: TeamRef, baseTeam?: TeamRef): TeamRef {
  return {
    ...team,
    imageId: team.imageId ?? baseTeam?.imageId,
  };
}

function findTeam(teams: TeamRef[], id: number): TeamRef | undefined {
  return teams.find((team) => team.id === id);
}

function fallbackTeam(raw: Raw | undefined, id: number): TeamRef {
  return {
    id,
    name: asString(raw?.batTeamName, "Team"),
    shortName: asString(raw?.batTeamShortName ?? raw?.teamName, "TEAM"),
  };
}

function buildBatsmen(raw: Raw): BatsmanRow[] {
  const data = raw?.batsmenData ?? raw?.batTeamDetails?.batsmenData;
  if (!data || typeof data !== "object") return [];
  return Object.entries(data)
    .sort(([a], [b]) => keyOrder(a) - keyOrder(b))
    .map(([key, value], index) => {
      const row = value as Raw;
      const outDesc = asString(row.outDesc);
      const isOut =
        Boolean(outDesc) &&
        !/^(batting|not out|yet to bat)$|retired hurt|absent hurt/i.test(outDesc);
      const balls = asNumber(row.balls);
      const runs = asNumber(row.runs);
      return {
        id: asNumber(row.batId),
        name: asString(row.batName ?? row.batShortName, "Batter"),
        runs,
        balls,
        fours: asNumber(row.fours),
        sixes: asNumber(row.sixes),
        strikeRate: asNumber(row.strikeRate) || (balls > 0 ? (runs / balls) * 100 : 0),
        outDesc: outDesc || "not out",
        isOut,
        isCaptain: asBoolean(row.isCaptain),
        isKeeper: asBoolean(row.isKeeper),
        dismissalCode: asString(row.wicketCode) || undefined,
        order: keyOrder(key) || index + 1,
      };
    })
    .filter((row) => row.id > 0 || row.name);
}

function buildBowlers(raw: Raw): BowlerRow[] {
  const data = raw?.bowlersData ?? raw?.bowlTeamDetails?.bowlersData;
  if (!data || typeof data !== "object") return [];
  return Object.entries(data)
    .sort(([a], [b]) => keyOrder(a) - keyOrder(b))
    .map(([key, value], index) => {
      const row = value as Raw;
      const overs = asNumber(row.overs);
      const runs = asNumber(row.runs);
      const balls = asNumber(row.balls) || ballsFromOvers(overs);
      return {
        id: asNumber(row.bowlerId),
        name: asString(row.bowlName ?? row.bowlShortName, "Bowler"),
        overs,
        maidens: asNumber(row.maidens),
        runs,
        wickets: asNumber(row.wickets),
        economy: asNumber(row.economy) || (balls > 0 ? (runs / balls) * 6 : 0),
        noBalls: asNumber(row.no_balls ?? row.noBalls),
        wides: asNumber(row.wides),
        order: keyOrder(key) || index + 1,
      };
    })
    .filter((row) => row.id > 0 || row.name);
}

function buildExtras(raw: Raw): Extras {
  const data = raw?.extrasData;
  if (!data || typeof data !== "object") return EMPTY_EXTRAS;
  const extras: Extras = {
    byes: asNumber(data.byes),
    legByes: asNumber(data.legByes),
    noBalls: asNumber(data.noBalls),
    penalty: asNumber(data.penalty),
    total: asNumber(data.total),
    wides: asNumber(data.wides),
  };
  if (!extras.total) {
    extras.total =
      extras.byes +
      extras.legByes +
      extras.noBalls +
      extras.penalty +
      extras.wides;
  }
  return extras;
}

function buildFallOfWickets(raw: Raw): FallOfWicket[] {
  const data = raw?.wicketsData;
  if (!data || typeof data !== "object") return [];
  return Object.entries(data)
    .map(([, value]) => value as Raw)
    .map((row) => ({
      order: asNumber(row.wktNbr),
      batsmanId: asNumber(row.batId),
      batsmanName: asString(row.batName),
      runs: asNumber(row.wktRuns),
      wickets: asNumber(row.wktNbr),
      overs: asNumber(row.wktOver),
    }))
    .filter((row) => row.order > 0)
    .sort((a, b) => a.order - b.order);
}

function buildPartnerships(raw: Raw): Partnership[] {
  const data = raw?.partnershipsData;
  if (!data || typeof data !== "object") return [];
  return Object.entries(data)
    .sort(([a], [b]) => keyOrder(a) - keyOrder(b))
    .map(([key, value], index) => {
      const row = value as Raw;
      return {
        order: keyOrder(key) || index + 1,
        bat1Id: asNumber(row.bat1Id),
        bat1Name: asString(row.bat1Name),
        bat1Runs: asNumber(row.bat1Runs),
        bat1Balls: asNumber(row.bat1balls),
        bat2Id: asNumber(row.bat2Id),
        bat2Name: asString(row.bat2Name),
        bat2Runs: asNumber(row.bat2Runs),
        bat2Balls: asNumber(row.bat2balls),
        totalRuns: asNumber(row.totalRuns),
        totalBalls: asNumber(row.totalBalls),
      };
    })
    .filter((row) => row.totalRuns > 0 || row.totalBalls > 0);
}

function buildInnings(
  rawInnings: Raw[],
  summary: MatchSummary,
  live: LiveState | undefined,
  index: number,
  previous?: InningsDetail
): InningsDetail | null {
  if (!rawInnings || rawInnings.length === 0) return null;
  const raw = rawInnings[index];
  if (!raw) return null;
  const score = raw.scoreDetails as Raw | undefined;
  const battingId = asNumber(raw.batTeamDetails?.batTeamId);
  const battingTeam =
    findTeam(summary.teams, battingId) ??
    fallbackTeam(raw.batTeamDetails as Raw | undefined, battingId);
  const bowlingTeam = summary.teams.find((team) => team.id !== battingId);
  const runs = asNumber(score?.runs);
  const wickets = asNumber(score?.wickets);
  const overs = asNumber(score?.overs);
  const isCurrent = Boolean(live && live.inningsId === asNumber(raw.inningsId));
  let target: number | undefined;
  if (isCurrent && live?.target) {
    target = live.target;
  } else if (
    previous &&
    index > 0 &&
    summary.format !== "TEST" &&
    summary.format !== "FC"
  ) {
    target = previous.runs + 1;
  }

  return {
    id: asNumber(raw.inningsId, index + 1),
    battingTeam,
    bowlingTeam,
    runs,
    wickets,
    overs,
    runRate: asNumber(score?.runRate),
    declared: asBoolean(score?.declared ?? score?.isDeclared),
    followOn: asBoolean(score?.followOn ?? score?.isFollowOn),
    batsmen: buildBatsmen(raw),
    bowlers: buildBowlers(raw),
    extras: buildExtras(raw),
    fallOfWickets: buildFallOfWickets(raw),
    partnerships: buildPartnerships(raw),
    isCurrent,
    target,
  };
}

function normalizeLive(
  raw: Raw | undefined,
  summary: MatchSummary,
  formatRaw: string
): LiveState | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const inningsId = asNumber(raw.inningsId);
  const scoreDetails = raw.matchScoreDetails as Raw | undefined;
  const inningsScores = Array.isArray(scoreDetails?.inningsScoreList)
    ? scoreDetails.inningsScoreList
    : [];
  const currentScore = inningsScores.find(
    (item: Raw) => asNumber(item.inningsId) === inningsId
  );
  const currentRuns = asNumber(currentScore?.score ?? raw.batTeam?.teamScore);
  const target = asOptionalNumber(raw.target);
  const overs = asNumber(raw.overs);
  const limit = ballsLimit(formatRaw);
  const ballsBowled = ballsFromOvers(overs);
  const remainingBalls =
    limit !== undefined ? Math.max(0, limit - ballsBowled) : undefined;
  const remainingRuns = target ? Math.max(0, target - currentRuns) : undefined;

  const batter = (value: Raw | undefined, isStriker: boolean): LiveBatter | null => {
    if (!value) return null;
    const id = asNumber(value.id);
    const name = asString(value.name);
    if (!id || !name) return null;
    return {
      id,
      name,
      runs: asNumber(value.runs),
      balls: asNumber(value.balls),
      fours: asNumber(value.fours),
      sixes: asNumber(value.sixes),
      strikeRate: asNumber(value.strikeRate),
      isStriker,
    };
  };

  const bowler = (value: Raw | undefined, isStriker: boolean): LiveBowler | null => {
    if (!value) return null;
    const id = asNumber(value.id);
    const name = asString(value.name);
    if (!id || !name) return null;
    return {
      id,
      name,
      overs: asNumber(value.overs),
      maidens: asNumber(value.maidens),
      runs: asNumber(value.runs),
      wickets: asNumber(value.wickets),
      economy: asNumber(value.economy),
      isStriker,
    };
  };

  const batters = [
    batter(raw.batsmanStriker as Raw | undefined, true),
    batter(raw.batsmanNonStriker as Raw | undefined, false),
  ].filter((value): value is LiveBatter => Boolean(value));

  const bowlers = [
    bowler(raw.bowlerStriker as Raw | undefined, true),
    bowler(raw.bowlerNonStriker as Raw | undefined, false),
  ].filter((value): value is LiveBowler => Boolean(value));

  const recentRaw = asString(raw.recentOvsStats);
  const recentBalls = recentRaw
    ? recentRaw
        .replace(/\|/g, " | ")
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => Boolean(token) && token !== "..." && token !== "$undefined")
        .slice(-18)
    : [];

  const requiredRunRate =
    asNumber(raw.requiredRunRate) ||
    (remainingRuns !== undefined && remainingBalls
      ? (remainingRuns / remainingBalls) * 6
      : undefined);

  return {
    inningsId,
    overs,
    target,
    currentRunRate: asNumber(raw.currentRunRate),
    requiredRunRate: requiredRunRate || undefined,
    remainingRuns,
    remainingBalls,
    totalOvers: limit ? limit / 6 : undefined,
    partnership:
      raw.partnerShip && typeof raw.partnerShip === "object"
        ? {
            runs: asNumber(raw.partnerShip.runs),
            balls: asNumber(raw.partnerShip.balls),
          }
        : undefined,
    batters,
    bowlers,
    lastWicket: sanitizeText(asString(raw.lastWicket)) || undefined,
    recentBalls,
    status: asString(raw.status ?? summary.status),
    event: asString(raw.event) || undefined,
  };
}

function sortSquad(players: SquadPlayer[]): SquadPlayer[] {
  return [...players].sort((a, b) => {
    if (a.substitute !== b.substitute) return a.substitute ? 1 : -1;
    if (a.captain !== b.captain) return a.captain ? -1 : 1;
    if (a.keeper !== b.keeper) return a.keeper ? -1 : 1;
    return 0;
  });
}

function buildSquads(
  richInfo: Raw | null,
  header: Raw | null,
  teams: [TeamRef, TeamRef]
): TeamSquad[] {
  const squads: TeamSquad[] = [];
  const sources = [richInfo, header];
  for (let index = 0; index < 2; index += 1) {
    const team = teams[index];
    let players: SquadPlayer[] = [];
    for (const source of sources) {
      const rawTeam = source?.[`team${index + 1}`] as Raw | undefined;
      const rawPlayers = rawTeam?.playerDetails;
      if (Array.isArray(rawPlayers) && rawPlayers.length > 0) {
        players = rawPlayers
          .map((rawPlayer) => normalizeSquadPlayer(rawPlayer as Raw))
          .filter((player): player is SquadPlayer => Boolean(player));
        if (players.length > 0) break;
      }
    }
    if (players.length > 0) {
      squads.push({
        team,
        players: sortSquad(
          players.filter(
            (player, playerIndex, list) =>
              list.findIndex((other) => other.id === player.id) === playerIndex
          )
        ),
      });
    }
  }
  return squads;
}

function normalizePlayerOfMatch(raw: unknown): MatchDetail["playersOfMatch"] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((value) => {
      const player = value as Raw;
      return {
        id: asNumber(player.id),
        name: asString(player.name ?? player.fullName),
        teamName: asString(player.teamName) || undefined,
        faceImageId: asOptionalNumber(player.faceImageId),
      };
    })
    .filter((player) => player.id > 0 && player.name);
}

function emptyCommentary(): CommentaryData {
  return { overs: [], talk: [], updatedAt: Date.now(), available: false };
}

async function loadMatchDetail(matchId: number): Promise<MatchDetail> {
  if (!Number.isInteger(matchId) || matchId <= 0) {
    throw new CricbuzzError("Invalid match id", 400, "BAD_REQUEST");
  }

  const [scorecardResult, commentaryResult] = await Promise.allSettled([
    fetchCricbuzz(`/live-cricket-scorecard/${matchId}`, {
      ttlMs: 8_000,
      staleMs: 5 * 60_000,
    }),
    fetchCricbuzz(`/live-cricket-scores/${matchId}`, {
      ttlMs: 8_000,
      staleMs: 5 * 60_000,
    }),
  ]);

  const scorecardHtml =
    scorecardResult.status === "fulfilled" ? scorecardResult.value : null;
  const commentaryHtml =
    commentaryResult.status === "fulfilled" ? commentaryResult.value : null;

  if (!scorecardHtml && !commentaryHtml) {
    const error =
      scorecardResult.status === "rejected"
        ? scorecardResult.reason
        : commentaryResult.status === "rejected"
          ? commentaryResult.reason
          : new CricbuzzError("Match not found", 404, "NOT_FOUND");
    throw error;
  }

  const scorecardRaw = scorecardHtml
    ? findLastJSON<Raw>(extractFlight(scorecardHtml), "scorecardApiData")
    : null;
  const cpd = commentaryHtml
    ? findLastJSON<Raw>(extractFlight(commentaryHtml), "commentaryPageData")
    : null;
  const richInfo = commentaryHtml
    ? findRichestJSON<Raw>(
        extractFlight(commentaryHtml),
        "matchInfo",
        (value) =>
          Object.keys(value).length +
          (Array.isArray(value.team1?.playerDetails)
            ? value.team1.playerDetails.length * 20
            : 0) +
          (Array.isArray(value.team2?.playerDetails)
            ? value.team2.playerDetails.length * 20
            : 0) +
          (value.referee ? 30 : 0)
      )
    : null;

  const header = (scorecardRaw?.matchHeader ?? cpd?.matchHeader) as Raw | null;
  const base = await findMatchSummary(matchId);
  if (!header && !cpd?.miniscore && !base) {
    throw new CricbuzzError("Match not found", 404, "NOT_FOUND");
  }

  const miniscore = cpd?.miniscore as Raw | undefined;
  const headerTeam1 = (header?.team1 ?? richInfo?.team1) as Raw | undefined;
  const headerTeam2 = (header?.team2 ?? richInfo?.team2) as Raw | undefined;
  const syntheticInfo: Raw = {
    ...(richInfo ?? {}),
    ...(header ?? {}),
    matchId: asNumber(header?.matchId ?? richInfo?.matchId ?? matchId),
    matchDesc:
      asString(header?.matchDescription) ||
      asString(richInfo?.matchDescription) ||
      base?.description,
    startDate:
      header?.matchStartTimestamp ??
      richInfo?.matchStartTimestamp ??
      base?.startTime,
    endDate:
      header?.matchCompleteTimestamp ??
      richInfo?.matchCompleteTimestamp ??
      base?.endTime,
    state: asString(header?.state ?? richInfo?.state ?? base?.stateRaw),
    status: asString(header?.status ?? richInfo?.status ?? miniscore?.status ?? base?.status),
    seriesId:
      asNumber(header?.seriesId ?? richInfo?.series?.id) || base?.seriesId || 0,
    seriesName:
      asString(header?.seriesName ?? header?.seriesDesc ?? richInfo?.series?.name) ||
      base?.seriesName,
    team1: headerTeam1,
    team2: headerTeam2,
    currBatTeamId:
      asOptionalNumber(miniscore?.batTeam?.teamId) ??
      asOptionalNumber(header?.matchTeamInfo?.[0]?.battingTeamId) ??
      base?.currentBattingTeamId,
    isTournament: richInfo?.series?.tournament ?? base?.isTournament,
    venueInfo: header?.venue ?? richInfo?.venue,
    dayNight: header?.dayNight ?? base?.isDayNight,
  };

  let summary =
    normalizeMatchSummary(syntheticInfo, undefined, asString(header?.matchType)) ??
    base;
  if (!summary) {
    throw new CricbuzzError("Match not found", 404, "NOT_FOUND");
  }

  const baseTeam1 = base ? findTeam(base.teams, summary.teams[0].id) : undefined;
  const baseTeam2 = base ? findTeam(base.teams, summary.teams[1].id) : undefined;
  const teams: [TeamRef, TeamRef] = [
    mergeTeam(summary.teams[0], baseTeam1),
    mergeTeam(summary.teams[1], baseTeam2),
  ];

  const rawScoreCard = Array.isArray(scorecardRaw?.scoreCard)
    ? (scorecardRaw.scoreCard as Raw[])
    : [];
  const rawLive =
    summary.state === "live" && miniscore ? miniscore : undefined;
  const provisionalLive = rawLive
    ? normalizeLive(rawLive, summary, summary.formatRaw)
    : undefined;

  const innings: InningsDetail[] = [];
  for (let index = 0; index < rawScoreCard.length; index += 1) {
    const built = buildInnings(
      rawScoreCard,
      { ...summary, teams },
      provisionalLive,
      index,
      innings[innings.length - 1]
    );
    if (built) innings.push(built);
  }

  const live = rawLive
    ? normalizeLive(rawLive, { ...summary, teams }, summary.formatRaw)
    : undefined;
  if (live) {
    for (const inningsItem of innings) {
      inningsItem.isCurrent = inningsItem.id === live.inningsId;
    }
  }

  const inningsSummary = innings.map((inningsItem) => ({
    inningsId: inningsItem.id,
    runs: inningsItem.runs,
    wickets: inningsItem.wickets,
    overs: inningsItem.overs,
    declared: inningsItem.declared,
    followOn: inningsItem.followOn,
    battingTeamId: inningsItem.battingTeam.id,
    battingTeamName: inningsItem.battingTeam.name,
  }));

  const rawResult = (header?.result ?? richInfo?.result) as Raw | undefined;
  const winnerTeamId =
    asOptionalNumber(rawResult?.winningteamId) ?? summary.winnerTeamId;
  const result =
    winnerTeamId && summary.state === "completed"
      ? {
          winnerTeamId,
          margin: asOptionalNumber(rawResult?.winningMargin),
          byRuns: asBoolean(rawResult?.winByRuns),
          byWickets: asBoolean(rawResult?.winByWickets),
          byInnings: asBoolean(rawResult?.winByInnings),
        }
      : undefined;

  const tossRaw = (header?.tossResults ?? richInfo?.tossResults) as Raw | undefined;
  const tossWinnerId = asOptionalNumber(tossRaw?.tossWinnerId);
  const toss =
    tossWinnerId && asString(tossRaw?.tossWinnerName)
      ? {
          winnerId: tossWinnerId,
          winnerName: asString(tossRaw?.tossWinnerName),
          decision: asString(tossRaw?.decision),
        }
      : undefined;

  const seriesId =
    asNumber(header?.seriesId ?? richInfo?.series?.id) || summary.seriesId;
  const seriesName = cleanSeriesName(
    seriesId,
    asString(
      header?.seriesName ??
        header?.seriesDesc ??
        richInfo?.series?.name ??
        summary.seriesName
    )
  );

  const winProbability = normalizeWinProbability(
    scorecardRaw?.winProbability ?? cpd?.winProbability
  );

  summary = {
    ...summary,
    seriesId,
    seriesName,
    teams,
    innings: inningsSummary.length > 0 ? inningsSummary : summary.innings,
    currentBattingTeamId: live
      ? asOptionalNumber(miniscore?.batTeam?.teamId) ??
        summary.currentBattingTeamId
      : summary.currentBattingTeamId,
    winnerTeamId,
    status:
      asString(miniscore?.status) ||
      asString(header?.status) ||
      asString(summary.status),
    venue: normalizeVenue(header?.venue ?? richInfo?.venue) ?? summary.venue,
  };

  const commentary = cpd
    ? normalizeCommentary(cpd, parseTimestamp(cpd.responseLastUpdated) || Date.now())
    : emptyCommentary();

  const officialCandidates: Official[] = normalizeOfficials(richInfo);
  const playersOfMatch = normalizePlayerOfMatch(
    header?.playersOfTheMatch ?? richInfo?.playersOfTheMatch
  );
  const playersOfSeries = normalizePlayerOfMatch(
    header?.playersOfTheSeries ?? richInfo?.playersOfTheSeries
  );

  return {
    summary,
    series: {
      id: seriesId,
      name: seriesName,
      startDate: parseTimestamp(richInfo?.series?.startDate) || undefined,
      endDate: parseTimestamp(richInfo?.series?.endDate) || undefined,
    },
    venue: summary.venue,
    toss,
    resultText: summary.status,
    result,
    playersOfMatch,
    playersOfSeries,
    officials: officialCandidates,
    innings,
    live,
    winProbability,
    commentary,
    squads: buildSquads(richInfo, header, teams),
    hasScorecard: innings.length > 0,
    updatedAt:
      Math.max(
        parseTimestamp(scorecardRaw?.responseLastUpdated),
        parseTimestamp(cpd?.responseLastUpdated)
      ) || Date.now(),
  };
}

export function getMatchDetail(matchId: number): Promise<MatchDetail> {
  return cachedValue(`match:${matchId}`, 8_000, 5 * 60_000, () =>
    loadMatchDetail(matchId)
  );
}
