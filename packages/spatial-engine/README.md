# `@repo/spatial-engine`

Provider-agnostic map and globe foundation for Rumia.

The spatial engine is the single source of truth for the interactive map surface across every consumer: the home hero canopy, the `/explore` discovery hub, the `/explore/workspace` trip editor, and the `/trip/[id]/map` page. It owns the renderer lifecycle, the camera, the live data stream, and the layer registry — and it is renderer-agnostic, so swapping MapLibre GL JS for deck.gl or CesiumJS tomorrow is a factory change, not a rewrite of every consumer.

---

## 1. Overview

Rumia's product surfaces are anchored to a map. The discovery hub invites a user to explore the world; the workspace lets them edit a route; the trip page zooms into a stop. The same map instance (or at least the same engine contract) backs every one of those moments, with the same live presence stream, the same camera choreography, and the same layer registry.

This package exists to enforce that invariant. The rest of Rumia depends on the abstract `SpatialEngine`, `CameraController`, `TelemetryService`, and `SpatialLayer` interfaces in `core/types.ts` — never on MapLibre directly. Today there is one concrete adapter, `MapLibreSpatialEngine`; future adapters must satisfy the same shapes.

The engine ships with two React entry points: `GlobeWorkspace` (3D, marketing / discovery) and `WorkspaceCanvas` (2D, trip editing). Both own one engine instance for their lifetime and seed the telemetry channels with deterministic fixtures so the surface is correct from the first frame.

Phase status: the engine itself, the MapLibre adapter, the layer registry, the camera choreography, and the destination deep-link fixtures are all stable. The Phase 1e migration of `@repo/maps` (`CinematicMap`, `ProviderMap`) onto this engine is complete; the package has been deleted — see §10 below for the history.

---

## 2. Architecture

```
                                  ┌────────────────────────────────────────┐
                                  │   Core (renderer-agnostic contracts)   │
                                  │   core/types.ts · core/layer-registry   │
                                  │   core/camera-controller · core/telem.. │
                                  └────────────────────────────────────────┘
                                                  ▲               ▲
                  ┌───────────────────────────────┼───────────────┼─────────────┐
                  │                               │               │             │
        ┌─────────┴─────────┐         ┌───────────┴────┐  ┌───────┴──────┐      │
        │  MapLibre adapter  │         │ InMemory       │  │  Camera      │      │
        │  MapLibreSpatial.. │         │ Telemetry      │  │  Choreo..    │      │
        │  + mountMapLibre.. │         │ Service        │  │  (beat/play) │      │
        │  + 3 layers        │         └────────────────┘  └──────────────┘      │
        └─────────┬─────────┘                                                       
                  │                                                                
        ┌─────────┴──────────┐     ┌──────────────────┐                           
        │ CartoBasemap..     │     │ LayerRegistry    │  ◀── visibility + reorder  
        │ (CARTO tiles)      │     │ (engine facade)  │                           
        └────────────────────┘     └──────────────────┘                           
                                                                                  
                  ┌────────────────────┐         ┌────────────────────────┐     
                  │   GlobeWorkspace   │         │    WorkspaceCanvas     │     
                  │  (3D, projection:  │         │   (2D, projection:     │     
                  │   globe)           │         │   mercator)            │     
                  └─────────┬──────────┘         └────────────┬───────────┘     
                            │                                  │                 
              ┌─────────────┼──────────────┐    ┌──────────────┼──────────────┐ 
              ▼             ▼              ▼    ▼              ▼              ▼ 
         home hero      /explore      /explore/workspace    /trip/[id]/map     …   
```

**Consumer mapping**:

| Surface | Component | Projection | Notes |
|---|---|---|---|
| Home hero canopy | `GlobeWorkspace` + `WorkspaceCanvas` (toggle) | `globe` / `mercator` | `disableIntro`, Iberia-anchored |
| `/explore` Discovery Hub | `GlobeWorkspace` | `globe` | intro choreography: world → Europe |
| `/explore/workspace` Trip editor | `WorkspaceCanvas` | `mercator` | intro: context → fit route → first stop |
| `/trip/[id]/map` (Phase 1e) | `WorkspaceCanvas` | `mercator` | replaces `CinematicMap` |

---

## 3. Public API

