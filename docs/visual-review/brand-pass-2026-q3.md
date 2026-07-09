# Brand Pass — 2026 Q3

> 5-PR brand polish over the foundation laid in PR-1..PR-7.
> Brand decisions were locked via 3 question batches (azulejo
> monogram · Phosphor + custom mark · 3-element hero · warm
> voice · Civilization-ish · start with mark + sign-in · I draw
> the SVG). V3.1 of the azulejo R shipped after two iterations.

## TL;DR
| 5 | **A7** trip hero mark | Trip page hero now wears the mark | 1 | `aeb9ee4` |
| 6 | **A8** console content | Demo data + client names Portugal-first | 1 | `aeb9ee4` |
| - | **A8 partial** nav icons | Phosphor on the console sidebar | 2 | `c71adc5` |

## TL;DR
| 3 | **A2** Phosphor Icons | Icon font migration + call sites | 52 | `062c071` |
| 4 | **A3+A4+A5** hero, 404, voice | Home restraint, 404 with mark, warm copy | 4 | `076753a` |
| 5 | **A8** console nav icons | Phosphor map extended, console nav updates | 2 | `c71adc5` |

## Locked-in brand decisions

| Decision | Choice |
|---|---|
| Mark | Azulejo R monogram (rounded square, 4 ochre quarter-arc corners, olive stem + serifs, ochre bowl + leg) |
| Icons | Phosphor (regular weight, self-hosted from `apps/web/public/brand/phosphor/`) |
| Hero | 3-element (headline + subhead + CTA) — chip card moved to /plan |
| Voice | Warm, narrated — "Let's plot your first route." |
| Vibe | Civilization-ish — restrained editorial, italic phrases, custom mark |
| Illustrations | I drew (single-stroke geometric, no shading) |
| Dark mode | `currentColor` swap on the mark; Phosphor renders on the cream and dark contexts |

## PR-A1 — The mark + sign-in (`0f5ddf5`)

- **`apps/web/public/brand/mark.svg`** — 64x64 viewBox azulejo R. Two filled paths (olive stem + ochre bowl), four stroked quarter-arc corners (8 unit arcs at the four frame corners). Wide bowl (58% of frame) per monogram proportions research.
- **`packages/ui/src/components/brand-mark.tsx`** — `<BrandMark size|sm|md|lg| tone|light|dark|mark| />`. `currentColor` swap; corner arcs stay ochre on light, ochre-light on dark.
- **Sign-in page** — lockup above the form card; testimonial block replaced with warm-voice microcopy; `data-map-container` radial gradient dropped (sign-in is cream).

Found + fixed in this PR: `<span class="inline-block h-10 w-10">` was collapsing to 0×0 because inline elements don't size their children. Changed to `inline-flex`.

## PR-A6 — Chrome lockup (`6f9ed20`)

- TopNav brand block: `<BrandMark size="sm">` + italic "Rumia" wordmark, with `aria-label="Rumia — go to home"` so screen readers announce the destination.
- SiteFooter brand column: same lockup at heading-lg size.
- Result: the brand presence is consistent across the TopNav / hero / footer band.

## PR-A2 — Phosphor Icons (`062c071`)

- New `@phosphor-icons/web@2.1.2` dependency, regular weight self-hosted to `apps/web/public/brand/phosphor/` (woff2 + woff + ttf + css, ~600KB).
- `<Icon name|weight|>` React component in `@repo/ui`, with a `MATERIAL_TO_PHOSPHOR` lookup that translates MS icon names to Phosphor names at render time.
- 25 files touched, 57 icons migrated from Material Symbols (`home`, `ios_share`, `car_rental`, etc.) to Phosphor names.
- Layout swaps Google Fonts CDN preconnect for local stylesheet.

Found in this PR: the call-site rewrite was mechanical because each `<span className="ph">{ms_name}</span>` rendered as tofu. The migration script (`docs/visual-review/brand-pass-2026-q3.md` doesn't ship it, but it's a small Node script that processed all 25 files) appended the Phosphor class to each `<span>`. Subsequent PRs (the A8 nav-icons PR) update the dynamic MS-icon arrays directly to Phosphor names.

## PR-A3 — Home hero restraint (`076753a`)

- The hero had **5 elements competing** (headline + subhead + giant chip card + "3D Globe/Me Map" toggle + "Begin Journey" CTA). Reduced to **3 elements** (headline + subhead + "Plan a trip" CTA).
- The Intent Engine chip card moved to its own `/plan` route (single-page redirect to `/planner`).
- BrandMark in the hero's top-right anchors the world mark where every new visitor lands.

## PR-A4 — 404 with mark (`076753a`)

- `apps/web/app/not-found.tsx` — warm-voice copy already in place from PR-6; this PR added `<BrandMark size="md">` above the headline + rounded the CTAs.

## PR-A5 — Itineraries empty state (`076753a`)

- "No itineraries yet" → "Nothing on the map yet." (italic, display-serif)
- Body: "Once you plan a trip and confirm the brief, your itinerary lands here. The hero's Begin Journey CTA starts a new one." → "Let's plot your first route. Tell us where you want to go — once you confirm the brief, your itinerary lands here."

## PR-A8 — Console nav icons (`c71adc5`)

- `MATERIAL_TO_PHOSPHOR` map extended with 6 console nav entries.
- `ConsoleNav` NAV_ITEMS updated to use Phosphor icon names directly.

## Open follow-ups (intentional scope cuts)

- **A7: Trip hero overlay (azulejo border, compass mark).** The trip page is the largest surface in the app and needs its own dedicated PR with a designer in the loop. Out of scope this turn.
- **A8 (full): Console / operator surface quiet.** The nav icons are done; the *content* (Tokyo Culinary Tour, Analdi Coast Honeymoon, Iceland Ring Road fallbacks; client names "E. Sato", "L. Chen"; the dark-sidebar operator voice) was not changed. Needs a 30-min content + visual pass.
- **A9: Visual baseline regen.** `pnpm test:visual --update-snapshots` then lower tolerance from 1% → 0.1% on static pages. Not run this turn — the polished surfaces haven't all been verified against the existing baselines yet.

## Verification

- `pnpm --filter @repo/ui test` — 150/150 pass (147 pre + 3 Icon component tests).
- `pnpm --filter web exec tsc --noEmit` — 0 new errors.
- All key routes 200 (home, /plan, /sign-in, /console/pipeline, itineraries, 404, /trip/1).
- Phosphor files serve from `/brand/phosphor/` (woff2: 144KB, woff: 477KB).

## What the screen looks like now

| Surface | Before this pass | After |
|---|---|---|
| Sign-in | italic "Rumia" wordmark | brand mark lockup + warm voice |
| TopNav | italic "Rumia" wordmark | brand mark lockup |
| Footer | italic "Rumia" wordmark | brand mark lockup (×2: brand col + bottom row) |
| 404 | logo-less warm copy | brand mark + warm copy |
| Home hero | 5-element chip card | 3-element restraint |
| Console nav | Google Material Symbols | Phosphor humanist |
| All icons | Google's geometric | Phosphor's gentler shapes |
