# Inferno — Feature & Monetization Plan

> Phase 2 deliverable. Working title: **Inferno**. Niche locked from `RESEARCH.md`: blitz Connect Four with a burning board. Stack locked: Next.js 15 / R3F / Supabase / Stripe / Claude Sonnet 4.6. This doc converts the niche into a precise rule spec, feature tiers, monetization SKUs, tech architecture, and a sprint order we can execute.
>
> **Sign-off needed at end:** the rule spec (the gameplay moat), the monetization split (free vs Pro), and the sprint order (so we don't ship a half-baked v1).

---

## 1. Brand & positioning

**Working name:** **Inferno.** Backup names if there's a clash: Ember, Pyre, Cinder, Smolder, Char, Burnline, Quattro. Domain + trademark check before launch.

**Tagline candidates:**
- "Drop fast. Burn faster."
- "Bullet Connect Four. Pieces burn. Strategy lives."
- "Four in a row. Ten turns to keep it."

**One-line positioning:** *The Chess.com of Connect Four, on fire, in 90 seconds.*

**Audience:**
- Primary: 16–30, casual-competitive, Twitch/Discord/TikTok-native. Plays Wordle daily, has a Chess.com or Lichess account they touch sometimes, would clip a sick win to a story.
- Secondary: parents who want a strategic brain workout for their kid that's shorter than a chess lesson. Niche C (Academy) lives here as a future "Learn" tab.

**Tone:** confident, a little dangerous, never tryhard. Black + amber + ash. Sound design matters as much as visuals — every drop has a *thunk*, every burn has a *crackle*.

**Brand non-negotiables:**
- **No ads, ever.** Every competitor is ad-cluttered; we're the premium clean alternative. Funded by Pro + skins.
- **No dark patterns.** Free tier is *generous*, not gated to manipulation. Cancellation is one click.
- **Colorblind by default.** Red/yellow is the worst possible palette for color-blindness; we ship pattern overlays from day one, not as an accessibility afterthought.

---

## 2. The Inferno rule (precise spec)

This is the gameplay moat. Every other detail in this plan exists to serve this rule.

### 2.1 The single new rule

> **Every disc lasts exactly 10 of its player's own turns. On the 11th, it burns away. Pieces above it fall by gravity.**

That's it. One sentence, learnable in five seconds, behaves like a new branch of game theory.

### 2.2 Mechanics, fully specified

- **Age counter per disc.** Each disc tracks the number of its own player's turns elapsed since placement. Opponent's turns do not advance your discs' age.
- **Visual age states (the 3D model's job):**
  - Turn 1–6: neutral wood color.
  - Turn 7: faint yellow glow.
  - Turn 8: orange glow + heat shimmer.
  - Turn 9: red glow + smoke wisp.
  - Turn 10: ember (cracking, particle sparks, "this disc burns on my next turn" UI hint).
  - End of turn 10 (start of turn 11): the disc burns away with a particle burst, gravity drops pieces above it.
- **Win condition:** four-in-a-row **at the moment of placement** wins immediately, same as classic. Decay does not retroactively undo wins. (Simpler than "win must persist," and it preserves the dopamine of placement.)
- **No draws.** The board cannot fully fill because of natural turnover. If a 60-turn cap is hit with no winner (extreme outlier), the game is scored on board-area control.
- **Both players' discs age independently** — every disc has its own counter.
- **Gravity after burn:** if disc at row `r`, col `c` burns, pieces above it in column `c` slide down one row. Their age counters are unchanged. (Sliding does not "reset youth.")
- **Chained burns are possible**: a disc placed at turn N can have an above-disc fall into a slot that gives it a 4-in-a-row — counts as a win for whoever placed *the disc that triggered the chain* (i.e. the most recent move), to keep agency clear.

### 2.3 The three formats

We ship three formats. Same 7×6 board, same one rule, different ceilings:

| Format | Decay | Clock | Match length | Notes |
|--------|-------|-------|--------------|-------|
| **Classic** | Off | None | 1–4 min | The on-ramp. Plays exactly like Connect 4 you know. Lets users learn the UX before learning the rule. |
| **Inferno** | On (10-turn) | None | 2–6 min | The headliner. Decay rule, no time pressure. Feels like puzzle chess. |
| **Inferno Blitz** | On (10-turn) | 60s + 1s/move (default), also 30+0 and 3+2 options | 1–2 min | The TikTok format. Decay + bullet clock. Match clip fits in a 60-second reel. |

Default format on first match = **Classic**. Tutorial after the first Classic game offers Inferno as "unlock the meta." Inferno Blitz is gated behind one Inferno game completed (so the new player isn't slammed with two new things at once).

### 2.4 Why this beats the solved-game proof

- Tromp's solution is for a fixed-board no-decay 7×6 game. Adding piece-age expands the state space by a factor proportional to `7×6 × ages_seen`, and the optimal strategy now has to plan around your own setups expiring. The win-from-center proof does not transfer.
- Perfect engines can still be built (it's a finite-state game), but the depth of useful planning is much higher, AI opponents get more interesting tradeoffs, and the meta has texture again.

### 2.5 Playtest gate (kills the build early if needed)

End of Sprint 1, before any backend work: 10 humans play 3 Inferno matches each. Pass condition: ≥7/10 say "I want to play again" and ≥6/10 prefer it over Classic. Fail condition triggers: tune `N` (try 8 or 12) or replace decay with the column-lock-powerup variant from `RESEARCH.md` §5.

---

## 3. Feature tiers

Ordered by build priority. Tier 0 must ship for v1. We do **not** start a tier until the previous one is demo-able.

### Tier 0 — Playable Core (Sprint 1–2, no backend)
- 3D board loaded from `4_gewinnt__connect_four.glb`.
- GPU-instanced discs with drop physics.
- Click/tap a column to drop, with column-hover preview.
- Rules engine: Classic + Inferno + Inferno Blitz.
- Disc age-state visuals + burn particle FX.
- Win detection + winning-line highlight (3D line of light through the 4).
- Pass-and-play same-screen mode.
- Vs-bot mode with 4 tiers (Random / Easy depth-2 / Hard depth-5 / Perfect).
- Light/dark themes.
- Mobile-responsive (touch input, portrait layout).
- Sound design (drop, burn, win, lose, hover).
- Settings: high-contrast mode, pattern overlay, reduced motion, sound on/off, format toggle.

### Tier 1 — Identity (Sprint 3, backend foundation)
- Supabase Auth: Google + Apple + email + **anonymous play** (room link only).
- Match history (DB-backed, replaces local storage).
- Best-move hint (perfect-engine call, debounced).
- Settings persistence across devices.
- Daily puzzle: server picks one curated Inferno position/day, share result as emoji grid (e.g. `🟡🔴🟡🔴 / 🔴⬛🟡🔴` with burn = `⬛`).

### Tier 2 — Multiplayer (Sprint 4)
- Room creation: 6-char code + share-link + QR code.
- Realtime: Supabase Realtime channels per room, Broadcast for moves, Presence for opponent online, Postgres Changes for match record.
- Server-authoritative move validation (Edge Function).
- Bullet/blitz chess clock with server-time sync.
- Friend graph: send/accept requests, friends-only lobby filter.
- In-match reactions (5 emoji, throttled).
- Spectator link (URL with `?view=spectate`).

### Tier 3 — Greatness (Sprint 5)
- ELO rating per format (Classic / Inferno / Inferno Blitz).
- Global leaderboard + city leaderboard (Cloudflare IP geo) + friends leaderboard.
- AI coach: post-match analysis via Claude Sonnet 4.6.
  - Inputs: full move log + perfect-engine ground-truth eval per position.
  - Output: phase grades (opening/midgame/endgame), per-move classification (Brilliant / Best / Good / Inaccuracy / Miss / Blunder), 2-paragraph narration with 1 hero moment + 1 turning point.
  - UI: arrows + highlighted cells on the 3D board synced to coach narration.
- Replay viewer with scrubber.
- Coach narration "personalities" (Free: Cool Analyst. Pro: Hype Friend, Drill Sergeant, Zen Master — different tone, same content).

### Tier 4 — Above-Great (Sprint 6–7, the startup-prototype layer)
- Pro subscription (Stripe Checkout + Customer Portal).
- Skin store with server-side entitlements.
- Battle pass: 3-week seasons, 14 tiers.
- Weekly tournament brackets.
- Replay → MP4 export (Web Codecs API, ~60s clip + Inferno-branded outro card, MP4 with our watermark).
- "Learn" tab — niche C as a secondary mode: 30-day curriculum for strategic-thinking fundamentals (forks, threats, double threats), AI-guided. Free for kids, $4.99/mo Family tier add-on (3 child accounts).

### Cut list (explicit, so it doesn't sneak back in)
- Voice chat — moderation cost too high for a hackathon.
- NFT skins — anti-brand.
- Real-money tournament payouts — regulatory drag.
- Spectator betting / streaks — gambling concerns.
- 3v3 / team modes — dilutes the format.
- Asynchronous correspondence games — boring, slow.

---

## 4. Monetization

### 4.1 The principle

> Free is generous. Pro is *worth it*. Skins are vanity. No ads, no dark patterns.

This is a counter-positioning move: every competitor monetizes via ads (papergames, foony, CrazyGames, SilverGames). We make "the one that isn't ad-cluttered" our brand promise.

### 4.2 Free tier (the on-ramp)

- Unlimited matches vs bot.
- Unlimited matches vs friend (room link / QR).
- **5 ranked matches/day** across all formats.
- **1 AI coach review/day.**
- Daily puzzle today + yesterday accessible. Older archive locked.
- 1 default board skin (the .glb wood), 2 default disc skins (red + yellow with pattern overlays).
- 1 burn FX (default ember).
- All UI features (themes, settings, accessibility, history).

### 4.3 Pro subscription

| Plan | Price | Notes |
|------|-------|-------|
| **Pro Monthly** | $3.99/mo | Stripe Checkout, recurring. (Approved 2026-05-28 — lower than initial $5.99 proposal to widen top-of-funnel.) |
| **Pro Yearly** | $34/yr | ~29% off monthly. Most-popular tag. |
| **Pro Lifetime** | $69 one-time | Limited to first 1,000 users as launch hook. |

Pro unlocks:
- **Unlimited ranked matches.**
- **Unlimited AI coach reviews** + 4 coach personalities.
- **Full daily puzzle archive** + custom puzzle mode (drop you in a saved position).
- **Advanced stats:** move-frequency heatmap, win-rate by opening column, average decay turn at win, etc.
- **20% off all skin store purchases.**
- **Pro badge** in chat / lobby / leaderboard.
- **Early access** to new modes & seasons.

### 4.4 Skin store (one-time, non-recurring)

Server-side entitlements (DB table), client validates before loading skin.

| SKU type | Examples | Price |
|----------|----------|-------|
| **Boards** | Marble, Neon Glass, Volcanic Obsidian, Galaxy Resin, Cyberpunk Steel | $4.99 |
| **Disc sets** | Coin, Gem, Holo, Glyph, Pixel | $1.99 |
| **Burn FX** | Embers (default, free), Lightning, Frost-dissolve, Cherry Blossom, Glitch | $2.99 |
| **Impact SFX packs** | Thunder, Whoosh, Vinyl, Robot, Splash | $0.99 |
| **Themed bundles** | "Volcano" (board + discs + FX themed) | $7.99 (~30% bundle saving) |

Pro members get 20% off all of the above.

### 4.5 Battle Pass

- 3-week seasons (matches Wordle-grade ritual cadence + research-recommended 2–3 week cycle).
- **$7.99 per season**, or 1 free pass/year for Pro Yearly subscribers.
- 14 tiers, ~half free / half pass-only.
- Rewards: skin pieces, coach voice unlocks, avatar frames, profile flair, *one* limited-edition burn FX per season (FOMO mechanic without being predatory).
- XP earned from playing any format. ~5 minutes/day of play = on track.

### 4.6 Tournaments

- **Free weekly bracket:** 32-player single-elimination, all welcome, top-3 get exclusive cosmetic ribbons. No money in or out.
- **Pro-only weekly bracket:** 16-player, Pro subscribers only, prize: a permanent leaderboard "Champion" flair + Battle Pass XP boost. No money in or out. Keeps regulatory drag away.

### 4.7 Unit-economics sanity check

Assume month-30 hypothetical:
- 50,000 MAU. (Modest, achievable with daily puzzle organic + TikTok clip flywheel.)
- 5% pay conversion → 2,500 Pro subscribers + ad-hoc skin buyers.
- 2,500 × $3.99 = ~$10k/mo recurring.
- Skin/battle-pass ARPU on payers ≈ $4 → $10k/mo non-recurring.
- AI coach cost: Sonnet 4.6 at $3/$15 per Mtok, with prompt caching, ~$0.001 per review. Even if 5,000 reviews/day → $5/day → $150/mo. Negligible.
- Supabase + Vercel + Stripe fees: ~$300–$500/mo at this scale.
- **Net at month 30: ~$19k/mo positive.** Hackathon-prototype goal absurdly cleared.

(Numbers illustrative. We will instrument actual conversion / ARPU as soon as Stripe is live and adjust.)

---

## 5. Tech architecture

### 5.1 Stack (confirmed)

| Layer | Pick | Why |
|-------|------|-----|
| **Framework** | Next.js 15 (App Router) | RSC for marketing pages, client islands for the game canvas, edge functions for low-latency game ops. |
| **Language** | TypeScript strict | Rules engine + 3D code both benefit. |
| **UI** | Tailwind CSS + shadcn/ui + Framer Motion + Sonner (toasts) + Lucide icons | Fast, themable, accessible defaults. |
| **3D** | Three.js (r17x with WebGPU) + React Three Fiber + drei + @react-three/rapier | Default web 3D stack in 2026, WebGPU + WebGL2 fallback, physics ready. |
| **Local state** | Zustand | Light, no boilerplate, plays well with R3F. |
| **Server state** | TanStack Query | Cache + invalidation done right. |
| **Backend** | Supabase (Auth + Postgres + Realtime + Storage + Edge Functions) | One platform for auth, DB, multiplayer, file CDN, edge compute. 2026 Realtime supports 1M concurrent WS/project. |
| **Payments** | Stripe (Checkout + Customer Portal + webhooks) | Standard. |
| **AI coach** | Anthropic SDK → Claude Sonnet 4.6, prompt caching on the rules system prompt | $3/$15 per Mtok, 90% off cached. Best price/quality ratio. |
| **Perfect engine** | TS bitboard solver, depth-limited per difficulty, Web Worker | Open-source Tromp-style port. |
| **Analytics** | PostHog (self-hosted-able) | GDPR-clean, free up to 1M events/mo. |
| **Hosting** | Vercel | Edge functions co-locate with users, $0 hobby tier covers launch. |
| **Error tracking** | Sentry | Standard. |

### 5.2 Data model

Postgres schema, RLS-protected. (Sketch — the full DDL is a Sprint 3 task.)

```sql
users                 (id pk, email, display_name, country, city, created_at, is_pro)
entitlements          (user_id fk, sku, granted_at, source)            -- skins + Pro
subscriptions         (user_id fk, stripe_sub_id, status, current_period_end)
matches               (id pk, format, p1_id fk, p2_id fk?, bot_level?,
                       status, started_at, ended_at, winner_id fk?,
                       moves jsonb, replay jsonb, time_control jsonb)
elo_ratings           (user_id fk, format, rating, games_played, last_updated, primary key(user_id, format))
friends               (a_user_id fk, b_user_id fk, status, created_at, primary key(a_user_id, b_user_id))
friend_requests       (from_user_id fk, to_user_id fk, status, created_at)
rooms                 (id pk, code uq, host_id fk, format, settings jsonb, status, created_at)
puzzles               (date pk, position jsonb, solution jsonb, difficulty)
puzzle_attempts       (user_id fk, puzzle_date fk, solved_at, moves_taken, shareable_grid)
coach_reviews         (id pk, match_id fk, user_id fk, generated_at, persona, content jsonb)
skins                 (sku pk, kind, name, price_cents, asset_url, metadata jsonb)
battle_passes         (season pk, start_at, end_at, theme jsonb)
battle_pass_progress  (user_id fk, season fk, xp, tier_claimed_through, has_premium, primary key(user_id, season))
tournaments           (id pk, season, kind, scheduled_at, status, bracket jsonb)
tournament_entries    (tournament_id fk, user_id fk, seed, eliminated_at, primary key(tournament_id, user_id))
```

### 5.3 Realtime channels

- `room:{room_code}` — broadcast: moves, clock-tick, chat. Presence: who's online.
- `presence:user:{user_id}` — friend-online tracking.
- `daily-puzzle` — global broadcast for "X just solved today's puzzle" social proof on the lobby.

### 5.4 AI coach pipeline

1. On match end, client POSTs match log to `/api/coach/review` Edge Function.
2. Function checks user entitlement (free: 1/day, Pro: unlimited) and rate limits.
3. For each move, function queries the perfect-engine ground truth (eval delta).
4. Function builds Claude prompt: cached system prompt with rules + persona, user prompt with structured move log + evals.
5. Claude returns JSON: `{phase_grades: {...}, moves: [{turn, classification, narration}], hero_moment: {turn, why}, turning_point: {turn, why}, summary: "..."}`.
6. Persist to `coach_reviews`. Stream narration to client.
7. Client renders narration synced to 3D board cues (arrows, glow on cells).

### 5.5 Anti-cheat

- All ranked moves validated server-side (Edge Function reads room state, validates legal move, applies clock).
- Sequence numbers on moves; out-of-order rejected.
- Reasonable-move-time bounds: <50ms claims rejected as automation suspect; auto-shadowbans don't fire on first offense, only on pattern.
- Perfect-engine match-rate over a player's last N moves flagged for review (above threshold → human review queue).

### 5.6 Accessibility & i18n

- **Color:** discs never rely solely on red/yellow — pattern overlays from day one (e.g. circle vs square fill pattern, configurable). High-contrast mode swaps in white/black with patterns.
- **Motion:** `prefers-reduced-motion` → cuts particle FX, slows tweens, disables camera shake.
- **Screen reader:** ARIA live region announces moves ("Yellow drops in column 4. Red wins on next move."), keyboard navigation (1–7 keys = column drop).
- **i18n:** strings extracted to `messages/en.json` from day one. RU ships at launch (PRD is RU; user is bilingual). DE, ES, PT, FR added if traffic warrants.

### 5.7 Privacy / GDPR

- Anonymous play requires no PII.
- Account play: email + optional display name + optional country/city (for leaderboards). Country/city is opt-in.
- Data export + delete-account self-serve in Settings.
- Cookie banner only for analytics consent (functional cookies don't need it under GDPR).

---

## 6. Phased build order

We split Phase 3 into seven sprints. Each sprint ends with a working demo. We do not start the next until the current is demo-able.

| Sprint | Theme | Deliverable | Gate |
|--------|-------|-------------|------|
| **S1** | Playable core, no backend | 3D board with `.glb`, rules engine, classic + Inferno + Inferno Blitz, pass-and-play, vs-bot, mobile-responsive, sound design, settings, themes. | **Playtest gate:** 10 humans, 3 Inferno matches each. ≥7/10 want to play again. |
| **S2** | Solo polish | Bot difficulty tiers, hint, win line, local match history, win/lose celebrations. | Feels good solo, smooth on mid-range Android. |
| **S3** | Backend foundation | Supabase Auth + DB + RLS, match-history server-side, daily puzzle with shareable emoji grid. | Auth works, daily puzzle ships, match history syncs. |
| **S4** | Multiplayer | Rooms, share-link/QR, Realtime channels, server-authoritative clock, friend graph, in-match reactions. | Two devices on different networks play a Blitz match end-to-end with <100ms median move confirm. |
| **S5** | Greatness | ELO, leaderboards (global/city/friends), AI coach with Claude, replay viewer, coach personas. | Coach narration is *actually useful* to a real player (qualitative test). |
| **S6** | Monetization | Stripe + Pro + skin store + battle pass + replay→MP4 export. | One real payment goes through end-to-end. Skin entitlement loads correctly on next match. |
| **S7** | Tournaments + Academy | Weekly bracket scheduler + Learn tab (Niche C secondary). | A weekly bracket runs to completion. Learn tab teaches one concept (forks) with the AI. |

**v1 = S1+S2.** Demo-ready, no backend, all the wow.
**v2 = +S3+S4+S5.** Real product.
**v3 = +S6+S7.** Startup-prototype.

Given a hackathon timeline I'd target **v1 by end-of-day**, **v2 over a weekend**, **v3 over a week**. We can negotiate the cut-off when we get to Phase 3.

---

## 7. Risks & mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Decay rule isn't fun in playtest | **High** | Sprint 1 playtest gate (10 humans). Tune `N` (8/10/12). Fallback to powerup variant from `RESEARCH.md` §1.3. |
| 3D performance on low-end mobile | **High** | Measure on iPhone SE-ish + mid-range Android in S1. WebGPU first, WebGL2 fallback, instanced meshes, "Lite mode" toggle (LOD swap or 2D fallback). |
| Bullet timing latency feels bad | **High** | Server-authoritative clock with client prediction. Reject late moves > tolerance. Display "ping" indicator. Target <100ms median. |
| Coach narration is bland or wrong | **Medium** | Anchor every claim with a ground-truth perfect-engine eval. If the engine doesn't see a Brilliant, the coach doesn't say one. |
| AI coach API cost balloons | **Low** | Prompt caching (~90% savings). Free tier 1/day. Pro pays the bill. |
| "Inferno" name conflict | **Low** | Trademark + domain check in S1. Backup names listed §1. |
| User confusion: too many modes | **Medium** | Default = Classic. Inferno unlocked after first Classic finish. Inferno Blitz unlocked after first Inferno finish. |
| Anti-cheat false positives ban good players | **Medium** | Soft flags + human review queue, no first-offense ban. Transparent appeals. |
| Hackathon scope creep | **High** | Sprint order is the contract. Cut-list above is enforced. v1 is S1+S2 *only*. |
| Decay + colorblind = unreadable | **Medium** | Patterns + glow + age numbers on hover, all from S1. |

---

## 8. Success metrics

Hypothetical, but they're what we'd watch:

| Metric | v1 (post-demo) | v2 (post-launch) | v3 (month 3) |
|--------|---------------|------------------|--------------|
| Unique players | 50 | 5k | 50k |
| Avg matches per user per session | 2 | 3.5 | 4 |
| D1 retention | n/a | 35% | 40% |
| D7 retention | n/a | 12% | 17% |
| Daily puzzle shares per active user | n/a | 0.2 | 0.4 |
| Pro conversion (of MAU) | n/a | 2% | 5% |
| ARPU (overall) | n/a | $0.20 | $0.50 |
| Median latency (move confirm) | n/a | <150ms | <80ms |
| Coach narration "useful" rating | n/a | 70% | 80% |

---

## 9. Visual identity sketch (working direction)

- **Palette:** Charcoal `#0E0F12` base, Ember `#FF5722` accent, Ash `#9CA3AF` neutrals, Wood `#7A4A1F` warmth from the .glb. Burn states: Yellow `#F2C94C` → Orange `#F2994A` → Red `#EB5757` → Ember `#FF5722` with glow.
- **Typography:** Geist or Inter for UI; a single display weight (e.g. Anybody / Boldonse) for the wordmark and big win states.
- **Motion language:** drops are physical (rapier), burns are theatrical (slow-mo on win, particles linger). Camera is mostly static; occasional dolly-in on critical moments.
- **Sound:** every move has a *thunk*, every burn has a *crackle*, every win has a custom 1-second sting (Pro = unlock more stings).
- **UI density:** minimal chrome. Lobby is a hero shot of the 3D board. Settings hidden behind a single gear. Score + clock are the only persistent overlays in-match.

---

## 10. Open decisions for sign-off

Before I write a single line of code, I want explicit yes/no on three things:

1. **The rule.** "Every disc lasts 10 of its player's own turns, then burns away, gravity drops pieces above." Yes / tune `N` / replace with powerup variant / replace with something else you want.
2. **Free vs Pro split.** Free = 5 ranked/day + 1 coach review/day. Pro = unlimited + advanced stats + 20% skin discount, **$3.99/mo** (locked 2026-05-28). Yes / loosen free / tighten free / different price.
3. **Sprint cut-off for "demo."** Where do we stop for the first showable artifact?
   - **v1 (S1+S2):** Local 3D playable, no backend. Fastest path to "wow."
   - **v2 (S1–S5):** Auth + multiplayer + coach + daily puzzle. Real product.
   - **v3 (S1–S7):** Full monetization + tournaments + Academy. Startup prototype.

**Locked 2026-05-28: target = v3 (S1–S7). Full startup-prototype build.** Multi-session work; external services (Supabase, Stripe, Anthropic) wired with real keys if user provides them, otherwise scaffolded with placeholders and clear setup docs.
