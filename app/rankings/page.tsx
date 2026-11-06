import type { Metadata } from "next";
import Link from "next/link";
import { BlueHero, HeroChip } from "@/components/ui/blue-hero";
import { ArrowDown, ArrowUp, ArrowUpRight, Minus } from "lucide-react";
import { getRankingCategory } from "@/lib/data/rankings";
import { loadPage } from "@/lib/page-data";
import { cn } from "@/lib/utils";
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

function Trend({
  direction,
  value,
}: {
  direction?: "up" | "down" | "flat";
  value?: number;
}) {
  if (direction === "up") {
    return (
      <span className="dnum inline-flex items-center gap-0.5 !text-[11px] text-accent">
        <ArrowUp className="h-3 w-3" />
        {value ? Math.abs(value) : ""}
      </span>
    );
  }
  if (direction === "down") {
    return (
      <span className="dnum inline-flex items-center gap-0.5 !text-[11px] text-wkt">
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
  const categoryLabel =
    CATEGORIES.find((item) => item.key === category)?.label ?? "Batting";
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
  const categoryLabel =
    CATEGORIES.find((item) => item.key === category)?.label ?? "Batting";
  const formatLabel = FORMATS.find((item) => item.key === format)?.label ?? "ODI";
  const top = entries[0];

  return (
    <div className="container-page py-5 sm:py-6">
      <BlueHero tone="accent" className="px-[var(--pad)] py-9 sm:py-11">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <HeroChip>ICC rankings · updated weekly</HeroChip>
            <h1 className="display mt-4 text-[clamp(30px,4.4vw,62px)] uppercase leading-[0.92]">
              {gender === "men" ? "Men's" : "Women's"} {formatLabel}{" "}
              {categoryLabel.toLowerCase()}
            </h1>
            <p className="mt-4 max-w-[42ch] text-[13px] leading-relaxed text-white/75">
              The official ICC player and team rankings, ordered by rating
              points, with the movement since the last weekly update.
            </p>
          </div>

          {top ? (
            <Link
              href={isTeams ? `/teams/${top.id}` : `/players/${top.id}`}
              className="group flex shrink-0 items-center gap-4 bg-white px-4 py-3.5 text-[rgb(var(--slab))]"
            >
              {isTeams ? (
                <TeamBadge
                  team={{
                    name: top.name,
                    shortName: top.name,
                    imageId: top.imageId,
                  }}
                  size={44}
                />
              ) : (
                <PlayerAvatar
                  player={{
                    id: top.id,
                    name: top.name,
                    faceImageId: top.faceImageId,
                  }}
                  size={56}
                />
              )}
              <span className="min-w-0">
                <span className="block text-[9.5px] font-extrabold uppercase leading-none tracking-[0.16em] opacity-72">
                  World No. 1
                </span>
                <span className="mt-1.5 block max-w-[22ch] truncate text-[17px] font-extrabold uppercase leading-tight tracking-[-0.02em]">
                  {top.name}
                </span>
                <span className="mt-1 block text-[11.5px] font-semibold opacity-70">
                  {top.country ? `${top.country} · ` : ""}
                  <b className="tnum text-[13px]">{top.rating}</b> rating
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 opacity-40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          ) : null}
        </div>
      </BlueHero>

      <section className="blk mt-5">
        <div className="band">
          <h3>Table</h3>
          <span className="dcell shrink-0">
            {gender === "men" ? "Men" : "Women"} · {formatLabel}
          </span>
        </div>
        <div className="px-4 py-3.5">
          <div
            className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1"
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

          <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
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
        <section className="blk mt-4">
          <div className="band">
            <h3>
              {formatLabel} · {categoryLabel}
            </h3>
            <span className="dcell shrink-0">{entries.length} entries</span>
          </div>

          <ol className="md:hidden">
            {entries.map((entry, index) => (
              <li key={`${entry.id}-${index}`}>
                <Link
                  href={isTeams ? `/teams/${entry.id}` : `/players/${entry.id}`}
                  className="hrow !px-4 !py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 shrink-0 text-right">
                      {entry.rank <= 3 ? (
                        <span className="rank-medal ml-auto" data-rank={entry.rank}>
                          {entry.rank}
                        </span>
                      ) : (
                        <span className="dnum !text-[12px] text-muted">
                          {entry.rank}
                        </span>
                      )}
                    </span>
                    {isTeams ? (
                      <TeamBadge
                        team={{
                          name: entry.name,
                          shortName: entry.name,
                          imageId: entry.imageId,
                        }}
                        size={34}
                      />
                    ) : (
                      <PlayerAvatar
                        player={{
                          id: entry.id,
                          name: entry.name,
                          faceImageId: entry.faceImageId,
                        }}
                        size={38}
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="dname block truncate !text-[13.5px]">
                        {entry.name}
                      </span>
                      <span className="dnote">
                        {isTeams ? "Team" : entry.country ?? "—"}
                        {entry.matches ? ` · ${entry.matches} matches` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="dnum block !text-[19px]">{entry.rating}</span>
                      <span className="dcell !text-[9.5px] uppercase tracking-[0.1em]">
                        Rating
                      </span>
                    </span>
                    <span className="w-8 shrink-0 text-right">
                      <Trend direction={entry.trend} value={entry.trendValue} />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>

          <div className="table-scroll hidden md:block">
            <table className="dtable min-w-[680px]">
              <thead className="dhead">
                <tr>
                  <th className="w-[64px] text-right" data-lead>
                    Rank
                  </th>
                  <th>{isTeams ? "Team" : "Player"}</th>
                  {!isTeams ? <th className="w-[110px]">Country</th> : null}
                  <th className="w-[80px] text-right">Matches</th>
                  <th className="w-[80px] text-right">Rating</th>
                  <th className="w-[80px] text-right">Points</th>
                  <th className="w-[64px] text-right" data-trail>
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr
                    key={`${entry.id}-${index}`}
                    className={cn("drow", entry.rank === 1 && "group")}
                    data-hot={entry.rank === 1 ? "" : undefined}
                  >
                    <td data-lead className="text-right">
                      {entry.rank <= 3 ? (
                        <span className="rank-medal ml-auto" data-rank={entry.rank}>
                          {entry.rank}
                        </span>
                      ) : (
                        <span className="dnum !text-[12px] text-muted">
                          {entry.rank}
                        </span>
                      )}
                    </td>
                    <td>
                      <Link
                        href={isTeams ? `/teams/${entry.id}` : `/players/${entry.id}`}
                        className="flex items-center gap-2.5"
                      >
                        {isTeams ? (
                          <TeamBadge
                            team={{
                              name: entry.name,
                              shortName: entry.name,
                              imageId: entry.imageId,
                            }}
                            size={30}
                          />
                        ) : (
                          <PlayerAvatar
                            player={{
                              id: entry.id,
                              name: entry.name,
                              faceImageId: entry.faceImageId,
                            }}
                            size={44}
                          />
                        )}
                        <span className="dname truncate !text-[13.5px]">
                          {entry.name}
                        </span>
                      </Link>
                    </td>
                    {!isTeams ? (
                      <td className="dcell">{entry.country ?? "—"}</td>
                    ) : null}
                    <td className="dnum text-right !text-[13px] text-muted">
                      {entry.matches ?? "—"}
                    </td>
                    <td className="dnum text-right !text-[15px]">{entry.rating}</td>
                    <td className="dnum text-right !text-[13px] text-muted">
                      {entry.points ?? "—"}
                    </td>
                    <td data-trail className="text-right">
                      <Trend direction={entry.trend} value={entry.trendValue} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="mt-6 flex flex-wrap items-baseline gap-5 border-t border-line pt-3 text-[11px] font-bold uppercase tracking-[0.08em]">
        <Link href="/series" className="underlink text-accent">
          Browse series
        </Link>
        <Link href="/search" className="underlink text-accent">
          Find a player
        </Link>
      </div>
    </div>
  );
}
