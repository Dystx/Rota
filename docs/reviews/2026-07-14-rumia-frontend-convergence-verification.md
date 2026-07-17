# Rumia frontend convergence verification

**Date:** 2026-07-14
**Artifact:** Next.js 16.2.4 production build from the current working tree
**Review server:** `http://127.0.0.1:3321/` (local-only standalone server, started from the freshly rebuilt artifact)
**Evidence directories:** `output/playwright/full-ui-review-2026-07-14/convergence/` and `output/playwright/full-ui-review-2026-07-14/convergence-standalone/`

## What changed in this checkpoint

- Added semantic typography, spacing, border, shadow, and motion roles to the UI token layer.
- Added compact shared footers to public/support surfaces while preserving every link and named navigation landmark.
- Tightened compact-footer mobile geometry to stay within the 440px mobile budget.
- Replaced the planner's indefinite pending state with explicit ready, navigating, continued, error, and retry states.
- Changed planner/workspace language to activity-context and chosen-day language, without altering the saved-trip route contract.
- Removed duplicate sign-in failure toast feedback; the inline accessible alert remains the single error channel.
- Reframed checkout and Vault visible copy around chosen activity days, while preserving backend package values and route contracts.
- Styled the developer API route as a deliberate dossier surface and removed duplicated metadata suffixes on affected routes.
- Replaced the marketing shell's pale sage canvas with a warm linen reading field, lowering the cool grid/contour contrast while retaining the dark cinematic hero and chapter surfaces.
- Aligned the marketing loading skeleton, root loading shell, and offline recovery surface to the same linen field so route transitions and recovery states do not flash the retired sage canvas.
- Preserved map/3D work behind existing capability and licensing gates; no new homepage map dependency was enabled.

## Fresh build evidence

The first build attempt correctly failed because this checkout has no configured `DATABASE_URL`. The successful production build was run with process-only local placeholders (nothing written to `.env`):

```bash
DATABASE_URL='postgresql://rumia_app:local@127.0.0.1:5432/rumia' \
BETTER_AUTH_SECRET='local-build-only-secret-32-chars-minimum-xxxx' \
NEXT_PUBLIC_APP_URL='http://127.0.0.1:3321' \
pnpm build
```

Result: **2 successful tasks**, Next.js compiled, TypeScript passed, 64 static pages generated, and route optimization completed.

The standalone review artifact was then synchronized with the build's generated
`.next/static` output and the full local `public` tree before browser review. This
keeps the exact local server honest: the card derivatives, cinematic media,
favicon, and current Next chunks are all served by `http://127.0.0.1:3321/`.

## Automated gates

| Gate | Result |
| --- | --- |
| `pnpm test:unit` | **PASS** — 180 files, 909 tests |
| `pnpm typecheck` | **PASS** — 15 workspace tasks |
| `pnpm lint` | **PASS** |
| `pnpm build` | **PASS** with process-only local placeholders |
| `pnpm qa:motion-gate` | **PASS** — 466 files, no violations |
| `pnpm qa:assets` | **PASS** |
| `git diff --check` | **PASS** |
| `pnpm --dir apps/web test:a11y` | **PASS** — 63 passed, 1 skipped across desktop/mobile, using a process-only `RUMIA_OWNER_DATABASE_URL` fixture connection; production RLS was not changed |

The Playwright suites share that database-backed global setup. The restricted `rumia_app` URL correctly failed the fixture insert; rerunning with the local owner connection made the accessibility assertions run without changing production roles or policies.

The visual suite initially reported 59 screenshot-baseline mismatches after the approved redesign. The baselines were then regenerated from the reviewed exact artifact; the refreshed suite reports **104 passed, 32 skipped**.

The performance suite initially reported four budget failures because below-fold Portugal card images were loading at their full-resolution source sizes. The card media was then given local, provenance-backed derivatives sized for the rendered cards (`porto-cobblestone-card.webp`, `douro-terraces-card.webp`, and `portugal-coast-card.webp`). After rebuilding the exact standalone artifact, the performance suite reports **16 passed**: home, cinematic media, traveler-route, web-vitals, and analytics-failure checks all pass their budgets.

## Exact-artifact browser evidence

All final checks below were run against the fresh standalone `3321` production artifact, not the pre-existing `3311` server. An earlier `3320` `next start` pass exercised the same build before the final standalone restart.

### Responsive geometry

