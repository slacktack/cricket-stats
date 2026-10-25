import { extractFlight, findLastJSON } from "@/lib/cricbuzz/flight";
import { cachedValue, CricbuzzError, fetchCricbuzz } from "@/lib/cricbuzz/http";
import type {
  RankingCategory,
  RankingEntry,
  RankingFormat,
  RankingGender,
  RankingsData,
} from "@/lib/types";
import { asNumber, asOptionalNumber, asString } from "@/lib/utils";

type Raw = Record<string, any>;

const CATEGORY_SLUG: Record<RankingCategory, string> = {
  batting: "batting",
  bowling: "bowling",
  "all-rounder": "all-rounder",
  teams: "teams",
};

const FORMATS: RankingFormat[] = ["test", "odi", "t20"];

function normalizeTrend(raw: Raw): Pick<RankingEntry, "trend" | "trendValue"> {
  const text = asString(raw?.trend).toLowerCase();
  const diff = asOptionalNumber(raw?.trendValue ?? raw?.diff);
  const parsedDiff = Number.parseInt(text.replace(/\D/g, ""), 10);
  const trendValue = diff ?? (Number.isFinite(parsedDiff) ? parsedDiff : undefined);
  if (text.includes("up")) return { trend: "up", trendValue };
  if (text.includes("down")) return { trend: "down", trendValue };
  return {
    trend: diff !== undefined && diff > 0 ? "up" : diff !== undefined && diff < 0 ? "down" : "flat",
    trendValue,
  };
}

function normalizeRankingEntry(raw: Raw): RankingEntry | null {
  const id = asNumber(raw?.id);
  const name = asString(raw?.name);
  if (!id || !name) return null;
  return {
    id,
    rank: asNumber(raw?.rank),
    name,
    country: asString(raw?.country) || undefined,
    matches: asOptionalNumber(raw?.matches),
    rating: asNumber(raw?.rating),
    points: asOptionalNumber(raw?.points),
    ...normalizeTrend(raw),
    faceImageId: asOptionalNumber(raw?.faceImageId),
    imageId: asOptionalNumber(raw?.imageId),
  };
}

function parseCategoryPage(
  html: string
): Record<RankingFormat, RankingEntry[]> {
  const flight = extractFlight(html);
  const raw = findLastJSON<Raw>(flight, "formatTypesData");
  const result: Record<RankingFormat, RankingEntry[]> = {
    test: [],
    odi: [],
    t20: [],
  };
  if (!raw) return result;
  for (const format of FORMATS) {
    const entries = Array.isArray(raw[format]?.rank) ? raw[format].rank : [];
    result[format] = entries
      .map((entry: Raw) => normalizeRankingEntry(entry))
      .filter((entry: RankingEntry | null): entry is RankingEntry => Boolean(entry))
      .sort((a: RankingEntry, b: RankingEntry) => a.rank - b.rank);
  }
  return result;
}

async function loadRankingCategory(
  gender: RankingGender,
  category: RankingCategory
): Promise<Record<RankingFormat, RankingEntry[]>> {
  const html = await fetchCricbuzz(
    `/cricket-stats/icc-rankings/${gender}/${CATEGORY_SLUG[category]}`,
    { ttlMs: 6 * 60 * 60_000, staleMs: 24 * 60 * 60_000 }
  );
  const parsed = parseCategoryPage(html);
  if (
    parsed.test.length === 0 &&
    parsed.odi.length === 0 &&
    parsed.t20.length === 0
  ) {
    throw new CricbuzzError(
      "Unable to read ICC rankings",
      502,
      "PARSE_ERROR"
    );
  }
  return parsed;
}

export function getRankingCategory(
  gender: RankingGender,
  category: RankingCategory
): Promise<Record<RankingFormat, RankingEntry[]>> {
  return cachedValue(
    `rankings:${gender}:${category}`,
    6 * 60 * 60_000,
    24 * 60 * 60_000,
    () => loadRankingCategory(gender, category)
  );
}

export async function getRankings(
  gender: RankingGender = "men"
): Promise<RankingsData> {
  if (gender !== "men" && gender !== "women") {
    throw new CricbuzzError("Invalid rankings category", 400, "BAD_REQUEST");
  }
  const categories: RankingCategory[] = [
    "batting",
    "bowling",
    "all-rounder",
    "teams",
  ];
  const settled = await Promise.allSettled(
    categories.map((category) => getRankingCategory(gender, category))
  );
  const data = {} as RankingsData["categories"];
  let total = 0;
  categories.forEach((category, index) => {
    const result = settled[index];
    const value =
      result.status === "fulfilled"
        ? result.value
        : ({ test: [], odi: [], t20: [] } as Record<RankingFormat, RankingEntry[]>);
    data[category] = value;
    total += value.test.length + value.odi.length + value.t20.length;
  });
  if (total === 0) {
    throw new CricbuzzError("ICC rankings are unavailable", 502, "EMPTY_RANKINGS");
  }
  return { gender, categories: data, updatedAt: Date.now() };
}
