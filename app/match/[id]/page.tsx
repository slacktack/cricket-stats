import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatchDetail } from "@/lib/data/match";
import { loadPage } from "@/lib/page-data";
import { matchFormat, matchShortTitle } from "@/lib/match-display";
import { Breadcrumbs } from "@/components/page-header";
import { FollowTeamIcon } from "@/components/follow-buttons";
import { ShareButton } from "@/components/share-button";
import { MatchBanner } from "@/components/home/match-centre";
import { GameProgress } from "@/components/match/game-progress";
import { getMatchOvers } from "@/lib/data/overs";
import { LivePanel } from "@/components/match/live-panel";
import { ScorecardView } from "@/components/match/scorecard-view";
import { CommentaryView } from "@/components/match/commentary-view";
import { SquadsView } from "@/components/match/squads-view";
import { MatchInfo } from "@/components/match/match-info";
import { cn, oversLimit } from "@/lib/utils";

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
  const [detail, query, overs] = await Promise.all([
    loadPage(getMatchDetail(matchId)),
    searchParams,
    getMatchOvers(matchId).catch(() => null),
  ]);
  const summary = detail.summary;
  const requested = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const fallback: MatchTab = summary.state === "upcoming" ? "info" : "scorecard";
  const tab: MatchTab = TABS.some((item) => item.key === requested)
    ? (requested as MatchTab)
    : fallback;

  const content = {
    scorecard: <ScorecardView detail={detail} overs={overs} />,
    commentary: <CommentaryView detail={detail} />,
    squads: <SquadsView detail={detail} />,
    info: <MatchInfo detail={detail} />,
  }[tab];

  return (
    <div className="container-page py-4 sm:py-6">
      <Breadcrumbs
        items={[
          { label: "Matches", href: "/" },
          ...(detail.series.id
            ? [{ label: detail.series.name, href: `/series/${detail.series.id}` }]
            : []),
          { label: matchShortTitle(summary) },
        ]}
      />

      <div className="mt-3">
        <MatchBanner match={summary} detail={detail} showLink={false} />
      </div>

      <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start lg:gap-7 xl:grid-cols-[minmax(0,1fr)_460px] xl:gap-9">
        {/* The live rail rides beside the scorecard, so the numbers never scroll away. */}
        <aside className="rail order-1 min-w-0 lg:order-2 lg:sticky lg:top-[calc(var(--header-h)+12px)] lg:max-h-[calc(100vh-var(--header-h)-24px)] lg:overflow-y-auto lg:pr-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold text-faint">Follow</span>
            <FollowTeamIcon team={summary.teams[0]} showLabel />
            <FollowTeamIcon team={summary.teams[1]} showLabel />
            <ShareButton
              title={`${matchShortTitle(summary)} · Chauka`}
              text={summary.status}
              className="ml-auto"
            />
          </div>

          <LivePanel detail={detail} />

          {overs && overs.innings.some((item) => item.overs.length > 0) ? (
            <GameProgress
              data={overs}
              oversLimit={oversLimit(summary.formatRaw)}
              className="mt-4"
            />
          ) : null}
        </aside>

        <div className="order-2 mt-5 min-w-0 lg:order-1 lg:mt-0">
          <div className="sticky top-[var(--header-h)] z-20 border-b border-line bg-bg">
            <div
              className="no-scrollbar flex min-w-0 items-center overflow-x-auto"
              role="tablist"
              aria-label="Match sections"
            >
              {TABS.map((item) => {
                const active = tab === item.key;
                return (
                  <Link
                    key={item.key}
                    href={`/match/${matchId}?tab=${item.key}`}
                    scroll={false}
                    role="tab"
                    aria-selected={active}
                    data-active={active}
                    className={cn(
                      "tab-link !h-12 flex-1 justify-center px-3 text-xs sm:flex-none sm:!text-[13px] sm:px-5",
                      active ? "text-accent" : "text-muted"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pb-8 pt-5">{content}</div>
        </div>
      </div>
    </div>
  );
}
