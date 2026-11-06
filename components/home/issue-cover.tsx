import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { MatchSummary } from "@/lib/types";
import {
  matchFormat,
  matchShortTitle,
  sortByStateThenTime,
  upcomingLine,
} from "@/lib/match-display";
import { formatDate, formatTime, pad, timeAgo } from "@/lib/utils";
import { Lines, d } from "@/components/motion";

/** ISO week number, because this page is published, not streamed. */
function issueOf(now: Date): string {
  const date = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return pad(
    Math.ceil(((date.getTime() - start.getTime()) / 86400000 + 1) / 7)
  );
}

/** What sits in the right-hand column of a contents row. */
function scoreLine(match: MatchSummary): string {
  if (match.state === "upcoming") return upcomingLine(match);
  if (match.state === "completed" && match.winnerTeamId) {
    const winner = match.teams.find((team) => team.id === match.winnerTeamId);
    return winner ? `${winner.shortName} won` : "Result";
  }
  const innings = match.innings.at(-1);
  /* A live match that has not started its innings only has a status sentence,
     which is far too long for this column — fall back to the format. */
  if (!innings) return matchFormat(match);
  return `${innings.runs}-${innings.wickets}${innings.overs ? ` (${innings.overs})` : ""}`;
}

function IndexList({
  matches,
  empty,
}: {
  matches: MatchSummary[];
  empty: string;
}) {
  if (matches.length === 0) {
    return <p className="cover-note">{empty}</p>;
  }
  return (
    <ol className="rows">
      {matches.map((match, i) => (
        <li key={match.id} data-rv="" style={d(i)}>
          <Link href={`/match/${match.id}`} className="hrow">
            <b>{pad(i + 1)}</b>
            <span className="min-w-0 truncate font-bold">
              {matchShortTitle(match)}
            </span>
            <em>{scoreLine(match)}</em>
          </Link>
        </li>
      ))}
    </ol>
  );
}

function Column({
  n,
  title,
  delay,
  children,
}: {
  n: string;
  title: string;
  delay: number;
  children: ReactNode;
}) {
  return (
    <div data-rv="" style={d(delay)}>
      <h2 className="cover-h">
        <span className="mono text-faint">{n}</span> {title}
      </h2>
      {children}
    </div>
  );
}

export function IssueCover({
  matches,
  updatedAt,
}: {
  matches: MatchSummary[];
  updatedAt: number;
}) {
  /* Read off the feed's own clock, so server and client agree what issue this is. */
  const stamp = updatedAt || Date.now();
  const issue = issueOf(new Date(stamp));

  const byState = (state: MatchSummary["state"]) =>
    matches.filter((match) => match.state === state).sort(sortByStateThenTime);

  const live = byState("live");
  const upcoming = byState("upcoming");
  const completed = byState("completed");

  const teams = new Set(
    matches.flatMap((match) => [match.teams[0].id, match.teams[1].id])
  ).size;
  const series = new Set(
    matches.map((match) => match.seriesId).filter((id) => id > 0)
  ).size;

  const currently = [
    { label: "On air", value: `${live.length} live` },
    { label: "Fixtures", value: `${matches.length} today` },
    { label: "Teams", value: String(teams) },
    { label: "Series", value: String(series) },
    { label: "Filed", value: timeAgo(stamp) },
  ];

  const sections = [
    { href: "/series", label: "Series & tables", n: "05" },
    { href: "/rankings", label: "ICC rankings", n: "06" },
    { href: "/search", label: "Find a match", n: "07" },
  ];

  return (
    <section className="cover" aria-label="Today's cricket, at a glance">
      <div className="cover-top">
        <Lines as="h1" className="cover-mast" lines={["Chauka"]} />
        <p className="cover-note" data-rv="" style={d(1)}>
          The live cricket desk
          <br />
          Scores, cards &amp; commentary
        </p>
        <p className="cover-note" data-rv="" style={d(2)}>
          Ball by ball
          <br />
          Every format, every ground
        </p>
        <p className="cover-no" data-rv="" style={d(3)}>
          Issue {issue}
          <span>
            {formatDate(stamp, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </p>
      </div>

      <div className="cover-mid">
        <div className="min-w-0">
          <p className="cover-num" aria-hidden="true">
            {issue}
          </p>
          <Lines
            as="p"
            className="cover-tag mt-4"
            lines={[
              <span key="a">All day,</span>,
              <span key="b">
                <mark>on the record.</mark>
              </span>,
            ]}
          />
        </div>

        <dl className="dl cover-dl min-w-0" data-rv="" style={d(2)}>
          {currently.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd suppressHydrationWarning>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="cover-cols">
        <Column n="01" title="Live now" delay={0}>
          <IndexList matches={live.slice(0, 4)} empty="No matches in play." />
        </Column>

        <Column n="02" title="Day ahead" delay={1}>
          <IndexList
            matches={upcoming.slice(0, 4)}
            empty="Nothing scheduled yet."
          />
        </Column>

        <Column n="03" title="Results" delay={2}>
          <IndexList
            matches={completed.slice(0, 4)}
            empty="No results filed yet."
          />
        </Column>

        <Column n="04" title="Sections" delay={3}>
          <ol className="rows">
            {sections.map((item, i) => (
              <li key={item.href} data-rv="" style={d(i)}>
                <Link href={item.href} className="hrow">
                  <b>{item.n}</b>
                  <span className="min-w-0 truncate font-bold">
                    {item.label}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                </Link>
              </li>
            ))}
          </ol>
          <p className="cover-note mt-3" suppressHydrationWarning>
            {formatTime(stamp, false)} — the desk never closes.
          </p>
        </Column>
      </div>
    </section>
  );
}
