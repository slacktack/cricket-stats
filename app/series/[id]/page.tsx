import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getSeriesInfo } from "@/lib/data/series";
import { loadPage } from "@/lib/page-data";
import { formatDateRange, formatDate, timeAgo, cn } from "@/lib/utils";
import { Breadcrumbs, PageHeader } from "@/components/page-header";
import { FollowSeriesButton } from "@/components/follow-buttons";
import { ShareButton } from "@/components/share-button";
import { MatchCard } from "@/components/match-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormatPill, LiveDot, StatePill } from "@/components/ui/pills";
import { TeamBadge } from "@/components/ui/team-badge";
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
    <div className="card overflow-hidden">
      <div className="border-b border-line bg-surface2/60 px-4 py-3">
        <h2 className="text-sm font-extrabold">{stats.title}</h2>
      </div>
      <div className="table-scroll">
        <table className="w-full min-w-[620px] text-left text-xs">
          <thead className="border-b border-line text-[10px] uppercase tracking-wide text-faint">
            <tr>
              <th className="px-4 py-2 font-semibold">#</th>
              {stats.headers.map((header) => (
                <th key={header} className="px-2 py-2 text-right font-semibold last:pr-4">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.rows.map((row, index) => (
              <tr key={`${row.id}-${index}`} className="border-b border-line/70 last:border-0">
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
  if (series.matchGroups.length === 0) {
    return <EmptyState title="No matches" description="The schedule has not been published." className="mt-4" />;
  }
  return (
    <div className="mt-4 space-y-7">
      {series.matchGroups.map((group) => (
        <section key={group.label}>
          <div className="flex items-center gap-2 border-b border-line-strong pb-2">
            <h2 className="text-sm font-bold">{group.label}</h2>
            <span className="text-[11px] text-faint">{group.matches.length} matches</span>
          </div>
          <div>
            {group.matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function PointsTab({ series }: { series: SeriesInfo }) {
  if (!series.pointsTable?.length) {
    return <EmptyState title="No points table" description="This series does not have a points table yet." className="mt-4" />;
  }
  return (
    <div className="mt-4 space-y-4">
      {series.pointsTable.map((group) => (
        <section key={group.groupName} className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line bg-surface2/60 px-4 py-3">
            <h2 className="text-sm font-extrabold">{group.groupName}</h2>
            {series.pointsUpdatedAt ? <span className="text-[11px] text-faint">Updated {timeAgo(series.pointsUpdatedAt)}</span> : null}
          </div>
          <div className="table-scroll">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="border-b border-line text-[10px] uppercase tracking-wide text-faint">
                <tr>
                  <th className="px-4 py-2 font-semibold">Team</th>
                  <th className="px-2 py-2 text-right font-semibold">M</th>
                  <th className="px-2 py-2 text-right font-semibold">W</th>
                  <th className="px-2 py-2 text-right font-semibold">L</th>
                  <th className="px-2 py-2 text-right font-semibold">T</th>
                  <th className="px-2 py-2 text-right font-semibold">NR</th>
                  <th className="px-2 py-2 text-right font-semibold">NRR</th>
                  <th className="px-2 py-2 text-right font-semibold">Pts</th>
                  <th className="px-4 py-2 text-right font-semibold">Form</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={row.teamId || row.teamName} className="border-b border-line/70 transition-colors last:border-0 hover:bg-accent/[0.035]">
                    <td className="px-4 py-2.5">
                      <Link href={row.teamId ? `/teams/${row.teamId}` : `/search?q=${encodeURIComponent(row.teamName)}`} className="flex items-center gap-2 font-semibold transition-colors hover:text-accent">
                        <TeamBadge team={{ name: row.teamFullName, shortName: row.teamName, imageId: row.imageId }} size={22} />
                        <span className="truncate">{row.teamName}</span>
                      </Link>
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-muted">{row.matchesPlayed}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-muted">{row.matchesWon}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-muted">{row.matchesLost}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-muted">{row.matchesTied}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-muted">{row.noRes}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-muted">{row.nrr}</td>
                    <td className="px-2 py-2.5 text-right font-bold tabular-nums">{row.points}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        {row.form.slice(-5).map((result, index) => (
                          <span
                            key={`${result}-${index}`}
                            className={cn(
                              "grid h-4 w-4 place-items-center rounded text-[9px] font-bold",
                              result === "W" ? "bg-win/15 text-win" : result === "L" ? "bg-live/15 text-live" : "bg-surface2 text-faint"
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
      {series.teams.map((team) => (
        <Link key={team.id} href={`/teams/${team.id}`} className="card card-hover flex items-center gap-2.5 p-3">
          <TeamBadge team={team} size={30} />
          <span className="min-w-0 truncate text-xs font-semibold">{team.name}</span>
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
  const state = live
    ? "live"
    : series.matches.some((match) => match.state === "upcoming")
      ? "upcoming"
      : "completed";

  return (
    <div className="container-page py-5">
      <Breadcrumbs items={[{ label: "Series", href: "/series" }, { label: series.name }]} />
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            {series.format ? <FormatPill format={series.format.toUpperCase()} /> : null}
            <StatePill state={state} />
            {live > 0 ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-live"><LiveDot /> {live} live</span> : null}
          </div>
        }
        title={series.name}
        description={`${formatDateRange(series.startDate, series.endDate)} · ${series.matches.length} matches · ${series.teams.length} teams`}
        meta={
          <div className="flex flex-wrap items-center gap-3">
            <span>Starts {formatDate(series.startDate ?? 0)}</span>
            {series.endDate ? <span>Ends {formatDate(series.endDate)}</span> : null}
          </div>
        }
        actions={
          <>
            <FollowSeriesButton series={series} />
            <ShareButton title={`${series.name} · Chauka`} text="Series schedule, points table and stats" />
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          {series.teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-1 text-[11px] transition-colors hover:border-accent/40">
              <TeamBadge team={team} size={18} />
              {team.shortName}
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="sticky top-[68px] z-20 mt-1 rounded-xl border border-line bg-bg p-1.5">
        <div className="table-scroll no-scrollbar" role="tablist" aria-label="Series sections">
          <div className="flex min-w-max items-center gap-1">
            {TABS.map((item) => {
              const active = tab === item.key;
              return (
                <Link
                  key={item.key}
                  href={`/series/${seriesId}?tab=${item.key}`}
                  role="tab"
                  aria-selected={active}
                  data-active={active}
                  className="tab-link"
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
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
