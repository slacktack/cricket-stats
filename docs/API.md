# Chauka data & API

Chauka is a read-only cricket data app. All data is normalized from Cricbuzz public pages and cached in-process.

## Conventions

- Base URL: `http://localhost:3000` in development.
- All responses are JSON except page routes.
- Errors use `{ "error": string, "code"?: string }` with an HTTP status.
- Successful feed responses include `cache-control` with `s-maxage` and `stale-while-revalidate`.
- IDs are positive integers from Cricbuzz.

## Endpoints

### `GET /api/home`

Live, upcoming and completed matches in the current feed, sorted live → upcoming → completed.

Response: `HomeFeed`
```json
{
  "matches": [],
  "updatedAt": 1760000000000
}
```

Cache: 15s fresh, 60s stale-while-revalidate.

### `GET /api/match/:id`

Full match detail: summary, innings, live state, commentary, squads, officials and win probability.

Response: `MatchDetail`

Cache: 8s fresh, 45s stale-while-revalidate. Returns `404` for an unknown match.

### `GET /api/series`

Series represented in the current home feed, with match/team counts and state.

Response:
```json
{ "series": [], "updatedAt": 1760000000000 }
```

Cache: 60s.

### `GET /api/series/:id`

Series detail with grouped fixtures, points table and tournament stats.

Response: `SeriesInfo`

Cache: 60s. Returns `404` if the series has no fixtures.

### `GET /api/rankings`

Query parameters:

| Parameter | Values | Default |
| --- | --- | --- |
| `gender` | `men`, `women` | `men` |
| `category` | `batting`, `bowling`, `all-rounder`, `teams` | `batting` |
| `format` | `test`, `odi`, `t20` | `odi` |

Response:
```json
{
  "gender": "men",
  "category": "batting",
  "format": "odi",
  "entries": [],
  "formats": { "test": [], "odi": [], "t20": [] },
  "updatedAt": 1760000000000
}
```

Cache: 1h fresh, 6h stale-while-revalidate.

### `GET /api/players/:id`

Player profile with teams, rankings, career, batting/bowling stats and recent batting.

Response: `PlayerProfile`

Cache: 1h fresh, 6h stale-while-revalidate. Returns `404` for an unknown player.

### `GET /api/search?q=:query&limit=:limit`

Searches players, teams, matches and series from the in-memory search index.

- `q`: search string, max 80 characters.
- `limit`: 1–30, default 10.

Response: `SearchResults`
```json
{
  "query": "virat",
  "players": [],
  "teams": [],
  "matches": [],
  "series": [],
  "total": 1
}
```

Cache: 60s.

### `GET /api/teams/:id`

Team overview for the current feed: team identity, matches and series.

Response: `TeamOverview`

Cache: 30s. Returns `404` if the team is not in the current feed or search index.

## Shared types

See [`lib/types.ts`](../lib/types.ts) for every response shape.

## Upstream paths

| Data | Cricbuzz path |
| --- | --- |
| Home matches | `/` |
| Scorecard | `/live-cricket-scorecard/:id` |
| Commentary / live state | `/live-cricket-scores/:id` |
| Series fixtures | `/cricket-series/:id/x/matches` |
| Points table | `/cricket-series/:id/x/points-table` |
| Series stats | `/cricket-series/:id/x/stats?statsType=mostRuns` / `mostWickets` |
| ICC rankings | `/cricket-stats/icc-rankings/:gender/:category` |
| Player profile | `/profiles/:id/x` |

## Caching

The cache lives in `lib/cricbuzz/http.ts`. Fresh entries are served immediately; stale entries are served while a refresh runs; if an upstream refresh fails and a stale value exists, the stale value is returned.

## Limitations

- Cricbuzz is an unofficial, HTML/RSC-based source and can change.
- Commentary currently exposes the latest page of balls; historical commentary pagination is not wired.
- Search covers the players/teams/matches/series present in the current crawl, not the entire Cricbuzz database.
- Rankings, player profiles and series stats are cached for longer windows.
- No authentication or write endpoints.
