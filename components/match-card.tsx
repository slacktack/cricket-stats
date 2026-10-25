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
import { FormatPill, LiveDot } from "@/components/ui/pills";
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
        compact ? "p-3" : "p-3.5 sm:p-4",
        className
      )}
    >
      <div className="relative flex items-center gap-2">
        <FormatPill format={matchFormat(match)} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-faint sm:text-[11px]">
          {meta}
        </span>
        {live ? (
          <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-live/10 px-2 text-[9px] font-extrabold uppercase tracking-[0.08em] text-live ring-1 ring-inset ring-live/15">
            <LiveDot />
            Live
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex h-6 shrink-0 items-center rounded-full px-2 text-[9px] font-extrabold uppercase tracking-[0.08em]",
              "bg-surface2 text-muted"
            )}
          >
            {match.state === "upcoming" ? "Upcoming" : "Result"}
          </span>
        )}
      </div>

      <div className={cn("relative", compact ? "mt-2" : "mt-2.5")}>
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
                "flex min-h-[34px] items-center gap-2.5 rounded-lg px-1 py-0.5 transition-colors",
                isCurrent && "bg-accent/[0.055]",
                live && !isCurrent && "opacity-85"
              )}
            >
              <TeamBadge
                team={team}
                size={compact ? 18 : 21}
                className="rounded-[0.45rem] shadow-sm ring-1 ring-ink/5"
              />
              <span
                className={cn(
                  "min-w-0 truncate text-[13px] font-extrabold leading-tight tracking-[-0.01em] sm:text-sm",
                  isCurrent || isWinner
                    ? "text-ink"
                    : match.state === "upcoming"
                      ? "text-muted"
                      : "text-ink/90"
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
                <span className="shrink-0 rounded-full bg-win/10 px-1.5 py-0.5 text-[7px] font-extrabold uppercase tracking-[0.08em] text-win">
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
                      "whitespace-nowrap text-[17px] font-extrabold leading-none tnum sm:text-[19px]",
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
                  <span className="hidden text-[9px] font-medium uppercase tracking-[0.04em] text-faint tnum sm:inline">
                    {overs}
                  </span>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative mt-2.5 flex items-center gap-2 border-t border-line/70 pt-2">
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
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface2 text-faint transition-all duration-200 group-hover:bg-accent group-hover:text-accent-ink">
          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
