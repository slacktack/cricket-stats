import type { MatchDetail } from "@/lib/types";
import { formatOvers } from "@/lib/utils";
import { TonePill } from "@/components/ui/pills";

function ballTone(ball: string): string {
  if (ball === "W") return "bg-live text-white";
  if (ball === "4" || ball === "6") return "bg-accent text-accent-ink";
  if (ball === "wd" || ball === "nb") return "bg-warn/15 text-warn";
  return "bg-surface2 text-muted";
}

export function LivePanel({ detail }: { detail: MatchDetail }) {
  const live = detail.live;
  if (!live) return null;
  const currentInnings = detail.innings.find((innings) => innings.id === live.inningsId) ?? detail.innings.at(-1);
  const totalOvers = live.totalOvers ?? (detail.summary.format === "ODI" ? 50 : detail.summary.format === "T20" ? 20 : undefined);

  return (
    <section className="card mt-4 overflow-hidden" aria-label="Live match state">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <TonePill tone="live">Live</TonePill>
        <p className="min-w-0 flex-1 text-sm font-semibold leading-snug">{live.status}</p>
        {live.event ? <span className="text-xs text-live">{live.event}</span> : null}
      </div>

      <div className="grid gap-0 sm:grid-cols-2">
        <div className="border-b border-line p-4 sm:border-b-0 sm:border-r">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">Score</p>
              <p className="mt-1 text-lg font-bold tabular-nums">
                {currentInnings ? `${currentInnings.runs}/${currentInnings.wickets}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">CRR</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{live.currentRunRate ? live.currentRunRate.toFixed(2) : "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">Overs</p>
              <p className="mt-1 text-lg font-bold tabular-nums">
                {formatOvers(live.overs)}
                {totalOvers ? <span className="text-xs font-medium text-faint">/{formatOvers(totalOvers)}</span> : null}
              </p>
            </div>
          </div>

          {live.target ? (
            <p className="mt-3 rounded-lg bg-surface2 px-3 py-2 text-xs text-muted">
              Target <strong className="text-ink">{live.target}</strong>
              {live.remainingRuns !== undefined ? ` · Need ${live.remainingRuns} from ${live.remainingBalls ?? 0} balls` : null}
              {live.requiredRunRate ? ` · RRR ${live.requiredRunRate.toFixed(2)}` : null}
            </p>
          ) : null}

          {live.batters.length > 0 ? (
            <div className="mt-4 space-y-2">
              {live.batters.map((batter) => (
                <div key={batter.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-semibold">
                    {batter.name}
                    {batter.isStriker ? <span className="ml-1 text-accent">*</span> : null}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {batter.runs} <span className="text-xs text-faint">({batter.balls})</span>
                    <span className="ml-2 text-xs text-faint">SR {batter.strikeRate.toFixed(1)}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {live.bowlers.length > 0 ? (
            <div className="mt-3 space-y-2 border-t border-line pt-3">
              {live.bowlers.map((bowler) => (
                <div key={bowler.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-semibold">{bowler.name}</span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {bowler.wickets}/{bowler.runs} <span className="text-xs text-faint">({formatOvers(bowler.overs)})</span>
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">Recent balls</p>
            {live.partnership ? (
              <span className="text-xs text-muted">
                Partnership {live.partnership.runs} ({live.partnership.balls})
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Recent balls">
            {live.recentBalls.length > 0 ? (
              live.recentBalls.map((ball, index) =>
                ball === "|" ? (
                  <span key={`${ball}-${index}`} className="w-px bg-line" />
                ) : (
                  <span
                    key={`${ball}-${index}`}
                    className={`grid h-8 min-w-8 place-items-center rounded-md px-1.5 text-xs font-bold ${ballTone(ball)}`}
                  >
                    {ball}
                  </span>
                )
              )
            ) : (
              <span className="text-xs text-muted">Waiting for the next ball.</span>
            )}
          </div>
          {live.lastWicket ? (
            <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-muted">{live.lastWicket}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
