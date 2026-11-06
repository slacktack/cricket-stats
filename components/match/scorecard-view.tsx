import Link from "next/link";
import type { InningsDetail, MatchDetail } from "@/lib/types";
import { runSources } from "@/lib/match-stats";
import { cn, formatOvers } from "@/lib/utils";
import type { InningsOvers, MatchOvers } from "@/lib/data/overs";
import { BallChip } from "@/components/ui/ball-chip";
import { EmptyState } from "@/components/ui/empty-state";
import { TeamBadge } from "@/components/ui/team-badge";
import { MatchNumbers } from "@/components/match/match-numbers";
import { Disclosure } from "@/components/match/disclosure";

function PlayerLink({ id, name }: { id: number; name: string }) {
  if (!id) return <span className="dname">{name}</span>;
  return (
    <Link href={`/players/${id}`} className="dname">
      {name}
    </Link>
  );
}

function Tag({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "milestone" | "unbeaten";
}) {
  return (
    <span className="dtag" data-tone={tone}>
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
    <div className="band">
      <h3>{title}</h3>
      {aside ? <span>{aside}</span> : null}
    </div>
  );
}

/**
 * Four run sources, four roles: grey is the middle, Klein is the four, lime is
 * the six, the seam is the extras. No new hues.
 */
const SOURCE_TONE = {
  running: "rgb(var(--faint))",
  fours: "rgb(var(--accent))",
  sixes: "rgb(var(--live))",
  extras: "rgb(var(--line-strong))",
} as const;

