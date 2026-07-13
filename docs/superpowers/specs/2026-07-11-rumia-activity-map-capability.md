# Rumia activity-map capability

## Decision

Add an optional map capability to Rumia as a **route-understanding and
activity-comparison layer**, not as a new product surface. The map must help a
traveller answer:

- Which selected activities are close enough to combine?
- What order makes sense for the time available?
- What changes when the traveller chooses walking, driving, or public
  transport?
- What is the practical shape of the day?

The activity cards and day list remain the primary interface. A traveller can
complete every important action without opening the map, and the map never
becomes a booking flow, destination finder, accommodation search, travel
agency, or chatbot.

Portugal-wide activity coverage remains the launch scope. Porto and Northern
Portugal can be the first deep content slice, but the map contract must be
region-agnostic and must work for any reviewed Portuguese activity that has
usable geographic evidence.

## Inspiration and licensing boundary

The referenced `london-3d` project demonstrates a useful family of ideas:
MapLibre rendering, building extrusions, landmark fly-to navigation, camera
storytelling, optional day/night presentation, responsive controls, and a
user-triggered cinematic tour. Its README identifies OpenFreeMap/OpenMapTiles
and OpenStreetMap as its data stack.

Rumia uses that project only as product and interaction inspiration. The
repository page exposes a small HTML/CSS/JS example but does not expose an
explicit project licence in the reviewed file listing. Until the author adds
an explicit licence or grants permission, Rumia must not copy its source code,
CSS, assets, visual composition, copy, landmark data, or distinctive camera
sequence. Rebuild the required behaviour from documented MapLibre APIs and
Rumia’s own editorial system.

MapLibre GL JS is the renderer already used by Rumia’s spatial engine. Its
BSD-3-Clause licence does not grant rights to arbitrary basemap styles,
vector tiles, OpenStreetMap-derived data, routing services, fonts, sprites, or
3D building datasets. Each provider and dataset needs a recorded attribution,
licence, quota, and retention decision before production use.

## Product rationale

Rumia’s differentiator is judgement about what deserves limited travel time.
Geography is useful only after that judgement exists: it can expose a bad
sequence, a long transfer, a weather-sensitive stop, or a good nearby pairing.
An optional map makes those trade-offs legible without turning Rumia into a
generic map directory.

The map should therefore be **evidence-led and selection-led**:

1. Rumia recommends a reviewed activity.
2. The traveller saves one or more activities.
3. The map explains proximity, order, and route consequences.
4. The traveller edits the selection or day in the list.

No camera movement, route line, building extrusion, or visual effect may imply
that an activity is worthwhile by itself. Editorial judgement remains in the
card and activity detail surface.

## First surface

The first version belongs in `/explore/workspace`, after the traveller has
selected at least one activity. The workspace can expose a clear **View on
map** control or a desktop list/map split, with the list selected by default.
The map is not mounted until the traveller asks for it or a map-specific
viewport is otherwise required.

`/explore` remains a results-and-selection surface. The homepage remains an
activity-situation entry surface. `/trip/[tripId]/map` can become the richer
saved-plan map in a later phase, once persistence and route contracts are
stable.

This placement preserves the current activity-first journey:

**situation → judged activities → selected day → optional spatial explanation**

## Phase 1 MVP: basic interactive activity map

Phase 1 is a practical, mostly 2D capability. It is not the 3D showcase.

### Included

- A lazy-loaded MapLibre map in `/explore/workspace` using the existing
  `@repo/spatial-engine` abstraction and a `mercator` projection.
- A top-down map by default; no globe, auto-rotation, or default pitch.
- One to five selected, reviewed activities represented as numbered markers.
- Bidirectional selection: selecting a card highlights its marker; selecting a
  marker identifies the corresponding card and updates the accessible status.
- A short, interruptible `flyTo`/`jumpTo` to a selected activity. It is a
  response to an explicit user action, never an automatic tour.
- `Fit this day`, `Reset north`, zoom controls, and a clear close/list toggle.
- A visible list equivalent containing every selected activity and its
  editorial metadata, whether or not WebGL or tiles load.
- A map-side or adjacent activity summary with the existing Rumia fields:
  verdict, why it fits, best time, duration, effort/cost band, and pairing or
  alternative guidance.
- Route geometry only when a server-provided, licensed route segment exists.
  If it does not exist, show ordering/proximity information in the list and
  do not draw an invented straight line.
- Basemap, route, and activity attribution that remains visible in compact and
  expanded map modes.
- A WebGL/tile/style error state that keeps the activity list fully usable and
  offers a retry or 2D/static alternative.

