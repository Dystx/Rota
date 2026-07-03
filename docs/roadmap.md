# Rumia — Roadmap

> **Three specs, three axes.** This file bridges them.
>
> - **v4.0 (current authoritative)** → [`docs/spec-v4.md`](./spec-v4.md) — 4-tier ascension model (Tier 1 Core / Tier 2 Curation / Tier 3 Concierge / Tier 4 Marketplace).
> - **v2.0 long-term vision** → [`docs/spec.md`](./spec.md) — 3-tier Tiered Service Model (preserved for historical reference).
> - **Refined 2026 scope** → [`docs/spec-refined-2026.md`](./spec-refined-2026.md) — visual identity (olive/ochre) + UI/UX details; Tier 3 + Mobile deferred.
> - **Operational launch-readiness** → §3 below. Drives *how* we ship.
> - **Engineering lifecycle (8-phase master plan)** → [`docs/engineering-lifecycle.md`](./engineering-lifecycle.md) — week-by-week engineering sequencing; this roadmap is the operational view of the same work.
>
> Section 2 maps current state to the v4 5-phase engineering plan.

---

## 1. What Rumia Is

Four-tier travel concierge platform for Portugal-first, AI-powered itinerary planning:

- **Tier 1 (Core AI Wrapper)**: structured brief → RAG-generated day-by-day itinerary with maps, routing, opening-hour validation. Free; monetized via exports + affiliate bookings.
- **Tier 2 (Specialist Curation)**: human specialist audit + async chat. One-time flat fee per booking.
- **Tier 3 (Full Remote Support)**: 24/7 concierge lifeline during the active trip. AI pre-triage (parking, hours, transit) → specialist rota (taste, nuance, urgent transactional). Daily rate subscription.
- **Tier 4 (On-Site Real Guide)**: RNAAT-licensed physical guide dispatch. Premium flat-day fee.

The immediate implementation focus is Tier 1 + Tier 2 with Tier 3 in-progress (per `docs/spec-v4.md`). Tier 4 is gated on RNAAT compliance + ops partner (see spec §3).

---

## 2. Current State vs Refined 2026 Phases (last verified 2026-07-03)

### Phase 1 — Foundations & Architecture Setup

| Requirement | Status |
|---|---|
| Monorepo (`pnpm` + `turbo`) with apps + packages layout | ✅ **Done** — 12 packages + 2 runnable apps |
| PostgreSQL + PostGIS + pgvector extensions | 🟡 **Local-only** — migration `202607022000_enable_postgis_pgvector_and_places_embeddings.sql` ships PostGIS + pgvector + places extensions + GIST/HNSW indexes; blocked by Phase 2 hosted Supabase credentials |
| Tailwind v4 design tokens (matches `packages/ui/src/styles.css`) | ✅ **Done** — `tailwindcss: ^4.2.4` pinned as direct dep; `@theme` block generates both CSS variables in `:root` and utility classes for olive/ochre palette (`4591c5a`, `081b40f`, `baf0042`) |
| Visual identity = prototype (olive/ochre + cream/sage) | ✅ **Done** — `@theme` block in `packages/ui/src/styles.css`; home page (`efac8b0`), 12 prototype ports, and 4 marketing pages all render at 100% parity with `docs/prototype.html`; shared `TopNav` + `SiteFooter` from `apps/web/app/_components/` (commits `1c5b9cd`, `3d23441`) |

### Phase 2 — Knowledge Graph Seeding (Portugal Module)

| Requirement | Status |
|---|---|
| `places` table seeded for Lisbon, Sintra, Porto, Algarve | 🟡 **Partial** — `places` table exists; coverage unverified |
| Text descriptions → pgvector embeddings | 🟡 **Local-only** — `places.embedding VECTOR(1536)` + HNSW index added in `202607022000_*` migration; data population pending |
| Mapbox custom minimalist skin | ✅ **Done** — `packages/maps` cinematic-map controller with reduced-motion |
| Spatial columns (PostGIS geometry) | 🟡 **Local-only** — `places.coordinates GEOMETRY(Point, 4326)` + GIST index added in `202607022000_*`; population pending |

