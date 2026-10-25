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
      className="featured-card group relative overflow-hidden rounded-2xl border border-white/10 p-4 text-white transition-transform duration-300 hover:-translate-y-1 sm:p-5"
    >
      <div className="relative flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-[9px] font-extrabold uppercase tracking-[0.1em]",
            "bg-white/10 text-white/75 ring-1 ring-inset ring-white/15"
          )}
        >
          {live ? <LiveDot /> : null}
          {live ? "Live now" : "Next up"}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/50">
          {matchFormat(match)}
        </span>
        <ArrowUpRight className="ml-auto h-4 w-4 text-white/45 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
      </div>

      <div className="relative mt-3 space-y-1">
        {match.teams.map((team) => {
          const score = teamScoreText(match, team);
          const overs = teamOversText(match, team);
          const current =
            live && match.currentBattingTeamId === team.id;
          const winner =
            match.state === "completed" && match.winnerTeamId === team.id;
          return (
            <div
              key={team.id}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-1 py-1",
                current && "bg-white/[0.06]"
              )}
            >
              <TeamBadge
                team={team}
                size={20}
                className="rounded-md ring-1 ring-white/20"
              />
              <span className="min-w-0 truncate text-sm font-extrabold">
                {team.shortName}
              </span>
              <span className="hidden min-w-0 truncate text-[10px] text-white/45 2xl:inline">
                {team.name}
              </span>
              {winner ? (
                <span className="rounded-full bg-white/12 px-1.5 py-0.5 text-[7px] font-extrabold uppercase tracking-wide text-white/75">
                  Won
                </span>
              ) : null}
              <span className="ml-auto flex shrink-0 items-baseline gap-1.5 whitespace-nowrap">
                <span
                  className={cn(
                    "text-lg font-extrabold tabular-nums sm:text-xl",
                    current && "text-white"
                  )}
                >
                  {score}
                </span>
                {overs ? (
                  <span className="text-[9px] font-medium tabular-nums text-white/40">
                    {overs}
                  </span>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>

      <p className="relative mt-3 line-clamp-1 text-[11px] font-medium text-white/65">
        {matchStatusText(match)}
      </p>
      <div className="relative mt-2 flex items-center gap-1.5 border-t border-white/10 pt-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-white/40">
        {match.venue?.city ? (
          <>
            <MapPin className="h-3 w-3" />
            {match.venue.city}
          </>
        ) : (
          <span>Match centre</span>
        )}
        <span className="ml-auto text-white/65 transition-colors group-hover:text-white">
          Open match
        </span>
      </div>
    </Link>
  );
}
