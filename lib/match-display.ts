import type { InningsSummary, MatchSummary, TeamRef } from "@/lib/types";
import {
  ballsFromOvers,
  ballsLimit,
  countdownText,
  displayFormat,
  formatDay,
  formatTime,
  relativeDayLabel,
} from "@/lib/utils";

export function teamInnings(
  match: MatchSummary,
  teamId: number
): InningsSummary[] {
  return match.innings
    .filter((innings) => innings.battingTeamId === teamId)
    .sort((a, b) => a.inningsId - b.inningsId);
}

export function teamScoreText(match: MatchSummary, team: TeamRef): string {
  const innings = teamInnings(match, team.id);
  if (innings.length === 0) {
    if (match.state === "upcoming" || match.isTbc) return "—";
    if (match.state === "live") return "Yet to bat";
    return "—";
  }
  return innings
    .map((item) => `${item.runs}/${item.wickets}`)
    .join(" & ");
}

export function teamOversText(match: MatchSummary, team: TeamRef): string | null {
  const innings = teamInnings(match, team.id);
  if (innings.length !== 1) return null;
  if (innings[0].overs <= 0) return null;
  return `${innings[0].overs} ov`;
}

export function matchTitle(match: MatchSummary): string {
  return `${match.teams[0].name} vs ${match.teams[1].name}`;
}

export function matchShortTitle(match: MatchSummary): string {
  return `${match.teams[0].shortName} vs ${match.teams[1].shortName}`;
}

export function matchFormat(match: MatchSummary): string {
  return displayFormat(match.formatRaw, match.matchType);
}

export function matchMeta(match: MatchSummary): string {
  const parts = [match.description, match.venue?.ground].filter(Boolean);
  return parts.join(" · ");
}

export function upcomingLine(match: MatchSummary): string {
  return `${relativeDayLabel(match.startTime)} · ${formatTime(match.startTime)}`;
}

export function matchStatusText(match: MatchSummary): string {
  if (match.state === "upcoming") return upcomingLine(match);
  if (match.state === "live" && match.innings.length === 0) {
    return match.status || "Match starting soon";
  }
  return match.status || "Match update";
}

export function matchStateLabel(match: MatchSummary): string {
  if (match.state === "live") return "Live";
  if (match.state === "upcoming") return "Upcoming";
  return "Result";
}

export type SeriesGroup = {
  key: string;
  seriesId?: number;
  name: string;
  matches: MatchSummary[];
  live: number;
};

export function groupMatchesBySeries(matches: MatchSummary[]): SeriesGroup[] {
  const map = new Map<string, SeriesGroup>();
  for (const match of matches) {
    const key = String(match.seriesId || "other");
    const existing = map.get(key);
    if (existing) {
      existing.matches.push(match);
      if (match.state === "live") existing.live += 1;
    } else {
      map.set(key, {
        key,
        seriesId: match.seriesId || undefined,
        name: match.seriesName || "Other matches",
        matches: [match],
        live: match.state === "live" ? 1 : 0,
      });
    }
  }
  return Array.from(map.values())
    .map((group) => ({
      ...group,
      matches: [...group.matches].sort(sortByStateThenTime),
    }))
    .sort((a, b) => {
      if ((a.live > 0) !== (b.live > 0)) return a.live > 0 ? -1 : 1;
      const rank = typeRank(a.matches[0]) - typeRank(b.matches[0]);
      if (rank !== 0) return rank;
      if (a.live !== b.live) return b.live - a.live;
      return b.matches[0].startTime - a.matches[0].startTime;
    });
}

const TYPE_RANK: Record<string, number> = {
  International: 0,
  League: 1,
  Women: 2,
  Domestic: 3,
};

export function typeRank(match: MatchSummary): number {
  return TYPE_RANK[match.matchType] ?? 4;
}

export type Insight = { label: string; value: string; tone?: "accent" | "live" | "win" };

function rate(runs: number, balls: number): string {
  return balls > 0 ? ((runs * 6) / balls).toFixed(2) : "0.00";
}

// Quick numbers for a card: run rates, chase equation, projection, countdown.
export function matchInsights(match: MatchSummary, now = Date.now()): Insight[] {
  if (match.state === "upcoming") {
    if (!match.startTime) return [];
    const text = countdownText(match.startTime, now);
    return text.startsWith("Starts in ")
      ? [{ label: "Starts in", value: text.slice(10), tone: "accent" }]
      : [{ label: text, value: "", tone: "accent" }];
  }
  if (match.state !== "live" || match.innings.length === 0) return [];

  const innings = [...match.innings].sort((a, b) => a.inningsId - b.inningsId);
  const current = innings[innings.length - 1];
  const balls = ballsFromOvers(current.overs);
  const limit = ballsLimit(match.formatRaw);
  const out: Insight[] = [{ label: "CRR", value: rate(current.runs, balls) }];
  const adjusted = /reduced|dls|d\/l|target/i.test(match.status);

  if (limit && innings.length === 1) {
    const left = Math.max(0, limit - balls);
    const projected = Math.round(current.runs + (balls > 0 ? (current.runs / balls) * left : 0));
    if (balls >= 12 && !adjusted) out.push({ label: "Proj", value: String(projected) });
    out.push({ label: "Wkts left", value: String(10 - current.wickets) });
  } else if (limit && innings.length === 2 && !adjusted) {
    const target = innings[0].runs + 1;
    const need = target - current.runs;
    const left = Math.max(0, limit - balls);
    if (need > 0 && left > 0) {
      out.unshift({ label: "Need", value: `${need} off ${left}`, tone: "live" });
      out.push({ label: "RRR", value: rate(need, left), tone: "accent" });
    }
    out.push({ label: "Target", value: String(target) });
  } else if (!limit) {
    out.push({ label: "Wkts left", value: String(10 - current.wickets) });
    const day = match.status.match(/Day\s*(\d+)/i);
    if (day) out.unshift({ label: "Day", value: day[1] });
  }
  return out;
}

export function sortByStateThenTime(a: MatchSummary, b: MatchSummary): number {
  const order = { live: 0, upcoming: 1, completed: 2 } as const;
  const diff = order[a.state] - order[b.state];
  if (diff !== 0) return diff;
  if (a.state === "upcoming") return a.startTime - b.startTime;
  return b.startTime - a.startTime;
}

export type DayGroup = {
  key: string;
  label: string;
  matches: MatchSummary[];
};

export function groupMatchesByDay(matches: MatchSummary[]): DayGroup[] {
  const map = new Map<string, DayGroup>();
  for (const match of [...matches].sort((a, b) => a.startTime - b.startTime)) {
    const key = new Date(match.startTime).toISOString().slice(0, 10);
    const existing = map.get(key);
    if (existing) existing.matches.push(match);
    else
      map.set(key, {
        key,
        label: formatDay(match.startTime),
        matches: [match],
      });
  }
  return Array.from(map.values());
}
