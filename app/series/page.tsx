import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Radio, Trophy } from "lucide-react";
import { getSeriesList } from "@/lib/data/series";
import { loadPage } from "@/lib/page-data";
import { cn, formatDateRange, timeAgo } from "@/lib/utils";
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
    <Link
      href={`/series/${item.id}`}
      className="group relative overflow-hidden rounded-xl border border-line bg-surface p-4 transition-colors duration-150 hover:border-line-strong"
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {item.format ? (
            <FormatPill format={item.format.toUpperCase()} />
          ) : null}
          <StatePill
            state={item.state}
            label={item.state === "completed" ? "Completed" : undefined}
          />
        </div>
        <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-surface2 px-2 text-[9px] font-extrabold uppercase tracking-[0.06em] text-faint">
          {item.matches} matches
        </span>
      </div>

      <h2 className="relative mt-3 line-clamp-2 text-[16px] font-extrabold leading-snug tracking-[-0.015em] transition-colors group-hover:text-accent">
        {item.name}
      </h2>
      <p className="relative mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-faint">
        <CalendarDays className="h-3 w-3" />
        {formatDateRange(item.startDate, item.endDate)}
      </p>

      <div className="relative mt-3 flex items-center gap-2">
        <div className="flex -space-x-2">
          {item.teams.slice(0, 6).map((team) => (
            <TeamBadge
              key={team.id}
              team={team}
              size={27}
              className="rounded-lg shadow-sm ring-2 ring-surface"
            />
          ))}
        </div>
        {item.teams.length > 6 ? (
          <span className="grid h-7 min-w-7 place-items-center rounded-lg bg-surface2 px-1 text-[9px] font-extrabold text-faint">
            +{item.teams.length - 6}
          </span>
        ) : null}
        <ArrowUpRight className="ml-auto h-4 w-4 text-faint transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>

      <div className="relative mt-3 flex flex-wrap items-center gap-2 border-t border-line/70 pt-2.5 text-[10px] font-bold text-muted">
        {item.live > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-live/10 px-2 py-1 text-live">
            <LiveDot /> {item.live} live
          </span>
        ) : null}
        {item.upcoming > 0 ? (
          <span className="rounded-full bg-surface2 px-2 py-1 text-muted">
            {item.upcoming} upcoming
          </span>
        ) : null}
        {item.completed > 0 ? (
          <span className="rounded-full bg-surface2 px-2 py-1">
            {item.completed} completed
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function SeriesSection({
  title,
  items,
  tone = "accent",
}: {
  title: string;
  items: SeriesListItem[];
  tone?: "live" | "accent" | "muted";
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center gap-2.5">
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-xl ring-1 ring-inset",
            tone === "live"
              ? "bg-live/10 text-live ring-live/15"
              : tone === "accent"
                ? "bg-accent/10 text-accent ring-accent/15"
                : "bg-surface2 text-muted ring-line"
          )}
        >
          {tone === "live" ? (
            <Radio className="h-4 w-4" />
          ) : (
            <Trophy className="h-4 w-4" />
          )}
        </span>
        <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">{title}</h2>
        <span className="rounded-full bg-surface2 px-2 py-0.5 text-[9px] font-extrabold tabular-nums text-faint">
          {items.length}
        </span>
      </div>
      <div className="stagger grid gap-3 sm:grid-cols-2">
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
          <SeriesSection title="Live & in progress" items={live} tone="live" />
          <SeriesSection title="Upcoming" items={upcoming} tone="accent" />
          <SeriesSection title="Recent results" items={completed} tone="muted" />
        </>
      )}

      <p className="mt-8 flex items-center gap-1.5 text-xs text-faint">
        <CalendarDays className="h-3.5 w-3.5" />
        Schedules are loaded from the live cricket feed and may change.
      </p>
    </div>
  );
}
