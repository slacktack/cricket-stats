import type { Metadata } from "next";
import { getHomeFeed } from "@/lib/data/home";
import { HomeFeed } from "@/components/home/home-feed";

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

  const feed = await getHomeFeed();

  return (
    <div className="container-page">
      <HomeFeed key={teamId ?? "all"} initialFeed={feed} initialTeamId={teamId} />
    </div>
  );
}
