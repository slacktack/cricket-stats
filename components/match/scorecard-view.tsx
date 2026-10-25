import Link from "next/link";
import type { InningsDetail, MatchDetail } from "@/lib/types";
import { cn, formatOvers } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { TeamBadge } from "@/components/ui/team-badge";

function PlayerLink({ id, name }: { id: number; name: string }) {
  if (!id) return <span>{name}</span>;
  return (
    <Link href={`/players/${id}`} className="font-semibold transition-colors hover:text-accent">
      {name}
    </Link>
  );
}

function Tag({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "accent" }) {
  return (
    <span
      className={cn(
        "mono inline-flex h-[19px] items-center rounded px-1.5 text-[10px] font-semibold uppercase tracking-[0.06em]",
        tone === "accent"
          ? "bg-accent/10 text-accent"
          : "border border-line-strong text-faint"
      )}
    >
      {children}
    </span>
  );
}

function InningsCard({ innings }: { innings: InningsDetail }) {
  const extras = [
    innings.extras.byes ? `b ${innings.extras.byes}` : "",
    innings.extras.legByes ? `lb ${innings.extras.legByes}` : "",
    innings.extras.wides ? `w ${innings.extras.wides}` : "",
    innings.extras.noBalls ? `nb ${innings.extras.noBalls}` : "",
    innings.extras.penalty ? `p ${innings.extras.penalty}` : "",
  ]
    .filter(Boolean)
    .join(", ");
  const topScore = Math.max(0, ...innings.batsmen.map((batter) => batter.runs));
  const topBatter = innings.batsmen.find((batter) => batter.runs === topScore);

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-panel-ink/25 bg-panel px-4 py-3.5 text-panel-ink">
        <TeamBadge team={innings.battingTeam} size={34} className="rounded-md border-panel-ink/20 bg-panel-ink" />
        <div className="min-w-0 flex-1">
          <Link href={`/teams/${innings.battingTeam.id}`} className="line-clamp-2 text-[15px] font-semibold leading-tight text-panel-ink transition-colors hover:text-panel-muted">
            {innings.battingTeam.name}
          </Link>
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-panel-muted">
            {innings.declared ? "Declared" : innings.followOn ? "Following on" : "Innings"}
            {innings.target ? ` · Target ${innings.target}` : ""}
            {innings.isCurrent ? " · Current" : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="mono text-[26px] font-semibold leading-none tracking-[-0.03em] text-panel-ink">
            {innings.runs}/{innings.wickets}
          </p>
          <p className="mono mt-1.5 text-[11px] uppercase tracking-[0.04em] text-panel-muted">
            {formatOvers(innings.overs)} ov · RR {innings.runRate.toFixed(2)}
          </p>
        </div>
      </div>

      {innings.batsmen.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-3 border-b border-line bg-sage/40 px-4 py-2">
            <span className="mono text-[10px] font-medium uppercase tracking-[0.14em] text-accent">
              Batting
            </span>
            {topBatter && topScore > 0 ? (
              <span className="mono min-w-0 truncate text-[11px] uppercase tracking-[0.04em] text-faint">
                Top <span className="font-medium text-ink">{topScore}</span> · {topBatter.name}
              </span>
            ) : null}
          </div>
          <div className="table-scroll">
            <table className="w-full table-fixed text-left text-xs sm:text-[13px]">
              <thead className="border-b border-line-strong bg-surface2/35 text-[10px] font-bold uppercase tracking-[0.1em] text-faint">
                <tr>
                  <th className="px-3 py-2 font-semibold sm:px-4">Batter</th>
                  <th className="w-[52px] px-1.5 py-2 text-right font-semibold sm:px-2">R</th>
                  <th className="w-[52px] px-1.5 py-2 text-right font-semibold sm:px-2">B</th>
                  <th className="hidden w-[44px] px-1.5 py-2 text-right font-semibold sm:table-cell sm:px-2">4s</th>
                  <th className="hidden w-[44px] px-1.5 py-2 text-right font-semibold sm:table-cell sm:px-2">6s</th>
                  <th className="w-[68px] px-3 py-2 text-right font-semibold sm:px-4">SR</th>
                </tr>
              </thead>
              <tbody>
                {innings.batsmen.map((batter, index) => {
                  const isTop = topScore > 0 && batter.runs === topScore;
                  return (
                    <tr
                      key={`${batter.id}-${index}`}
                      className={cn(
                        "border-b border-line/60 transition-colors last:border-0 hover:bg-accent/[0.04]",
                        isTop && "bg-accent/[0.035]"
                      )}
                    >
                      <td className="px-3 py-3 sm:px-4">
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 [&_a]:text-[13px] [&_a]:font-bold [&_a]:text-ink sm:[&_a]:text-[14px]">
                          <PlayerLink id={batter.id} name={batter.name} />
                          {batter.isCaptain ? <Tag>C</Tag> : null}
                          {batter.isKeeper ? <Tag>WK</Tag> : null}
                          {batter.isOut ? null : <Tag tone="accent">Not out</Tag>}
                        </div>
                        {(batter.isOut ? batter.outDesc : "") ? (
                          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-faint sm:text-xs">
                            {batter.outDesc}
                          </p>
                        ) : null}
                        {batter.fours > 0 || batter.sixes > 0 ? (
                          <p className="mt-1 text-[11px] text-faint sm:hidden">
                            {[
                              batter.fours > 0 ? `${batter.fours}×4` : "",
                              batter.sixes > 0 ? `${batter.sixes}×6` : "",
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        ) : null}
                      </td>
                      <td className="mono px-1.5 py-3 text-right text-[15px] font-medium leading-none sm:px-2 sm:text-[17px]">
                        {batter.runs}
                      </td>
                      <td className="px-1.5 py-3 text-right tabular-nums text-muted sm:px-2">{batter.balls}</td>
                      <td className="hidden px-1.5 py-3 text-right tabular-nums text-muted sm:table-cell sm:px-2">{batter.fours}</td>
                      <td className="hidden px-1.5 py-3 text-right tabular-nums text-muted sm:table-cell sm:px-2">{batter.sixes}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted sm:px-4">{batter.strikeRate.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      <div className="border-t border-line bg-sage/35 px-4 py-3 text-xs text-muted">
        <div className="flex flex-wrap justify-between gap-2">
          <span>
            Extras <strong className="text-ink">{innings.extras.total}</strong>
            {extras ? <span className="text-faint"> ({extras})</span> : null}
          </span>
          <span>
            Total <strong className="mono font-medium text-ink">{innings.runs}/{innings.wickets}</strong>
            <span className="text-faint"> ({formatOvers(innings.overs)} ov)</span>
          </span>
        </div>
        {innings.fallOfWickets.length > 0 ? (
          <p className="mt-2 leading-relaxed text-faint">
            <span className="font-semibold text-muted">FOW:</span>{" "}
            {innings.fallOfWickets.map((wicket) => `${wicket.runs}/${wicket.wickets} (${wicket.batsmanName}, ${formatOvers(wicket.overs)})`).join(", ")}
          </p>
        ) : null}
      </div>

      {innings.bowlers.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-3 border-y border-line bg-sage/40 px-4 py-2">
            <span className="mono text-[10px] font-medium uppercase tracking-[0.14em] text-accent">
              Bowling
            </span>
            <span className="mono text-[11px] uppercase tracking-[0.04em] text-faint">
              {innings.bowlers.length} bowlers
            </span>
          </div>
          <div className="table-scroll">
            <table className="w-full table-fixed text-left text-xs sm:text-[13px]">
              <thead className="border-b border-line-strong bg-surface2/35 text-[10px] font-bold uppercase tracking-[0.1em] text-faint">
                <tr>
                  <th className="px-3 py-2 font-semibold sm:px-4">Bowler</th>
                  <th className="w-[52px] px-1.5 py-2 text-right font-semibold sm:px-2">O</th>
                  <th className="hidden w-[44px] px-1.5 py-2 text-right font-semibold sm:table-cell sm:px-2">M</th>
                  <th className="w-[52px] px-1.5 py-2 text-right font-semibold sm:px-2">R</th>
                  <th className="w-[44px] px-1.5 py-2 text-right font-semibold sm:px-2">W</th>
                  <th className="w-[68px] px-3 py-2 text-right font-semibold sm:px-4">Econ</th>
                </tr>
              </thead>
              <tbody>
                {innings.bowlers.map((bowler, index) => (
                  <tr key={`${bowler.id}-${index}`} className="border-b border-line/60 transition-colors last:border-0 hover:bg-accent/[0.04]">
                    <td className="px-3 py-3 sm:px-4">
                      <div className="[&_a]:text-[12.5px] [&_a]:font-semibold [&_a]:text-ink sm:[&_a]:text-[13px]">
                        <PlayerLink id={bowler.id} name={bowler.name} />
                      </div>
                    </td>
                    <td className="px-1.5 py-3 text-right tabular-nums text-muted sm:px-2">{formatOvers(bowler.overs)}</td>
                    <td className="hidden px-1.5 py-3 text-right tabular-nums text-muted sm:table-cell sm:px-2">{bowler.maidens}</td>
                    <td className="px-1.5 py-3 text-right tabular-nums text-muted sm:px-2">{bowler.runs}</td>
                    <td className="mono px-1.5 py-3 text-right text-[15px] font-medium leading-none sm:px-2">{bowler.wickets}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted sm:px-4">{bowler.economy.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}

export function ScorecardView({ detail }: { detail: MatchDetail }) {
  if (detail.innings.length === 0) {
    return (
      <EmptyState
        title="Scorecard not available yet"
        description={detail.summary.state === "upcoming" ? "The match has not started. The full scorecard will appear after the first ball." : "The scorecard is not available for this match."}
        actionHref={`/series/${detail.series.id}`}
        actionLabel="View series"
        className="mt-4"
      />
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {detail.innings.map((innings) => (
        <InningsCard key={innings.id} innings={innings} />
      ))}
      <p className="text-xs text-faint">
        Scorecard updated from the live feed. Batting and bowling figures may lag by a delivery.
      </p>
    </div>
  );
}