function RunSourceBar({ innings }: { innings: InningsDetail }) {
  const sources = runSources(innings);
  if (sources.total === 0) return null;
  const segments = [
    { key: "running", label: "Running", value: sources.running, note: "" },
    { key: "fours", label: "Fours", value: sources.fours, note: `${sources.fourCount}×4` },
    { key: "sixes", label: "Sixes", value: sources.sixes, note: `${sources.sixCount}×6` },
    { key: "extras", label: "Extras", value: sources.extras, note: "" },
  ] as const;

  return (
    <div className="px-4 py-4">
      <h3 className="text-[10px] font-extrabold uppercase tracking-[0.14em]">
        How the runs came
      </h3>
      <div
        className="stack mt-3"
        role="img"
        aria-label="Run sources"
      >
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <span
              key={segment.key}
              style={{
                width: `${(segment.value / sources.total) * 100}%`,
                background: SOURCE_TONE[segment.key],
              }}
            />
          ))}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-start gap-2">
            <span
              className="swatch"
              style={{ background: SOURCE_TONE[segment.key] }}
            />
            <div className="min-w-0">
              <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-faint">
                {segment.label}
                {segment.note ? ` · ${segment.note}` : ""}
              </dt>
              <dd className="dnum mt-0.5 text-[19px]">
                {segment.value}
                <span className="ml-1.5 text-[10px] font-medium tracking-normal text-faint">
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
      <h3 className="text-[10px] font-extrabold uppercase tracking-[0.14em]">
        Fall of wickets
      </h3>
      <ol className="no-scrollbar -mx-4 mt-3 flex snap-x gap-px overflow-x-auto px-4 bg-[image:repeating-linear-gradient(90deg,var(--rule)_0_1px,transparent_1px_8px)]">
        {wickets.map((wicket, index) => (
          <li
            key={`${wicket.order}-${index}`}
            className="w-[150px] shrink-0 snap-start border border-line bg-surface p-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="wktbadge">{wicket.wickets}</span>
              <span className="dnum text-[17px]">
                {wicket.runs}
                <span className="text-faint">/{wicket.wickets}</span>
              </span>
            </div>
            <p className="mt-2 truncate text-[12.5px] font-bold">{wicket.batsmanName}</p>
            <p className="dcell mt-0.5">
              {formatOvers(wicket.overs)} ov
            </p>
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
        <h3 className="text-[10px] font-extrabold uppercase tracking-[0.14em]">
          Over by over
        </h3>
        <span className="text-[10px] uppercase tracking-[0.08em] text-faint">
          Latest first
        </span>
      </div>
      <ol className="no-scrollbar -mx-4 mt-3 flex snap-x gap-2 overflow-x-auto px-4 pb-1">
        {list.map((over) => (
          <li
            key={over.over}
            className={cn(
              "mini w-[176px] shrink-0 snap-start",
              over.wicketsInOver > 0 && "border-wkt/60"
            )}
          >
            <div className="flex items-baseline justify-between">
              <span className="dcell">Over {over.over}</span>
              <span
                className={cn(
                  "dnum text-[19px]",
                  over.runs === best && "text-live"
                )}
              >
                {over.runs}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {over.balls.map((ball, index) => (
                <BallChip key={index} ball={ball} size={22} />
              ))}
            </div>
            <p className="dcell mt-2">
              {over.score}/{over.wickets}
              {over.bowler ? (
                <span className="text-faint"> · {over.bowler}</span>
              ) : null}
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
      <h3 className="text-[10px] font-extrabold uppercase tracking-[0.14em]">
        Partnerships
      </h3>
      <ul className="mt-4 space-y-5">
        {list.map((item, index) => (
          <li key={`${item.order}-${index}`}>
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-faint">
                {ordinal(item.order)} wkt
              </span>
              <span className="leaders" />
              <p className="dnum shrink-0 text-[17px]">
                {item.totalRuns}
                <span className="ml-1 text-[10px] font-medium text-faint">
                  ({item.totalBalls}b)
                </span>
              </p>
            </div>
            <p className="mt-1 text-[12.5px] font-bold leading-snug">
              {item.bat1Name} &amp; {item.bat2Name}
            </p>
            <div
              className="stack mt-2"
              style={{ width: `${Math.max(6, (item.totalRuns / max) * 100)}%` }}
            >
              <span
                style={{
                  flex: Math.max(item.bat1Runs, 0.01),
                  background: "rgb(var(--accent))",
                }}
              />
              <span
                style={{
                  flex: Math.max(item.bat2Runs, 0.01),
                  background: "rgb(var(--accent) / 0.35)",
                }}
              />
            </div>
            <div className="dcell mt-1 flex justify-between gap-3">
              <span className="truncate">
                {item.bat1Name.split(" ").pop()} {item.bat1Runs} ({item.bat1Balls})
              </span>
              <span className="truncate text-right">
                {item.bat2Runs} ({item.bat2Balls}) {item.bat2Name.split(" ").pop()}
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
    <Disclosure
      forceOpen={innings.isCurrent}
      summary={
        <>
          <TeamBadge team={innings.battingTeam} size={34} />
          <div className="min-w-0 flex-1">
            <span className="line-clamp-2 text-[13px] font-extrabold uppercase leading-tight tracking-[-0.02em] text-white">
              {innings.battingTeam.name}
            </span>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.08em] text-white/65">
              {innings.declared ? "Declared" : innings.followOn ? "Following on" : "Innings"}
              {innings.target ? ` · Target ${innings.target}` : ""}
              {innings.isCurrent ? " · In play" : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="dnum !text-[30px] text-white">
              {innings.runs}-{innings.wickets}
            </p>
            <p className="dcell mt-1 text-white/65">
              {formatOvers(innings.overs)} ov · RR {innings.runRate.toFixed(2)}
            </p>
          </div>
        </>
      }
    >

      {innings.batsmen.length > 0 ? (
        <>
          <SectionBar
            title="Batting"
            aside={
              topBatter && topScore > 0
                ? `Top ${topScore} · ${topBatter.name}`
                : undefined
            }
          />
          <div className="table-scroll">
            <table className="dtable">
              <thead className="dhead">
                <tr>
                  <th data-lead>Batter</th>
                  <th className="w-[46px] text-right" data-trail>R</th>
                  <th className="w-[38px] text-right">B</th>
                  <th className="hidden w-[38px] text-right sm:table-cell">4s</th>
                  <th className="hidden w-[38px] text-right sm:table-cell">6s</th>
                  <th className="w-[56px] text-right" data-trail>SR</th>
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
                      className="drow"
                      data-hot={isTop ? "" : undefined}
                    >
                      <td data-lead>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <PlayerLink id={batter.id} name={batter.name} />
                          {batter.isCaptain ? <Tag>C</Tag> : null}
                          {batter.isKeeper ? <Tag>WK</Tag> : null}
                          {batter.runs >= 100 ? (
                            <Tag tone="milestone">100</Tag>
                          ) : batter.runs >= 50 ? (
                            <Tag tone="milestone">50</Tag>
                          ) : null}
                          {batter.isOut ? null : <Tag tone="unbeaten">Not out</Tag>}
                        </div>
                        {batter.isOut && batter.outDesc ? (
                          <p className="dnote line-clamp-2">{batter.outDesc}</p>
                        ) : null}
                      </td>
                      <td
                        className={cn("dnum text-right", isTop && "text-accent")}
                        data-trail
                      >
                        {batter.runs}
                      </td>
                      <td className="dcell text-right">{batter.balls}</td>
                      <td className="dcell hidden text-right sm:table-cell">
                        {batter.fours}
                      </td>
                      <td className="dcell hidden text-right sm:table-cell">
                        {batter.sixes}
                      </td>
                      <td
                        className={cn(
                          "dcell text-right",
                          hot && "font-bold text-live",
                          slow && "text-wkt"
                        )}
                        data-trail
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

      <dl className="figs !py-2.5">
        <div>
          <dt>Extras</dt>
          <dd className="font-bold">{innings.extras.total}</dd>
          {extras ? <span className="dcell text-faint">({extras})</span> : null}
          <span className="leaders" />
          <dt>Total</dt>
          <dd className="dnum text-[15px]">
            {innings.runs}-{innings.wickets}
          </dd>
          <span className="dcell">({formatOvers(innings.overs)} ov)</span>
        </div>
      </dl>

      {innings.bowlers.length > 0 ? (
        <>
          <SectionBar title="Bowling" aside={`${innings.bowlers.length} bowlers`} />
          <div className="table-scroll">
            <table className="dtable">
              <thead className="dhead">
                <tr>
                  <th data-lead>Bowler</th>
                  <th className="w-[46px] text-right">O</th>
                  <th className="hidden w-[38px] text-right sm:table-cell">M</th>
                  <th className="w-[42px] text-right">R</th>
                  <th className="w-[46px] text-right" data-trail>W</th>
                  <th className="w-[56px] text-right" data-trail>Econ</th>
                </tr>
              </thead>
              <tbody>
                {innings.bowlers.map((bowler, index) => {
                  const isBest = bestBowler === bowler && bowler.wickets > 0;
                  const econTone =
                    bowled.length > 1 && bowler.overs > 0
                      ? bowler.economy === bestEcon
                        ? "font-bold text-live"
                        : bowler.economy === worstEcon &&
                            worstEcon - bestEcon >= 2
                          ? "text-wkt"
                          : ""
                      : "";
                  return (
                    <tr
                      key={`${bowler.id}-${index}`}
                      className="drow"
                      data-hot={isBest ? "" : undefined}
                    >
                      <td data-lead>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <PlayerLink id={bowler.id} name={bowler.name} />
                          {isBest ? <Tag tone="milestone">Best</Tag> : null}
                        </div>
                        {bowler.wides || bowler.noBalls ? (
                          <p className="dnote">
                            {bowler.wides ? `${bowler.wides} wd` : ""}
                            {bowler.wides && bowler.noBalls ? " · " : ""}
                            {bowler.noBalls ? `${bowler.noBalls} nb` : ""}
                          </p>
                        ) : null}
                      </td>
                      <td className="dcell text-right">{formatOvers(bowler.overs)}</td>
                      <td className="dcell hidden text-right sm:table-cell">
                        {bowler.maidens}
                      </td>
                      <td className="dcell text-right">{bowler.runs}</td>
                      <td className="text-right" data-trail>
                        <span className="wktchip" data-heavy={bowler.wickets >= 3 ? "" : undefined}>
                          {bowler.wickets}
                        </span>
                      </td>
                      <td className={cn("dcell text-right", econTone)} data-trail>
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
    </Disclosure>
  );
}

export function ScorecardView({
  detail,
  overs,
}: {
  detail: MatchDetail;
  overs?: MatchOvers | null;
}) {
  if (detail.innings.length === 0) {
    return (
      <EmptyState
        title="Scorecard not available yet"
        description={
          detail.summary.state === "upcoming"
            ? "The match has not started. The full scorecard will appear after the first ball."
            : "The scorecard is not available for this match."
        }
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
            overs={
              overs?.innings.find((item) => item.inningsId === innings.id) ??
              overs?.innings[index]
            }
          />
        ))}
        <p className="text-[10px] uppercase tracking-[0.08em] text-faint">
          Scorecard polled from the live feed. Figures may lag by a delivery.
        </p>
      </div>
    </div>
  );
}
