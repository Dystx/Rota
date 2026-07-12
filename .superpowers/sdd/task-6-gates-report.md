# Task 6 — verification gates

Date: 2026-07-12
Branch: `codex/rumia-phase0`

## Static gates

These commands were run against the shared working tree, which already
contains the Better Auth/PostgreSQL migration from earlier work. That
migration is intentionally not part of this verification commit; the test
assertions below accept both the committed legacy Supabase fixture and the
current Better Auth fixture while that migration remains uncommitted.

The following checks were run against the foundation/planner slice:

| Check | Result |
| --- | --- |
| `pnpm --dir apps/web typecheck` | PASS |
| `pnpm --dir apps/web test:typecheck` | PASS |
| `pnpm lint:eslint` | PASS |
| `pnpm build` with local PostgreSQL/Better Auth environment | PASS (working tree migration) |
| `git diff --check` | PASS |

The build completed the Next.js production compilation and route generation. No
credentials were written to this report.

## Tablet viewport contract

Command:

```text
E2E_TEST_USER_PASSWORD=<local fixture value> \
DATABASE_URL=postgresql:///rumia?user=rumia_app \
RUMIA_OWNER_DATABASE_URL=postgresql:///rumia?user=rumia_owner \
BETTER_AUTH_SECRET=<local fixture value> \
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3105 \
pnpm --dir apps/web exec playwright test --config playwright.config.ts --grep @viewport-qa
```

Initial result: **RED — 134 passed, 6 failed, 140 total (2.1 minutes).**

The six failures are the same contract at both Playwright projects (`desktop-chrome`
and `mobile-chromium`) for the 768px admin console routes:

- `/console/pipeline`
- `/console/workspace`
- `/console/messages`

Each page reported `document.documentElement.scrollWidth = 775` while the
viewport client width was `768` (the contract allows at most `769`). This was a
real intermediate-width horizontal overflow. The three route shells now apply
`min-w-0` and clip only their document-level overflow while preserving the
inner console panes.

Focused rerun after the fix:

```text
... pnpm --dir apps/web exec playwright test --config playwright.config.ts \
  --grep '@viewport-qa admin 768px route /console/' \
  --project=desktop-chrome --project=mobile-chromium
```

Result: **PASS — 6 passed (23.8 seconds).**

Full rerun after the fix:

```text
... pnpm --dir apps/web exec playwright test --config playwright.config.ts \
  --grep '@viewport-qa' --project=desktop-chrome --project=mobile-chromium
```

Result: **PASS — 140 passed (2.6 minutes).**

The run produced project-separated first-viewport evidence under
`.sisyphus/evidence/future-roadmap/viewport-contract/<project>/<width>/` and
did not update any visual baseline snapshots.

## Accessibility and visual gates

The interrupted earlier full browser run did not complete a trustworthy result
after the local Better Auth/fixture migration. It encountered stale public and
workspace/console contracts and visual route failures, so it is recorded as
**incomplete**, not green. A clean rerun should happen after the 768px console
overflow is repaired and the release server is rebuilt.

No visual baseline refresh was accepted in this task. The tracked PNG changes
already present in the worktree were left untouched because their provenance
predates this verification slice; no snapshot file is staged by this task.

## Intentional verification changes

- `apps/web/playwright/tests/viewport-contract.spec.ts` adds explicit 1024px and
  768px route contracts for public, traveler, reviewer, and admin surfaces. It
  checks one main landmark, one visible heading, no placeholder imagery, no
  legacy icon-font nodes, no browser errors, and no document-level horizontal
  overflow. It writes reviewable first-viewport captures but is not part of the
  canonical `@smoke`, `@visual`, or `@a11y` suites.
- `apps/web/playwright/tests/accessibility.spec.ts` resolves source-heading
  paths from either the web app or repository root, raises the traveler audit
  timeout for the real route set, and asserts a narrow
  legacy-Supabase-or-Better-Auth session-cookie shape used by either fixture
  generation path.
- `apps/web/playwright/tests/visual.spec.ts` asserts the same narrow session
  cookie shape for authenticated screenshot routes.

The random-trip PNG artifacts created by the interrupted screenshot attempt
were moved out of the worktree to
`/tmp/rumia-task6-generated-snapshots-20260712/` for reversible cleanup. No
tracked visual snapshot was restored, refreshed, or staged.

## Follow-up required before calling the slice complete

1. Rerun the focused planner/workspace/public-discovery, accessibility, and
   visual gates against a freshly built local release server.
2. Review visual diffs route by route; accept only intentional design changes.

Task 6's static and viewport gates are now green. The focused browser/a11y and
visual suites remain to be rerun before the full first slice is called green.
