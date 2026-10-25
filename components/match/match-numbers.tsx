import Link from "next/link";
import { Trophy } from "lucide-react";
import type { MatchDetail, WinProbability } from "@/lib/types";
import { bestBowler, teamTotals, topBatter } from "@/lib/match-stats";
import { cn, formatOvers } from "@/lib/utils";
import { PlayerAvatar } from "@/components/ui/team-badge";

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
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={cn(
            "mono text-[18px] tabular-nums leading-none",
            left > right ? "font-bold text-ink" : "font-medium text-muted"
          )}
        >
          {format(left)}
        </span>
        <span className="text-xs font-semibold text-faint">{label}</span>
        <span
          className={cn(
            "mono text-[18px] tabular-nums leading-none",
            right > left ? "font-bold text-ink" : "font-medium text-muted"
          )}
        >
          {format(right)}
        </span>
      </div>
      <div className="mt-2 flex h-2 gap-[3px]" aria-hidden="true">
        <span className="bg-accent" style={{ width: `${leftShare}%` }} />
        <span className="bg-gold" style={{ width: `${100 - leftShare}%` }} />
      </div>
    </div>
  );
}

export function WinProbabilityBar({ probability }: { probability: WinProbability }) {
  const { team1, team2, drawTiePercent } = probability;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="mono text-[22px] font-bold leading-none tabular-nums text-accent">
          {team1.percent}%
        </span>
        <span className="text-xs font-semibold text-faint">Win probability</span>
        <span className="mono text-[22px] font-bold leading-none tabular-nums text-warn">
          {team2.percent}%
        </span>
      </div>
      <div className="mt-2 flex h-3 gap-[3px]" role="img" aria-label={`${team1.shortName} ${team1.percent}%, ${team2.shortName} ${team2.percent}%`}>
        <span className="bg-accent" style={{ width: `${team1.percent}%` }} />
        {drawTiePercent > 0 ? (
          <span className="bg-line-strong" style={{ width: `${drawTiePercent}%` }} />
        ) : null}
        <span className="bg-gold" style={{ width: `${team2.percent}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-xs font-semibold text-muted">
        <span>{team1.shortName}</span>
        {drawTiePercent > 0 ? <span className="text-faint">Draw {drawTiePercent}%</span> : null}
        <span>{team2.shortName}</span>
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
      <p className="text-xs font-semibold text-accent">{label}</p>
      <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-[15px] font-bold leading-tight">
        {name}
      </p>
      {team ? <p className="mt-0.5 text-xs text-faint">{team}</p> : null}
      <p className="mono mt-3 text-[34px] font-bold leading-none tracking-[-0.03em]">
        {big}
        {small ? (
          <span className="ml-1.5 text-[15px] font-medium tracking-normal text-muted">{small}</span>
        ) : null}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded bg-surface2 px-1.5 py-1 text-[11px] font-semibold text-muted"
          >
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
    { label: "Runs in boundaries", l: ta.boundaryShare, r: tb.boundaryShare, format: (v: number) => `${v}%` },
    { label: "Extras", l: ta.extras, r: tb.extras },
  ].filter((row) => row.l + row.r > 0);
  const batter = topBatter(detail.innings);
  const bowler = bestBowler(detail.innings, teams);
  const potm = detail.playersOfMatch[0];
  const probability = detail.summary.state === "live" ? detail.winProbability : undefined;

  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]" aria-label="Match in numbers">
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b-2 border-panel-ink/25 bg-panel px-4 py-3 text-panel-ink">
          <h2 className="display text-[18px] font-bold leading-none tracking-[-0.02em]">
            Head to head
          </h2>
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-accent ring-1 ring-panel-ink/60" />
              {a.shortName}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-gold" />
              {b.shortName}
            </span>
          </div>
        </div>
        <div className="space-y-4 p-4">
          {probability ? <WinProbabilityBar probability={probability} /> : null}
          {probability && rows.length > 0 ? <hr className="border-line" /> : null}
          {rows.map((row) => (
            <Versus key={row.label} label={row.label} left={row.l} right={row.r} format={row.format} />
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
                small={`(${batter.batter.balls})`}
                chips={[
                  ...(batter.batter.fours ? [`${batter.batter.fours}×4`] : []),
                  ...(batter.batter.sixes ? [`${batter.batter.sixes}×6`] : []),
                  `SR ${batter.batter.strikeRate.toFixed(0)}`,
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
                chips={[
                  `${formatOvers(bowler.bowler.overs)} ov`,
                  `Econ ${bowler.bowler.economy.toFixed(1)}`,
                  ...(bowler.bowler.maidens ? [`${bowler.bowler.maidens} maiden`] : []),
                ]}
              />
            ) : null}
          </div>
        ) : null}

        {potm ? (
          <Link
            href={potm.id ? `/players/${potm.id}` : "#"}
            className="card card-hover flex items-center gap-3.5 border-gold/50 bg-gold/[0.08] p-3.5"
          >
            <PlayerAvatar
              player={{ id: potm.id, name: potm.name, faceImageId: potm.faceImageId }}
              size={52}
            />
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-warn">
                <Trophy className="h-3.5 w-3.5" />
                Player of the match
              </p>
              <p className="mt-1 truncate text-base font-bold">{potm.name}</p>
            </div>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
