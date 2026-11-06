"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { MatchDetail, MatchSummary, TeamRef } from "@/lib/types";
import type { MatchOvers } from "@/lib/data/overs";
import {
  matchFormat,
  matchStatusText,
  teamInnings,
  teamScoreText,
} from "@/lib/match-display";
import { cn, formatDate, formatDateTime, formatTime, oversLimit, pad } from "@/lib/utils";
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

/** Feeds like to say "Melbourne, Melbourne". Say it once. */
function venueLine(venue?: { ground: string; city: string } | null): string {
  if (!venue) return "Venue TBC";
  const { ground, city } = venue;
  if (ground && city && ground.toLowerCase() === city.toLowerCase()) return city;
  return [ground, city].filter(Boolean).join(", ") || "Venue TBC";
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
  const innings = teamInnings(match, team.id);
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
      <TeamBadge
        team={team}
        size={96}
        className="!h-[clamp(58px,9vw,104px)] !w-[clamp(58px,9vw,104px)] border-white/35"
      />
      <p className="mt-3.5 max-w-full truncate text-[12px] font-extrabold uppercase leading-none tracking-[0.1em] text-white sm:text-[13px]">
        {team.name}
      </p>

      {/* Runs carry the weight, wickets and overs are footnotes. One line per
          innings, so a follow-on score reads as two figures, not one long string. */}
      {innings.length > 0 ? (
        <div className="mt-2.5 w-full">
          {innings.map((inn, i) => (
            <div
              key={inn.inningsId}
              className={cn(
                "py-1.5 first:pt-0",
                i > 0 && "mt-1.5 border-t border-white/15"
              )}
            >
              <p
                className={cn(
                  "flex items-baseline justify-center gap-[0.08em] sm:justify-start",
                  align === "right" && "sm:justify-end"
                )}
              >
                <span className="dnum !text-[clamp(46px,8.2vw,108px)] !font-extrabold !leading-[0.82] tracking-[-0.055em] text-white">
                  {inn.runs}
                </span>
                <span className="dnum !text-[clamp(19px,3.1vw,40px)] !font-bold !leading-none text-white/55">
                  -{inn.wickets}
                  {inn.declared ? <span className="text-white/40">d</span> : null}
                </span>
                {innings.length > 1 ? (
                  <span className="ml-1 text-[9px] font-extrabold uppercase leading-none tracking-[0.12em] text-white/40">
                    {i === 0 ? "1st" : "2nd"}
                  </span>
                ) : null}
              </p>
              {inn.overs > 0 ? (
                <p
                  className={cn(
                    "dcell mt-1 text-[12px] leading-none text-white/60",
                    align === "right" ? "text-right" : "text-left"
                  )}
                >
                  {inn.overs} ov
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p
          className={cn(
            "mt-2.5 flex w-full flex-col items-center gap-2 sm:items-start",
            align === "right" && "sm:items-end"
          )}
        >
          <span
            className="dnum !text-[clamp(46px,8.2vw,108px)] !font-extrabold !leading-[0.82] text-white/25"
            aria-hidden="true"
          >
            &mdash;
          </span>
          <span className="text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-white/55">
            {score === "Yet to bat" ? "Yet to bat" : "Innings not opened"}
          </span>
        </p>
      )}
      {rows.length > 0 ? (
        <ul className="mt-4 hidden w-full space-y-0.5 text-[12px] sm:block">
          {rows.map((row) => (
            <li
              key={row.key}
              className={cn(
                "flex items-baseline gap-2 border-t border-white/12 py-1",
                align === "right" && "sm:flex-row-reverse"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-[10px] w-[3px] shrink-0 self-center",
                  row.mark ? "bg-white" : "bg-white/25"
                )}
              />
              <span className="truncate font-bold text-white/90">{row.name}</span>
              <span className="leaders" />
              <span className="dcell shrink-0 text-white/75">{row.figure}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** The almanac strip under the teams: four facts, no boxes. */
function BannerFigs({
  match,
  detail,
}: {
  match: MatchSummary;
  detail: MatchDetail | null;
}) {
  const live = detail?.live;
  const venue = detail?.venue ?? match.venue;
  const ground = venueLine(venue);
  const figs: { label: string; value: string }[] = [];

  if (live) {
    figs.push({ label: "Over", value: String(live.overs || "—") });
    figs.push({ label: "CRR", value: live.currentRunRate.toFixed(2) });
    if (live.target) figs.push({ label: "Target", value: String(live.target) });
    if (live.requiredRunRate) {
      figs.push({ label: "RRR", value: live.requiredRunRate.toFixed(2) });
    }
    if (live.partnership) {
      figs.push({
        label: "Stand",
        value: `${live.partnership.runs} (${live.partnership.balls})`,
      });
    }
  } else if (match.state === "upcoming") {
    figs.push({ label: "Ground", value: ground });
    if (match.startTime) {
      figs.push({ label: "Start", value: formatTime(match.startTime) });
    }
    figs.push({ label: "Format", value: match.format });
  } else {
    figs.push({ label: "Ground", value: ground });
    figs.push({ label: "Result", value: detail?.resultText || match.status });
  }

  const shown = figs.filter((f) => f.value).slice(0, 4);
  if (shown.length < 2) return null;

  return (
    <dl className="mt-6 grid grid-cols-2 gap-x-5 border-t border-white/20 pt-3 sm:grid-cols-4">
      {shown.map((fig) => (
        <div key={fig.label} className="min-w-0">
          <dt className="text-[9px] font-extrabold uppercase leading-none tracking-[0.14em] text-white/55">
            {fig.label}
          </dt>
          <dd className="dnum mt-1.5 truncate !text-[clamp(18px,2.2vw,30px)] !leading-none text-white">
            {fig.value}
          </dd>
        </div>
      ))}
    </dl>
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
  const headline =
    live?.remainingRuns && live.remainingBalls
      ? `Need ${live.remainingRuns} off ${live.remainingBalls}`
      : match.state === "upcoming"
        ? matchStatusText(match)
        : live?.status || match.status;

  return (
    <BlueHero tone="accent" className="px-[var(--pad)] pb-6 pt-4">
      <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/20 pb-3">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
          {matchFormat(match)}
        </span>
        <span className="text-[10px] uppercase tracking-[0.1em] text-white/65">
          {match.description}
        </span>
        {match.state === "live" ? (
          <span className="inline-flex items-center gap-1.5 bg-live px-1.5 text-[9px] font-extrabold uppercase leading-[17px] tracking-[0.1em] text-[#0a1400]">
            <span className="h-[5px] w-[5px] rounded-full bg-[#0a1400] animate-pulse-dot" />
            Live
          </span>
        ) : null}
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-white/65">
          <MapPin className="h-3 w-3" />
          {venueLine(venue)}
        </span>
      </div>
      <p className="relative mt-2 truncate text-[10px] uppercase tracking-[0.1em] text-white/72" suppressHydrationWarning>
        {match.seriesName}
        {match.startTime
          ? ` · ${formatDate(match.startTime, { day: "numeric", month: "long", year: "numeric" })}`
          : ""}
      </p>

      <div className="relative mt-6 grid grid-cols-2 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-start sm:gap-6">
        <TeamColumn match={match} team={a} detail={detail} align="left" />
        <div className="order-last col-span-2 flex flex-col items-center pt-1 text-center sm:order-none sm:col-span-1 sm:pt-8">
          <span
            aria-hidden="true"
            className="dnum !text-[clamp(30px,4.4vw,58px)] !leading-[0.8] text-transparent"
            style={{ WebkitTextStroke: "1.5px rgb(255 255 255 / 0.45)" }}
          >
            VS
          </span>
          <p
            className="mt-4 max-w-[22ch] text-[clamp(17px,2.1vw,26px)] font-extrabold uppercase leading-[1.02] tracking-[-0.03em] text-white"
            suppressHydrationWarning
          >
            {headline}
          </p>
          {showLink ? (
            <Link
              href={`/match/${match.id}`}
              className="mt-4 inline-flex h-9 items-center gap-1.5 bg-white px-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slab transition-transform duration-300 hover:-translate-y-0.5"
            >
              Match centre
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
        <TeamColumn match={match} team={b} detail={detail} align="right" />
      </div>

      <BannerFigs match={match} detail={detail} />
    </BlueHero>
  );
}

function CommentaryTab({
  detail,
  overs,
}: {
  detail: MatchDetail | null;
  overs: MatchOvers | null;
}) {
  const balls = (detail?.commentary.overs ?? []).flatMap((group) => group.balls).slice(0, 8);
  const recent = detail?.live?.recentBalls ?? [];
  const lastInnings = overs?.innings.at(-1);
  const lastOver = lastInnings?.overs.at(-1);
  const prob = detail?.winProbability;

  if (!detail) {
    return <div className="h-48 animate-pulse bg-surface" />;
  }

  const venue = detail.venue ?? detail.summary.venue;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-4">
      <section className="blk">
        <div className="band">
          <h3>Ball by ball</h3>
          <span>Latest first</span>
        </div>
        {recent.length > 0 ? (
          <div className="flex flex-wrap gap-1 border-b border-line px-4 py-3">
            {recent.slice(-12).map((ball, index) => (
              <BallChip key={index} ball={ball} size={26} />
            ))}
          </div>
        ) : null}
        <ol>
          {balls.length === 0 ? (
            <li className="px-4 py-6 text-[12px] text-faint">
              {detail.resultText || "Commentary will appear once play starts."}
            </li>
          ) : (
            balls.map((ball) => {
              const [who, ...rest] = ball.text.split(",");
              const kind = ball.badge ? ballKind(ball.badge) : null;
              return (
                <li
                  key={ball.id}
                  className="flex gap-3 border-t border-line px-4 py-3 first:border-t-0"
                >
                  <span className="dnum w-[52px] shrink-0 text-[13px] text-accent">
                    {ball.ballMetric ?? ""}
                  </span>
                  <p className="min-w-0 text-[13px] leading-snug text-muted">
                    <span className="font-bold text-ink">{who}</span>
                    {rest.length ? (
                      <b
                        className={cn(
                          "font-bold text-ink",
                          kind === "four" && "text-accent",
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
      </section>

      {balls.length === 0 && detail.squads.length > 0 ? (
        <section className="blk">
          <div className="band">
            <h3>Playing XIs</h3>
            <span>Announced</span>
          </div>
          <div className="grid sm:grid-cols-2">
            {detail.squads.map((squad, squadIndex) => (
              <div
                key={squad.team.id}
                className={cn(
                  "px-4 py-3.5",
                  squadIndex > 0 && "border-t border-line sm:border-t-0 sm:border-l"
                )}
              >
                <div className="mb-2.5 flex items-center gap-2">
                  <TeamBadge team={squad.team} size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
                    {squad.team.shortName}
                  </span>
                </div>
                <ol className="space-y-1.5">
                  {squad.players.slice(0, 6).map((player, index) => (
                    <li key={`${player.id}-${index}`} className="flex items-center gap-2 text-[12.5px]">
                      <span className="mono w-[18px] shrink-0 text-[10px] text-faint">
                        {pad(index + 1)}
                      </span>
                      <span className="dname min-w-0 flex-1 truncate">{player.name}</span>
                      {player.captain ? <span className="dtag" data-tone="milestone">C</span> : null}
                      {player.keeper ? <span className="dtag">WK</span> : null}
                    </li>
                  ))}
                </ol>
                {squad.players.length > 6 ? (
                  <p className="dnote mt-2">
                    +{squad.players.length - 6} more in the squad
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
      </div>

      <div className="min-w-0 space-y-4">
        {lastOver && lastInnings ? (
          <section className="blk">
            <div className="band">
              <h3>End of over {lastOver.over}</h3>
            </div>
            <div className="px-4 py-4">
              <p className="dnum text-[22px]">
                {lastInnings.team} {lastOver.score}-{lastOver.wickets}
              </p>
              <p className="dcell mt-1.5">
                {lastOver.runs} off the over · CRR{" "}
                {(lastOver.score / lastOver.over).toFixed(2)}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {lastOver.balls.map((ball, index) => (
                  <BallChip key={index} ball={ball} size={22} />
                ))}
              </div>
              {lastOver.bowler ? (
                <p className="dcell mt-3 border-t border-line pt-2 text-faint">
                  Bowler · {lastOver.bowler}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}
        {prob ? (
          <section className="blk">
            <div className="band">
              <h3>Win odds</h3>
            </div>
            <div className="px-4 py-4">
              <div className="flex items-baseline gap-2">
                <span className="dnum text-[20px]">{prob.team1.percent}%</span>
                <span className="dcell truncate uppercase tracking-[0.06em]">
                  {prob.team1.shortName}
                </span>
                <span className="leaders" />
                <span className="dcell truncate text-right uppercase tracking-[0.06em]">
                  {prob.team2.shortName}
                </span>
                <span className="dnum text-[20px] text-right">
                  {prob.team2.percent}%
                </span>
              </div>
              <div className="stack mt-3">
                <span
                  style={{
                    width: `${prob.team1.percent}%`,
                    background: "rgb(var(--s1))",
                  }}
                />
                <span
                  style={{
                    width: `${prob.team2.percent}%`,
                    background: "rgb(var(--s2))",
                  }}
                />
              </div>
            </div>
          </section>
        ) : null}

        <section className="blk">
          <div className="band">
            <h3>Fixture</h3>
          </div>
          <dl className="figs">
            {detail.toss ? (
              <div>
                <dt>Toss</dt>
                <span className="leaders" aria-hidden="true" />
                <dd>{detail.toss.winnerName}</dd>
              </div>
            ) : null}
            {venue ? (
              <div>
                <dt>Venue</dt>
                <span className="leaders" aria-hidden="true" />
                <dd>{venue.city || venue.ground}</dd>
              </div>
            ) : null}
            <div>
              <dt>Start</dt>
              <span className="leaders" aria-hidden="true" />
              <dd>{formatDateTime(detail.summary.startTime)}</dd>
            </div>
            <div>
              <dt>Format</dt>
              <span className="leaders" aria-hidden="true" />
              <dd>{detail.summary.format}</dd>
            </div>
          </dl>
        </section>
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
          <div
            className="mt-5 flex items-end gap-0 border-b border-line"
            role="tablist"
          >
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
                className="tab-link"
                data-active={tab === key ? "true" : undefined}
              >
                {label}
              </button>
            ))}
            <Link
              href={`/match/${match.id}`}
              className="tab-link ml-auto !text-accent"
            >
              Full scorecard
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4">
            {tab === "commentary" ? (
              <CommentaryTab detail={detail} overs={overs} />
            ) : hasChart ? (
              <GameProgress
                data={overs!}
                oversLimit={oversLimit(match.formatRaw)}
                className="!border-0"
              />
            ) : (
              <div className="blk px-8 py-10 text-center text-[12px] text-faint">
                Over-by-over data isn&apos;t available for this match yet.
              </div>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
