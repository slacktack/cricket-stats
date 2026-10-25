import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
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
        "match-card-shell group block",
        compact ? "px-2 py-2.5" : "px-2 py-3.5 sm:px-3",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="shrink-0 font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-accent">
          {matchFormat(match)}
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-[9px] font-medium uppercase tracking-[0.04em] text-faint sm:text-[10px]">
          {meta}
        </span>
        {live ? (
          <span className="inline-flex h-5 shrink-0 items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-live">
            <LiveDot />
            Live
          </span>
        ) : (
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] text-faint">
            {match.state === "upcoming" ? "Upcoming" : "Result"}
          </span>
        )}
      </div>

      <div className={cn("space-y-0.5", compact ? "mt-2" : "mt-2.5")}>
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
                "flex min-h-[38px] items-center gap-2.5 px-1 py-0.5",
                isCurrent && "bg-accent-soft/70"
              )}
            >
              <TeamBadge
                team={team}
                size={compact ? 19 : 22}
                className="rounded-[4px] bg-surface ring-1 ring-line/70"
              />
              <span
                className={cn(
                  "min-w-0 truncate text-[13px] font-bold leading-tight tracking-[-0.01em] sm:text-[14px]",
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
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent animate-pulse-dot"
                />
              ) : null}
              {isWinner ? (
                <span className="shrink-0 font-mono text-[8px] font-medium uppercase tracking-[0.08em] text-win">
                  Won
                </span>
              ) : null}
              <span className="ml-auto flex shrink-0 items-baseline justify-end gap-2">
                {yetToBat ? (
                  <span className="text-[8px] font-bold uppercase tracking-[0.08em] text-faint">
                    Yet to bat
                  </span>
                ) : (
                  <span
                    className={cn(
                      "mono whitespace-nowrap text-[18px] font-medium leading-none tracking-[-0.03em] sm:text-[20px]",
                      placeholder && "text-[13px] text-faint",
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
                  <span className="hidden text-[9px] font-medium uppercase tracking-[0.04em] text-faint mono sm:inline">
                    {overs}
                  </span>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center gap-2 border-t border-line/70 pt-2">
        {live ? <LiveDot className="shrink-0" /> : null}
        <p
          className={cn(
            "min-w-0 flex-1 truncate text-[10px] leading-snug sm:text-[11px]",
            live ? "font-semibold text-ink/75" : "text-muted"
          )}
        >
          {matchStatusText(match)}
        </p>
        {match.venue?.city ? (
          <span className="hidden shrink-0 items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.05em] text-faint sm:inline-flex">
            <MapPin className="h-3 w-3" />
            {match.venue.city}
          </span>
        ) : null}
        <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-accent">
          Score
          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
