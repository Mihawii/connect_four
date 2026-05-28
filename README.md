# Inferno

Blitz Connect Four with a burning board. Every disc lasts 10 of its player's own turns; on the 11th it burns away and gravity drops pieces above it. Three formats: Classic, Inferno, Inferno Blitz.

Built on Next.js 15, React Three Fiber, Supabase, Stripe, Claude Sonnet 4.6.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in keys as you stand up services
npm run dev
```

Open http://localhost:3000. Local play (Classic + Inferno + Inferno Blitz, pass-and-play and vs-bot) works with zero env vars set. Auth, multiplayer, coach, payments come online as you fill in `.env.local`.

## What's in here

- `RESEARCH.md` — Phase 1: market research, niche validation, 60+ sources.
- `PLAN.md` — Phase 2: rule spec, feature tiers, monetization model, tech architecture, sprint order.
- `src/lib/engine/` — pure-TS rules engine (Classic + Inferno) and bitboard solver.
- `src/components/game/` — 3D board, discs, FX, HUD.
- `src/app/` — Next.js routes.
- `supabase/migrations/` — Postgres schema (apply with `supabase db push` or paste into the SQL editor).
- `supabase/functions/` — Edge Functions (deploy with `supabase functions deploy`).

## Setup paths

| You want | Set | Notes |
|----------|-----|-------|
| Local play only | nothing | Works out of the box. |
| Auth + match history + daily puzzle | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Create a Supabase project, apply `supabase/migrations/0001_init.sql`. |
| Multiplayer | same as above | Realtime is included with any Supabase project. |
| AI coach | `ANTHROPIC_API_KEY` | Coach uses prompt caching; ~$0.001/review. |
| Payments / Pro / skins | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs | Use Stripe test mode while developing. |

## Scripts

```bash
npm run dev        # local dev with turbopack
npm run build      # production build
npm run start      # serve production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## License

Private / unreleased.
