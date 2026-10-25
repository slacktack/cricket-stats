import { extractFlight, findLastJSON } from "@/lib/cricbuzz/flight";
import { cachedValue, CricbuzzError, fetchCricbuzz } from "@/lib/cricbuzz/http";
import { normalizeMatchSummary } from "@/lib/cricbuzz/normalize";
import type { HomeFeed, MatchSummary } from "@/lib/types";
import { parseTimestamp } from "@/lib/utils";

type Raw = Record<string, any>;

function extractMatches(raw: Raw): MatchSummary[] {
  const typeMatches = Array.isArray(raw?.typeMatches) ? raw.typeMatches : [];
  const matches = new Map<number, MatchSummary>();

  for (const typeMatch of typeMatches) {
    const seriesMatches = Array.isArray(typeMatch?.seriesMatches)
      ? typeMatch.seriesMatches
      : [];
    for (const seriesMatch of seriesMatches) {
      const wrapper = seriesMatch?.seriesAdWrapper;
      const entries = Array.isArray(wrapper?.matches) ? wrapper.matches : [];
      for (const entry of entries) {
        const info = entry?.matchInfo ?? entry?.match?.matchInfo;
        const score = entry?.matchScore ?? entry?.match?.matchScore;
        if (!info) continue;
        try {
          const summary = normalizeMatchSummary(info, score, typeMatch?.matchType);
          if (!summary) continue;
          const existing = matches.get(summary.id);
          if (!existing || summary.innings.length >= existing.innings.length) {
            matches.set(summary.id, summary);
          }
        } catch {
          // Skip malformed matches rather than failing the whole feed.
        }
      }
    }
  }

  return Array.from(matches.values()).sort((a, b) => {
    const order = { live: 0, upcoming: 1, completed: 2 } as const;
    const stateDiff = order[a.state] - order[b.state];
    if (stateDiff !== 0) return stateDiff;
    if (a.state === "upcoming") return a.startTime - b.startTime;
    return b.startTime - a.startTime;
  });
}

async function loadHomeFeed(): Promise<HomeFeed> {
  const html = await fetchCricbuzz("/", { ttlMs: 12_000, staleMs: 5 * 60_000 });
  const flight = extractFlight(html);
  const raw = findLastJSON<Raw>(flight, "currentMatchesList");
  if (!raw) {
    throw new CricbuzzError(
      "Unable to read the live match feed",
      502,
      "PARSE_ERROR"
    );
  }
  const matches = extractMatches(raw);
  if (matches.length === 0) {
    throw new CricbuzzError("No matches found in the upstream feed", 502, "EMPTY_FEED");
  }
  return {
    matches,
    updatedAt: parseTimestamp(raw.responseLastUpdated) || Date.now(),
  };
}

export function getHomeFeed(): Promise<HomeFeed> {
  return cachedValue("home-feed", 15_000, 5 * 60_000, loadHomeFeed);
}

export async function findMatchSummary(
  matchId: number
): Promise<MatchSummary | undefined> {
  try {
    const feed = await getHomeFeed();
    return feed.matches.find((match) => match.id === matchId);
  } catch {
    return undefined;
  }
}
