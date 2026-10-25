import Link from "next/link";
import type { MatchDetail } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { PlayerAvatar, TeamBadge } from "@/components/ui/team-badge";

export function SquadsView({ detail }: { detail: MatchDetail }) {
  if (detail.squads.length === 0) {
    return (
      <EmptyState
        title="Squads not announced"
        description="The playing XIs will appear here once the teams are announced."
        actionHref={`/series/${detail.series.id}`}
        actionLabel="View series"
        className="mt-4"
      />
    );
  }

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      {detail.squads.map((squad) => (
        <section key={squad.team.id} className="card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-line bg-surface2/60 px-4 py-3">
            <TeamBadge team={squad.team} size={30} />
            <Link href={`/teams/${squad.team.id}`} className="min-w-0 flex-1 truncate text-sm font-bold transition-colors hover:text-accent">
              {squad.team.name}
            </Link>
            <span className="text-[11px] text-faint">{squad.players.length} players</span>
          </div>
          <div className="divide-y divide-line/70">
            {squad.players.map((player) => (
              <div key={player.id} className="flex items-center gap-3 px-4 py-2.5">
                <PlayerAvatar player={{ id: player.id, name: player.name, faceImageId: player.faceImageId }} size={54} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {player.id ? (
                      <Link href={`/players/${player.id}`} className="truncate text-[13px] font-semibold transition-colors hover:text-accent">
                        {player.name}
                      </Link>
                    ) : (
                      <span className="truncate text-[13px] font-semibold">{player.name}</span>
                    )}
                    {player.captain ? <span className="rounded bg-accent-soft px-1 text-[9px] font-bold text-accent">C</span> : null}
                    {player.keeper ? <span className="rounded bg-surface2 px-1 text-[9px] font-bold text-muted">WK</span> : null}
                    {player.substitute ? <span className="rounded bg-surface2 px-1 text-[9px] text-faint">SUB</span> : null}
                    {player.isOverseas ? <span className="rounded bg-warn/10 px-1 text-[9px] text-warn">OS</span> : null}
                  </div>
                  <p className="truncate text-[11px] text-faint">
                    {[player.role, player.battingStyle, player.bowlingStyle].filter(Boolean).join(" · ") || "Player"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
