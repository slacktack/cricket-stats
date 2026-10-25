import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getMatchDetail } from "@/lib/data/match";
import { loadPage } from "@/lib/page-data";
import { matchFormat, matchShortTitle } from "@/lib/match-display";
import { Breadcrumbs } from "@/components/page-header";
import { FollowTeamIcon } from "@/components/follow-buttons";
import { ShareButton } from "@/components/share-button";
import { FormatPill, StatePill } from "@/components/ui/pills";
import { MatchHero } from "@/components/match/match-hero";
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

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <FormatPill format={matchFormat(summary)} />
        <StatePill state={summary.state} />
        {detail.series.id ? (
          <Link
            href={`/series/${detail.series.id}`}
            className="inline-flex min-w-0 items-center gap-1 text-[11px] font-semibold text-faint transition-colors hover:text-accent"
          >
            <span className="truncate">{detail.series.name}</span>
            <ChevronRight className="h-3 w-3 shrink-0" />
          </Link>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <FollowTeamIcon team={summary.teams[0]} />
          <FollowTeamIcon team={summary.teams[1]} />
          <ShareButton title={`${matchShortTitle(summary)} · Chauka`} text={summary.status} />
        </div>
      </div>

      <MatchHero detail={detail} />

      <LivePanel detail={detail} />

      <div className="sticky top-16 z-20 mt-4 border-b border-line bg-bg/95 backdrop-blur-sm">
        <div className="table-scroll no-scrollbar" role="tablist" aria-label="Match sections">
          <div className="flex min-w-max items-center">
            {TABS.map((item) => {
              const active = tab === item.key;
              return (
                <Link
                  key={item.key}
                  href={`/match/${matchId}?tab=${item.key}`}
                  role="tab"
                  aria-selected={active}
                  className={cn(
                    "flex h-11 items-center border-b-2 px-4 text-xs font-bold transition-colors",
                    active
                      ? "border-ink text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
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
