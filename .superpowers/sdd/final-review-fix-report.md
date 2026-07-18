# Rumia visual-hardening final-review fix report

Date: 2026-07-18

Status: **DONE**

Branch: `codex/rumia-visual-hardening`

Base commit: `e188ea8593f3f997c694d4f589e6950ba3d565b3`

Candidate source commit: `1e4786d3a4cdcb6570f98ee4548e4bcaa1ecf6d9`

Candidate source tree: `3533320ea135cfb0d8131b6da8e653e5b5680646`

Post-build provenance evidence commit: `7d78158d9a578f15d773e9b352c72d1961b1065a`

Test-only stabilization commit: `de9b01a396398aea8fd4039431d1f8d495fb74ad`

## Outcome

All binding final-review findings and the final accessibility stabilization are
complete. The exact-artifact runner binds the complete served standalone tree
to an immutable schema-v2 receipt, records tracked-clean source provenance,
materializes release assets only at candidate creation, and rejects changed
served bytes before later-phase server startup. Console Workspace coverage
proves all three truthful panes and measures the rendered shared state panel.
The planning authorities are reconciled, and the six-row approval delta uses
immutable Git object and deterministic byte-delta evidence.

The remaining final-gate failure was proven to be test timing, not a product
contrast defect: Axe could sample an active `transition-colors` interpolation
because motion was disabled only after the state-changing Drafts click. The
smallest test-only fix now establishes reduced motion and disables animations
and transitions before interaction, waits conditionally for no running Web
Animations, and preserves the existing serious/critical Axe contract. No
production source changed.

The complete final exact-artifact gate passed both phases against the same
existing receipt and runtime: 1,643 non-visual checks passed with 2,433
intentional project skips, followed by 102 visual checks passed with 306
intentional project skips. No snapshot was updated. The candidate is local
release-ready and remains not deployed.

No schema, environment contract, dependency, product behavior, deployment,
VPS, Caddy, DNS, or ingress change was made.

## Binding final-review implementation

The source implementation at `1e4786d3a4cdcb6570f98ee4548e4bcaa1ecf6d9`
closed the original findings:

- Complete standalone runtime hashing covers regular files and deterministic
  symlink metadata under `apps/web/.next/standalone`, including public,
  `.next/static`, server, and runtime dependency payloads.
- Candidate creation requires tracked-clean source, permits only untracked
  `output/`, records commit/tree/cleanliness/build/digest/server/timestamp and
  a complete inventory, and creates a schema-v2 receipt.
- Later phases verify the existing receipt and complete runtime before server
  startup; they do not recopy served assets or replace candidate provenance.
- Console Workspace mobile coverage visits Anchors, Timeline, Validation, and
  Anchors again; asserts each pane's heading and description; measures the
  rendered `DecisionStatePanel`; and retains meaningful height, containment,
  and overflow checks.
- The activity-first master remains active product authority, both frontend
  plans are completed evidence, and no frontend follow-up is active.
- The six approved hardening deltas now record old and approved commit/blob/
  byte-SHA identities plus a documented length-framed deterministic delta
  SHA-256. Transient Playwright candidate/diff paths are not audit authority.

Original RED/GREEN evidence:

- `node --test scripts/run-exact-artifact-gate.test.mjs`: RED 0 passed / 5
  failed, then GREEN 6 passed / 0 failed.
- The first real-panel Console height assertion deliberately failed at 320 px
  with a measured 262 px panel; the contract was calibrated to the existing
  shared component's 220 px minimum without a product geometry change.
- Console Workspace mobile focus: 1 passed / 0 failed.
- Console view-switcher and DecisionStatePanel component focus: 8 passed / 0
  failed.
- Playwright TypeScript, 15-package workspace typecheck, workspace lint,
  runner syntax, and diff checks passed before the candidate-source commit.

## Accessibility root cause and test-first stabilization

### Hypothesis proof on unchanged candidate

A throwaway diagnostic spec/config was created only below untracked `output/`.
It used the receipt-bound standalone candidate, applied reduced motion plus
`animation:none!important;transition:none!important` before the Drafts click,
waited for no running Web Animations, and ran the existing Axe contract.

- Four Playwright projects, `--repeat-each=3`: **12 passed / 0 failed** in
  11.3 seconds.
