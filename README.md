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

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS
- Server-side data providers with caching and graceful fallbacks
- Data sources: Cricbuzz and ESPNcricinfo public pages/APIs

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

## Deploy

Deployed on Vercel. `vercel.json` pins the app to the Mumbai (`bom1`) region for low-latency cricket data.

## Disclaimer

This is a demo project. Match data belongs to the respective providers (Cricbuzz, ESPNcricinfo).
