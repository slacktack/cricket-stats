import type { BowlerRow, BatsmanRow, InningsDetail, TeamRef } from "@/lib/types";
import { ballsFromOvers } from "@/lib/utils";

export type RunSources = {
  running: number;
  fours: number;
  sixes: number;
  extras: number;
  total: number;
  fourCount: number;
  sixCount: number;
};

export function runSources(innings: InningsDetail): RunSources {
  const fourCount = innings.batsmen.reduce((sum, batter) => sum + batter.fours, 0);
  const sixCount = innings.batsmen.reduce((sum, batter) => sum + batter.sixes, 0);
  const batRuns = innings.batsmen.reduce((sum, batter) => sum + batter.runs, 0);
  const fours = fourCount * 4;
  const sixes = sixCount * 6;
  const running = Math.max(0, batRuns - fours - sixes);
  const extras = innings.extras.total;
  return {
    running,
    fours,
    sixes,
    extras,
    total: running + fours + sixes + extras,
    fourCount,
    sixCount,
  };
}

export type TeamTotals = {
  runs: number;
  runRate: number;
  fourCount: number;
  sixCount: number;
  boundaryShare: number;
  extras: number;
};

export function teamTotals(innings: InningsDetail[], teamId: number): TeamTotals {
  const list = innings.filter((item) => item.battingTeam.id === teamId);
  let runs = 0;
  let balls = 0;
  let fourCount = 0;
  let sixCount = 0;
  let boundaryRuns = 0;
  let extras = 0;
  for (const item of list) {
    const sources = runSources(item);
    runs += item.runs;
    balls += ballsFromOvers(item.overs);
    fourCount += sources.fourCount;
    sixCount += sources.sixCount;
    boundaryRuns += sources.fours + sources.sixes;
    extras += sources.extras;
  }
  return {
    runs,
    runRate: balls > 0 ? runs / (balls / 6) : 0,
    fourCount,
    sixCount,
    boundaryShare: runs > 0 ? Math.round((boundaryRuns / runs) * 100) : 0,
    extras,
  };
}

export function topBatter(
  innings: InningsDetail[]
): { batter: BatsmanRow; team: TeamRef } | null {
  let best: { batter: BatsmanRow; team: TeamRef } | null = null;
  for (const item of innings) {
    for (const batter of item.batsmen) {
      if (
        !best ||
        batter.runs > best.batter.runs ||
        (batter.runs === best.batter.runs && batter.strikeRate > best.batter.strikeRate)
      ) {
        best = { batter, team: item.battingTeam };
      }
    }
  }
  return best && best.batter.runs > 0 ? best : null;
}

export function bestBowler(
  innings: InningsDetail[],
  teams: TeamRef[]
): { bowler: BowlerRow; team?: TeamRef } | null {
  let best: { bowler: BowlerRow; team?: TeamRef } | null = null;
  for (const item of innings) {
    const bowlingTeam = teams.find((team) => team.id !== item.battingTeam.id);
    for (const bowler of item.bowlers) {
      if (
        !best ||
        bowler.wickets > best.bowler.wickets ||
        (bowler.wickets === best.bowler.wickets && bowler.runs < best.bowler.runs)
      ) {
        best = { bowler, team: bowlingTeam };
      }
    }
  }
  return best && best.bowler.wickets > 0 ? best : null;
}
