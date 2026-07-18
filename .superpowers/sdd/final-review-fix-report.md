# Rumia visual-hardening final-review fix report

Date: 2026-07-18

Status: **DONE_WITH_CONCERNS**

Branch: `codex/rumia-visual-hardening`

Base commit: `e188ea8593f3f997c694d4f589e6950ba3d565b3`

Replacement candidate source commit:
`91d925643f1421998c42d7f6ee238558c65bc377`

Replacement candidate source tree:
`248a548f3c127d4b98314f9b8ef3e69a1f1b46ba`

Post-build test-only stabilization commit:
`6928a8bee7ec7cf64bf3be26f1bf47b4a83b00b7`

## Outcome

The second whole-branch review wave closes all three Important and both Minor
review findings. Candidate creation is now explicit and one-shot; replacement
requires the expected old digest, captures the prior receipt bytes before any
served asset mutation, and archives them before replacing the receipt. The
canonical acceptance builder binds a clean source
commit and tree into a deterministic manifest inside the hashed standalone
runtime. Pre-approval rejects stale or malformed provenance and missing or
out-of-root symlink targets before receipt creation or asset copying.

The root acceptance command is explicitly final and cannot create a candidate.
Focused exact-artifact unit tests are wired into the root routine gate and CI.
Generic Axe stabilization preserves the default motion media preference while
disabling CSS animation/transition timing. Explicit reduced-motion coverage
remains active.

The owner-authorized Console authority alternative was applied without a
product or snapshot edit. The exact Console mobile image approved later on
2026-07-18 supersedes the plan's earlier provisional 78% heuristic with the
measured 70% floor and the complete viewport/containment/truthfulness contract.
All three real `DecisionStatePanel` panes are asserted after activation.

Exactly one replacement candidate was built. The old j4Cx receipt was archived
byte-for-byte, the bounded replacement pre-approval passed, and the complete
final exact-artifact gate passed both phases against the same schema-3 receipt
and served runtime. The candidate is local release-ready and **not deployed**.

No product source, approved PNG, schema, environment file, dependency, feature
behavior, VPS, Caddy, DNS, ingress, push, merge, or deployment change was made.

## Console authority supersession

The plan's 78% endpoint was written before the owner approved the exact desktop
and mobile Console compositions on 2026-07-18. That later exact-image approval
is the controlling visual authority. It does not authorize altered pixels.

The enforceable completed-plan contract is:

- each activated real `DecisionStatePanel` bottom is at least 70% of the first
  viewport and no greater than `viewportHeight + 1`;
- document height is no greater than `viewportHeight + 1`;
- document width has no horizontal overflow;
- the panel is contained in the active pane;
- Anchors, Timeline, and Validation are all reachable and truthful;
- approved Console mobile blob
  `e728dc6df41251a8352d2d51a226de60f206e928` is immutable.

The unchanged j4Cx product bytes measured at 390x844:

| Pane | Panel bottom | First viewport |
| --- | ---: | ---: |
| Anchors | 628.78125 px | 74.50% |
| Timeline | 602.78125 px | 71.42% |
| Validation | 602.78125 px | 71.42% |

All exceed 70%. The replacement candidate's full final gate passed the same
three-pane geometry contract. No Console production source or snapshot changed
in this review wave.

## Test-first evidence

### RED

- Exact-artifact unit suite before implementation: **5 passed / 11 failed**.
  The 11 intended failures covered missing phase, candidate authorization,
  immutable repeated pre-approval, replacement archive, stale provenance,
  malformed provenance, and symlink containment gaps.
- Default-motion Axe test before removing generic reduced-motion emulation:
  **0 passed / 1 failed** because the default media query incorrectly matched
  reduced motion.
- A throwaway Console probe against unchanged j4Cx proved all three panes fail
  the provisional 78% floor while exceeding the owner-authorized 70% floor.
  This evidence stopped any product-layout edit.
- The first complete final run exposed two test-timing RED cases: Traveler
  route 2 timed out because the helper waited for intentionally persistent
  workspace animations to stop, and Home geometry sampled an entrance frame
  with a zero-width card. The failed run was terminated at case 2,058 after
  both completed projects reproduced the Traveler failure.

### GREEN

- Exact-artifact unit suite: **16 passed / 0 failed**.
- Playwright TypeScript: passed.
- Workspace typecheck: **15/15 tasks passed**.
- Workspace lint: passed.
- Filtered-empty default-motion test, four projects x three repeats:
  **12 passed / 0 failed**.
- Explicit reduced-motion focus: **34 passed / 90 intentional skips / 0
  failed**.
- Console mobile geometry focus: **1 passed / 0 failed**.
- The two full-run timing RED cases after the bounded two-render-frame settle:
  four-project focused nonvisual **10 passed / 18 intentional skips**, followed
  by Home visual **2 passed / 6 intentional skips**.
- Snapshot updates: none.

The final motion helper injects
`animation:none!important;transition:none!important`, then waits exactly two
render frames for CSS and layout to commit. It does not emulate
`prefers-reduced-motion` and does not wait for persistent application
animations to end. The Home geometry audit applies the same timing suppression
before measuring cards.

## Candidate-creation and provenance fixes

- `--phase` is required; there is no pre-approval default.
- Root `test:acceptance` invokes `--phase final` explicitly.
- Pre-approval requires exactly one creation authority:
  - `--new-candidate` only when no receipt exists;
  - `--replace-candidate <expected-old-digest>` only when an existing receipt
    has that exact digest.
- Missing/wrong authorization is rejected before `copyReleaseAssets`.
- Repeated unauthorized pre-approval leaves receipt and served files
  byte-for-byte unchanged.
