# Task 9 report — reading, authentication, and system recovery surfaces

Status: DONE_WITH_CONCERNS

## Implementation

- Added reusable legal section records with an open native contents disclosure,
  anchored headings, and sticky desktop/mobile-safe navigation.
- Migrated Privacy and Terms to explicit readable sections while preserving
  their existing copy and utility scene.
- Reworked Sustainability into a static landscape-led promise with explicit
  commitments and non-claims; the image is poster-only and local.
- Added a local static Portugal place crop to the texture-free sign-in surface
  and preserved the existing sanitized inline auth error behavior.
- Replaced the raw 404 texture marker with a texture-free recovery surface and
  compact footer while keeping Explore and Home actions.
- Offline was already using the required utility recovery composition and was
  unchanged.
- Added focused tests for legal contents anchors, sustainability media and
  evidence, sign-in media contract, and not-found recovery.

## Verification

- Focused Task 9 Vitest — PASS, 5 files / 11 tests.
- `corepack pnpm --dir apps/web typecheck` — PASS.
- `corepack pnpm lint:eslint` — PASS.
- `git diff --cached --check` — PASS.

## TDD evidence

- RED: the newly added contracts initially failed for missing legal contents,
  missing static media markers, missing auth media constant, and the old 404
  surface; the expected failures were corrected in the implementation.
- GREEN: the final focused run above passed with pristine output.

## Dirty-boundary notes

Only the 12 Task 9 paths named in the active brief were staged. Existing dirty
sign-in action/form changes were preserved within their listed Task 9 paths;
no unrelated route, database, Auth schema, map, deployment, or snapshot files
were staged. `globals.css` and offline remained unchanged for this task.

## Concerns

- Exact four-viewport browser/Axe evidence and human visual approval remain
  open for Task 17; this task is not a release approval.
