# Rumia Frontend Convergence Implementation Plan

> **Archived:** 2026-07-15. This completed convergence queue is retained as
> implementation evidence; the active authority is
> `docs/superpowers/plans/2026-07-15-rumia-frontend-finish.md`.

> **For agentic workers:** Implement task-by-task with a fresh verification checkpoint after each task. Preserve unrelated dirty worktree changes. Do not reset, checkout, or broadly stage the repository.

**Goal:** Converge every Rumia frontend route and state onto the approved activity-first visual system while preserving existing behavior, accessibility, responsive behavior, and product boundaries.

**Architecture:** Keep the current Next.js App Router, React, `@repo/ui`, Tailwind token layer, Motion, Better Auth, commerce, activity content, and MapLibre boundaries. Establish shared visual contracts first, then implement complete route batches. Reuse existing primitives and add a primitive only after at least two routes need the same interface.

**Tech Stack:** TypeScript, Next.js 16 App Router, React 19, Tailwind CSS 4, `@repo/ui`, Motion, Vitest, Playwright, Axe, Better Auth, PostgreSQL/Drizzle contracts, existing local media manifest, and the existing MapLibre adapter.

## Checkpoint status — 2026-07-14

- **Tasks 1–3:** implemented and verified (baseline, shared visual contracts, planner/chosen-day continuity).
- **Tasks 4–6:** current public, quiet, auth, legal, saved-work, commerce, and developer surfaces are implemented and checked against the fresh local production artifact; see [`docs/reviews/2026-07-14-rumia-frontend-convergence-verification.md`](../../reviews/2026-07-14-rumia-frontend-convergence-verification.md).
- **Task 7:** protected behavior and seeded reviewer/admin desktop/mobile visual proof are verified.
- **Task 8:** shared motion/media checks pass; map Phase 2/3 and 3D remain intentionally gated; no homepage dependency was enabled.
- **Task 9:** unit, typecheck, lint, build, motion, asset, diff, accessibility, refreshed visual snapshot, performance, and seeded operator visual checks pass. Map/3D remain a separate deferred capability, not a hidden convergence dependency.
- **Polish follow-up:** the marketing default surface is now warm linen rather than pale sage; the compact grid/contour treatment is intentionally subdued and the exact-artifact visual baselines were refreshed and re-run.
- **Transition polish:** marketing/root loading and offline recovery now resolve to the same linen surface, preventing a pale-sage flash between route states.

The seeded-authenticated browser gate and operator desktop/mobile visual evidence are complete for this checkpoint. Keep the optional map/3D capability separately gated; do not reopen it as a frontend convergence dependency.

## Global Constraints

- Product remains Portugal-wide and activity-first.
- No direct booking, accommodation search, chatbot, live concierge, or paid editorial ranking.
- AI remains a background implementation detail, not a visible product promise.
- Maps remain list-equivalent and contextual; Phase 2/3 map work stays gated until the core journey is stable.
- Use named semantic tokens; do not introduce raw route-specific colours, spacing, shadows, or type values without a documented token.
- Preserve existing URL, auth, persistence, commerce, activity-content, and route contracts unless a task explicitly corrects a documented defect.
- All media remains local and provenance-backed; no hotlinks or unlicensed source reuse.
- Interactive targets are at least 44px and routes remain usable at 200% zoom.
- Test at 1440×1000, 1024×768, 768×1024, and 390×844.
- Reduced motion disables non-essential motion, autoplay, smooth scrolling, camera tours, and parallax.
- Preserve all unrelated dirty files and never use destructive git cleanup.

## Verification commands

Run focused tests during tasks:

```bash
pnpm exec vitest run <test-paths>
pnpm --dir apps/web exec tsc --noEmit -p tsconfig.json
pnpm exec eslint <changed-files>
```

Run the full gate before completion:

```bash
pnpm test:unit
pnpm typecheck
pnpm lint
pnpm build
pnpm qa:motion-gate
pnpm qa:assets
pnpm --dir apps/web test:a11y
pnpm --dir apps/web test:visual
pnpm --dir apps/web test:perf
git diff --check
```

