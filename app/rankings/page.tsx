import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { getRankingCategory } from "@/lib/data/rankings";
import { loadPage } from "@/lib/page-data";
import { cn, timeAgo } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/empty-state";
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
    <div className="container-page py-5">
      <PageHeader
        eyebrow="ICC rankings"
        title={`${gender === "men" ? "Men's" : "Women's"} ${formatLabel} ${categoryLabel.toLowerCase()}`}
        description="The official ICC player and team rankings, updated from the live rankings feed."
        meta={<span>Loaded {timeAgo(Date.now())} · ICC rankings update weekly</span>}
      />

      <section className="mt-4 rounded-2xl border border-line bg-surface p-2.5 sm:p-3">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="eyebrow shrink-0 pl-1">Gender</span>
            <div className="flex gap-1 rounded-2xl border border-line bg-surface2/80 p-1">
              {(["men", "women"] as const).map((value) => (
                <Link
                  key={value}
                  href={hrefFor(value, category, format)}
                  data-active={gender === value}
                  aria-current={gender === value ? "page" : undefined}
                  className="segmented-item h-9 px-4"
                >
                  {value === "men" ? "Men" : "Women"}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="eyebrow shrink-0 pl-1">Format</span>
            <div className="flex gap-1">
              {FORMATS.map((item) => (
                <Link
                  key={item.key}
                  href={hrefFor(gender, category, item.key)}
                  aria-current={format === item.key ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[11px] font-extrabold transition-all duration-200",
                    format === item.key
                      ? "border-transparent bg-ink text-bg"
                      : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2 overflow-x-auto border-t border-line pt-2.5 no-scrollbar">
          <span className="eyebrow shrink-0 pl-1">Category</span>
          {CATEGORIES.map((item) => (
            <Link
              key={item.key}
              href={hrefFor(gender, item.key, format)}
              aria-current={category === item.key ? "page" : undefined}
              data-active={category === item.key}
              className="chip-filter"
            >
              {item.label}
            </Link>
          ))}
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
        <div className="card mt-4 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface2/60 px-4 py-3">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-faint">
                Live table
              </p>
              <h2 className="mt-0.5 text-sm font-extrabold">
                {formatLabel} · {categoryLabel}
              </h2>
            </div>
            <span className="rounded-full bg-surface/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-faint">
              Updated weekly
            </span>
          </div>
          <div className="table-scroll">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="border-b border-line bg-surface2/60 text-[10px] uppercase tracking-wide text-faint">
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
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="group border-b border-line/70 transition-colors last:border-0 hover:bg-accent/[0.035]"
                  >
                    <td className="px-4 py-3 text-right font-bold tabular-nums">
                      {entry.rank <= 3 ? (
                        <span className="rank-medal ml-auto" data-rank={entry.rank}>
                          {entry.rank}
                        </span>
                      ) : (
                        <span className="text-muted">{entry.rank}</span>
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
                            size={34}
                          />
                        ) : (
                          <PlayerAvatar
                            player={{ id: entry.id, name: entry.name, faceImageId: entry.faceImageId }}
                            size={42}
                          />
                        )}
                        <span className="truncate transition-colors group-hover:text-accent">
                          {entry.name}
                        </span>
                      </Link>
                    </td>
                    {!isTeams ? <td className="px-2 py-3 text-muted">{entry.country ?? "—"}</td> : null}
                    <td className="px-2 py-3 text-right tabular-nums text-muted">{entry.matches ?? "—"}</td>
                    <td className="px-2 py-3 text-right font-semibold tabular-nums">{entry.rating}</td>
                    <td className="px-2 py-3 text-right tabular-nums text-muted">{entry.points ?? "—"}</td>
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

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
        <Link href="/series" className="font-semibold text-accent hover:underline">Browse series</Link>
        <Link href="/search" className="font-semibold text-accent hover:underline">Find a player</Link>
      </div>
    </div>
  );
}
