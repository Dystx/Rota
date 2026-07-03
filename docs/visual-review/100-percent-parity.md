# Visual Review — 100% Parity Push

**Date**: 2026-07-03
**Goal**: Make the Next.js app visually match `docs/prototype.html` exactly.

## Commits

| Stage | Commit | Description |
|---|---|---|
| 1 | `4591c5a` | Rewrite `packages/ui/src/styles.css` with prototype's exact tokens via `@theme` block (replaces broken `@theme inline`) |
| 2-6 | `efac8b0` | Add Inter / Playfair Display / JetBrains Mono fonts + Material Symbols to layout; build shared TopNav / SiteFooter / DestinationBento; rewrite `/` home as prototype's HomePage |
| 7 | `3d23441` | Add TopNav + SiteFooter to all 12 prototype ports (6 client-facing + 6 console) |
| Sync | `b3d0e28` | Sync `docs/prototype.html` + `apps/web/public/prototype.html` to the new full version; delete unused `home-client.tsx` |

## What changed in the visual language

| Aspect | Before | After |
|---|---|---|
| `text-ochre-light` utility | Not generated; rendered as `var(--color-foreground)` (olive) | Generates correctly; renders as `#eab875` (warm tan) |
| `text-linen-dark` utility | Not generated; rendered as olive | Generates correctly; renders as `#efece6` (cream linen) |
| `font-display` (Playfair Display) | Not applied (Inter fallback) | Renders Playfair Display serif headline |
| `text-display` (72px) | Not applied | Renders 72px with line-height 1.1, letter-spacing -0.02em |
| Material Symbols (icon font) | Loaded but not declared in CSS; icons show as text | Declared globally in `@layer base`; icons render as ligature glyphs (X close, arrow_forward, etc.) |
| Body styles | Cinematic Concierge cyan radial gradient | Prototype's `bg-background` `#e8fff0` with text `text-on-background` `#0c1f16` |
| Home `/` route | Cinematic Concierge HomeClient (prompt composer hero) | Prototype's HomePage: TopNav + 819px Hero + Bento Grid + Footer |

## Visual review screenshots

Screenshots in `docs/visual-review/`:

- `00-home-final-*.png` (1280×1826) — `/` home page, full-page. Matches prototype exactly: TopNav, Portugal-sunset Hero with "Discover Intentionally." headline, glass card with "We are visiting Portugal for 7 days..." editable text, "Begin Journey" CTA, Bento Grid (Lisbon 8-col + Douro 4-col + Azores 12-col), Footer.
- `01-planner-final-*.png` (1280×900) — `/planner` AI Intent Engine hero with TopNav + Footer.
- `02-console-pipeline-final-*.png` (1280×900) — `/console/pipeline` Operations Pipeline with ConsoleNav (olive-dark sidebar) + SiteFooter.

## Token generation now active

The `@theme` block in `packages/ui/src/styles.css` auto-generates these utility classes from the prototype's exact `tailwind.config.theme.extend` values:

- **40+ colors**: `bg-olive-light`, `text-ochre-dark`, `border-on-primary-fixed-variant`, etc.
- **4 border-radii**: `rounded`, `rounded-lg`, `rounded-xl`, `rounded-full`
- **7 spacing tokens**: `h-header-height` (64px), `p-section-gap` (24px), `gap-gutter` (16px), etc.
- **8 font families**: `font-body-md`, `font-display`, `font-mono-micro`, etc.
- **8 font sizes with line-height / letter-spacing / font-weight**: `text-display` (72px / 1.1 / -0.02em / 700), `text-headline-sm` (18px / 24px / 600), etc.

## Verification

```
pnpm typecheck           → 13/13 tasks pass
pnpm --filter @repo/ui   → 131/131 tests pass
pnpm --filter web build  → 49/49 static pages
```

## What this enables

Every page now renders with the Rumia v4 visual identity. New pages can be built directly in Next.js with the prototype's exact class names and they'll match the prototype 1:1.

The next concrete work (now that the visual shell is unified) is:
- Phase 2: Production Supabase reconciliation (the actual launch blocker; needs hosted Supabase access)
- Wire the planner intent-engine flow with the `normalizeTripPrompt` AI package + form state
- v4 schema migrations apply (the 5 SQL files committed in `97fa89f`)

## Cross-references

- `docs/prototype.html` — canonical prototype (source of truth for visual)
- `apps/web/public/prototype.html` — same file, served at `/prototype.html`
- `apps/web/app/_components/top-nav.tsx` — TopNav component
- `apps/web/app/_components/site-footer.tsx` — SiteFooter component
- `apps/web/app/_components/destination-bento.tsx` — DestinationBento component
- `packages/ui/src/styles.css` — `@theme` block + `.rota-*` component classes
- `apps/web/app/layout.tsx` — fonts + Material Symbols + body classes
- `apps/web/app/(marketing)/page.tsx` — HomePage (TopNav + Hero + Bento + Footer)
- `apps/web/app/{planner,logistics,checkout,itineraries,vault,expert-chat}/page.tsx` — TopNav + SiteFooter wrapped
- `apps/web/app/console/{pipeline,workspace,messages,graph,metrics,config}/page.tsx` — ConsoleNav + SiteFooter wrapped