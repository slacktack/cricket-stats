import type { Metadata } from "next";
import { getSearchIndex } from "@/lib/data/search";
import { loadPage } from "@/lib/page-data";
import { SearchExperience } from "@/components/search/search-experience";
import { FallingBall } from "@/components/falling-ball";

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
      <header className="grain relative overflow-hidden rounded-xl border border-panel-ink/20 bg-panel px-5 py-5 text-panel-ink sm:px-8 sm:py-7">
        <FallingBall className="absolute -right-20 -top-28 h-[420px] w-[420px] text-panel-ink opacity-15" />
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="h-px w-5 bg-panel-ink/50" />
            <span className="eyebrow text-panel-ink/70">Find anything</span>
          </div>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="display text-[clamp(2.1rem,6vw,4.8rem)] leading-[0.92] tracking-[-0.04em]">
                Search<span className="text-panel-muted">.</span>
              </h1>
              <p className="mt-2.5 hidden max-w-lg text-sm font-medium leading-relaxed text-panel-ink/75 sm:block">
                Players, teams, matches and series, indexed from the live feed
                and the international schedule.
              </p>
            </div>
            <p className="mono pb-1 text-[11px] uppercase tracking-[0.04em] text-panel-muted">
              {index.players.length} players · {index.teams.length} teams ·{" "}
              {index.matches.length} matches
            </p>
          </div>
        </div>
      </header>
      <SearchExperience index={index} initialQuery={raw ?? ""} />
    </div>
  );
}
