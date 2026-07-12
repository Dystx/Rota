# Task 8 utility/operator audit

Date: 2026-07-12
Branch: `codex/rumia-phase0`

## Scope and change boundary

The worktree already contained a broad dirty migration/rework set before
this audit. The utility hunks for local expertise, human review, pricing,
support, offline, legal copy, and reviewer queue focus states were present
before this turn, as was `apps/web/app/support/layout.tsx`. They were treated
as user work and were not staged or rewritten. Account/reviewer data-access
diffs were also excluded because Task 8 forbids auth/data-contract changes.

The initial audit made no source-code changes. A follow-up fix was then
authorized for the pre-existing support page only; no auth, data, route, map,
console, or reviewer workflow files were changed.

## Contract review

- Public route ownership is intact. The `(marketing)` layout supplies the
  shared `AppLayout` shell to local expertise, human review, and pricing;
  support has the same shell in its route layout; offline and legal pages use
  `PublicRouteLayout`.
- Utility copy in the existing dirty hunks is activity-first and avoids
  promising booking, accommodation search, on-trip concierge, or guaranteed
  availability. Pricing keeps future concierge access waitlist-only.
- Current public controls expose visible focus styles through shared `Button`
  primitives or explicit `focus-visible` classes. Offline recovery controls
  have 44px minimum targets and an announced status region.
- Support now exposes explicit payment/access and exports/saved-day recovery
  paths, while retaining Explore activities as its single primary action.
- Support now states that Rumia is not emergency or on-trip support and points
  urgent requests to local emergency services.
- Account remains under the traveler `AppLayout`; reviewer pages remain under
  the dense `OperatorShell` and preserve reviewer route ownership. Their
  current auth-context edits are migration work, not Task 8 UI work.
- No map files, console workflow redesign, auth contract, or Task 9 evidence
  was touched.

## Follow-up closure

The support gap from the initial audit is closed in
`apps/web/app/support/page.tsx`. The page still uses the existing anonymous
public shell and route ownership; only support content was extended.

## Verification run in this turn

| Check | Result |
| --- | --- |
| Focused Vitest: pricing, offline status, feature grid, editorial primitives | **PASS** — 4 files, 18 tests |
| Support content contract (`rg` for payment/export and emergency copy) | **PASS** |
| `pnpm --dir apps/web typecheck` | **PASS** |
| `pnpm lint:eslint` | **PASS** |
| `git diff --check` | **PASS** |
| Browser/a11y/overflow gates | **NOT RUN** — no fresh browser evidence was produced in this audit |

## Status

**CLOSED FOR THE RECORDED GAP.** The scoped support content fix is complete and
statically verified. Full browser/a11y/overflow evidence remains a separate
follow-up because those gates were not run in this turn.