### Phase 3 — Invisible AI Engine (Tier 1 Activation)

| Requirement | Status |
|---|---|
| Trip Brief parser (deterministic provider → Vercel AI SDK) | 🟡 **Partial** — `packages/ai/src/prompt-normalization.ts` deterministic provider live and consumed by `/planner` (commit `56cf3c5`); Vercel AI SDK wiring deferred to Phase 7 |
| Smart Question Cards pipeline | ✅ **Done** — `apps/web/app/planner/planner-client.tsx` renders `PromptComposer` + `FollowUpPanel` for `needs_follow_up` results with chip selection + free-text input (commit `56cf3c5`); `BriefConfirmation` + `BriefField` for candidate review; URL-encoded brief handoff to `/trip/new` |
| Geometric optimization (travel-time + opening-hour validation) | ✅ **Done** — `packages/routing` + `packages/ai` step 4 |
| Invisible UI controls (`Reduce driving`, `Make it more relaxed`) | 🟡 **Partial** — primitives exist; semantic re-search on stop replacement not yet wired |

### Phase 4 — Workspace & Checkout Infrastructure

| Requirement | Status |
|---|---|
| Asymmetric timeline canvas + inline controls | ✅ **Done** — `apps/web/app/(app)/trip/[tripId]/page.tsx` + cinematic-hero + chapter-nav |
| Stripe payment flows | ❌ **Not started** — `@repo/payments` has deterministic contracts; live Stripe deferred |
| PDF + Calendar Export Engines | 🟡 **Partial** — `/trip/[tripId]/export` page exists; unlock gating pending |
| Premium exports + affiliate bookings | 🟡 **Partial** — `booking_clicks` table exists; attribution flow pending |

### Phase 5 — Specialist Collaboration Hub (Tier 2 Activation)

| Requirement | Status |
|---|---|
| Reviewer roster + assignments | ✅ **Done** — `reviewers`, `reviewer_assignments` tables; `/reviewer/*` routes |
| Reviewer dashboard with error-checking alert panel | 🟡 **Partial** — `/reviewer/trips/[tripId]` exists; needs explicit route-timeline display per spec §7 SLA |
| Asynchronous chat infrastructure | ❌ **Not started** — `chat_threads`/`chat_messages` tables don't exist |
| AI triage pre-routing | ❌ **Not started** |

### Future Backlog — DEFERRED (per refined scope)

| Phase | Description | Reactivation trigger |
|---|---|---|
| Phase 6 — Mobile | Expo + React Native companion; offline geolocation sync | Tier 1+2 retention shows repeat-trip behavior |
| Phase 7 — Tier 3 Marketplace | Physical guide matching; RNAAT compliance; dispatch | Tier 1+2 monetization > break-even + RNAAT review + ops partner |

### Tech stack alignment

| Stack item | Spec | Current |
|---|---|---|
| Next.js 16 + RSC | required | ✅ in use (Next 16.2.4 per dev.log) |
| Vercel AI SDK | required | ❌ not wired — `packages/ai` uses direct OpenAI integration (deterministic provider live; SDK deferred to Phase 7) |
| Zustand | required | ❌ not in use — no transient state store |
| Tailwind v4 | required | ✅ v4.2.4 pinned as direct dep in `apps/web` and `packages/ui` |
| Bun | optional runtime | ❌ not in use — pnpm/Node |
| Upstash QStash + Redis | queue/cache | ❌ not in use — `apps/workers` is bounded-local |
| PostGIS | required | 🟡 migration `202607022000_*` enables locally; awaiting hosted |
| pgvector | required | 🟡 migration `202607022000_*` enables locally; awaiting hosted |

### Pre-existing tech debt (carried, recently fixed)

