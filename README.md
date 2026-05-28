# Inferno

Inferno is Connect Four rebuilt around decay, pressure, and timing.
In classic Connect Four, pieces are permanent. In Inferno, every disc you place has a lifespan: after ten of your own turns, it burns out and the column collapses.

That single rules change is the point of the project.
It turns a solved board game into a shifting tactical arena where plans expire, positions re-open, and "safe" structures can disappear under you.

## What This Project Represents

Inferno started as a design and systems experiment:

- Keep the core readability of Connect Four.
- Introduce volatility without randomness.
- Make every mode feel playable in short sessions.
- Build a game state that is still explainable by an AI coach.

This is not a skin over Connect Four.
It is a different rhythm: less memorization, more adaptation.

## Unique Features

- **Disc decay system:** your discs burn after ten of your turns, forcing tempo-aware play.
- **Three formats:** `Classic`, `Inferno`, and `Inferno Blitz` (decay + clock).
- **3D board presentation:** physically readable columns and collapse moments.
- **Daily puzzle flow:** one tactical prompt per day with shareable result output.
- **Lesson track:** focused tactical drills (win scan, block priority, fork creation, support logic).
- **Room play:** quick friend lobbies via code and QR.
- **Leaderboard and progression hooks:** format-specific competition surface.
- **AI post-game coach:** structured game review and key-move feedback.
- **Cosmetics + Pro path:** optional monetization layer integrated with Stripe.

## Stack

- Next.js 15 (App Router)
- React 19
- Three.js + React Three Fiber
- Supabase
- Prisma
- Stripe
- Zod
- Zustand

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Use the URL printed by the dev server.

Without external keys, local gameplay still works.
Auth, cloud multiplayer, coach backends, and payments activate when the related environment variables are present.

## Build Notes (Vercel + Prisma)

This repo runs Prisma generation during build:

- `postinstall`: `prisma generate`
- `build`: `prisma generate && next build`

That prevents stale Prisma client issues in cached CI environments.

## Status

Private project, still evolving.
