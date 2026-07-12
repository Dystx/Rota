# Public contract reconciliation report

## Scope completed

- Updated `apps/web/playwright/tests/public-discovery.spec.ts` only.
- Replaced retired destination/atlas and legacy public-shell assertions with
  the current activity-first contracts:
  - `What to do`, `How it works`, `Local expertise`, `Pricing`, and
    `Explore activities` in `TopNav`.
  - Keyboard focus/activation of the reviewed activity save button, the
    `saved=porto-ribeira-slow-walk` explorer URL state, and keyboard handoff
    through `See this day` to the chosen-day workspace URL.
  - Current pricing rows for the free activity-day preview, chosen-day export,
    and optional local review, including the €19/€49 paid choices.
  - `OfflineStatus` recovery via `Stay on this offline page` (`/offline`) and
    `Try again`.
- No product/UI source or visual snapshot was changed.

## Verification

| Command | Result |
| --- | --- |
| `pnpm exec vitest run --config vitest.config.ts 'apps/web/app/(marketing)/explore/activity-explorer.test.tsx' 'apps/web/app/(marketing)/explore/workspace/activity-workspace.test.tsx' apps/web/app/offline/offline-status.test.tsx 'apps/web/app/(marketing)/pricing/page.test.tsx'` | **PASS** — 4 files, 15 tests |
| `pnpm --filter web exec playwright test playwright/tests/public-discovery.spec.ts --project=desktop-chrome --project=mobile-chromium` (local PostgreSQL/Better Auth environment) | **PASS** — 8 tests: desktop 4/4, mobile 4/4 |

The first browser invocation without the local server environment stopped at
web-server startup because `DATABASE_URL` was unset; the rerun used the
existing loopback PostgreSQL/Better Auth setup and completed green.

## Visual baseline

The focused contract run does not capture snapshots. No visual baseline was
refreshed or changed; any pre-existing snapshot modifications in the worktree
were left untouched.