- `packages/db/src/index.ts` had `isPersistenceConfigError` shadow re-export; **removed** (`7a4f555`).
- 11 placeholder copy items in admin/reviewer `EmptyState` + `"Active MVP"` status label; **replaced** (`7a4f555`).
- 6 admin pages had `error.message` fall-through in catch blocks; **replaced** with generic fallbacks (`3cb58a1`).
- Vitest include pattern excluded `*.test.tsx`; **fixed** (`253da10`).
- `.sisyphus/`, `.omk/`, `.kimi/`, `.playwright-mcp/` untracked tool state; **removed** (`bc1aa48`, `339ffb9`).
- 9 scratch debug scripts + `apps/web/playwright-report/`; **deleted** (`253da10`).
- Marketing pages (`/portugal`, `/how-it-works`, `/human-review`, `/pricing`) had Cinematic Concierge sticky header alongside `TopNav`; **fixed** with `bare` prop on `PageShell`/`ArchiveLayout` (`1c5b9cd`).
- `/planner` was a static "Synthesize Itinerary" CTA pointing at `/logistics`; **wired** to real `PromptComposer` + `normalizeTripPrompt` + `BriefConfirmation` flow (`56cf3c5`).

---

## 3. Operational Roadmap — Launch-Readiness Phases

These phases unblock production deployment. They run alongside the refined 5-phase engineering plan; many refined-phase items have local-only implementations that need operational work below to ship.

### Decision Log (2026-07-03)

| # | Question | Decision | Notes |
|---|---|---|---|
| 1 | Two-app architecture (`apps/web` + `apps/ops`)? | **Stay single-app with route groups** | Specialist MAU <5%; Vercel per-route middleware covers 80% of the need. Revisit at Stripe Connect or SSO inflection. ADR in PR-10. |
| 2 | `apps/mobile/` (Expo + React Native)? | **Defer; PWA is the user-facing path** | Per refined spec; PWA + IndexedDB cover offline; no native-app demand validated. |
| 3 | Roadmap reconciliation? | **`docs/engineering-lifecycle.md` is the granular view; this file is the operational view** | Cross-references at the top of each file. |
| 4 | DuckDB runtime? | **Node-side `duckdb-async`** | Faster for batch Parquet I/O; stable C++ core. WASM deferred. |
| 5 | Stripe account + business registration? | **Later** | Defer until CP-4 is unblocked by business-side provisioning. |
| 6 | Resend account? | **Later** | Coupled to the Stripe receipt flow. |
| 7 | The 11 carry-over LOWs from the first review? | **Fix all** | See `docs/reviews/2026-07-03-llm-review.md` for the working list. |
| 8 | Tier 3 reactivation metrics? | **Start tracking** | Define metrics + instrument data; no Tier 3 development yet. PM-owned break-even threshold. |

### Phase 0 — Audit + Housekeeping ✅ Complete (2026-07-02)

Repo cleanup, copy fixes, db shadow removal, vitest `*.test.tsx` discovery, project-content tracking. See commits `e49a624` … `e7e7f23`.

### Phase 1 — Pre-existing Tech Debt ✅ Complete (2026-07-02)

All 4 sub-items done. Audit evidence at `docs/audit/phase-0-cinematic-redesign.md`.

### Phase 1b — Visual Parity + Planner Intent-Engine ✅ Complete (2026-07-03)

