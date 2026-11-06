import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { MatchSummary } from "@/lib/types";
import {
  matchFormat,
  matchInsights,
  matchStatusText,
  matchTitle,
  teamOversText,
  teamScoreText,
} from "@/lib/match-display";
import { cn } from "@/lib/utils";
import { FormatPill } from "@/components/ui/pills";
import { TeamBadge } from "@/components/ui/team-badge";

const TONES = {
  accent: "text-accent",
  live: "text-live",
  win: "text-ink",
};

export function InsightChips({
  match,
  className,
}: {
  match: MatchSummary;
  className?: string;
}) {
  const insights = matchInsights(match);
  if (insights.length === 0) return null;
  return (
    <dl
      className={cn(
        "mcard-rule flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t px-3.5 pt-2 text-[10px] uppercase tracking-[0.08em]",
        className
      )}
      suppressHydrationWarning
    >
      {insights.map((item) => (
        <div key={item.label} className="flex items-baseline gap-1.5">
          <dt className="mcard-mute text-faint">{item.label}</dt>
          {item.value ? (
            <dd
              className={cn(
                "mcard-ink tnum font-bold text-ink",
                item.tone && TONES[item.tone]
              )}
            >
              {item.value}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

/** A match as a printed sheet: band, two score lines with leaders, status. */
export function MatchCard({
  match,
  showSeries = false,
  compact = false,
  className,
}: {
  match: MatchSummary;
  showSeries?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const live = match.state === "live";
  const done = match.state === "completed";
  const currentTeamId = live ? match.currentBattingTeamId : undefined;
  const hasScores = match.teams.some((team) => {
    const score = teamScoreText(match, team);
    return score !== "Yet to bat" && score !== "—";
  });
  const meta = showSeries
    ? `${match.seriesName} · ${match.description}`
    : match.description || match.seriesName;

  return (
    <Link
      href={`/match/${match.id}`}
      aria-label={`${matchTitle(match)} — ${matchStatusText(match)}`}
      data-rv=""
      className={cn("mcard group", className)}
    >
      <div className="flex h-10 items-center gap-2 border-b border-line px-3.5">
        <FormatPill format={matchFormat(match)} />
        <span className="mcard-mute min-w-0 flex-1 truncate text-[10px] uppercase tracking-[0.08em] text-muted">
          {meta}
        </span>
        {live ? (
          <span className="mcard-live inline-flex shrink-0 items-center gap-1 bg-live px-1.5 text-[9px] font-extrabold uppercase leading-[17px] tracking-[0.1em] text-[#0a1400]">
            <span className="mcard-dot h-[5px] w-[5px] rounded-full bg-[#0a1400] animate-pulse-dot" />
            Live
          </span>
        ) : (
          <span className="mcard-mute shrink-0 text-[9px] font-bold uppercase tracking-[0.1em] text-faint">
            {done ? "Result" : "Upcoming"}
          </span>
        )}
      </div>

      <div className="pt-0.5">
        {match.teams.map((team) => {
          const score = teamScoreText(match, team);
          const overs = teamOversText(match, team);
          const isCurrent = currentTeamId === team.id;
          const isWinner = done && match.winnerTeamId === team.id;
          const isLoser = done && !!match.winnerTeamId && !isWinner;
          const plain = score === "Yet to bat" || score === "—";

          return (
            <div
              key={team.id}
              className={cn(
                "mcard-rule flex min-w-0 items-baseline gap-2.5 border-b px-3.5 py-2 last:border-b-0",
                isLoser && "opacity-50"
              )}
            >
              <TeamBadge team={team} size={compact ? 18 : 20} />
              <p className="mcard-ink shrink-0 text-[14px] font-bold uppercase leading-none tracking-[-0.03em] text-ink">
                {team.shortName}
                {isCurrent ? (
                  <span
                    aria-label="Batting"
                    className="mcard-dot ml-1 inline-block h-[6px] w-[6px] rounded-full bg-live align-middle"
                  />
                ) : null}
              </p>
              <span className="leaders" />
              {overs ? (
                <span className="mcard-mute tnum shrink-0 text-[10px] text-faint">
                  {overs}
                </span>
              ) : null}
              <span
                className={cn(
                  "mcard-ink tnum shrink-0 whitespace-nowrap text-right font-bold leading-none tracking-[-0.04em] text-ink",
                  compact ? "text-[17px]" : "text-[19px]",
                  (plain || !hasScores) && "text-[11px] font-medium text-faint",
                  isWinner && "underline decoration-2 underline-offset-4"
                )}
              >
                {!hasScores
                  ? "—"
                  : score === "Yet to bat"
                    ? "Yet to bat"
                    : score === "—"
                      ? "—"
                      : score}
              </span>
            </div>
          );
        })}
      </div>

      <InsightChips match={match} />

      <div className="mcard-rule mt-auto flex min-h-10 items-center gap-2 border-t px-3.5 py-2">
        <p
          className="mcard-ink min-w-0 flex-1 truncate text-[12px] font-medium text-ink"
          title={matchStatusText(match)}
          suppressHydrationWarning
        >
          {matchStatusText(match)}
        </p>
        {match.venue?.city ? (
          <span className="mcard-mute hidden shrink-0 text-[10px] uppercase tracking-[0.06em] text-faint sm:inline">
            {match.venue.city}
          </span>
        ) : null}
        <ChevronRight className="mcard-mute h-4 w-4 shrink-0 text-faint transition-transform duration-150 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
