import type { MetadataRoute } from "next";
import { getHomeFeed } from "@/lib/data/home";
import { getSeriesList } from "@/lib/data/series";
import { getSearchIndex } from "@/lib/data/search";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [feed, series, index] = await Promise.all([
    getHomeFeed().catch(() => null),
    getSeriesList().catch(() => null),
    getSearchIndex().catch(() => null),
  ]);
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/series`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE}/rankings`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];

  for (const match of feed?.matches ?? []) {
    entries.push({
      url: `${BASE}/match/${match.id}`,
      lastModified: new Date(match.endTime || match.startTime || Date.now()),
      changeFrequency: match.state === "live" ? "always" : "daily",
      priority: match.state === "live" ? 0.9 : 0.6,
    });
  }
  for (const item of series ?? []) {
    entries.push({
      url: `${BASE}/series/${item.id}`,
      lastModified: new Date(item.endDate || item.startDate || Date.now()),
      changeFrequency: item.state === "live" ? "hourly" : "daily",
      priority: 0.7,
    });
  }
  for (const player of index?.players ?? []) {
    entries.push({
      url: `${BASE}/players/${player.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }
  for (const team of index?.teams ?? []) {
    entries.push({
      url: `${BASE}/teams/${team.id}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.4,
    });
  }

  return entries;
}
