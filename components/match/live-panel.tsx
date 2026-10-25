import type { MatchDetail } from "@/lib/types";
import { formatOvers } from "@/lib/utils";
import { LiveDot, TonePill } from "@/components/ui/pills";

function ballTone(ball: string): string {
  if (ball === "W") return "bg-live text-white";
  if (ball === "4" || ball === "6") return "bg-accent text-accent-ink";
  if (ball === "wd" || ball === "nb") return "bg-sun/20 text-warn";
  return "bg-surface2 text-muted";
}

export function LivePanel({ detail }: { detail: MatchDetail }) {
  const live = detail.live;
  if (!live) return null;
  const currentInnings =
    detail.innings.find((innings) => innings.id === live.inningsId) ??
    detail.innings.at(-1);
  const totalOvers =
    live.totalOvers ??
    (detail.summary.format === "ODI"
      ? 50
      : detail.summary.format === "T20"
        ? 20
        : undefined);

  return (
    <section
      className="mt-4 border-y border-line bg-surface"
      aria-label="Live match state"
    >
      <div className="flex flex-wrap items-center gap-2 py-3">
        <TonePill tone="live">
          <LiveDot />
          Live
        </TonePill>
        <p className="min-w-0 flex-1 text-sm font-extrabold leading-snug">
          {live.status}
        </p>
        {live.event ? (
          <span className="rounded bg-live/10 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.06em] text-live">
            {live.event}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-3 border-y border-line">
        {[
          {
            label: "Score",
            value: currentInnings
              ? `${currentInnings.runs}/${currentInnings.wickets}`
              : "—",
            tone: "text-ink",
          },
          {
            label: "Overs",
            value: `${formatOvers(live.overs)}${totalOvers ? `/${formatOvers(totalOvers)}` : ""}`,
            tone: "text-ink",
          },
          {
            label: "Run rate",
            value: live.currentRunRate ? live.currentRunRate.toFixed(2) : "—",
            tone: "text-accent",
          },
        ].map((metric, index) => (
          <div
            key={metric.label}
            className={
              index < 2
                ? "border-r border-line px-4 py-3"
                : "px-4 py-3"
            }
          >
            <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-faint">
              {metric.label}
            </p>
            <p
              className={`mt-1 text-[22px] font-extrabold leading-none tabular-nums sm:text-[26px] ${metric.tone}`}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {live.target ? (
        <p className="border-b border-line px-4 py-2.5 text-xs font-medium text-muted">
          Target <strong className="text-ink">{live.target}</strong>
          {live.remainingRuns !== undefined
            ? ` · Need ${live.remainingRuns} from ${live.remainingBalls ?? 0} balls`
            : null}
          {live.requiredRunRate
            ? ` · RRR ${live.requiredRunRate.toFixed(2)}`
            : null}
        </p>
      ) : null}

      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div className="px-4 py-4 lg:border-r lg:border-line">
          {live.batters.length > 0 ? (
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-line text-[9px] uppercase tracking-[0.08em] text-faint">
                  <th className="pb-1.5 font-semibold">Batter</th>
                  <th className="w-9 pb-1.5 text-right font-semibold">R</th>
                  <th className="w-9 pb-1.5 text-right font-semibold">B</th>
                  <th className="w-9 pb-1.5 text-right font-semibold">4s</th>
                  <th className="w-9 pb-1.5 text-right font-semibold">6s</th>
                  <th className="w-12 pb-1.5 text-right font-semibold">SR</th>
                </tr>
              </thead>
              <tbody>
                {live.batters.map((batter) => (
                  <tr key={batter.id} className="border-b border-line/70 last:border-0">
                    <td className="py-2 font-bold">
                      {batter.name}
                      {batter.isStriker ? (
                        <span className="ml-1 text-accent">*</span>
                      ) : null}
                    </td>
                    <td className="py-2 text-right font-bold tabular-nums">
                      {batter.runs}
                    </td>
                    <td className="py-2 text-right tabular-nums text-muted">
                      {batter.balls}
                    </td>
                    <td className="py-2 text-right tabular-nums text-muted">
                      {batter.fours}
                    </td>
                    <td className="py-2 text-right tabular-nums text-muted">
                      {batter.sixes}
                    </td>
                    <td className="py-2 text-right tabular-nums text-muted">
                      {batter.strikeRate.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          {live.bowlers.length > 0 ? (
            <table className="mt-4 w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-line text-[9px] uppercase tracking-[0.08em] text-faint">
                  <th className="pb-1.5 font-semibold">Bowler</th>
                  <th className="w-9 pb-1.5 text-right font-semibold">O</th>
                  <th className="w-9 pb-1.5 text-right font-semibold">M</th>
                  <th className="w-9 pb-1.5 text-right font-semibold">R</th>
                  <th className="w-9 pb-1.5 text-right font-semibold">W</th>
                  <th className="w-12 pb-1.5 text-right font-semibold">Econ</th>
                </tr>
              </thead>
              <tbody>
                {live.bowlers.map((bowler) => (
                  <tr key={bowler.id} className="border-b border-line/70 last:border-0">
                    <td className="py-2 font-bold">{bowler.name}</td>
                    <td className="py-2 text-right tabular-nums text-muted">
                      {formatOvers(bowler.overs)}
                    </td>
                    <td className="py-2 text-right tabular-nums text-muted">
                      {bowler.maidens}
                    </td>
                    <td className="py-2 text-right tabular-nums text-muted">
                      {bowler.runs}
                    </td>
                    <td className="py-2 text-right font-bold tabular-nums">
                      {bowler.wickets}
                    </td>
                    <td className="py-2 text-right tabular-nums text-muted">
                      {bowler.economy.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>

        <div className="border-t border-line px-4 py-4 lg:border-t-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-faint">
              Recent balls
            </p>
            {live.partnership ? (
              <span className="text-[10px] font-bold text-muted">
                {live.partnership.runs} ({live.partnership.balls})
              </span>
            ) : null}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5" aria-label="Recent balls">
            {live.recentBalls.length > 0 ? (
              live.recentBalls.map((ball, index) =>
                ball === "|" ? (
                  <span
                    key={`${ball}-${index}`}
                    className="h-7 w-px bg-line-strong"
                  />
                ) : (
                  <span
                    key={`${ball}-${index}`}
                    className={`grid h-7 min-w-7 place-items-center rounded px-1 text-[11px] font-extrabold ${ballTone(ball)}`}
                  >
                    {ball}
                  </span>
                )
              )
            ) : (
              <span className="border border-dashed border-line px-3 py-2 text-xs text-muted">
                Waiting for the next ball.
              </span>
            )}
          </div>

          {live.lastWicket ? (
            <p className="mt-4 border-l-2 border-live pl-3 text-xs leading-relaxed text-muted">
              {live.lastWicket}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