### Explicitly excluded from Phase 1

- A heavy 3D homepage or a globe as the product’s first interaction.
- Automatic tours, scroll-driven camera seizure, autoplay, or an unexplained
  “cinematic” transition.
- Building extrusions, terrain, fog, sky, lighting, day/night themes, or a
  custom WebGL/Three.js scene.
- Live navigation, turn-by-turn directions, current-location tracking,
  background location, or safety-critical travel instructions.
- Direct booking, availability, affiliate ranking, or in-map checkout.
- An infinite place directory, arbitrary map search, user-created pins, or a
  chatbot that narrates the map.
- Offline tile storage or a promise that the route works without network
  access.
- A requirement that the traveller manipulate the map to save, reorder,
  remove, share, or review an activity.

## Required data contract

The current `EditorialActivity` fields remain the editorial source of truth.
The map consumes a derived, validated projection rather than querying the
database or inventing facts in the browser.

### Activity fields

Required for a public map point:

```ts
type ActivityMapPoint = {
  activityId: string;
  title: string;
  region: ActivityRegion;
  coordinates: { lng: number; lat: number };
  locality: string;
  geometryPrecision: "exact" | "approximate";
  locationPrivacy: "public" | "coarse";
  editorialStatus: "reviewed";
  reviewedAt: string;
  verdict: string;
  bestFor: readonly string[];
  durationMinutes: number;
  bestTime: string;
  avoidWhen: string | null;
  bookingNeed: "none" | "consider" | "essential";
  pairWith: readonly string[];
  alternativeId: string | null;
  weatherFit: readonly ("sun" | "rain" | "either")[];
  effortLevel: "easy" | "moderate" | "demanding";
  costBand: "free" | "low" | "medium" | "high" | "varies";
  mobilityNotes: string | null;
  evidenceUrl: string;
  evidenceAttribution: string;
};
```

Coordinates must be checked for valid longitude/latitude ranges and must not
expose a private home, hotel room, or other sensitive location. An approximate
point must be labelled as approximate and must not be used to promise walking
time or exact accessibility.

### Itinerary stop fields

```ts
type ItineraryStop = {
  stopId: string;
  activityId: string;
  dayIndex: number;
  sequence: number;
  timeWindow: string | null;
  arrivalWindow: string | null;
  departureWindow: string | null;
  routeSegmentIds: readonly string[];
  cameraPresetId?: string;
};
```

`cameraPresetId` is not needed by Phase 1 and must not become the source of
truth for itinerary order. It is a Phase 2 presentation hint only.

### Route segment fields

```ts
type RouteSegment = {
  id: string;
  fromStopId: string;
  toStopId: string;
  mode: "walk" | "drive" | "transit";
  geometry: GeoJSON.LineString;
  distanceMeters: number;
  durationMinutes: number;
  source: string;
  retrievedAt: string;
  licence: string;
  attribution: string;
  fallbackAvailable: boolean;
};
```

The existing schematic `RouteStopPoint` contract uses normalized `x`/`y`
coordinates for an illustrative layer. It must not be silently reinterpreted
as longitude/latitude. A geographic route contract is a separate typed shape
and migration.

### Ephemeral map state

Viewport and selection are UI state, not editorial or itinerary truth:

```ts
type ActivityMapViewState = {
  mode: "list" | "map";
  selectedActivityId: string | null;
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  reducedMotion: boolean;
};
```

Do not persist a user’s last camera position as a route decision. Saved/share
links may persist selected activity IDs and day order, but not an unbounded
camera history.

## Proposed React and MapLibre architecture

### Reuse the existing spatial foundation

Use the existing provider-agnostic `@repo/spatial-engine` and its MapLibre
adapter. Do not import MapLibre directly into each page or create a second
map engine for the activity workspace. The current engine already provides
`WorkspaceCanvas`, `MapLibreSpatialEngine`, a Carto style provider, route
layers, camera controls, projection selection, attribution controls, and
reduced-motion hooks.

The activity capability should add a thin product facade:

- `ActivityMap` — client-only orchestration component, controlled by the
  workspace’s selected IDs and selection callbacks.
- `ActivityMapModel` — pure adapter from reviewed activities, stops, and route
  segments to stable GeoJSON features and a lookup map; no React or MapLibre
  imports.
- `ActivityPointsLayer` — a spatial-engine layer for reviewed activity points,
  stable feature IDs, selected state, and ordered marker labels.
- `ActivityRouteLayer` — reuse or extend the existing route layer for licensed
  `LineString` segments and mode styling; never fabricate geometry.
- `ActivityMapFallback` — semantic list/static-map/error surface that remains
  useful when the renderer cannot mount.

