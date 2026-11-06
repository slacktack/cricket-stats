import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayerProfile } from "@/lib/data/player";
import { loadPage } from "@/lib/page-data";
import { Breadcrumbs, PageHeader } from "@/components/page-header";
import { ShareButton } from "@/components/share-button";
import { PlayerAvatar } from "@/components/ui/team-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { PlayerProfile, PlayerStatsTable } from "@/lib/types";

export const dynamic = "force-dynamic";

type PlayerPageProps = {
  params: Promise<{ id: string }>;
};

function parseId(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function generateMetadata({
  params,
}: PlayerPageProps): Promise<Metadata> {
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

/** The format this player has actually played — the one the figures come from. */
function mainFormat(table: PlayerStatsTable): string | undefined {
  if (table.formats.length === 0) return undefined;
  const counts = table.rows.find((row) => /match|mat\b|inn/i.test(row.label));
  if (!counts) return table.formats[0];
  let best = table.formats[0];
  let bestValue = -1;
  for (const format of table.formats) {
    const value = Number(String(counts.values[format] ?? "").replace(/,/g, ""));
    if (Number.isFinite(value) && value > bestValue) {
      bestValue = value;
      best = format;
    }
  }
  return best;
}

function HeadlineFigures({ player }: { player: PlayerProfile }) {
  const source =
    player.batting.formats.length > 0 ? player.batting : player.bowling;
  const format = mainFormat(source);
  if (!format) return null;
  const figures = source.rows.slice(0, 5).map((row) => ({
    label: row.label,
    value: row.values[format] ?? "—",
  }));

  return (
    <section className="blk mt-4">
      <div className="band">
        <h3>Career in numbers</h3>
        <span className="dcell shrink-0">{format} · most active</span>
      </div>
      <div className="flow stagger">
        {figures.map((figure) => (
          <div key={figure.label}>
            <p className="dnum !text-[clamp(26px,3.2vw,46px)] !text-accent">
              {figure.value}
            </p>
            <p className="mt-1.5 text-[10px] font-bold uppercase leading-none tracking-[0.1em] text-muted">
              {figure.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Block({
  title,
  note,
  children,
  className,
}: {
  title: string;
  note?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("blk", className)}>
      <div className="band">
        <h3>{title}</h3>
        {note ? <span className="dcell shrink-0">{note}</span> : null}
      </div>
      {children}
    </section>
  );
}

function StatsTable({ title, table }: { title: string; table: PlayerStatsTable }) {
  if (table.formats.length === 0 || table.rows.length === 0) return null;
  return (
    <Block title={title} note={`${table.formats.length} formats`}>
      <div className="table-scroll">
        <table className="dtable">
          <thead className="dhead">
            <tr>
              <th data-lead>Stat</th>
              {table.formats.map((format) => (
                <th key={format} className="w-[64px] text-right sm:w-[76px]">
                  {format}
                </th>
              ))}
              <th data-trail className="w-[64px] text-right sm:w-[76px]">
                All
              </th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => {
              const aggregate = Object.values(row.values).reduce(
                (total, value) => {
                  const parsed = Number(String(value ?? "").replace(/,/g, ""));
                  return Number.isFinite(parsed) ? total + parsed : total;
                },
                0
              );
              const showTotal =
                aggregate > 0 && /match|run|wkt|wkts|ball|over|inn|6s|4s|50|100/i.test(row.label);
              return (
                <tr key={`${row.label}-${rowIndex}`} className="drow">
                  <td data-lead className="dname !text-[12.5px] !font-bold text-muted">
                    {row.label}
                  </td>
                  {table.formats.map((format) => (
                    <td key={`${row.label}-${format}`} className="dnum text-right !text-[13px]">
                      {row.values[format] ?? "—"}
                    </td>
                  ))}
                  <td
                    data-trail
                    className="dnum text-right !text-[13px] text-accent"
                  >
                    {showTotal ? aggregate.toLocaleString("en-IN") : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Block>
  );
}

function RankingCards({ player }: { player: PlayerProfile }) {
  if (player.rankings.length === 0) return null;
  return (
    <Block
      title="ICC rankings"
      note="Latest weekly update"
      className="mt-4"
    >
      <div className="gcols !grid-cols-2 lg:!grid-cols-4">
        {player.rankings.map((ranking) => (
          <Link
            key={`${ranking.kind}-${ranking.format}`}
            href={`/rankings?gender=men&format=${ranking.format.toLowerCase()}&category=${
              ranking.kind === "all-rounder" ? "all-rounder" : ranking.kind
            }`}
            className="group card-hover"
          >
            <p className="kicker !text-[9.5px]">
              {ranking.format} {ranking.kind}
            </p>
            <p className="dnum mt-2 !text-[clamp(30px,3.6vw,48px)] !text-accent">
              {ranking.rank ? `#${ranking.rank}` : "—"}
            </p>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <span className="dcell">
                {ranking.bestRank ? `Best #${ranking.bestRank}` : "Unranked"}
              </span>
              {ranking.diff ? (
                <span
                  className={cn(
                    "dnum !text-[12px]",
                    ranking.diff > 0 ? "text-live" : "text-wkt"
                  )}
                >
                  {ranking.diff > 0 ? `▲ +${ranking.diff}` : `▼ ${ranking.diff}`}
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </Block>
  );
}

function TeamChips({ teams }: { teams: string[] }) {
  const visible = teams.slice(0, 5);
  const rest = teams.slice(5);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((team, index) => (
        <span key={`${team}-${index}`} className="chip !text-[11px]">
          {team}
        </span>
      ))}
      {rest.length > 0 ? (
        <details className="group contents">
          <summary className="chip !h-auto cursor-pointer list-none !text-accent marker:hidden group-open:hidden">
            +{rest.length} more
          </summary>
          {rest.map((team, index) => (
            <span key={`${team}-${index}`} className="chip !text-[11px]">
              {team}
            </span>
          ))}
        </details>
      ) : null}
    </div>
  );
}

function RecentForm({ player }: { player: PlayerProfile }) {
  if (player.recentBatting.length === 0) return null;
  return (
    <Block title="Recent form" note={`${player.recentBatting.length} innings`}>
      <ol>
        {player.recentBatting.map((row, index) => (
          <li
            key={`${row.matchId ?? "match"}-${index}`}
            className="hrow !px-4 !py-2.5"
          >
            <div className="flex items-baseline gap-3">
              <span className="mono shrink-0 text-[10px] text-faint">
                {String(index + 1).padStart(2, "0")}
              </span>
              {row.matchId ? (
                <Link
                  href={`/match/${row.matchId}`}
                  className="dname shrink-0 !text-[14px] underlink"
                >
                  {row.score}
                </Link>
              ) : (
                <span className="dname shrink-0 !text-[14px]">{row.score}</span>
              )}
              <span className="leaders" />
              <span className="dcell shrink-0 truncate">
                {row.opponent ?? ""}
              </span>
              <span className="dtag shrink-0">{row.format ?? ""}</span>
              <span
                className="dcell hidden shrink-0 tabular-nums sm:inline"
                suppressHydrationWarning
              >
                {row.date ?? ""}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </Block>
  );
}

function CareerSpan({ player }: { player: PlayerProfile }) {
  if (player.career.length === 0) return null;
  return (
    <Block title="Career span" note={`${player.career.length} formats`}>
      <dl className="figs !px-4 !pb-4">
        {player.career.map((entry, index) => (
          <div key={`${entry.format}-${index}`} className="!py-2">
            <dt className="!text-accent">{entry.format}</dt>
            <dd className="ml-auto text-right">
              <span className="dcell">Debut </span>
              <span className="dname !text-[12.5px]">{entry.debut ?? "—"}</span>
              <span className="mx-2 text-faint">·</span>
              <span className="dcell">Last </span>
              <span className="dname !text-[12.5px]">
                {entry.lastPlayed ?? "—"}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </Block>
  );
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params;
  const playerId = parseId(id);
  if (!playerId) notFound();
  const player = await loadPage(getPlayerProfile(playerId));
  const hasStats =
    player.batting.formats.length > 0 || player.bowling.formats.length > 0;

  return (
    <div className="container-page py-4 sm:py-6">
      <Breadcrumbs
        items={[
          { label: "Matches", href: "/" },
          { label: "Players" },
          { label: player.name },
        ]}
      />
      <PageHeader
        eyebrow={[player.role, player.intlTeam].filter(Boolean).join(" · ") || "Player profile"}
        title={
          <span className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <PlayerAvatar
              player={{ id: player.id, name: player.name, faceImageId: player.imageId }}
              size={96}
            />
            <span className="min-w-0">
              <span className="block break-words">{player.name}</span>
              {player.fullName !== player.name ? (
                <span className="mt-2 block break-words text-[13px] font-bold uppercase leading-tight tracking-[0.02em] opacity-70">
                  {player.fullName}
                </span>
              ) : null}
            </span>
          </span>
        }
        description={[player.battingStyle, player.bowlingStyle]
          .filter(Boolean)
          .join(" · ")}
        meta={
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {player.dateOfBirth ? <span>Born {player.dateOfBirth}</span> : null}
            {player.birthPlace ? <span>{player.birthPlace}</span> : null}
            {player.age ? <span>Age {player.age}</span> : null}
          </div>
        }
        actions={
          <ShareButton
            title={`${player.name} · Chauka`}
            text={`${player.name} profile`}
            label="Share"
          />
        }
      >
        {player.teams.length > 0 ? <TeamChips teams={player.teams} /> : null}
      </PageHeader>

      <div className="mt-4 space-y-4">
        <HeadlineFigures player={player} />
        <RankingCards player={player} />

        {hasStats ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <StatsTable title="Batting" table={player.batting} />
            <StatsTable title="Bowling" table={player.bowling} />
          </div>
        ) : null}

        <RecentForm player={player} />
        <CareerSpan player={player} />

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
