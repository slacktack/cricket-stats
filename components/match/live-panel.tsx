import type { MatchDetail } from "@/lib/types";
import { formatOvers } from "@/lib/utils";
import { LiveDot, TonePill } from "@/components/ui/pills";
import { WinProbabilityBar } from "@/components/match/match-numbers";

function ChaseBar({
  target,
  scored,
  remainingRuns,
  remainingBalls,
  currentRate,
  requiredRate,
}: {
  target: number;
  scored: number;
  remainingRuns?: number;
  remainingBalls?: number;
  currentRate?: number;
  requiredRate?: number;
}) {
  const percent = Math.min(100, Math.max(0, (scored / target) * 100));
  const ahead =
    currentRate !== undefined && requiredRate !== undefined && currentRate >= requiredRate;
  return (
    <div className="border-b border-line px-4 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-[13px] font-bold">
          Target <span className="mono text-[17px]">{target}</span>
        </p>
        {remainingRuns !== undefined ? (
          <p className="text-[13px] font-semibold text-muted">
            Need <strong className="mono text-[17px] text-ink">{remainingRuns}</strong> from{" "}
            <strong className="mono text-ink">{remainingBalls ?? 0}</strong> balls
          </p>
        ) : null}
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface2" role="img" aria-label={`${scored} of ${target} runs`}>
        <span
          className="block h-full rounded-full bg-accent transition-[width] duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-faint">
          {scored} of {target}
        </span>
        {requiredRate !== undefined ? (
          <span className={ahead ? "font-bold text-win" : "font-bold text-live"}>
            {ahead ? "Ahead of the rate" : "Behind the rate"} · need {requiredRate.toFixed(2)}
            {currentRate ? ` vs ${currentRate.toFixed(2)}` : ""}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ballTone(ball: string): string {
  if (ball === "W") return "border border-live bg-live text-white";
  if (ball === "4" || ball === "6") return "border border-win/25 bg-win/12 text-win";
  if (ball === "wd" || ball === "nb") return "border border-gold/30 bg-gold/12 text-warn";
  return "border border-line bg-surface2 text-muted";
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
      className="mt-4 overflow-hidden rounded-xl border border-line bg-surface"
      aria-label="Live match state"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <TonePill tone="live">
          <LiveDot />
          Live
        </TonePill>
        <p className="min-w-0 flex-1 text-[13px] font-bold leading-snug">
          {live.status}
        </p>
        {live.event ? (
          <span className="rounded border border-live/20 bg-live/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-live">
            {live.event}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-3 border-b border-line bg-sage/55">
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
                ? "border-r border-line px-4 py-3.5"
                : "px-4 py-3.5"
            }
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-faint">
              {metric.label}
            </p>
            <p
              className={`mono mt-1.5 text-[22px] font-semibold leading-none tracking-[-0.03em] sm:text-[26px] ${metric.tone}`}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {live.target ? (
        <ChaseBar
          target={live.target}
          scored={currentInnings?.runs ?? 0}
          remainingRuns={live.remainingRuns}
          remainingBalls={live.remainingBalls}
          currentRate={live.currentRunRate}
          requiredRate={live.requiredRunRate}
        />
      ) : null}

      {detail.winProbability ? (
        <div className="border-b border-line px-4 py-4">
          <WinProbabilityBar probability={detail.winProbability} />
        </div>
      ) : null}

      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div className="px-4 py-4 lg:border-r lg:border-line">
          {live.batters.length > 0 ? (
            <table className="w-full text-left text-xs sm:text-[13px]">
              <thead>
                <tr className="border-b border-line-strong text-[10px] font-bold uppercase tracking-[0.1em] text-faint">
                  <th className="pb-2 font-semibold">Batter</th>
                  <th className="w-8 pb-2 text-right font-semibold sm:w-9">R</th>
                  <th className="w-8 pb-2 text-right font-semibold sm:w-9">B</th>
                  <th className="hidden w-9 pb-2 text-right font-semibold sm:table-cell">4s</th>
                  <th className="hidden w-9 pb-2 text-right font-semibold sm:table-cell">6s</th>
                  <th className="w-11 pb-2 text-right font-semibold sm:w-12">SR</th>
                </tr>
              </thead>
              <tbody>
                {live.batters.map((batter, index) => (
                  <tr key={`${batter.id}-${index}`} className="border-b border-line/70 last:border-0">
                    <td className="py-2 font-bold">
                      {batter.name}
                      {batter.isStriker ? (
                        <span className="ml-1 text-accent">*</span>
                      ) : null}
                    </td>
                    <td className="mono py-2 text-right font-medium">
                      {batter.runs}
                    </td>
                    <td className="py-2 text-right tabular-nums text-muted">
                      {batter.balls}
                    </td>
                    <td className="hidden py-2 text-right tabular-nums text-muted sm:table-cell">
                      {batter.fours}
                    </td>
                    <td className="hidden py-2 text-right tabular-nums text-muted sm:table-cell">
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
            <table className="mt-4 w-full text-left text-xs sm:text-[13px]">
              <thead>
                <tr className="border-b border-line-strong text-[10px] font-bold uppercase tracking-[0.1em] text-faint">
                  <th className="pb-2 font-semibold">Bowler</th>
                  <th className="w-8 pb-2 text-right font-semibold sm:w-9">O</th>
                  <th className="hidden w-9 pb-2 text-right font-semibold sm:table-cell">M</th>
                  <th className="w-8 pb-2 text-right font-semibold sm:w-9">R</th>
                  <th className="w-8 pb-2 text-right font-semibold sm:w-9">W</th>
                  <th className="w-11 pb-2 text-right font-semibold sm:w-12">Econ</th>
                </tr>
              </thead>
              <tbody>
                {live.bowlers.map((bowler, index) => (
                  <tr key={`${bowler.id}-${index}`} className="border-b border-line/70 last:border-0">
                    <td className="py-2 font-bold">{bowler.name}</td>
                    <td className="py-2 text-right tabular-nums text-muted">
                      {formatOvers(bowler.overs)}
                    </td>
                    <td className="hidden py-2 text-right tabular-nums text-muted sm:table-cell">
                      {bowler.maidens}
                    </td>
                    <td className="py-2 text-right tabular-nums text-muted">
                      {bowler.runs}
                    </td>
                    <td className="mono py-2 text-right font-medium">
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
            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-faint">
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
                    className={`mono grid h-7 min-w-7 place-items-center rounded px-1 text-[11px] font-medium ${ballTone(ball)}`}
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
            <p className="mt-4 rounded border border-line bg-sage/35 px-3 py-2 text-[11px] leading-relaxed text-muted">
              {live.lastWicket}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
