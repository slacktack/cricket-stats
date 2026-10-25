import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock3, MapPin } from "lucide-react";
import { getMatchDetail } from "@/lib/data/match";
import { loadPage } from "@/lib/page-data";
import {
  matchFormat,
  matchShortTitle,
  matchStatusText,
  teamOversText,
  teamScoreText,
} from "@/lib/match-display";
import { formatDateTime } from "@/lib/utils";
import { Breadcrumbs, PageHeader } from "@/components/page-header";
import { FollowTeamIcon } from "@/components/follow-buttons";
import { ShareButton } from "@/components/share-button";
import { FormatPill, StatePill } from "@/components/ui/pills";
import { TeamBadge } from "@/components/ui/team-badge";
import { LivePanel } from "@/components/match/live-panel";
import { ScorecardView } from "@/components/match/scorecard-view";
import { CommentaryView } from "@/components/match/commentary-view";
import { SquadsView } from "@/components/match/squads-view";
import { MatchInfo } from "@/components/match/match-info";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type MatchTab = "scorecard" | "commentary" | "squads" | "info";

const TABS: { key: MatchTab; label: string }[] = [
  { key: "scorecard", label: "Scorecard" },
  { key: "commentary", label: "Commentary" },
  { key: "squads", label: "Squads" },
  { key: "info", label: "Info" },
];

type MatchPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

function parseId(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const matchId = parseId(id);
  if (!matchId) return { title: "Match" };
  try {
    const detail = await getMatchDetail(matchId);
    const title = `${matchShortTitle(detail.summary)} — ${matchFormat(detail.summary)}`;
    return {
      title,
      description: `${detail.summary.status}. Live score, scorecard, commentary and squads for ${matchShortTitle(detail.summary)}.`,
    };
  } catch {
    return { title: "Match" };
  }
}

export default async function MatchPage({ params, searchParams }: MatchPageProps) {
  const { id } = await params;
  const matchId = parseId(id);
  if (!matchId) notFound();
  const [detail, query] = await Promise.all([
    loadPage(getMatchDetail(matchId)),
    searchParams,
  ]);
  const summary = detail.summary;
  const requested = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const fallback: MatchTab = summary.state === "upcoming" ? "info" : "scorecard";
  const tab: MatchTab = TABS.some((item) => item.key === requested)
    ? (requested as MatchTab)
    : fallback;

  return (
    <div className="container-page py-5">
      <Breadcrumbs
        items={[
          { label: "Matches", href: "/" },
          ...(detail.series.id
            ? [{ label: detail.series.name, href: `/series/${detail.series.id}` }]
            : []),
          { label: matchShortTitle(summary) },
        ]}
      />

      <PageHeader
        className="border-b-0 pb-2"
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <FormatPill format={matchFormat(summary)} />
            <StatePill state={summary.state} />
            {detail.series.id ? (
              <Link href={`/series/${detail.series.id}`} className="inline-flex items-center gap-1 text-faint transition-colors hover:text-accent">
                {detail.series.name}
                <ChevronRight className="h-3 w-3" />
              </Link>
            ) : null}
          </div>
        }
        title={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link href={`/teams/${summary.teams[0].id}`} className="transition-colors hover:text-accent">
              {summary.teams[0].name}
            </Link>
            <span className="text-base font-medium text-faint">vs</span>
            <Link href={`/teams/${summary.teams[1].id}`} className="transition-colors hover:text-accent">
              {summary.teams[1].name}
            </Link>
          </span>
        }
        description={matchStatusText(summary)}
        meta={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {formatDateTime(summary.startTime)}
            </span>
            {detail.venue ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {detail.venue.ground}
                {detail.venue.city ? `, ${detail.venue.city}` : ""}
              </span>
            ) : null}
          </div>
        }
        actions={
          <>
            <FollowTeamIcon team={summary.teams[0]} />
            <FollowTeamIcon team={summary.teams[1]} />
            <ShareButton title={`${matchShortTitle(summary)} · Chauka`} text={summary.status} />
          </>
        }
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {summary.teams.map((team) => {
            const score = teamScoreText(summary, team);
            const overs = teamOversText(summary, team);
            const isCurrent = summary.state === "live" && summary.currentBattingTeamId === team.id;
            const isWinner = summary.state === "completed" && summary.winnerTeamId === team.id;
            return (
              <div
                key={team.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-3",
                  isCurrent || isWinner ? "border-accent/35 bg-accent/[0.06]" : "border-line bg-surface"
                )}
              >
                <TeamBadge team={team} size={38} />
                <div className="min-w-0 flex-1">
                  <Link href={`/teams/${team.id}`} className="block truncate text-sm font-bold transition-colors hover:text-accent">
                    {team.shortName}
                  </Link>
                  <p className="truncate text-[11px] text-faint">{team.name}</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-lg font-bold tabular-nums", isCurrent || isWinner ? "text-accent" : "text-ink")}>
                    {score}
                  </p>
                  <p className="text-[10px] text-faint">
                    {overs ?? (summary.state === "upcoming" ? "Yet to start" : "")}
                    {isWinner ? " · Won" : isCurrent ? " · Batting" : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </PageHeader>

      <LivePanel detail={detail} />

      <div className="table-scroll sticky top-16 z-20 -mx-4 mt-4 border-y border-line bg-bg/95 px-4 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        <div className="flex min-w-max items-center gap-1 py-1.5" role="tablist" aria-label="Match sections">
          {TABS.map((item) => {
            const active = tab === item.key;
            return (
              <Link
                key={item.key}
                href={`/match/${matchId}?tab=${item.key}`}
                role="tab"
                aria-selected={active}
                className={cn(
                  "flex h-9 items-center rounded-md px-3 text-xs font-semibold transition-colors",
                  active ? "bg-accent text-accent-ink" : "text-muted hover:bg-surface2 hover:text-ink"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="pb-8">
        {tab === "scorecard" ? <ScorecardView detail={detail} /> : null}
        {tab === "commentary" ? <CommentaryView detail={detail} /> : null}
        {tab === "squads" ? <SquadsView detail={detail} /> : null}
        {tab === "info" ? <MatchInfo detail={detail} /> : null}
      </div>
    </div>
  );
}
