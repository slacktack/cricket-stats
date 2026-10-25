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
        <span className="mono text-[11px] uppercase tracking-[0.04em] text-panel-muted">
          {table.formats.length} formats
        </span>
      </div>
      <div className="table-scroll">
        <table className="w-full table-fixed text-left text-xs sm:text-[13px]">
          <thead className="border-b border-line-strong bg-surface2/45 text-[10px] font-bold uppercase tracking-[0.1em] text-faint">
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
            {table.rows.map((row, rowIndex) => (
              <tr key={`${row.label}-${rowIndex}`} className="border-b border-line/60 last:border-0 hover:bg-accent/[0.04]">
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
      <h2 className="text-[15px] font-bold">ICC rankings</h2>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {player.rankings.map((ranking) => (
          <Link
            key={`${ranking.kind}-${ranking.format}`}
            href={`/rankings?gender=men&format=${ranking.format.toLowerCase()}&category=${ranking.kind === "all-rounder" ? "all-rounder" : ranking.kind}`}
            className="card card-hover block p-3.5"
          >
            <p className="text-xs font-semibold capitalize text-faint">
              {ranking.format} {ranking.kind}
            </p>
            <p className="mono mt-2 text-[28px] font-bold leading-none tabular-nums">
              {ranking.rank ? `#${ranking.rank}` : "—"}
            </p>
            <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-muted">
              <span>{ranking.bestRank ? `Best #${ranking.bestRank}` : "Unranked"}</span>
              {ranking.diff ? (
                <span className={ranking.diff > 0 ? "font-semibold text-win" : "font-semibold text-live"}>
                  {ranking.diff > 0 ? `+${ranking.diff}` : ranking.diff}
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TeamChips({ teams }: { teams: string[] }) {
  const visible = teams.slice(0, 5);
  const rest = teams.slice(5);
  const chip = "rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted";
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((team, index) => (
        <span key={`${team}-${index}`} className={chip}>
          {team}
        </span>
      ))}
      {rest.length > 0 ? (
        <details className="group contents">
          <summary
            className={`${chip} cursor-pointer list-none font-semibold text-accent marker:hidden group-open:hidden`}
          >
            +{rest.length} more
          </summary>
          {rest.map((team, index) => (
            <span key={`${team}-${index}`} className={chip}>
              {team}
            </span>
          ))}
        </details>
      ) : null}
    </div>
  );
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params;
  const playerId = parseId(id);
  if (!playerId) notFound();
  const player = await loadPage(getPlayerProfile(playerId));
  const hasStats = player.batting.formats.length > 0 || player.bowling.formats.length > 0;

  return (
    <div className="container-page py-4 sm:py-6">
      <Breadcrumbs items={[{ label: "Matches", href: "/" }, { label: "Players" }, { label: player.name }]} />
      <PageHeader
        eyebrow={[player.role, player.intlTeam].filter(Boolean).join(" · ") || "Player profile"}
        title={
          <span className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <PlayerAvatar player={{ id: player.id, name: player.name, faceImageId: player.imageId }} size={96} />
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
        {player.teams.length > 0 ? <TeamChips teams={player.teams} /> : null}
      </PageHeader>

      <div className="mt-4 space-y-5">
        <RankingCards player={player} />

        {hasStats ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <StatsTable title="Batting" table={player.batting} />
            <StatsTable title="Bowling" table={player.bowling} />
          </div>
        ) : null}

        {player.recentBatting.length > 0 ? (
          <section className="card overflow-hidden">
            <div className="border-b border-line bg-surface2/60 px-4 py-3">
              <h2 className="text-[15px] font-bold">Recent batting</h2>
            </div>
            <div className="divide-y divide-line/70">
              {player.recentBatting.map((row, index) => (
                <div key={`${row.matchId ?? "match"}-${index}`} className="flex items-center gap-3 px-4 py-3 text-[13px]">
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

        {player.career.length > 0 ? (
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b-2 border-panel-ink/25 bg-panel px-4 py-3 text-panel-ink">
              <h2 className="display text-[18px] font-bold leading-none tracking-[-0.02em]">
                Career
              </h2>
              <span className="mono text-[11px] uppercase tracking-[0.04em] text-panel-muted">
                {player.career.length} formats
              </span>
            </div>
            <div className="divide-y divide-line/70">
              {player.career.map((entry, index) => (
                <div
                  key={`${entry.format}-${index}`}
                  className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-3 px-4 py-3 text-[13px] sm:grid-cols-[72px_minmax(0,1fr)_minmax(0,1fr)]"
                >
                  <span className="font-bold">{entry.format}</span>
                  <p className="min-w-0 leading-snug text-muted">
                    <span className="block text-[11px] font-semibold text-faint">Debut</span>
                    {entry.debut ?? "—"}
                  </p>
                  <p className="col-start-2 mt-2 min-w-0 leading-snug text-muted sm:col-start-auto sm:mt-0">
                    <span className="block text-[11px] font-semibold text-faint">Last played</span>
                    {entry.lastPlayed ?? "—"}
                  </p>
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