Every symbol below is exported from the package root (`@repo/spatial-engine`). The package's `exports` field also exposes `@repo/spatial-engine/globe` as a thin re-export of `GlobeWorkspace` for codebases that only need the discovery component.

### 3.1 Core types (`./core/types`)

| Symbol | Kind | Purpose |
|---|---|---|
| `SpatialEngine` | interface | Mount + register + visibility + camera + telemetry facade. |
| `SpatialLayer` | interface | `onAttach` / `onUpdate` / `onDetach` lifecycle every layer must satisfy. |
| `SpatialLayerContext` | interface | Renderer-agnostic context passed to layers (`setData`, `setVisibility`). |
| `SpatialEngineOptions` | interface | Constructor options: `style`, `initialTarget`, `palette`, `reducedMotion`, `projection`. |
| `MapStyleProvider` | interface | Resolves the active style endpoint based on theme. |
| `MapStyleEndpoint` | interface | A vector tile + glyph + sprite style URL plus attribution. |
| `SpatialPalette` | interface | Color tokens shared across providers (primary, ochre, linen, sage, …). |
| `CameraController` | interface | `focus`, `returnHome`, `followUser`, `fitBounds` — every renderer's camera speaks this. |
| `CameraTarget` | interface | `{ center?, zoom?, pitch?, bearing?, duration? }` projection-aware. |
| `CameraExecutor` | interface | Thin renderer-specific flyTo / jumpTo / fitBounds proxy. |
| `TelemetryService` | interface | Pub/sub over named channels with batched flush + replay-on-subscribe. |
| `TelemetryChannel` | type | `"travelers" \| "specialists" \| "trips" \| "weather" \| "events"`. |
| `SpatialFeature` | type | A single GeoJSON `Point` / `MultiPoint` / `Polygon` / `LineString` feature. |
| `SpatialFeatureCollection` | interface | A `FeatureCollection` of `SpatialFeature`s. |

### 3.2 MapLibre adapter (`./adapters/maplibre/*`)

| Symbol | Kind | Purpose |
|---|---|---|
| `MapLibreSpatialEngine` | class | The only `SpatialEngine` implementation in the package; backs both `GlobeWorkspace` and `WorkspaceCanvas`. |
| `createDiscoveryEngine` | function | Factory that wires ambient + badges layers and uses `projection: "globe"` defaults. |
| `createWorkspaceEngine` | function | Factory that wires ambient + badges + route layers and uses `projection: "mercator"` defaults. |
| `bindLayerToChannel` | function | Internal helper layers call in their constructor to opt into a `TelemetryChannel`. |
| `mountMapLibreInstance` | function | Mounts a `maplibregl.Map` and returns `{ map, executor }` for advanced integrations. |
| `MapLibreInstanceOptions` | type | Options for `mountMapLibreInstance` (`container`, `style`, `initialTarget`, `reducedMotion`, `projection`). |
| `CartoBasemapStyleProvider` | class | `MapStyleProvider` for CARTO Positron (light) + Dark Matter (dark) vector tiles. |
| `SpatialCameraController` | class | `CameraController` backed by a `CameraExecutor`; honors `reducedMotion`. |

### 3.3 Reference layers (`./adapters/maplibre/layers`)

| Symbol | Kind | Purpose |
|---|---|---|
| `AmbientPulseLayer` | class | Soft ochre circle dots bound to the `travelers` channel. |
| `SymbolBadgesLayer` | class | Country / region badges bound to the `specialists` channel. |
| `RouteLayer` | class | Polyline + numbered stop markers bound to the `trips` channel. |
| `AmbientPulseLayerOptions` | type | `{ palette, radius? }`. |
| `SymbolBadgesLayerOptions` | type | `{ palette, labelKey? }`. |
| `RouteLayerOptions` | type | `{ palette, orderKey? }`. |

### 3.4 React components (`./components`)

| Symbol | Kind | Purpose |
|---|---|---|
| `GlobeWorkspace` | component | High-level React wrapper; owns one discovery engine for its lifetime. |
| `GlobeWorkspaceProps` | type | `{ theme?, styleOverride?, initialFocus?, initialCenter?, initialZoom?, disableIntro?, className?, testId? }`. |
| `WorkspaceCanvas` | component | High-level React wrapper for the 2D itinerary editor. |
| `WorkspaceCanvasProps` | type | `{ styleOverride?, initialFocus?, initialCenter?, initialZoom?, disableIntro?, className?, testId? }`. |

