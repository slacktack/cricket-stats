import Link from "next/link";
import type { MatchDetail } from "@/lib/types";
import { formatDateTime, pad, timeAgo } from "@/lib/utils";
import { PlayerAvatar } from "@/components/ui/team-badge";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 border-t border-line/70 py-2 text-[12.5px] first:border-0 first:pt-0 last:pb-0">
      <dt className="shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-faint">
        {label}
      </dt>
      <span className="leaders" aria-hidden="true" />
      <dd className="min-w-0 shrink-0 text-right text-muted">{children}</dd>
    </div>
  );
}

function PlayerList({ players }: { players: MatchDetail["playersOfMatch"] }) {
  if (players.length === 0) return <p className="px-4 py-4 text-[12px] text-faint">Not announced.</p>;
  return (
    <ul className="flex flex-wrap gap-2 px-4 py-3.5">
      {players.map((player, index) => {
        const chip = (
          <span className="flex items-center gap-2 border border-line px-2 py-1.5 text-[12px] font-semibold text-ink transition-colors">
            <PlayerAvatar
              player={{ id: player.id, name: player.name, faceImageId: player.faceImageId }}
              size={26}
            />
            {player.name}
          </span>
        );
        return player.id ? (
          <li key={`${player.id}-${index}`}>
            <Link href={`/players/${player.id}`} className="block hover:border-slab">
              {chip}
            </Link>
          </li>
        ) : (
          <li key={`${player.id}-${index}`}>{chip}</li>
        );
      })}
    </ul>
  );
}

export function MatchInfo({ detail }: { detail: MatchDetail }) {
  const probability = detail.winProbability;

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <section className="blk">
        <div className="band">
          <h3>Match information</h3>
        </div>
        <dl className="px-4 py-3.5">
          <Row label="Series">
            {detail.series.id ? (
              <Link href={`/series/${detail.series.id}`} className="text-ink hover:text-accent">
                {detail.series.name}
              </Link>
            ) : (
              detail.series.name
            )}
          </Row>
          <Row label="Format">{detail.summary.format}</Row>
          <Row label="Start">{formatDateTime(detail.summary.startTime)}</Row>
          <Row label="Venue">
            {detail.venue
              ? `${detail.venue.ground}${detail.venue.city ? `, ${detail.venue.city}` : ""}`
              : "TBD"}
          </Row>
          <Row label="Toss">
            {detail.toss
              ? `${detail.toss.winnerName} · ${detail.toss.decision.toLowerCase()}`
              : "Not yet"}
          </Row>
          <Row label="Result">{detail.resultText || "—"}</Row>
          <Row label="Updated">
            <span suppressHydrationWarning>{timeAgo(detail.updatedAt)}</span>
          </Row>
        </dl>
      </section>

      <section className="blk">
        <div className="band">
          <h3>Officials</h3>
          <span>{detail.officials.length}</span>
        </div>
        {detail.officials.length > 0 ? (
          <dl className="px-4 py-3.5">
            {detail.officials.map((official, index) => (
              <Row key={`${official.role}-${index}`} label={official.role}>
                {official.name}
                {official.country ? <span className="text-faint"> ({official.country})</span> : null}
              </Row>
            ))}
          </dl>
        ) : (
          <p className="px-4 py-3.5 text-[12px] text-faint">Officials not announced.</p>
        )}
      </section>

      {probability ? (
        <section className="blk md:col-span-2">
          <div className="band">
            <h3>Win probability</h3>
            {probability.lastUpdatedOver !== undefined ? (
              <span>After {probability.lastUpdatedOver} overs</span>
            ) : null}
          </div>
          <div className="px-4 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="dnum text-accent">{probability.team1.percent}%</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-faint">
                {probability.drawTiePercent > 0 ? `Draw / tie ${probability.drawTiePercent}%` : "Odds"}
              </span>
              <span className="dnum text-ink">{probability.team2.percent}%</span>
            </div>
            <div
              className="stack mt-2"
              role="img"
              aria-label={`${probability.team1.shortName} ${probability.team1.percent}%, ${probability.team2.shortName} ${probability.team2.percent}%`}
            >
              <span style={{ width: `${probability.team1.percent}%`, background: "rgb(var(--accent))" }} />
              {probability.drawTiePercent > 0 ? (
                <span
                  style={{
                    width: `${probability.drawTiePercent}%`,
                    background: "rgb(var(--ink) / 0.18)",
                  }}
                />
              ) : null}
              <span
                style={{
                  width: `${probability.team2.percent}%`,
                  background: "rgb(var(--ink) / 0.55)",
                }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-muted">
              <span>{probability.team1.shortName}</span>
              <span>{probability.team2.shortName}</span>
            </div>
          </div>
        </section>
      ) : null}

      <section className="blk">
        <div className="band">
          <h3>Player of the match</h3>
          <span>{pad(detail.playersOfMatch.length)}</span>
        </div>
        <PlayerList players={detail.playersOfMatch} />
      </section>

      <section className="blk">
        <div className="band">
          <h3>Player of the series</h3>
          <span>{pad(detail.playersOfSeries.length)}</span>
        </div>
        <PlayerList players={detail.playersOfSeries} />
      </section>
    </div>
  );
}
