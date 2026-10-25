export type MatchState = "live" | "upcoming" | "completed";

export type MatchCategory =
  | "International"
  | "League"
  | "Domestic"
  | "Women"
  | "All";

export interface TeamRef {
  id: number;
  name: string;
  shortName: string;
  imageId?: number;
}

export interface InningsSummary {
  inningsId: number;
  runs: number;
  wickets: number;
  overs: number;
  declared: boolean;
  followOn: boolean;
  battingTeamId: number;
  battingTeamName: string;
}

export interface MatchSummary {
  id: number;
  seriesId: number;
  seriesName: string;
  description: string;
  format: string;
  formatRaw: string;
  matchType: string;
  state: MatchState;
  stateRaw: string;
  status: string;
  startTime: number;
  endTime?: number;
  teams: [TeamRef, TeamRef];
  innings: InningsSummary[];
  venue?: { ground: string; city: string; timezone?: string; country?: string };
  currentBattingTeamId?: number;
  winnerTeamId?: number;
  isDayNight?: boolean;
  isTournament?: boolean;
  isTbc?: boolean;
}

export interface HomeFeed {
  matches: MatchSummary[];
  updatedAt: number;
}

export interface BatsmanRow {
  id: number;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  outDesc: string;
  isOut: boolean;
  isCaptain: boolean;
  isKeeper: boolean;
  dismissalCode?: string;
  order: number;
}

export interface BowlerRow {
  id: number;
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  noBalls: number;
  wides: number;
  order: number;
}

export interface Extras {
  byes: number;
  legByes: number;
  noBalls: number;
  penalty: number;
  total: number;
  wides: number;
}

export interface FallOfWicket {
  order: number;
  batsmanId: number;
  batsmanName: string;
  runs: number;
  wickets: number;
  overs: number;
}

export interface Partnership {
  order: number;
  bat1Id: number;
  bat1Name: string;
  bat1Runs: number;
  bat1Balls: number;
  bat2Id: number;
  bat2Name: string;
  bat2Runs: number;
  bat2Balls: number;
  totalRuns: number;
  totalBalls: number;
}

export interface InningsDetail {
  id: number;
  battingTeam: TeamRef;
  bowlingTeam?: TeamRef;
  runs: number;
  wickets: number;
  overs: number;
  runRate: number;
  declared: boolean;
  followOn: boolean;
  batsmen: BatsmanRow[];
  bowlers: BowlerRow[];
  extras: Extras;
  fallOfWickets: FallOfWicket[];
  partnerships: Partnership[];
  isCurrent: boolean;
  target?: number;
}

export interface LiveBatter {
  id: number;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isStriker: boolean;
}

export interface LiveBowler {
  id: number;
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  isStriker: boolean;
}

export interface LiveState {
  inningsId: number;
  overs: number;
  target?: number;
  currentRunRate: number;
  requiredRunRate?: number;
  remainingRuns?: number;
  remainingBalls?: number;
  totalOvers?: number;
  partnership?: { runs: number; balls: number };
  batters: LiveBatter[];
  bowlers: LiveBowler[];
  lastWicket?: string;
  recentBalls: string[];
  status: string;
  event?: string;
}

export interface WinProbabilityTeam {
  id: number;
  name: string;
  shortName: string;
  percent: number;
  color?: string;
}

export interface WinProbability {
  team1: WinProbabilityTeam;
  team2: WinProbabilityTeam;
  drawTiePercent: number;
  lastUpdatedOver?: number;
}

export interface CommentaryBall {
  id: string;
  ballMetric?: number;
  over: number;
  ballInOver?: number;
  text: string;
  badge?: "4" | "6" | "W" | "wd" | "nb";
  event: string[];
  timestamp: number;
}

export interface CommentaryOverGroup {
  over: number;
  runs?: number;
  summary?: string;
  score?: string;
  balls: CommentaryBall[];
}

export interface MatchTalkItem {
  id: string;
  text: string;
  timestamp: number;
}

export interface CommentaryData {
  overs: CommentaryOverGroup[];
  talk: MatchTalkItem[];
  updatedAt: number;
  available: boolean;
}

export interface SquadPlayer {
  id: number;
  name: string;
  fullName?: string;
  role?: string;
  captain: boolean;
  keeper: boolean;
  substitute: boolean;
  battingStyle?: string;
  bowlingStyle?: string;
  faceImageId?: number;
  isOverseas?: boolean;
}

export interface TeamSquad {
  team: TeamRef;
  players: SquadPlayer[];
}

export interface Official {
  role: string;
  name: string;
  country?: string;
}

