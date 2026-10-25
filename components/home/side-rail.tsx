import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
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
    <section className="card-vivid overflow-hidden rounded-2xl border border-line p-3.5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-faint">
            ICC rankings
          </p>
          <h2 className="mt-1 text-[18px] font-extrabold leading-tight tracking-[-0.025em]">
            {gender === "men" ? "Men's" : "Women's"} batting
          </h2>
        </div>
        <Link
          href="/rankings"
          aria-label="All rankings"
          className="grid h-8 w-8 place-items-center rounded-full bg-surface2 text-faint transition-all duration-200 hover:bg-accent hover:text-accent-ink"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-3 space-y-1">
        {entries.slice(0, 5).map((entry, index) => (
          <Link
            key={entry.id}
            href={`/players/${entry.id}`}
            className="group flex items-center gap-2.5 rounded-xl px-1.5 py-2 transition-colors hover:bg-surface2/80"
          >
            <span
              className="rank-medal shrink-0"
              data-rank={index + 1}
            >
              {index + 1}
            </span>
            <PlayerAvatar
              player={{
                id: entry.id,
                name: entry.name,
                faceImageId: entry.faceImageId,
              }}
              size={38}
              className="ring-2 ring-surface"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-extrabold leading-tight transition-colors group-hover:text-accent">
                {entry.name}
              </p>
              <p className="mt-0.5 truncate text-[9px] font-medium text-faint">
                {entry.country ?? "—"}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-accent/10 px-1.5 py-1 text-[10px] font-extrabold tabular-nums text-accent">
              {entry.rating}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-line pt-2.5">
        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-faint">
          ODI · Batting
        </span>
        <Link
          href="/rankings"
          className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-muted transition-colors hover:text-accent"
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
    <section className="card-vivid overflow-hidden rounded-2xl border border-line p-3.5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-faint">
            On the calendar
          </p>
          <h2 className="mt-1 text-[18px] font-extrabold leading-tight tracking-[-0.025em]">
            Series in focus
          </h2>
        </div>
        <Link
          href="/series"
          aria-label="All series"
          className="grid h-8 w-8 place-items-center rounded-full bg-surface2 text-faint transition-colors duration-150 hover:bg-accent hover:text-accent-ink"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-3 space-y-1">
        {focus.map((group, index) => (
          <Link
            key={group.key}
            href={`/series/${group.seriesId}`}
            className="group flex items-start gap-2.5 rounded-xl px-1.5 py-2.5 transition-colors hover:bg-surface2/80"
          >
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
              <Trophy className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[12px] font-bold leading-snug transition-colors group-hover:text-accent">
                {group.name}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.06em] text-faint">
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
            <span className="mt-0.5 text-[9px] font-extrabold tabular-nums text-faint/60">
              {String(index + 1).padStart(2, "0")}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
