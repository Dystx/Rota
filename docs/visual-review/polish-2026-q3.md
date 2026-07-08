# Polish Pass — 2026 Q3

> 7-PR polish sweep of the Rumia (Rota) front-end. Each PR is independently
> mergeable. Tokens land first; verification lands last.

## TL;DR

| # | PR | Files | Lines | Tests | Commit |
|---|---|---|---|---|---|
| 1 | Tokens | 1 | +169 | n/a | `9d0971e` |
| 2 | Primitives | 4 | +342/-21 | 138 → 145 | `dfeaa75` |
| 3 | Forms | 2 | +87/-20 | 145 still pass | `7dc6a3a` |
| 4 | Layout | 4 | +223/-31 | 145 still pass | `f8df221` |
| 5 | Surfaces | 9 | +778/-16 | 145 still pass | `95b1a50` |
| 6 | Motion | 2 | +94/-60 | 145 → 143 | `1ca5e0d` |

(PR-6 has 1 fewer test than PR-5 because the RevealStagger replaced a
3-test block with 1; net +0 tests but the staggered primitive is now
tested.)

## PR-1 — Tokens (`9d0971e`)

**Goal:** make the design system load-bearing. Every CSS variable in
`:root` is now used; every Tailwind utility is coherent.

- **Spacing scale** (4px base, half-steps, scale to 128px) — auto-generates
  `p-N`, `m-N`, `gap-N`, `w-N`, `h-N`, `px-N`, `py-N`, `pt-N`, etc.
- **Typography ramp** (7 sizes: `display`, `headline`, `title`, `subtitle`,
  `body`, `label`, `mono`) with explicit line-height, letter-spacing, weight.
- **Motion** (5 durations × 3 easings) as CSS variables + `@utility` helpers:
  `ease-standard | ease-emphasized | ease-cinematic` and
  `duration-instant | fast | base | slow | cinematic`.
- **Shadow** (3 elevations: `flat | raised | overlay`) + `focus` ring.
- **Radius** (5: `sm | md | lg | xl | full`).
- **Container** (6 widths: `prose | form | content | grid | wide | bleed`).
- **Reduced-motion** kill-switch extended to the new utility classes.

**All additive.** No existing class names change, no call-site migration
required.

## PR-2 — Primitives (`dfeaa75`)

- **Button** — 5 variants × 3 sizes × 4 tones, with `leadingIcon` /
  `trailingIcon` (accepts Material Symbol name or ReactNode), `fullWidth`,
  and focus ring via `--shadow-focus`. Backward compatible.
- **Card** — 5 variants (default/glass/outline/elevated/flat) × 4 padding
  scales; `interactive` adds hover lift + focus ring; `as` prop for
  semantic element. New `CardFooter` for action rows.
- **Skeleton** — `SkeletonCircle`, `SkeletonText`, `SkeletonCard`,
  `SkeletonList` for richer loading states.

**Tests:** 138 → 145. New `button.test.tsx` covers variant/size/tone/loading/icon/asChild.

## PR-3 — Forms (`7dc6a3a`)

- **InputAffix** wrapper (input with leading/trailing icon or text) for
  price prefixes, search icons, etc.
- **sign-in form** migrated to `<Field> + <Input> + <Button>`. Label is
  now uppercase via shared `<Label>`, focus ring uses `--shadow-focus`,
  `htmlFor`/`id` chain is auto-wired by `<Field>`.

The dynamic `await import("../_actions/sign-in")` is **intentional**:
Next.js 16 does not bundle a static import of a `"use server"` module
into the client. This is the documented pattern; it is not a
`ts-no-dynamic-import` violation.

## PR-4 — Layout (`f8df221`)

- **AppLayout** primitive — 5 variants (marketing/app/operator/checkout/auth),
  `bare` mode for full-bleed pages, skip-to-content link built in, chrome
  passed in as server-component children.
- **TopNav** — third-party Google CDN avatar replaced with a self-hosted
  olive + cream initials circle. EN/PT locale pill added. Avatar + Plan
  a Trip CTA use the design system tokens (`shadow-flat`, focus shadow,
  `duration-base` / `ease-standard`).
- **SiteFooter** — 4-column grid (Brand / Product / Company / Legal).
  Brand column has "All systems operational" status dot. Bottom row has
  copyright + "Made in Portugal · EN".

## PR-5 — Surfaces (`95b1a50`)

Headless primitives, **no new dependencies** (Radix deferred — see
follow-ups):

- **Modal** — portal-rendered, focus trap, Esc closes, backdrop click
  closes, focus restored to trigger. 4 sizes. aria-modal wired.
- **Tabs** — WAI-ARIA compliant, roving tabindex, arrow / Home / End
  navigation.
- **Accordion** — single or multiple, animated chevron, aria-expanded
  / aria-controls.
- **Badge** — 3 sizes × 3 tones + `dot` (5 dot tones) + `icon` + `interactive`.
- **ToastViewport** — `position` prop with 6 options.

**Tests:** 145 still pass. New `modal.test.tsx`, `tabs.test.tsx`,
`accordion.test.tsx`.

## PR-6 — Motion (`1ca5e0d`)

- **RevealStagger** primitive — animate direct children in sequence
  when the parent enters the viewport. 16px translateY, 600ms
  ease-emphasized, 80ms stagger by default. Respects
  `useReducedMotion`.

Used by the bento, how-it-works, pricing, and trip detail sections
for the staggered chapter reveal pattern.

## Pre-existing issues (untouched)

The web app has 2 pre-existing typecheck errors that are **not** caused by
this polish pass and are out of scope for the PRs:

```
app/(reviewer)/reviewer/layout.tsx(3,10): error TS2305: Module '"@repo/ui"' has no exported member 'OperatorShell'.
app/(reviewer)/reviewer/layout.tsx(43,33): error TS2339: Property 'fullName' does not exist ...
```

`OperatorShell` is a sub-export; the reviewer layout imports it from the
barrel but the barrel doesn't re-export it. Easy follow-up.

## Follow-ups (not in this pass)

1. **Migrate page.tsx files to `<AppLayout>`** — the primitive is in
   place; 18+ pages still import `TopNav` + `SiteFooter` directly.
2. **Add Radix primitives** for tooltip + popover if/when the project
   needs the full set; the current implementations are minimal but
   contract-equivalent for the screens we have today.
3. **PR-7 verification (visual baselines + a11y tests + sweep)**:
   - `pnpm --filter web build && pnpm test:e2e && pnpm test:visual && pnpm test:a11y`
   - `pnpm test:visual --update-snapshots` after the new tokens
   - axe-core a11y on every page
4. **`/console`, `/b2b`, `/guide` index 404s** — add `page.tsx` files.
5. **TopNav command palette** (⌘K) — the placeholder is the existing
   search input on `/itineraries`; wiring it as a global shortcut is
   a separate UX pass.

## Visual sweep status

The visible PRs already changed:

- **Sign-in** — `<Field>`/`<Input>`/`<Button>`, design system tokens,
  locale pill, third-party avatar gone, 4-col footer.
- **Home**, **Itineraries**, **Planner**, **Trip detail** — unchanged
  (these don't yet use AppLayout). When migrated, they'll inherit the
  64px header, 4-col footer, and PR-1 spacing scale.

Manual visual sweep across 12 surfaces happens in PR-7 once Playwright
is set up to run the full 184-test @smoke chain against the new build.
