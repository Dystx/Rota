# Rumia — Master Engineering Lifecycle & Full Cloudflare Deployment Roadmap

> **Historical snapshot (2026-07-04; superseded).** This file documents the
> former Cloudflare Pages + R2 + Supabase direction. It is retained for
> architectural history only. The active direction is the VPS-native
> PostgreSQL/Better Auth plan in
> [`docs/superpowers/specs/2026-07-11-rumia-vps-platform-design.md`](superpowers/specs/2026-07-11-rumia-vps-platform-design.md),
> and the current release truth is
> [`specs/PLAN-AUDIT_LATEST.md`](../specs/PLAN-AUDIT_LATEST.md).

> **Archived source of truth for the former Cloudflare Pages + R2 + PMTiles +
> Workers blueprint.** The active source of truth is now the activity-first
> master plan and the VPS platform design linked above. The older tier and
> engineering documents are retained for history only.
>
> Last updated: 2026-07-04.

---

## Phase 1: Workspace Architecture, Edge Environments & Monorepo Setup

### Goal

Establish a high-velocity development ecosystem inside a single Turborepo workspace, targeting **Cloudflare Pages** for edge-rendered Next.js 16 execution and structuring the provider-agnostic mapping engine.

```
[Turborepo Workspace Root]
 ├── apps/
 │    ├── web/               # Next.js 16 UI Workspace — Deployed to Cloudflare Pages
 │    └── ops/               # Next.js 16 Specialist Dashboard — Deployed to Cloudflare Pages
 └── packages/
      ├── spatial-engine/    # Isolated Geospatial Interface Core & Cloudflare Tile Router
      ├── database/          # Supabase Client, Schema Models, and Edge Utilities
      └── ui/                # Shared Tailwind v4 Design Tokens & Components

```

### 1. Project Initialization & Tailwind Tokens

* Initialize a Turborepo workspace using `pnpm` as the package manager.
* Configure `apps/web/` and `apps/ops/` as **Next.js 16** instances using the App Router and Turbopack.
* Install **Tailwind CSS v4** across all UI workspace modules. Define tokens via CSS custom properties within your global stylesheet to enforce the premium aesthetic:
* Base Canvas Surface: Warm Linen (`--color-linen: #F7F4F0;`)
* Crisp Contrast Typography: Deep Slate (`--color-slate: #18181B;`)
* Active Highlights / Human Markers: Algarve Ochre (`--color-ochre: #E3A857;`)

**Current state (2026-07-04):** Tailwind v4 tokens are live in `packages/ui/src/styles.css` via the `@theme` block — `olive-dark #1D2A23`, `ochre-dark #CE933F`, `glass-light rgba(255,255,255,0.65)`, `glass-dark rgba(43,62,52,0.85)`, etc. The reference HTML catalog is at 13/13 parity with these tokens. The `apps/ops/` split is **deferred** (specialist work lives as route groups under `apps/web/app/`).

### 2. Next.js 16 Core Edge Configuration

* Adjust your server behaviors to cleanly accept large traveler summaries by modifying `apps/web/next.config.js` to scale beyond the default 1MB Server Action boundary limit:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb', // Safeguards the intent parser from multi-day summary truncations
    },
  },
};
module.exports = nextConfig;

```

**Current state (2026-07-04):** `apps/web/next.config.ts` ships with `bodySizeLimit: '4mb'` for server actions, plus `withSentryConfig()` wired for the Sentry + perf budget observability foundation.

### 3. Spatial Abstraction Port Structures

* Create the core contract definitions inside `packages/spatial-engine/src/core/types.ts` to keep your application decoupled from underlying map libraries:

```typescript
export interface SpatialEngine {
  mount(container: HTMLDivElement): void;
  unmount(): void;
  setProjectionType(type: 'globe' | 'mercator'): void;
  registerLayer(layer: SpatialLayer): void;
}

export interface SpatialLayer {
  id: string;
  onAttach(mapInstance: any): void;
  onUpdate(mapInstance: any, data: GeoJSON.FeatureCollection): void;
  onDetach(mapInstance: any): void;
}