### 3.5 Choreography (`./core/camera-choreography`)

| Symbol | Kind | Purpose |
|---|---|---|
| `CameraChoreography` | class | Fluent builder for a sequenced camera intro / playback. |
| `CameraChoreographyBeat` | type | `{ label, target, duration?, delay? }`. |
| `singleBeat` | function | Sugar for a one-shot choreography with a single beat. |

### 3.6 Fixtures (`./fixtures`)

| Symbol | Kind | Purpose |
|---|---|---|
| `fixtureTravelerCollection` | function | Deterministic `SpatialFeatureCollection` for the `travelers` channel (Lisbon, Porto, Sintra). |
| `fixtureSpecialistCollection` | function | Deterministic collection for the `specialists` channel (Faro, Coimbra, Nazaré). |
| `fixtureAllCollections` | function | Returns `{ travelers, specialists }` in one call. |
| `fixtureRouteCollection` | function | 5-stop Porto → Lisbon itinerary as a `LineString` + 5 `Point`s. |
| `fixtureRouteSummary` | function | `{ name, note }` rows for the day-by-day panel. |
| `DESTINATION_PRESETS` | const | URL-safe camera presets for `?focus=` deep links. |
| `getDestinationPreset` | function | Looks up a preset by slug; returns `undefined` for unknown slugs. |
| `DestinationPreset` | type | `{ slug, name, camera }`. |

### 3.7 Layer registry (`./core/layer-registry`)

| Symbol | Kind | Purpose |
|---|---|---|
| `LayerRegistry` | class | Single source of truth for which layers are attached to a `SpatialEngine`, in what order, and whether they're visible. Provides `register`, `enable`, `reorder`, `list`, `isVisible`, and `bindTelemetry`. |

---

## 4. Quick-start

The engine is browser-only — MapLibre touches `window` at import time. Every consumer must use `next/dynamic` with `ssr: false`. The bare minimum looks like this:

```tsx
// apps/web/app/(marketing)/explore/discovery-globe.tsx
"use client";

import dynamic from "next/dynamic";

const GlobeWorkspace = dynamic(
  () => import("@repo/spatial-engine").then((mod) => mod.GlobeWorkspace),
  { ssr: false, loading: () => <DiscoverySkeleton /> }
);

export function DiscoveryGlobe() {
  return <GlobeWorkspace theme="dark" className="h-[640px] w-full" testId="explore-globe" />;
}

function DiscoverySkeleton() {
  return <div className="h-[640px] w-full rounded-[32px] bg-linen-dark" aria-label="Loading 3D globe" />;
}
```

The component mounts an engine, seeds the telemetry channels with `fixtureAllCollections()`, runs a two-beat intro choreography (world → Europe), and unmounts cleanly on unmount. No further wiring is needed for the demo surface.

For server components, import only the fixtures and types — never the components themselves:

```tsx
// apps/web/app/(marketing)/explore/workspace/page.tsx
import { fixtureRouteSummary } from "@repo/spatial-engine";

const stops = fixtureRouteSummary(); // safe — pure data
```

---

## 5. `WorkspaceCanvas` vs `GlobeWorkspace`

Both components satisfy the same `SpatialEngine` contract and consume the same fixtures. They differ on three axes:

| Axis | `GlobeWorkspace` | `WorkspaceCanvas` |
|---|---|---|
| Projection | `globe` (MapLibre 3D) | `mercator` (flat 2D) |
| Layers | ambient + specialists | ambient + specialists + route |
| Default style | `theme` prop chooses light or dark CARTO | always `light` CARTO |
| Default home | Portugal low-altitude | Porto mid-zoom |
| Intro choreography | `earth → europe` | `iberian-context → fit-route → first-stop` |

**When to use which**: `GlobeWorkspace` is the marketing / discovery surface — anywhere the user is *exploring* without a specific trip in mind. `WorkspaceCanvas` is the editing surface — anywhere the user has a specific itinerary they want to inspect or modify.

**`disableIntro` vs `initialFocus`**:
- `disableIntro` skips the camera choreography entirely; the engine still applies the `initialTarget` (so it lands where you said, instantly).
- `initialFocus` (a `CameraTarget`) takes precedence over `initialCenter` / `initialZoom` and *also* implicitly disables the intro — you don't need to set both. This is the pattern used by `?focus=` deep links: pass `preset.camera` as `initialFocus` and the canvas lands directly on Lisbon / Porto / the Azores without flying through the world first.

