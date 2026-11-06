import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getSeriesInfo } from "@/lib/data/series";
import { loadPage } from "@/lib/page-data";
import { formatDateRange, timeAgo, cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/page-header";
import { BlueHero, HeroChip, HeroStat } from "@/components/ui/blue-hero";
import { FollowSeriesButton } from "@/components/follow-buttons";
import { ShareButton } from "@/components/share-button";
import { SeriesMatches } from "@/components/series/series-matches";
import { EmptyState } from "@/components/ui/empty-state";
import { TeamBadge } from "@/components/ui/team-badge";
import { LiveDot } from "@/components/ui/pills";
import type { SeriesInfo, SeriesStats } from "@/lib/types";

export const dynamic = "force-dynamic";

type SeriesTab = "matches" | "points" | "stats" | "teams";

const TABS: { key: SeriesTab; label: string }[] = [
  { key: "matches", label: "Matches" },
  { key: "points", label: "Points table" },
  { key: "stats", label: "Stats" },
  { key: "teams", label: "Teams" },
];

type SeriesPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

function parseId(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function generateMetadata({ params }: SeriesPageProps): Promise<Metadata> {
  const { id } = await params;
  const seriesId = parseId(id);
  if (!seriesId) return { title: "Series" };
  try {
    const series = await getSeriesInfo(seriesId);
    return {
      title: series.name,
      description: `${series.name} — matches, points table and tournament stats.`,
    };
  } catch {
    return { title: "Series" };
  }
}

function StatsTable({ stats }: { stats: SeriesStats }) {
  return (
    <div className="blk">
      <div className="band">
        <h3>{stats.title}</h3>
        <span className="dcell shrink-0">
          {stats.rows.length} entries
        </span>
      </div>
      <div className="divide-y divide-[var(--rule)] md:hidden">
        {stats.rows.map((row, index) => (
          <div key={`${row.id}-${index}`} className="px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="mono mt-0.5 w-5 shrink-0 text-[10px] text-faint">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                {row.id ? (
                  <Link href={`/players/${row.id}`} className="block truncate text-sm font-bold transition-colors hover:text-accent">
                    {row.name}
                  </Link>
                ) : (
                  <span className="block truncate text-sm font-bold">{row.name}</span>
                )}
                <div className="mt-2 grid grid-cols-4 gap-x-2 gap-y-2">
                  {stats.headers.map((header, headerIndex) => (
                    <div key={`${row.id}-${header}`} className="min-w-0">
                      <p className="mono truncate text-[10px] uppercase tracking-[0.06em] text-faint">
                        {header}
                      </p>
                      <p className="mono mt-0.5 truncate text-[13px] font-semibold text-ink">
                        {row.values[headerIndex] ?? "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="table-scroll hidden md:block">
        <table className="w-full min-w-[620px] text-left text-xs">
          <thead className="border-b border-line-strong bg-surface2/45 text-[10px] font-bold uppercase tracking-[0.1em] text-faint">
            <tr>
              <th className="px-4 py-2 font-semibold">#</th>
              <th className="px-2 py-2 text-right font-semibold last:pr-4">Player</th>
              {stats.headers.map((header) => (
                <th key={header} className="px-2 py-2 text-right font-semibold last:pr-4">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.rows.map((row, index) => (
              <tr key={`${row.id}-${index}`} className="border-b border-line/60 last:border-0 hover:bg-accent/[0.04]">
                <td className="px-4 py-2.5 tabular-nums text-faint">{index + 1}</td>
                <td className="px-2 py-2.5 text-right font-semibold">
                  {row.id ? (
                    <Link href={`/players/${row.id}`} className="transition-colors hover:text-accent">
                      {row.name}
                    </Link>
                  ) : (
                    row.name
                  )}
                </td>
                {row.values.map((value, valueIndex) => (
                  <td key={`${row.id}-${valueIndex}`} className="px-2 py-2.5 text-right tabular-nums text-muted last:pr-4">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MatchesTab({ series }: { series: SeriesInfo }) {
  return <SeriesMatches groups={series.matchGroups} />;
}

function PointsTab({ series }: { series: SeriesInfo }) {
  if (!series.pointsTable?.length) {
    return <EmptyState title="No points table" description="This series does not have a points table yet." className="mt-4" />;
  }
  return (
    <div className="mt-4 space-y-4">
      {series.pointsTable.map((group, groupIndex) => (
        <section key={`${group.groupName}-${groupIndex}`} className="blk">
          <div className="band">
            <h3 className="truncate">{group.groupName}</h3>
            {series.pointsUpdatedAt ? (
              <span className="dcell shrink-0">
                Updated {timeAgo(series.pointsUpdatedAt)}
              </span>
            ) : null}
          </div>
          <div className="table-scroll">
            <table className="w-full table-fixed text-left text-xs sm:text-[13px]">
              <thead className="border-b border-line-strong bg-surface2/45 text-[10px] font-bold uppercase tracking-[0.1em] text-faint">
                <tr>
                  <th className="px-2 py-2 font-semibold sm:px-4">Team</th>
                  <th className="w-8 px-1 py-2 text-right font-semibold sm:w-auto sm:px-2">M</th>
                  <th className="w-8 px-1 py-2 text-right font-semibold sm:w-auto sm:px-2">W</th>
                  <th className="w-8 px-1 py-2 text-right font-semibold sm:w-auto sm:px-2">L</th>
                  <th className="hidden px-2 py-2 text-right font-semibold sm:table-cell">T</th>
                  <th className="hidden px-2 py-2 text-right font-semibold sm:table-cell">NR</th>
                  <th className="w-[54px] px-1 py-2 text-right font-semibold sm:w-[68px] sm:px-2">NRR</th>
                  <th className="w-9 px-1 py-2 text-right font-semibold sm:w-auto sm:px-2">Pts</th>
                  <th className="hidden px-3 py-2 text-right font-semibold sm:table-cell sm:px-4">Form</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row, rowIndex) => (
                  <tr key={`${row.teamId || row.teamName}-${rowIndex}`} className="border-b border-line/60 transition-colors last:border-0 hover:bg-accent/[0.04]">
                    <td className="px-2 py-2.5 sm:px-4">
                      <Link href={row.teamId ? `/teams/${row.teamId}` : `/search?q=${encodeURIComponent(row.teamName)}`} className="flex items-center gap-1.5 font-semibold transition-colors hover:text-accent sm:gap-2">
                        <TeamBadge team={{ name: row.teamFullName, shortName: row.teamName, imageId: row.imageId }} size={20} />
                        <span className="truncate">{row.teamName}</span>
                      </Link>
                    </td>
                    <td className="px-1 py-2.5 text-right tabular-nums text-muted sm:px-2">{row.matchesPlayed}</td>
                    <td className="px-1 py-2.5 text-right tabular-nums text-muted sm:px-2">{row.matchesWon}</td>
                    <td className="px-1 py-2.5 text-right tabular-nums text-muted sm:px-2">{row.matchesLost}</td>
                    <td className="hidden px-2 py-2.5 text-right tabular-nums text-muted sm:table-cell">{row.matchesTied}</td>
                    <td className="hidden px-2 py-2.5 text-right tabular-nums text-muted sm:table-cell">{row.noRes}</td>
                    <td className="px-1 py-2.5 text-right tabular-nums text-muted sm:px-2">{row.nrr}</td>
                    <td className="px-1 py-2.5 text-right font-bold tabular-nums sm:px-2">{row.points}</td>
                    <td className="hidden px-3 py-2.5 sm:table-cell sm:px-4">
                      <div className="flex justify-end gap-1">
                        {row.form.slice(-5).map((result, index) => (
                          <span
                            key={`${result}-${index}`}
                            className={cn(
                              "grid h-4 w-4 place-items-center rounded text-[10px] font-bold",
                              result === "W" ? "bg-live/20 text-live" : result === "L" ? "bg-wkt/15 text-wkt" : "bg-surface2 text-faint"
                            )}
                          >
                            {result}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function StatsTab({ series }: { series: SeriesInfo }) {
  if (!series.stats && !series.statsWickets) {
    return <EmptyState title="No stats yet" description="Tournament stats will appear once matches are played." className="mt-4" />;
  }
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      {series.stats ? <StatsTable stats={series.stats} /> : null}
      {series.statsWickets ? <StatsTable stats={series.statsWickets} /> : null}
    </div>
  );
}

function TeamsTab({ series }: { series: SeriesInfo }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {series.teams.map((team, index) => (
        <Link key={`${team.id}-${index}`} href={`/teams/${team.id}`} className="blk group flex items-center gap-3 p-3.5 transition-colors hover:border-slab">
          <TeamBadge team={team} size={40} />
          <span className="min-w-0 truncate text-[14px] font-semibold">{team.name}</span>
        </Link>
      ))}
    </div>
  );
}

export default async function SeriesDetailPage({ params, searchParams }: SeriesPageProps) {
  const { id } = await params;
  const seriesId = parseId(id);
  if (!seriesId) notFound();
  const [series, query] = await Promise.all([
    loadPage(getSeriesInfo(seriesId)),
    searchParams,
  ]);
  const requested = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const tab: SeriesTab = TABS.some((item) => item.key === requested) ? (requested as SeriesTab) : "matches";
  const live = series.matches.filter((match) => match.state === "live").length;
  const played = series.matches.filter((match) => match.state === "completed").length;
  const state = live
    ? "live"
    : series.matches.some((match) => match.state === "upcoming")
      ? "upcoming"
      : "completed";

  return (
    <div className="container-page py-4 sm:py-6">
      <Breadcrumbs items={[{ label: "Series", href: "/series" }, { label: series.name }]} />

      <BlueHero tone="accent" className="mt-3 px-[var(--pad)] py-8 sm:py-10">
        <div className="flex flex-wrap items-center gap-2">
          {series.format ? <HeroChip>{series.format.toUpperCase()}</HeroChip> : null}
          {live > 0 ? (
            <span className="inline-flex items-center gap-1.5 border border-live bg-live px-2 py-0.5 text-[11px] font-extrabold uppercase leading-[16px] tracking-[0.08em] text-[#0a1400]">
              <LiveDot className="!bg-[#0a1400]" />
              {live} live
            </span>
          ) : (
            <HeroChip>{state === "upcoming" ? "Upcoming" : "Completed"}</HeroChip>
          )}
          <div className="ml-auto flex items-center gap-2 [&_button]:border-white/30 [&_button]:bg-white/10 [&_button]:text-white">
            <FollowSeriesButton series={series} />
            <ShareButton title={`${series.name} · Chauka`} text="Series schedule, points table and stats" />
          </div>
        </div>

        <h1 className="display mt-5 text-[clamp(28px,4vw,52px)] uppercase leading-[0.94]">
          {series.name}
        </h1>
        <p className="mt-2 text-[13px] text-white/75">
          {formatDateRange(series.startDate, series.endDate)}
        </p>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          {series.teams.length === 2 ? (
            <div className="flex items-center gap-4">
              {series.teams.map((team, index) => (
                <div key={team.id} className="flex items-center gap-4">
                  {index === 1 ? <span className="dcell !text-[13px] uppercase tracking-[0.1em] text-white/75">vs</span> : null}
                  <Link href={`/teams/${team.id}`} className="flex items-center gap-3">
                    <TeamBadge team={team} size={56} />
                    <span className="dname !text-[18px] uppercase">{team.shortName}</span>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap -space-x-2">
              {series.teams.slice(0, 10).map((team) => (
                <TeamBadge key={team.id} team={team} size={44} className="ring-1 ring-white/45" />
              ))}
              {series.teams.length > 10 ? (
                <span className="ml-4 self-center text-[13px] text-white/70">+{series.teams.length - 10} teams</span>
              ) : null}
            </div>
          )}
          <div className="flex gap-3">
            <HeroStat value={series.matches.length} label="Matches" />
            <HeroStat value={played} label="Played" />
            <HeroStat value={series.teams.length} label="Teams" />
          </div>
        </div>
      </BlueHero>

      <div className="sticky top-[var(--header-h)] z-20 mt-5 border-b border-line bg-bg">
        <div className="no-scrollbar flex gap-6 overflow-x-auto" role="tablist" aria-label="Series sections">
          {TABS.map((item) => {
            const active = tab === item.key;
            return (
              <Link
                key={item.key}
                href={`/series/${seriesId}?tab=${item.key}`}
                scroll={false}
                role="tab"
                aria-selected={active}
                className={cn(
                  "-mb-px shrink-0 border-b-2 py-3.5 text-[15px] font-semibold transition-colors",
                  active ? "border-slab text-accent" : "border-transparent text-muted hover:text-ink"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="pb-8">
        {tab === "matches" ? <MatchesTab series={series} /> : null}
        {tab === "points" ? <PointsTab series={series} /> : null}
        {tab === "stats" ? <StatsTab series={series} /> : null}
        {tab === "teams" ? <TeamsTab series={series} /> : null}
      </div>

      <Link href="/series" className="inline-flex items-center gap-1 text-xs font-semibold text-muted transition-colors hover:text-accent">
        All series <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
