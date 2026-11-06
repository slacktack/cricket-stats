import Link from "next/link";
import { Trophy } from "lucide-react";
import type { MatchDetail, WinProbability } from "@/lib/types";
import { bestBowler, teamTotals, topBatter } from "@/lib/match-stats";
import { formatOvers } from "@/lib/utils";
import { PlayerAvatar } from "@/components/ui/team-badge";
import { Count } from "@/components/motion";

/** Head-to-head: the larger share paints in Klein, the loser stays grey. */
function Versus({
  label,
  left,
  right,
  format = String,
}: {
  label: string;
  left: number;
  right: number;
  format?: (value: number) => string;
}) {
  const total = left + right || 1;
  const leftShare = (left / total) * 100;
  const leftWins = left >= right;
  return (
    <div className="border-t border-line py-2.5 first:border-t-0 first:pt-0">
      <div className="flex items-baseline gap-3">
        <span
          className={
            leftWins
              ? "dnum !text-[17px] text-ink"
              : "dnum !text-[17px] text-faint"
          }
        >
          {format(left)}
        </span>
        <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-faint">
          {label}
        </span>
        <span className="leaders" />
        <span
          className={
            !leftWins
              ? "dnum !text-[17px] text-right text-ink"
              : "dnum !text-[17px] text-right text-faint"
          }
        >
          {format(right)}
        </span>
      </div>
      <div className="stack mt-2" aria-hidden="true">
        <span
          style={{
            width: `${leftShare}%`,
            background: leftWins ? "rgb(var(--accent))" : "rgb(var(--ink) / 0.18)",
          }}
        />
        <span
          style={{
            width: `${100 - leftShare}%`,
            background: leftWins ? "rgb(var(--ink) / 0.18)" : "rgb(var(--accent))",
          }}
        />
      </div>
    </div>
  );
}

export function WinProbabilityBar({ probability }: { probability: WinProbability }) {
  const { team1, team2, drawTiePercent } = probability;
  return (
    <div className="border-t border-line pb-1 first:border-t-0">
      <div className="flex items-baseline gap-3">
        <Count
          value={`${team1.percent}%`}
          className="dnum !text-[24px] text-accent"
        />
        <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-faint">
          Win probability
        </span>
        <span className="leaders" />
        <Count
          value={`${team2.percent}%`}
          className="dnum !text-[24px] text-right"
        />
      </div>
      <div
        className="stack mt-2"
        role="img"
        aria-label={`${team1.shortName} ${team1.percent}%, ${team2.shortName} ${team2.percent}%`}
      >
        <span style={{ width: `${team1.percent}%`, background: "rgb(var(--s1))" }} />
        {drawTiePercent > 0 ? (
          <span
            style={{ width: `${drawTiePercent}%`, background: "rgb(var(--line-strong))" }}
          />
        ) : null}
        <span style={{ width: `${team2.percent}%`, background: "rgb(var(--s2))" }} />
      </div>
      <div className="dcell mt-1.5 flex justify-between uppercase tracking-[0.08em]">
        <span className="font-bold text-s1">{team1.shortName}</span>
        {drawTiePercent > 0 ? (
          <span className="text-faint">Draw {drawTiePercent}%</span>
        ) : null}
        <span className="font-bold text-s2">{team2.shortName}</span>
      </div>
    </div>
  );
}

