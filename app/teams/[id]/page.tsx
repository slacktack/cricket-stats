import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeamOverview } from "@/lib/data/team";
import { loadPage } from "@/lib/page-data";
import { groupMatchesBySeries } from "@/lib/match-display";
import { timeAgo } from "@/lib/utils";
import { Breadcrumbs, PageHeader } from "@/components/page-header";
import { FollowTeamButton } from "@/components/follow-buttons";
import { ShareButton } from "@/components/share-button";
import { MatchCard } from "@/components/match-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LiveDot } from "@/components/ui/pills";
import { TeamBadge } from "@/components/ui/team-badge";

export const dynamic = "force-dynamic";

type TeamPageProps = {
  params: Promise<{ id: string }>;
};

function parseId(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { id } = await params;
  const teamId = parseId(id);
  if (!teamId) return { title: "Team" };
  try {
    const data = await getTeamOverview(teamId);
    return {
      title: data.team.name,
      description: `${data.team.name} — live matches, results and series.`,
    };
  } catch {
    return { title: "Team" };
  }
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id } = await params;
  const teamId = parseId(id);
  if (!teamId) notFound();
  const data = await loadPage(getTeamOverview(teamId));
  const groups = groupMatchesBySeries(data.matches);
  const live = data.matches.filter((match) => match.state === "live").length;
  const upcoming = data.matches.filter((match) => match.state === "upcoming").length;
  const completed = data.matches.filter((match) => match.state === "completed").length;

  return (
    <div className="container-page py-4 sm:py-6">
      <Breadcrumbs items={[{ label: "Matches", href: "/" }, { label: "Teams" }, { label: data.team.shortName }]} />
      <PageHeader
        eyebrow="Team"
        title={
          <span className="flex items-center gap-3 sm:gap-4">
            <TeamBadge team={data.team} size={44} />
            <span className="min-w-0">
              <span className="block text-[0.8em] leading-[1.02] [text-wrap:balance]">{data.team.name}</span>
              <span className="mt-1 block text-sm font-medium tracking-normal text-faint">{data.team.shortName}</span>
            </span>
          </span>
        }
        description={[
          `${data.matches.length} ${data.matches.length === 1 ? "match" : "matches"} in the feed`,
          live ? `${live} live` : "",
          upcoming ? `${upcoming} upcoming` : "",
          completed ? `${completed} completed` : "",
        ]
          .filter(Boolean)
          .join(" · ")}
        meta={<span>Feed updated {timeAgo(data.updatedAt)}</span>}
        actions={
          <>
            <FollowTeamButton team={data.team} />
            <ShareButton title={`${data.team.name} · Chauka`} text={`${data.team.name} matches and series`} />
          </>
        }
      >
        {data.series.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {data.series.map((series) => (
              <Link
                key={series.id}
                href={`/series/${series.id}`}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/40 hover:text-ink"
              >
                {series.live > 0 ? <LiveDot /> : null}
                <span className="max-w-[260px] truncate">{series.name}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </PageHeader>

      {groups.length === 0 ? (
        <EmptyState
          title="No matches on the radar"
          description={`${data.team.name} has no live, upcoming or recent match in the feed right now. Check back when their next series is announced.`}
          actionHref="/"
          actionLabel="Back to matches"
          className="mt-4"
        />
      ) : (
        <div className="mt-4 space-y-7">
          {groups.map((group) => (
            <section key={group.key}>
              <div className="flex items-baseline gap-2 border-b border-line-strong pb-2">
                {group.seriesId ? (
                  <Link href={`/series/${group.seriesId}`} className="min-w-0 text-[15px] font-bold leading-snug transition-colors hover:text-accent">
                    {group.name}
                  </Link>
                ) : (
                  <h2 className="text-[15px] font-bold leading-snug">{group.name}</h2>
                )}
                {group.live > 0 ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-live">
                    <LiveDot /> {group.live} live
                  </span>
                ) : null}
                <span className="ml-auto shrink-0 text-xs text-faint">
                  {group.matches.length} {group.matches.length === 1 ? "match" : "matches"}
                </span>
              </div>
              <div>
                {group.matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
