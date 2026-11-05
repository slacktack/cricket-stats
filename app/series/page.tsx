import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Trophy } from "lucide-react";
import { getSeriesList } from "@/lib/data/series";
import { loadPage } from "@/lib/page-data";
import { cn, formatDateRange } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { BlueHero, HeroChip, HeroStat } from "@/components/ui/blue-hero";
import { TeamBadge } from "@/components/ui/team-badge";
import type { SeriesListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cricket Series",
  description: "Live and upcoming cricket series, schedules, points tables and tournament stats.",
};

function SeriesCard({ item }: { item: SeriesListItem }) {
  const played = item.completed;
  const pct = item.matches ? Math.round((played / item.matches) * 100) : 0;
  const live = item.state === "live";
  return (
    <Link
      href={`/series/${item.id}`}
      className={cn(
        "group flex min-w-0 flex-col rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5",
        live
          ? "bg-gradient-to-br from-[#0f2a8a] via-[#1d4ed8] to-[#3b6cff] text-white shadow-[0_18px_40px_-20px_rgb(37_99_235/0.9)]"
          : "bg-surface"
      )}
    >
      <div className="flex items-center gap-2 text-[12px]">
        <span className={cn("rounded-full px-2.5 py-0.5 font-semibold", live ? "bg-white/20" : "bg-surface2 text-muted")}>
          {item.format ?? "Series"}
        </span>
        {live ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#22c55e] px-2.5 py-0.5 font-bold text-[#052e16]">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[#052e16]" />
            {item.live} live
          </span>
        ) : (
          <span className={cn("font-medium", item.state === "upcoming" ? "text-aqua" : "text-faint")}>
            {item.state === "upcoming" ? "Upcoming" : "Completed"}
          </span>
        )}
        <ArrowUpRight className={cn("ml-auto h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5", live ? "text-white/70" : "text-faint")} />
      </div>

      <h2 className="mt-3 line-clamp-2 font-display text-[19px] font-bold leading-snug tracking-[-0.01em]">
        {item.name}
      </h2>
      <p className={cn("mt-1 flex items-center gap-1.5 text-[13px]", live ? "text-white/70" : "text-faint")}>
        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
        {formatDateRange(item.startDate, item.endDate)}
      </p>

      <div className="mt-4 flex items-center">
        <div className="flex -space-x-2">
          {item.teams.slice(0, 6).map((team) => (
            <TeamBadge key={team.id} team={team} size={32} className={live ? "ring-2 ring-[#1d4ed8]" : "ring-2 ring-surface"} />
          ))}
        </div>
        {item.teams.length > 6 ? (
          <span className={cn("ml-2 text-[12px] font-semibold", live ? "text-white/70" : "text-faint")}>
            +{item.teams.length - 6}
          </span>
        ) : null}
      </div>

      <div className="mt-auto pt-5">
        <div className={cn("flex justify-between text-[12px]", live ? "text-white/80" : "text-muted")}>
          <span>
            {played} of {item.matches} played
          </span>
          <span className="tnum font-semibold">{pct}%</span>
        </div>
        <div className={cn("mt-1.5 h-1.5 overflow-hidden rounded-full", live ? "bg-white/20" : "bg-surface2")}>
          <span
            className={cn("block h-full rounded-full", live ? "bg-white" : "bg-accent")}
            style={{ width: `${Math.max(pct, played ? 4 : 0)}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

function SeriesSection({ title, items }: { title: string; items: SeriesListItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-9">
      <div className="mb-4 flex items-baseline gap-2">
        <h2 className="font-display text-[22px] font-bold tracking-[-0.01em]">{title}</h2>
        <span className="text-[14px] text-faint">{items.length}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <SeriesCard key={`${item.id}-${index}`} item={item} />
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
      <BlueHero className="px-6 py-7 sm:px-9 sm:py-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <HeroChip>
              <Trophy className="h-3.5 w-3.5" />
              Cricket calendar
            </HeroChip>
            <h1 className="mt-4 font-display text-[34px] font-bold leading-none tracking-[-0.02em] sm:text-[44px]">
              Series &amp; tours
            </h1>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/75">
              Every tour, league and tournament in the feed, with fixtures, tables and stats.
            </p>
          </div>
          <div className="flex gap-3">
            <HeroStat value={live.length} label="Live now" />
            <HeroStat value={upcoming.length} label="Upcoming" />
            <HeroStat value={completed.length} label="Finished" />
          </div>
        </div>
      </BlueHero>

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
          <SeriesSection title="Live now" items={live} />
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