Eight-stage 100% parity push against `docs/prototype.html`:
- `4591c5a` — `@theme` block in `packages/ui/src/styles.css` so Tailwind v4 generates both CSS variables and utility classes for the olive/ochre palette
- `baf0042`, `081b40f` — additive color tokens + `@theme` wiring
- `66fc9cc` — Cinematic Concierge palette repointed to olive/ochre (variable VALUES re-mapped, names preserved)
- `efac8b0` — home page rewrite + shared `TopNav` / `SiteFooter` / `DestinationBento` + layout fonts (Inter + Playfair Display + JetBrains Mono) + Material Symbols
- `3d23441` — `TopNav` + `SiteFooter` on all 12 prototype ports
- `b3d0e28` — sync updated prototype.html + delete legacy home-client.tsx
- `1c5b9cd` — `bare` prop on `PageShell` + `ArchiveLayout` to suppress the inner Cinematic Concierge sticky header so the 4 marketing pages (`/portugal`, `/how-it-works`, `/human-review`, `/pricing`) can wrap with the shared `TopNav` + `SiteFooter` without a duplicate nav row
- `56cf3c5` — `/planner` wired to `@repo/ai`'s `normalizeTripPrompt`: `PromptComposer` (input + examples + loading stages) + `FollowUpPanel` (chip-based `needs_follow_up` answers) + `BriefConfirmation` + `BriefField` (candidate review) + URL-encoded brief handoff to `/trip/new`
- `47f4291` — `/trip/new`'s `TripBriefForm` consumes `?brief=<json>` from the planner handoff; `parseBriefFromQuery` (decode + JSON.parse + `TripBriefSchema.safeParse`) + `briefToFormState` (TripBrief → FormState with default fallback) + Suspense boundary + "Pre-filled from the planner" banner
- `e055636` — visual-review screenshots + 100% parity summary

### Phase 1c — Spatial Engine Foundation ✅ Complete (2026-07-03)

Greenfield `packages/spatial-engine` package with provider-agnostic core abstractions + MapLibre GL JS adapter. New `/explore` Discovery Hub route renders a 3D interactive globe of Portugal seeded with traveler + specialist pins via the TelemetryService.

- `core/types.ts` — `SpatialEngine`, `SpatialLayer`, `SpatialLayerContext`, `SpatialPalette`, `MapStyleEndpoint`, `MapStyleProvider`, `CameraController`, `CameraTarget`, `CameraExecutor`, `TelemetryService`, `TelemetryChannel`, `SpatialFeature`, `SpatialFeatureCollection`, `SpatialEngineOptions`
- `core/map-style-provider.ts` — `CartoBasemapStyleProvider` (CARTO Dark Matter for theme="dark", CARTO Positron for theme="light"; both with attribution baked in)
- `core/camera-controller.ts` — `SpatialCameraController` + `CameraExecutor` adapter interface (`focus`/`returnHome`/`followUser`/`fitBounds`; reduced-motion-aware)
- `core/telemetry-service.ts` — `InMemoryTelemetryService` with `subscribe`/`publish`/`seed`/`shutdown`, RAF-equivalent 80ms batching of `publish()` into single listener flush, replay-on-subscribe for new subscribers
- `adapters/maplibre/`:
  - `spatial-engine.ts` — `MapLibreSpatialEngine` (the only place that knows the renderer is MapLibre), `bindLayerToChannel` (WeakMap registry), `createDiscoveryEngine` (registers the standard ambient + badges layers)
  - `map-instance.ts` — `mountMapLibreInstance` (style + initial target + `setProjection({type:'globe'})`; Promise-wrapped flyTo/jumpTo/fitBounds executor)
  - `layers/ambient-pulse.ts` — `AmbientPulseLayer` (ochre `circle` layer bound to "travelers" channel, configurable radius + stroke)
  - `layers/symbol-badges.ts` — `SymbolBadgesLayer` (primaryContainer `circle` layer bound to "specialists" channel with zoom-interpolated radius)
- `fixtures/travelers.ts` — `fixtureTravelerCollection` (3 PT travelers), `fixtureSpecialistCollection` (3 PT specialists), `fixtureAllCollections`
- `components/globe-workspace.tsx` — `GlobeWorkspace` React component (dynamic-imported via `next/dynamic` with skeleton fallback; ResizeObserver + `requestAnimationFrame` to recover from layout-not-settled init; reduced-motion respected; cleanup on unmount)
- `app/(marketing)/explore/page.tsx` + `discovery-globe.tsx` — server-side metadata + TopNav/SiteFooter + 3 capability cards

### Phase 1d — Spatial Engine 2D Workspace ✅ Complete (2026-07-03)

Completes the Spatial Engine half-of the architectural promise: same engine, two projections, three reference layers.

