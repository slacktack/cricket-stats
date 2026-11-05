import { cachedValue, fetchCricbuzzJson } from "@/lib/cricbuzz/http";
import { asNumber, asString } from "@/lib/utils";

type Raw = Record<string, unknown>;

export interface OverPoint {
  over: number;
  runs: number;
  score: number;
  wickets: number;
  wicketsInOver: number;
  balls: string[];
  bowler?: string;
}

export interface InningsOvers {
  inningsId: number;
  team: string;
  overs: OverPoint[];
}

export interface MatchOvers {
  matchId: number;
  innings: InningsOvers[];
  updatedAt: number;
}

const MAX_PAGES = 12;

async function loadInnings(matchId: number, inningsId: number): Promise<Raw[]> {
  const rows: Raw[] = [];
  let cursor = "";
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const path = `/api/mcenter/over-by-over/${matchId}/${inningsId}${cursor}`;
    const data = await fetchCricbuzzJson<{ paginatedData?: Raw[] }>(path, {
      ttlMs: cursor ? 5 * 60_000 : 20_000,
    });
    const batch = (data.paginatedData ?? []).filter(
      (row) => asNumber(row.inningsId) === inningsId
    );
    if (batch.length === 0) break;
    rows.push(...batch);
    const last = batch[batch.length - 1];
    if (asNumber(last.overs) <= 1) break;
    cursor = `/${asNumber(last.timestamp)}`;
  }
  return rows;
}

function toInnings(inningsId: number, rows: Raw[]): InningsOvers {
  const byOver = new Map<number, Raw>();
  for (const row of rows) {
    const over = asNumber(row.overs);
    if (over > 0 && !byOver.has(over)) byOver.set(over, row);
  }
  const sorted = Array.from(byOver.values()).sort(
    (a, b) => asNumber(a.overs) - asNumber(b.overs)
  );
  let prevWickets = 0;
  const overs = sorted.map((row) => {
    const wickets = asNumber(row.wickets);
    const point: OverPoint = {
      over: asNumber(row.overs),
      runs: asNumber(row.runs),
      score: asNumber(row.score),
      wickets,
      wicketsInOver: Math.max(0, wickets - prevWickets),
      balls: asString(row.ovrSummary).trim().split(/\s+/).filter(Boolean),
      bowler: Array.isArray(row.bowlNames) ? asString(row.bowlNames[0]) : undefined,
    };
    prevWickets = wickets;
    return point;
  });
  return { inningsId, team: asString(sorted[0]?.batTeamName), overs };
}

async function loadMatchOvers(matchId: number): Promise<MatchOvers> {
  const innings: InningsOvers[] = [];
  for (let inningsId = 1; inningsId <= 4; inningsId += 1) {
    const rows = await loadInnings(matchId, inningsId).catch(() => []);
    if (rows.length === 0) break;
    innings.push(toInnings(inningsId, rows));
  }
  return { matchId, innings, updatedAt: Date.now() };
}

export function getMatchOvers(matchId: number): Promise<MatchOvers> {
  return cachedValue(`overs:${matchId}`, 20_000, 10 * 60_000, () =>
    loadMatchOvers(matchId)
  );
}
