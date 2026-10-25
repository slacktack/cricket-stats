import { extractFlight, findAllJSON } from "@/lib/cricbuzz/flight";
import { cachedValue, fetchCricbuzz } from "@/lib/cricbuzz/http";
import { normalizeMatchSummary } from "@/lib/cricbuzz/normalize";
import type { MatchSummary } from "@/lib/types";

type Raw = Record<string, any>;

async function loadScheduleMatches(): Promise<MatchSummary[]> {
  const html = await fetchCricbuzz(
    "/cricket-schedule/upcoming-series/international",
    { ttlMs: 5 * 60_000, staleMs: 30 * 60_000 }
  );
  const flight = extractFlight(html);
  const blocks = findAllJSON<Raw[]>(flight, "matchScheduleList");
  const matches = new Map<number, MatchSummary>();

  for (const block of blocks) {
    if (!Array.isArray(block)) continue;
    for (const series of block) {
      const entries = Array.isArray(series?.matchInfo) ? series.matchInfo : [];
      for (const info of entries) {
        if (!info || typeof info !== "object") continue;
        const summary = normalizeMatchSummary(
          {
            ...info,
            seriesName: info.seriesName ?? series?.seriesName,
            seriesId: info.seriesId ?? series?.seriesId,
          },
          undefined,
          info?.matchType ?? series?.seriesCategory
        );
        if (summary && !matches.has(summary.id)) {
          matches.set(summary.id, summary);
        }
      }
    }
  }

  return Array.from(matches.values()).sort((a, b) => a.startTime - b.startTime);
}

export function getScheduleMatches(): Promise<MatchSummary[]> {
  return cachedValue(
    "schedule-matches",
    5 * 60_000,
    30 * 60_000,
    loadScheduleMatches
  );
}
