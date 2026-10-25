import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Trophy } from "lucide-react";
import { getSeriesList } from "@/lib/data/series";
import { loadPage } from "@/lib/page-data";
import { formatDateRange, timeAgo } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FormatPill, LiveDot, StatePill } from "@/components/ui/pills";
import { TeamBadge } from "@/components/ui/team-badge";
import type { SeriesListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cricket Series",
  description: "Live and upcoming cricket series, schedules, points tables and tournament stats.",
};

function SeriesCard({ item }: { item: SeriesListItem }) {
  return (
    <Link href={`/series/${item.id}`} className="card card-hover group block overflow-hidden p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {item.format ? <FormatPill format={item.format.toUpperCase()} /> : null}
          <StatePill state={item.state} label={item.state === "completed" ? "Completed" : undefined} />
        </div>
        <span className="text-[11px] text-faint">{item.matches} matches</span>
      </div>
      <h2 className="mt-3 line-clamp-2 text-base font-bold leading-snug transition-colors group-hover:text-accent">
        {item.name}
      </h2>
      <p className="mt-1 text-[11px] text-faint">{formatDateRange(item.startDate, item.endDate)}</p>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {item.teams.slice(0, 6).map((team) => (
            <TeamBadge key={team.id} team={team} size={24} className="ring-2 ring-surface" />
          ))}
        </div>
        {item.teams.length > 6 ? <span className="text-[10px] text-faint">+{item.teams.length - 6}</span> : null}
      </div>
      <div className="mt-3 flex items-center gap-3 border-t border-line pt-2.5 text-[11px] text-muted">
        {item.live > 0 ? (
          <span className="inline-flex items-center gap-1 font-semibold text-live">
            <LiveDot /> {item.live} live
          </span>
        ) : null}
        {item.upcoming > 0 ? <span>{item.upcoming} upcoming</span> : null}
        {item.completed > 0 ? <span>{item.completed} completed</span> : null}
      </div>
    </Link>
  );
}

function SeriesSection({ title, items }: { title: string; items: SeriesListItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-7">
      <div className="flex items-center gap-3 border-b border-line pb-2">
        <h2 className="text-sm font-bold">{title}</h2>
        <span className="text-xs text-faint">{items.length}</span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <SeriesCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default async function SeriesPage() {
  const series = await loadPage(getSeriesList());
  const live = series.filter((item) => item.state === "live");
  const upcoming = series.filter((item) => item.state === "upcoming");
  const completed = series.filter((item) => item.state === "completed");

  return (
    <div className="container-page py-5">
      <PageHeader
        eyebrow="Tournaments & bilateral series"
        title="Series"
        description="Schedules, live matches, points tables and the players shaping every series in the current feed."
        meta={<span>Updated {timeAgo(Date.now())}</span>}
      />

      {series.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-5 w-5" />}
          title="No series in the feed"
          description="Series will appear here as soon as the next schedule is published."
          actionHref="/"
          actionLabel="Back to matches"
          className="mt-6"
        />
      ) : (
        <>
          <SeriesSection title="Live & in progress" items={live} />
          <SeriesSection title="Upcoming" items={upcoming} />
          <SeriesSection title="Recent results" items={completed} />
        </>
      )}

      <p className="mt-8 flex items-center gap-1.5 text-xs text-faint">
        <CalendarDays className="h-3.5 w-3.5" />
        Schedules are loaded from the live cricket feed and may change.
      </p>
    </div>
  );
}
