# Connect Four — Field Research & Niche Validation

> Phase 1 deliverable. Goal: validate the hypothesis that we can ship a Connect Four web app that out-classes the "Великий" tier of the PRD and survives the first 30 seconds of a stranger's attention. Decision needed at the end of this doc: which niche we tilt the build toward.

---

## TL;DR

The Connect Four web is a graveyard of identical 7×6 grids — papergames.io, foony, bloob.io, play4row, silvergames, crazygames, calculators.org, coolmath, playconnectfour.com all ship the same product with cosmetic deltas. **The game itself is mathematically solved** (Allen/Allis 1988, Tromp 1995): perfect first-player play from the center column always wins. That means "make a better Connect Four AI" is a dead lane — the strongest engine has existed for 30 years and is free.

What does *not* exist is a Connect Four product that combines: **(a) a meta-shifting twist that breaks the solved-game ceiling**, **(b) blitz-format competitive identity à la Chess.com**, **(c) a real AI coach that explains why you lost**, **(d) a 3D headline visual that survives a TikTok scroll**, and **(e) a layered freemium economy**. Each of those exists somewhere — none stack in one place for Connect Four.

The .glb model we have is a **material advantage** because every competitor is 2D flat. That alone is a wedge; the question is which niche to pour it into.

**Recommendation:** **Niche A — "Inferno: Blitz Connect Four with a burning board."** Decay mechanic + bullet clock + AI post-game coach + 3D burning board + skin economy. Rationale and alternatives below.

---

## 1. Vertical research — the Connect Four landscape

### 1.1 Who's already there

| Site | What it is | Position | Notable strength | Notable weakness |
|------|-----------|----------|-----------------|------------------|
| **papergames.io** | Casual board games hub (Connect 4 + Tic-Tac-Toe + Gomoku + others), 4.47★ on Play Store, ~1.08M traffic, US #1 desktop | Established generic | Tournaments, daily challenge, mobile app | Ads-dependent, generic UX across all games — no Connect-Four identity |
| **foony.com/games/4-in-a-row-connect** | One-click multiplayer rooms, 6 bot difficulty tiers (Easy → Grandmaster), turn-timer slider from 3s to 60s | Generic | No-account room links, good bot tiering | Brutalist UX, zero brand |
| **play4row.com** | Already has bullet (0.5+0.5, 2+1), blitz (3+0, 3+2, 5+0, 5+3), rapid (10+0, 10+5, 15+10), perfect AI engine, friend-link play | Closest direct competitor | Time controls borrowed from chess, perfect engine for puzzles | Plain UI, no social layer, no monetization story visible |
| **bloob.io/fourinarow** | Friend/bot multiplayer, no account | Generic | Friction-free | Forgettable |
| **buddyboardgames.com/connect4** | Friend code play | Generic | Niche utility | Tiny, dated |
| **CrazyGames / SilverGames / Calculators.org / Coolmath** | Embed-anywhere casual game | Distribution platforms | Massive reach | They host *anyone's* version — not a brand |
| **playconnectfour.com** | Same-device + online multiplayer | Generic | Domain authority | Otherwise generic |

The market is **commodity**. Nobody is the "Chess.com of Connect Four." papergames.io is the closest thing and it's a multi-game site, not a Connect Four destination.

### 1.2 Connect Four is a solved game

- Strongly solved 1988 (independently by James Dow Allen and Victor Allis), fully solved 1995 (John Tromp computed every reachable position).
- **Perfect play from the center column = first-player win.** Any other opening from the first player → draw or second-player win.
- Open-source perfect engines exist (e.g. blog.gamesolver.org, connect4.gamesolver.org).
- **Implication:** competing on "smarter AI" is a dead lane. The intellectual ceiling has been reached. To make the game interesting again we must either (a) change the rules so the solution doesn't apply, or (b) compete on form-factor (speed, beauty, social), not depth.

### 1.3 Existing variants (precedents for rule-bending)

Connect Four has a quiet history of variants — proof that the community accepts deviation:

- **PopOut** (official Hasbro variant): pop a disc out from the bottom of a column.
- **Pop 10**: board starts full, you pop your own discs out; first to set aside 10 wins.
- **Power Up**: tokens grant special actions (remove disc, block column, swap discs).
- **Five-in-a-Row** on the 7×6 grid.
- **Connect Three** (for younger players).