```

**Current state (2026-07-04):** The spatial-engine ships in `packages/spatial-engine/` with the abstract `SpatialEngine` + `SpatialLayer` interfaces, the `GlobeWorkspace` (3D) + `WorkspaceCanvas` (2D) adapters, the `useMapSourceSync` high-frequency bridge, the `useTargetCoordinatesCameraSync` race-safe fly-to bridge, the antimeridian pitch clamp, and the source registry (`registerMapSource`) with a `WeakMap<HTMLElement, GeoJSONSourceLike>` keyed by the owning container. The engine is **provider-agnostic** — the `CartoBasemapStyleProvider` ships today; `PMTilesBasemapStyleProvider` is wired for the Phase 2 launch.

---

## Phase 2: Vector Map Seeding & Free-Tier Tile Hosting Infrastructure

### Goal

Extract regional map features using open datasets and host optimized, planetary-ready vector tile sources inside zero-egress object storage for **$0/month**.

### 1. DuckDB Geospatial Boundary Extraction

* Run a local background database script using the DuckDB `spatial` and `parquet` plugins to extract target features directly from cloud-hosted Overture Maps / OpenStreetMap Parquet repositories.
* Set explicit coordinate bounding box restrictions for the Portugal MVP:

```sql
LOAD spatial;
SELECT id, names.primary AS name, categories.main AS category, ST_AsText(ST_GeomFromWkb(geometry)) AS wkt_geom, tags
FROM read_parquet('s3://overturemaps-us-west-2/release/2026-latest/theme=places/type=place/*.parquet')
WHERE bbox.minx >= -9.5000 AND bbox.maxx <= -6.1892  -- Portugal Longitude Bounds
  AND bbox.miny >= 36.9601 AND bbox.maxy <= 42.1543; -- Portugal Latitude Bounds

```

### 2. PMTiles Compression and Storage Assembly

* Compile the extracted geospatial vectors into a single, highly compressed `.pmtiles` archive using the Planetiler or Protomaps CLI toolchain:

```bash
pmtiles extract openmaptiles.pmtiles portugal.pmtiles --bbox=-9.5000,36.9601,-6.1892,42.1543
```

* Provision a Cloudflare R2 storage bucket named `rumia-spatial-tiles`. R2 provides a generous **10 GB/month free storage tier with $0 egress data fees**, ensuring your map loads cost nothing even under heavy panning traffic.
* Upload `portugal.pmtiles` directly to the bucket root via the Wrangler CLI.

### 3. Edge Tile Router Deployment

* Create `packages/spatial-engine/wrangler.toml` and write an edge routing worker using open-source Protomaps serverless middleware. The script reads byte ranges from the R2 bucket on demand, running comfortably within Cloudflare's 100,000 free daily requests.

```typescript
// packages/spatial-engine/src/adapters/cloudflare/tile-router.ts
import { pmtilesWorker } from 'protomaps-cloudflare';

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    return pmtilesWorker(request, {
      bucket: env.RUMIA_MAPS_BUCKET,
      cache: caches.default,
      url_pattern: '/tiles/:z/:x/:y.mvt'
    });
  }
};