- `core/types.ts` — `SpatialEngineOptions.projection` (`"globe" | "mercator"`, default `"globe"`); `SpatialEngine` gains `setLayerVisibility`, `reorderLayer`, `applyLayerUpdate`
- `adapters/maplibre/map-instance.ts` — `MapLibreInstanceOptions.projection`; mercator mode calls `setProjection({ type: "mercator" })` so editing precision isn't lost to curvature
- `adapters/maplibre/spatial-engine.ts` — `createWorkspaceEngine` factory that wires ambient + specialist + route layers; `setLayerVisibility` / `reorderLayer` / `applyLayerUpdate` map to `setLayoutProperty` / `moveLayer` / `layer.onUpdate`
- `core/layer-registry.ts` — `LayerRegistry` with `register(layer)`, `enable(layerId, visible)`, `reorder(layerId, toIndex)`, `list()`, `isVisible(layerId)`, `bindTelemetry(layer, telemetry, channel)` for explicit data-flow control
- `adapters/maplibre/layers/route-layer.ts` — `RouteLayer` (ochre dashed `line` layer + primaryContainer `circle` stops; self-bound to `"trips"` channel via `bindLayerToChannel()`)
- `fixtures/routes.ts` — `fixtureRouteCollection` (5-stop Porto→Lisbon LineString + point features with order/label/note), `fixtureRouteSummary`
- `components/workspace-canvas.tsx` — `WorkspaceCanvas` React component (mercator projection, CARTO Positron style, reduced-motion + ResizeObserver; same lifecycle as `GlobeWorkspace`)
- `app/(marketing)/explore/workspace/page.tsx` + `workspace-canvas-client.tsx` — new route at `/explore/workspace` rendering the 2D canvas + 5-day itinerary + layer-registry card + cross-link to the 3D globe

Verified end-to-end via Playwright on /explore/workspace:
- Mercator projection with CARTO Positron (light) basemap, country labels visible (Portugal, Spain, Madrid, Sevilla)
- Ochre dashed LineString connects 5 stops Porto → Coimbra → Aveiro → Nazaré → Lisbon
- Dark-green stop markers at each city
- Ambient pulse + specialist badges render alongside the route
- Cross-link "See the 3D globe" navigates to /explore

Future migrations (separate sign-off):
- Replace `@repo/maps` CinematicMap + ProviderMap with `MapLibreSpatialEngine` + WorkspaceCanvas (Trip pages)
- Swap `InMemoryTelemetryService` for a Supabase Realtime adapter
- Promote GeoJSON batched updates + camera choreography hooks
- Add CARTO fog halo once `StyleSpecification.fog` is exported from a stable `@maplibre/maplibre-gl-style-spec` release

### Phase 2 — Production Supabase Reconciliation *(BLOCKER for launch)*

Goal: bring hosted Supabase to parity with local; eliminates the spec's Phase 1 RLS drift blocker.

| # | Task | Source |
|---|---|---|
| 2.1 | Apply `202605011600_create_user_roles_and_ownership.sql` (adds `owner_user_id`) | local migration |
| 2.2 | Apply `202605011700_create_rls_policies_and_grants.sql` | local migration |
| 2.3 | Apply `202605011800_add_indexes_constraints_trip_transaction.sql` | local migration |
| 2.4 | Apply `202605020230_create_payment_webhook_events.sql` | local migration |
| 2.5 | Apply `20260504010324_admin_audit_trail.sql` | local migration |
| 2.6 | Apply `202607022000_enable_postgis_pgvector_and_places_embeddings.sql` (adds PostGIS + pgvector + places extension columns + GIST/HNSW indexes) | local migration |
| 2.7 | Apply `202607022100_create_user_geolocation_logs.sql`, `202607022110_create_specialist_profiles.sql`, `202607022120_alter_chat_threads_add_service_level.sql`, `202607022130_alter_chat_messages_add_metadata.sql`, `202607022140_create_guide_dispatches.sql` (spec-v4 schema additions) | local migrations |
| 2.8 | Verify `public.reviewer_auth_links` and `public.user_profiles` exist | hosted |
| 2.9 | Enable **Leaked Password Protection** in Supabase Auth dashboard | hosted |
| 2.10 | Rotate `SUPABASE_SERVICE_ROLE_KEY` and update prod secrets | hosted + Vercel |
| 2.11 | Verify RLS actively constrains user-facing reads (per `docs/ops/launch.md` §3 smoke test) | hosted |

