import Link from "next/link";
import { Clock3, MapPin, Trophy } from "lucide-react";
import type { MatchDetail } from "@/lib/types";
import {
  matchFormat,
  matchStatusText,
  teamInnings,
} from "@/lib/match-display";
import { cn, formatDateTime } from "@/lib/utils";
import { LiveDot } from "@/components/ui/pills";
import { TeamBadge } from "@/components/ui/team-badge";

export function MatchHero({ detail }: { detail: MatchDetail }) {
  const summary = detail.summary;
  const live = summary.state === "live";
  const completed = summary.state === "completed";

  return (
    <section className="grain mt-3 overflow-hidden rounded-xl border border-panel-ink/15 bg-panel text-panel-ink">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-panel-ink/15 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-panel-muted">
        <span
          className={cn(
            "inline-flex h-5 items-center gap-1.5 font-mono text-[11px] tracking-[0.08em]",
            live ? "text-panel-ink" : completed ? "text-gold" : "text-panel-muted"
          )}
        >
          {live ? <LiveDot /> : null}
          {live ? "Live" : completed ? "Result" : "Upcoming"}
        </span>
        <span className="font-mono text-[11px] tracking-[0.06em]">
          {matchFormat(summary)}
        </span>
        {summary.seriesId ? (
          <Link
            href={`/series/${summary.seriesId}`}
            className="min-w-0 truncate normal-case tracking-normal text-panel-ink/60 transition-colors hover:text-panel-ink"
          >
            {summary.seriesName}
          </Link>
        ) : null}
        <span className="ml-auto hidden items-center gap-1.5 sm:inline-flex">
          <Clock3 className="h-3 w-3" />
          {formatDateTime(summary.startTime)}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_298px]">
        <div className="min-w-0 divide-y divide-panel-ink/10">
          {summary.teams.map((team) => {
            const innings = teamInnings(summary, team.id);
            const current =
              live && summary.currentBattingTeamId === team.id;
            const winner = completed && summary.winnerTeamId === team.id;
            return (
              <div
                key={team.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-4 sm:gap-3.5 sm:px-6 sm:py-5",
                  current && "bg-panel-ink/[0.06]"
                )}
              >
                <TeamBadge
                  team={team}
                  size={36}
                  className="rounded-md border-panel-ink/20 bg-panel-ink"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/teams/${team.id}`}
                    className="line-clamp-2 text-[17px] font-semibold leading-tight tracking-[-0.02em] transition-colors hover:text-gold sm:text-[20px]"
                  >
                    {team.name}
                  </Link>
                  <p className="mt-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-panel-muted">
                    <span>{team.shortName}</span>
                    {winner ? <span className="text-gold">Won</span> : null}
                    {current ? <span className="text-panel-ink">Batting</span> : null}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5 text-right sm:flex-row sm:items-end sm:gap-4">
                  {innings.length > 0 ? (
                    innings.map((item, index) => {
                      const activeInnings =
                        current && index === innings.length - 1;
                      return (
                        <span key={item.inningsId} className="block">
                          <span
                            className={cn(
                              "mono block text-[24px] font-semibold leading-none tracking-[-0.03em] sm:text-[30px]",
                              activeInnings ? "text-gold" : "text-panel-ink"
                            )}
                          >
                            {item.runs}/{item.wickets}
                          </span>
                          <span className="mono mt-1 block text-[11px] uppercase tracking-[0.04em] text-panel-muted">
                            {item.overs} overs
                          </span>
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-panel-muted">
                      Yet to bat
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-[#631e25] px-5 py-5 text-[#f8efe1] lg:border-l lg:border-panel-ink/15">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-75">
            Match status
          </p>
          <p className="mt-2 text-[18px] font-semibold leading-snug tracking-[-0.01em]">
            {matchStatusText(summary)}
          </p>
          {detail.resultText && detail.resultText !== summary.status ? (
            <p className="mt-2 text-[12px] leading-relaxed opacity-75">
              {detail.resultText}
            </p>
          ) : null}

          <div className="mt-4 space-y-2 border-t border-[#f8efe1]/20 pt-3 text-[12px] leading-relaxed opacity-85">
            {detail.venue ? (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                <span>
                  {detail.venue.ground}
                  {detail.venue.city ? `, ${detail.venue.city}` : ""}
                </span>
              </p>
            ) : null}
            {detail.toss ? (
              <p className="flex items-start gap-2">
                <Trophy className="mt-0.5 h-3 w-3 shrink-0" />
                <span>
                  {detail.toss.winnerName} won the toss and chose to{" "}
                  {detail.toss.decision.toLowerCase()}
                </span>
              </p>
            ) : (
              <p className="flex items-start gap-2 sm:hidden">
                <Clock3 className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{formatDateTime(summary.startTime)}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
