# How Rumia renders + how the 3D / 2D map works

> Generated 2026-07-03. Source of truth for the render
> architecture and the spatial-engine abstractions. Pairs
> with `docs/roadmap.md` (operational state),
> `docs/engineering-lifecycle.md` (8-phase plan), and
> `docs/adr/` (decision records).

---

## 1. The render architecture (Next.js 16 App Router)

The frontend is `apps/web/` (Next.js 16, App Router, Turbopack).
The split:

| Layer | Where it runs | When it ships HTML |
|---|---|---|
| **React Server Components (RSC)** | Next.js server | First paint (HTML stream) |
| **Server actions** (`"use server"`) | Next.js server | Mutations + form posts |
| **Client components** (`"use client"`) | Browser | Interactivity, browser-only APIs (MapLibre, WebGL, IndexedDB) |
| **Next.js route handlers** | Next.js server | `/api/*` JSON endpoints + the B2B API gateway |
| **`apps/workers`** | Long-running Node process | QStash cron, data pipeline (DuckDB + OpenAI) |

RSC streams the initial HTML. The hero map (the biggest
first-paint cost) is **never** on the server — it uses
`next/dynamic({ ssr: false })` to defer MapLibre to the
client. The server-rendered fallback is a pulsing gradient
skeleton (`HeroSkeleton`). MapLibre touches `window`/`document`
and a WebGL context, so SSR would throw.

The **Zustand store** at `apps/web/store/useMapStore.ts` is the
cross-component glue. It's not the renderer — it's the in-memory
state layer (active stop, viewport, day, target coordinates).
Client components read/write it; the actual `setData` on the
MapLibre source goes through the high-frequency
`useMapSourceSync` hook (added in PR-8), which subscribes to
the store and mutates the source directly so React doesn't
re-render on every viewport tick.

### Where rendering happens (RSC vs client) at runtime

- **Server-rendered:** the home page shell, the workspace page
  shell, the trip page header, the auth flows. First paint is
  HTML.
- **Client-rendered (after hydration):** the hero map, the
  workspace canvas, the trip map, the bento interactions, the
  side-by-side review panel, the behavior profiler, the
  IndexedDB persistence, the Supabase Realtime subscriptions.
- **Long-running client:** the service worker
  (`apps/web/public/sw.js`) for PWA + offline cache; the
  pagehide/pageshow listeners in `behavior-persistence.tsx`
  that flush the in-memory profiler ring to IndexedDB.

---

## 2. The spatial engine — provider-agnostic core + MapLibre adapter

The map is a **two-layer abstraction**:

```
┌─────────────────────────────────────────────────────────────┐
│  apps/web (React) — GlobeWorkspace, WorkspaceCanvas        │
│  dynamic({ssr:false}) — only mounts in the browser          │
└──────────┬──────────────────────────────────────────────────┘
           │ uses the abstract interface
           ▼
┌─────────────────────────────────────────────────────────────┐
│  @repo/spatial-engine — provider-agnostic types           │
│  (SpatialEngine, SpatialLayer, CameraController,            │
│   TelemetryService, MapStyleProvider)                      │
└──────────┬──────────────────────────────────────────────────┘
           │ implemented by
           ▼
┌─────────────────────────────────────────────────────────────┐
│  MapLibreSpatialEngine — the only place that knows           │
│  the renderer is MapLibre (one of many possible             │
│  adapters; CesiumJS / deck.gl would satisfy the same shapes)│
└─────────────────────────────────────────────────────────────┘
```

The contract in `core/types.ts` is small and tight:

- **`SpatialEngine`** — `mount(container)`, `register(layer)`,
  `getCamera()`, `getTelemetry()`, `playChoreography()`,
  `unmount()`
- **`SpatialLayer`** — `onAttach(ctx) / onUpdate(ctx, fc) /
  onDetach(ctx)` lifecycle
- **`CameraController`** — `focus(target)`, `returnHome()`,
  `followUser(active)`, `fitBounds(bounds)`
- **`TelemetryService`** — `subscribe(channel, listener) /
  publish(channel, features) / shutdown()`
- **`MapStyleProvider`** — `getStyle(theme): { id, name, url,
  attribution? }`

Only `MapLibreSpatialEngine` knows about `maplibre-gl`. Everything
above it can be renderer-agnostic. A future CesiumJS / deck.gl
adapter would satisfy the same shapes.

---

## 3. The two map surfaces (3D globe vs 2D mercator)

The project ships **two map components** that share the same
engine:

### `GlobeWorkspace` (3D, "Discovery")

- **Projection:** `map.setProjection({ type: "globe" })` —
  MapLibre's 3D globe projection
- **Initial state:** Portugal centroid (`-8.165°, 39.55°`),
  zoom 3.4, bearing -12° so the Iberian Peninsula reads as
  Portugal-first
- **Lighting:** built-in `setFog()` with linen (horizon) →
  deep indigo (high) → near-black (space) palette tied to the
  design tokens
