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

## Corrective-plan Task 7 — Activity judgement cover and compact Workspace

Date: 2026-07-17
Scope: activity detail first viewport, chosen-day states, and explicit map/list parity.

### Implementation

- Recomposed the activity detail `RouteScene` as a contained cover: local poster media, declared desktop/mobile text-safe zones, readable title/verdict foreground, time-to-allow and leave-room caveats, and a single save action inside the cover. The mobile action bar uses safe-area padding and document bottom padding so evidence remains reachable.
- Added explicit `empty`, `one`, and `multiple` Workspace state markers. The chosen sequence now exposes total activity time, travel/pause room, remove and bounded earlier/later reorder controls, and URL-preserving order changes.
- Invalid activity IDs from a share URL (or an explicit caller-provided list) are announced without mutating valid selections. The optional map remains user-triggered and its fallback list exposes stable activity IDs/durations for parity checks.
- Added browser assertions for detail first-viewport geometry, save/evidence separation, empty Workspace disclosure, and map/list order parity across the configured projects.

### Verification

| Command | Result |
| --- | --- |
| `pnpm exec vitest run apps/web/app/(marketing)/activities/[activityId]/page.test.tsx apps/web/app/(marketing)/activities/[activityId]/_components/activity-detail-save-action.test.tsx apps/web/app/(marketing)/explore/workspace/activity-workspace.test.tsx apps/web/app/(marketing)/_components/activity-map.test.tsx` | PASS — 4 files, 23 tests |
| `pnpm --dir apps/web typecheck` | PASS |
| `pnpm --dir apps/web test:typecheck` | PASS |
| `git diff --cached --check` | PASS |
| bounded Playwright public-discovery grep (`activity detail`, `empty Workspace`, `activity map`) | BLOCKED — config web server emitted repeated startup warnings and did not become reachable; interrupted before a long-lived Next process could consume memory. No browser assertions or snapshots were recorded. |

### Dirty-boundary split

Only the nine Task 7 paths named in the brief were staged for the implementation commit. The repository remains intentionally dirty; no database, Auth, schema, spatial-engine, route-catalogue, snapshot, or unlisted-file changes were staged. Some same-file presentation hunks already present in the dirty worktree (notably map/workspace typography and prior cinematic empty-state composition) remain included in the staged Task 7 paths because the narrow index split was not reliable; they were preserved verbatim and are called out here for reviewer separation. No old map report or stale spatial-engine files were staged.

### Corrective release review pass

Date: 2026-07-17

- Removed the duplicate empty-Workspace recovery link and explicitly overrode
  the legacy `29rem` route class with a content-bounded `!min-h-0` state.
- Moved the activity save bar out of the `RouteScene` action slot. It is now a
  page-level fixed mobile bar with safe-area/document padding and a desktop
  absolute overlay aligned to the cover bottom.
- Kept the map fallback warning aligned with the selected activity record's
  `avoidWhen` caveat, including records without safe map geometry, and added a
  browser parity assertion for that warning.

| Command | Result |
| --- | --- |
| focused Task 7 Vitest (`page`, save action, workspace, activity map) | PASS — 4 files, 24 tests |
| `pnpm --dir apps/web typecheck` | PASS |
| `pnpm --dir apps/web test:typecheck` | PASS |
| `git diff --check` on corrective paths | PASS |
| Playwright browser run | Not rerun — the prior config web-server startup remained blocked; no long-lived Next process was started because of the known memory incident. |

The corrective diff is limited to the Task 7-listed detail, Workspace, map,
fallback, and public-discovery files. The worktree remains intentionally dirty;
no globals, schema, Auth, runtime, or unlisted map-model files were changed by
this pass.