Playwright evidence must be captured against the exact production artifact or
the explicitly identified local review server, never an unknown stale process.

---

### Task 1: Lock the baseline and route ownership

**Files:**

- Modify: `docs/superpowers/PLAN-INDEX.md`
- Modify: `specs/PLAN-AUDIT_LATEST.md`
- Modify: `docs/superpowers/plans/2026-07-14-rumia-frontend-polish.md`
- Create: `docs/reviews/2026-07-14-rumia-frontend-convergence-baseline.md`
- Test/evidence: `output/playwright/full-ui-review-2026-07-14/*`

**Steps:**

- [x] Record the current commit, server command, review URL, dirty-file ownership, font/media manifest, route list, and viewport matrix.
- [x] Mark the new convergence specification as the frontend authority and move the previous closeout interpretation to historical evidence.
- [x] Record the full route ownership matrix for acquisition, chosen-day, saved traveler work, public explanation, legal/recovery, beta, commerce/developer, console, reviewer, and admin surfaces.
- [x] Preserve the existing Playwright screenshots and interaction evidence; do not regenerate unrelated snapshots.
- [x] Run `git diff --check` and verify that no product source changed in this task.

**Acceptance:** The plan index names one active frontend implementation plan, every page route has an owner batch, and a future reviewer can reproduce the exact baseline.

### Task 2: Converge visual tokens and shared primitives

**Files:**

- Modify: `packages/ui/src/styles.css`
- Modify: `apps/web/app/globals.css`
- Modify: `packages/ui/src/index.ts`
- Modify or create focused tests under `packages/ui/src/components/*.test.tsx`
- Modify: `apps/web/app/_components/top-nav.tsx`
- Modify: `apps/web/app/_components/site-footer.tsx`

**Steps:**

- [x] Define semantic typography roles for display, page, section, verdict, lead, body, label, action, metadata, and provenance.
- [x] Define semantic spacing, container, border, shadow, focus, state, judgement, dossier, media-overlay, and utility tokens.
- [x] Replace repeated flat contour fields with route-role hooks that allow Place, Judgement, Dossier, and Utility surfaces.
- [x] Standardize focus, selected, pressed, disabled, loading, success, warning, error, and unavailable states.
- [x] Refine `TopNav` active-state and mobile-sheet behavior without changing navigation destinations.
- [x] Implement full and compact `SiteFooter` variants from the same link arrays. Keep all links and named navigation landmarks in compact mode.
- [x] Add component tests for footer link preservation, mobile/desktop variants, focus labels, and state classes.
- [x] Run focused UI tests, typecheck, and lint for changed files.

**Acceptance:** The shared system can render all required state roles without raw route-specific styling, mobile footer target is ≤440px, and no navigation link disappears.

### Task 3: Fix planner truth and chosen-day continuity

**Files:**

- Modify: `apps/web/app/planner/_components/planner-single-screen.tsx`
- Modify: `apps/web/app/planner/_components/planner-single-screen.test.tsx`
- Modify: `apps/web/app/(marketing)/explore/workspace/activity-workspace.tsx`
- Modify: `apps/web/app/(marketing)/explore/workspace/activity-workspace.test.tsx`
- Modify: `apps/web/app/(marketing)/_components/activity-day-tray.tsx`
- Modify: `apps/web/app/(marketing)/_components/activity-day-tray.test.tsx` if present

**Steps:**

- [x] Write failing tests proving the activity-day planner uses time window, day context, transport, pace, and selected activities rather than destination/day-count trip defaults.
- [x] Write a failing test proving the continuation control returns to an actionable or completed state after navigation and never remains indefinitely disabled.
- [x] Replace the trip-first step labels, default 3/5/7/14-day choices, and “Your trip” summary in the activity-day path.
- [x] Preserve legacy saved-trip editing only where the route is explicitly a saved-trip surface.
- [x] Consolidate duplicate context summaries and duplicate CTAs that navigate to the same place.
- [x] Add explicit pending, success, failure, retry, and route-transition feedback.
- [x] Run focused planner/workspace tests and verify the flow in Playwright at mobile and desktop widths.

