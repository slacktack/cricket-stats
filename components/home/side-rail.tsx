import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { RankingEntry } from "@/lib/types";
import type { SeriesGroup } from "@/lib/match-display";
import { PlayerAvatar } from "@/components/ui/team-badge";
import { LiveDot } from "@/components/ui/pills";
import { SectionHeading } from "@/components/ui/section-heading";

export function RankingsRail({
  entries,
  gender = "men",
}: {
  entries: RankingEntry[];
  gender?: "men" | "women";
}) {
  if (entries.length === 0) return null;
  return (
    <section>
      <SectionHeading
        eyebrow="ICC rankings"
        title={`${gender === "men" ? "Men's" : "Women's"} batting`}
        actionHref="/rankings"
        actionLabel="All"
      />
      <div>
        {entries.slice(0, 5).map((entry, index) => (
          <Link
            key={entry.id}
            href={`/players/${entry.id}`}
            className="group grid grid-cols-[18px_24px_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-line py-2.5"
          >
            <span className="mono text-[8px] text-faint tnum">
              {String(index + 1).padStart(2, "0")}
            </span>
            <PlayerAvatar
              player={{
                id: entry.id,
                name: entry.name,
                faceImageId: entry.faceImageId,
              }}
              size={24}
            />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold leading-tight transition-colors group-hover:text-accent">
                {entry.name}
              </p>
              <p className="mt-0.5 truncate text-[9px] text-faint">
                {entry.country ?? "—"}
              </p>
            </div>
            <span className="mono shrink-0 text-[11px] font-medium tnum">
              {entry.rating}
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="eyebrow">ODI · Batting</span>
        <Link
          href="/rankings"
          className="mono inline-flex items-center gap-1 text-[8px] font-medium uppercase tracking-[0.12em] text-muted transition-colors hover:text-accent"
        >
          Full table
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}

export function SeriesRail({ groups }: { groups: SeriesGroup[] }) {
  const focus = groups
    .filter(
      (group) =>
        group.seriesId &&
        (group.live > 0 ||
          group.matches.some((match) => match.state === "upcoming"))
    )
    .slice(0, 4);
  if (focus.length === 0) return null;

  return (
    <section>
      <SectionHeading
        eyebrow="On the calendar"
        title="Series in focus"
        actionHref="/series"
        actionLabel="All"
      />
      <div>
        {focus.map((group, index) => (
          <Link
            key={group.key}
            href={`/series/${group.seriesId}`}
            className="group grid grid-cols-[20px_minmax(0,1fr)_14px] items-start gap-2 border-b border-line py-3"
          >
            <span className="mono pt-0.5 text-[8px] text-faint tnum">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="line-clamp-2 text-[12px] font-medium leading-snug transition-colors group-hover:text-accent">
                {group.name}
              </p>
              <p className="mt-1 flex items-center gap-2 text-[9px] text-faint">
                <span>
                  {group.matches.length}{" "}
                  {group.matches.length === 1 ? "match" : "matches"}
                </span>
                {group.live > 0 ? (
                  <span className="inline-flex items-center gap-1 text-live">
                    <LiveDot />
                    {group.live} live
                  </span>
                ) : null}
              </p>
            </div>
            <ArrowUpRight className="mt-0.5 h-3 w-3 text-faint transition-colors group-hover:text-accent" />
          </Link>
        ))}
      </div>
    </section>
  );
}
