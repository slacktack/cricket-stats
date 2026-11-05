"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { MatchDetail, MatchSummary, TeamRef } from "@/lib/types";
import type { MatchOvers } from "@/lib/data/overs";
import {
  matchFormat,
  matchStatusText,
  teamOversText,
  teamScoreText,
} from "@/lib/match-display";
import { getTeamColor } from "@/lib/colors";
import { cn, formatDate, oversLimit } from "@/lib/utils";
import { BallChip, ballKind } from "@/components/ui/ball-chip";
import { TeamBadge } from "@/components/ui/team-badge";
import { GameProgress } from "@/components/match/game-progress";
import { BlueHero } from "@/components/ui/blue-hero";

export function centreRank(match: MatchSummary): number {
  const stateRank = match.state === "live" ? 0 : match.state === "completed" ? 20 : 40;
  const paused = /stumps|break|delay|stopped|rain|lunch|tea/i.test(match.status);
  const limited = !!oversLimit(match.formatRaw);
  return stateRank + (paused ? 6 : 0) + (limited ? 0 : 3) + (match.innings.length >= 2 ? 0 : 1);
}

function useMatch(match: MatchSummary) {
  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [overs, setOvers] = useState<MatchOvers | null>(null);
  const id = match.id;
  const wantsOvers = match.state !== "upcoming";

  const load = useCallback(async () => {
    const [d, o] = await Promise.allSettled([
      fetch(`/api/match/${id}`).then((r) => (r.ok ? r.json() : Promise.reject())),
      wantsOvers
        ? fetch(`/api/match/${id}/overs`).then((r) => (r.ok ? r.json() : Promise.reject()))
        : Promise.reject(),
    ]);
    if (d.status === "fulfilled") setDetail(d.value as MatchDetail);
    if (o.status === "fulfilled") setOvers(o.value as MatchOvers);
  }, [id, wantsOvers]);

  useEffect(() => {
    setDetail(null);
    setOvers(null);
    void load();
    if (match.state !== "live") return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 30_000);
    return () => clearInterval(timer);
  }, [load, match.state]);

  return { detail, overs };
}

