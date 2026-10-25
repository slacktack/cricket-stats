import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { getRankingCategory } from "@/lib/data/rankings";
import { loadPage } from "@/lib/page-data";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { FallingBall } from "@/components/falling-ball";
import { PlayerAvatar, TeamBadge } from "@/components/ui/team-badge";
import type {
  RankingCategory,
  RankingFormat,
  RankingGender,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORIES: { key: RankingCategory; label: string }[] = [
  { key: "batting", label: "Batting" },
  { key: "bowling", label: "Bowling" },
  { key: "all-rounder", label: "All-rounders" },
  { key: "teams", label: "Teams" },
];

const FORMATS: { key: RankingFormat; label: string }[] = [
  { key: "test", label: "Test" },
  { key: "odi", label: "ODI" },
  { key: "t20", label: "T20I" },
];

function asGender(value: string | undefined): RankingGender {
  return value === "women" ? "women" : "men";
}

function asCategory(value: string | undefined): RankingCategory {
  return CATEGORIES.some((item) => item.key === value)
    ? (value as RankingCategory)
    : "batting";
}

function asFormat(value: string | undefined): RankingFormat {
  return FORMATS.some((item) => item.key === value)
    ? (value as RankingFormat)
    : "odi";
}

function hrefFor(
  gender: RankingGender,
  category: RankingCategory,
  format: RankingFormat
) {
  return `/rankings?gender=${gender}&category=${category}&format=${format}`;
}

function Trend({ direction, value }: { direction?: "up" | "down" | "flat"; value?: number }) {
  if (direction === "up") {
    return (
      <span className="inline-flex items-center gap-0.5 text-win">
        <ArrowUp className="h-3 w-3" />
        {value ? Math.abs(value) : ""}
      </span>
    );
  }
  if (direction === "down") {
    return (
      <span className="inline-flex items-center gap-0.5 text-live">
        <ArrowDown className="h-3 w-3" />
        {value ? Math.abs(value) : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-faint">
      <Minus className="h-3 w-3" />
    </span>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ gender?: string; category?: string; format?: string }>;
}): Promise<Metadata> {
  const query = await searchParams;
  const gender = asGender(query.gender);
  const category = asCategory(query.category);
  const format = asFormat(query.format);
  const categoryLabel = CATEGORIES.find((item) => item.key === category)?.label ?? "Batting";
  const formatLabel = FORMATS.find((item) => item.key === format)?.label ?? "ODI";
  return {
    title: `${gender === "men" ? "Men's" : "Women's"} ${formatLabel} ${categoryLabel} Rankings`,
    description: `ICC ${gender === "men" ? "men's" : "women's"} ${formatLabel} ${categoryLabel.toLowerCase()} rankings.`,
  };
}

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ gender?: string; category?: string; format?: string }>;
}) {
  const query = await searchParams;
  const gender = asGender(query.gender);
  const category = asCategory(query.category);
  const format = asFormat(query.format);
  const data = await loadPage(getRankingCategory(gender, category));
  const entries = data[format];
  const isTeams = category === "teams";
  const categoryLabel = CATEGORIES.find((item) => item.key === category)?.label ?? "Batting";
  const formatLabel = FORMATS.find((item) => item.key === format)?.label ?? "ODI";

  return (
    <div className="container-page py-5 sm:py-6">
      <section className="grain relative overflow-hidden rounded-xl border border-panel-ink/20 bg-panel text-panel-ink">
        <FallingBall className="absolute -left-20 -top-28 z-0 hidden h-[500px] w-[500px] text-panel-ink opacity-15 md:block" />
        <div className="relative z-10 grid lg:grid-cols-[minmax(0,1fr)_248px]">
          <div className="px-5 py-5 sm:px-8 sm:py-7">
            <div className="flex items-center gap-2">
              <span className="h-px w-5 bg-panel-ink/50" />
              <span className="eyebrow text-panel-ink/70">ICC rankings</span>
            </div>
            <h1 className="display mt-3 max-w-[760px] text-[clamp(2rem,5.6vw,4.5rem)] leading-[0.95] tracking-[-0.04em]">
              {gender === "men" ? "Men's" : "Women's"}{" "}
              <span className="text-panel-muted">
                {formatLabel} {categoryLabel.toLowerCase()}.
              </span>
            </h1>
            <p className="mt-3 hidden max-w-xl text-sm font-medium leading-relaxed text-panel-ink/75 sm:block">
              The official ICC player and team rankings, updated from the live
              rankings feed.
            </p>
          </div>
          <div className="flex items-end justify-between border-t border-panel-ink/20 bg-bg px-5 py-5 text-ink lg:flex-col lg:items-start lg:justify-center lg:border-l lg:border-t-0 lg:px-6">
            <div>
              <p className="mono text-[40px] font-bold leading-none tracking-[-0.04em]">
                {entries.length}
              </p>
              <p className="mt-2 text-xs font-semibold text-faint">
                Ranked {isTeams ? "teams" : "players"}
              </p>
            </div>
            <p className="mb-1 text-xs text-faint lg:mt-5">
              Updated weekly
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4 space-y-2.5 border-y border-line-strong bg-surface px-3 py-3">
        <div
          className="no-scrollbar -mx-3 flex items-center gap-1.5 overflow-x-auto px-3"
          role="tablist"
          aria-label="Ranking category"
        >
          {CATEGORIES.map((item) => (
            <Link
              key={item.key}
              href={hrefFor(gender, item.key, format)}
              role="tab"
              aria-selected={category === item.key}
              aria-current={category === item.key ? "page" : undefined}
              data-active={category === item.key}
              className="chip-filter"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-2.5">
          <div className="segmented" role="group" aria-label="Gender">
            {(["men", "women"] as const).map((value) => (
              <Link
                key={value}
                href={hrefFor(value, category, format)}
                data-active={gender === value}
                aria-current={gender === value ? "page" : undefined}
                className="segmented-item px-4"
              >
                {value === "men" ? "Men" : "Women"}
              </Link>
            ))}
          </div>
          <div className="segmented ml-auto" role="group" aria-label="Format">
            {FORMATS.map((item) => (
              <Link
                key={item.key}
                href={hrefFor(gender, category, item.key)}
                aria-current={format === item.key ? "page" : undefined}
                data-active={format === item.key}
                className="segmented-item px-3.5"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {entries.length === 0 ? (
        <EmptyState
          title="No rankings in this category"
          description="Try another format or category. Women's team rankings may not be published for every format."
          actionHref={hrefFor(gender, "batting", "odi")}
          actionLabel="View batting rankings"
          className="mt-4"
        />
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-line-strong bg-surface">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-panel-ink/25 bg-panel px-4 py-3.5 text-panel-ink">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-panel-muted">
                Official table
              </p>
              <h2 className="display mt-1 text-[24px] font-bold leading-none tracking-[-0.025em]">
                {formatLabel} · {categoryLabel}
              </h2>
            </div>
            <span className="mono text-[11px] uppercase tracking-[0.04em] text-panel-muted">
              {entries.length} entries
            </span>
          </div>
          <div className="divide-y divide-line/70 md:hidden">
            {entries.map((entry, index) => (
              <Link
                key={`${entry.id}-${index}`}
                href={isTeams ? `/teams/${entry.id}` : `/players/${entry.id}`}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 transition-colors active:bg-accent/[0.04]",
                  entry.rank <= 3 && "bg-gold/[0.06]"
                )}
              >
                <span className="w-6 shrink-0 text-right">
                  {entry.rank <= 3 ? (
                    <span className="rank-medal ml-auto" data-rank={entry.rank}>
                      {entry.rank}
                    </span>
                  ) : (
                    <span className="mono text-xs font-semibold text-muted">{entry.rank}</span>
                  )}
                </span>
                {isTeams ? (
                  <TeamBadge
                    team={{ name: entry.name, shortName: entry.name, imageId: entry.imageId }}
                    size={38}
                  />
                ) : (
                  <PlayerAvatar
                    player={{ id: entry.id, name: entry.name, faceImageId: entry.faceImageId }}
                    size={44}
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{entry.name}</span>
                  <span className="mt-1 block text-xs text-faint">
                    {isTeams ? "Team" : entry.country ?? "—"} · {entry.matches ?? 0} M
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="mono block text-[19px] font-bold leading-none tracking-[-0.03em]">
                    {entry.rating}
                  </span>
                  <span className="mt-1 block text-[11px] text-faint">
                    Rating
                  </span>
                </span>
                <span className="w-8 shrink-0 text-right text-xs font-semibold">
                  <Trend direction={entry.trend} value={entry.trendValue} />
                </span>
              </Link>
            ))}
          </div>
          <div className="table-scroll hidden md:block">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="border-b border-line-strong bg-surface2/60 text-[10px] font-bold uppercase tracking-[0.1em] text-faint">
                <tr>
                  <th className="px-4 py-2.5 text-right font-semibold">Rank</th>
                  <th className="px-3 py-2.5 font-semibold">{isTeams ? "Team" : "Player"}</th>
                  {!isTeams ? <th className="px-2 py-2.5 font-semibold">Country</th> : null}
                  <th className="px-2 py-2.5 text-right font-semibold">Matches</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Rating</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Points</th>
                  <th className="px-4 py-2.5 text-center font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr
                    key={`${entry.id}-${index}`}
                    className={cn(
                      "group border-b border-line/70 transition-colors last:border-0 hover:bg-accent/[0.035]",
                      entry.rank <= 3 && "bg-gold/[0.06]"
                    )}
                  >
                    <td className="px-4 py-3 text-right font-bold tabular-nums">
                      {entry.rank <= 3 ? (
                        <span className="rank-medal ml-auto" data-rank={entry.rank}>
                          {entry.rank}
                        </span>
                      ) : (
                        <span className="mono text-xs font-semibold text-muted">{entry.rank}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={isTeams ? `/teams/${entry.id}` : `/players/${entry.id}`}
                        className="flex items-center gap-2.5 font-semibold transition-colors hover:text-accent"
                      >
                        {isTeams ? (
                          <TeamBadge
                            team={{ name: entry.name, shortName: entry.name, imageId: entry.imageId }}
                            size={32}
                          />
                        ) : (
                          <PlayerAvatar
                            player={{ id: entry.id, name: entry.name, faceImageId: entry.faceImageId }}
                            size={54}
                          />
                        )}
                        <span className="truncate transition-colors group-hover:text-accent">
                          {entry.name}
                        </span>
                      </Link>
                    </td>
                    {!isTeams ? <td className="px-2 py-3 text-muted">{entry.country ?? "—"}</td> : null}
                    <td className="mono px-2 py-3 text-right text-muted">{entry.matches ?? "—"}</td>
                    <td className="mono px-2 py-3 text-right font-medium">{entry.rating}</td>
                    <td className="mono px-2 py-3 text-right text-muted">{entry.points ?? "—"}</td>
                    <td className="px-4 py-3 text-center text-[11px]">
                      <Trend direction={entry.trend} value={entry.trendValue} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-5 text-xs font-semibold text-muted">
        <Link href="/series" className="transition-colors hover:text-accent">
          Browse series
        </Link>
        <Link href="/search" className="transition-colors hover:text-accent">
          Find a player
        </Link>
      </div>
    </div>
  );

}
