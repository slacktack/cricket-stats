import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Trophy } from "lucide-react";
import { getSeriesList } from "@/lib/data/series";
import { loadPage } from "@/lib/page-data";
import { cn, formatDateRange, timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { FallingBall } from "@/components/falling-ball";
import { LiveDot } from "@/components/ui/pills";
import { TeamBadge } from "@/components/ui/team-badge";
import type { SeriesListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cricket Series",
  description: "Live and upcoming cricket series, schedules, points tables and tournament stats.",
};

function SeriesCard({ item, index }: { item: SeriesListItem; index: number }) {
  return (
    <Link
      href={`/series/${item.id}`}
      className="group grid gap-4 border-t border-line-strong py-5 transition-colors hover:bg-accent-soft/25 sm:grid-cols-[40px_minmax(0,1fr)_196px] sm:gap-6 sm:px-2"
    >
      <span className="mono text-[10px] font-medium text-faint">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] font-medium uppercase tracking-[0.1em]">
          <span className="text-accent">{item.format ?? "Series"}</span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              item.state === "live"
                ? "text-live"
                : item.state === "upcoming"
                  ? "text-warn"
                  : "text-faint"
            )}
          >
            {item.state === "live" ? <LiveDot /> : null}
            {item.state === "completed" ? "Completed" : item.state}
          </span>
          <span className="text-faint">{item.matches} matches</span>
        </div>

        <h2 className="display mt-2 text-[clamp(1.45rem,2.6vw,2.15rem)] font-bold leading-[1.02] tracking-[-0.035em] transition-colors group-hover:text-accent">
          {item.name}
        </h2>

        <p className="mt-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.05em] text-faint">
          <CalendarDays className="h-3 w-3 shrink-0" />
          {formatDateRange(item.startDate, item.endDate)}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {item.teams.slice(0, 6).map((team) => (
              <TeamBadge
                key={team.id}
                team={team}
                size={26}
                className="rounded-[2px] bg-bg ring-2 ring-bg"
              />
            ))}
          </div>
          {item.teams.length > 6 ? (
            <span className="grid h-6 min-w-6 place-items-center border border-line bg-bg px-1 font-mono text-[8px] font-medium text-faint">
              +{item.teams.length - 6}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] font-medium uppercase tracking-[0.06em] text-muted">
          {item.live > 0 ? (
            <span className="inline-flex items-center gap-1 text-live">
              <LiveDot /> {item.live} live
            </span>
          ) : null}
          {item.upcoming > 0 ? <span>{item.upcoming} upcoming</span> : null}
          {item.completed > 0 ? <span>{item.completed} completed</span> : null}
        </div>
        <span className="inline-flex items-center gap-1 font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-accent">
          Open
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function SeriesSection({
  title,
  items,
  live = false,
}: {
  title: string;
  items: SeriesListItem[];
  live?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8">
      <div className="mb-1 flex items-end gap-3 border-b border-line-strong pb-3">
        <span className={cn("mb-1 h-2.5 w-2.5 rounded-full", live ? "bg-live" : "bg-accent")} />
        <h2 className="display text-[clamp(1.8rem,3.4vw,2.7rem)] font-bold leading-none tracking-[-0.04em]">
          {title}
        </h2>
        <span className="mono ml-auto pb-0.5 text-[10px] font-medium text-faint">
          {String(items.length).padStart(2, "0")}
        </span>
      </div>
      <div className="stagger border-b border-line-strong">
        {items.map((item, index) => (
          <SeriesCard key={item.id} item={item} index={index} />
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
    <div className="container-page py-5 sm:py-6">
      <section className="grain relative overflow-hidden rounded-xl border border-panel-ink/20 bg-panel text-panel-ink">
        <FallingBall className="absolute -right-20 -top-28 z-0 hidden h-[500px] w-[500px] text-panel-ink opacity-20 md:block" />
        <div className="relative z-10 grid lg:grid-cols-[minmax(0,1fr)_318px]">
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex items-center gap-2">
              <span className="h-px w-5 bg-panel-ink/50" />
              <span className="eyebrow text-panel-ink/70">Cricket calendar</span>
            </div>
            <h1 className="display mt-3 text-[clamp(2rem,5.8vw,4.65rem)] leading-[0.94] tracking-[-0.04em]">
              Series <span className="text-panel-muted">&amp; tours.</span>
            </h1>
            <p className="mt-3 max-w-lg text-[13px] font-medium leading-relaxed text-panel-ink/75 sm:text-sm">
              Schedules, live matches, points tables and the players shaping
              every series in the current feed.
            </p>
            <p className="mt-4 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.07em] text-panel-muted">
              <CalendarDays className="h-3 w-3" />
              Updated {timeAgo(Date.now())}
            </p>
          </div>

          <div className="grid grid-cols-3 border-t border-panel-ink/20 bg-bg lg:border-l lg:border-t-0">
            {[
              { label: "Live", value: live.length, tone: "text-live" },
              { label: "Upcoming", value: upcoming.length, tone: "text-gold" },
              { label: "Results", value: completed.length, tone: "text-win" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "flex flex-col justify-center px-4 py-5",
                  index < 2 && "border-r border-line"
                )}
              >
                <p className={cn("mono text-[28px] font-medium leading-none tracking-[-0.04em]", stat.tone)}>
                  {String(stat.value).padStart(2, "0")}
                </p>
                <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-faint">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
          <SeriesSection title="Live & in progress" items={live} live />
          <SeriesSection title="Upcoming" items={upcoming} />
          <SeriesSection title="Recent results" items={completed} />
        </>
      )}

      <p className="mt-8 flex items-center gap-1.5 text-[11px] text-faint">
        <CalendarDays className="h-3.5 w-3.5" />
        Schedules are loaded from the live cricket feed and may change.
      </p>
    </div>
  );
}