**Exit criteria**: every line in `docs/ops/launch.md` §1 checked; outsider test user cannot read another user's trip.

### Phase 3 — Hosted Worker Runner (decision made: Upstash QStash)

Goal: move `apps/workers` from bounded local to Upstash QStash (decision documented in `docs/spec-refined-2026.md` §6).

| # | Task |
|---|---|
| 3.1 | Add Upstash QStash SDK to `apps/workers` |
| 3.2 | Replace bounded-local entrypoint with QStash handler |
| 3.3 | Wire PDF/Calendar export jobs to QStash |
| 3.4 | Add Upstash Redis caching for place lookups |

### Phase 4 — Live Provider Integrations

Replace deterministic stubs with live providers at the package boundary:
- `@repo/payments` → live Stripe + webhooks
- `@repo/emails` → live Resend
- `@repo/ai` → live **Vercel AI SDK** (replace direct OpenAI integration per refined spec §3)
- `@repo/maps` → live Mapbox GL (replace stub)

### Phase 5 — Spec-Phase 1 Backfill (Foundations)

| # | Task | Spec Phase |
|---|---|---|
| 5.1 | Enable PostGIS extension on hosted | Refined 1 — local migration `202607022000_*` ready |
| 5.2 | Enable pgvector extension on hosted | Refined 1 — local migration `202607022000_*` ready |
| 5.3 | Add `embedding` column to `places` + add spatial column | Refined 2 — `places.coordinates GEOMETRY(Point, 4326)` + `places.embedding VECTOR(1536)` + GIST + HNSW indexes ready in local migration |
| 5.4 | Confirm Tailwind v4 dependency | Refined 1 — ✅ v4.2.4 pinned (`0037fd9`) |

### Phase 6 — Spec-Phase 2 Backfill (Knowledge Graph — Portugal Module)

| # | Task | Spec Phase |
|---|---|---|
| 6.1 | Seed Lisbon, Sintra, Porto, Algarve place lists | Refined 2 |
| 6.2 | Generate text descriptions → pgvector embeddings | Refined 2 |
| 6.3 | Apply Mapbox minimalist skin geometries (audit existing `packages/maps`) | Refined 2 |

### Phase 7 — Spec-Phase 3 Backfill (Invisible AI Engine — Tier 1)

| # | Task | Spec Phase |
|---|---|---|
| 7.1 | Wire Vercel AI SDK into `packages/ai` (replace direct OpenAI integration) | Refined 3 |
| 7.2 | Introduce Zustand store for transient map/UI state | Refined 3 |
| 7.3 | Wire `Replace this stop` to drop the node + re-run semantic search | Refined 3 |
| 7.4 | Migrate `@repo/maps` Trip consumers to `@repo/spatial-engine` WorkspaceCanvas (2D) variant | Refined 3 |
| 7.5 | Replace `InMemoryTelemetryService` with a Supabase Realtime adapter | Refined 3 |

### Phase 8 — Spec-Phase 4 Backfill (Workspace + Checkout)

| # | Task | Spec Phase |
|---|---|---|
| 8.1 | Asymmetric timeline canvas + inline controls (per Awwwards paradigm) | Refined 4 |
| 8.2 | Live Stripe checkout + webhook → `payment_webhook_events` ledger | Refined 4 |
| 8.3 | PDF + Calendar Export Engines gated by Stripe unlock | Refined 4 |
| 8.4 | Affiliate booking attribution flow | Refined 4 |

