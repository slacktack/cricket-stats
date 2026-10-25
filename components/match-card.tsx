import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { MatchSummary } from "@/lib/types";
import {
  matchFormat,
  matchStatusText,
  matchTitle,
  teamOversText,
  teamScoreText,
} from "@/lib/match-display";
import { cn } from "@/lib/utils";
import { LiveDot } from "@/components/ui/pills";
import { TeamBadge } from "@/components/ui/team-badge";

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
  const currentTeamId = live ? match.currentBattingTeamId : undefined;
  const meta = showSeries
    ? match.seriesName || match.description
    : match.description || match.seriesName;

  return (
    <Link
      href={`/match/${match.id}`}
      aria-label={`${matchTitle(match)} — ${matchStatusText(match)}`}
      className={cn(
        "group grid grid-cols-[43px_minmax(0,1fr)_14px] items-start gap-x-3 border-b border-line py-4 transition-colors hover:bg-ink/[0.025] sm:grid-cols-[60px_minmax(0,1fr)_168px_14px] sm:gap-x-5",
        compact && "py-3",
        className
      )}
    >
      <div className="pt-0.5">
        <span className="mono block text-[8px] font-medium uppercase tracking-[0.16em] text-muted">
          {matchFormat(match)}
        </span>
        <span className="mt-1 block text-[9px] leading-[1.35] text-faint">
          {meta}
        </span>
      </div>

      <div className="min-w-0">
        {match.teams.map((team) => {
          const score = teamScoreText(match, team);
          const overs = teamOversText(match, team);
          const isCurrent = currentTeamId === team.id;
          const isWinner =
            match.state === "completed" && match.winnerTeamId === team.id;
          const yetToBat = score === "Yet to bat";
          const placeholder = score === "—";

          return (
            <div
              key={team.id}
              className={cn(
                "flex min-h-[27px] items-center gap-2.5",
                live && !isCurrent && "opacity-80"
              )}
            >
              <TeamBadge team={team} size={compact ? 16 : 18} />
              <span
                className={cn(
                  "min-w-0 truncate text-[13px] font-semibold leading-tight tracking-[-0.005em]",
                  isCurrent || isWinner
                    ? "text-ink"
                    : match.state === "upcoming"
                      ? "text-muted"
                      : "text-ink/85"
                )}
              >
                {team.shortName}
              </span>
              <span className="hidden min-w-0 truncate text-[10px] text-faint md:inline">
                {team.name}
              </span>
              {isCurrent ? (
                <span
                  aria-label="Currently batting"
                  className="h-1 w-1 shrink-0 rounded-[1px] bg-accent"
                />
              ) : null}
              {isWinner ? (
                <span className="mono shrink-0 text-[7px] font-semibold uppercase tracking-[0.1em] text-win">
                  won
                </span>
              ) : null}
              <span className="ml-auto flex shrink-0 items-baseline justify-end gap-2">
                {yetToBat ? (
                  <span className="mono text-[7px] font-medium uppercase tracking-[0.1em] text-faint">
                    Yet to bat
                  </span>
                ) : (
                  <span
                    className={cn(
                      "mono whitespace-nowrap text-[14px] font-medium leading-none tnum sm:text-[16px]",
                      placeholder && "text-[12px] text-faint",
                      !placeholder &&
                        (isCurrent || isWinner
                          ? "text-ink"
                          : match.state === "upcoming"
                            ? "text-faint"
                            : "text-muted")
                    )}
                  >
                    {score}
                  </span>
                )}
                {overs ? (
                  <span className="mono hidden text-[8px] font-normal uppercase tracking-[0.06em] text-faint tnum sm:inline">
                    {overs}
                  </span>
                ) : null}
              </span>
            </div>
          );
        })}

        <div className="mt-1.5 flex items-start gap-1.5 sm:hidden">
          {live ? <LiveDot className="mt-[5px]" /> : null}
          <p
            className={cn(
              "text-[10px] leading-snug",
              live ? "text-ink/80" : "text-muted"
            )}
          >
            {matchStatusText(match)}
          </p>
        </div>
      </div>

      <div className="hidden pt-0.5 sm:block">
        {live ? (
          <span className="mono flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-live">
            <LiveDot />
            Live
          </span>
        ) : (
          <span className="mono text-[8px] font-medium uppercase tracking-[0.16em] text-faint">
            {match.state === "completed" ? "Result" : "Upcoming"}
          </span>
        )}
        <p className="mt-1.5 text-[10px] leading-[1.4] text-muted">
          {matchStatusText(match)}
        </p>
        {match.venue?.city ? (
          <p className="mono mt-1.5 truncate text-[8px] uppercase tracking-[0.1em] text-faint">
            {match.venue.city}
          </p>
        ) : null}
      </div>

      <ChevronRight className="mt-[3px] h-3.5 w-3.5 text-faint transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent" />
    </Link>
  );
}
