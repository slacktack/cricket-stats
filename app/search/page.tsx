import type { Metadata } from "next";
import { getSearchIndex } from "@/lib/data/search";
import { loadPage } from "@/lib/page-data";
import { PageHeader } from "@/components/page-header";
import { SearchExperience } from "@/components/search/search-experience";

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
    <div className="container-page py-5">
      <PageHeader
        eyebrow="Find anything"
        title="Search"
        description="Players, teams, matches and series — all in one place."
      />
      <SearchExperience index={index} initialQuery={raw ?? ""} />
    </div>
  );
}
