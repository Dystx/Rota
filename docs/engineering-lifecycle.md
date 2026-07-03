# Engineering Lifecycle — 8-Phase Master Plan

> Cross-reference for `docs/roadmap.md`. This file is the granular, week-by-week
> engineering plan; `docs/roadmap.md` is the operational launch-readiness view.
> Both reference `docs/spec-v4.md` as the source of truth for the 4-tier ascension
> model. Update both when scope changes.

---

## Phase 1 — Architecture, Infrastructure & Monorepo Foundation

**Timeline:** Weeks 1–4

**Focus:** Establishing a high-velocity development ecosystem, setting up serverless infrastructure networks, establishing explicit spatial bounds, and laying down the provider-agnostic mapping engine abstraction.

### Workspace

```
[Turborepo Workspace Root]
 ├── apps/
 │    ├── web/               # Next.js 16 Workspace App (Travelers)
 │    └── ops/               # Next.js 16 Specialist Dashboard (Level 2/3) — *deferred*
 └── packages/
      ├── spatial-engine/    # Hexagonal Geospatial Core Abstraction
      ├── database/          # Supabase Client, Migrations, and Zod Schemas
      └── ui/                # Shared Tailwind v4 Component Library
```

**Architectural decision (2026-07-03):** the two-app split (`apps/web` + `apps/ops`)
proposed here is **deferred**. Current state keeps all specialist work as route
groups under `apps/web/app/` — see ADR forthcoming in PR-10. Revisit if specialist
SSO ships, bundle size becomes a real perf problem, or a B2B partner requires a
separate branded specialist dashboard.

### 1. Unified Project Setup

* Initialize a Turborepo workspace using pnpm as the package manager.
* Configure **Next.js 16** in `apps/web/` using the App Router, forcing **Turbopack** as the default compiler toolchain for rapid local compilation and optimized HMR.
* Install **Tailwind CSS v4** across all UI consumers. Define system tokens using native CSS custom properties within `global.css`, implementing the **Premium Minimalist** color palette:
* Base Surface: Warm Linen (`--color-linen: #F7F4F0;`)
* High-Contrast Typography: Deep Slate (`--color-slate: #18181B;`)
* Action Highlights / Human Validation: Algarve Ochre (`--color-ochre: #E3A857;`)

### 2. Spatial Engine Architecture Definition

* Build the core structural interfaces inside `packages/spatial-engine/core/`.
* Write abstract layer definitions decoupling the platform from the lower-level hardware rendering layer:
* `LayerRegistry`: Manages a synchronized, atomic record of active vector layers (e.g., `Travelers`, `Routes`, `Restaurants`).
* `CameraController`: Orchestrates unified programmatic map pans, bounds checking, and fly-tos.

* Implement the initial `adapters/maplibre/` subpackage, translating internal interface actions directly to **MapLibre GL JS v5+** WebGL/WebGPU render commands.

### 3. Database & System Extension Configurations

* Provision local and staging PostgreSQL instances via the Supabase CLI.
* Deploy standard database migration scripts to initialize the required spatial and semantic vector plugins:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgvector;
```

* Set up a Redis instance on Upstash along with a QStash queue endpoint. This handles off-grid webhook queuing and prevents execution timeouts for multi-stage RAG operations.

---

## Phase 2 — Data Seeding, Extraction Pipelines & Portugal MVP

**Timeline:** Weeks 5–8

**Focus:** Harvesting structural geography data layers, generating high-fidelity natural language spatial embeddings, and mounting the interactive 3D globe projection.

### 1. Spatial Ingestion Run via DuckDB

* Set up an automated node worker using the **DuckDB Node-side binding (`duckdb-async`)** — see ADR-2026-07-03.

> **Decision (2026-07-03):** Use Node-side DuckDB, not the WASM build. The Node binding
> is faster for batch Parquet I/O, has a stable C++ core, and runs cleanly on a
> Render/Fly.io worker. Trade-off: ~10MB native dep, must run on Node (not
> Edge/Cloudflare Workers). Acceptable for the ingest worker that runs on a
> long-lived job runner, not for edge functions.

* Execute bounding box isolation filtering exclusively for the Portugal geographic window (36.9601°N to 42.1543°N Latitude; -9.5000°W to -6.1892°W Longitude).
* Extract targets into structured Parquet streams filtering for designated keys: `amenity IN ('restaurant', 'cafe')`, `tourism IN ('viewpoint', 'museum')`, and `historic IN ('castle', 'monument')`.

### 2. Semantic AI Enrichment & Vector Layout

* Build an asynchronous worker function triggered via Upstash QStash that flattens raw OSM tag dictionaries into natural language blocks optimized for semantic retrieval.
* Stream compile strings through the OpenAI `text-embedding-3-small` model to output clean 1536-dimensional vector footprints.
* Map raw geographic values into the primary database using PostGIS native coordinates:

```sql
CREATE TABLE public.destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    osm_id VARCHAR(64) UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    osm_tags JSONB NOT NULL,
    geom GEOGRAPHY(Point, 4326) NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX destinations_geom_idx ON public.destinations USING GIST (geom);