None of these is a *digital* category leader. There is open whitespace for a variant that's designed for short-attention online play and that breaks the perfect-play solution.

### 1.4 Competitive scene

- Ludoteka and Board Game Arena maintain Connect 4 ELO leaderboards. Both tiny.
- Game.tv and Battlefy host community-run "Connect 4: 4 in a Row" tournaments — fragmented across ~200 communities.
- **No dominant competitive home.** The Twitch/esports surface for Connect Four is essentially empty. This is unclaimed territory.

### 1.5 Pain points (extrapolated — there's no rich review corpus for Connect 4 specifically)

Connect Four-specific complaints are thin in the literature because the genre is too commoditized to generate strong feelings. From the generic mobile gaming corpus we can transfer:

- Freezing 76%, crashing 71%, slow responsiveness 59% — the casual web has very low tolerance for technical jank.
- "Too many ads" 53% — every existing Connect 4 site is ad-cluttered.
- The #1 complaint genre-wide is **deceptive billing**. We can win trust by being radically transparent (no dark-pattern subscriptions).
- Mobile-checkout friction: too many clicks, small keyboards. Auth must be one-tap (Google / Apple / passkey) or skippable.

---

## 2. Horizontal research — what works in adjacent markets

### 2.1 Chess.com vs Lichess — the dominant-brand vs free-and-good axis

- **Chess.com**: 150M accounts, 12.5B games played, **$100M+ annual revenue**. Freemium tiers $4.17 / $6.67 / $12.50 per month. Game Review (the AI coach product) is the single most-cited reason hardcore players pay. Recently added celebrity-voiced coaches via ElevenLabs TTS.
- **Lichess**: completely free, donation-funded, open source. 1B games. Beloved by hardcore. Proof that free + excellent scales without ads.
- **Blitz alone is 2M+ games/day on Chess.com.** Bullet is 500k+/day. The fast-format taste in 2026 is the dominant taste.
- **Transferable lesson:** the dominant brand owns the daily-engagement gravity by being (i) fast, (ii) ranked, (iii) social, (iv) coached. The coach is the upsell hook.

### 2.2 Skribbl.io / Gartic.io — casual virality without auth

- Room codes + share-a-link = the *whole* onboarding. No account required. Friends-via-link is the entire growth model.
- Lobby customization (round count, time, custom word lists) drives re-engagement.
- **Transferable lesson:** for casual-first play, account creation must be **opt-in after a successful first session**, not a wall. Friend rooms are the viral surface.

### 2.3 Wordle — the daily puzzle template

- Single puzzle/day = artificial scarcity = ritual.
- **Shareable emoji grid was the actual viral mechanic** — it bragged without spoiling.
- A whole category of games (Connections, Spelling Bee, etc.) has copied the daily-puzzle-plus-emoji-share template.
- **Transferable lesson:** a "Daily Connect 4 puzzle" with a shareable mini-grid result (e.g. 🟡🔴🟡🔴/🔴⬛🟡🔴/...) is a low-cost, high-virality addition. Pure organic acquisition channel.

### 2.4 3D browser games — the visual moat

- Three.js dominates web 3D (270× more downloads than Babylon.js).
- React Three Fiber + @react-three/drei + @react-three/rapier (physics) is the production-ready stack in 2026.
- WebGPU support landed in Three.js r171 (Sept 2025); automatic WebGL2 fallback for older browsers. **One platform reported 100× perf improvement migrating to WebGPU.**
- GLTF/GLB is the format we already have. Loads compactly, supports mesh compression.
- **Transferable lesson:** our .glb is not decoration. It is the differentiator. Every competitor is flat 2D HTML/Canvas. A real 3D board with physical disc drops, lighting, and visual feedback is a 10-second TikTok hook that no competitor can replicate cheaply.

### 2.5 AI coaches — the upsell engine

Chess.com's Game Review v2 sets the template:

- Phase-level grading (opening / middlegame / endgame).
- Move classification: Brilliant / Great / Best / Excellent / Good / Inaccuracy / **Miss** (new) / Mistake / **Blunder** (recalibrated — must drop eval *and* lose material).
- Threat analysis: "you allowed a knight fork on f7".
- Visual coach: arrows + highlighted squares.
- Celebrity-voiced explanations (ElevenLabs TTS).

