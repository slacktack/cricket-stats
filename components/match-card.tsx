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
import { FormatPill, LiveDot } from "@/components/ui/pills";
import { TeamBadge } from "@/components/ui/team-badge";

const TONES = {
  accent: "text-accent",
  live: "text-live",
  win: "text-win",
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
      className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]", className)}
      suppressHydrationWarning
    >
      {insights.map((item) => (
        <div key={item.label} className="flex items-baseline gap-1.5">
          <dt className="text-faint">{item.label}</dt>
          {item.value ? (
            <dd className={cn("tnum font-semibold text-ink", item.tone && TONES[item.tone])}>
              {item.value}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

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
  const pad = compact ? "px-3.5" : "px-4";

  return (
    <Link
      href={`/match/${match.id}`}
      aria-label={`${matchTitle(match)} — ${matchStatusText(match)}`}
      className={cn(
        "group flex h-full min-w-0 flex-col rounded-xl border border-line bg-surface transition-colors duration-150 hover:border-line-strong",
        className
      )}
    >
      <div className={cn("flex h-11 items-center gap-2", pad)}>
        <FormatPill format={matchFormat(match)} />
        <span className="min-w-0 flex-1 truncate text-[12px] text-muted">{meta}</span>
        {live ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-live">
            <LiveDot />
            Live
          </span>
        ) : (
          <span
            className={cn(
              "shrink-0 text-[11px] font-semibold uppercase tracking-[0.06em]",
              done ? "text-faint" : "text-aqua"
            )}
          >
            {done ? "Result" : "Upcoming"}
          </span>
        )}
      </div>

      <div className={cn("space-y-2.5 pb-3", pad)}>
        {match.teams.map((team) => {
          const score = teamScoreText(match, team);
          const overs = teamOversText(match, team);
          const isCurrent = currentTeamId === team.id;
          const isWinner = done && match.winnerTeamId === team.id;
          const isLoser = done && !!match.winnerTeamId && !isWinner;
          const yetToBat = score === "Yet to bat";
          const placeholder = score === "—";
          return (
            <div
              key={team.id}
              className={cn("flex min-w-0 items-center gap-3", isLoser && "opacity-55")}
            >
              <TeamBadge team={team} size={compact ? 28 : 32} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[15px] font-semibold leading-5 text-ink">
                  <span className="truncate">{team.shortName}</span>
                  {isCurrent ? (
                    <span aria-label="Batting" className="h-1.5 w-1.5 shrink-0 rounded-full bg-live" />
                  ) : null}
                </p>
                <p className="truncate text-[12px] leading-4 text-faint">{team.name}</p>
              </div>
              <div className="flex shrink-0 items-baseline gap-2">
                {overs ? <span className="tnum text-[12px] text-faint">{overs}</span> : null}
                {!hasScores ? null : yetToBat ? (
                  <span className="text-[12px] text-faint">Yet to bat</span>
                ) : placeholder ? (
                  <span className="text-[13px] text-faint">—</span>
                ) : (
                  <span
                    className={cn(
                      "tnum whitespace-nowrap font-display font-semibold tracking-[-0.02em] text-ink",
                      compact ? "text-[17px]" : "text-[19px]",
                      isWinner && "text-win"
                    )}
                  >
                    {score}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <InsightChips match={match} className={cn("pb-3", pad)} />

      <div
        className={cn(
          "mt-auto flex min-h-11 items-center gap-2 border-t border-line py-2.5",
          pad
        )}
      >
        <p
          className={cn(
            "min-w-0 flex-1 truncate text-[13px]",
            live ? "font-medium text-ink" : done ? "font-medium text-win" : "text-muted"
          )}
          title={matchStatusText(match)}
          suppressHydrationWarning
        >
          {matchStatusText(match)}
        </p>
        {match.venue?.city ? (
          <span className="hidden shrink-0 text-[12px] text-faint sm:inline">
            {match.venue.city}
          </span>
        ) : null}
        <ChevronRight className="h-4 w-4 shrink-0 text-faint transition-transform duration-150 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
