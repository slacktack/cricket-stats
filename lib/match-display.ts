import type { InningsSummary, MatchSummary, TeamRef } from "@/lib/types";
import { displayFormat, formatDay, formatTime, relativeDayLabel } from "@/lib/utils";

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
      if (a.live !== b.live) return b.live - a.live;
      return b.matches[0].startTime - a.matches[0].startTime;
    });
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