For Connect 4 we have an enormous unfair advantage: **the game is solved**, which means we have ground truth for every move. Combine perfect-engine ground truth with a Claude Sonnet 4.6 narration layer ($3/M input, $15/M output, 90% off with prompt caching) and we can ship the best post-game coach in the casual board-game category for cents per session.

### 2.6 Skins / battle pass — the dominant monetization model

- Cosmetics generate ~80% of revenue in F2P giants (Fortnite, Roblox, LoL).
- 1-in-3 Gen Z gamers spends $20 on a single skin.
- Battle passes ship $5–$15 with 10–15 tiers and 2–3 week cycles.
- Mobile IAP forecast: **$107B in 2026**.
- The "burning board" idea gives us a *natural* skin slot: the board, the discs, the burn VFX, the impact sound — every visual layer can be re-skinned.

### 2.7 Hybrid casual — the 2026 design pattern

- The mobile game industry is shifting *from* hyper-casual *to* hybrid casual: a 10-second hook + meta-progression + economy.
- Players need a micro-victory every 2–3 minutes.
- Battle passes should be completable in 2–3 weeks at 5 minutes/day.
- **Transferable lesson:** our session length should be 30s–2min (bullet/blitz), with a meta layer (ELO, daily puzzle, weekly battle pass) that gives 5 minutes/day a sense of progress.

### 2.8 TikTok / Shorts virality

- Live gameplay clips dominate game-content discovery in 2026.
- Algorithm rewards completion rate → 7–15s clips win.
- AI auto-cut tools (AutoCut Agent, CapCut) identify viral moments automatically.
- **Transferable lesson:** matches must be short enough to clip whole (≤60s ideal), and the visual climax (burning board, perfect fork resolving in slow-motion) must be auto-detected and exported as an MP4 share with our watermark. Free distribution channel.

### 2.9 Supabase Realtime — the multiplayer backbone

- 2026 architecture: PostgreSQL 17 logical replication + per-message-deflate WebSocket compression, **1M concurrent WebSocket connections per project**.
- Three primitives: Broadcast (client-to-client events), Presence (online state), Postgres Changes (DB sync).
- Turn-based games are a Supabase showcase use case.
- **Transferable lesson:** Supabase Auth + Realtime + Postgres is one platform for auth + DB + multiplayer. No bespoke socket server needed. Right call for our stack.

### 2.10 Edtech / strategic thinking for kids — the long-tail TAM

- Educational games market: $17.34B (2025) → $133B (2035), 22.6% CAGR.
- Kids segment alone: $4.19B (2022) → $20.58B (2030).
- Strategy-game subcategory is the largest and fastest-growing.
- Online chess instruction: $0.27B (2026) → $0.86B (2035), 13% CAGR — and **kids is the fastest-growing segment**.
- **Transferable lesson:** huge TAM, but B2B sale-cycle to schools is slow. A B2C "Connect 4 for kids learning strategy" can ride the chess-for-kids tailwind but won't be as virally explosive as competitive blitz. Better as a *secondary mode* (a "Learn" tab) than the primary product.

---

## 3. The hypothesis (restated for validation)

> We can ship a Connect Four web app that **(a)** breaks past the PRD's "Великий" tier and **(b)** plausibly grows beyond hackathon scope by combining: a novel meta-shifting rule that bypasses the solved-game ceiling + blitz-format identity + AI coach + a 3D headline visual + casual virality + a stacked freemium economy. The .glb model is the visual moat. The decay/burning mechanic is the gameplay moat.

The research **validates** this hypothesis. None of the existing sites do this stack. The pieces (blitz, daily puzzle, AI coach, 3D web, skin economy) are independently proven in other categories.

---

## 4. The market gap (the one-sentence insight)

> **No platform owns the Connect Four daily-engagement layer.** Chess has Chess.com. Sudoku has NYT. Drawing has Skribbl. Word has Wordle. Connect Four has nobody. Whoever invents the meta-shifting variant that makes "perfect play" irrelevant + wraps it in blitz + adds a real coach + makes it beautiful enough to scroll-stop on TikTok takes the layer.

---

## 5. Three candidate niches

### Niche A — **Inferno: Blitz Connect Four with a burning board** ⭐ recommended

**The pitch.** Bullet-speed 1v1 ranked matches on a 3D wooden board that is literally on fire. A burning-coal timer ticks down per move; older discs on the board start to char and disappear after N turns. Decay-mechanic + chess-clock = the perfect-play solution no longer applies, every match is fresh, and the visual is unforgettable.