- At **390×844**, public/support/legal/checkout/Vault compact footers measured **439px**, with `document.body.scrollWidth === 390` (no horizontal overflow).
- At **1440×1000**, the same compact footer measured **422px**, with `document.body.scrollWidth === 1440`.
- Planner, sign-in, API docs, and saved-plan surfaces intentionally omit the marketing footer where their route shell owns the action surface.

### Route matrix

| Route | Result | Key evidence |
| --- | --- | --- |
| `/` | PASS | Activity-first hero; compact footer; Portugal-wide promise |
| `/planner` | PASS | `Plan from the activities you have in mind.`; `Activity context` summary |
| `/sustainability` | PASS | `Sustainability`; compact footer; no desktop title/intro collision |
| `/how-it-works` | PASS | `From a time window to a day worth keeping.` |
| `/sign-in` | PASS | `Sign in`; no duplicate failure channel in source/test coverage |
| `/checkout` | PASS | `Keep shaping this day`; activity brief/refinement copy |
| `/vault` | PASS | `Saved days`; chosen-day language |
| `/api/v1/docs` | PASS | `Rumia API v1`; deliberate developer dossier surface |
| `/trip/new` | PASS | `Give your time a shape.`; metadata has no duplicate product suffix |
| `/support` | PASS | `Find the next useful step.`; compact footer |
| `/privacy` | PASS | `Privacy Policy`; compact footer |
| `/terms` | PASS | `Terms of Service`; compact footer |
| `/portugal` | PASS | `What deserves your time in Portugal?`; Portugal-wide activity atlas |
| `/explore` | PASS | `What deserves this day?`; activity discovery surface |
| `/explore/workspace` | PASS | `Your tentative day`; chosen-day continuity surface |
| `/reviewer/queue` | PASS | Signed-out request redirects to `/sign-in?next=%2Freviewer%2Fqueue` |
| `/admin/analytics` | PASS | Signed-out request redirects to `/sign-in?next=/admin` |

### Planner continuation proof

On `/planner` at mobile width, clicking **Continue with this context** navigated to:

```text
/planner?destination=Portugal&days=7&transport=transit&vibe=balanced
```

The action is no longer left indefinitely disabled; source tests cover navigating, continued, error, and retry states.

### Visual captures inspected

- `home-desktop.png` and `home-mobile.png`
- `portugal-desktop.png` and `portugal-mobile.png`
- `explore-desktop.png` and `explore-mobile.png`
- `workspace-desktop.png` and `workspace-mobile.png`
- `sustainability-desktop.png` and `sustainability-mobile.png`
- `api-v1-docs-desktop.png` and `api-v1-docs-mobile.png`
- `convergence-standalone/home-mobile-final.png` (fresh post-sync browser capture)
- `convergence-standalone/home-mobile-warm-field.png` (fresh post-polish browser capture)
- `convergence-standalone/home-linen-loading-aligned.png` (fresh post-rebuild mobile capture)

The inspected captures show the intended editorial hierarchy, full-bleed media on the acquisition hero only, a warm linen reading field instead of the distracting pale green canvas, deeper dark/green chapter surfaces, structured activity-day cards, and a subdued utility footer. No map or 3D surface is required to understand or complete the core activity journey.

The fresh post-sync browser capture also confirms `body.scrollWidth === 390`, a
439px compact footer at the 390px viewport, and no console errors from missing
media or Next chunks.

## Remaining work and truthful status

- The shared foundation and planner/chosen-day batches are complete for this checkpoint.
- Public acquisition and quiet/commerce/developer routes are implemented and current exact-artifact checked.
- Seeded reviewer/admin visual proof is included in the current Playwright run:
  reviewer/admin storage states rendered their desktop/mobile baselines without
  redirecting to sign-in.
- Map Phase 2/3 and 3D remain intentionally deferred until the generated-plan/activity-day journey and provider/licensing gates are approved.
- Visual baselines were refreshed from the reviewed exact-artifact captures; the old snapshots are no longer the design authority.
- The card derivative optimization is complete and the performance budget gate is green.
- The seeded accessibility gate is complete and visual snapshots were refreshed from the approved exact artifact.
- The convergence route/state evidence is complete for the implemented scope.
  Map Phase 2/3 and the optional 3D surface remain separate deferred
  capabilities with their own provider/licensing gates.

