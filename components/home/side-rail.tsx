import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { RankingEntry } from "@/lib/types";
import type { SeriesGroup } from "@/lib/match-display";
import { PlayerAvatar } from "@/components/ui/team-badge";
import { LiveDot } from "@/components/ui/pills";

export function RankingsRail({
  entries,
  gender = "men",
}: {
  entries: RankingEntry[];
  gender?: "men" | "women";
}) {
  if (entries.length === 0) return null;
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3.5">
        <div>
          <p className="eyebrow">ICC rankings</p>
          <h2 className="display mt-1 text-[22px] leading-tight tracking-[-0.025em]">
            {gender === "men" ? "Men's" : "Women's"} batting
          </h2>
        </div>
        <Link
          href="/rankings"
          aria-label="All rankings"
          className="grid h-7 w-7 place-items-center rounded border border-line text-faint transition-colors duration-150 hover:border-accent hover:text-accent"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-line/70">
        {entries.slice(0, 5).map((entry, index) => (
          <Link
            key={`${entry.id}-${index}`}
            href={`/players/${entry.id}`}
            className="group flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-surface2/60"
          >
            <span className="rank-medal shrink-0" data-rank={index + 1}>
              {index + 1}
            </span>
            <PlayerAvatar
              player={{
                id: entry.id,
                name: entry.name,
                faceImageId: entry.faceImageId,
              }}
              size={40}
              className="border-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold leading-tight transition-colors group-hover:text-accent">
                {entry.name}
              </p>
              <p className="mt-0.5 truncate text-[11px] font-medium text-faint">
                {entry.country ?? "—"}
              </p>
            </div>
            <span className="mono shrink-0 text-[13px] font-bold text-ink">
              {entry.rating}
            </span>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-faint">
          ODI · Batting
        </span>
        <Link
          href="/rankings"
          className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-muted transition-colors hover:text-accent"
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
    <section className="grain overflow-hidden rounded-xl border border-panel-ink/20 bg-panel text-panel-ink">
      <div className="flex items-start justify-between gap-3 border-b border-panel-ink/20 px-4 py-3.5">
        <div>
          <p className="eyebrow text-panel-ink/70">On the calendar</p>
          <h2 className="display mt-1 text-[22px] leading-tight tracking-[-0.025em]">
            Series in focus
          </h2>
        </div>
        <Link
          href="/series"
          aria-label="All series"
          className="grid h-7 w-7 place-items-center rounded border border-panel-ink/30 text-panel-ink/70 transition-colors duration-150 hover:border-panel-ink hover:text-panel-ink"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-panel-ink/15">
        {focus.map((group) => (
          <Link
            key={group.key}
            href={`/series/${group.seriesId}`}
            className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-panel-ink/10"
          >
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[13px] font-bold leading-snug text-panel-ink">
                {group.name}
              </p>
              <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.04em] text-panel-muted">
                <span>
                  {group.matches.length}{" "}
                  {group.matches.length === 1 ? "match" : "matches"}
                </span>
                {group.live > 0 ? (
                  <span className="inline-flex items-center gap-1 text-panel-ink">
                    <LiveDot />
                    {group.live} live
                  </span>
                ) : null}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
