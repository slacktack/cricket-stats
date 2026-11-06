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
      {detail.squads.map((squad, i) => (
        <section key={squad.team.id} data-rv style={{ "--gd": `${i * 70}ms` } as React.CSSProperties}>
          <div className="blk">
            <div className="band">
              <div className="flex min-w-0 items-center gap-2.5">
                <TeamBadge team={squad.team} size={24} />
                <Link
                  href={`/teams/${squad.team.id}`}
                  className="min-w-0 truncate text-[13px] font-bold text-ink transition-colors hover:text-accent"
                >
                  {squad.team.name}
                </Link>
              </div>
              <span>{squad.players.length} players</span>
            </div>
            <table className="dtable">
              <colgroup>
                <col />
                <col className="w-[54px]" />
              </colgroup>
              <tbody>
                {squad.players.map((player, index) => (
                  <tr key={`${player.id}-${index}`} className="drow">
                    <td data-lead>
                      <div className="flex items-center gap-2.5">
                        <PlayerAvatar
                          player={{ id: player.id, name: player.name, faceImageId: player.faceImageId }}
                          size={30}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {player.id ? (
                              <Link href={`/players/${player.id}`} className="dname truncate">
                                {player.name}
                              </Link>
                            ) : (
                              <span className="dname truncate">{player.name}</span>
                            )}
                            {player.captain ? <span className="dtag" data-tone="milestone">C</span> : null}
                            {player.keeper ? <span className="dtag">WK</span> : null}
                            {player.substitute ? <span className="dtag">Sub</span> : null}
                            {player.isOverseas ? <span className="dtag">OS</span> : null}
                          </div>
                          <p className="dnote truncate">
                            {[player.role, player.battingStyle, player.bowlingStyle]
                              .filter(Boolean)
                              .join(" · ") || "Player"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td data-trail className="text-right">
                      <span className="mono text-[11px] text-faint tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
