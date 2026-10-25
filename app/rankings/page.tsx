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

      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">Category</span>
          {(["men", "women"] as const).map((value) => (
            <Link
              key={value}
              href={hrefFor(value, category, format)}
              className={cn(
                "inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold transition-colors",
                gender === value ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-muted hover:text-ink"
              )}
            >
              {value === "men" ? "Men" : "Women"}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((item) => (
            <Link
              key={item.key}
              href={hrefFor(gender, item.key, format)}
              className={cn(
                "inline-flex h-9 items-center rounded-lg px-3 text-xs font-semibold transition-colors",
                category === item.key ? "bg-ink text-bg" : "bg-surface2 text-muted hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-line pb-3">
          {FORMATS.map((item) => (
            <Link
              key={item.key}
              href={hrefFor(gender, category, item.key)}
              className={cn(
                "inline-flex h-8 items-center rounded-md px-3 text-xs font-semibold transition-colors",
                format === item.key ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface2 hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

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
                  <tr key={entry.id} className="border-b border-line/70 last:border-0">
                    <td className="px-4 py-3 text-right font-bold tabular-nums">
                      <span className={cn(entry.rank <= 3 && "text-accent")}>{entry.rank}</span>
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={isTeams ? `/teams/${entry.id}` : `/players/${entry.id}`}
                        className="flex items-center gap-2.5 font-semibold transition-colors hover:text-accent"
                      >
                        {isTeams ? (
                          <TeamBadge
                            team={{ name: entry.name, shortName: entry.name, imageId: entry.imageId }}
                            size={28}
                          />
                        ) : (
                          <PlayerAvatar
                            player={{ id: entry.id, name: entry.name, faceImageId: entry.faceImageId }}
                            size={30}
                          />
                        )}
                        <span className="truncate">{entry.name}</span>
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