**Why it wins.**
- Genuinely new mechanic — decay + gravity + blitz on a 7×6 grid is not done elsewhere.
- Solves the solved-game problem cleanly: with decay, the win-from-center proof falls apart.
- The .glb model is *justified* — burning wood demands 3D, particles, glow.
- Maps onto every successful pattern we found: blitz (Chess.com), daily puzzle (Wordle), AI coach (Chess.com Game Review), 3D moat (Three.js), shareable clips (TikTok), skin economy (Fortnite).
- Match length 30s–2min → fits 5-minute-a-day daily-ritual loop and is fully clippable.
- Visual moment (a fork resolving exactly when a piece burns) is naturally viral.

**Monetization stack.**
- Free tier: 5 ranked matches/day, 1 AI coach review/day, daily puzzle.
- Pro $5.99/mo: unlimited ranked, unlimited coach reviews, daily puzzle archive, advanced stats.
- Skin economy: board woods (oak, ebony, marble, neon-glass), disc designs, burn-FX (sparks, embers, holo), impact sounds. $1.99–$7.99 each.
- Seasonal battle pass: $7.99 / 14 tiers / 3-week cycle.
- Stripe checkout, server-side entitlements.

**Risks.**
- Decay mechanic might confuse first-timers → classic 7×6 mode required as on-ramp.
- The novelty is what carries it — if the decay rule isn't *tuned* (how many turns until burn, do both colors burn?), the meta gets boring fast. Needs playtest iteration.
- Visual ambition can blow performance budget on low-end mobile. WebGPU helps but we must measure.

### Niche B — **Salon: Beautiful 3D Connect Four for friends**

**The pitch.** The headliner is the .glb model and the polish — friend-room links, QR codes, classic rules, cinematic camera, ambient music. A coffee-table game for Discord nights.

**Why it could win.**
- Lowest-risk: classic rules, no new mechanic to learn.
- The .glb is still the differentiator vs flat competitors.
- Friend-share virality (Skribbl model) is proven.

**Why it probably doesn't.**
- Doesn't break the solved-game ceiling — competitive depth is shallow.
- Monetization weak (cosmetic skins yes, but no Pro-tier story).
- Doesn't satisfy the PRD's "выделяться на рынке" requirement strongly — it's "prettier than papergames" not "a new category."

### Niche C — **C4 Academy: strategic thinking for kids**

**The pitch.** AI coach is the hero. Gamified curriculum: 30-day strategic-thinking program. Parents pay; kids learn forks, threats, double threats, zugzwang-equivalents on a 7×6 grid before they touch chess.

**Why it could win.**
- Massive TAM ($133B edu games by 2035). Riding the kids-chess tailwind.
- AI coach + perfect engine + solved-game theory is genuinely well-suited to pedagogy.
- B2C subscription ($9.99/mo "Family") has clean unit economics.

**Why it's a slower bet.**
- B2C parent-paid edu has high CAC (paid marketing required, no organic-viral hook).
- Slower to validate — pedagogy claims need user research; "did the kid actually improve" is hard to prove.
- The .glb gets used less — 3D matters less for an edu product than for a competitive/social one.

---

## 6. Recommendation

**Niche A — Inferno: Blitz Connect Four with a burning board.**

Reasoning, sharpest possible:

1. **Differentiation:** the only one of the three that produces a *new genre marker*, not just a better execution of an old one. The PRD explicitly demands this ("создать продукт, который будет выделяться").
2. **Asset fit:** the .glb model is justified, not decoration. Burning wood is the *point*.
3. **Monetization:** the only one with three stacking revenue layers (Pro, skins, battle pass).
4. **Virality:** matches are clip-length, the visual moment is auto-detectable, the daily puzzle ports the Wordle mechanic.
5. **Tech fit:** Supabase Realtime + Next.js + React Three Fiber + Claude Sonnet 4.6 (coach) is a known-good stack we can hit hard in a session.
6. **Defensibility:** decay mechanic + skin economy + ELO ladder + friend graph is a moat. A competitor cloning us has to clone all four to displace us.

Niche C is the better long-term business but the wrong sprint target — it dies of slow B2C edu CAC in the demo phase. We can keep C alive as a future "Learn" tab inside Niche A.

---

## 7. What would kill this (so we know what to watch)