### Loading and ownership

- Keep `ActivityMap` behind a `dynamic(..., { ssr: false })` boundary.
- Mount it only after an explicit map intent or in a saved-plan map route where
  the user has asked for spatial context.
- Keep the selected activity list and day tray in the parent React tree; the
  map receives controlled `selectedActivityId` and emits `onSelectActivity`.
- Hold the imperative MapLibre handle in a ref owned by the map component. Do
  not put the live map instance, source objects, or camera events in global
  React state.
- Subscribe to MapLibre events once, clean them up on unmount, and avoid
  rerendering React on every pointer, tile, or camera frame.
- Update GeoJSON sources and feature state imperatively after validated input
  changes. Use stable source/layer IDs and remove them during teardown.
- Route requests and reviewed-activity projection happen server-side. The
  browser receives only the allowed, owner-scoped geometry and attribution;
  it never connects directly to PostgreSQL.

### MapLibre API boundary

The implementation may use documented MapLibre APIs such as `addSource`,
`addLayer`, GeoJSON sources, `setFeatureState`, `fitBounds`, `flyTo`, `jumpTo`,
`easeTo`, `AttributionControl`, and navigation controls. A Phase 1 map uses
`projection: "mercator"`, `cooperativeGestures: true`, and a style/provider
chosen through the existing style-provider boundary.

Phase 2 camera presets should be data, not hard-coded page choreography:

```ts
type CameraPreset = {
  id: string;
  stopId: string;
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  durationMs: number;
  label: string;
};
```

The existing `CameraChoreography` and `WorkspaceCanvasHandle` are candidates
for this controlled sequence. They must not be used to make the homepage or a
saved-plan page auto-play a tour.

## Mobile, accessibility, and performance requirements

### Mobile interaction

- The list is the default at 390px and smaller; `View map` is an explicit
  secondary action.
- Opening the map uses a contained panel or full-screen sheet with an obvious
  close/list action. It must not cover the fixed day tray or hide the selected
  card’s controls.
- Map controls and close/toggle actions are at least 44px where practical.
- Use cooperative gestures so page scrolling is not captured by a map on
  first touch. Do not require pinch/rotate to understand an activity.
- The list remains a complete, keyboard and screen-reader equivalent.
- No document-level horizontal overflow; test the map panel and the day tray
  together at 390x844.

### Accessibility

- Give the map a useful label and a nearby text summary such as “5 selected
  activities in Porto; the list below contains the same stops.”
- Every marker selection has an equivalent focusable activity control in the
  list. Marker clicks update focus or provide a deliberate focus-return path.
- Announce selection, map focus, route fallback, and tile/style errors through
  a bounded `role="status"`/`aria-live` region; do not rely on camera movement.
- Preserve a visible focus indicator, Escape-to-close behaviour for a map
  sheet, and no focus trap around an inline map.
- Respect `prefers-reduced-motion`: replace `flyTo`/camera choreography with
  `jumpTo` or an immediate state update, and never mark a map animation as
  essential.
- Do not encode meaning only through marker colour, pitch, animation, or
  route line style. Provide text labels and mode names.
- Use a 2D/list fallback when WebGL is unavailable or the user has a device
  setting that makes the renderer unreliable.

### Performance

- The homepage and `/explore` initial route must not import MapLibre or request
  map tiles before map intent. This keeps the existing public JS budget
  (`≤220KB`, excluding lazy map) meaningful.
- Lazy-load the map code, style, and activity geometry; cap Phase 1 to the
  selected set rather than the entire Portugal catalogue.
- Keep the initial Phase 1 feature set to five activities and a small number of
  route segments. Prefer vector-tile basemaps and small GeoJSON overlays.
- Avoid a React render for each camera frame; throttle any telemetry or
  viewport update to user-visible state changes.
- Record the lazy map chunk transfer, tile count, WebGL failure rate, map-open
  latency, and Core Web Vitals separately from the public-page budget.
- Stop loading optional terrain, extrusions, fonts, or imagery on mobile until
  a measured need and a legal provider decision exist.
- The map must never block the first contentful or largest contentful paint of
  the activity list.

## Risks, dependencies, and operational decisions