function TeamColumn({
  match,
  team,
  detail,
  align,
}: {
  match: MatchSummary;
  team: TeamRef;
  detail: MatchDetail | null;
  align: "left" | "right";
}) {
  const score = teamScoreText(match, team);
  const overs = teamOversText(match, team);
  const batting = match.state === "live" && match.currentBattingTeamId === team.id;
  const live = detail?.live;
  const rows = !live
    ? []
    : batting
      ? live.batters.map((p) => ({
          key: `b${p.id}`,
          name: p.name,
          figure: `${p.runs} (${p.balls})`,
          mark: p.isStriker,
        }))
      : match.state === "live"
        ? live.bowlers.slice(0, 2).map((p) => ({
            key: `w${p.id}`,
            name: p.name,
            figure: `${p.overs}-${p.maidens}-${p.runs}-${p.wickets}`,
            mark: p.isStriker,
          }))
        : [];

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center text-center",
        align === "left" ? "sm:items-start sm:text-left" : "sm:items-end sm:text-right"
      )}
    >
      <TeamBadge team={team} size={84} className="shadow-[0_10px_30px_-10px_rgb(0_0_0/0.6)]" />
      <p className="mt-3 max-w-full truncate font-display text-[20px] font-bold tracking-[-0.01em] text-white sm:text-[24px]">
        {team.name}
      </p>
      <p className="tnum mt-1 font-display text-[34px] font-bold leading-none tracking-[-0.02em] text-white sm:text-[44px]">
        {score === "—" ? (
          ""
        ) : score === "Yet to bat" ? (
          <span className="text-[16px] font-medium text-white/60">Yet to bat</span>
        ) : (
          score
        )}
      </p>
      {overs ? <p className="tnum mt-1 text-[13px] text-white/60">{overs}</p> : null}
      {rows.length > 0 ? (
        <ul className="mt-4 hidden space-y-1.5 text-[13px] sm:block">
          {rows.map((row) => (
            <li
              key={row.key}
              className={cn(
                "flex items-center gap-2 text-white/85",
                align === "right" && "sm:flex-row-reverse"
              )}
            >
              <span
                className={cn(
                  "h-3 w-1 rounded-full",
                  row.mark ? (batting ? "bg-white" : "bg-[#fbbf24]") : "bg-white/25"
                )}
              />
              <span className="font-semibold">{row.name}</span>
              <span className="tnum text-white/60">{row.figure}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function MatchBanner({
  match,
  detail,
  showLink = true,
}: {
  match: MatchSummary;
  detail: MatchDetail | null;
  showLink?: boolean;
}) {
  const [a, b] = match.teams;
  const live = detail?.live;
  const venue = detail?.venue ?? match.venue;
  const colorA = getTeamColor(a.shortName, a.imageId);
  const colorB = getTeamColor(b.shortName, b.imageId);
  const headline =
    live?.remainingRuns && live.remainingBalls
      ? `Need ${live.remainingRuns} off ${live.remainingBalls}`
      : match.state === "upcoming"
        ? matchStatusText(match)
        : live?.status || match.status;

  return (
    <BlueHero tints={[colorA, colorB]} className="px-5 pb-7 pt-5 sm:px-8">
      <div className="relative flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold">
          {matchFormat(match)} · {match.description}
        </span>
        {match.state === "live" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#22c55e] px-3 py-1 text-[12px] font-bold text-[#052e16]">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[#052e16]" />
            LIVE
          </span>
        ) : null}
        <span className="ml-auto inline-flex items-center gap-1.5 text-[13px] text-white/80">
          <MapPin className="h-3.5 w-3.5" />
          {[venue?.ground, venue?.city].filter(Boolean).join(", ") || "Venue TBC"}
        </span>
      </div>
      <p className="relative mt-1 truncate text-[13px] text-white/60" suppressHydrationWarning>
        {match.seriesName}
        {match.startTime
          ? ` · ${formatDate(match.startTime, { day: "numeric", month: "long", year: "numeric" })}`
          : ""}
      </p>

      <div className="relative mt-6 grid grid-cols-2 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
        <TeamColumn match={match} team={a} detail={detail} align="left" />
        <div className="order-last col-span-2 flex flex-col items-center pt-2 text-center sm:order-none sm:col-span-1 sm:pt-10">
          <span className="font-display text-[15px] font-semibold text-white/50">vs</span>
          <p className="mt-3 max-w-[240px] text-[16px] font-semibold leading-snug" suppressHydrationWarning>
            {headline}
          </p>
          {live ? (
            <p className="tnum mt-2 text-[13px] text-white/70">
              CRR {live.currentRunRate.toFixed(2)}
              {live.requiredRunRate ? ` · RRR ${live.requiredRunRate.toFixed(2)}` : ""}
            </p>
          ) : null}
          {showLink ? (
            <Link
              href={`/match/${match.id}`}
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-[#1d4ed8] transition-opacity hover:opacity-90"
            >
              Match centre
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
        <TeamColumn match={match} team={b} detail={detail} align="right" />
      </div>
    </BlueHero>
  );
}

function CommentaryTab({ detail, overs }: { detail: MatchDetail | null; overs: MatchOvers | null }) {
  const balls = (detail?.commentary.overs ?? []).flatMap((group) => group.balls).slice(0, 8);
  const recent = detail?.live?.recentBalls ?? [];
  const lastInnings = overs?.innings.at(-1);
  const lastOver = lastInnings?.overs.at(-1);
  const prob = detail?.winProbability;

  if (!detail) return <div className="h-48 animate-pulse rounded-2xl bg-surface" />;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
      <div className="rounded-2xl bg-surface p-5">
        {recent.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {recent.slice(-12).map((ball, index) => (
              <BallChip key={index} ball={ball} size={28} />
            ))}
          </div>
        ) : null}
        <ol className={cn("space-y-3", recent.length > 0 && "mt-5")}>
          {balls.length === 0 ? (
            <li className="text-[13px] text-faint">
              {detail.resultText || "Commentary will appear once play starts."}
            </li>
          ) : (
            balls.map((ball) => {
              const [who, ...rest] = ball.text.split(",");
              const kind = ball.badge ? ballKind(ball.badge) : null;
              return (
                <li key={ball.id} className="flex gap-3 text-[14px] leading-snug">
                  <span className="tnum w-9 shrink-0 font-semibold text-accent">
                    {ball.ballMetric ?? ""}
                  </span>
                  <p className="min-w-0 text-muted">
                    <span className="text-ink">{who}</span>
                    {rest.length ? (
                      <b
                        className={cn(
                          "font-semibold text-ink",
                          kind === "four" && "text-s2",
                          kind === "six" && "text-live",
                          kind === "wicket" && "text-wkt"
                        )}
                      >
                        ,{rest.join(",")}
                      </b>
                    ) : null}
                  </p>
                </li>
              );
            })
          )}
        </ol>
      </div>

      <div className="space-y-4">
        {lastOver && lastInnings ? (
          <div className="rounded-2xl bg-surface p-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-faint">
              End of over {lastOver.over}
            </p>
            <p className="tnum mt-2 font-display text-[26px] font-bold leading-none">
              {lastInnings.team} {lastOver.score}/{lastOver.wickets}
            </p>
            <p className="tnum mt-2 text-[13px] text-muted">
              {lastOver.runs} off the over · CRR {(lastOver.score / lastOver.over).toFixed(2)}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {lastOver.balls.map((ball, index) => (
                <BallChip key={index} ball={ball} size={22} />
              ))}
            </div>
            {lastOver.bowler ? (
              <p className="mt-2 text-[12px] text-faint">Bowler · {lastOver.bowler}</p>
            ) : null}
          </div>
        ) : null}
        {prob ? (
          <div className="rounded-2xl bg-surface p-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-faint">Win odds</p>
            <div className="tnum mt-3 flex justify-between text-[14px] font-semibold">
              <span>
                {prob.team1.shortName} {prob.team1.percent}%
              </span>
              <span>
                {prob.team2.percent}% {prob.team2.shortName}
              </span>
            </div>
            <div className="mt-2 flex h-2 gap-0.5 overflow-hidden rounded-full">
              <span className="bg-s1" style={{ width: `${prob.team1.percent}%` }} />
              <span className="bg-s2" style={{ width: `${prob.team2.percent}%` }} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type Tab = "commentary" | "progress";

export function MatchStage({ match }: { match: MatchSummary }) {
  const { detail, overs } = useMatch(match);
  const [tab, setTab] = useState<Tab>("commentary");
  const hasChart = !!overs && overs.innings.some((i) => i.overs.length > 0);

  return (
    <section aria-label="Selected match">
      <MatchBanner match={match} detail={detail} />

      {match.state !== "upcoming" ? (
        <>
          <div className="mt-5 flex gap-6 border-b border-line" role="tablist">
            {(
              [
                ["commentary", "Commentary"],
                ["progress", "Game progress"],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn(
                  "-mb-px border-b-2 pb-3 text-[15px] font-semibold transition-colors",
                  tab === key
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-ink"
                )}
              >
                {label}
              </button>
            ))}
            <Link
              href={`/match/${match.id}`}
              className="-mb-px ml-auto border-b-2 border-transparent pb-3 text-[15px] font-semibold text-muted hover:text-ink"
            >
              Scorecard ↗
            </Link>
          </div>
          <div className="mt-5">
            {tab === "commentary" ? (
              <CommentaryTab detail={detail} overs={overs} />
            ) : hasChart ? (
              <GameProgress
                data={overs!}
                oversLimit={oversLimit(match.formatRaw)}
                className="rounded-2xl border-0"
              />
            ) : (
              <div className="rounded-2xl bg-surface p-8 text-center text-[14px] text-faint">
                Over-by-over data isn&apos;t available for this match yet.
              </div>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
