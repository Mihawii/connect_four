# Inferno — Design System

The visual language: **editorial risograph**. Warm paper, heavy ink, one hot accent used as punch. Flat color, bold borders, generous air, big confident type. Premium indie toy, not a dark fire terminal.

## Color (OKLCH, never #000/#fff, no gradients)

Color strategy: **Committed.** Paper + ink carry the surface; ember is the deliberate hot accent; gold is the second player / highlight. Two-color "riso" feel.

### Light (default — the endorsed cream/editorial direction)
- `--paper` background: `oklch(0.962 0.013 83)` — warm bone
- `--paper-2` raised surface: `oklch(0.938 0.016 80)`
- `--ink` foreground: `oklch(0.205 0.018 55)` — warm near-black
- `--ink-soft` muted text: `oklch(0.46 0.02 60)`
- `--line` borders: `oklch(0.205 0.018 55)` (bold) / `oklch(0.86 0.014 80)` (hairline)
- `--ember` accent / player 1: `oklch(0.605 0.214 32)` — vermillion
- `--ember-ink` text-on-ember: `oklch(0.205 0.02 40)`
- `--gold` player 2 / highlight: `oklch(0.83 0.158 86)` — warm marigold
- `--coal` deep stage (3D board bg, footers): `oklch(0.235 0.016 55)`

### Dark (refined — warm near-black, NOT muddy brown)
- `--paper`: `oklch(0.185 0.012 60)`
- `--paper-2`: `oklch(0.225 0.014 58)`
- `--ink`: `oklch(0.955 0.01 85)`
- `--ink-soft`: `oklch(0.68 0.018 75)`
- `--line`: `oklch(0.32 0.016 60)` / hairline `oklch(0.28 0.014 60)`
- `--ember`: `oklch(0.66 0.221 35)`
- `--gold`: `oklch(0.84 0.16 88)`
- `--coal`: `oklch(0.145 0.01 60)`

Accessibility: discs never rely on hue alone. Ember (P1) = solid fill, no inner ring. Gold (P2) = solid fill + concentric inner ring. High-contrast mode thickens borders + adds patterns.

## Typography

- **Display:** Bricolage Grotesque (700–800), tight tracking, big. Headlines, the wordmark, score states. Variable, characterful, editorial.
- **Body / UI:** Geist Sans. Clean, neutral, lets the display carry personality.
- **Numeric / system:** Geist Mono. Clocks, ratings, stats, room codes, the "10 turns" rule.
- Scale ratio ≥1.25. Hero uses big clamp() display. Body capped 65–75ch.

## Shape, border, elevation

- **Borders do the work.** 1.5px ink borders on primary cards/buttons; hairline on secondary dividers. Editorial, crisp.
- **Hard offset shadow** (riso sticker): `4px 4px 0 var(--ink)` on primary buttons + the hero board frame, NOT soft blur. Used sparingly.
- Radius: `--radius: 0.5rem` base; pills (full) for tags/toggles; the board frame is squarer.
- **No** soft drop shadows everywhere, **no** glass blur, **no** gradients. Flat fills only.

## Iconography

- **Phosphor Icons** (`@phosphor-icons/react`), weight **bold** (UI) / **duotone** (feature highlights). Deliberate, characterful, not the lucide default. Consistent weight per context.
- Custom SVG marks for brand: the wordmark flame, the spinning loader badge, disc tokens.

## Motion

- **GSAP** drives the entry loader (rotating mark → clip-path reveal → spinning badge), and the falling disc-token mouse trail during load.
- UI micro-motion via `motion/react`: ease-out-expo, 200–450ms, no bounce (loader badge may use a single restrained `back.out`).
- Respect `prefers-reduced-motion`: loader collapses to a quick fade; trail + spin disabled.

## The board (3D)

- Board frame: solid matte `--coal` (or ember in a "hot" skin), crisp cylindrical slots, soft single contact shadow. Reads as a physical object on a paper table.
- Discs: matte solid ember (P1) / gold (P2) with a subtle bevel + concentric ring on gold for colorblind safety. No emissive glow soup.
- Aging: disc darkens toward charcoal and grows a thin ember-lit crack as it nears turn 10; at burn it fractures into a short ember-particle burst (the one place fire glows).
- Stage background: flat `--paper` (light) / `--coal` (dark), optional subtle film grain. No gradient.

## Layout

- Generous margins, asymmetric rhythm. The play screen is board-first: board is the hero, controls are a calm rail, not competing boxes.
- Avoid identical card grids; vary sizes and let some content breathe without a container.
