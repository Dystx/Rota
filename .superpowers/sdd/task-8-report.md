# Task 8 report — distinct trust, acquisition, support, and feedback routes

Status: DONE_WITH_CONCERNS

## Implementation

- Replaced the coupled How It Works/Pricing opening template with route-owned
  compositions: a four-chapter How It Works sequence and a texture-free
  free-first Pricing ledger with a visible local Douro still.
- Added Local Expertise field-note evidence, reviewer checks, explicit
  boundaries, turnaround expectations, and one review-access action.
- Reworked Support into four disclosure-based recovery groups with response
  and escalation boundaries; utility footer chrome is used for the route.
- Added selected-day context and privacy copy to Feedback, preserved 44px
  rating controls, and exposed provider failures as retryable alert state
  without losing the selected rating.
- Added focused route/form tests for chapter order, pricing hierarchy,
  expertise boundaries/turnaround, support disclosures, and feedback success/
  failure behavior.

## Verification

- `corepack pnpm exec vitest run 'apps/web/app/(marketing)/how-it-works/page.test.tsx' 'apps/web/app/(marketing)/pricing/page.test.tsx' 'apps/web/app/(marketing)/local-expertise/page.test.tsx' 'apps/web/app/support/page.test.tsx' 'apps/web/app/(marketing)/feedback/activity-feedback-form.test.tsx' --no-file-parallelism --maxWorkers=1 --reporter=dot` — PASS, 5 files / 8 tests.
- `corepack pnpm --dir apps/web typecheck` — PASS.
- `corepack pnpm lint:eslint` — PASS.
- `git diff --cached --check` — PASS.

## TDD evidence

The focused route tests were present as the red test-first contract when the
delegated workers stopped responding; the final local bounded run is the green
verification above. No browser run was attempted because the known Next/
Turbopack memory incident makes an unconstrained development server unsafe in
this dirty checkout; the route-level browser gate remains for the exact-artifact
release task.

## Dirty-boundary notes

Only the 13 Task 8 paths from the active brief were staged. Existing dirty
changes in overlapping feedback, pricing, support, and global CSS files were
preserved within those listed paths; no unrelated route, schema, Auth, map,
deployment, or snapshot files were staged.

## Concerns

- Exact four-viewport browser/Axe evidence and human visual approval remain
  open for Task 17; this task is not a release approval.