- **Decay-rule unfun:** playtest in first hours of build. If "I had a winning setup then it burned" feels bad rather than dramatic, change to a different twist (e.g., gravity-flip every 6 moves, column-lock powerups).
- **Performance on mobile:** 3D budget must hold on a 2-year-old Android. Measure early; have a `prefers-reduced-motion` / "Lite mode" path with 2D fallback.
- **Latency:** Supabase Realtime is fast but bullet timing is unforgiving. Server-authoritative clock with client prediction; reject moves that arrive after timeout.
- **AI coach cost:** Claude Sonnet 4.6 at $3/$15 per M tokens is cheap with caching but uncapped free-tier coach reviews would bleed. Daily cap (1 free) + Pro unlocks unlimited.
- **The brand can't be "another Connect 4 site."** Naming, art direction, marketing copy must lead with "Inferno" / "burning board" / "blitz." If we ship as "Yet Another Connect 4 With Skins" we've failed.

---

## 8. What we'd build in Phase 2/3 (preview — full plan comes after sign-off)

- **Core:** Next.js 15 / React 19 / React Three Fiber / drei / Tailwind / shadcn-ui / Framer Motion.
- **3D:** load the .glb as the board, GPU-instanced discs, physics-driven drop animation, particle burn FX, WebGPU when available with WebGL2 fallback.
- **Rules engine:** TypeScript, classic mode + Inferno mode (configurable decay turn count + burn order rule).
- **Bot:** open-source perfect engine (bitboard-based, Tromp-style) trimmed for browser, with difficulty knobs (depth limit + random noise for Easy/Medium tiers).
- **Multiplayer:** Supabase Realtime channels per room, server-time-authoritative clock, presence, replay log persisted to Postgres.
- **Auth:** Supabase Auth (Google + Apple + email, no required signup to play vs bot / friend-via-link).
- **AI coach:** Claude Sonnet 4.6 via Anthropic SDK, prompt-cached system prompt, structured-output schema (phase grade + per-move classification + 1-paragraph narration). Free tier 1/day, Pro unlimited.
- **Monetization:** Stripe checkout, server-side entitlement table in Postgres, skin SKUs as JSON manifest, Pro subscription + one-time skin purchases.
- **Daily puzzle:** server picks one position/day from a curated archive, generates shareable emoji grid result.
- **Leaderboards:** global + city (IP-geo) + friends.
- **TikTok export:** Web Codecs API + canvas capture → MP4 download of last match with our watermark.

---

## Sources

