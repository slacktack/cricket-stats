import Link from "next/link";
import type { InningsDetail, MatchDetail } from "@/lib/types";
import { formatOvers } from "@/lib/utils";
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

  return (
    <section className="overflow-hidden border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 bg-[#0a111c] px-4 py-3 text-white">
        <TeamBadge team={innings.battingTeam} size={32} className="rounded-md border-white/20 bg-white" />
        <div className="min-w-0 flex-1">
          <Link href={`/teams/${innings.battingTeam.id}`} className="truncate text-sm font-bold transition-colors hover:text-white/75">
            {innings.battingTeam.name}
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-white/35">
            {innings.declared ? "Declared" : innings.followOn ? "Following on" : "Innings"}
            {innings.target ? ` · Target ${innings.target}` : ""}
            {innings.isCurrent ? " · Current" : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold tabular-nums">
            {innings.runs}/{innings.wickets}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-white/35">
            {formatOvers(innings.overs)} ov · RR {innings.runRate.toFixed(2)}
          </p>
        </div>
      </div>

      {innings.batsmen.length > 0 ? (
        <div className="table-scroll">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead className="border-b border-line text-[10px] uppercase tracking-wide text-faint">
              <tr>
                <th className="px-4 py-2 font-semibold">Batter</th>
                <th className="px-2 py-2 text-right font-semibold">R</th>
                <th className="px-2 py-2 text-right font-semibold">B</th>
                <th className="px-2 py-2 text-right font-semibold">4s</th>
                <th className="px-2 py-2 text-right font-semibold">6s</th>
                <th className="px-4 py-2 text-right font-semibold">SR</th>
              </tr>
            </thead>
            <tbody>
              {innings.batsmen.map((batter, index) => (
                <tr key={`${batter.id}-${index}`} className="border-b border-line/70 transition-colors last:border-0 hover:bg-accent/[0.03]">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <PlayerLink id={batter.id} name={batter.name} />
                      {batter.isCaptain ? <span className="text-[10px] text-faint">(c)</span> : null}
                      {batter.isKeeper ? <span className="text-[10px] text-faint">(wk)</span> : null}
                      {batter.isOut ? null : <span className="text-[10px] font-semibold text-win">not out</span>}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-faint">{batter.outDesc}</p>
                  </td>
                  <td className="px-2 py-2.5 text-right font-bold tabular-nums">{batter.runs}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-muted">{batter.balls}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-muted">{batter.fours}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-muted">{batter.sixes}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted">{batter.strikeRate.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="border-t border-line px-4 py-3 text-xs text-muted">
        <div className="flex flex-wrap justify-between gap-2">
          <span>
            Extras <strong className="text-ink">{innings.extras.total}</strong>
            {extras ? <span className="text-faint"> ({extras})</span> : null}
          </span>
          <span>
            Total <strong className="text-ink">{innings.runs}/{innings.wickets}</strong>
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
        <div className="table-scroll border-t border-line">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="border-b border-line text-[10px] uppercase tracking-wide text-faint">
              <tr>
                <th className="px-4 py-2 font-semibold">Bowler</th>
                <th className="px-2 py-2 text-right font-semibold">O</th>
                <th className="px-2 py-2 text-right font-semibold">M</th>
                <th className="px-2 py-2 text-right font-semibold">R</th>
                <th className="px-2 py-2 text-right font-semibold">W</th>
                <th className="px-4 py-2 text-right font-semibold">Econ</th>
              </tr>
            </thead>
            <tbody>
              {innings.bowlers.map((bowler, index) => (
                <tr key={`${bowler.id}-${index}`} className="border-b border-line/70 transition-colors last:border-0 hover:bg-accent/[0.03]">
                  <td className="px-4 py-2.5">
                    <PlayerLink id={bowler.id} name={bowler.name} />
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-muted">{formatOvers(bowler.overs)}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-muted">{bowler.maidens}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-muted">{bowler.runs}</td>
                  <td className="px-2 py-2.5 text-right font-bold tabular-nums">{bowler.wickets}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted">{bowler.economy.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
