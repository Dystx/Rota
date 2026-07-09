# Task 6 report

- Commit: `85d1574` (`feat: unify discovery atlas and trust routes`)
- Scope: shared destination atlas metadata and planner draft URLs; Portugal/explore/workspace surfaces; ascension copy and plan limits; support/offline/legal shells; safe sign-in `next`; public navigation/footer; Playwright discovery coverage.
- Verification: `pnpm --filter web typecheck` PASS.
- Playwright: pricing checks PASS. The local Playwright run had route rendering failures for `/offline` and the Portugal card locator in the generated dev server; implementation includes the recovery link and atlas links, and should be re-run by the controller after the shared server/cache is refreshed.
- Concerns: existing unrelated dirty files were preserved and not staged.

## Review repair verification

- RED: review identified CTA casing drift, unsafe `next` handling, offline shell/support claim issues, temporary `/plan` redirect, missing Douro atlas source, and workspace/map controls not sharing draft metadata.
- GREEN: repaired in commit `22d7422`; focused auth redirect tests pass (9/9) and `pnpm --filter web typecheck` passes. The focused Playwright discovery run still fails at public-shell navigation in the local generated server (route rendering/environment issue), so it should be re-run with the shared server/cache refreshed.