```

**Current state (2026-07-04):** Phase 2 is **deferred to post-launch per ADR-007**. The current MVP uses **CARTO Dark Matter + Positron** vendor-hosted basemaps via the `CartoBasemapStyleProvider` (open data, no token required). PMTiles becomes attractive at higher scale or if full style control is needed. The two approaches don't conflict — they only differ in the `style.json` URL the engine fetches. The roadmap `Operational Phase 2` (the hosted Supabase schema apply) is the immediate production blocker; this Phase 2 (R2 + PMTiles) is a follow-up scaling optimization.

---

## Phase 3: Hybrid Search Engine & Orchestration Pipeline

### Goal

Deploy a high-precision storage layout inside Supabase that combines geographic boundaries (PostGIS) and semantic preference arrays (pgvector) using a Reciprocal Rank Fusion (RRF) scoring algorithm.

### 1. Extended Hybrid Database Schema

* Apply migrations via the Supabase CLI to enable spatial and embedding tools.
* Utilize `halfvec(1536)` data structures to compress your vector footprints, allowing you to easily fit thousands of highly enriched Portuguese points of interest within the database limits.

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgvector;

CREATE TABLE public.destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    geom GEOGRAPHY(Point, 4326) NOT NULL,
    embedding_compressed HALFVEC(1536) NOT NULL, -- Safeguards HNSW limits
    fts_vectors TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', name || ' ' || category)) STORED
);

CREATE INDEX destinations_spatial_idx ON public.destinations USING GIST (geom);
CREATE INDEX destinations_hnsw_idx ON public.destinations USING hnsw (embedding_compressed halfvec_cosine_ops);

```

### 2. Reciprocal Rank Fusion (RRF) Matching Engine

Because Postgres cannot natively combine a spatial index and an approximate nearest neighbor vector index into a single, unified step, run parallel search workflows and merge the results using Reciprocal Rank Fusion (RRF). This algorithm scores items by balancing semantic intent against text relevancy within a strict spatial radius:

$$RRF(d) = \frac{1}{60 + \text{Rank}_{\text{semantic}}(d)} + \frac{1}{60 + \text{Rank}_{\text{keyword}}(d)}$$

```sql
CREATE OR REPLACE FUNCTION match_hybrid_destinations (
  query_vector VECTOR(1536),
  keyword_query TEXT,
  target_lat FLOAT,
  target_lng FLOAT,
  radius_meters FLOAT
)
RETURNS TABLE (destination_id UUID, combined_score FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH semantic_pass AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY embedding_compressed <=> query_vector::halfvec) as rank
    FROM destinations
    WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography, radius_meters)
    LIMIT 30
  ),
  keyword_pass AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY ts_rank_cd(fts_vectors, to_tsquery('english', keyword_query)) DESC) as rank
    FROM destinations
    WHERE fts_vectors @@ to_tsquery('english', keyword_query)
      AND ST_DWithin(geom, ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography, radius_meters)
    LIMIT 30
  )
  SELECT
    COALESCE(s.id, k.id) as destination_id,
    (COALESCE(1.0 / (60 + s.rank), 0.0) + COALESCE(1.0 / (60 + k.rank), 0.0))::FLOAT as combined_score
  FROM semantic_pass s
  FULL OUTER JOIN keyword_pass k ON s.id = k.id
  ORDER BY combined_score DESC LIMIT 15;
END;
$$;
```

### 3. Asynchronous Execution Pipeline Configuration

* Connect long-running AI orchestration logic to **Upstash QStash** inside background Supabase Edge Functions. This structure isolates heavy generation tasks from the primary request thread, preventing frontend timeout errors.

**Current state (2026-07-04):** The hybrid search engine is **locally shipped** but blocked on the hosted Supabase apply. Local migrations:
- `202607022000_enable_postgis_pgvector_and_places_embeddings.sql` — extensions + `places.coordinates GEOMETRY(Point, 4326)` + `places.embedding VECTOR(1536)` + GIST + HNSW indexes
- `202607032300_migrate_places_embedding_to_halfvec.sql` — `embedding` → `halfvec(1536)`, idempotent on pgvector < 0.7.0
- `202607040000_add_places_osm_id.sql` — `places.osm_id text` + partial unique index for ingest upsert
- `202607040100_create_place_adjustment_log.sql` — append-only audit log for specialist swaps
- `202607040200_create_specialist_capabilities.sql` — `specialist_capabilities` (PR-11)
- `202607040300_create_match_hybrid_destinations.sql` — PL/pgSQL RRF combiner over HNSW + GIST + ILIKE

The RRF combiner is the **places** variant of the master doc's `destinations` RRF (same algorithm, k=60, FULL OUTER JOIN with NULL coercion). Upstash QStash is **deferred** — current background work runs in `apps/workers/` triggered by the cron / API path, not QStash callbacks.