**Acceptance:** A traveller can shape a selected activity day, the primary action completes or recovers, and the planner contains no misleading trip-first controls on the activity-day path.

### Task 4: Recompose public acquisition routes

**Files:**

- Modify: `apps/web/app/(marketing)/page.tsx`
- Modify: `apps/web/app/(marketing)/portugal/page.tsx`
- Modify: `apps/web/app/(marketing)/portugal/portugal-atlas.tsx`
- Modify: `apps/web/app/(marketing)/explore/page.tsx`
- Modify: `apps/web/app/(marketing)/explore/activity-explorer.tsx`
- Modify: `apps/web/app/(marketing)/activities/[activityId]/page.tsx`
- Modify: related tests and shared editorial components under `apps/web/app/(marketing)/_components/`

**Steps:**

- [x] Give the homepage one dominant headline, explanation, and intent action; subordinate the field note and metadata rail.
- [x] Keep full-bleed media only where it improves orientation or judgement and preserve poster/reduced-motion fallbacks.
- [x] Vary Portugal card composition and chapter density while preserving Portugal-wide coverage.
- [x] Ensure Explore supports selected-state visibility, multiple-result density, empty states, and clear consequences for save/remove/compare actions.
- [x] Keep activity detail verdict, suitability, time, effort, cost, caveats, nearby pairing, alternative comparison, and chosen-day continuity visible.
- [x] Add visual and accessibility tests for the public acquisition states.
- [x] Capture the reviewed desktop/mobile artifacts and inspect screenshots rather than relying only on snapshot status.

**Acceptance:** The acquisition routes share tokens but are visibly distinct, and each route has one dominant decision without decorative map dependency.

### Task 5: Complete quiet public, auth, legal, and recovery surfaces

**Files:**

- Modify: `apps/web/app/(marketing)/how-it-works/page.tsx`
- Modify: `apps/web/app/(marketing)/pricing/page.tsx`
- Modify: `apps/web/app/(marketing)/local-expertise/page.tsx`
- Modify: `apps/web/app/(marketing)/feedback/page.tsx`
- Modify: `apps/web/app/support/page.tsx`
- Modify: `apps/web/app/sign-in/_components/sign-in-form.tsx`
- Modify: `apps/web/app/sign-in/_components/sign-in-form.test.tsx`
- Modify: `apps/web/app/sustainability/page.tsx`
- Modify: `apps/web/app/privacy/page.tsx`
- Modify: `apps/web/app/terms/page.tsx`
- Modify: `apps/web/app/offline/page.tsx`, `apps/web/app/error.tsx`, `apps/web/app/not-found.tsx`, and loading surfaces as needed

**Steps:**

- [x] Recompose How It Works as an annotated decision sequence with a deliberate closing action.
- [x] Recompose Pricing as a free-first comparison ledger with included, optional, and future states.
- [x] Recompose Local Expertise as evidence plus boundaries, not a generic card grid.
- [x] Recompose Feedback as selected-day context or one concise empty action.
- [x] Recompose Support as task groups and recovery paths rather than equal-weight cards.
- [x] Fix the Sustainability desktop title/content collision.
- [x] Remove duplicate inline/toast sign-in failure feedback while preserving one accessible alert and success/loading states.
- [x] Verify document and recovery pages at desktop, mobile, keyboard, zoom, and reduced-motion settings.

**Acceptance:** Every quiet route is recognizable from an unbranded screenshot, reaches its final action before footer dominance, and has no overlapping content or duplicate feedback.

### Task 6: Align saved work, account, beta, commerce, and developer surfaces

**Files:**

