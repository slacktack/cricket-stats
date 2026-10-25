import { getHomeFeed } from "../lib/data/home";
import { getMatchDetail } from "../lib/data/match";
import { getPlayerProfile } from "../lib/data/player";
import { getRankings } from "../lib/data/rankings";
import { getSearchIndex } from "../lib/data/search";
import { getSeriesInfo, getSeriesList } from "../lib/data/series";

function line(label: string, value: unknown) {
  console.log(`${label.padEnd(28)} ${typeof value === "string" ? value : JSON.stringify(value)}`);
}

async function main() {
  const started = Date.now();
  const feed = await getHomeFeed();
  const counts = feed.matches.reduce<Record<string, number>>((acc, match) => {
    acc[match.state] = (acc[match.state] ?? 0) + 1;
    return acc;
  }, {});
  line("home.matches", feed.matches.length);
  line("home.states", counts);
  line("home.updatedAt", new Date(feed.updatedAt).toISOString());
  const sample = feed.matches.find((match) => match.state === "live") ?? feed.matches[0];
  line("home.sample", {
    id: sample.id,
    format: sample.format,
    teams: sample.teams.map((team) => team.shortName),
    innings: sample.innings.length,
    state: sample.state,
    hasImages: sample.teams.every((team) => Boolean(team.imageId)),
  });

  const detail = await getMatchDetail(sample.id);
  line("match.series", detail.summary.seriesName);
  line("match.scorecard", {
    innings: detail.innings.length,
    squads: detail.squads.map((squad) => squad.players.length),
    commentaryOvers: detail.commentary.overs.length,
    winProbability: Boolean(detail.winProbability),
    playersOfMatch: detail.playersOfMatch.length,
    officials: detail.officials.length,
    live: Boolean(detail.live),
  });

  const seriesList = await getSeriesList();
  line("seriesList.count", seriesList.length);
  const seriesItem = seriesList.find((item) => item.live > 0) ?? seriesList[0];
  line("seriesList.sample", seriesItem);
  if (seriesItem) {
    const series = await getSeriesInfo(seriesItem.id);
    line("seriesInfo", {
      id: series.id,
      name: series.name,
      matches: series.matches.length,
      groups: series.matchGroups.length,
      teams: series.teams.length,
      pointsGroups: series.pointsTable?.length ?? 0,
      runRows: series.stats?.rows.length ?? 0,
      wicketRows: series.statsWickets?.rows.length ?? 0,
    });
  }

  const rankings = await getRankings("men");
  for (const format of ["test", "odi", "t20"] as const) {
    line(`rankings.${format}`, {
      batting: rankings.categories.batting[format].length,
      bowling: rankings.categories.bowling[format].length,
      allRounder: rankings.categories["all-rounder"][format].length,
      teams: rankings.categories.teams[format].length,
    });
  }
  const topPlayer = rankings.categories.batting.odi[0];
  line("rankings.top", topPlayer && { id: topPlayer.id, name: topPlayer.name, rank: topPlayer.rank });
  if (topPlayer) {
    const player = await getPlayerProfile(topPlayer.id);
    line("player.profile", {
      name: player.name,
      role: player.role,
      teams: player.teams.length,
      rankings: player.rankings.length,
      battingFormats: player.batting.formats,
      bowlingFormats: player.bowling.formats,
      recent: player.recentBatting.length,
      career: player.career.length,
    });
  }

  const search = await getSearchIndex();
  line("search.index", {
    players: search.players.length,
    teams: search.teams.length,
    matches: search.matches.length,
    series: search.series.length,
    trending: search.trending.length,
  });

  line("elapsed", `${((Date.now() - started) / 1000).toFixed(1)}s`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