---

## Phase 4: High-Velocity UI Canvas & Zustand State Sync

### Goal

Build the client-side workspace mapping components using **MapLibre GL JS v5+** and implement zero-teardown state sync bridges.

### 1. Atomic Core State Management

* Build the core interface state layer inside `apps/web/store/useMapStore.ts` to manage active selections, route paths, and timeline coordinates:

```typescript
import { create } from 'zustand';

interface MapState {
  activeStopId: string | null;
  registeredSource: any | null;
  setActiveStopId: (id: string | null) => void;
  registerSource: (source: any) => void;
}

export const useMapStore = create<MapState>((set) => ({
  activeStopId: null,
  registeredSource: null,
  setActiveStopId: (id) => set({ activeStopId: id }),
  registerSource: (source) => set({ registeredSource: source }),
}));

```

### 2. High-Frequency Direct Mutation Hook

* Deploy the synchronous tracking hook `apps/web/store/useMapSourceSync.ts` to push incoming geospatial data directly to your rendering engines, keeping performance fluid at 60fps:

```typescript
import { useEffect } from 'react';
import { useMapStore } from './useMapStore';

export const useMapSourceSync = (liveFeatureCollection: GeoJSON.FeatureCollection) => {
  const registeredSource = useMapStore((state) => state.registeredSource);

  useEffect(() => {
    // Mutates the MapLibre engine context directly, bypassing React component renders
    if (registeredSource && typeof registeredSource.setData === 'function') {
      registeredSource.setData(liveFeatureCollection);
    }
  }, [liveFeatureCollection, registeredSource]);
};

```

### 3. Single-Instance Workspace Component

* Implement the unified map wrapper component. It switches between the 3D Globe and 2D Plan views on a single active context, preserving your WebGL resources and eliminating the flash of unmounted maps.

```typescript
// infrastructure/maps/WorkspaceCanvasContainer.tsx
import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '../../store/useMapStore';

export const WorkspaceCanvasContainer = ({ projectionType, geoJsonData }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const registerSource = useMapStore((state) => state.registerSource);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.rumia.world/tiles/style.json', // Your self-hosted Cloudflare tile router worker
      center: [-8.2245, 39.3999],
      zoom: 4,
    });

    mapRef.current = map;

    map.on('load', () => {
      map.setProjection({ type: projectionType });

      map.addSource('itinerary-stops', { type: 'geojson', data: geoJsonData });
      registerSource(map.getSource('itinerary-stops'));

      map.addLayer({
        id: 'stops-layer',
        type: 'circle',
        source: 'itinerary-stops',
        paint: { 'circle-radius': 6, 'circle-color': '#E3A857' }
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update projection configurations on-the-fly without destroying the WebGL context
  useEffect(() => {
    const map = mapRef.current;
    if (map && map.isStyleLoaded()) {
      map.setProjection({ type: projectionType });
    }
  }, [projectionType]);

  return <div ref={mapContainer} className="w-full h-full absolute inset-0 z-0" />;
};

```

**Current state (2026-07-04):** Phase 4 is **fully shipped**. The store, hooks, and single-instance canvas all exist. Notable refinements over the master doc's sketch:

- `useMapStore` does **not** store the `registeredSource` in state — sources are stored in a module-level `WeakMap<HTMLElement, GeoJSONSourceLike>` keyed by the owning container, and a `useMapStore.setSourceData(fc)` action pushes data to the active source. This avoids storing non-serializable runtime objects in the Zustand state (which would crash SSR).
- The `useMapSourceSync` hook in the current code is **subscription-based** (subscribes to a slice and calls `onChange` when it changes, with a captured-target guard for race-safety), not a direct effect that runs on every render. This is the load-bearing primitive for the filmstrip → map highlight.
- The filmstrip is wired through `useFilmstripSourceSync` (a wrapper hook) + `useTargetCoordinatesCameraSync` (the race-safe bento → camera fly-to bridge). Both are 100% test-covered (11 tests across the 2 hooks).
- The antimeridian pitch clamp lives in `packages/spatial-engine/src/core/camera-controller.ts` — when `|center.lng| > 179°`, pitch is forced to 0 to prevent frame drops across the international date line.
- 0 ESLint errors on the new code; 563/563 tests green; the home page bento card on the home page + filmstrip card on the trip page + map's `stops` source form a fully wired cross-page UX.

