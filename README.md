# Chauka — Live Cricket, Beautifully

A fast, mobile-first cricket live score and stats experience. Built with Next.js, TypeScript and Tailwind CSS.

## Features

- Live, upcoming and completed match feed with auto-refresh
- Ball-by-ball commentary, live scorecards and win probability
- Series pages with fixtures, points tables and tournament stats
- ICC rankings (men/women, batting/bowling/all-rounder/teams)
- Player profiles with career stats and recent form
- Follow teams, share matches, installable PWA
- Dark/light themes with a mobile bottom nav

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS
- Server-side data providers with caching and graceful fallbacks
- Data source: Cricbuzz public pages/APIs

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run dev        # start dev server
npm run build      # production build
npm run start      # run production build
npm run lint       # lint
npm run typecheck  # type-check
```

## Routes

- `/` — live, upcoming and completed matches
- `/match/:id` — scorecard, commentary, squads and match info
- `/series` and `/series/:id` — schedules, points tables and stats
- `/rankings` — ICC men's and women's rankings
- `/players/:id` — player profiles and career stats
- `/teams/:id` — team matches and series
- `/search` — players, teams, matches and series

## API

See [`docs/API.md`](docs/API.md).

## Deploy

Deployed on Vercel. `vercel.json` pins the app to the Mumbai (`bom1`) region for low-latency cricket data.

## Disclaimer

This is a demo project. Match data belongs to the respective providers (Cricbuzz, ESPNcricinfo).