- **3D terrain:** opt-in via `TerrainOptions` (AWS Terrarium
  DEM tiles, exaggeration 1.4)
- **Atmosphere layers:** opt-in `RadialGradientAtmosphereLayer`
  (soft halo) + `StarfieldLayer` (~26k star points on a unit
  sphere, depth-tested against the globe) — both are
  `CustomLayerInterface` instances that get added directly to
  MapLibre, not standard paint layers
- **Use:** home hero (`/`), marketing `/explore` (Discovery
  Hub), the cinematic intro beat

### `WorkspaceCanvas` (2D, "Workspace")

- **Projection:** `mercator` (the default — flat 2D)
- **Initial state:** same centroid, zoom 5.6 (zoomed in for
  editing)
- **No 3D terrain, no atmosphere layers** — the curvature
  obscures precision edits
- **Use:** `/explore/workspace`, the specialist review surface,
  the trip-editing canvas

### The shared-engine pattern

The hero (`apps/web/app/(marketing)/hero-map.tsx`) is the
clearest example: one `HeroMap` component, a `projection` state
variable, and a **toggle pill** in the top-right. Switching from
"3D Globe" to "2D Plan" doesn't unmount the engine or the layer
registry — it bumps a `tick` that remounts the child with the
other projection. The Zustand store survives across both, so
a `selectStop()` from the bento grid works whether the user is
in 3D or 2D.

```tsx
const [projection, setProjection] = useState<HeroProjection>("globe");
return projection === "globe"
  ? <GlobeWorkspace key={`globe-${tick}`} … />
  : <WorkspaceCanvas key={`workspace-${tick}`} … />;
```

---

## 4. The layers (what actually gets rendered)

There are **5 layers** + 2 atmosphere overlays. Each is a
`SpatialLayer` (lifecycle: `onAttach / onUpdate / onDetach`) or a
MapLibre `CustomLayerInterface`:

| Layer | Type | Where it shows up |
|---|---|---|
| `AmbientPulseLayer` | GeoJSON circle (animated radius) | Travelers as glowing dots on the map |
| `SymbolBadgesLayer` | GeoJSON symbol | Destination markers (icon badges) |
| `RouteLayer` | GeoJSON line + stops | Itinerary route — the `RouteStops` (clickable) + `RouteLine` sublayers |
| `RadialGradientAtmosphereLayer` | `CustomLayerInterface` (WebGL) | Soft halo around the globe |
| `StarfieldLayer` | `CustomLayerInterface` (WebGL) | Background stars on the globe |

**Layer IDs that participate in click forwarding** are exported
as `CLICKABLE_LAYER_IDS` — a constant the React components use
to filter `queryRenderedFeatures` so only the right layers emit
`onStopClick`.

The convenience factories `createDiscoveryEngine()` and
`createWorkspaceEngine()` in `adapters/maplibre/spatial-engine.ts`
pre-register the standard layers for each surface so consumers
don't have to wire them manually.

---

## 5. The camera + telemetry

- **`SpatialCameraController`** wraps the MapLibre `easeTo`/`flyTo`
  executor with: `focus(target)`, `returnHome()`,
  `followUser(active)`, `fitBounds(bounds)`. Honors
  `reducedMotion` (jumps instead of animates) for accessibility.
- **`InMemoryTelemetryService`** is the current fixture-backed
  service. It batches publishes to a single `setData()` per
  animation frame. The next phase swaps this for a Supabase
  Realtime subscriber (per-channel: `travelers`, `specialists`,
  `trips`, `weather`, `events`).
- **`CameraChoreography`** lets a route page play a multi-beat
  camera intro (e.g. `playChoreography([zoomOut, panTo, zoomIn,
  ...])`) on first mount. The exploration page uses this for
  the "iberian-context" beat.

---

## 6. The high-frequency path (the perf win)

The naive flow is: Zustand changes → React re-renders the map
component → MapLibre source `setData`. That's a React render
per viewport tick. For smooth drag/zoom, it's a bottleneck.

The `useMapSourceSync` hook (added in PR-8) subscribes to the
Zustand store **outside** of React's render cycle:

1. Trip page mounts → calls `registerMapSource(map.getSource('stops'))`
   to hand the live source to the store
2. The store calls `activeMapSource.setData(featureCollection)`
   whenever `activeStopId` changes
3. The store unregisters the source on unmount

No React re-render happens for source mutations. MapLibre's
WebGL pipeline gets the data directly.

---

## 7. Where the rendering happens (RSC vs client) at runtime

- **Server-rendered:** the home page shell, the workspace page
  shell, the trip page header, the auth flows. First paint is
  HTML.
- **Client-rendered (after hydration):** the hero map, the
  workspace canvas, the trip map, the bento interactions, the
  side-by-side review panel, the behavior profiler, the
  IndexedDB persistence, the Supabase Realtime subscriptions.
- **Long-running client:** the service worker
  (`apps/web/public/sw.js`) for PWA + offline cache; the
  pagehide/pageshow listeners in `behavior-persistence.tsx`
  that flush the in-memory profiler ring to IndexedDB.