```tsx
// Bento card deep link
<Link href={`/explore/workspace?focus=${slug}`}>See on the map</Link>

// Inside the workspace client
const preset = getDestinationPreset(searchParams.get("focus"));
return <WorkspaceCanvas initialFocus={preset?.camera} />;
```

---

## 6. Layer registration

The engine ships a fixed set of layers today (`AmbientPulseLayer`, `SymbolBadgesLayer`, `RouteLayer`). Each layer is *renderer-specific code* — it knows how to add a MapLibre source + paint layer — but the lifecycle contract (`SpatialLayer`) is renderer-agnostic.

A `LayerRegistry` wraps the engine and gives consumers a single surface for visibility + reorder without re-instantiating the engine:

```ts
import { createDiscoveryEngine, AmbientPulseLayer, SymbolBadgesLayer, LayerRegistry } from "@repo/spatial-engine";

const engine = await createDiscoveryEngine({ style, reducedMotion }).mount(container);
const registry = new LayerRegistry(engine);

registry.register(new AmbientPulseLayer({ palette }));
registry.register(new SymbolBadgesLayer({ palette }));

// Toggle without re-instantiating
registry.enable("spatial-engine:ambient-pulse:layer", false);

// Reorder
registry.reorder("spatial-engine:symbol-badges:layer", 0);
```

The registry is also where you wire a layer to a telemetry channel by hand if the auto-bind doesn't fit:

```ts
const unsubscribe = registry.bindTelemetry(layer, engine.getTelemetry(), "travelers");
```

For most consumers, the standard `createDiscoveryEngine` / `createWorkspaceEngine` factories already register the right layers — `LayerRegistry` is for surfaces that want a dynamic toggle UI.

---

## 7. Telemetry

The telemetry stream is a typed pub/sub over named channels (`travelers`, `specialists`, `trips`, `weather`, `events`).

```ts
const telemetry = engine.getTelemetry();

const unsubscribe = telemetry.subscribe("travelers", (collection) => {
  // collection.features: SpatialFeature[]
});

telemetry.publish("travelers", [
  { type: "Feature", geometry: { type: "Point", coordinates: [-9.14, 38.72] }, properties: { label: "Lisbon" } }
]);

telemetry.shutdown();
```

Two implementation details worth knowing:

1. **Replay on subscribe.** `InMemoryTelemetryService.seed(channel, collection)` is called by the React components at mount time. When a layer subscribes later (which the engine does automatically during `register`), the service replays the latest snapshot via `queueMicrotask`, so subscribers never see a "blank" frame.
2. **Batched flush.** Calls to `publish` are buffered for `bufferWindowMs = 80` (one frame at 12fps, slightly above the worst-case vsync). All features published within the window collapse into a single `setData()` call on the layer. Hundreds of position updates per second stay smooth.

**Swapping the implementation.** `InMemoryTelemetryService` is a deterministic stub for Phase 1. A real backend (Supabase Realtime, SSE, polling) implements the same `TelemetryService` interface and the engine + layers never notice. Production wiring is a Phase 1f task per `docs/future-versions.md`.

---

## 8. Camera choreography

The `CameraChoreography` builder sequences camera moves fluently:

```ts
import { CameraChoreography, singleBeat } from "@repo/spatial-engine";

// Multi-beat intro
const intro = new CameraChoreography()
  .beat("earth",   { center: [0, 30],   zoom: 1.4 }, { duration: reducedMotion ? 0 : 1400 })
  .beat("europe",  { center: [-8.22, 39.40], zoom: 4.2 }, { duration: reducedMotion ? 0 : 1800 });

await engine.playChoreography(intro);

// One-shot focus
await engine.playChoreography(
  singleBeat({ center: [-9.14, 38.72], zoom: 11, pitch: 30 }, { duration: 1200 })
);
```

**`play(camera)` vs direct `camera.focus(target)`**: `play(camera)` is the *engine-aware* entry point. It runs the choreography against the engine's `CameraController`, which means it throws if the engine hasn't mounted yet and is wrapped so a single beat failure never breaks the page. Direct `camera.focus(target)` is what you call when you've already got a `CameraController` handle and want to skip the engine's safety wrapper — e.g. inside a layer event handler after the user clicks a pin.