export interface MatchDetail {
  summary: MatchSummary;
  series: {
    id: number;
    name: string;
    startDate?: number;
    endDate?: number;
  };
  venue?: { ground: string; city: string; timezone?: string; country?: string };
  toss?: { winnerId: number; winnerName: string; decision: string };
  resultText: string;
  result?: {
    winnerTeamId?: number;
    margin?: number;
    byRuns?: boolean;
    byWickets?: boolean;
    byInnings?: boolean;
  };
  playersOfMatch: {
    id: number;
    name: string;
    teamName?: string;
    faceImageId?: number;
  }[];
  playersOfSeries: {
    id: number;
    name: string;
    teamName?: string;
    faceImageId?: number;
  }[];
  officials: Official[];
  innings: InningsDetail[];
  live?: LiveState;
  winProbability?: WinProbability;
  commentary: CommentaryData;
  squads: TeamSquad[];
  hasScorecard: boolean;
  updatedAt: number;
}

export interface SeriesMatchGroup {
  label: string;
  matches: MatchSummary[];
}

export interface SeriesListItem {
  id: number;
  name: string;
  format?: string;
  startDate?: number;
  endDate?: number;
  teams: TeamRef[];
  matches: number;
  live: number;
  upcoming: number;
  completed: number;
  state: "live" | "upcoming" | "completed";
  isTournament: boolean;
}

export interface SeriesInfo {
  id: number;
  name: string;
  format?: string;
  startDate?: number;
  endDate?: number;
  matchGroups: SeriesMatchGroup[];
  matches: MatchSummary[];
  teams: TeamRef[];
  pointsTable?: PointsTableGroup[];
  pointsUpdatedAt?: number;
  stats?: SeriesStats;
  statsWickets?: SeriesStats;
}

export interface PointsRow {
  teamId: number;
  teamName: string;
  teamFullName: string;
  imageId?: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesTied: number;
  noRes: number;
  matchesDrawn: number;
  nrr: string;
  points: number;
  form: string[];
}

export interface PointsTableGroup {
  groupName: string;
  rows: PointsRow[];
}

export interface SeriesStatsRow {
  id: number;
  name: string;
  values: string[];
}

export interface SeriesStats {
  title: string;
  headers: string[];
  rows: SeriesStatsRow[];
}

export interface RankingEntry {
  id: number;
  rank: number;
  name: string;
  country?: string;
  matches?: number;
  rating: number;
  points?: number;
  trend?: "up" | "down" | "flat";
  trendValue?: number;
  faceImageId?: number;
  imageId?: number;
}

export type RankingFormat = "odi" | "test" | "t20";
export type RankingCategory = "batting" | "bowling" | "all-rounder" | "teams";
export type RankingGender = "men" | "women";

export interface RankingsData {
  gender: RankingGender;
  categories: Record<
    RankingCategory,
    Record<RankingFormat, RankingEntry[]>
  >;
  updatedAt: number;
}

export interface PlayerStatRow {
  label: string;
  values: Record<string, string>;
}

export interface PlayerStatsTable {
  formats: string[];
  rows: PlayerStatRow[];
}

export interface PlayerRecentRow {
  matchId?: number;
  score: string;
  opponent?: string;
  format?: string;
  date?: string;
}

export interface PlayerRanking {
  format: string;
  kind: "batting" | "bowling" | "all-rounder";
  rank?: number;
  bestRank?: number;
  diff?: number;
}

export interface PlayerProfile {
  id: number;
  name: string;
  fullName: string;
  role?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  birthPlace?: string;
  dateOfBirth?: string;
  age?: string;
  intlTeam?: string;
  imageId?: number;
  teams: string[];
  rankings: PlayerRanking[];
  career: { format: string; debut?: string; lastPlayed?: string }[];
  batting: PlayerStatsTable;
  bowling: PlayerStatsTable;
  recentBatting: PlayerRecentRow[];
  updatedAt: number;
}

export interface SearchPlayer {
  id: number;
  name: string;
  country?: string;
  imageId?: number;
}

export interface SearchTeam {
  id: number;
  name: string;
  shortName: string;
  imageId?: number;
}

export interface SearchSeries {
  id: number;
  name: string;
  matches: number;
  live: number;
  format?: string;
}

export interface SearchIndex {
  players: SearchPlayer[];
  teams: SearchTeam[];
  matches: MatchSummary[];
  series: SearchSeries[];
  trending: SearchPlayer[];
}

export interface SearchResults {
  query: string;
  players: SearchPlayer[];
  teams: SearchTeam[];
  matches: MatchSummary[];
  series: SearchSeries[];
  total: number;
}

export interface TeamOverview {
  team: TeamRef;
  matches: MatchSummary[];
  series: SearchSeries[];
  updatedAt: number;
}

export interface ApiError {
  error: string;
  code?: string;
}
