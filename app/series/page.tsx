import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Trophy } from "lucide-react";
import { getSeriesList } from "@/lib/data/series";
import { loadPage } from "@/lib/page-data";
import { cn, formatDateRange } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { BlueHero, HeroChip, HeroStat } from "@/components/ui/blue-hero";
import { TeamBadge } from "@/components/ui/team-badge";
import { LiveDot } from "@/components/ui/pills";
import type { SeriesListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cricket Series",
  description:
    "Live and upcoming cricket series, schedules, points tables and tournament stats.",
};

function SeriesCard({ item }: { item: SeriesListItem }) {
  const played = item.completed;
  const pct = item.matches ? Math.round((played / item.matches) * 100) : 0;
  const live = item.state === "live";

  return (
    <Link
      href={`/series/${item.id}`}
      className={cn(
        "blk group flex h-full min-w-0 flex-col",
        live && "blk-blue"
      )}
    >
        <div className="band">
          <h3>{item.format ?? "Series"}</h3>
          <span className="flex shrink-0 items-center gap-2">
            {live ? (
              <>
                <LiveDot />
                {item.live} live
              </>
            ) : (
              item.state === "upcoming" ? "Upcoming" : "Result"
            )}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col px-4 py-3.5">
          <h2 className="display line-clamp-2 text-[17px] uppercase leading-[1.06]">
            {item.name}
          </h2>

          <p className="mt-2 flex items-baseline gap-2">
            <CalendarDays
              className={cn("h-3.5 w-3.5 shrink-0 self-center", live ? "opacity-70" : "text-faint")}
            />
            <span className={cn("dcell", live && "!text-white/75")}>
              {formatDateRange(item.startDate, item.endDate)}
            </span>
            <span className="leaders" />
            <ArrowUpRight
              className="h-3.5 w-3.5 shrink-0 opacity-40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
            />
          </p>

          <div className="mt-3.5 flex items-center gap-1">
            {item.teams.slice(0, 7).map((team) => (
              <TeamBadge
                key={team.id}
                team={team}
                size={26}
                className={cn(!live && "ring-1 ring-line")}
              />
            ))}
            {item.teams.length > 7 ? (
              <span className={cn("dcell ml-1", live && "!text-white/75")}>
                +{item.teams.length - 7}
              </span>
            ) : null}
          </div>

          <div className="mt-auto pt-4">
            <div className="flex items-baseline gap-2">
              <span className={cn("dcell", live && "!text-white/75")}>
                {played} of {item.matches} played
              </span>
              <span className="leaders" />
              <span className="dnum !text-[13px]">
                {pct}
                <span className={cn("text-[10px]", live ? "opacity-70" : "text-faint")}>%</span>
              </span>
            </div>
            <div
              className={cn(
                "mt-1.5 h-1.5 w-full",
                live ? "bg-white/25" : "bg-surface2"
              )}
            >
              <span
                className={cn("block h-full", live ? "bg-white" : "bg-slab")}
                style={{ width: `${Math.max(pct, played ? 3 : 0)}%` }}
              />
            </div>
          </div>
        </div>
    </Link>
  );
}

function SeriesSection({
  number,
  title,
  lede,
  items,
}: {
  number: string;
  title: string;
  lede: string;
  items: SeriesListItem[];
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="sec-head">
        <p className="kicker">
          <b>{number}</b>
          {lede}
        </p>
        <h2 className="col-span-12 uppercase lg:col-span-8">
          {title}
          <span className="ml-3 align-middle text-[0.4em] text-faint">
            {String(items.length).padStart(2, "0")}
          </span>
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-rv="" style={{ "--gd": "90ms" } as React.CSSProperties}>
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
      <BlueHero tone="accent" className="px-[var(--pad)] py-9 sm:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <HeroChip>
              <Trophy className="h-3.5 w-3.5" />
              Cricket calendar
            </HeroChip>
            <h1 className="display mt-4 text-[clamp(30px,4.4vw,62px)] uppercase leading-[0.92]">
              Series &amp; tours
            </h1>
            <p className="mt-4 max-w-[46ch] text-[13px] leading-relaxed text-white/75">
              Every tour, league and tournament in the feed — fixtures, points
              tables and the state of play.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
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
        <div className="space-y-10">
          <SeriesSection
            number="01"
            lede="State of play"
            title="Live now"
            items={live}
          />
          <SeriesSection
            number="02"
            lede="What is next"
            title="Upcoming"
            items={upcoming}
          />
          <SeriesSection
            number="03"
            lede="Wrapped up"
            title="Recent results"
            items={completed}
          />
        </div>
      )}

      <p className="mt-10 flex items-baseline gap-2 border-t border-line pt-3 text-[11px] uppercase tracking-[0.08em] text-faint">
        <CalendarDays className="h-3.5 w-3.5 self-center" />
        Schedules are loaded from the live cricket feed and may change.
      </p>
    </div>
  );
}