- Authorized replacement archives the exact previous receipt under `output/`.
- `build:acceptance` captures clean commit/tree, runs the real build, verifies
  commit/tree/cleanliness did not change, verifies root and standalone build
  IDs, and writes a deterministic provenance manifest into the standalone
  root.
- Schema-3 receipts bind provenance manifest path and SHA-256 into candidate
  identity and retain creation/replacement audit fields.
- Pre-approval rejects missing, malformed, wrong-build, wrong-commit,
  wrong-tree, and stale-build provenance before receipt/assets mutation.
- Every runtime symlink must resolve to an existing target inside the canonical
  standalone root.
- `test:exact-artifact-unit` is part of root routine `test` and CI; it cannot
  create a candidate.

## One replacement build and immutable receipt

Canonical build command: `pnpm build:acceptance`

- Build result: exit 0; 64/64 pages generated.
- Build ID: `rudKclU2P-R_aXinasLka`.
- Runtime digest:
  `2be3e21cc9773f72434a08c14a0d2c78abf33eac042fbe8ab6c38013396e3164`.
- Source commit: `91d925643f1421998c42d7f6ee238558c65bc377`.
- Source tree: `248a548f3c127d4b98314f9b8ef3e69a1f1b46ba`.
- Tracked clean at build and candidate creation: `true`.
- Inventory: 2,623 entries.
- Provenance manifest:
  `apps/web/.next/standalone/rumia-exact-artifact-provenance.json`.
- Manifest SHA-256:
  `0cbfe60cffee6aa370947ce86944df12a27b1c26d290fd99d86c5d93f31207dc`.
- Candidate created: `2026-07-18T08:19:09.136Z`.

Replacement used expected old digest
`e079b2cd79032599315a24bad318cb31d04626ac1032b64752ff0e4de968d22c`.
The preserved prior receipt is:

`output/playwright/exact-artifact/archive/build-receipt.e079b2cd79032599315a24bad318cb31d04626ac1032b64752ff0e4de968d22c.json`

Its SHA-256 is
`d9484766e68e42f6f50e8bf0089c595ac018777fd080c261a2c717eef59293d5`,
exactly matching the old receipt's pre-replacement byte hash.

The current untracked receipt SHA-256 after all verification entries is
`dd3e06c0b7f330030b7b1ff2a06754b73d1c9ab80d5adc61b3828f762552c4f1`.

## Exact-artifact gates

Bounded replacement pre-approval, using the expected old digest:

- nonvisual: **18 passed / 54 intentional skips / 0 failed**;
- visual: **2 passed / 6 intentional skips / 0 failed**;
- no snapshot update.

Successful complete final, same receipt/runtime and no asset recopy:

- nonvisual: **1,643 passed / 2,433 intentional skips / 0 failed / 4,076
  total** in 14.9 minutes;
- visual: **102 passed / 306 intentional skips / 0 failed / 408 total** in
  1.1 minutes;
- overall exit: 0;
- final receipt verification: `2026-07-18T08:35:23.744Z`;
- port 3105: closed after harness shutdown.

Runtime used process-only `DATABASE_URL` for `rumia_app`; fixture provisioning
used process-only `RUMIA_OWNER_DATABASE_URL` for `rumia_owner`. The E2E
password was process-only sourced and was never printed, copied, or committed.

Receipt verification history also honestly retains the failed/aborted final
attempt, sandbox bind rejection, missing-placeholder invocation, focused
nonvisual-only result, and focused two-phase green before the successful full
final. Every entry retained the same build ID, digest, and 2,623-entry
inventory; only the last complete invocation is the final acceptance result.

## Approved snapshot immutability

| Snapshot | Git blob |
| --- | --- |
| Console Workspace desktop | `538d51759ef763b9634e3c0b1cae804b3003a917` |
| Console Workspace mobile | `e728dc6df41251a8352d2d51a226de60f206e928` |
| Home desktop | `62af079dfdabfd96842987e23fe1149d3ef9ed9e` |
| Home mobile | `dd21202576773dcf3dac4893559aa703b8eea149` |
| Planner desktop | `80a5849898aeef1f5d308c9992144460021a4111` |
| Planner mobile | `629c4d13119b4858f7d98d39969e3d528ed7eaa5` |

No approved PNG was edited or staged. No Playwright output, test result,
report, environment file, or unrelated file is part of either source commit.

## Commits and final boundary

- `91d925643f1421998c42d7f6ee238558c65bc377` — candidate-creation,
  build-provenance, symlink, package/CI, default-motion, and Console geometry
  mechanisms committed before the one replacement build.
- `6928a8bee7ec7cf64bf3be26f1bf47b4a83b00b7` — post-build test-only bounded
  render-frame settle; outside candidate bytes.
- This evidence/authority commit contains only the final report, progress,
  plan index, completed-plan supersession, snapshot approval evidence, and
  cutover evidence.

Final tracked worktree state before this evidence commit contained only those
six intended documentation edits. The intentionally untracked `output/`
receipt/evidence tree remains present and unstaged. Port 3105 has no listener.
The replacement candidate was not pushed, merged, deployed, or exposed through
VPS/Caddy/DNS/ingress.

## Concern

The first full final gate revealed that the new animation-settle condition
could never complete on the persistent trip workspace and that the pre-existing
Home geometry audit could sample an entrance frame. Their smallest test-only
repair is commit `6928a8b`, created after the one permitted replacement build.
It does not change candidate runtime bytes, receipt identity, product source,
or snapshots, and the same immutable candidate passed the complete final gate.
However, this is an explicit exception to the requested ordering that all test
changes precede the build; a second build was intentionally not made because
the brief authorized exactly one replacement build.