- Modify: `apps/web/app/(app)/account/page.tsx`
- Modify: `apps/web/app/(app)/trip/new/page.tsx`
- Modify: `apps/web/app/vault/page.tsx`
- Modify: `apps/web/app/vault/_components/vault-gallery.tsx`
- Modify: `apps/web/app/itineraries/page.tsx` and export drawer components
- Modify: `apps/web/app/guide/page.tsx`, `apps/web/app/guide/onboarding/page.tsx`
- Modify: `apps/web/app/expert-chat/page.tsx`
- Modify: `apps/web/app/b2b/page.tsx`, `apps/web/app/b2b/[orgSlug]/page.tsx`
- Modify: `apps/web/app/checkout/page.tsx`
- Modify: `apps/web/app/api/v1/docs/page.tsx`
- Modify: related route tests

**Steps:**

- [x] Remove legacy “itinerary” and “trip” language from activity-first surfaces while preserving explicit saved-trip routes.
- [x] Give Vault and empty saved states one authored explanation and one next action.
- [x] Make Guide, Expert Chat, and B2B availability truthful and visibly beta-gated.
- [x] Rebuild checkout copy around real chosen-day commerce states; remove obsolete Core AI/Hybrid Specialist positioning.
- [x] Style API docs as a deliberate developer surface and remove duplicated metadata suffixes or unsafe examples.
- [x] Verify all unavailable, success, cancel, unauthorized, and failure states.

**Acceptance:** Secondary surfaces no longer contradict the activity-first product contract and every unavailable capability has a clear next step.

### Task 7: Converge operator interfaces

**Files:**

- Modify: `apps/web/app/console/**`
- Modify: `apps/web/app/(reviewer)/**`
- Modify: `apps/web/app/(admin)/**`
- Modify: `packages/ui/src/components/operator-shell.tsx`
- Modify: operator loading and shared status components
- Modify: operator Playwright and unit tests

**Steps:**

- [x] Standardize utility surfaces, dense panels, status chips, counts, filters, search, lanes, empty states, and errors.
- [x] Preserve operator scan density while avoiding public marketing styling.
- [x] Verify protected-route behavior and intended public/demo boundaries.
- [x] Add seeded reviewer/admin browser evidence for desktop and mobile.

**Acceptance:** Operator routes are task-oriented, keyboard-safe, responsive, and visually coherent without exposing protected data to signed-out users.

### Task 8: Motion, media, map, and 3D gates

**Files:**

- Modify: `packages/ui/src/components/cinematic-media.tsx`
- Modify: `packages/ui/src/lib/media-preferences.ts`
- Modify: media manifest and tests under `apps/web/content/`
- Modify: `packages/spatial-engine/**` only for approved activity-map phases
- Modify: map capability specs and licensing documentation when gates change
- Modify: relevant Playwright performance and accessibility tests

**Steps:**

- [x] Apply the shared timing model to control, chapter, sheet, and continuity transitions.
- [x] Verify reduced-motion and reduced-data fallbacks for video, scroll reveals, and map camera transitions.
- [x] Pause offscreen video and prevent cinematic downloads on routes that do not use them.
- [ ] Keep Phase 1 map list-equivalent and explicit; do not enable Phase 2/3 until provider, licence, quota, accessibility, and performance gates are approved.
- [ ] Implement Phase 2 camera storytelling only after the core journey is visually accepted.
- [ ] Treat Phase 3 3D as a separate gated feature, never a homepage dependency.

**Acceptance:** Motion improves comprehension, media has provenance and fallbacks, and map/3D never becomes a hidden dependency for recommendation or saved-day use.

### Task 9: Full cross-route verification

**Files:**

- Modify: `apps/web/playwright/tests/accessibility.spec.ts`
- Modify: `apps/web/playwright/tests/visual.spec.ts`
- Modify: `apps/web/playwright/tests/perf.spec.ts`
- Modify: route-specific tests where coverage is missing
- Create: `docs/reviews/2026-07-14-rumia-frontend-convergence-verification.md`

**Steps:**