---

## 8. The pieces that aren't the map

- **Styling:** Tailwind v4, design tokens as CSS custom
  properties in `packages/ui/src/styles.css`
  (`--color-linen`, `--color-slate`, `--color-ochre`, etc.).
  The `SpatialPalette` type in `core/types.ts` mirrors the
  same tokens so the on-map paint properties (point colors,
  line colors) match the rest of the UI.
- **Charts/visuals:** MapLibre for the geo. Plain SVG for the
  bento. Framer-Motion is in the dependency tree (used for
  the page-transition component) but the maps themselves are
  pure WebGL.
- **3D textures (none yet):** The atmosphere + starfield are
  procedural WebGL drawn each frame. The data pipeline
  (PR-4/5) is the only thing that brings in real 3D assets
  (none planned for v1).

---

## 9. File index (for the implementation reference)

| Path | Purpose |
|---|---|
| `apps/web/app/(marketing)/hero-map.tsx` | The 3D↔2D projection switcher on `/` |
| `apps/web/app/(marketing)/explore/discovery-globe.tsx` | The 3D globe Discovery Hub |
| `apps/web/app/(marketing)/explore/workspace/page.tsx` | The 2D workspace page |
| `apps/web/app/(marketing)/explore/workspace/workspace-canvas-client.tsx` | The 2D client component |
| `apps/web/app/(app)/trip/[tripId]/_components/workspace-trip-canvas.tsx` | The trip-edit canvas |
| `apps/web/app/(app)/trip/[tripId]/_components/cinematic-map-section.tsx` | The cinematic intro beat |
| `apps/web/app/(app)/trip/[tripId]/map/map-components.tsx` | The trip-detail map |
| `apps/web/store/useMapStore.ts` | Cross-page Zustand state (viewport, active stop, target, source registration) |
| `apps/web/store/useMapSourceSync.ts` | The high-frequency source-mutation path (PR-8) |
| `packages/spatial-engine/src/index.ts` | Package entry — exports GlobeWorkspace, WorkspaceCanvas, factory helpers, layer IDs |
| `packages/spatial-engine/src/core/types.ts` | The provider-agnostic contract (SpatialEngine, SpatialLayer, CameraController, TelemetryService, MapStyleProvider) |
| `packages/spatial-engine/src/core/camera-controller.ts` | SpatialCameraController (eased moves, reduced-motion) |
| `packages/spatial-engine/src/core/camera-choreography.ts` | Multi-beat camera intros |
| `packages/spatial-engine/src/core/layer-registry.ts` | LayerRegistry (unused; engine has its own layers map) |
| `packages/spatial-engine/src/core/map-style-provider.ts` | `CartoBasemapStyleProvider` (open-source vector tiles) |
| `packages/spatial-engine/src/core/telemetry-service.ts` | `InMemoryTelemetryService` (Supabase Realtime swap is the next phase) |
| `packages/spatial-engine/src/core/viewport.ts` | Viewport state helpers |
| `packages/spatial-engine/src/adapters/maplibre/spatial-engine.ts` | The `MapLibreSpatialEngine` — the only MapLibre-aware file |
| `packages/spatial-engine/src/adapters/maplibre/map-instance.ts` | `mountMapLibreInstance()` (the WebGL bootstrap) |
| `packages/spatial-engine/src/adapters/maplibre/layers/ambient-pulse.ts` | Animated traveler dot layer |
| `packages/spatial-engine/src/adapters/maplibre/layers/symbol-badges.ts` | Destination marker layer |
| `packages/spatial-engine/src/adapters/maplibre/layers/route-layer.ts` | Itinerary route + stops sublayer |
| `packages/spatial-engine/src/adapters/maplibre/layers/radial-gradient-atmosphere.ts` | Soft halo custom WebGL layer |
| `packages/spatial-engine/src/adapters/maplibre/layers/starfield.ts` | ~26k star points on a unit sphere |
| `packages/spatial-engine/src/components/globe-workspace.tsx` | The 3D React component |
| `packages/spatial-engine/src/components/workspace-canvas.tsx` | The 2D React component |
| `packages/spatial-engine/src/fixtures/` | `fixtureTravelerCollection`, `fixtureRouteCollection`, `DESTINATION_PRESETS` (until the data pipeline lands) |

---

## 10. Why the abstraction is worth it

The whole point of the provider-agnostic core is the day
someone asks "can we ship a deck.gl variant for the
specialist review surface that handles 10k+ stops at 60fps?"
The answer becomes: write `DeckGlSpatialEngine implements
SpatialEngine`, register the existing layers (or new ones),
mount the same React component. The consumers (trip pages,
workspace, hero) don't change. The Zustand store doesn't
change. The `useMapSourceSync` hook doesn't change.

The cost is one extra layer of indirection in the code paths
the team owns. The benefit is the platform can swap the
renderer without rewriting the application. The data flow
is the contract; the renderer is a detail.
