# Rumia frontend release-gate evidence

Date: 2026-07-12
Branch: `codex/rumia-phase0`
Scope: frontend aesthetic rework Tasks 1–9, including the optional Phase 1
activity map.

## Static gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Root typecheck | PASS | 15/15 packages passed |
| ESLint | PASS | `pnpm lint:eslint` |
| Production build | PASS | 2/2 build targets passed with local PostgreSQL/Better Auth test env |
| Diff check | PASS | `git diff --check` |
| Motion gate | PASS | 434 files checked |

## Browser gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Smoke E2E | PASS | 6/6 |
| Accessibility | PASS | 61 passed, 1 expected skip (62 total) |
| Performance + Web Vitals | PASS | 14/14 |
| Mobile overflow | PASS | 32 mobile checks passed; 32 desktop cases intentionally skipped |
| Viewport contract | PASS | 120/120 `@viewport-qa` checks |
| Visual snapshots | **FAIL / review required** | 14/70 passed; 56 mismatched; no snapshots refreshed |

The visual failures are expected to include intentional changes from the
approved editorial redesign and stale baselines from the prior UI. They are
not accepted automatically. The failing actual/expected/diff artifacts remain
under `apps/web/playwright/test-results/` for route-by-route review at desktop
and mobile widths.

## Activity-map evidence

- Pure model, fallback, layer, and facade tests: 10/10 passed.
- Spatial-engine package tests: 6/6 passed.
- Web and spatial typechecks passed.
- Dedicated browser proof: `public-discovery.spec.ts` activity-map test passed
  1/1 on desktop Chrome (explicit open, map-or-fallback surface, complete list,
  and close/list recovery).
- No map snapshots were added or refreshed.

## Required follow-up

1. Review the 56 visual diffs at 1440px and 390px route-by-route.
2. Keep intentional redesign changes only after human visual confirmation;
   update snapshots in a separate, explicitly reviewed change.
3. Keep the dedicated map test in the public discovery suite; add a mobile
   execution and licensed-provider/browser-error fixture before expanding the
   map beyond Phase 1.

## Status

**PARTIAL — functional gates and Phase 1 map browser proof are green; visual
acceptance remains open.**

No browser or snapshot failure is being reclassified as green by this report.
