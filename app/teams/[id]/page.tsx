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
            <TeamBadge team={data.team} size={64} />
            <span className="min-w-0">
              <span className="block text-[0.8em] leading-[1.02] [text-wrap:balance]">{data.team.name}</span>
              <span className="mt-1 block text-[13px] font-bold uppercase leading-tight tracking-[0.02em] opacity-70">{data.team.shortName}</span>
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
                className="inline-flex min-h-9 items-center gap-1.5 border border-white/35 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:border-white hover:bg-white hover:text-[rgb(var(--slab))]"
              >
                {series.live > 0 ? <LiveDot /> : null}
                <span className="max-w-[240px] truncate sm:max-w-[340px]">{series.name}</span>
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
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b-2 border-slab pb-2">
                {group.seriesId ? (
                  <Link href={`/series/${group.seriesId}`} className="display min-w-0 max-w-full truncate text-[16px] font-bold uppercase leading-snug tracking-[-0.02em] transition-colors hover:text-accent sm:text-[19px]">
                    {group.name}
                  </Link>
                ) : (
                  <h2 className="display min-w-0 max-w-full truncate text-[16px] font-bold uppercase leading-snug tracking-[-0.02em] sm:text-[19px]">
                    {group.name}
                  </h2>
                )}
                {group.live > 0 ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase tracking-[0.06em] text-live">
                    <LiveDot /> {group.live} live
                  </span>
                ) : null}
                <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-faint">
                  {group.matches.length} {group.matches.length === 1 ? "match" : "matches"}
                </span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
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