| Risk or dependency | Required decision or mitigation |
| --- | --- |
| Inspiration repository licence is not explicit | No source, asset, copy, data, or distinctive visual/camera sequence reuse without permission. Build from documented APIs. |
| Basemap/provider terms change | Keep provider, style URL, attribution, quota, and data-retention metadata in configuration and review them before each release. |
| MapLibre licence is confused with tile/data rights | Ship MapLibre notices and separate OSM, style, tile, glyph, sprite, and route attribution as required. |
| OpenFreeMap/OpenMapTiles availability or terms are unsuitable | Treat them as evaluated options, not defaults. The current CARTO adapter is development-only; the recommended production candidate is VPS-native PMTiles + Valhalla, pending the provider/licensing record and owner approval. |
| Route geometry has a separate licence or quota | Select a server-side route provider for Phase 2; cache only what its terms permit and retain source/attribution on every segment. |
| Existing globe fog warning and WebGL/device failures | Keep activity workspace in Mercator; remove unsupported globe configuration from this surface; provide a static/list fallback and browser-warning tests. |
| Exact coordinates expose private or sensitive places | Allow only reviewed public points; support coarse coordinates and disclose approximation. |
| Camera storytelling distracts from the decision | No autoplay, no scrolljacking, explicit controls, list-first default, and the typed `ENABLE_ACTIVITY_MAP` feature flag/kill switch. |
| 3D building data is incomplete or misleading | Defer extrusions to Phase 3, restrict to dense urban areas with a vetted source, and never use buildings to imply activity quality or accessibility. |
| Mobile battery/memory pressure | Keep 3D off by default on mobile, measure WebGL errors and memory proxies, and retain the list as the default. |
| Route and editorial data drift | Tie geometry to reviewed activity IDs and retrieval timestamps; invalidate stale segments and fall back to list/proximity language. |

## Phased roadmap

The map track is deliberately subordinate to the core generated-plan journey.
It is feature-flagged and cannot block the activity composer, judged results,
save/remove, workspace, or truthful fallback states.

### Phase 1 — Basic interactive activity map

**Timing:** after the Release 2 chosen-day composition gate is stable; before
any 3D investment. It may ship as an optional Release 2A capability and must
not delay Release 3 persistence work.

**Scope:** the `/explore/workspace` map/list toggle described above: reviewed
activity markers, selection sync, explicit focus, fit/reset controls, optional
licensed route segments, attribution, semantic fallback, and desktop/mobile
verification.

**Evidence to collect:** map-open intent, marker/card selection, fit/reset use,
route fallback frequency, map errors, list fallback use, save/share after map
use, and whether the map changes a traveller’s selected order.

### Phase 2 — Itinerary camera transitions and route storytelling

**Timing:** after Release 3 saved days, owner-scoped sharing, and server route
geometry are stable.

**Scope:** an explicit **Explore your plan** mode on a saved day; morning,
afternoon, and evening camera presets; step/previous/next/pause/stop controls;
walking, driving, and public-transport route segments; and cards that explain
why a stop fits, its time/effort/cost, and what combines nearby.

The traveller starts the mode explicitly and can exit at any time. There is no
autoplay on page load, no scroll-driven progression, no AI narrator, and no
requirement to complete the sequence. Reduced motion uses immediate camera
changes and retains the same textual order.

### Phase 3 — Richer 3D destination exploration

**Timing:** only after Phase 2 demonstrates repeated plan use and the provider,
data, and performance review passes.

**Scope:** optional low-pitch or pitched views, dense-urban building
extrusions, carefully selected terrain/elevation where it helps understand a
route, richer destination-level context, and a shareable interactive preview.

3D remains progressive enhancement. Mobile may stay 2D. The plan must always
have a practical top-down and list equivalent, and the 3D layer must be
removable by `ENABLE_ACTIVITY_MAP` if device or provider evidence changes.

## Phase 1 acceptance criteria

Phase 1 is ready only when all of the following are true:

1. A traveller can use the full activity list and day-tray flow without
   opening the map; the map appears only after an explicit `View on map` action
   or an equivalent deliberate control.
2. The homepage and initial `/explore` load do not import MapLibre or request
   map tiles. The lazy map boundary is observable in the performance trace.
3. With one to five reviewed activities from any covered Portuguese region,
   the map renders stable, numbered markers and a matching textual list.
4. Selecting a card highlights the marker and performs a short camera focus;
   selecting a marker identifies the same card. The interaction is interruptible
   and does not reorder or save anything silently.
5. `Fit this day`, `Reset north`, close/list, retry, and WebGL/tile fallback
   behaviours work at desktop and 390x844 mobile widths.
6. The default projection is 2D Mercator. There is no automatic rotation,
   globe fog, building extrusion, terrain, or tour in Phase 1.
7. A route line is rendered only from a validated, licensed route segment. A
   missing route produces a truthful proximity/list explanation, not a fake
   connector.
