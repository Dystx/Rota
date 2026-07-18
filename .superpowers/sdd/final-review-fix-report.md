# Rumia visual-hardening final-review fix report

Date: 2026-07-18

Status: **DONE_WITH_CONCERNS**

Branch: `codex/rumia-visual-hardening`

Base commit: `e188ea8593f3f997c694d4f589e6950ba3d565b3`

Implementation commit: `1e4786d3a4cdcb6570f98ee4548e4bcaa1ecf6d9`

Implementation tree: `3533320ea135cfb0d8131b6da8e653e5b5680646`

## Outcome

All binding final-review findings were implemented in one source wave. The
exact-artifact runner now binds every served regular file and deterministic
symlink in the standalone tree to one immutable schema-v2 candidate receipt,
records the tracked-clean source commit and tree, rejects dirty or malformed
candidate creation, and verifies rather than rematerializes the candidate in
later phases. Console Workspace coverage now proves the truthful Anchors,
Timeline, and Validation panes and measures the real shared
`DecisionStatePanel`. The planning authorities were reconciled, and the Minor
immutable-audit repair replaced transient Playwright paths with reproducible
old/approved Git object IDs, byte SHA-256 values, and deterministic delta
digests.

No product page implementation, schema, environment contract, dependency,
snapshot, deployment, VPS, Caddy, DNS, or ingress behavior was changed.

The source fixes and candidate provenance are verified. The complete final
phase is not green: three of four projects intermittently sampled the existing
Itineraries filter buttons during `transition-colors`, producing transient Axe
contrast failures. The same unchanged candidate passed the complete 102-row
visual suite. Because the binding workflow allowed exactly one candidate build,
the unrelated post-build race was diagnosed and recorded rather than hidden by
an opportunistic retry or a second build.

## TDD and focused verification

RED, before implementation:

- `node --test scripts/run-exact-artifact-gate.test.mjs`: 0 passed, 5 failed.
  The failures proved missing public inventory coverage, a digest unchanged by
  public mutation, and absent candidate provenance/no-recopy/malformed-receipt
  contracts.
- The first real-panel Console height assertion failed at the deliberately
  over-strict 320 px threshold with a measured 262 px panel. The contract was
  calibrated to the shared component's existing 220 px minimum and no product
  geometry was changed.

GREEN, before the implementation commit:

- `node --test scripts/run-exact-artifact-gate.test.mjs`: 6 passed, 0 failed.
- Console Workspace mobile Playwright focus: 1 passed, 0 failed.
- Console mobile view-switcher and DecisionStatePanel component focus: 8
  passed, 0 failed.
- Playwright TypeScript check: passed.
- Workspace typecheck: 15 packages passed.
- Workspace lint: passed.
- Runner syntax check and `git diff --check`: passed.

The six runner regressions cover all served payload classes, digest changes for
public/static/server/dependency/symlink changes, single materialization plus
source provenance, no recopy and pre-start mutation rejection, dirty candidate
rejection, and missing/malformed receipt rejection.

## Source commit and single build

The implementation/tests were committed before build as
`1e4786d3a4cdcb6570f98ee4548e4bcaa1ecf6d9`, tree
`3533320ea135cfb0d8131b6da8e653e5b5680646`. The worktree had no tracked or
out-of-`output/` untracked changes when the candidate was created.

Exactly one new candidate was built with documented process-only build values:

- `corepack pnpm build`: exit 0; 64/64 pages generated.
- Build ID: `j4CxzJH3lYqvjoIzeD9o-`.
- No E2E password value was printed, copied, or committed.
- Fixture seeding used the documented process-only owner database connection.

## Immutable candidate receipt

Receipt: `output/playwright/exact-artifact/build-receipt.json` (intentionally
untracked)

- Schema: 2.
- Build ID: `j4CxzJH3lYqvjoIzeD9o-`.
- Digest: `e079b2cd79032599315a24bad318cb31d04626ac1032b64752ff0e4de968d22c`.
- Source commit: `1e4786d3a4cdcb6570f98ee4548e4bcaa1ecf6d9`.
- Source tree: `3533320ea135cfb0d8131b6da8e653e5b5680646`.
- Tracked clean: `true`.
- Server: `apps/web/.next/standalone/apps/web/server.js`.
- Port: 3105.
- Created: `2026-07-18T06:06:02.144Z`.
- Inventory: 2,622 entries.
- Inventory coverage: public, static, server, and node_modules payloads all
  present; 2,613 entries are inside those four served classes.
