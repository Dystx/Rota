# Task 5 — Approved six-image family and final exact-artifact gate

Status: **DONE**

Date: 2026-07-18

## Scope and approval

- Worktree: `/Users/cheng/rota/.worktrees/rumia-visual-hardening`
- Branch: `codex/rumia-visual-hardening`
- Task base: `5e45bc52e64dc0d20162e6369d1c863b4a8edaf6`
- Owner decision: all six bounded-hardening delta rows approved on 2026-07-18.
- Ledger verification: `delta_approved=6 delta_pending=0 delta_rejected=0`.
- No roles, policies, migrations, source files, or environment files changed.

## Reused exact artifact

- Build ID: `yOnVK7qbn55IFxrzqRCkV`
- SHA-256 digest: `001ad401de23721cde98ef35643bd9abc38c16f63fd8de34ad13c70a30248867`
- Receipt artifact file count: `743`
- Standalone server: `apps/web/.next/standalone/apps/web/server.js`
- Final receipt: phase `final`, `2026-07-18T04:35:41.299Z`.

The Task 4 standalone build and receipt were reused; no build command ran.

## Commands and exact outcomes

The E2E password was process-only sourced from `/Users/cheng/rota/apps/web/.env.local` for each runner and never printed, copied, or committed. Each runner also used the documented process-only owner connection `postgresql:///rumia?user=rumia_owner`.

- Approval: `rg -n '2026-07-18 bounded hardening delta|PENDING|REJECTED|APPROVED' docs/reviews/2026-07-16-rumia-snapshot-approval.md`, then the bounded-delta `awk` count. Output: `delta_approved=6 delta_pending=0 delta_rejected=0`.
- Family update: `node scripts/run-exact-artifact-gate.mjs --phase update-family --grep 'home--ready|planner--ready|console-workspace--empty' --update-snapshots`. Output: non-visual `17 passed`, `51 skipped` (`15.0s`); visual `6 passed`, `18 skipped` (`13.9s`); exit `0`.
- Snapshot scope: `git diff --name-only -- apps/web/playwright/tests/visual.spec.ts-snapshots | sort`. Output: exactly six paths, count `6`.
- Final gate: `node scripts/run-exact-artifact-gate.mjs --phase final`. Output: non-visual `1,643 passed`, `2,433 skipped` (`22.0m`); visual `102 passed`, `306 skipped` (`2.0m`); exit `0`.
- Closeout: `lsof -nP -iTCP:3105 -sTCP:LISTEN` and `git diff --check`. Output: no listener and no diff-check output.

## Changed baseline files

- `apps/web/playwright/tests/visual.spec.ts-snapshots/home--ready--desktop-1440-desktop-1440-darwin.png`
- `apps/web/playwright/tests/visual.spec.ts-snapshots/home--ready--mobile-390-mobile-390-darwin.png`
- `apps/web/playwright/tests/visual.spec.ts-snapshots/planner--ready--desktop-1440-desktop-1440-darwin.png`
- `apps/web/playwright/tests/visual.spec.ts-snapshots/planner--ready--mobile-390-mobile-390-darwin.png`
- `apps/web/playwright/tests/visual.spec.ts-snapshots/console-workspace--empty--desktop-1440-desktop-1440-darwin.png`
- `apps/web/playwright/tests/visual.spec.ts-snapshots/console-workspace--empty--mobile-390-mobile-390-darwin.png`

The only other tracked change is `docs/reviews/2026-07-16-rumia-snapshot-approval.md`: its six bounded-delta decisions are now `APPROVED`, retaining controller-review reasons and adding the owner approval date.

## Commits, status, and cleanup

- Baseline-images commit: `41c1265` — `test(visual): approve hardening baseline delta`.
- Evidence commit: this report and the approval ledger are introduced by the evidence commit; its SHA is reported in the final Task 5 handoff because a commit cannot self-reference its own object ID.
- `output/` remained untracked and unstaged. No test-results, HTML reports, environment files, or unrelated files were staged.
- Port `3105` was closed after both the family update and final gate.

## Concerns

None. The initial sandbox-only `EPERM` bind failure was resolved by rerunning the same local-only gate with the permitted listener boundary; the final gate itself exited `0` against the preserved Task 4 build identity.