CREATE INDEX destinations_hnsw_idx ON public.destinations USING hnsw (embedding vector_cosine_ops);
```

> **Schema note:** current code uses a table named `places` with the same shape.
> Decide in P2-2 whether to rename or document the deviation.

### 3. Native 3D Globe Projection Implementation

* Initialize the client map viewport inside the app router layer. Force immediate conversion into a hardware-accelerated global model:

```typescript
map.on('style.load', () => {
  map.setProjection({ type: 'globe' });
  map.setFog({
    color: '#F7F4F0',
    'high-color': '#18181B',
    'space-color': '#09090B'
  });
});
```

* Integrate CARTO vector basemap styles using explicit layer isolation. Ensure all interactive markers are structured within independent GeoJSON data resource collections to allow fluid runtime modifications.

---

## Phase 3 — The Modular AI Planning & Orchestration Engine

**Timeline:** Weeks 9–12

**Focus:** Engineering the modular, gate-isolated generation pipeline, handling structured inputs via the Vercel AI SDK, and wiring responsive state triggers to the frontend canvas.

```
                  [ User Input: Trip Brief Text ]
                                 │
                                 ▼
                   ( Stage 1: Intent Parsing )
                     ↳ Uses Vercel AI + Zod
                                 │
                                 ▼
             ( Stage 2: Knowledge Graph Retrieval )
                     ↳ PostGIS Space Intersect
                     ↳ pgvector Semantic Rank
                                 │
                                 ▼
                 ( Stage 3: Route Optimization )
                     ↳ Heuristic Valhalla Matrix
                                 │
                                 ▼
             [ Structured Multi-Day Itinerary Output ]
```

### 1. Intent Parser & Structural Validation

* Integrate the Vercel AI SDK alongside structural Zod schema specifications to parse complex, multi-intent traveler inputs into standardized planning objects.
* Extract parameters such as transit speeds, pacing thresholds, dietary preferences, and target zones without relying on generic chat screens.

### 2. Execution of the Planning Pipeline

* Deploy independent, decoupled Supabase Edge Functions for each unique stage of the planning journey.
* Map out the step-by-step data transformations:

1. **Intent Parser:** Converts raw briefs into structured configuration objects.
2. **Knowledge Graph Retrieval:** Pulls matching nodes from your destination database.
3. **Route Optimization:** Routes paths using a localized heuristic solution that balances geographical distance with semantic user affinity. The routing cost function is defined as:

$$C = \alpha \cdot d_{\text{transit}} + \beta \cdot w_{\text{match}}$$

Where $d_{\text{transit}}$ is the real-world travel distance computed via PostGIS or Valhalla, $w_{\text{match}}$ is the cosine distance from pgvector, and $\alpha, \beta$ are weights adjusted by the UI controls.

4. **Opening Hour Validation:** Prunes invalid options based on local operational constraints.
5. **Timeline Generation:** Assembles the final structured itinerary payload.

### 3. Zustand Real-Time Map Coordination

* Build a central Zustand state store in the web application to handle real-time synchronization between timeline nodes and map markers.
* Prevent main-thread layout jank by isolating interactions. When a user drags or updates a timeline item, execute direct `setData()` actions on the MapLibre source engine rather than forcing a full React component tree re-render.

---

## Phase 4 — Hybrid Operations Workspace & Communication Layer

**Timeline:** Weeks 13–16

**Focus:** Delivering the internal specialist review dashboard, deploying low-latency Supabase Realtime communication channels, and integrating Stripe payment handling.

### 1. The 15-Minute Level 2 Audit Workspace

* Build out the specialized internal interface app (`apps/ops/`). — **deferred; see Phase 1 architectural decision.**
* Leverage Next.js 16's explicit `use cache` directives to pre-cache historical regional data blocks, providing instant rendering updates for local auditors.
* Provide side-by-side comparative views showing the raw AI itinerary output alongside actionable editing tools like *Swap for Hidden Gem* or *Fix Logistics Bottleneck*.

### 2. Level 3 Asynchronous Triage & Messaging

* Spin up dedicated message routing nodes using **Supabase Realtime** channels to manage active, on-trip traveler help desks.
* Implement an automated AI triage layer that filters and processes inbound user messages. If the system encounters complex logistical failures or urgent scenarios, it automatically escalates the issue to a live local specialist.

```
[ User Live Message ] ──> [ Supabase Realtime Channel ]
                                       │
                                       ▼
                         [ Edge Function AI Triage ]
                                 ⚡ Classification
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
       [ Logistical / Emergency ]               [ Simple Informational ]
                     │                                       │
                     ▼                                       ▼
        ( Escalate to Specialist Dashboard )       ( Automated Instant Reply )
