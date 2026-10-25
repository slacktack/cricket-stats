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
    <section className="mt-3 overflow-hidden rounded-xl border border-ink/15 bg-[#0a111c] text-white">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white/45">
        <span
          className={cn(
            "inline-flex h-5 items-center gap-1.5 rounded px-1.5 text-[9px]",
            live ? "bg-live text-white" : "bg-white/10 text-white/65"
          )}
        >
          {live ? <LiveDot className="bg-white" /> : null}
          {live ? "Live" : completed ? "Result" : "Upcoming"}
        </span>
        <span>{matchFormat(summary)}</span>
        {summary.seriesId ? (
          <Link
            href={`/series/${summary.seriesId}`}
            className="min-w-0 truncate normal-case tracking-normal text-white/55 transition-colors hover:text-white"
          >
            {summary.seriesName}
          </Link>
        ) : null}
        <span className="ml-auto hidden items-center gap-1.5 sm:inline-flex">
          <Clock3 className="h-3 w-3" />
          {formatDateTime(summary.startTime)}
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_270px]">
        <div className="divide-y divide-white/10">
          {summary.teams.map((team) => {
            const innings = teamInnings(summary, team.id);
            const current =
              live && summary.currentBattingTeamId === team.id;
            const winner = completed && summary.winnerTeamId === team.id;
            return (
              <div
                key={team.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-4 sm:px-5",
                  current && "bg-white/[0.045]"
                )}
              >
                <TeamBadge
                  team={team}
                  size={40}
                  className="rounded-md border-white/20 bg-white"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/teams/${team.id}`}
                    className="block truncate text-[17px] font-extrabold leading-tight tracking-[-0.02em] transition-colors hover:text-accent"
                  >
                    {team.name}
                  </Link>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">
                    {team.shortName}
                    {winner ? " · Won" : current ? " · Batting" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-end gap-3 text-right">
                  {innings.length > 0 ? (
                    innings.map((item, index) => {
                      const activeInnings =
                        current && index === innings.length - 1;
                      return (
                      <span key={item.inningsId} className="block">
                        <span
                          className={cn(
                            "block text-[22px] font-extrabold leading-none tabular-nums sm:text-[26px]",
                            activeInnings ? "text-accent" : "text-white"
                          )}
                        >
                          {item.runs}/{item.wickets}
                        </span>
                        <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.06em] text-white/35">
                          {item.overs} ov
                        </span>
                      </span>
                      );
                    })
                  ) : (
                    <span className="text-sm font-semibold text-white/35">
                      Yet to bat
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/10 px-4 py-4 lg:border-l lg:border-t-0 sm:px-5">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/35">
            Match status
          </p>
          <p className="mt-1.5 text-sm font-semibold leading-snug text-white/85">
            {matchStatusText(summary)}
          </p>
          {detail.resultText && detail.resultText !== summary.status ? (
            <p className="mt-1.5 text-xs leading-relaxed text-white/50">
              {detail.resultText}
            </p>
          ) : null}

          <div className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-white/40">
            {detail.venue ? (
              <p className="flex items-start gap-1.5">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                <span>
                  {detail.venue.ground}
                  {detail.venue.city ? `, ${detail.venue.city}` : ""}
                </span>
              </p>
            ) : null}
            {detail.toss ? (
              <p className="flex items-start gap-1.5">
                <Trophy className="mt-0.5 h-3 w-3 shrink-0" />
                <span>
                  {detail.toss.winnerName} won the toss, chose to{" "}
                  {detail.toss.decision.toLowerCase()}
                </span>
              </p>
            ) : (
              <p className="flex items-start gap-1.5 sm:hidden">
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
