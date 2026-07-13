## Target

Release 2 chosen-activity feasibility preview and its handoff boundary.

## Dependents

`TripBrief` and `TripBriefSchema` have high fan-in across the trip API, database adapter, AI enrichment/generation, traveler workspace, account cards, and their tests. `PlannerSingleScreen` and `draftToPlannerUrl` are the immediate public-entry dependents.

## Affected Stories

- Rumia Activity-First Master Plan, Release 2 — chosen-day composition and preview.
- Rumia Activity-First Master Plan, Release 3 — persisted activity days and owner-scoped claim.

## Test Coverage

- `apps/web/app/planner/_components/planner-single-screen.test.tsx` covers planner choices and URL handoff.
- `apps/web/app/planner/_lib/choice-model.test.ts` covers draft normalization and URL construction.
- `apps/web/app/(marketing)/explore/workspace/*.test.tsx` covers selected activity continuity to the workspace.
- `apps/web/app/api/trips/route.test.ts`, `packages/db/src/index.test.ts`, and `packages/types/src/localization.test.ts` cover the existing trip-brief contract.
- Gap: a chosen-activity feasibility calculation and its truthful overload/cross-region states are not covered yet.

## Risk: High (8/10)

Changing `TripBrief` now would alter a shared contract with more than ten consumers and would mix Release 2 preview behavior with Release 3 persistence.

## Recommended action

Introduce a separate, URL-backed `ActivityDayDraft`/feasibility module for Release 2. Keep the existing `TripBrief` contract unchanged until Release 3 introduces the dedicated owner-scoped saved-day schema and migration. Add calculation and UI tests before wiring the preview.
