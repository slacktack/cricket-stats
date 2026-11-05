import Link from "next/link";
import type { InningsDetail, MatchDetail } from "@/lib/types";
import { runSources } from "@/lib/match-stats";
import { cn, formatOvers } from "@/lib/utils";
import type { InningsOvers, MatchOvers } from "@/lib/data/overs";
import { BallChip } from "@/components/ui/ball-chip";
import { EmptyState } from "@/components/ui/empty-state";
import { TeamBadge } from "@/components/ui/team-badge";
import { MatchNumbers } from "@/components/match/match-numbers";

function PlayerLink({ id, name }: { id: number; name: string }) {
  if (!id) return <span>{name}</span>;
  return (
    <Link href={`/players/${id}`} className="font-semibold transition-colors hover:text-accent">
      {name}
    </Link>
  );
}

function Tag({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "accent" | "gold";
}) {
  return (
    <span
      className={cn(
        "mono inline-flex h-[19px] items-center rounded px-1.5 text-[10px] font-semibold uppercase tracking-[0.06em]",
        tone === "accent" && "bg-accent/10 text-accent",
        tone === "gold" && "bg-gold/25 text-warn",
        tone === "muted" && "border border-line-strong text-faint"
      )}
    >
      {children}
    </span>
  );
}

function ordinal(value: number): string {
  const rest = value % 100;
  if (rest >= 11 && rest <= 13) return `${value}th`;
  return `${value}${["th", "st", "nd", "rd"][value % 10 > 3 ? 0 : value % 10]}`;
}

function SectionBar({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-y border-line bg-surface2/60 px-4 py-2.5">
      <h3 className="text-xs font-bold text-accent">{title}</h3>
      {aside ? <span className="min-w-0 truncate text-xs text-faint">{aside}</span> : null}
    </div>
  );
}

function RunSourceBar({ innings }: { innings: InningsDetail }) {
  const sources = runSources(innings);
  if (sources.total === 0) return null;
  const segments = [
    { key: "running", label: "Running", value: sources.running, note: "", tone: "bg-[#b8901a]" },
    { key: "fours", label: "Fours", value: sources.fours, note: `${sources.fourCount}×4`, tone: "bg-[#2f74d0]" },
    { key: "sixes", label: "Sixes", value: sources.sixes, note: `${sources.sixCount}×6`, tone: "bg-[#16a34a]" },
    { key: "extras", label: "Extras", value: sources.extras, note: "", tone: "bg-[#7c6bc4]" },
  ];
  return (
    <div className="px-4 py-4">
      <h3 className="text-[13px] font-bold">How the runs came</h3>
      <div className="mt-3 flex h-3 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Run sources">
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <span
              key={segment.key}
              className={segment.tone}
              style={{ width: `${(segment.value / sources.total) * 100}%` }}
            />
          ))}
      </div>
      <dl className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-start gap-2">
            <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-sm", segment.tone)} />
            <div>
              <dt className="text-xs text-faint">
                {segment.label}
                {segment.note ? ` · ${segment.note}` : ""}
              </dt>
              <dd className="mono text-[17px] font-bold leading-tight">
                {segment.value}
                <span className="ml-1 text-xs font-medium text-faint">
                  {Math.round((segment.value / sources.total) * 100)}%
                </span>
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