8. The activity summary includes the editorial verdict, fit, timing,
   duration/effort/cost, and pairing/alternative context. No booking, chatbot,
   AI-authorship, or availability claim appears.
9. Basemap, tile, route, and data attribution are visible and the provider
   licence record is attached to the release evidence.
10. Keyboard users can reach equivalent activity controls, close the map, and
    move focus predictably. Screen readers receive a map summary and live
    selection/error announcements. Axe has no serious/critical violations.
11. `prefers-reduced-motion` uses immediate camera/state changes. No essential
    information depends on motion, colour, pitch, or map interaction.
12. At 1440px and 390x844, there is no document overflow, tray overlap, or
    clipped map control; touch targets remain usable and page scrolling is not
    captured unexpectedly.
13. MapLibre instances, event handlers, sources, and layers are removed on
    unmount. Browser tests show no unsupported globe-fog warning or new
    unhandled map errors.
14. Unit tests cover the pure activity-to-GeoJSON adapter, coordinate/privacy
    validation, route fallback, and stable feature IDs. Playwright tests cover
    list/map synchronization, mobile fallback, keyboard/reduced-motion, and
    the no-map-before-intent performance assertion.

## Likely files and components

Planning and data:

- `docs/superpowers/plans/2026-07-10-rumia-activity-first-master.md`
- `docs/superpowers/specs/2026-07-11-rumia-activity-map-capability.md`
- `apps/web/lib/content/activities.ts` (or its eventual server projection)
- `packages/types/src/routing.ts` (add a separate geographic route contract;
  do not overload normalized schematic points)
- `packages/types/src/index.ts`

Consumer surfaces:

- `apps/web/app/(marketing)/explore/workspace/activity-workspace.tsx`
- `apps/web/app/(marketing)/explore/workspace/activity-map.tsx` (new,
  client-only facade)
- `apps/web/app/(marketing)/explore/workspace/activity-map-model.ts` (new,
  pure projection/GeoJSON adapter)
- `apps/web/app/(marketing)/explore/activity-explorer.tsx` only if a later
  results-level preview is justified; it is not required for Phase 1
- `apps/web/app/(app)/trip/[tripId]/map/map-components.tsx` for the Phase 2
  saved-plan integration
- `packages/ui/src/components/map.tsx` and related fallback/control primitives

Spatial engine:

- `packages/spatial-engine/src/components/workspace-canvas.tsx`
- `packages/spatial-engine/src/core/types.ts`
- `packages/spatial-engine/src/adapters/maplibre/layers/route-layer.ts`
- `packages/spatial-engine/src/adapters/maplibre/layers/activity-points.ts`
  (new, if the existing route layer cannot represent selected activity points)
- `packages/spatial-engine/src/core/camera-choreography.ts` for Phase 2 only
- `packages/spatial-engine/src/core/map-style-provider.ts` and provider
  attribution/configuration
- `apps/web/app/_components/maplibre-error-suppressor.tsx` and its tests for
  warning/cleanup evidence

Verification:

- `apps/web/playwright/tests/integration/activity-map.spec.ts` (new)
- `apps/web/playwright/tests/integration/trip-map.spec.ts` (extend in Phase 2)
- `apps/web/playwright/tests/accessibility.spec.ts`
- `apps/web/playwright/tests/perf.spec.ts`
- `apps/web/playwright/tests/visual.spec.ts` and map snapshots
- focused Vitest tests for the projection, layer lifecycle, and fallback

## Build-order recommendation

Build this **after** the core generated-plan journey is stable, not before it.
The required order is:

1. Portugal-wide reviewed activity corpus and editorial adapter.
2. Phrase-led activity situation and judged results.
3. Save/remove/reorder and the workspace/list day contract.
4. Chosen-day composition and truthful route/list preview.
5. Phase 1 map as an optional progressive enhancement.
6. Persisted saved days and licensed route geometry.
7. Phase 2 camera storytelling.
8. Phase 3 3D exploration only after evidence and legal/performance review.

This order protects the product’s actual promise: Rumia must first prove that
its activity judgement helps people choose. The map can then make a good
choice easier to understand; it cannot rescue weak curation.

## References

- Inspiration project: <https://github.com/siddsachar/gpt5.6-sol-test/tree/main/london-3d>
- MapLibre GL JS Map API: <https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/>
- MapLibre source specification: <https://maplibre.org/maplibre-style-spec/sources/>
- MapLibre examples, including camera, GeoJSON, attribution, and 3D patterns: <https://maplibre.org/maplibre-gl-js/docs/examples/>
- MapLibre GL JS licence: <https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt>
- Existing Rumia spatial-engine contract: `packages/spatial-engine/README.md`