```ts
// Engine-aware: for intro / page-load animations
await engine.playChoreography(intro);

// Direct: for user interactions after mount
const camera = engine.getCamera();
await camera.focus({ center: feature.geometry.coordinates, zoom: 12 });
```

---

## 9. Fixtures

### 9.1 Destination presets (`?focus=`)

`DESTINATION_PRESETS` powers the bento grid deep links on the home page. Each entry is `{ slug, name, camera }`:

| Slug | Name | Approx. target |
|---|---|---|
| `lisbon` | Lisbon | `[-9.14, 38.72]` · zoom 11 · pitch 30 |
| `porto` | Porto | `[-8.63, 41.16]` · zoom 11 · pitch 30 |
| `douro` | Douro Valley | `[-7.55, 41.18]` · zoom 9.4 · pitch 20 (Pinhão) |
| `sintra` | Sintra | `[-9.39, 38.80]` · zoom 11.5 · pitch 40 |
| `cascais` | Cascais | `[-9.42, 38.70]` · zoom 11.5 · pitch 30 |
| `coimbra` | Coimbra | `[-8.43, 40.20]` · zoom 11 · pitch 30 |
| `algarve` | Algarve | `[-8.67, 37.10]` · zoom 9.5 · pitch 25 (Lagos) |
| `azores` | The Azores | `[-25.79, 37.86]` · zoom 10.5 · pitch 45 (Sete Cidades) |

`getDestinationPreset(slug)` is case-insensitive, trims whitespace, and returns `undefined` for unknown slugs. The workspace client treats `undefined` as "no override" and falls back to the default Porto home position.

### 9.2 Route fixture

`fixtureRouteCollection()` returns a 5-stop Porto → Coimbra → Aveiro → Nazaré → Lisbon itinerary. The geometry is one `LineString` (the dashed ochre line) plus five `Point`s (the numbered stop markers, ordered by the `order` property on each feature). `fixtureRouteSummary()` returns a parallel `{ name, note }[]` array for the day-by-day panel on `/explore/workspace`.

Both shapes match the contract `RouteLayer` expects (`LineString` + `Point`s, no `MultiPolygon`), so the layer renders without an adapter.

### 9.3 Presence fixtures

`fixtureTravelerCollection` and `fixtureSpecialistCollection` seed the engine at mount time so the globe is alive from the first frame. They are deterministic — every render is identical, which is what makes Phase 1 verification possible without a backend.

---

## 10. Migration from `@repo/maps`

`@repo/maps` was the legacy Mapbox-based package that powered `CinematicMap` and `ProviderMap` on the trip surfaces. The spatial engine absorbed it in Phase 1e of `docs/future-versions.md` (row 7.4 of `docs/roadmap.md`); the package has been deleted and the `mapbox-gl` dependency removed.

**Migration map (historical — all sites have shipped)**:

| Legacy | New | Surface |
|---|---|---|
| `CinematicMap` from `@repo/maps` | `WorkspaceTripCanvas` (a `forwardRef` over `WorkspaceCanvas`) | `/trip/[id]` (cinematic section) |
| `ProviderMap` from `@repo/maps` | `WorkspaceCanvas` + a new `useTripRoute` hook | `/trip/[id]/map` |

The trip-page `WorkspaceTripCanvas` is a thin wrapper over `WorkspaceCanvas` that:

- Reads the trip's `SpatialFeatureCollection` via `useTripRoute(tripId)` (in `apps/web/app/(app)/trip/[tripId]/_hooks/use-trip-route.ts`).
- Exposes a `forwardRef` with `flyTo({ chapter })` and `jumpTo({ chapter })` that proxy to `engine.getCamera().focus(...)`.
- Re-seeds the `trips` telemetry channel whenever the route collection changes (specialist edits the trip, geocoding finishes, etc.) without remounting the engine.
- Renders an `IntersectionObserverGate` (replacement for the Mapbox-era lazy-mount guard) so the basemap tiles stay off the wire until the user scrolls into the section.

**Accepted visual regressions** (deliberate, documented in the migration PR):