function Performer({
  label,
  name,
  id,
  team,
  big,
  small,
  chips,
}: {
  label: string;
  name: string;
  id: number;
  team?: string;
  big: string;
  small?: string;
  chips: string[];
}) {
  const body = (
    <>
      <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-faint">
        {label}
      </p>
      <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-[14px] font-extrabold uppercase leading-tight tracking-[-0.03em]">
        {name}
      </p>
      {team ? (
        <p className="dcell mt-0.5 uppercase tracking-[0.08em]">{team}</p>
      ) : null}
      <Count
        value={big}
        className="dnum mt-3 block !text-[clamp(30px,4.4vw,52px)]"
      />
      {small ? (
        <p className="dcell mt-1">{small}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-1">
        {chips.map((chip) => (
          <span key={chip} className="dtag !h-[18px] !px-1.5 !text-[9.5px]">
            {chip}
          </span>
        ))}
      </div>
    </>
  );
  const className = "card card-hover block p-4";
  return id ? (
    <Link href={`/players/${id}`} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function MatchNumbers({ detail }: { detail: MatchDetail }) {
  const teams = detail.summary.teams;
  if (detail.innings.length === 0 || teams.length < 2) return null;
  const [a, b] = teams;
  const ta = teamTotals(detail.innings, a.id);
  const tb = teamTotals(detail.innings, b.id);
  const rows = [
    { label: "Run rate", l: ta.runRate, r: tb.runRate, format: (v: number) => v.toFixed(2) },
    { label: "Fours", l: ta.fourCount, r: tb.fourCount },
    { label: "Sixes", l: ta.sixCount, r: tb.sixCount },
    { label: "Boundary runs", l: ta.boundaryShare, r: tb.boundaryShare, format: (v: number) => `${v}%` },
    { label: "Extras", l: ta.extras, r: tb.extras },
  ].filter((row) => row.l + row.r > 0);
  const batter = topBatter(detail.innings);
  const bowler = bestBowler(detail.innings, teams);
  const potm = detail.playersOfMatch[0];
  const probability = detail.summary.state === "live" ? detail.winProbability : undefined;

  return (
    <section
      className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
      aria-label="Match in numbers"
    >
      <div className="blk" data-rv="">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          <h2 className="text-[10px] font-extrabold uppercase tracking-[0.14em]">
            Head to head
          </h2>
          <div className="flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.08em]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-s1" />
              {a.shortName}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-s2" />
              {b.shortName}
            </span>
          </div>
        </div>
        <div className="p-4">
          {probability ? <WinProbabilityBar probability={probability} /> : null}
          {rows.map((row) => (
            <Versus
              key={row.label}
              label={row.label}
              left={row.l}
              right={row.r}
              format={row.format}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {batter || bowler ? (
          <div className="grid grid-cols-2 gap-3">
            {batter ? (
              <Performer
                label="Top scorer"
                id={batter.batter.id}
                name={batter.batter.name}
                team={batter.team.shortName}
                big={String(batter.batter.runs)}
                small={`${batter.batter.balls} balls · SR ${batter.batter.strikeRate.toFixed(0)}`}
                chips={[
                  ...(batter.batter.fours ? [`${batter.batter.fours}×4`] : []),
                  ...(batter.batter.sixes ? [`${batter.batter.sixes}×6`] : []),
                  ...(batter.batter.isOut ? [] : ["not out"]),
                ]}
              />
            ) : null}
            {bowler ? (
              <Performer
                label="Best bowler"
                id={bowler.bowler.id}
                name={bowler.bowler.name}
                team={bowler.team?.shortName}
                big={`${bowler.bowler.wickets}/${bowler.bowler.runs}`}
                small={`${formatOvers(bowler.bowler.overs)} ov · Econ ${bowler.bowler.economy.toFixed(2)}`}
                chips={[
                  ...(bowler.bowler.maidens ? [`${bowler.bowler.maidens} maiden`] : []),
                ]}
              />
            ) : null}
          </div>
        ) : null}

        {potm ? (
          <Link
            href={potm.id ? `/players/${potm.id}` : "#"}
            className="card card-hover flex items-center gap-3.5 border-slab p-3.5"
          >
            <PlayerAvatar
              player={{ id: potm.id, name: potm.name, faceImageId: potm.faceImageId }}
              size={44}
            />
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em]">
                <Trophy className="h-3 w-3" />
                Player of the match
              </p>
              <p className="mt-1 truncate text-[15px] font-extrabold uppercase tracking-[-0.03em]">
                {potm.name}
              </p>
            </div>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
