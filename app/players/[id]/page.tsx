import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayerProfile } from "@/lib/data/player";
import { loadPage } from "@/lib/page-data";
import { Breadcrumbs, PageHeader } from "@/components/page-header";
import { ShareButton } from "@/components/share-button";
import { PlayerAvatar } from "@/components/ui/team-badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { PlayerProfile, PlayerStatsTable } from "@/lib/types";

export const dynamic = "force-dynamic";

type PlayerPageProps = {
  params: Promise<{ id: string }>;
};

function parseId(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { id } = await params;
  const playerId = parseId(id);
  if (!playerId) return { title: "Player" };
  try {
    const player = await getPlayerProfile(playerId);
    return {
      title: player.name,
      description: `${player.name} profile — batting, bowling, career stats and recent form.`,
    };
  } catch {
    return { title: "Player" };
  }
}

function StatsTable({ title, table }: { title: string; table: PlayerStatsTable }) {
  if (table.formats.length === 0 || table.rows.length === 0) return null;
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b-2 border-panel-ink/25 bg-panel px-4 py-3 text-panel-ink">
        <h2 className="display text-[18px] font-bold leading-none tracking-[-0.02em]">
          {title}
        </h2>
        <span className="mono text-[9px] uppercase tracking-[0.06em] text-panel-muted">
          {table.formats.length} formats
        </span>
      </div>
      <div className="table-scroll">
        <table className="w-full table-fixed text-left text-[11px] sm:text-xs">
          <thead className="border-b border-line-strong bg-surface2/45 text-[9px] font-bold uppercase tracking-[0.1em] text-faint">
            <tr>
              <th className="px-3 py-2 font-semibold sm:px-4">Stat</th>
              {table.formats.map((format) => (
                <th key={format} className="w-[52px] px-1.5 py-2 text-right font-semibold sm:w-[64px] sm:px-3">
                  {format.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.label} className="border-b border-line/60 last:border-0 hover:bg-accent/[0.04]">
                <td className="px-3 py-2.5 font-medium text-muted sm:px-4">{row.label}</td>
                {table.formats.map((format) => (
                  <td key={`${row.label}-${format}`} className="px-1.5 py-2.5 text-right tabular-nums sm:px-3">
                    {row.values[format] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RankingCards({ player }: { player: PlayerProfile }) {
  if (player.rankings.length === 0) return null;
  return (
    <section>
      <h2 className="text-sm font-bold">ICC rankings</h2>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {player.rankings.map((ranking) => (
          <div key={`${ranking.kind}-${ranking.format}`} className="card p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-faint">
                {ranking.format} · {ranking.kind}
              </span>
              {ranking.rank ? <span className="text-lg font-bold tabular-nums">#{ranking.rank}</span> : null}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted">
              <span>Best #{ranking.bestRank ?? "—"}</span>
              {ranking.diff ? (
                <span className={ranking.diff > 0 ? "text-win" : "text-live"}>
                  {ranking.diff > 0 ? `+${ranking.diff}` : ranking.diff}
                </span>
              ) : null}
            </div>
            <Link
              href={`/rankings?gender=men&format=${ranking.format.toLowerCase()}&category=${ranking.kind === "all-rounder" ? "all-rounder" : ranking.kind}`}
              className="mt-2 inline-flex text-[11px] font-semibold text-accent hover:underline"
            >
              View table
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params;
  const playerId = parseId(id);
  if (!playerId) notFound();
  const player = await loadPage(getPlayerProfile(playerId));
  const hasStats = player.batting.formats.length > 0 || player.bowling.formats.length > 0;

  return (
    <div className="container-page py-5">
      <Breadcrumbs items={[{ label: "Matches", href: "/" }, { label: "Players" }, { label: player.name }]} />
      <PageHeader
        eyebrow={[player.role, player.intlTeam].filter(Boolean).join(" · ") || "Player profile"}
        title={
          <span className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <PlayerAvatar player={{ id: player.id, name: player.name, faceImageId: player.imageId }} size={108} />
            <span className="min-w-0">
              <span className="block break-words">{player.name}</span>
              {player.fullName !== player.name ? (
                <span className="mt-1 block break-words text-sm font-medium text-muted">{player.fullName}</span>
              ) : null}
            </span>
          </span>
        }
        description={[player.battingStyle, player.bowlingStyle].filter(Boolean).join(" · ")}
        meta={
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {player.dateOfBirth ? <span>Born {player.dateOfBirth}</span> : null}
            {player.birthPlace ? <span>{player.birthPlace}</span> : null}
            {player.age ? <span>Age {player.age}</span> : null}
          </div>
        }
        actions={<ShareButton title={`${player.name} · Chauka`} text={`${player.name} profile`} label="Share" />}
      >
        {player.teams.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {player.teams.map((team) => (
              <span key={team} className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] text-muted">
                {team}
              </span>
            ))}
          </div>
        ) : null}
      </PageHeader>

      <div className="mt-4 space-y-5">
        <RankingCards player={player} />

        {player.career.length > 0 ? (
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b-2 border-panel-ink/25 bg-panel px-4 py-3 text-panel-ink">
              <h2 className="display text-[18px] font-bold leading-none tracking-[-0.02em]">
                Career
              </h2>
              <span className="mono text-[9px] uppercase tracking-[0.06em] text-panel-muted">
                {player.career.length} formats
              </span>
            </div>
            <div className="table-scroll">
              <table className="w-full text-left text-[11px] sm:text-xs">
                <thead className="border-b border-line-strong bg-surface2/45 text-[9px] font-bold uppercase tracking-[0.1em] text-faint">
                  <tr>
                    <th className="px-3 py-2 font-semibold sm:px-4">Format</th>
                    <th className="px-3 py-2 font-semibold">Debut</th>
                    <th className="px-3 py-2 text-right font-semibold sm:px-4">Last played</th>
                  </tr>
                </thead>
                <tbody>
                  {player.career.map((entry) => (
                    <tr key={entry.format} className="border-b border-line/60 last:border-0 hover:bg-accent/[0.04]">
                      <td className="px-3 py-2.5 font-semibold sm:px-4">{entry.format}</td>
                      <td className="px-3 py-2.5 text-muted">{entry.debut ?? "—"}</td>
                      <td className="px-3 py-2.5 text-right text-muted sm:px-4">{entry.lastPlayed ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {hasStats ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <StatsTable title="Batting" table={player.batting} />
            <StatsTable title="Bowling" table={player.bowling} />
          </div>
        ) : null}

        {player.recentBatting.length > 0 ? (
          <section className="card overflow-hidden">
            <div className="border-b border-line bg-surface2/60 px-4 py-3">
              <h2 className="text-sm font-bold">Recent batting</h2>
            </div>
            <div className="divide-y divide-line/70">
              {player.recentBatting.map((row, index) => (
                <div key={`${row.matchId ?? "match"}-${index}`} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                  <span className="min-w-0 flex-1">
                    {row.matchId ? (
                      <Link href={`/match/${row.matchId}`} className="font-semibold transition-colors hover:text-accent">
                        {row.score}
                      </Link>
                    ) : (
                      <span className="font-semibold">{row.score}</span>
                    )}
                    <span className="ml-2 text-faint">{row.opponent ?? ""}</span>
                  </span>
                  <span className="text-faint">{row.format ?? ""}</span>
                  <span className="hidden text-faint sm:inline">{row.date ?? ""}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!hasStats && player.career.length === 0 ? (
          <EmptyState
            title="Profile stats unavailable"
            description="This player's career data is not available in the current feed."
            actionHref="/search"
            actionLabel="Search players"
          />
        ) : null}
      </div>
    </div>
  );
}
