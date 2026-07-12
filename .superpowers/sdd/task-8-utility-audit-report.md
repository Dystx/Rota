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

No source-code changes were made in this turn. This report is the only scoped
artifact produced by the audit.

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
- Account remains under the traveler `AppLayout`; reviewer pages remain under
  the dense `OperatorShell` and preserve reviewer route ownership. Their
  current auth-context edits are migration work, not Task 8 UI work.
- No map files, console workflow redesign, auth contract, or Task 9 evidence
  was touched.

## Remaining gap

The existing support page has a clear primary action and recovery cards, but it
does not yet expose explicit payment/export help or the emergency-support
limitation required by the approved full-product support contract
(`docs/superpowers/specs/2026-07-10-rumia-full-product-rework-design.md` §7.6).
Because the page is pre-existing user work and the requested change boundary
for this turn is audit-only, this gap is recorded rather than silently
rewriting the dirty hunk.

## Verification run in this turn

| Check | Result |
| --- | --- |
| Focused Vitest: pricing, offline status, feature grid, editorial primitives | **PASS** — 4 files, 18 tests |
| `pnpm --dir apps/web typecheck` | **PASS** |
| `pnpm lint:eslint` | **PASS** |
| `git diff --check` | **PASS** |
| Browser/a11y/overflow gates | **NOT RUN** — no fresh browser evidence was produced in this audit |

## Status

**PARTIAL / AUDIT ONLY.** Existing dirty utility work is statically healthy,
but no Task 8 source changes were authored or committed here, and the support
contract gap above remains for the owner of the pre-existing hunk.