### Phase 9 — Spec-Phase 5 Backfill (Specialist Hub — Tier 2)

| # | Task | Spec Phase |
|---|---|---|
| 9.1 | Add `chat_threads` + `chat_messages` tables | Refined 5 |
| 9.2 | Asynchronous chat infrastructure (Supabase replication) | Refined 5 |
| 9.3 | Reviewer dashboard route-timeline display (per spec §7 SLA) | Refined 5 |
| 9.4 | AI triage pre-routing | Refined 5 |

---

## 4. Future Backlog (DEFERRED — not in active roadmap)

- **Mobile companion** (Phase 6 in refined spec) — Expo + React Native + offline geolocation sync.
- **Tier 3 in-person guide marketplace** (Phase 7 in refined spec) — RNAAT compliance + physical guide dispatch.
- **International expansion** (Phase 8 in v2.0 spec) — Spain, Italy, France, Greece, Japan.

Reactivation triggers documented in `docs/spec-refined-2026.md` §5.

---

## 5. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Phase 2 schema application breaks hosted data | High | PITR backup before each migration; oldest → newest; verify `get_advisors(security)` after each |
| Phase 2.8 service-role key rotation invalidates in-flight requests | High | Coordinate with Vercel deployment window |
| Phase 3 Upstash QStash lock-in | Low-Medium | QStash has portable HTTP-cron semantics; Upstash Redis cache is replaceable with Vercel KV |
| Phase 4 provider integrations introduce latency | Medium | Provider calls wrapped in `@repo/*`; UI shows deterministic-fallback during long polls |
| Phase 5–7 spec-backfill drift from refined scope | Medium | Per-phase ADRs gate scope expansions; quarterly review against `docs/spec-refined-2026.md` |
| Bun runtime compatibility gaps with pnpm/Turbo | Medium | Bun is optional runtime; Node path stays primary |
| E2E blocked by missing Supabase env | Low | `npx supabase start` resolves |

---

## 6. References

- **`docs/spec-v4.md`** — v4.0 Master Product Specification (4-tier ascension model; current authoritative spec).
- **`docs/spec.md`** — v2.0 Master Product Specification (3-tier long-term vision; historical).
- **`docs/spec-refined-2026.md`** — Refined 2026 Scope (Tier 1+2-only immediate focus + Awwwards-grade design paradigm).
- **`docs/prototype.html`** — Single-file React SPA prototype (canonical visual identity + route map).
- **`docs/prototype-routes.md`** — Prototype routes mapped to current Next.js routes + migration plan.
- **`docs/design-tokens-olive-ochre.css`** — v4 `@theme` translation of the prototype (reference; additive to existing `packages/ui/src/styles.css`).
- **`docs/architecture.md`** — current architecture overview.
- **`docs/adr/001-auth-rls-strategy.md`** — RLS strategy.
- **`docs/adr/002-deterministic-contracts.md`** — provider-stubbing pattern.
- **`docs/ops/launch.md`** — pre-launch gate (Phase 2).
- **`docs/ops/backup-restore.md`** — PITR / disaster recovery.
- **`docs/ops/incidents.md`** — incident response runbook.
- **`docs/ops/deploy-rollback.md`** — deployment + rollback.
- **`docs/error-monitoring.md`** — error monitoring approach.
- **`docs/audit/phase-0-cinematic-redesign.md`** — Phase 0 audit evidence.
- **`README.md`** — quick start.

---

## 7. Open Questions (need user call)

1. **Phase 2 Supabase credentials** — confirm access pattern: local-only dry-run first, then staged apply, then hosted?
2. **`apps/mobile/` scope** — definitively deferred per refined spec, or scaffold-abandoned?
3. **Tier 3 reactivation metrics** — PM-owned; what's the break-even threshold for Tier 1+2?
4. **Tailwind version audit** — current package.json has no Tailwind pin; verify v3 vs v4 baseline.
5. **Vercel AI SDK migration timing** — wire in Phase 4 (live providers) or earlier in Phase 7 (Tier 1)?