1. **Mapbox "standard" 3D style is gone.** CARTO Positron / Dark Matter are flat 2D vector styles. Globe projection is added on top, but the photorealistic 3D buildings are not.
2. **Terrain is gone.** `mapbox-dem` with exaggeration `1.4` has no MapLibre equivalent configured. Workspace precision editing does not need terrain; the discovery globe does not show enough zoom to miss it.
3. **Fog halo is deferred.** The soft horizon fog is planned but blocked: `StyleSpecification.fog` is not exported from the stable `@maplibre/maplibre-gl-style-spec` yet (the only stable path is via the `"sky"` spec's `fog-color` / `fog-ground-blend` / `horizon-fog-blend`, which require a hand-written style.json wrapper). Tracked as a Phase 2 follow-up.

---

## 11. Reduced motion

Every animation in the engine respects `prefers-reduced-motion`. The hook is `useReducedMotion` from `@repo/ui` (which wraps `window.matchMedia("(prefers-reduced-motion: reduce)")`). Both React components import it and pass the boolean down through the engine:

- `GlobeWorkspace` / `WorkspaceCanvas` → `engine = createXxxEngine({ ..., reducedMotion })`
- `SpatialCameraController` zeroes out every `duration` when `reducedMotion === true`, so `focus` calls become `jumpTo` instead of `flyTo`.
- The intro choreography beats receive `duration: reducedMotion ? 0 : N` per beat.

**How to test**:

1. macOS: System Settings → Accessibility → Display → Reduce motion.
2. Chrome DevTools → Rendering panel → Emulate CSS media feature `prefers-reduced-motion: reduce`.
3. The components expose `data-reduced-motion="true"` on their container when the preference is active — assert on it in Playwright.

There is no separate `ReducedMotionPref` type to thread through; the engine takes a plain `reducedMotion: boolean` in its options. The naming in the spec reflects the eventual API once the `@repo/ui` hook is renamed for clarity.

---

## 12. Known limitations

- **`StyleSpecification.fog` is not exported from the stable `@maplibre/maplibre-gl-style-spec`** (verified against `@maplibre/maplibre-gl-style-spec@24.10.0`). The soft horizon fog halo on the globe is therefore deferred. The workaround is to write a custom style.json that wraps the `sky` specification with `fog-color` + `fog-ground-blend`, but that loses the `MapStyleEndpoint`-as-URL contract that `CartoBasemapStyleProvider` relies on. Tracked for Phase 2.
- **No native terrain.** MapLibre supports `setTerrain(...)` but the engine doesn't expose it. Globe and Workspace both render on flat vector tiles.
- **`followUser` is a no-op.** `SpatialCameraController.followUser(active)` tracks the *intent* (a `this.following` boolean) so future telemetry wiring has a stable hook, but it does not subscribe to `navigator.geolocation` yet.
- **`SpatialEngine.setPalette()` does not push paint-property updates to layers.** It stores the latest palette for components that read it. Layer paint colors are baked at `onAttach` time. A future Phase 2 task will push paint updates to registered layers.
- **`InMemoryTelemetryService` is a stub.** Production needs the Supabase Realtime adapter from Phase 1f.

---

## 13. Cross-references

- **`docs/future-versions.md`** — Phase 1c (Spatial Engine foundation), 1d (2D Workspace + LayerRegistry + RouteLayer + fixtures), 1e (CinematicMap migration in flight), 1f (Weather + LiveTraveler + Supabase Realtime + persistence).
- **`docs/roadmap.md`** — row 7.4 (`Migrate @repo/maps Trip consumers to @repo/spatial-engine WorkspaceCanvas (2D) variant`); row 7.5 (`Replace InMemoryTelemetryService with a Supabase Realtime adapter`).
- **`docs/architecture.md`** — current architecture overview; lists `@repo/spatial-engine` as a core package (the legacy `@repo/maps` is being phased out).
- **`docs/spec-refined-2026.md`** — Refined 2026 scope (Tier 1+2 immediate focus; visual identity olive/ochre). The spatial engine is the rendering substrate for every Tier 1 surface.

---

## 14. Scripts

From the package root:

```bash
pnpm typecheck   # tsc --noEmit, full workspace-aware
pnpm test        # vitest run, package-local config
```

Source entry: `src/index.ts`. Build output is consumed directly via the `exports` field — Next.js / Turbopack resolve to source.