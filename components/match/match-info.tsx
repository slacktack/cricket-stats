import Link from "next/link";
import type { MatchDetail } from "@/lib/types";
import { formatDateTime, timeAgo } from "@/lib/utils";
import { PlayerAvatar } from "@/components/ui/team-badge";

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-b border-line/70 py-2.5 text-xs last:border-0">
      <dt className="text-faint">{label}</dt>
      <dd className="min-w-0 text-muted">{children}</dd>
    </div>
  );
}

function PlayerList({ players }: { players: MatchDetail["playersOfMatch"] }) {
  if (players.length === 0) return <span className="text-faint">Not announced</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {players.map((player) => (
        player.id ? (
          <Link
            key={`${player.id}-${player.name}`}
            href={`/players/${player.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-1 text-[11px] transition-colors hover:border-accent/40"
          >
            <PlayerAvatar player={{ id: player.id, name: player.name, faceImageId: player.faceImageId }} size={30} />
            {player.name}
          </Link>
        ) : (
          <span key={`${player.id}-${player.name}`} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-1 text-[11px]">
            <PlayerAvatar player={{ id: player.id, name: player.name, faceImageId: player.faceImageId }} size={30} />
            {player.name}
          </span>
        )
      ))}
    </div>
  );
}

export function MatchInfo({ detail }: { detail: MatchDetail }) {
  const probability = detail.winProbability;
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <section className="card p-4">
        <h2 className="text-sm font-bold">Match information</h2>
        <dl className="mt-2">
          <InfoRow label="Series">
            {detail.series.id ? (
              <Link href={`/series/${detail.series.id}`} className="font-semibold text-ink transition-colors hover:text-accent">
                {detail.series.name}
              </Link>
            ) : (
              detail.series.name
            )}
          </InfoRow>
          <InfoRow label="Format">{detail.summary.format}</InfoRow>
          <InfoRow label="Start">{formatDateTime(detail.summary.startTime)}</InfoRow>
          <InfoRow label="Venue">
            {detail.venue ? `${detail.venue.ground}${detail.venue.city ? `, ${detail.venue.city}` : ""}` : "TBD"}
          </InfoRow>
          <InfoRow label="Toss">
            {detail.toss ? `${detail.toss.winnerName} won the toss and chose to ${detail.toss.decision.toLowerCase()}` : "Not yet"}
          </InfoRow>
          <InfoRow label="Result">{detail.resultText || "—"}</InfoRow>
          <InfoRow label="Updated">{timeAgo(detail.updatedAt)}</InfoRow>
        </dl>
      </section>

      <section className="card p-4">
        <h2 className="text-sm font-bold">Officials</h2>
        {detail.officials.length > 0 ? (
          <dl className="mt-2">
            {detail.officials.map((official, index) => (
              <InfoRow key={`${official.role}-${index}`} label={official.role}>
                {official.name}
                {official.country ? <span className="text-faint"> ({official.country})</span> : null}
              </InfoRow>
            ))}
          </dl>
        ) : (
          <p className="mt-2 text-xs text-muted">Officials not announced.</p>
        )}
      </section>

      {probability ? (
        <section className="card p-4 lg:col-span-2">
          <h2 className="text-sm font-bold">Win probability</h2>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold">{probability.team1.shortName}</span>
            <span className="font-semibold">{probability.team2.shortName}</span>
          </div>
          <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-surface2">
            <span className="bg-accent" style={{ width: `${probability.team1.percent}%` }} />
            <span className="bg-live" style={{ width: `${probability.team2.percent}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-faint tabular-nums">
            <span>{probability.team1.percent}%</span>
            {probability.drawTiePercent > 0 ? <span>Draw / tie {probability.drawTiePercent}%</span> : null}
            <span>{probability.team2.percent}%</span>
          </div>
          {probability.lastUpdatedOver !== undefined ? (
            <p className="mt-2 text-[11px] text-faint">After {probability.lastUpdatedOver} overs</p>
          ) : null}
        </section>
      ) : null}

      <section className="card p-4">
        <h2 className="text-sm font-bold">Player of the match</h2>
        <div className="mt-3">
          <PlayerList players={detail.playersOfMatch} />
        </div>
      </section>
      <section className="card p-4">
        <h2 className="text-sm font-bold">Player of the series</h2>
        <div className="mt-3">
          <PlayerList players={detail.playersOfSeries} />
        </div>
      </section>
    </div>
  );
}
