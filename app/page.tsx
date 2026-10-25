import type { Metadata } from "next";
import { getHomeFeed } from "@/lib/data/home";
import { getRankingCategory } from "@/lib/data/rankings";
import { groupMatchesBySeries } from "@/lib/match-display";
import { HomeFeed } from "@/components/home/home-feed";
import { RankingsRail, SeriesRail } from "@/components/home/side-rail";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live Cricket Scores",
  description:
    "Live cricket scores from around the world, with ball-by-ball commentary, scorecards and series context.",
};

type HomePageProps = {
  searchParams: Promise<{ team?: string | string[] }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const rawTeam = Array.isArray(params.team) ? params.team[0] : params.team;
  const parsedTeam = Number(rawTeam);
  const teamId =
    Number.isInteger(parsedTeam) && parsedTeam > 0 ? parsedTeam : undefined;

  const [feed, batting] = await Promise.all([
    getHomeFeed(),
    getRankingCategory("men", "batting").catch(() => null),
  ]);

  const rankings =
    batting?.odi.length
      ? batting.odi
      : batting?.t20.length
        ? batting.t20
        : batting?.test ?? [];
  const groups = groupMatchesBySeries(feed.matches);

  return (
    <div className="container-page">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_292px]">
        <div className="min-w-0 lg:pr-8 xl:pr-10">
          <HomeFeed
            key={teamId ?? "all"}
            initialFeed={feed}
            initialTeamId={teamId}
          />
        </div>
        <aside className="hidden border-l border-line pl-7 lg:block">
          <div className="sticky top-[84px] space-y-4 pb-8 pt-7">
            <RankingsRail entries={rankings} />
            <SeriesRail groups={groups} />
          </div>
        </aside>
      </div>
    </div>
  );
}