function WicketStrip({ innings }: { innings: InningsDetail }) {
  const wickets = innings.fallOfWickets;
  if (wickets.length === 0) return null;
  return (
    <div className="border-t border-line px-4 py-4">
      <h3 className="text-[13px] font-bold">Fall of wickets</h3>
      <ol className="no-scrollbar -mx-4 mt-3 flex snap-x gap-2 overflow-x-auto px-4 pb-1">
        {wickets.map((wicket, index) => (
          <li
            key={`${wicket.order}-${index}`}
            className="w-[150px] shrink-0 snap-start rounded-xl bg-surface2 p-3"
          >
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-wkt text-[11px] font-bold text-white">
                {wicket.wickets}
              </span>
              <span className="tnum text-[16px] font-bold">
                {wicket.runs}/{wicket.wickets}
              </span>
            </div>
            <p className="mt-2 truncate text-[13px] font-semibold">{wicket.batsmanName}</p>
            <p className="tnum text-[12px] text-faint">{formatOvers(wicket.overs)} ov</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function OverScroller({ overs }: { overs?: InningsOvers }) {
  if (!overs || overs.overs.length === 0) return null;
  const list = [...overs.overs].reverse();
  const best = Math.max(...overs.overs.map((o) => o.runs));
  return (
    <div className="border-t border-line px-4 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[13px] font-bold">Over by over</h3>
        <span className="text-[12px] text-faint">Latest first · scroll →</span>
      </div>
      <ol className="no-scrollbar -mx-4 mt-3 flex snap-x gap-2 overflow-x-auto px-4 pb-1">
        {list.map((over) => (
          <li
            key={over.over}
            className={cn(
              "w-[176px] shrink-0 snap-start rounded-xl p-3",
              over.wicketsInOver > 0 ? "bg-wkt/10 ring-1 ring-wkt/30" : "bg-surface2"
            )}
          >
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] font-semibold text-faint">Over {over.over}</span>
              <span className={cn("tnum text-[18px] font-bold", over.runs === best && "text-live")}>
                {over.runs}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {over.balls.map((ball, index) => (
                <BallChip key={index} ball={ball} size={22} />
              ))}
            </div>
            <p className="tnum mt-2 text-[12px] text-muted">
              {over.score}/{over.wickets}
              {over.bowler ? <span className="text-faint"> · {over.bowler}</span> : null}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Partnerships({ innings }: { innings: InningsDetail }) {
  const list = innings.partnerships;
  if (list.length === 0) return null;
  const max = Math.max(...list.map((item) => item.totalRuns), 1);
  return (
    <div className="border-t border-line px-4 py-4">
      <h3 className="text-[13px] font-bold">Partnerships</h3>
      <ul className="mt-3.5 space-y-4">
        {list.map((item, index) => (
          <li key={`${item.order}-${index}`}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-semibold text-faint">{ordinal(item.order)} wicket</span>
              <p className="mono shrink-0 text-[15px] font-bold">
                {item.totalRuns}
                <span className="ml-1 text-xs font-medium text-faint">({item.totalBalls}b)</span>
              </p>
            </div>
            <p className="mt-0.5 text-[13px] font-semibold leading-snug">
              {item.bat1Name} &amp; {item.bat2Name}
            </p>
            <div
              className="mt-1.5 flex h-2.5 gap-px"
              style={{ width: `${Math.max(6, (item.totalRuns / max) * 100)}%` }}
            >
              <span className="rounded-l-full bg-accent" style={{ flex: Math.max(item.bat1Runs, 0.01) }} />
              <span className="rounded-r-full bg-accent/45" style={{ flex: Math.max(item.bat2Runs, 0.01) }} />
            </div>
            <div className="mt-1 flex justify-between gap-3 text-[11px] text-faint">
              <span className="truncate">
                {item.bat1Runs} ({item.bat1Balls})
              </span>
              <span className="truncate text-right">
                {item.bat2Runs} ({item.bat2Balls})
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InningsCard({ innings, overs }: { innings: InningsDetail; overs?: InningsOvers }) {
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

  const bowled = innings.bowlers.filter((bowler) => bowler.overs > 0);
  const bestBowler = [...bowled].sort(
    (a, b) => b.wickets - a.wickets || a.runs - b.runs
  )[0];
  const economies = bowled.map((bowler) => bowler.economy);
  const bestEcon = economies.length ? Math.min(...economies) : 0;
  const worstEcon = economies.length ? Math.max(...economies) : 0;

  return (
    <section className="overflow-hidden rounded-2xl bg-surface">
      <div className="flex flex-wrap items-center gap-3 bg-gradient-to-r from-[#0a1a4f] via-[#1435a8] to-[#2a5cff] px-4 py-4 text-white">
        <TeamBadge team={innings.battingTeam} size={40} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/teams/${innings.battingTeam.id}`}
            className="line-clamp-2 text-[16px] font-semibold leading-tight text-white transition-opacity hover:opacity-80"
          >
            {innings.battingTeam.name}
          </Link>
          <p className="mt-0.5 text-[12px] text-white/70">
            {innings.declared ? "Declared" : innings.followOn ? "Following on" : "Innings"}
            {innings.target ? ` · Target ${innings.target}` : ""}
            {innings.isCurrent ? " · Current" : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="tnum font-display text-[28px] font-bold leading-none tracking-[-0.02em] text-white">
            {innings.runs}/{innings.wickets}
          </p>
          <p className="tnum mt-1.5 text-[12px] text-white/70">
            {formatOvers(innings.overs)} ov · RR {innings.runRate.toFixed(2)}
          </p>
        </div>
      </div>

      {innings.batsmen.length > 0 ? (
        <>
          <SectionBar
            title="Batting"
            aside={
              topBatter && topScore > 0 ? (
                <>
                  Top <strong className="mono text-ink">{topScore}</strong> · {topBatter.name}
                </>
              ) : null
            }
          />
          <div className="table-scroll">
            <table className="w-full table-fixed text-left text-xs sm:text-[13px]">
              <thead className="border-b border-line-strong bg-surface2/35 text-[10px] font-bold uppercase tracking-[0.1em] text-faint">
                <tr>
                  <th className="px-3 py-2 font-semibold sm:px-4">Batter</th>
                  <th className="w-[52px] px-1.5 py-2 text-right font-semibold sm:px-2">R</th>
                  <th className="w-[44px] px-1.5 py-2 text-right font-semibold sm:px-2">B</th>
                  <th className="hidden w-[44px] px-1.5 py-2 text-right font-semibold sm:table-cell sm:px-2">4s</th>
                  <th className="hidden w-[44px] px-1.5 py-2 text-right font-semibold sm:table-cell sm:px-2">6s</th>
                  <th className="w-[62px] px-3 py-2 text-right font-semibold sm:px-4">SR</th>
                </tr>
              </thead>
              <tbody>
                {innings.batsmen.map((batter, index) => {
                  const isTop = topScore > 0 && batter.runs === topScore;
                  const hot = batter.strikeRate >= 150 && batter.balls >= 6;
                  const slow = batter.strikeRate < 80 && batter.balls >= 15;
                  return (
                    <tr
                      key={`${batter.id}-${index}`}
                      className={cn(
                        "border-b border-line/60 transition-colors last:border-0 hover:bg-accent/[0.04]",
                        isTop && "bg-accent/[0.04]"
                      )}
                    >
                      <td className="px-3 py-2.5 sm:px-4">
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 [&_a]:text-[14px] [&_a]:font-bold [&_a]:text-ink">
                          <PlayerLink id={batter.id} name={batter.name} />
                          {batter.isCaptain ? <Tag>C</Tag> : null}
                          {batter.isKeeper ? <Tag>WK</Tag> : null}
                          {batter.runs >= 100 ? <Tag tone="gold">100</Tag> : batter.runs >= 50 ? <Tag tone="accent">50</Tag> : null}
                          {batter.isOut ? null : <Tag tone="accent">Not out</Tag>}
                        </div>
                        {batter.isOut && batter.outDesc ? (
                          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-faint sm:text-xs">
                            {batter.outDesc}
                          </p>
                        ) : null}
                        {batter.fours > 0 || batter.sixes > 0 ? (
                          <p className="mt-1.5 flex items-center gap-3 text-[11px] font-semibold text-muted sm:hidden">
                            {batter.fours > 0 ? (
                              <span className="inline-flex items-center gap-1">
                                <i className="h-1.5 w-1.5 rounded-full bg-[#2f74d0]" />
                                {batter.fours}×4
                              </span>
                            ) : null}
                            {batter.sixes > 0 ? (
                              <span className="inline-flex items-center gap-1">
                                <i className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                                {batter.sixes}×6
                              </span>
                            ) : null}
                          </p>
                        ) : null}
                      </td>
                      <td
                        className={cn(
                          "tnum px-1.5 py-2.5 text-right text-[16px] font-semibold leading-none sm:px-2",
                          isTop && "text-accent"
                        )}
                      >
                        {batter.runs}
                      </td>
                      <td className="px-1.5 py-2.5 text-right tabular-nums text-muted sm:px-2">{batter.balls}</td>
                      <td className="hidden px-1.5 py-2.5 text-right tabular-nums text-muted sm:table-cell sm:px-2">{batter.fours}</td>
                      <td className="hidden px-1.5 py-2.5 text-right tabular-nums text-muted sm:table-cell sm:px-2">{batter.sixes}</td>
                      <td
                        className={cn(
                          "px-3 py-2.5 text-right tabular-nums sm:px-4",
                          hot ? "font-semibold text-live" : slow ? "text-wkt" : "text-muted"
                        )}
                      >
                        {batter.strikeRate.toFixed(2)}
                      </td>
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
            Total{" "}
            <strong className="mono font-bold text-ink">
              {innings.runs}/{innings.wickets}
            </strong>
            <span className="text-faint"> ({formatOvers(innings.overs)} ov)</span>
          </span>
        </div>
      </div>

      {innings.bowlers.length > 0 ? (
        <>
          <SectionBar title="Bowling" aside={`${innings.bowlers.length} bowlers`} />
          <div className="table-scroll">
            <table className="w-full table-fixed text-left text-xs sm:text-[13px]">
              <thead className="border-b border-line-strong bg-surface2/35 text-[10px] font-bold uppercase tracking-[0.1em] text-faint">
                <tr>
                  <th className="px-3 py-2 font-semibold sm:px-4">Bowler</th>
                  <th className="w-[44px] px-1.5 py-2 text-right font-semibold sm:px-2">O</th>
                  <th className="hidden w-[44px] px-1.5 py-2 text-right font-semibold sm:table-cell sm:px-2">M</th>
                  <th className="w-[44px] px-1.5 py-2 text-right font-semibold sm:px-2">R</th>
                  <th className="w-[52px] px-1.5 py-2 text-right font-semibold sm:px-2">W</th>
                  <th className="w-[62px] px-3 py-2 text-right font-semibold sm:px-4">Econ</th>
                </tr>
              </thead>
              <tbody>
                {innings.bowlers.map((bowler, index) => {
                  const isBest = bestBowler === bowler && bowler.wickets > 0;
                  const econTone =
                    bowled.length > 1 && bowler.overs > 0
                      ? bowler.economy === bestEcon
                        ? "font-semibold text-live"
                        : bowler.economy === worstEcon && worstEcon - bestEcon >= 2
                          ? "text-wkt"
                          : "text-muted"
                      : "text-muted";
                  return (
                    <tr
                      key={`${bowler.id}-${index}`}
                      className={cn(
                        "border-b border-line/60 transition-colors last:border-0 hover:bg-accent/[0.04]",
                        isBest && "bg-accent/[0.04]"
                      )}
                    >
                      <td className="px-3 py-2.5 sm:px-4">
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 [&_a]:text-[14px] [&_a]:font-bold [&_a]:text-ink">
                          <PlayerLink id={bowler.id} name={bowler.name} />
                          {isBest ? <Tag tone="accent">Best</Tag> : null}
                        </div>
                      </td>
                      <td className="px-1.5 py-2.5 text-right tabular-nums text-muted sm:px-2">{formatOvers(bowler.overs)}</td>
                      <td className="hidden px-1.5 py-2.5 text-right tabular-nums text-muted sm:table-cell sm:px-2">{bowler.maidens}</td>
                      <td className="px-1.5 py-2.5 text-right tabular-nums text-muted sm:px-2">{bowler.runs}</td>
                      <td className="px-1.5 py-2.5 text-right sm:px-2">
                        {bowler.wickets > 0 ? (
                          <span
                            className={cn(
                              "mono inline-grid h-7 min-w-7 place-items-center rounded px-1.5 text-[15px] font-bold",
                              bowler.wickets >= 3
                                ? "bg-accent text-accent-ink"
                                : "bg-accent-soft text-accent"
                            )}
                          >
                            {bowler.wickets}
                          </span>
                        ) : (
                          <span className="mono text-[15px] text-faint">0</span>
                        )}
                      </td>
                      <td className={cn("px-3 py-2.5 text-right tabular-nums sm:px-4", econTone)}>
                        {bowler.economy.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      <SectionBar title="Innings story" />
      <RunSourceBar innings={innings} />
      <OverScroller overs={overs} />
      <WicketStrip innings={innings} />
      <Partnerships innings={innings} />
    </section>
  );
}

export function ScorecardView({ detail, overs }: { detail: MatchDetail; overs?: MatchOvers | null }) {
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
    <div>
      <MatchNumbers detail={detail} />
      <div className="mt-4 space-y-4">
        {detail.innings.map((innings, index) => (
          <InningsCard
            key={`${innings.id}-${index}`}
            innings={innings}
            overs={overs?.innings.find((item) => item.inningsId === innings.id) ?? overs?.innings[index]}
          />
        ))}
        <p className="text-xs text-faint">
          Scorecard updated from the live feed. Batting and bowling figures may lag by a delivery.
        </p>
      </div>
    </div>
  );
}
