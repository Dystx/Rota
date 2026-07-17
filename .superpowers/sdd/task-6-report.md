# Task 6 report

- Commit: `85d1574` (`feat: unify discovery atlas and trust routes`)
- Scope: shared destination atlas metadata and planner draft URLs; Portugal/explore/workspace surfaces; ascension copy and plan limits; support/offline/legal shells; safe sign-in `next`; public navigation/footer; Playwright discovery coverage.
- Verification: `pnpm --filter web typecheck` PASS.
- Playwright: pricing checks PASS. The local Playwright run had route rendering failures for `/offline` and the Portugal card locator in the generated dev server; implementation includes the recovery link and atlas links, and should be re-run by the controller after the shared server/cache is refreshed.
- Concerns: existing unrelated dirty files were preserved and not staged.

## Review repair verification

- RED: review identified CTA casing drift, unsafe `next` handling, offline shell/support claim issues, temporary `/plan` redirect, missing Douro atlas source, and workspace/map controls not sharing draft metadata.
- GREEN: repaired in commit `22d7422`; focused auth redirect tests pass (9/9) and `pnpm --filter web typecheck` passes. The focused Playwright discovery run still fails at public-shell navigation in the local generated server (route rendering/environment issue), so it should be re-run with the shared server/cache refreshed.

## Corrective-plan Task 6: Explore decision loop and visible save feedback

- Scope: `ActivityExplorer` now has an explicit 8/4 desktop decision grid with stable `explore-results-column`, `judged-activities`, and `explore-day-rail` landmarks. The rail keeps an authored empty state with save/time guidance and a next-action link; the saved tray has a stable `activity-day-tray` marker, count, total time, safe-area positioning, and the existing `See this day` handoff.
- Interaction contract: saving/removing keeps the card `data-saved` marker and `aria-pressed` state, announces the result through the live status region, and updates the saved query state in the same toggle path. The mobile tray is rendered only after at least one activity is saved; the Explore shell reserves matching safe-area bottom space.
- RED: added the cross-surface save test; it failed because the non-empty tray had no stable test marker.
- GREEN: focused Vitest passed: 3 files, 14 tests (`activity-explorer`, `activity-result-card`, `activity-day-tray`).
- Type checks: `pnpm --dir apps/web run typecheck` PASS; `pnpm --dir apps/web run test:typecheck` PASS.
- Browser check: bounded `public-discovery.spec.ts` save grep for `desktop-1440` and `mobile-390` could not start the configured standalone server because `DATABASE_URL` is missing during `/api/auth/[...all]` page-data collection. No long-lived development server was started.
- Dirty-boundary split: the staged Task 6 patch contains only the new decision-loop markers, saved lookup contract, empty-rail next action, tray marker, component/interaction assertions, and browser assertions. Pre-existing media/chapter, typography, `Button` card, and mobile-padding hunks in the same listed files remain unstaged for their owning work.

## Corrective release-review fix: touch targets and mobile focus clearance

- RED: release review caught the `@repo/ui` small save/remove control at 36px and no explicit focus clearance for the fixed mobile tray. New component assertions failed before implementation.
- GREEN: save/remove controls now carry the 44px `min-h-11 min-w-11` contract plus `scroll-mb-[calc(8rem+env(safe-area-inset-bottom))]`; the tray remove action carries the same focus-safe scroll margin. This complements the existing Explore shell bottom padding and safe-area tray offset.
- Verification: focused Vitest 3 files / 15 tests PASS; web typecheck PASS; Playwright typecheck PASS; `git diff --cached --check` PASS.
- Dirty-boundary split: the fix commit stages only the new class/assertion hunks. The pre-existing `ActivityResultCard` Button migration and tray element/typography changes remain unstaged for their owning work.