- [x] Run the full route matrix for signed-out, traveler, reviewer, administrator, empty, loading, error, unavailable, unauthorized, and success states where applicable.
- [x] Run desktop and mobile screenshots at the accepted production review viewports.
- [x] Run Axe/a11y, keyboard focus, reduced-motion, no-overflow, performance, motion, asset provenance, typecheck, lint, unit, and build gates.
- [x] Inspect screenshots for hierarchy, collisions, spacing, background depth, media cropping, footer dominance, and duplicated actions.
- [x] Record failures honestly with route, viewport, evidence path, severity, and owner task.
- [x] Update the plan index only after the evidence supports the corresponding phase completion.

**Acceptance:** No requirement from the convergence specification is claimed complete without direct current evidence. Remaining gaps are explicitly documented rather than hidden behind green narrow tests.

## Execution order

Execute Tasks 1–3 first because shared truth, visual contracts, and planner
scope affect every later route. Execute Tasks 4–7 as vertical route batches.
Execute Task 8 only where its gates are met. Task 9 is the release gate and must
run against the final exact artifact.

## Completion definition

The plan is complete only when all tasks have current evidence, all required
route/state/viewport checks pass, the legacy product language is removed from
visible frontend surfaces, and the owner approves the exact rendered artifact.

## Follow-up visual refinement checkpoint (2026-07-14)

- [x] Replace the last public legacy sage canvas with the warm reading field.
- [x] Add a contained dark editorial lead to the How It Works and Pricing
  chapter openings without darkening their proof, process, or commerce body.
- [x] Restore the bare PageShell gutter/width contract after the chapter
  treatment and reduce the explanatory-page rhythm to avoid dead vertical gaps.
- [x] Add an active-route nav marker and restrained hero/card entrance motion;
  reduced-motion and reduced-data behavior remain explicit.
- [x] Rebuild the exact standalone artifact and refresh desktop/mobile visual
  baselines; 104 passed and 32 skipped.

The next implementation work remains route-specific polish or new evidence.
Map Phase 2/3 and optional 3D remain deferred behind their existing provider,
licence, performance, fallback, and product-acceptance gates.

## Follow-up visual refinement checkpoint (2026-07-15)

- [x] Reframe the empty chosen-day workspace as an intentional dark editorial
  opening state instead of a low-contrast beige placeholder.
- [x] Preserve the activity-first flow, optional map boundary, reduced-motion
  behavior, and existing empty-state actions.
- [x] Rebuild the standalone artifact and capture the exact empty-workspace
  browser proof.
- [x] Run the focused workspace tests (7 passed) and `git diff --check`.

This is a route-specific polish checkpoint. No new redesign plan is needed;
the convergence plan remains the single active frontend queue.

## Route-wide visual redesign checkpoint (2026-07-15)

- [x] Give Support a distinct dark wayfinding hero and numbered topic-card
  composition.
- [x] Turn Pricing into an included/optional/future visual ledger with clear
  contrast and price emphasis.
- [x] Vary the How It Works process cards so the control step reads as a visual
  chapter, not another pale card.
- [x] Add a dark trust rail to the legal document pages without changing their
  semantic reading structure.
- [x] Recheck the homepage, Portugal atlas, explorer, sign-in, and chosen-day
  workspace as rendered visual surfaces.
- [x] Rebuild, capture exact local artifacts, and run route-specific tests plus
  `git diff --check`.

This closes the current route-wide visual pass. Further work should be a
specific art-direction request or new product surface, not another parallel
redesign checklist.

## Cinematic depth and fold-pacing checkpoint (2026-07-15)

- [x] Load the home Portugal field-note media eagerly so the below-fold
  chapter does not render as a blank surface during the first scroll.
- [x] Reduce trailing home how-it-works padding and add an explicit field-note
  marker/framing layer.
- [x] Add locally hosted, provenance-recorded imagery to the Support, How It
  Works, and Pricing hero chapters beneath readable dark overlays.
- [x] Rebuild the exact standalone artifact and capture desktop/mobile proof.
- [x] Run focused route tests and `git diff --check`.

This is the current polish checkpoint inside the same active convergence plan;
it does not reopen a parallel redesign plan.
