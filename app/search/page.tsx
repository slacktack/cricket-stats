import type { Metadata } from "next";
import { getSearchIndex } from "@/lib/data/search";
import { loadPage } from "@/lib/page-data";
import { SearchExperience } from "@/components/search/search-experience";
import { BlueHero, HeroChip, HeroStat } from "@/components/ui/blue-hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search cricket players, teams, matches and series.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const [index, query] = await Promise.all([loadPage(getSearchIndex()), searchParams]);
  const raw = Array.isArray(query.q) ? query.q[0] : query.q;

  return (
    <div className="container-page py-5 sm:py-6">
      <BlueHero className="px-6 py-7 sm:px-9 sm:py-9">
        <HeroChip>Find anything</HeroChip>
        <h1 className="mt-4 font-display text-[32px] font-bold leading-none tracking-[-0.02em] sm:text-[44px]">
          Search
        </h1>
        <div className="mt-5 flex flex-wrap gap-3">
          <HeroStat value={index.players.length} label="Players" />
          <HeroStat value={index.teams.length} label="Teams" />
          <HeroStat value={index.matches.length} label="Matches" />
          <HeroStat value={index.series.length} label="Series" />
        </div>
      </BlueHero>
      <SearchExperience index={index} initialQuery={raw ?? ""} />
    </div>
  );
}
