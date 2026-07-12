# Task 7 — Progressive activity-map capability

Date: 2026-07-12
Scope: optional, list-first activity map in `/explore/workspace`.

## Implementation

- Added a pure `ActivityMapModel` adapter with reviewed-status checks, stable
  activity IDs, coordinate/privacy validation, approximate-area labelling,
  five-point map cap, complete semantic list fallback, bounds, and top-down
  view-state helpers.
- Added `ActivityPointsLayer` with stable GeoJSON source/feature IDs,
  numbered circle/symbol markers, selected feature state, lifecycle teardown,
  and no route-line generation. The shared layer-channel registry keeps the
  layer isolated from traveller/route fixture channels.
- Extended `WorkspaceCanvas` with optional activity points, controlled
  selection, activity-marker callbacks, map error callback, fit/reset camera
  handle methods, accessible label override, and a `showRoute={false}` path so
  the activity map cannot render an invented itinerary line.
- Added the client `ActivityMap` facade and `ActivityMapFallback`. The map is
  dynamically imported by `ActivityWorkspace` only after an explicit `View on
  map` action. The list stays complete beside the map and in every error/static
  state; attribution, retry, fit, north reset, zoom, close/list, controlled
  selection, and reduced-motion camera behavior are included.
- Wired the workspace page through `mapEnabled` without changing homepage or
  backend behavior.

## Changed files

- `apps/web/app/(marketing)/_components/activity-map-model.ts`
- `apps/web/app/(marketing)/_components/activity-map-model.test.ts`
- `apps/web/app/(marketing)/_components/activity-map.tsx`
- `apps/web/app/(marketing)/_components/activity-map.test.tsx`
- `apps/web/app/(marketing)/_components/activity-map-fallback.tsx`
- `apps/web/app/(marketing)/explore/workspace/activity-workspace.tsx`
- `apps/web/app/(marketing)/explore/workspace/page.tsx`
- `packages/spatial-engine/src/adapters/maplibre/layer-channel.ts`
- `packages/spatial-engine/src/adapters/maplibre/layers/activity-points.ts`
- `packages/spatial-engine/src/adapters/maplibre/layers/activity-points.test.ts`
- `packages/spatial-engine/src/adapters/maplibre/spatial-engine.ts`
- `packages/spatial-engine/src/components/workspace-canvas.tsx`
- `packages/spatial-engine/src/index.ts`

## Verification

| Command | Result |
| --- | --- |
| `pnpm exec vitest run 'apps/web/app/(marketing)/_components/activity-map-model.test.ts' 'apps/web/app/(marketing)/_components/activity-map.test.tsx' 'apps/web/app/(marketing)/explore/workspace/activity-workspace.test.tsx' 'apps/web/app/(marketing)/explore/workspace/page.test.tsx' packages/spatial-engine/src/adapters/maplibre/layers/activity-points.test.ts` | PASS — 5 files, 17 tests |
| `pnpm --filter @repo/spatial-engine test` | PASS — 2 files, 6 tests |
| `pnpm --dir apps/web typecheck` | PASS |
| `pnpm --filter @repo/spatial-engine typecheck` | PASS |
| `pnpm lint:eslint` | PASS |
| `git diff --check` | PASS |
| `pnpm --dir apps/web test:e2e -- --grep "map\|spatial"` | BLOCKED — web server build could not start because `DATABASE_URL` is missing while collecting `/api/auth/[...all]`; no browser assertions ran |
| `pnpm --dir apps/web test:a11y` | BLOCKED — same missing `DATABASE_URL` web-server startup failure |
| `pnpm --dir apps/web test:perf` | BLOCKED — same missing `DATABASE_URL` web-server startup failure |

No visual snapshots were refreshed. The browser gates remain incomplete until
the local release environment supplies the required database/auth variables.

## Regression risk

The activity surface is opt-in and dynamically loaded; initial list/workspace
renders do not import the map facade or request tiles. The existing route layer
remains the default for legacy workspace/trip consumers. The provider remains
the documented CARTO candidate with visible OpenStreetMap/CARTO attribution;
production enablement still depends on the licensing record.