### Connect Four landscape (vertical)
- [Rare Pike — 5 Best Sites to Play Connect Four Online Free in 2026](https://rarepike.com/best-sites-to-play-connect-four-online/)
- [papergames.io — Connect 4](https://papergames.io/en/connect4)
- [Foony — 4 in a Row](https://foony.com/games/4-in-a-row-connect)
- [bloob.io — Four in a Row](https://bloob.io/fourinarow)
- [buddyboardgames — Connect 4](https://buddyboardgames.com/connect4)
- [CrazyGames — Connect 4 Online Multiplayer](https://www.crazygames.com/game/4-in-a-row-connected-multiplayer-online)
- [calculators.org — Ad-Free HTML5 Connect Four](https://www.calculators.org/games/connect-4/)
- [SilverGames — Connect 4](https://www.silvergames.com/en/connect-4)
- [playconnectfour.com](https://playconnectfour.com/)
- [play4row.com — Connect Four 2 Player](https://play4row.com/connect-four-2-player)
- [play4row.com — Connect 4 AI Engine](https://play4row.com/connect-4-ai)
- [Tracxn — papergames.io company profile](https://tracxn.com/d/companies/papergamesio/__pJbnOnn91ZjLbdE05PjqFY_Q1YF8WgJWRQy1mPzou5g)
- [Similarweb — papergames.io traffic](https://www.similarweb.com/website/papergames.io/)

### Connect Four solved-game theory
- [Connect Four — Wikipedia](https://en.wikipedia.org/wiki/Connect_Four)
- [Rare Pike — Connect Four & Computers, A Solved Game](https://rarepike.com/four/computer-ai/)
- [Solving Connect 4: how to build a perfect AI](http://blog.gamesolver.org/solving-connect-four/01-introduction/)
- [Connect 4 Solver](https://connect4.gamesolver.org/en/)
- [play4row — Connect Four Solver](https://play4row.com/solver)
- [SiamMandalay — Connect 4 Game Theory Analysis](https://www.siammandalay.com/2024/04/24/connect-4-mathematical-strategy/)
- [Oreate AI — Mastering Connect Four Strategies](https://www.oreateai.com/blog/mastering-connect-four-strategies-to-always-win/a1bc6e31a72d0fbf1a23779e95a1ce4f)

### Connect Four variants
- [UltraBoardGames — Variants for Connect Four](https://www.ultraboardgames.com/connect4/variations.php)
- [SiamMandalay — Connect 4 Rules and Variations](https://www.siammandalay.com/2024/04/24/connext-4-rules-variation/)
- [LoveToKnow — Connect Four Variants](https://www.lovetoknow.com/life/lifestyle/connect-four-games)

### Connect Four competitive scene
- [Ludoteka — Connect 4 Ranking](https://www.ludoteka.com/clasika/rankings?game=connect-4&hizk=en)
- [Board Game Arena — Connect Four Top 3 ELO](https://en.boardgamearena.com/award?game=1186&award=31)
- [Game.tv — Connect 4 Tournaments](https://www.game.tv/find-tournaments/-connect-4:-4-in-a-row-tournaments)

### Chess.com / Lichess (horizontal — monetization & AI coach)
- [Sherwood News — How the Chess.com empire makes more than $100M a year](https://sherwood.news/culture/how-the-chess-com-empire-makes-more-than-usd100m-a-year/)
- [Naavik — Queen's Gambit: The Big Business of Chess.com (podcast)](https://naavik.co/podcast/queens-gambit-the-big-business-of-chess-com/)
- [Theme Circle — Lichess vs Chess.com 2026](https://www.themecircle.net/lichess-vs-chess-com-which-is-better-in-2026/)
- [oldschoolchess — Chess.com vs Lichess 2026](https://oldschoolchess.com/compare/chess-com-vs-lichess)
- [Chess.com — Game Review v2 launch](https://www.chess.com/news/view/chesscom-launches-game-review-v2)
- [GamesBeat — Chess.com celebrity AI coach voices](https://gamesbeat.com/chess-com-will-let-you-choose-your-ai-coach-based-on-celebrity-voices/)
- [Chess.com — Bullet vs Blitz format guide](https://www.chess.com/blog/Kevon-Hazard/bullet-vs-blitz-which-format-suits-you-best)
- [Chess.com — Blitz Live Ratings May 2026](https://www.chess.com/ratings/blitz)
- [oldschoolchess — Blitz Chess Rules & Time Controls 2026](https://oldschoolchess.com/learn/variants/blitz-chess)

### Casual virality & daily-puzzle template
- [Skribbl.io](https://skribbliogame.io/)
- [Gartic.io](https://gartic.io/)
- [Mechanics of Magic — Critical Play: Skribbl.io](https://mechanicsofmagic.com/2022/04/20/critical-play-skribbl-io-5/)
- [Wordle — Wikipedia](https://en.wikipedia.org/wiki/Wordle)
- [Phrazle — History of Wordle](https://phrazle.co.uk/blog/history-of-wordle/)
- [The Geek Insights — How Daily Word Games Became Online Culture](https://thegeekinsights.com/daily-word-games-online-culture/)

### 3D web / React Three Fiber / WebGPU
- [Codrops — React Three Fiber tag](https://tympanus.net/codrops/tag/react-three-fiber/)
- [PkgPulse — Three.js vs R3F vs Babylon.js 2026](https://www.pkgpulse.com/blog/threejs-vs-react-three-fiber-vs-babylonjs-3d-webgl-2026)
- [CreativeDevJobs — R3F vs Three.js 2026](https://www.creativedevjobs.com/blog/react-three-fiber-vs-threejs)
- [Utsubo — What's New in Three.js 2026: WebGPU](https://www.utsubo.com/blog/threejs-2026-what-changed)
- [Utsubo — Migrate Three.js to WebGPU 2026](https://www.utsubo.com/blog/webgpu-threejs-migration-guide)
- [pmndrs — react-three-next starter](https://github.com/pmndrs/react-three-next)
- [Vercel — Build an interactive WebGL experience with Next.js](https://vercel.com/blog/building-an-interactive-webgl-experience-in-next-js)
- [R3F docs — Examples](https://r3f.docs.pmnd.rs/getting-started/examples)

### Monetization, skins, battle pass
- [SQ Magazine — In-Game Purchases Statistics 2026](https://sqmagazine.co.uk/in-game-purchases-statistics/)
- [Meegle — Game Monetization for Skins](https://www.meegle.com/en_us/topics/game-monetization/game-monetization-for-skins)
- [Meegle — Game Monetization for Cosmetics](https://www.meegle.com/en_us/topics/game-monetization/game-monetization-for-cosmetics)
- [Meegle — Game Monetization for Battle Passes](https://www.meegle.com/en_us/topics/game-monetization/game-monetization-for-battle-passes)
- [GameTech Market — Battle Pass approach](https://gametechmarket.com/the-battle-pass-a-successful-monetization-approach-in-the-video-game-industry/)
- [Tekrevol — Fortnite Revenue Breakdown 2026](https://www.tekrevol.com/blogs/fortnite-revenue-usage-statistics/)
- [Hitem3D — Top Game Monetization Models 2026](https://www.hitem3d.ai/blog/Game-Monetization-Strategies-How-to-Make-Money-from-Your-Game-in-2026/)
- [Audiencelab — Mobile Game Monetization 2026](https://audiencelab.ai/blog/mobile-game-monetization-strategies)

### Hyper/hybrid casual design
- [Game Growth Advisor — Hybrid Casual Games 2026](https://gamegrowthadvisor.com/blog/2026-04-16-hybrid-casual-game-design-strategy-2026/)
- [Antier — Hyper Casual vs Hybrid Casual LTV 2026](https://www.antiersolutions.com/blogs/hybrid-casual-games-vs-hypercasual-whats-driving-higher-retention-ltv-and-revenue-in-2026/)
- [Antier — Hyper-Casual for DAU retention](https://www.antiersolutions.com/blogs/how-to-build-hyper-casual-games-that-maintain-daily-active-users-beyond-launch/)
- [Inventive Studio — Hyper Casual Game Development 2026](https://www.inventivestudio.co.uk/what-makes-hyper-casual-game-development-popular-in-2026/)

### TikTok / Shorts virality
- [TechTimes — Viral Gameplay 2026: Why Live Clips Dominate](https://www.techtimes.com/articles/313453/20251218/viral-gameplay-2026-why-live-gaming-clips-dominate-youtube-shorts-tiktok-feeds.htm)
- [CapCut — Top AutoCut agents for TikTok 2026](https://www.capcut.com/resource/top-8-autocut-agent-for-tiktok)

### Supabase Realtime
- [Supabase Realtime architecture docs](https://supabase.com/docs/guides/realtime/architecture)
- [Supabase — Realtime: Multiplayer Edition](https://supabase.com/blog/supabase-realtime-multiplayer-general-availability)
- [Johal — Supabase 2026 Realtime PG17 architecture teardown](https://johal.in/architecture-teardown-supabase-2026-realtime-works-using-postgresql/)
- [DEV — Real-time multiplayer browser game with Supabase + Next.js](https://dev.to/iakabu/i-built-a-real-time-multiplayer-browser-game-with-supabase-nextjs-no-backend-server-required-h28)

### Claude API pricing
- [Claude API Pricing docs](https://platform.claude.com/docs/en/about-claude/pricing)
- [CloudZero — Anthropic Claude API Pricing 2026](https://www.cloudzero.com/blog/claude-api-pricing/)
- [Finout — Anthropic API Pricing 2026: caching, batch, optimization](https://www.finout.io/blog/anthropic-api-pricing)
- [costgoat — Claude API Pricing Calculator May 2026](https://costgoat.com/pricing/claude-api)

### Edu market sizing
- [Verified Market Research — Educational Games Market](https://www.verifiedmarketresearch.com/product/educational-games-market/)
- [Kings Research — Kids Educational Games Market](https://www.kingsresearch.com/kids-educational-games-market-8)
- [Fortune Business Insights — Chess Market](https://www.fortunebusinessinsights.com/chess-market-113098)
- [Business Research Insights — Online Chess Instruction Market](https://www.businessresearchinsights.com/market-reports/online-chess-instruction-and-play-market-102675)
- [market.us — Educational Games Market 22.6% CAGR](https://market.us/report/educational-games-market/)

### Mobile app pain points
- [bigideasdb — Profitable Mobile App Ideas 2026](https://bigideasdb.com/profitable-app-ideas-2026)
- [Yodel Mobile — 3 Ways to Uncover Mobile App Pain Points](https://yodelmobile.com/3-ways-to-uncover-mobile-app-pain-points/)