```

> **Status:** AI triage shipped (2026-07-03, commit `b021479`); shared rate-limit
> counter (2026-07-03, commit `5d1d640`); server action at
> `apps/web/app/console/_components/message-triage.ts`. Auto-reply consumer
> (P4-6) not yet wired.

### 3. Checkout Systems Strategy

> **Status:** `@repo/payments` is a deterministic stub. Live Stripe wire-up is
> blocked on Stripe account + Resend account — both deferred to "later" per
> the 2026-07-03 decision log.

* Integrate Stripe checkout flows to handle high-velocity payment processing.
* Set up webhook processing hooks to safely capture confirmation states:
* **Level 2 Purchase:** Unlocks the human-curated itinerary audit loop and issues automated SMS alerts to local expert specialists.
* **Level 3 Pass Active Window:** Activates live web-socket sync access tokens throughout the designated travel window.

---

## Phase 5 — Managed Marketplace Expansion & Mobile Offline Readiness

**Timeline:** Months 5–6

**Focus:** Standardizing Level 4 guide verification tools, implementing Progressive Web App (PWA) specifications, and optimizing local storage for offline use.

* **Guide Onboarding Engine:** Create a secure authentication and profile-building flow for vetted local guides, photographers, and drivers. Provide scheduling calendars and direct client matchmaking capabilities.
* **Service Worker Caching Configuration:** Deploy a PWA configuration optimized for mobile browsers to cache critical assets, typography styles, and mapping canvas components. — **shipped (2026-07-03, commit `14415e0`).**
* **IndexedDB Local Storage Integration:** Implement client-side storage policies using IndexedDB to store encrypted itinerary structures and local GeoJSON route paths. — **shipped (2026-07-03, commit `14415e0`); review-hardened in `5d1d640` and `3d7ad96`.**

> **Mobile companion (Expo + React Native):** explicitly deferred per refined
> spec. `apps/mobile/` is scaffold-abandoned; the user-facing path is PWA only.

---

## Phase 6 — Deep Intelligence & Self-Healing Knowledge Graph

**Timeline:** Months 7–8

**Focus:** Designing continuous feedback loops, computing traveler profile vectors, and updating destination nodes dynamically based on real-world actions.

* **Dynamic Profile Tracking:** Write background map-matching engines that analyze user interactions—such as skipping suggested locations, extending stops, or manually replacing destinations. Convert these behavioral signals into updated semantic profile embeddings.

> **Status:** `apps/web/app/_lib/behavioral-profiler.ts` records
> `skip`/`extend`/`replace`/`pin`/`mute` events into an O(1) ring buffer
> (review-hardened in `3d7ad96`). Consent gate shipped in `5d1d640`. The
> buffer is in-memory only — `user_behavior_events` Supabase table + map-matching
> engine is the open work for P6-1, P6-2.

* **Automated Data Harvesting Loop:** Build data collection routines that analyze manual corrections made by Level 2 experts. If multiple specialists consistently swap out a specific location or label it as a "tourist trap," the platform automatically lowers its global ranking within the primary Destination Knowledge Graph.

---

## Phase 7 — International Footprint Expansion

**Timeline:** Months 9–10

**Focus:** Expanding the data ingestion engine to ingest broader European geographic areas while handling localized regional nuances.

* **Multi-Country Data Ingestion:** Scaled pipeline execution blocks to harvest geographic points across Spain, Italy, France, and Greece.

> **Schema status:** `@repo/types` ships `destinationCountries` and per-country
> region enums (Portugal, Spain, Italy, France, Greece) — committed in
> `e42e17f` (Phase 7 expansion). Data side: `retrieval.ts` is **PT-only** fixtures
> (9 destinations). Real ES/IT/FR/GR data is the open work for P7-1.

* **Localization Configuration Matrices:** Implement schema extensions to manage diverse regional attributes, handling varying seasonal opening trends, distinct public transit rules, and regional language variations seamlessly.

---

## Phase 8 — White-Label B2B Architecture & Enterprise Ecosystem

**Timeline:** Months 11–12

**Focus:** Deploying multi-tenant database partitioning systems, configuring secure developer authorization layers, and launching public developer APIs.

* **Multi-Tenant System Isolation:** Structure row-level security (RLS) policies within Supabase to support white-label business partnerships, enabling external agency groups or tourism boards to run independent custom workspaces over Rumia's core backend.

> **Status:** `org_id` column added to `trips`, `chat_threads` (commit `33f91d0`).
> `auth_in_org` helper tightened in commit `5d1d640` (B2B users can no longer
> read single-tenant NULL-org rows).

* **Enterprise Gateway Portal:** Build high-performance REST/GraphQL developer API gateways managed via API keys. This allows enterprise partners to query the Spatial Engine and tap directly into the Destination Knowledge Graph.

---

## Verification & Key Milestones Matrix

| Milestone | Core Engineering Validation Criteria | Status (2026-07-03) |
| --- | --- | --- |
| **Phase 1 Validation** | Native MapLibre wrapper correctly executing mock spatial data loads at 60fps | ✅ verified — Playwright visual baselines for `/explore` (3D globe) and `/explore/workspace` (2D mercator) |
| **Phase 2 Validation** | PostGIS/pgvector hybrid queries returning accurate local search responses within <150ms | 🟡 blocked on data ingestion pipeline (Phase 2 §1) |
| **Phase 3 Validation** | Upstash QStash queue processing multi-stage itineraries within serverless memory constraints | ❌ not measurable — QStash not wired |
| **Phase 4 Validation** | Bidirectional message updates and simultaneous edits synced across devices via WebSockets in <50ms | 🟡 partial — console messages + pipeline channels work in dev; <50ms target unverified |

---

## 2026-07-03 Decision Log

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | Two-app architecture? | **Defer; stay single-app with route groups.** Document as ADR. | Specialist MAU <5%; shared types still fluid; Vercel per-route middleware covers 80% of the need. Revisit at Stripe Connect inflection point. |
| 2 | `apps/mobile/` (Expo + React Native)? | **Defer; PWA is the user-facing path.** Scaffold-abandoned. | Per refined spec; PWA + IndexedDB cover offline; no native-app demand validated. |
| 3 | Roadmap reconciliation? | **Fold 8-phase plan into `docs/engineering-lifecycle.md` and cross-link from `docs/roadmap.md`.** | This file is the source of truth for engineering sequencing; `roadmap.md` is the operational view. |
| 4 | DuckDB runtime? | **Node-side `duckdb-async`.** | Faster for batch Parquet I/O; stable C++ core; runs cleanly on Render/Fly.io worker. WASM deferred. |
| 5 | Stripe account + business registration? | **Later.** | Defer until CP-4 is unblocked by business-side provisioning. |
| 6 | Resend account? | **Later.** | Same as #5; coupled to the Stripe receipt flow. |
| 7 | The 11 carry-over LOWs from the first review? | **Fix all.** | See `docs/reviews/2026-07-03-llm-review.md` for the working list. |
| 8 | Tier 3 reactivation metrics? | **Start tracking** — define the metrics, instrument the data, no Tier 3 development yet. | Decision tree needs PM input on the break-even threshold; data capture is cheap and reversible. |