This evidence supports closing the implemented frontend convergence checkpoint
without claiming the deferred map phases are complete.

## Follow-up visual refinement pass — 2026-07-14

The next browser review found that the homepage had the intended cinematic
hierarchy while secondary routes still read as long, low-contrast linen
documents. The shared visual layer was refined without changing the activity-
first interaction model:

- Legacy `rumia-surface-sage` now resolves to the warm reading field instead of
  the former pale mint canvas.
- `/how-it-works` and `/pricing` now open with contained dark editorial chapter
  leads, followed by readable proof rails, process cards, and commerce rows.
- The shared top navigation now has a translucent reading-field treatment,
  clearer active-route marker, and a restrained ochre focus line.
- Public card groups receive short entrance motion and existing reduced-motion
  rules disable it completely.
- The homepage how-it-works chapter has a tighter close and clearer section
  boundaries; the hero remains the primary task surface.

Fresh visual evidence is stored under
`output/playwright/polish-pass-2026-07-14/current/` (`home-final.png`,
`pricing-final.png`, `how-it-works-3.png`). After rebuilding the standalone
artifact, the refreshed visual suite reports **104 passed, 32 skipped** on
desktop/mobile coverage. Typecheck, lint, build, and `git diff --check` also
pass. This is a refinement checkpoint, not a claim that every future art-
direction experiment is complete.

## Follow-up visual refinement pass — 2026-07-15

The next review found one remaining weak state: the empty `/explore/workspace`
surface looked like an unfilled beige card rather than an intentional starting
state. The core route structure was preserved, but the empty-day panel now uses
the same dark editorial chapter language as the intent composer and chapter
close. It has stronger contrast, restrained map-line texture, warmer action
hierarchy, and readable light-field metadata while keeping the day optional and
non-booking.

Fresh evidence: `output/playwright/polish-pass-2026-07-15/explore_workspace-empty-dark.png`.
The focused workspace component suite reports **7 passed**. The production
build passes when supplied with the documented local build placeholders for
`DATABASE_URL`, `BETTER_AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL`; a build with
no environment values still stops at the pre-existing configuration boundary.

## Route-wide visual redesign pass — 2026-07-15

The follow-up review correctly identified that the workspace-only refinement
was too narrow. A route-wide art-direction pass now covers the actual visual
composition of the public surfaces:

- Support opens as a dark wayfinding desk, with numbered topic cards and a
  more deliberate start panel.
- Pricing now has a visual included tier, clearer optional rows, stronger price
  hierarchy, and readable contrast on the dark included surface.
- How It Works now uses a varied process sequence; the third step becomes the
  dark control chapter rather than four identical pale cards.
- Privacy and Terms now use a dark trust rail beside the document body.
- The homepage, Portugal atlas, activity explorer, sign-in, and workspace were
  rechecked as visual compositions rather than only route-correct screens.

Fresh captures are stored under
`output/playwright/polish-pass-2026-07-15/` (`home-final-visual.png`,
`visual-how-it-works.png`, `visual-pricing.png`, `visual-support.png`,
`visual-privacy.png`, `visual-terms.png`, and `visual-explore_workspace.png`).
The rebuilt artifact is serving at `http://127.0.0.1:3321`.

## Cinematic depth and fold-pacing refinement — 2026-07-15

The route-wide review found two remaining presentation defects: the home
editorial chapter could appear as an empty beige band while its below-fold
image was still lazy-loading, and the secondary explanatory/support routes
had visual depth made mostly from gradients. The refinement keeps the same
activity-first product contract while making the visual handoff explicit:

- The home Portugal field-note image is now eager/priority media, so the
  first scroll does not reveal a blank chapter.
- The home how-it-works section has less trailing padding; the full-bleed
  image now supplies the pause instead of dead space.
- Support, How It Works, and Pricing hero panels use locally hosted,
  provenance-recorded Unsplash derivatives beneath the dark editorial
  overlays, with text-safe contrast retained.
- The field-note chapter has a small route marker and cinematic top/bottom
  framing so it reads as a deliberate chapter rather than a detached image.

Fresh proof is stored under
`output/playwright/polish-pass-2026-07-15/updated/` (`home-mobile-priority.png`,
`how-desktop.png`, `pricing-desktop.png`, `support-desktop.png`). The rebuilt
standalone artifact is serving at `http://127.0.0.1:3321`; build and focused
route tests pass.