- Candidate build, digest, source commit/tree, served bytes, and snapshots were
  unchanged.
- Temporary diagnostic material remained under `output/` and was not staged.

This confirmed the transition-sampling hypothesis. It did not justify a
production change.

### RED

Before adding the helper, the focused desktop test asserted that motion was
already stable before the state-changing click. It failed as intended:

- Expected `animationName: "none"`, `transitionDuration: "0s"`.
- Received `animationName: "none"`, `transitionDuration: "0.15s"`.

### GREEN

`apps/web/playwright/tests/accessibility.spec.ts` now has one reusable
`stabilizeA11yMotion` helper. It:

- emulates `prefers-reduced-motion: reduce`;
- injects `animation:none!important;transition:none!important` for elements
  and pseudo-elements;
- uses a condition-based `document.getAnimations()` settle instead of an
  arbitrary long timeout;
- runs in the filtered-empty test before the Drafts interaction and in
  `runAxe` before each audit;
- asserts the Drafts button has stable computed motion before clicking and
  waits for `aria-pressed=true` plus the existing recovery-state conditions.

Focused verification after implementation:

- Playwright TypeScript (`pnpm --dir apps/web test:typecheck`): passed.
- Filtered-empty test, four projects, `--repeat-each=3`: **12 passed / 0
  failed** in 19.0 seconds.
- Test-only commit: `de9b01a396398aea8fd4039431d1f8d495fb74ad`.

The test-only commit is deliberately outside the already-built candidate
bytes. It changes the source-side acceptance harness only; it does not alter
the receipt's candidate source identity.

## Single immutable candidate

The implementation/tests were committed before the one permitted build as
`1e4786d3a4cdcb6570f98ee4548e4bcaa1ecf6d9`, tree
`3533320ea135cfb0d8131b6da8e653e5b5680646`. Candidate creation saw a
tracked-clean source tree with no disallowed untracked paths.

- Build command: `corepack pnpm build`; exit 0; 64/64 pages generated.
- Build ID: `j4CxzJH3lYqvjoIzeD9o-`.
- No second candidate was built after the test-only fix.
- No pre-approval phase was rerun.
- No served assets were recopied.
- No snapshot update option was used.
- The E2E password was sourced process-only and never printed, copied, or
  committed.
- The standalone runtime used the `rumia_app` connection; fixture provisioning
  used process-only `RUMIA_OWNER_DATABASE_URL` for `rumia_owner`.

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
- Independent post-fix recomputation: digest match `true`, inventory count
  2,622, deep inventory match `true`.

Receipt identity verifications retained in order:

- pre-approval: `2026-07-18T06:06:02.145Z`;
- original final attempt: `2026-07-18T06:07:09.555Z`;
- role-misconfigured final attempt: `2026-07-18T06:45:17.988Z`;
- successful complete final: `2026-07-18T07:06:51.919Z`.

Each verification retained the same build ID, digest, and 2,622-entry
inventory. Receipt verification records candidate identity, while the test
results below record whether a phase completed successfully.

## Exact-artifact gate evidence

Bounded pre-approval, performed before this continuation and not repeated:

- Non-visual: 6 passed / 18 intentionally skipped / 0 failed.
- Visual: 2 passed / 6 intentionally skipped / 0 failed.

Original complete final attempt, before stabilization:

- Non-visual: 1,640 passed / 2,433 intentionally skipped / 3 failed / 4,076
  total.
- The three failures were transient Axe contrast samples on the existing
  Itineraries filter transition.
- The harness correctly did not start its visual phase after non-visual
  failure. A supplemental unchanged-candidate visual run passed 102 / 306
  skipped / 0 failed.

The first full run after the test-only commit was invoked with the owner
connection incorrectly supplied as `DATABASE_URL`, crossing the documented
runtime/fixture boundary. It retained candidate bytes but failed 10 unrelated
checks: two Console preference cases and eight reviewer-trip route cases.
After inspecting global setup, the same unchanged candidate was reproduced
with the correct split:

- Console-focused reproduction: 10 passed / 30 project skips / 0 failed.
- Reviewer-route reproduction: 18 passed / 54 project skips / 0 failed.

