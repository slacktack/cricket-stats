import type { MatchDetail } from "@/lib/types";
import { formatOvers } from "@/lib/utils";
import { BallChip } from "@/components/ui/ball-chip";
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
    currentRate !== undefined &&
    requiredRate !== undefined &&
    currentRate >= requiredRate;

  return (
    <div className="border-t border-line px-4 py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-faint">
          Target
        </p>
        <p className="dnum text-[20px]">{target}</p>
        <span className="leaders" />
        {remainingRuns !== undefined ? (
          <p className="dcell shrink-0">
            Need{" "}
            <strong className="dnum text-[16px] text-ink">{remainingRuns}</strong>{" "}
            from{" "}
            <strong className="dnum text-[16px] text-ink">
              {remainingBalls ?? 0}
            </strong>{" "}
            balls
          </p>
        ) : null}
      </div>

      <div className="relative mt-3">
        <div className="stack" role="img" aria-label={`${scored} of ${target} runs`}>
          <span
            style={{
              width: `${percent}%`,
              background: "rgb(var(--accent))",
              transition: "width 700ms var(--ease)",
            }}
          />
          <span style={{ flex: 1, background: "rgb(var(--ink) / 0.06)" }} />
        </div>
        <span className="absolute -top-1 bottom-[-4px] left-0 w-[2px] bg-ink" aria-hidden="true" />
      </div>

      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <span className="dcell">
          {scored} of {target} · {percent.toFixed(0)}%
        </span>
        {requiredRate !== undefined ? (
          <span
            className={
              ahead
                ? "text-[11px] font-extrabold uppercase tracking-[0.06em] text-live"
                : "text-[11px] font-extrabold uppercase tracking-[0.06em] text-wkt"
            }
          >
            {ahead ? "Ahead of the rate" : "Behind the rate"} · need{" "}
            {requiredRate.toFixed(2)}
            {currentRate ? ` vs ${currentRate.toFixed(2)}` : ""}
          </span>
        ) : null}
      </div>
    </div>
  );
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

  const metrics = [
    {
      label: "Score",
      value: currentInnings
        ? `${currentInnings.runs}-${currentInnings.wickets}`
        : "—",
      tone: "text-ink",
    },
    {
      label: "Overs",
      value: `${formatOvers(live.overs)}${totalOvers ? ` / ${formatOvers(totalOvers)}` : ""}`,
      tone: "text-ink",
    },
    {
      label: "Run rate",
      value: live.currentRunRate ? live.currentRunRate.toFixed(2) : "—",
      tone: "text-accent",
    },
  ];

  return (
    <section
      className="blk mt-4"
      aria-label="Live match state"
      data-rv=""
    >
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-2.5">
        <span className="statelive inline-flex items-center gap-1.5 px-1.5 text-[9px] font-extrabold uppercase leading-[17px] tracking-[0.1em]">
          <span className="h-[5px] w-[5px] rounded-full bg-current animate-pulse-dot" />
          Live
        </span>
        <p className="min-w-0 flex-1 text-[11px] font-extrabold uppercase tracking-[0.06em] leading-snug">
          {live.status}
        </p>
        {live.event ? (
          <span className="border border-live px-1.5 text-[9px] font-extrabold uppercase leading-[17px] tracking-[0.1em] text-live">
            {live.event}
          </span>
        ) : null}
      </div>

      <div className="gcols grid-cols-3 !gap-0 border-b border-line">
        {metrics.map((metric) => (
          <div key={metric.label} className="!px-4 !pt-2 !pb-3">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-faint">
              {metric.label}
            </p>
            <p className={`dnum mt-1.5 !text-[clamp(22px,3.2vw,34px)] ${metric.tone}`}>
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
        <div className="border-t border-line px-4 py-4">
          <WinProbabilityBar probability={detail.winProbability} />
        </div>
      ) : null}

      <div className="grid">
        <div className="px-4 py-4">
          {live.batters.length > 0 ? (
            <table className="dtable">
              <thead className="dhead">
                <tr>
                  <th data-lead>Batter</th>
                  <th className="w-8 text-right">R</th>
                  <th className="w-8 text-right">B</th>
                  <th className="hidden w-9 text-right sm:table-cell">4s</th>
                  <th className="hidden w-9 text-right sm:table-cell">6s</th>
                  <th className="w-11 text-right" data-trail>SR</th>
                </tr>
              </thead>
              <tbody>
                {live.batters.map((batter, index) => (
                  <tr key={`${batter.id}-${index}`} className="drow">
                    <td data-lead className="dname">
                      {batter.name}
                      {batter.isStriker ? (
                        <span className="ml-1 text-accent">*</span>
                      ) : null}
                    </td>
                    <td className="dnum text-right !text-[14px]">{batter.runs}</td>
                    <td className="dcell text-right">{batter.balls}</td>
                    <td className="dcell hidden text-right sm:table-cell">
                      {batter.fours}
                    </td>
                    <td className="dcell hidden text-right sm:table-cell">
                      {batter.sixes}
                    </td>
                    <td className="dcell text-right" data-trail>
                      {batter.strikeRate.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          {live.bowlers.length > 0 ? (
            <table className="dtable mt-5">
              <thead className="dhead">
                <tr>
                  <th data-lead>Bowler</th>
                  <th className="w-9 text-right">O</th>
                  <th className="hidden w-8 text-right sm:table-cell">M</th>
                  <th className="w-8 text-right">R</th>
                  <th className="w-8 text-right" data-trail>W</th>
                  <th className="w-11 text-right" data-trail>Econ</th>
                </tr>
              </thead>
              <tbody>
                {live.bowlers.map((bowler, index) => (
                  <tr key={`${bowler.id}-${index}`} className="drow">
                    <td data-lead className="dname">
                      {bowler.name}
                    </td>
                    <td className="dcell text-right">{formatOvers(bowler.overs)}</td>
                    <td className="dcell hidden text-right sm:table-cell">
                      {bowler.maidens}
                    </td>
                    <td className="dcell text-right">{bowler.runs}</td>
                    <td className="text-right" data-trail>
                      <span
                        className="wktchip !h-[20px] !min-w-[20px] !text-[12px]"
                        data-heavy={bowler.wickets > 0 ? "" : undefined}
                      >
                        {bowler.wickets}
                      </span>
                    </td>
                    <td className="dcell text-right" data-trail>
                      {bowler.economy.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>

        <div className="border-t border-line px-4 py-4">
          <div className="flex items-baseline gap-2">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-faint">
              Recent balls
            </p>
            <span className="leaders" />
            {live.partnership ? (
              <span className="dcell shrink-0">
                Partnership{" "}
                <strong className="dnum text-[13px] text-ink">
                  {live.partnership.runs}
                </strong>{" "}
                ({live.partnership.balls})
              </span>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1" aria-label="Recent balls">
            {live.recentBalls.length > 0 ? (
              live.recentBalls.map((ball, index) =>
                ball === "|" ? (
                  <span
                    key={`${ball}-${index}`}
                    className="mx-0.5 h-6 w-[1px] bg-line-strong"
                    aria-hidden="true"
                  />
                ) : (
                  <BallChip key={`${ball}-${index}`} ball={ball} size={26} />
                )
              )
            ) : (
              <span className="border border-dashed border-line px-3 py-2 text-[11px] text-muted">
                Waiting for the next ball.
              </span>
            )}
          </div>

          {live.lastWicket ? (
            <p className="mt-4 border-l-2 border-wkt pl-2.5 text-[11.5px] leading-relaxed text-muted">
              {live.lastWicket}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