- Receipt verifications: pre-approval at `2026-07-18T06:06:02.145Z`; final at
  `2026-07-18T06:07:09.555Z`; both retained the same build, digest, and 2,622
  entries.

Only the bounded Console pre-approval phase materialized the receipt. The final
phase re-read and verified it before server startup and did not recopy served
assets.

## Exact artifact gate

Bounded pre-approval grep `console-workspace--empty`:

- Non-visual: 6 passed, 18 intentionally skipped, 0 failed.
- Visual: 2 passed, 6 intentionally skipped, 0 failed.
- Port 3105 closed after the phase.

Complete final phase against the same receipt:

- Candidate identity and all 2,622 inventory entries verified before startup.
- Non-visual: 1,640 passed, 2,433 intentionally skipped, 3 failed; 4,076 total;
  exit 1.
- All three failures were the existing
  `Accessibility Audit - Traveler > itineraries filtered-empty state keeps
  recovery actionable` check in desktop-1440, tablet-portrait, and mobile-390.
  Tablet-landscape passed.
- Axe sampled intermediate foreground/background values on
  `itinerary-filter-all` and `itinerary-filter-draft` immediately after the
  Drafts click while `transition-colors` was active.
- The harness stopped after the non-visual failure, so its visual command was
  not invoked. Port 3105 closed.

Bounded diagnosis on the unchanged candidate reproduced the timing signature:

- Four-project repeat 1: 3 passed, 1 failed (mobile-390).
- Four-project repeat 2: 2 passed, 2 failed (desktop-1440 and mobile-390).

Supplemental complete visual command against the unchanged, receipt-bound
standalone candidate, with snapshot updates disabled:

- 102 passed, 306 intentionally skipped, 0 failed in 1.3 minutes.
- No snapshots were updated.
- Port 3105 closed afterward.

The complete final gate is therefore accurately recorded as failed; the
supplemental visual result proves visual-family stability but does not convert
the final phase to green.

## Approved snapshot immutability

The approved PNG bytes were not edited. Their Git blob IDs remain:

| Snapshot | Blob ID |
| --- | --- |
| Console Workspace desktop | `538d51759ef763b9634e3c0b1cae804b3003a917` |
| Console Workspace mobile | `e728dc6df41251a8352d2d51a226de60f206e928` |
| Home desktop | `62af079dfdabfd96842987e23fe1149d3ef9ed9e` |
| Home mobile | `dd21202576773dcf3dac4893559aa703b8eea149` |
| Planner desktop | `80a5849898aeef1f5d308c9992144460021a4111` |
| Planner mobile | `629c4d13119b4858f7d98d39969e3d528ed7eaa5` |

The approval ledger also records the prior and approved commits, blob IDs,
direct byte SHA-256 values, and deterministic length-framed delta SHA-256 for
all six rows. It no longer relies on transient `test-results` artifacts.

## Changed tracked files

Implementation commit:

- `scripts/run-exact-artifact-gate.mjs`
- `scripts/run-exact-artifact-gate.test.mjs`
- `apps/web/playwright/tests/console-workspace-responsive.spec.ts`
- `docs/reviews/2026-07-16-rumia-snapshot-approval.md`
- `docs/superpowers/PLAN-INDEX.md`
- `docs/superpowers/plans/2026-07-10-rumia-activity-first-master.md`

Post-gate evidence commit:

- `.superpowers/sdd/final-review-fix-report.md`
- `.superpowers/sdd/progress.md`
- `docs/superpowers/PLAN-INDEX.md`
- `docs/reviews/2026-07-16-rumia-snapshot-approval.md`
- `docs/ops/cutover-evidence.md`

Generated Playwright reports, test results, environment files, and `output/`
are not staged. No push, merge, deployment, VPS/Caddy/DNS/ingress action, or
snapshot update was performed.

Fresh verification immediately before the evidence commit:

- Runner regressions: 6 passed, 0 failed.
- Playwright TypeScript check: passed.
- Workspace typecheck: 15 tasks passed.
- Workspace lint: passed.
- Staged diff check and forbidden generated-path check: passed.
- All six snapshot blob IDs matched the approved IDs above.
- Port 3105 had no listener.

## Concern

The current candidate is not release-ready under the complete exact-artifact
gate because the existing Itineraries accessibility test has an intermittent
transition-state contrast race. Resolving that concern requires a separately
authorized source/test change and a new clean candidate build; doing it after
this candidate was built would invalidate the receipt and violate the
one-candidate constraint of this final-review wave.