That evidence established an invocation error, not a candidate regression.
No source or artifact changed before the corrected complete run.

Successful complete final command:

`node scripts/run-exact-artifact-gate.mjs --phase final`

It used process-only `DATABASE_URL` for `rumia_app`, fixture-only
`RUMIA_OWNER_DATABASE_URL` for `rumia_owner`, the process-only E2E password,
and the existing receipt. Result:

- Candidate digest/inventory verified before server start.
- Non-visual: **1,643 passed / 2,433 intentionally skipped / 0 failed / 4,076
  total** in 14.2 minutes.
- The formerly flaky filtered-empty accessibility check passed in all four
  projects inside this full run.
- Visual: **102 passed / 306 intentionally skipped / 0 failed / 408 total** in
  1.2 minutes.
- Overall exact-artifact final command: exit 0.
- Snapshot updates: none.
- Asset recopy: none.
- Build/pre-approval: not run.
- Port 3105: closed after harness shutdown.

## Approved snapshot immutability

The approved PNG bytes were not edited or refreshed. Their Git blob IDs remain:

| Snapshot | Blob ID |
| --- | --- |
| Console Workspace desktop | `538d51759ef763b9634e3c0b1cae804b3003a917` |
| Console Workspace mobile | `e728dc6df41251a8352d2d51a226de60f206e928` |
| Home desktop | `62af079dfdabfd96842987e23fe1149d3ef9ed9e` |
| Home mobile | `dd21202576773dcf3dac4893559aa703b8eea149` |
| Planner desktop | `80a5849898aeef1f5d308c9992144460021a4111` |
| Planner mobile | `629c4d13119b4858f7d98d39969e3d528ed7eaa5` |

`git diff 7d78158d9a578f15d773e9b352c72d1961b1065a..HEAD --
apps/web/playwright/tests/visual.spec.ts-snapshots` is empty, and `git ls-tree
HEAD` returns all six approved blobs above. The immutable ledger retains the
old/approved commit and blob IDs, byte SHA-256 values, deterministic
length-framed delta SHA-256 values, owner decisions, and visual reasons.

## Commit and tracked-file separation

Candidate-source implementation commit
`1e4786d3a4cdcb6570f98ee4548e4bcaa1ecf6d9`:

- `scripts/run-exact-artifact-gate.mjs`
- `scripts/run-exact-artifact-gate.test.mjs`
- `apps/web/playwright/tests/console-workspace-responsive.spec.ts`
- `docs/reviews/2026-07-16-rumia-snapshot-approval.md`
- `docs/superpowers/PLAN-INDEX.md`
- `docs/superpowers/plans/2026-07-10-rumia-activity-first-master.md`

Prior post-build evidence commit
`7d78158d9a578f15d773e9b352c72d1961b1065a`:

- `.superpowers/sdd/final-review-fix-report.md`
- `.superpowers/sdd/progress.md`
- `docs/superpowers/PLAN-INDEX.md`
- `docs/reviews/2026-07-16-rumia-snapshot-approval.md`
- `docs/ops/cutover-evidence.md`

Test-only stabilization commit
`de9b01a396398aea8fd4039431d1f8d495fb74ad`:

- `apps/web/playwright/tests/accessibility.spec.ts`

This final evidence/docs commit updates only:

- `.superpowers/sdd/final-review-fix-report.md`
- `.superpowers/sdd/progress.md`
- `docs/superpowers/PLAN-INDEX.md`
- `docs/reviews/2026-07-16-rumia-snapshot-approval.md`
- `docs/ops/cutover-evidence.md`

`output/`, Playwright test results/reports, environment files, and snapshots
are not staged.

## Final state and concerns

- Status: **DONE**.
- Candidate: local release-ready, not deployed.
- Candidate source provenance remains `1e4786d3a4cdcb6570f98ee4548e4bcaa1ecf6d9`
  / `3533320ea135cfb0d8131b6da8e653e5b5680646`; later test and documentation
  commits are intentionally outside candidate bytes.
- Git status before the evidence commit contained only the five intended
  documentation edits plus pre-existing untracked `output/`.
- Port 3105 has no listener.
- No release-blocking concern remains. Historical failed attempts and their
  receipt identity-verification timestamps are retained honestly above.