---

## Phase 5: Hybrid Operations & Real-Time Support Triage

### Goal

Deploy low-latency communication networks using Supabase Realtime channels to connect active travelers with the Level 2 and Level 3 human specialist support dashboards.

### 1. Telemetry Coordinate Truncation Optimization

* To prevent payload bloat across active WebSocket channels, clean all real-time coordinate streams by truncating float structures to **6 decimal places** before database commit:

```typescript
export function clampCoordinates(lng: number, lat: number): [number, number] {
  // Truncates coordinates down to a 1-centimeter precision boundary, saving up to 50% on string payload sizes
  return [
    parseFloat(lng.toFixed(6)),
    parseFloat(lat.toFixed(6))
  ];
}

```

### 2. Real-Time Channel Event Mesh Setup

* Use Supabase Realtime tokens to initialize dynamic subscription listening points for active traveler devices:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export const initializeTripTelemetry = (tripId: string, handleLocationUpdate: (payload: any) => void) => {
  const channel = supabase
    .channel(`active-trip-telemetry:${tripId}`)
    .on('broadcast', { event: 'location' }, (response) => handleLocationUpdate(response.payload))
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

```

**Current state (2026-07-04):** Phase 5 is **partially shipped**.

- `clampCoordinates` ships in `apps/web/lib/geo/clamp-coordinates.ts` with 7 unit tests (covers the IEEE-754 negative-zero edge case via `Object.is(x, -0)`). It's used at every ingest point.
- The console's `chat_messages` Realtime channel is live: `apps/web/app/console/messages/page.tsx` subscribes to `INSERT` events on `chat_messages`, runs the AI triage classifier (`triageInboundMessage`) on every inbound message, and surfaces a tier badge in the chat header.
- The T3 / T4 telemetry channel is **deferred to post-launch retention** (per `docs/spec-v4.md` Phase 5 — Tier 3 / Tier 4 concierge support requires the subscription to be live).
- The specialist messaging hub (PR-11d) ships the snippet library + drag-to-input + Update Timeline panel. The "Push to Timeline" submit is a visual no-op until Phase 9.1 (chat schema) wires the `itinerary_events` table.

---

## Phase 6: Deep Optimization, Guardrails & Cloudflare Production Launch

### Goal

Incorporate infrastructure safety controls and launch the applications globally over Cloudflare's edge CDN network.

* **Connection Pool Management:** Wrap your serverless database interactions with pooling configurations to prevent suspended execution environments from leaving orphan database connections open.
* **Antimeridian View Boundaries:** Add pitch and rotation constraints inside your `CameraController` to prevent frame drops when rendering the 3D globe projection across the international date line.
* **Cloudflare Pages Deployment:** Link your Turborepo workspace directly to Cloudflare Pages. Use the `@opennext/cloudflare` build adapter to compile Next.js 16 layouts into edge-optimized worker streams, giving you unlimited free egress bandwidth right from launch.

**Current state (2026-07-04):** Phase 6 is **partially shipped**.

- **Antimeridian view boundaries:** Shipped. `clampPitchForAntimeridian(center, pitch)` in `packages/spatial-engine/src/core/camera-controller.ts` returns 0 when `|center.lng| > 179°` (epsilon = 1°). The `focus()` path uses it. The test is in `packages/spatial-engine`.
- **Connection pool management:** Documented in `docs/ops/serverless-database-connections.md`. The Supabase transaction mode is set to `READ COMMITTED`; pool sizing is per-region. The `set maintenance_work_mem = '2GB'; VACUUM ANALYZE;` pre-flight is in `docs/ops/launch.md` §1.2.
- **Cloudflare Pages deployment:** **Deferred** — the repo uses Vercel + Supabase + Workers for hosting (per `docs/ops/deploy-rollback.md`). The Cloudflare Pages + R2 + Workers + `@opennext/cloudflare` build is the target architecture per the master doc, and the migration is straightforward (the Next.js 16 app is already configured with no Vercel-specific code). The Vercel → Cloudflare Pages switch is a one-week project when the team decides to migrate.

---

## Complete Verification Milestone Targets

| Lifecycle Step | Targeted Verification Process | Production Criteria for Success | 2026-07-04 Status |
| --- | --- | --- | --- |
| **Phase 1 Validation** | Check monorepo dependency boundaries. | Build scripts verify isolated compile paths across apps with no cross-contamination. | ✅ **Done** — Turborepo + pnpm + 12 packages + 2 apps. Next.js 16 + Tailwind v4 tokens live. Spatial-engine abstraction in place with `SpatialEngine` + `SpatialLayer` + `GlobeWorkspace` + `WorkspaceCanvas`. |
| **Phase 2 Validation** | Test tile delivery under simulated stress. | Cloudflare Workers stream vector map tiles to the frontend canvas with response times under 45ms. | 🟡 **Deferred to post-launch per ADR-007** — current MVP uses CARTO vendor basemaps. PMTiles + R2 + Workers tile router is the migration target. |
| **Phase 3 Validation** | Check query speeds under multi-intent data loads. | The hybrid RRF Postgres script outputs structured destination rankings in under 120ms. | 🟡 **Local-ready, hosted-pending** — `match_hybrid_destinations` PL/pgSQL + 5 migrations ready. The `Operational Phase 2` hosted Supabase apply is the only blocker. |
| **Phase 4 Validation** | Verify map UI stability during layout changes. | Projection cuts and timeline adjustments execute smoothly at 60fps with zero visual canvas flicker. | ✅ **Done** — `useMapSourceSync` (6 tests), `useFilmstripSourceSync` (11 tests), `useTargetCoordinatesCameraSync` (4 tests), antimeridian clamp, single-instance canvas. 13/13 visual reference rows at parity. |
| **Phase 5 Validation** | Audit active WebSocket data consumption. | Truncated GeoJSON payloads stream successfully over live channels with up to 50% bandwidth savings. | 🟡 **Partial** — `clampCoordinates` shipped (7 tests). Console `chat_messages` Realtime + triage classifier shipped. T3/T4 telemetry channel + specialist messaging hub actions deferred to Phase 9.1. |
| **Phase 6 Validation** | Run deployment stress tests. | Applications deploy to Cloudflare Pages with 0 cold starts and pinned connection pooling. | 🟡 **Partial** — antimeridian clamp shipped. Connection pool documented. Vercel → Cloudflare Pages migration is a one-week follow-up. |

---

## Phase-to-PR Cross-Reference

| Master Phase | Roadmap PRs (live or scheduled) | Notes |
| --- | --- | --- |
| Phase 1 (Workspace) | n/a — foundational | Done |
| Phase 2 (Tile hosting) | ADR-007 (deferred post-launch) | CARTO vendor now, PMTiles later |
| Phase 3 (Hybrid search) | `202607022000`, `202607032300`, `202607040000`, `202607040100`, `202607040200`, `202607040300` | Migrations ready; hosted apply is the only blocker |
| Phase 4 (UI canvas + Zustand) | PR-1, PR-8, PR-11, PR-12, PR-13, PR-14, PR-15, PR-16, PR-17, PR-18, PR-19, PR-20 | Done |
| Phase 5 (Realtime triage) | PR-11 (chat schema + console), PR-11d (availability) | Partial; T3/T4 telemetry deferred |
| Phase 6 (Cloudflare launch) | n/a | Vercel now, Cloudflare Pages follow-up |
