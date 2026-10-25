import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { MatchSummary } from "@/lib/types";
import {
  matchFormat,
  matchStatusText,
  teamOversText,
  teamScoreText,
} from "@/lib/match-display";
import { cn } from "@/lib/utils";
import { LiveDot } from "@/components/ui/pills";
import { TeamBadge } from "@/components/ui/team-badge";

export function FeaturedMatch({ match }: { match: MatchSummary }) {
  const live = match.state === "live";
  return (
    <Link
      href={`/match/${match.id}`}
      className="grain group block h-full border-[5px] border-panel-ink bg-bg text-ink shadow-[10px_10px_0_rgba(7,9,18,0.18)] transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3 border-b border-ink/15 px-4 py-3">
        <span
          className={cn(
            "inline-flex h-5 items-center gap-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.1em]",
            live ? "text-live" : "text-warn"
          )}
        >
          {live ? <LiveDot /> : null}
          {live ? "Live now" : "Next up"}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink/50">
          {matchFormat(match)}
        </span>
        <ArrowUpRight className="ml-auto h-4 w-4 text-ink/45 transition-colors group-hover:text-accent" />
      </div>

      <div className="flex-1 px-4 py-4">
        <div className="space-y-1">
          {match.teams.map((team) => {
            const score = teamScoreText(match, team);
            const overs = teamOversText(match, team);
            const current = live && match.currentBattingTeamId === team.id;
            const winner =
              match.state === "completed" && match.winnerTeamId === team.id;
            const yetToBat = score === "Yet to bat";
            const placeholder = score === "—";
            return (
              <div key={team.id} className="flex items-center gap-3 py-1">
                <TeamBadge
                  team={team}
                  size={28}
                  className="rounded-[2px] border-ink/10 bg-white"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold leading-tight">
                    {team.shortName}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 truncate font-mono text-[8px] uppercase tracking-[0.06em]",
                      current ? "text-accent" : "text-ink/50"
                    )}
                  >
                    {winner ? "Won" : current ? "Batting" : team.name}
                  </p>
                </div>
                <span className="flex shrink-0 items-baseline gap-1.5">
                  {yetToBat ? (
                    <span className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-ink/45">
                      Yet to bat
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "mono text-[20px] font-medium leading-none tracking-[-0.04em] sm:text-[24px]",
                        placeholder && "text-[13px] text-ink/45",
                        current ? "text-accent" : "text-ink"
                      )}
                    >
                      {score}
                    </span>
                  )}
                  {overs ? (
                    <span className="mono text-[8px] uppercase tracking-[0.04em] text-ink/45">
                      {overs}
                    </span>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-4 border-t border-ink/15 pt-3 text-[11px] font-medium leading-snug text-ink/65">
          {matchStatusText(match)}
        </p>
      </div>

      <div className="flex items-center gap-1.5 border-t border-ink/15 px-4 py-2.5 font-mono text-[8px] font-medium uppercase tracking-[0.08em] text-ink/50">
        {match.venue?.city ? (
          <>
            <MapPin className="h-3 w-3" />
            {match.venue.city}
          </>
        ) : (
          <span>Match centre</span>
        )}
        <span className="ml-auto text-accent transition-colors group-hover:text-ink">
          Open scorecard
        </span>
      </div>
    </Link>
  );
}
