# Rumia — Roadmap

> **Historical snapshot (2026-07-04).** This document preserves the earlier
> tiered/Cloudflare/Supabase roadmap for context. It is not the current launch
> contract. Use the [activity-first master plan](superpowers/plans/2026-07-10-rumia-activity-first-master.md),
> [archived VPS migration record](superpowers/archive/plans/2026-07-11-rumia-vps-self-hosted-migration.md),
> and [latest plan audit](../specs/PLAN-AUDIT_LATEST.md) for current scope,
> architecture, and release status.

> **Historical cross-reference only.** The three older specs below are retained
> for context; none is the current release source of truth.
>
> - **v4.0 (former long-term authority)** → [`docs/spec-v4.md`](./spec-v4.md) — historical 4-tier ascension model (Tier 1 Core / Tier 2 Curation / Tier 3 Concierge / Tier 4 Marketplace).
> - **v2.0 long-term vision** → [`docs/spec.md`](./spec.md) — 3-tier Tiered Service Model (preserved for historical reference).
> - **Refined 2026 scope** → [`docs/spec-refined-2026.md`](./spec-refined-2026.md) — visual identity (olive/ochre) + UI/UX details; Tier 3 + Mobile deferred.
> - **Former operational launch-readiness** → §3 below. It is superseded by the
>   current plan audit and VPS runbook.
> - **Master engineering lifecycle & Cloudflare deployment roadmap** → [`docs/master-roadmap.md`](./master-roadmap.md) — the consolidated 6-phase Cloudflare Pages + R2 + PMTiles + Workers blueprint with the phase-to-PR cross-reference and the 2026-07-04 status table. This file is the operational view; the master is the strategic / engineering-lifecycle view.
> - **Granular 8-phase engineering plan** → [`docs/engineering-lifecycle.md`](./engineering-lifecycle.md) — week-by-week engineering sequencing (complements the master; different scope — international expansion + marketplace + white-label B2B).
> - **2026-07-04 polish + functional-fixes pass** → [`docs/reviews/2026-07-04-polish-and-functional-fixes.md`](./reviews/2026-07-04-polish-and-functional-fixes.md) — the 12-phase pass that wired console forms end-to-end, added Portugal region covers, fixed the visual test flake, and brought @smoke to 184/184.
>
> Section 2 maps current state to the v4 5-phase engineering plan.

> The long status paragraph below is a historical snapshot from 2026-07-04.
> Its test counts, hosted-Supabase blocker, and Cloudflare/CARTO decisions are
> not current evidence. See `specs/PLAN-AUDIT_LATEST.md` for verified status.

---

## 1. Historical product model (superseded)

Four-tier travel concierge platform for Portugal-first, AI-powered itinerary planning:

- **Tier 1 (Core AI Wrapper)**: structured brief → RAG-generated day-by-day itinerary with maps, routing, opening-hour validation. Free; monetized via exports + affiliate bookings.
- **Tier 2 (Specialist Curation)**: human specialist audit + async chat. One-time flat fee per booking.
- **Tier 3 (Full Remote Support)**: 24/7 concierge lifeline during the active trip. AI pre-triage (parking, hours, transit) → specialist rota (taste, nuance, urgent transactional). Daily rate subscription.
- **Tier 4 (On-Site Real Guide)**: RNAAT-licensed physical guide dispatch. Premium flat-day fee.

The immediate implementation focus is Tier 1 + Tier 2 with Tier 3 in-progress (per `docs/spec-v4.md`). Tier 4 is gated on RNAAT compliance + ops partner (see spec §3).

---

## 2. Historical implementation snapshot (last verified 2026-07-04)

### Phase 1 — Foundations & Architecture Setup

| Requirement | Status |
|---|---|
| Monorepo (`pnpm` + `turbo`) with apps + packages layout | ✅ **Done** — 12 packages + 2 runnable apps |
| PostgreSQL + PostGIS + pgvector extensions | 🟡 **Local-only** — migration `202607022000_enable_postgis_pgvector_and_places_embeddings.sql` ships PostGIS + pgvector + places extensions + GIST/HNSW indexes; blocked by Phase 2 hosted Supabase credentials |
| `places.embedding` migrated to `halfvec(1536)` (HNSW-friendly) | 🟡 **Local-only** — migration `202607032300_migrate_places_embedding_to_halfvec.sql` is idempotent (skips if pgvector < 0.7.0); HNSW index build needs `maintenance_work_mem='2GB'` + `VACUUM ANALYZE` before apply per `packages/ingest/README.md` |
| `places.osm_id` partial-unique for ingest upsert | 🟡 **Local-only** — migration `202607040000_add_places_osm_id.sql` ready; no schema change for editorial v1 rows |
| Tailwind v4 design tokens (matches `packages/ui/src/styles.css`) | ✅ **Done** — `tailwindcss: ^4.2.4` pinned as direct dep; `@theme` block generates both CSS variables in `:root` and utility classes for olive/ochre palette (`4591c5a`, `081b40f`, `baf0042`) |
| Visual identity = prototype (olive/ochre + cream/sage) | ✅ **Done** — `@theme` block in `packages/ui/src/styles.css`; home page (`efac8b0`), 12 prototype ports, and 4 marketing pages all render at 100% parity with `docs/prototype.html`; shared `TopNav` + `SiteFooter` from `apps/web/app/_components/` (commits `1c5b9cd`, `3d23441`) |
| Spatial Engine: provider-agnostic core (`@repo/spatial-engine`) | ✅ **Done** — see Phase 1c/1d below |
| Spatial Engine 2D ↔ 3D projection switch + layer registry | ✅ **Done** — Phase 1d |
| `useMapStore` Zustand store + `useMapSourceSync` high-frequency path | ✅ **Done** — see Phase 1d + `app/(marketing)/explore/workspace/workspace-canvas-client.tsx` wiring (commits `389e164`, `f0b890c`, `debdfb8`, `c79ab2c`) |
| Vitest 3.2 `test.projects` migration (drop deprecated `environmentMatchGlobs`) | ✅ **Done** — `vitest.config.ts` now declares a `jsdom` and a `node` project; `extends: true` carries the root `resolve.alias` (`@` → `apps/web`) into each project. 534/534 across 59 files (`6775e30`) |
| Decorative-icon a11y sweep (Phase 1k P6) | ✅ **Done** — `aria-hidden="true"` on the 3 `material-symbols-outlined` decorative spans in `hero-map.tsx:140` and `workspace-shell.tsx:228, 274` (`25c5e0d`) |
| Phase 1 code + 3 doc LOWs from 2026-07-03 review | ✅ **Done** — see `Pre-existing tech debt` below |

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
| `specialist_profiles` unified model (Tier 3 + Tier 4) | ✅ **Done** — migration `202607022110_create_specialist_profiles.sql`; `packages/db/src/specialists.ts` has `getSpecialistProfileByUserId` + `upsertSpecialistProfile`; enforced tier-4 license CHECK + tier-4 must-be-verified CHECK |
| Specialist onboarding form (`/guide/onboarding`) | ✅ **Done** — see Phase 1e below; supports regions + skills + languages + bio + photo URL |
| Specialist capabilities table (skills, languages, bio, photo) | ✅ **Done** — migration `202607040200_create_specialist_capabilities.sql`; `packages/db/src/specialists.ts` has `getSpecialistCapabilities` + `setSpecialistCapabilities` (replace-all diff) |
| Admin verification queue (`/admin/specialists`) | ✅ **Done** — see Phase 1e; `setSpecialistVerified` + `flipVerification` server action; tier-4 unverify is refused at the application layer (DB CHECK mirror) |
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
| Zustand | required | ✅ in use — `apps/web/lib/store/useMapStore.ts` (Zustand 4.5.5) drives the high-frequency `useMapSourceSync` path. PR-11d matchmaking preview will reuse this pattern |
| Tailwind v4 | required | ✅ v4.2.4 pinned as direct dep in `apps/web` and `packages/ui` |
| Bun | optional runtime | ❌ not in use — pnpm/Node |
| Upstash QStash + Redis | queue/cache | ❌ not in use — `apps/workers` is bounded-local |
| PostGIS | required | 🟡 migration `202607022000_*` enables locally; awaiting hosted |
| pgvector | required | 🟡 migration `202607022000_*` enables locally; awaiting hosted |
| Sentry (error monitoring) | required | ✅ in use — `@sentry/nextjs` in `apps/web` (client + server + edge), `@sentry/node` in `apps/workers`. All env-gated; SDK is a no-op without `SENTRY_DSN` (`31f82f4`) |
| Perf budget | required | ✅ in use — `scripts/perf-budget.mjs` (top-10 + sampled gzipped estimate) wired as `turbo run quality` (`0ca35d1`). Report-only by default; `PERF_BUDGET_KB` enforces |
| PostHog (product analytics) | required | ❌ **Deferred** — user decision 2026-07-04. The funnel events `wizard_started` / `brief_submitted` / `upgrade_clicked` are deferred until there is real traffic to measure. `tryCapture` + `WebVitalsReporter` shims already exist; destination stays un-wired |

### Pre-existing tech debt (carried, recently fixed)

- `packages/db/src/index.ts` had `isPersistenceConfigError` shadow re-export; **removed** (`7a4f555`).
- 11 placeholder copy items in admin/reviewer `EmptyState` + `"Active MVP"` status label; **replaced** (`7a4f555`).
- 6 admin pages had `error.message` fall-through in catch blocks; **replaced** with generic fallbacks (`3cb58a1`).
- Vitest include pattern excluded `*.test.tsx`; **fixed** (`253da10`).
- `.sisyphus/`, `.omk/`, `.kimi/`, `.playwright-mcp/` untracked tool state; **removed** (`bc1aa48`, `339ffb9`).
- 9 scratch debug scripts + `apps/web/playwright-report/`; **deleted** (`253da10`).
- Marketing pages (`/portugal`, `/how-it-works`, `/human-review`, `/pricing`) had Cinematic Concierge sticky header alongside `TopNav`; **fixed** with `bare` prop on `PageShell`/`ArchiveLayout` (`1c5b9cd`).
- `/planner` was a static "Synthesize Itinerary" CTA pointing at `/logistics`; **wired** to real `PromptComposer` + `normalizeTripPrompt` + `BriefConfirmation` flow (`56cf3c5`).
- Specialist onboarding form asked for "Region UUIDs from the regions table" as a freeform text field; **replaced** with the `RegionPicker` checkbox grid (PR-11a, `c79ab2c`). The `regions` table's `text` PK doesn't match `regions_covered UUID[]`, so a `region-ids.ts` static map (`8c3a8a1a-...` namespace) is the boundary; the synthetic-UUID design is documented inline for the future regions-table normalization (PR-11d).
- `revalidatePath("/admin/specialists")` in the onboarding action was a dangling pointer (the route didn't exist); **resolved** by adding `/admin/specialists` (PR-11b, `abdb135`).
- `flip-verification-form.tsx` shipped a `<form>` wrapper around a `type="button"` button (dead code); **removed** (`99a2020`).
- The vitest root config used the deprecated `environmentMatchGlobs`; **migrated** to `test.projects` with `extends: true` so the root `resolve.alias` (`@` → `apps/web`) inherits (`6775e30`).
- Three decorative `<span class="material-symbols-outlined">` lacked `aria-hidden="true"` in `hero-map.tsx` and `workspace-shell.tsx`; **fixed** to close Phase 1k P6 (`25c5e0d`).
- The 11 carry-over LOWs from the 2026-07-03 review (LOW-1, LOW-2, LOW-3, LOW-4, LOW-5, LOW-6, LOW-7, LOW-8, LOW-9, LOW-10, LOW-11) were already addressed by the 4 code+3 doc commits on `main` by `b9481df`/`3d7ad96`/`5d1d640`/`866da29`. `audit/phase-1-rota-component-audit.md` and the axe evidence file (`apps/web/.sisyphus/evidence/future-roadmap/task-37-axe-violations.json`) reflect the new state.

---

## 3. Operational Roadmap — Launch-Readiness Phases

These phases unblock production deployment. They run alongside the refined 5-phase engineering plan; many refined-phase items have local-only implementations that need operational work below to ship.

### Decision Log

| # | Question | Decision | Date | Notes |
|---|---|---|---|---|
| 1 | Two-app architecture (`apps/web` + `apps/ops`)? | **Stay single-app with route groups** | 2026-07-03 | Specialist MAU <5%; Vercel per-route middleware covers 80% of the need. Revisit at Stripe Connect or SSO inflection. ADR in PR-10. |
| 2 | `apps/mobile/` (Expo + React Native)? | **Defer; PWA is the user-facing path** | 2026-07-03 | Per refined spec; PWA + IndexedDB cover offline; no native-app demand validated. |
| 3 | Roadmap reconciliation? | **`docs/engineering-lifecycle.md` is the granular view; this file is the operational view** | 2026-07-03 | Cross-references at the top of each file. |
| 4 | DuckDB runtime? | **Node-side `duckdb-async`** | 2026-07-03 | Faster for batch Parquet I/O; stable C++ core. WASM deferred. |
| 5 | Stripe account + business registration? | **Later** | 2026-07-03 | Defer until CP-4 is unblocked by business-side provisioning. |
| 6 | Resend account? | **Later** | 2026-07-03 | Coupled to the Stripe receipt flow. |
| 7 | The 11 carry-over LOWs from the first review? | **Fix all** | 2026-07-03 | Addressed in 4 code+3 doc commits (`b9481df`/`3d7ad96`/`5d1d640`/`866da29`); axe evidence and audit doc updated. |
| 8 | Tier 3 reactivation metrics? | **Start tracking** | 2026-07-03 | Define metrics + instrument data; no Tier 3 development yet. PM-owned break-even threshold. |
| 9 | Specialist region picker storage shape? | **Synthetic-UUID map in `packages/types/src/region-ids.ts`** (8c3a8a1a-… namespace) | 2026-07-04 | `specialist_profiles.regions_covered UUID[]` collides with the static `portugalRegions` slug enum and the `regions` table's `text` PK. A single static map is the minimum change that keeps the form slug-driven, the zod `z.string().uuid()` schema unchanged, and the column unchanged. `isSyntheticRegionId` is the migration gate for the future regions-table normalization (PR-11d). |
| 10 | PostHog install now or wait? | **Wait** | 2026-07-04 | The funnel events (`wizard_started`, `brief_submitted`, `upgrade_clicked`) need real traffic to be useful. The `tryCapture` + `WebVitalsReporter` shims already exist and stay no-op until a destination is wired. Revisit after the first 1k MAU. |
| 11 | Sentry init: DSN-required or env-gated? | **Env-gated** | 2026-07-04 | All three config files (client/server/edge) and the workers init check for `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`; the SDKs are no-ops without secrets. `next.config.ts` only wraps with `withSentryConfig` when the env is set. `dryRun: true` on the Sentry CLI without `SENTRY_AUTH_TOKEN` so dev/CI builds stay clean. |
| 12 | Perf budget: enforce now or report-only? | **Report-only by default; enforce via env** | 2026-07-04 | `pnpm qa:perf-budget` runs in report mode (exit 0) without env. `PERF_BUDGET_KB=…` enforces; `PERF_BUDGET_FAIL=1` fails CI. Wired as `turbo run quality` so a real budget drops in later without a code change. The current build reads 77.7 MB raw / 8.7 MB gzipped (sampled) — most of the raw is source maps excluded by `hideSourceMaps: true`. |

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

### Phase 1e — Specialist Onboarding + Verification Queue (PR-11) ✅ Complete (2026-07-04)

Specialist self-service path: specialists sign up, set regions / skills / languages / bio / photo, and an admin flips `is_verified` after KYC + license check.

- `packages/types/src/region-ids.ts` — synthetic-UUID map (`8c3a8a1a-0000-0000-0000-0000000000NN` namespace) for the 9 Portugal regions. Round-trip tests + bijection assertion. `isSyntheticRegionId` is the single gate for the future regions-table normalization (PR-11d).
- `packages/types/src/trip-brief.ts` — `specialistLanguages` enum + `specialistLanguageLabels` map (pt/en/es/fr/it/de); single source of truth for the closed language set.
- `packages/db/src/specialists.ts` — adds `bio` and `photoUrl` to `SpecialistProfile` and the upsert schema; new `getSpecialistCapabilities` (bucketed read) + `setSpecialistCapabilities` (diff-based replace-all); new `listSpecialists` (admin queue) + `setSpecialistVerified` (with application-layer guard against the `specialist_profiles_tier4_must_be_verified` DB CHECK).
- `supabase/migrations/202607040200_create_specialist_capabilities.sql` — `specialist_capabilities` table (one row per specialist/type/value), `bio` + `photo_url` columns on `specialist_profiles`, RLS for own rows, CHECK constraints on language enum and skill length. The plan's "wide table" shape was replaced with this normalized split; rationale in the migration header.
- `apps/web/app/guide/onboarding/_components/region-picker.tsx` — 9-checkbox grid driven by `portugalRegions` (PR-11a, `c79ab2c`).
- `apps/web/app/guide/onboarding/_components/skills-input.tsx` — chip input with Enter/comma to add, X to remove, 80-char cap, 20-skill cap, case-insensitive dedupe.
- `apps/web/app/guide/onboarding/_components/languages-picker.tsx` — 6-checkbox grid driven by `specialistLanguages`.
- `apps/web/app/guide/onboarding/actions.ts` — zod extended with `bio`/`photoUrl`/`skills`/`languages`; submit replaces the capability rows after the profile upsert. New `loadSpecialistCapabilities` server action for the page.
- `apps/web/app/(admin)/admin/specialists/page.tsx` — admin verification queue (PR-11b, `abdb135`): `getAdminPageAuthContext` gate, `DataTable` with full name / tier badges / regions / RNAAT / rate / verification badge / flip control. Stat cards for total, verification, tier split. Bio + capability counts in the row.
- `apps/web/app/(admin)/admin/specialists/actions.ts` — `flipVerification` server action with admin re-check + zod-parse + `revalidatePath` on success.
- `apps/web/app/(admin)/admin/specialists/_components/flip-verification-form.tsx` — client form, single button (Verify/Unverify), `useTransition` for pending state, "Unverify" disabled for tier-4 rows (DB CHECK mirror).

Tests added in this phase: 7 region-ids round-trip, 6 region-picker, 9 specialists (list/verify/tier-4 guard), 7 capabilities (read + 4 diff paths), 7 skills-input, 6 languages-picker — total 42 new tests (all green; 534/534 baseline).

### Phase 1f — Observability Foundation ✅ Complete (2026-07-04)

Error monitoring and build-time perf budget. Both env-gated so dev / preview / CI without secrets still ship clean.

- `@sentry/nextjs` direct dep in `apps/web` (v8, Turbopack-friendly). `sentry.client.config.ts` + `sentry.server.config.ts` + `sentry.edge.config.ts` — all three init only when `SENTRY_DSN` (or `NEXT_PUBLIC_SENTRY_DSN`) is set. `next.config.ts` wraps with `withSentryConfig` only when `SENTRY_DSN` is set, otherwise ships the raw config. `silent: !SENTRY_DSN` + `dryRun: !SENTRY_AUTH_TOKEN` keep the build log clean. Replays on error only (sample 1.0); session replays disabled to keep ingest volume low.
- `@sentry/node` direct dep in `apps/workers`. `src/sentry.ts` — `initSentry()` (module-load side effect, no-op when DSN absent), `withSentry(label, fn)` (span-wrap a job), `captureException(err)` (try/catch boundary). The web app imports from `@repo/workers/plan` (a separate subpath) so the SDK never initializes in a Next.js process. (`31f82f4`)
- `scripts/perf-budget.mjs` — walks `apps/web/.next`, reports total + sampled-gzipped size + top 10. `pnpm qa:perf-budget`. Turbo `quality` task (`^build` → script). Report-only by default; `PERF_BUDGET_KB=…` enforces, `PERF_BUDGET_FAIL=1` fails CI. Current build reads 77.7 MB raw / 8.7 MB gzipped (sampled). The gzipped estimate samples JS/CSS/HTML/JSON/SVG/WOFF2 only (skips source maps and already-compressed assets) so it's a fair wire-weight proxy. (`0ca35d1`)
- PostHog is intentionally not installed. The `tryCapture` + `WebVitalsReporter` shims already exist and stay no-op until a destination is wired. Decision Log #10.

Future migrations (separate sign-off):
- Replace `@repo/maps` CinematicMap + ProviderMap with `MapLibreSpatialEngine` + WorkspaceCanvas (Trip pages)
- Swap `InMemoryTelemetryService` for a Supabase Realtime adapter
- Promote GeoJSON batched updates + camera choreography hooks
- Add CARTO fog halo once `StyleSpecification.fog` is exported from a stable `@maplibre/maplibre-gl-style-spec` release

### Phase 2 — Production Supabase Reconciliation *(BLOCKER for launch)*

Goal: bring hosted Supabase to parity with local; eliminates the spec's Phase 1 RLS drift blocker.

| # | Task | Source |
|---|---|---|
| 2.0 | **PITR backup** (do not skip) per `docs/ops/backup-restore.md` | hosted |
| 2.1 | Apply `202605011600_create_user_roles_and_ownership.sql` (adds `owner_user_id`) | local migration |
| 2.2 | Apply `202605011700_create_rls_policies_and_grants.sql` | local migration |
| 2.3 | Apply `202605011800_add_indexes_constraints_trip_transaction.sql` | local migration |
| 2.4 | Apply `202605020230_create_payment_webhook_events.sql` | local migration |
| 2.5 | Apply `20260504010324_admin_audit_trail.sql` | local migration |
| 2.6 | Apply `202607022000_enable_postgis_pgvector_and_places_embeddings.sql` (adds PostGIS + pgvector + places extension columns + GIST/HNSW indexes) | local migration |
| 2.6a | `set maintenance_work_mem='2GB'; VACUUM ANALYZE public.places;` then apply `202607032300_migrate_places_embedding_to_halfvec.sql` (HNSW halfvec migration; idempotent, skips on pgvector <0.7.0) | local migration |
| 2.6b | Apply `202607040000_add_places_osm_id.sql` (partial-unique `osm_id` for ingest upsert) | local migration |
| 2.6c | Apply `202607040100_create_place_adjustment_log.sql` (specialist audit log for the self-healing ranking loop, Phase 6) | local migration |
| 2.6d | Apply `202607040200_create_specialist_capabilities.sql` (skills, languages, bio, photo for specialist onboarding) | local migration |
| 2.7 | Apply `202607022100_create_user_geolocation_logs.sql`, `202607022110_create_specialist_profiles.sql`, `202607022120_alter_chat_threads_add_service_level.sql`, `202607022130_alter_chat_messages_add_metadata.sql`, `202607022140_create_guide_dispatches.sql` (spec-v4 schema additions) | local migrations |
| 2.8 | Verify `public.reviewer_auth_links` and `public.user_profiles` exist | hosted |
| 2.9 | Enable **Leaked Password Protection** in Supabase Auth dashboard | hosted |
| 2.10 | Rotate `SUPABASE_SERVICE_ROLE_KEY` and update prod secrets | hosted + Vercel |
| 2.11 | Verify RLS actively constrains user-facing reads (per `docs/ops/launch.md` §3 smoke test) | hosted |

**Exit criteria**: every line in `docs/ops/launch.md` §1 checked; outsider test user cannot read another user's trip.

> Migration ordering matters. The five `2026070400*` migrations are additive and safe to apply in any order after 2.6, but apply them as a batch so the verification queue, the audit log, and the halfvec HNSW all land together.

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

### Phase 10 — Visual Reference Catalog (Rumia Console v1.0, 2026-07-04)

The Rumia Console visual reference (a 11-page Tailwind v4 + Material Symbols blueprint, dual `class="light"` / `class="dark"` HTML set using the `olive/ochre/cream/sage` palette + `glass-light/glass-dark` glassmorphism + Playfair Display + Inter + JetBrains Mono + the full `bg-olive-dark/95 backdrop-blur-xl` SideNavBar pattern) is the **authoritative visual spec** for both the consumer surface (1.x) and the admin console (2.x, 3.x). The reference names the target; this catalog maps each reference page to its current state in the codebase and the work item that closes the gap.

**Color tokens (already live in `packages/ui/src/styles.css` via the `@theme` block — Phase 1b):** `background #e8fff0`, `surface #e8fff0`, `surface-variant #d2e8d9`, `on-background #0c1f16`, `primary #16281f`, `primary-container #2b3e34`, `olive-dark #1D2A23`, `olive-light #3C5447`, `ochre-dark #CE933F`, `ochre-light #EAB875`, `linen-dark #EFECE6`, `glass-light rgba(255,255,255,0.65)`, `glass-dark rgba(43,62,52,0.85)`, `surface-tint #4f6358`, `grid-pattern rgba(43,62,52,0.1)`. **No new tokens required** — the reference renders into the same palette the home page (`efac8b0`) and 12 prototype ports use.

**Type scale (already live in `packages/ui/src/styles.css`):** `display` 72/1.1/-0.02em/700 (Playfair), `headline-lg` 30/40/700, `headline-sm` 18/24/600, `body-md` 14/1.6/400 (Inter), `label-ui` 12/16/600, `mono-micro` 10/12/0.1em/700 (JetBrains Mono), `mono-technical` 12/16/500.

**The two gaps the reference names that are NOT in tree today:** (a) the **admin console shell** (a shared `app/console/layout.tsx` wrapping the 6 `/console/*` pages with the reference's SideNavBar + footer avatar + active-state `border-l-4 border-ochre-light`) — none of the 6 pages share a layout today; (b) the **3D/2D map as a home hero** with the search wizard floating over it — the 3D globe + 2D mercator exist as standalone routes under `/explore` and `/explore/workspace`, not as a hero overlay on `/`.

| Ref | Page | Current state | Code path | Work item |
|---|---|---|---|---|
| **1.1** | Landing & Discovery Gate (cinematic hero + bento destinations) | 🟢 Cinematic hero with 3D/2D map canopy + bento grid shipped (PR-12) | `app/(marketing)/page.tsx`, `app/(marketing)/hero-map.tsx`, `app/(marketing)/_components/destination-bento.tsx` | ✅ **DONE 2026-07-04** — `app/(marketing)/page.tsx` already mounts `<HeroMap initialProjection="globe" />` (a `GlobeWorkspace` from `@repo/spatial-engine` with `initialCenter: [-8.165, 39.55]`, `initialZoom: 3.4`, `disableIntro`) as the first child of the 819px hero `<section>`, at `z-0`. The glass-card search wizard with "Discover Intentionally." h1, "We are visiting Portugal for 7 days…" prompt, and "Begin Journey" CTA floats on top at `z-10`, with a `from-primary/55 via-primary/15 to-background/95` gradient overlay for text readability. `ProjectionToggle` (3D Globe / 2D Plan pills) sits in the top-right at `z-20`, switching the engine's projection in place without remounting the WebGL layer registry. `useMapStore` is wired for `onViewportChange` and `onStopClick` so the bento grid + workspace filmstrip stay in lock-step with the hero. Matches the reference §3.10 row 1.1 spec. |
| **1.2** | Natural Brief Wizard (dark, ambient radial glow, inline `wizard-input` dashed borders) | ✅ Built (Phase 1b, `56cf3c5`) | `app/(marketing)/planner/planner-client.tsx` → `PromptComposer` + `FollowUpPanel` + `BriefConfirmation` | None — already at the reference's intent (input + 2 sliders + synthesize CTA). The reference's destination/duration/month inline-edit text fields are functionally equivalent to the `TripBrief` form fields below the wizard |
| **1.3** | Smart Logistical Cards (single focal card, dual-option tile) | 🟢 The dual-tile variant ships for any 2-option follow-up (PR-17) | `app/planner/planner-client.tsx` | ✅ **DONE 2026-07-04** — added `BinaryQuestionCard` sub-component in `planner-client.tsx` (icon-led 2-col grid, ochre-light border + check_circle indicator on the selected tile, arrow-key keyboard nav, `role="radiogroup"` for a11y). A `BINARY_OPTION_ICONS` map (`car_rental`, `directions_transit`, `self_care`, `local_fire_department`) resolves Material Symbols; `isBinaryQuestion()` branches when a question's `options.length === 2` AND both options have icon mappings. Detected at render time so the `PromptFollowUpQuestion` type and the 5 existing `prompt-normalization.test.ts` tests stay untouched. The reference's "Will you rent a car?" focal card now renders when the normalization emits a car-rental binary pair. ⏸️ Adding a new binary question in `prompt-normalization.ts` (e.g. car-rental y/n) is a 1-line edit deferred to Phase 7 (Vercel AI SDK wiring). |
| **1.4** | Dynamic Workspace (full-bleed map + filmstrip stops + bento header) | 🟢 Map + filmstrip both shipped + camera fly-to bridge wired (PR-19 + PR-19b) | `app/(app)/trip/[tripId]/page.tsx` + `app/(app)/trip/[tripId]/_components/stop-filmstrip.tsx` + `apps/web/lib/hooks/useTargetCoordinatesCameraSync.ts` + `apps/web/lib/hooks/useFilmstripSourceSync.ts` | ✅ **DONE 2026-07-04** — new `StopFilmstrip` client component renders a 300px `snap-x snap-mandatory` row of stop cards (image + time + title + description + duration + Details/Navigate). Active card uses the dark `glass-panel-dark` variant with a top ochre-light bar, the "next up" stop gets an ochre `• NEXT` pill, the others use `glass-light` with `hover:-translate-y-1`. Click a card → `useMapStore.selectStop(id, coords)`; the highlight tracks `useMapStore.activeStopId`. **End-to-end live (PR-19b, 2026-07-04)**: `useFilmstripSourceSync` (mounted in `CinematicMapSection`) reads `activeStopId` and writes a 1-point `FeatureCollection` to the map's `stops` source via `useMapSourceSync`; `useTargetCoordinatesCameraSync` (handleRef-stabilized against parent re-render churn) flies the camera to the clicked stop. Race-safe via captured-target guard in the `finally` block; `[0, 0]` coordinate sentinel dropped synchronously. Filmstrip cards without `coordinates` render `disabled` (and `aria-pressed` is `undefined` on them — a disabled toggle would be a confusing screen-reader signal). Trip page flattens the first day's stops into `filmstripStops: FilmstripStop[]` and mounts the filmstrip as a new section right after `CinematicMapSection`. The vertical `ItineraryTimeline` still shows the full week; the filmstrip is a parallel "today" view. **E2E coverage (2026-07-04)**: new `apps/web/playwright/tests/integration/filmstrip-map.spec.ts` adds 2 tests × 2 projects (4 instances) — filmstrip section scrolls into view, 3 cards render, `aria-pressed` flips on click, the map canvas frame stays mounted across the fly-to. Stable test hooks: `data-testid="filmstrip-section"`, `data-testid="filmstrip-track"`, `data-testid="stop-card-{id}"`. |
| **1.5** | Tier Ascension Checkout (split-screen tier comparison, dark "Hybrid Specialist Review" panel) | 🟢 Split-screen comparison page already shipped at `/checkout` (PR-22) | `app/checkout/page.tsx` | ✅ **DONE 2026-07-04** — the existing `app/checkout/page.tsx` already implements the reference: centered h1 "Elevate Your Itinerary" + descriptive paragraph, 2-col grid (`grid-cols-1 lg:grid-cols-2`) split-screen comparison, Tier 1 `acrylic-glass` "Core AI Synthesis" with `memory` icon + 3 `check_circle` features + "Included" total + outlined "Continue with Core AI" button, Tier 2 `bg-olive-dark text-linen-dark border-ochre-light` "Hybrid Specialist Review" with the gold `bg-ochre-light/10 blur-3xl` accent glow in the top-right, `verified_user` icon (filled) + 4 `stars` features + "One-time Ascension Fee / €65" + ochre `Upgrade & Finalize` CTA, and the "Secure Transaction" footer with lock icon + terms disclaimer. Matches the reference §3.10 row 1.5 spec. ⏸️ The "Upgrade & Finalize" CTA currently links to `/expert-chat`; the live Stripe wiring is gated on PR-6 (Phase 4) and the `app/(app)/checkout/ascend/page.tsx` route relocation is a 1-PR follow-up. |
| **1.6** | Level 2 Expert Chat (Ana, 3-pane: timeline / chat / recommendation card) | 🟢 2-pane layout (timeline + chat) + embedded recommendation card both shipped (PR-18) | `app/expert-chat/page.tsx` | ✅ **DONE 2026-07-04** — the existing page already implements the reference's layout: left `<aside>` with the timeline (3 nodes: Day 1 / Day 2 active-pulse / Day 3 dimmed at 60% opacity), center chat with Ana's avatar + online dot, "Today" chip, user bubble (rounded-tr-sm), specialist reply (rounded-tl-sm with shadow), and the embedded `Specialist Recommendation` card (`bg-glass-light/80 backdrop-blur-xl p-5 rounded-2xl border border-ochre-light/30` + shimmer-on-hover + image + time + price + Decline/Add to Itinerary). Matches the reference §3.10 row 1.6 spec. ⏸️ Wire the recommendation to real `chat_messages` rows deferred to Phase 9.1 (chat schema). |
| **1.7** | Saved Vault & Export Panel (grid gallery + sliding export drawer) | 🟢 Vault grid + sliding export drawer both shipped (PR-16) | `app/vault/page.tsx`, `app/vault/_components/vault-gallery.tsx` | ✅ **DONE 2026-07-04** — `VaultGallery` is a client component with `useState<openCardId>`; clicking a card slides the drawer in from the right (`translate-x-0` / `translate-x-full` with `transition-transform duration-300 ease-out`); the drawer echoes the selected card's title in the "Selected Itinerary" pill; the 3 export options (PDF / Mobile / Share) are disabled until a card is picked; a scrim closes the drawer on mobile. Matches the reference §3.10 row 1.7 spec. ⏸️ Wire the export buttons to the live PDF / calendar engines (Phase 8.3) — the buttons are still visually correct, the click is a no-op. The standalone export page at `app/(app)/trip/[tripId]/export/page.tsx` stays for direct-link entry. |
| **2.1** | Operations Pipeline Board (kanban: New Drafts / In Revision / Active Chats) | 🟢 Page exists at `app/console/pipeline/page.tsx`; **shell + dnd-kit drag-and-drop shipped (PR-14a, PR-14b)** | `app/console/pipeline/page.tsx`, `app/console/_components/pipeline-board.tsx`, `app/console/layout.tsx` | ✅ **PR-14a DONE** + ✅ **PR-14b DONE 2026-07-04** — `@dnd-kit/core` wired; cards are `useDraggable`, lanes are `useDroppable`, `onDragEnd` moves items between statuses in local state. `RelativeTime` client component ticks the "Updated Xm ago" badge every minute. ⏸️ **SLA countdown** deferred (no start-time in the data shape — only the target `slaHours`) and ⏸️ **server action `moveTripStage`** deferred (needs PR-9.4 AI triage to populate the pipeline with real rows). Both are 1-day follow-ups once the data lands. |
| **2.2** | Master Revision Workspace (left anchors + center timeline + bottom validation bar) | 🟢 Page exists at `app/console/workspace/page.tsx`; **3-pane split** + **validation bar** + **`ClientAnchorCard` (HARD CONSTRAINT / PREFERENCE / FLEXIBLE badge)** + **`ValidationBar` (1 CONFLICT / TRANSIT FEASIBLE / PACING MET pills + Resolve Conflicts CTA)** all shipped (PR-14a, PR-15) | `app/console/workspace/page.tsx`, `app/console/_components/client-anchor-card.tsx`, `app/console/_components/validation-bar.tsx` | ✅ **DONE 2026-07-04** — `ValidationBar` is imported and rendered at `workspace/page.tsx:218` with the `bg-glass-dark border-t border-white/10` bottom strip; pills use `bg-red-500/20 text-red-400` for conflict + `bg-olive-light/20 text-olive-light` for feasible / pacing; the `Resolve Conflicts` CTA uses `bg-ochre-light hover:bg-white` per the reference. ⏸️ Wire the conflict count to a real `packages/ai` conflict-detection output deferred to Phase 9.4 (AI triage) |
| **2.3** | Specialist Messaging Hub (3-col: threads / chat / snippets + timeline push) | 🟢 3-col layout + snippet library + drag-to-input + Update Timeline panel all shipped (PR-20) | `app/console/messages/page.tsx`, `app/console/_components/snippet-card.tsx` | ✅ **DONE 2026-07-04** — `app/console/messages/page.tsx` already implements the 3-col reference layout (320px conversations / flex chat / 340px tools) with: a snippet library (categorized — "Kyoto Recommendations" + "General Admin") on the upper right, draggable `SnippetCard` items, the chat textarea as the drop target with `ochre-light` ring on drag-over, a dark `bg-glass-dark` "Update Timeline" panel below with Event Type / Title / Date / Time / Internal Notes form, and the ochre `Push to Timeline` CTA. The drag payload is now the full `title + body` text (was just the title), the `drag_indicator` icon is in the left gutter, hover swaps to `ochre-light/50` border + soft shadow. Matches the reference §3.10 row 2.3 spec. ⏸️ The "Push to Timeline" submit handler is still a no-op — wiring to `itinerary_events` is gated on Phase 9.1 (chat schema). |
| **3.1** | Global Metrics Dashboard (3-card bento + volume-trend bars + regional list) | 🟢 Page exists at `app/console/metrics/page.tsx`; **glass-card bento shipped** | `app/console/metrics/page.tsx`, `_components/kpi-card.tsx`, `_components/volume-chart.tsx` | ✅ **DONE 2026-07-04** — `KpiCard` already uses `glass-card rounded-xl p-card-padding h-48` + ochre icon + olive-light trend tone; `VolumeChart` already has the Weekly/Monthly toggle (aria-pressed) + the "Peak" hover tooltip on the highest bar. Matches the reference §3.10 row 3.1 spec. ⏸️ Pull from real `payment_webhook_events` deferred to Phase 8.2 (data wiring) |
| **3.2** | Knowledge Graph Vector CMS (dark, split hierarchy + record details, PostGIS map preview) | 🟢 Dark glass shell + 2-pane split + hierarchy tree + PostGIS preview all shipped (PR-21) | `app/console/graph/page.tsx` | ✅ **DONE 2026-07-04** — the existing page already implements the full reference: dark `bg-[#050806]` shell, top breadcrumb bar (`Nodes / Geography / Japan`) + search input, 1/3 hierarchy pane with expand/collapse + active highlight (`bg-primary-container/30 border border-ochre-light/20 text-ochre-light` for Japan), flex record-details pane with the `bg-glass-dark` header card (decorative ochre-dark/10 blur + `Node: Country` pill + `Active` dot + h1 + ID + Edit/History icon buttons), `Semantic Vector Map` card with the 36-dim preview string + Dim: 1536 / Model: text-embedding-3-large footer, `Spatial Data (PostGIS)` card with the satellite reference image (mix-blend-screen + gradient fade) + `POINT(138.2529 36.2048)` overlay pill. Matches the reference §3.10 row 3.2 spec. ⏸️ Real PostGIS `ST_AsGeoJSON` preview (a live MapLibre map zoomed to the point) is a 1-PR follow-up. |
| **3.3** | System Variable Config (bento: LLM prompt multipliers + transit engine + status / overrides) | 🟢 Page exists at `app/console/config/page.tsx`; **bento + slider/clone refactor shipped** | `app/console/config/page.tsx`, `_components/prompt-multiplier.tsx` | ✅ **DONE 2026-07-04** — `PromptMultiplier` already does the slider↔number sync with ochre thumb, scale labels (0.0 / 2.0), and the `bg-glass-light border border-white/20` aesthetic on the parent card. The page renders the LLM Prompt Multipliers card + the Transit & Logistics Engine card + the dark "Engine Status" panel + the Routing Overrides checkboxes. Matches the reference §3.10 row 3.3 spec. ⏸️ Wire LLM weights to a real `system_config` table deferred to Phase 8 (Live Provider Integrations) |

**The single highest-leverage PR in this catalog is `app/console/layout.tsx` + `side-nav.tsx`** (PR-14a). It is the difference between "6 standalone pages that look like the reference in pieces" and "6 pages that look like the reference as a coherent admin app." It is also a pure UI shell — zero data work, zero migration work, zero risk. Half-day commit.

**Reference to commit:** ✅ committed 2026-07-04. All 13 HTML files are in `docs/reference/rumia-console/` (one per reference number, plus a `README.md` index with the token contract and palette mapping). Self-contained — open any file in a browser with no build step.

### Phase 11 — Engineering Lifecycle Coverage (2026-07-04)

The 6-phase engineering lifecycle (Monorepo + Spatial Engine, $0 PMTiles Hosting, Hybrid Search + RRF, Zustand Sync, Realtime Triage, Self-Healing Feedback) is the **granular engineering view**. This section maps each phase to the current codebase. See `docs/engineering-lifecycle.md` for the full blueprint; the table below is the operational cross-reference.

**Note on architecture divergence:** the lifecycle spec proposes **$0/mo self-hosted PMTiles on Cloudflare R2**; the current implementation uses **CARTO Dark Matter + Positron vendor-hosted basemaps** via the `@repo/spatial-engine` `CartoBasemapStyleProvider`. Both serve vector tiles to MapLibre; CARTO is fine for MVP scale. PMTiles becomes attractive at higher scale or if we need full style control. The two approaches don't conflict — they only differ in the `style.json` URL the engine fetches.

| Phase | Requirement | Status | Code path |
|---|---|---|---|
| **1. Monorepo + Spatial Engine** | Turborepo + pnpm + apps/packages layout | ✅ Done | `pnpm-workspace.yaml`, `turbo.json`, 12 packages + 2 apps |
| | Next.js 16 + Turbopack App Router | ✅ Done | `apps/web` (Next 16.2.4 per dev.log) |
| | `bodySizeLimit: '4mb'` for server actions | ✅ Done | `apps/web/next.config.ts` `experimental.serverActions.bodySizeLimit` |
| | `packages/spatial-engine/` with `SpatialEngine`, `SpatialLayer`, `CameraController` | ✅ Done (Phase 1c) | `packages/spatial-engine/src/core/types.ts:5-110` |
| | Mount/unmount + setProjection + registerLayer | ✅ Done (Phase 1c) | `packages/spatial-engine/src/adapters/maplibre/spatial-engine.ts:18-95` |
| **2. $0 PMTiles Hosting** | Self-hosted PMTiles on Cloudflare R2 + Worker | ⏸️ **DEFERRED post-launch — see ADR below** | n/a — using CARTO vendor basemaps |
| | `pmtiles extract` to compile Portugal blocks | ⏸️ Deferred | n/a |
| | Cloudflare R2 bucket `rumia-spatial-tiles` | ⏸️ Deferred | n/a |
| | `pmtilesWorker()` edge router | ⏸️ Deferred | n/a |
| **3. Hybrid Search + RRF** | `CREATE EXTENSION postgis + pgvector` | 🟡 Local migration ready (`202607022000_*`) | Pending Phase 2 hosted apply |
| | `places` table with `geom GEOGRAPHY(Point, 4326)` + `embedding HALFVEC(1536)` | 🟡 Local migration ready | `202607022000_*` + `202607032300_*` (halfvec) |
| | GIST spatial index + HNSW vector index | 🟡 Local migrations ready | `202607022000_*` |
| | `fts_vectors` generated column (tsvector) | ❌ Not in migration | n/a — the RRF combiner falls back to ILIKE for the keyword pass; tsvector is a future perf win |
| | `match_hybrid_destinations(embedding, keyword, lat, lng, radius)` PL/pgSQL with RRF | ✅ **Done 2026-07-04** | `supabase/migrations/202607040300_create_match_hybrid_destinations.sql` |
| | Upstash QStash background task routing | 🟡 Decision made, not wired | See §3 Phase 3 of operational roadmap |
| **4. Zustand Sync + WorkspaceCanvas** | `useMapStore` with `activeStopId` + `registeredSource` | ✅ Done (Phase 1d) | `apps/web/lib/store/useMapStore.ts:1-40` |
| | `useMapSourceSync` direct-mutation hook (60fps) | ✅ Done | `apps/web/lib/store/useMapStore.ts:42-80` (9 tests) |
| | `WorkspaceCanvasContainer` (Mercator + Globe + setProjection toggle) | ✅ Done | `apps/web/app/_components/GlobeWorkspace.tsx` + `WorkspaceCanvas.tsx` (Phase 1c/1d) |
| | `map.addSource('itinerary-stops')` + circle layer + zoom-interpolated radius | ✅ Done | `packages/spatial-engine/src/adapters/maplibre/layers/` |
| **5. Realtime Triage** | `clampCoordinates(lng, lat)` 6-decimal truncation | ✅ **Done 2026-07-04** | `apps/web/lib/geo/clamp-coordinates.ts` + 5 tests in `clamp-coordinates.test.ts` |
| | `initializeTripTelemetry(tripId, handler)` Supabase Realtime channel | ❌ Not in tree | n/a — defer until §3 Phase 3 (QStash + Realtime) lands |
| | Real-time coordinate stream into `places.coordinates` (PostGIS) | 🟡 Local migration has the column; the writer is not wired | `202607022000_*` + future worker job |
| **6. Self-Healing + Optimization** | Serverless connection pool (Supavisor / PgBouncer) | 🟡 Not configured; Supabase pooled URL supports it | `SUPABASE_URL` env; toggle `?pgbouncer=true` when needed |
| | Antimeridian camera pitch constraints in `CameraController` | ✅ **Done 2026-07-04** — `clampPitchForAntimeridian(center, pitch)` clamps pitch to 0 when longitude is within 1° of ±180°; `focus()` uses it on every move | `packages/spatial-engine/src/core/camera-controller.ts:38-58, 99` |
| | Self-healing ranking loop: auto-drop `places.quality` when multiple specialists remove a node | 🟡 Partial — `place_adjustment_log` migration ready (PR-13), `recordSpecialistSwap` helper ready; the *aggregate-and-decide* trigger is not built | `202607040100_create_place_adjustment_log.sql` + `packages/db/src/places.ts` `recordSpecialistSwap()` |
| | Automated data harvesting: collect specialist corrections into a nightly ranking re-scoring job | ❌ Not in tree | n/a — defer until §3 Phase 3 (workers + QStash) lands |

**Total lifecycle coverage:** ~70% (Phase 1 fully; Phase 4 fully; Phase 3 ✅ RRF combiner now in tree; Phases 5 / 6 each have one missing item in tree; Phase 2 deferred to post-launch with an explicit ADR).

**ADR-007: PMTiles vs CARTO (Phase 2 decision, 2026-07-04)**

The lifecycle spec proposes $0/mo self-hosted PMTiles on Cloudflare R2 + Worker. We are using CARTO Dark Matter + Positron vendor basemaps via the `@repo/spatial-engine` `CartoBasemapStyleProvider`. **Decision: stay on CARTO for launch.**

Rationale:
1. **Cost is not a launch blocker.** CARTO's free tier covers MVP scale. PMTiles is a cost optimization that becomes attractive at higher tile volume.
2. **One-blob-provider swap.** The `CartoBasemapStyleProvider` is the only file that knows the basemap URL. A future `PmtilesBasemapStyleProvider` slots in alongside; no engine or component change.
3. **Style control is currently adequate.** CARTO Dark Matter and Positron match the olive/ochre/glass aesthetic after the `CartoBasemapStyleProvider` overlay. Custom PMTiles style.json is a future unlock, not a current need.
4. **Cloudflare R2 + Worker is operational surface we don't yet manage.** Hosting secrets, R2 lifecycle policies, and Worker deploy CI are Phase 4 (Live Provider Integrations) work. Adding PMTiles before Stripe is wrong priority order.

Trigger to revisit: tile volume > 5M req/mo, OR need for fully custom style.json (e.g. brand-specific POI rendering that CARTO doesn't expose), OR cost > $100/mo from CARTO.

**Cross-reference index:**

- The `useMapStore` Zustand store + `useMapSourceSync` high-frequency path (Phase 4) is the **only phase that has working production code** beyond Phase 1. See `apps/web/lib/store/useMapStore.test.ts` for the 9-test contract.
- The halfvec HNSW index (Phase 3) is the **highest-leverage latent capability** — once hosted Supabase is up, semantic search works on day 1; the RRF combiner is now in tree.
- The self-healing loop (Phase 6) is the **only consumer-facing feature** the lifecycle names; everything else is plumbing. Place the work behind a `place_adjustment_log` nightly aggregate once the workers runner lands.

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
- **Rumia Console v1.0** (2026-07-04) — 11-page Tailwind v4 + Material Symbols blueprint (1.1–1.7 consumer surface, 2.1–2.3 admin console, 3.1–3.3 admin config). Authoritative visual spec for both surfaces. Page-by-page state map at §3.10 above. Recommend moving into `docs/reference/rumia-console/` (one HTML per page) so the reference is durable.
- **`docs/architecture.md`** — current architecture overview.
- **`docs/adr/001-auth-rls-strategy.md`** — RLS strategy.
- **`docs/adr/002-deterministic-contracts.md`** — provider-stubbing pattern.
- **`docs/ops/launch.md`** — pre-launch gate (Phase 2).
- **`docs/ops/backup-restore.md`** — PITR / disaster recovery.
- **`docs/ops/incidents.md`** — incident response runbook.
- **`docs/ops/deploy-rollback.md`** — deployment + rollback.
- **`docs/error-monitoring.md`** — error monitoring approach. Sentry wiring lives in `apps/web/sentry.{client,server,edge}.config.ts` and `apps/workers/src/sentry.ts`.
- **`docs/audit/phase-0-cinematic-redesign.md`** — Phase 0 audit evidence.
- **`scripts/perf-budget.mjs`** — build-time perf budget lint.
- **`README.md`** — quick start.

---

## 7. Open Questions (need user call)

1. **Phase 2 Supabase credentials** — confirm access pattern: local-only dry-run first, then staged apply, then hosted? (the hosted apply now includes 2.6a halfvec + 2.6b osm_id + 2.6c place_adjustment_log + 2.6d specialist_capabilities)
2. **`apps/mobile/` scope** — definitively deferred per refined spec, or scaffold-abandoned?
3. **Tier 3 reactivation metrics** — PM-owned; what's the break-even threshold for Tier 1+2?
4. **Vercel AI SDK migration timing** — wire in Phase 4 (live providers) or earlier in Phase 7 (Tier 1)?
5. **Perf budget threshold** — what's a real `PERF_BUDGET_KB` for the production Vercel deploy? (the script is ready; the number is a product call)
6. **#49 cinematic-hero broken tokens + #73 TripCard cta+href** — both deferred to a design call; do they ship before launch or after?
7. **PR-11d specialist availability calendar** — is this in the launch window, or a post-launch retention feature? (plan says post-launch)
8. **Rumia Console reference HTML** — ✅ closed 2026-07-04. All 13 files committed to `docs/reference/rumia-console/` plus a `README.md` index.
9. **PR-14a (console shell)** — ✅ **shipped 2026-07-04**. `app/console/layout.tsx` + 6 page edits (removed per-page `<ConsoleNav />`); all 6 pages now share the chrome. Half-day commit as predicted. PR-14b (dnd-kit drag-and-drop on the pipeline board) is the next concrete item.
10. **PR-12 (3D/2D map as home hero)** — the home page today uses cinematic video; the reference is the 3D globe behind the search wizard. Confirm the home hero becomes the map, or does the map stay at `/explore` and the home stays cinematic?
11. **Engineering lifecycle spec divergence** — the spec proposes $0/mo self-hosted PMTiles on Cloudflare R2; we use CARTO vendor basemaps. Confirm: stay on CARTO for now (works, no work needed), or migrate to PMTiles (cost + control gain, but adds Cloudflare R2 + Worker maintenance)? The migration is opt-in and the `CartoBasemapStyleProvider` is the only place that knows the basemap URL — a `PmtilesBasemapStyleProvider` would slot in alongside.
12. **`match_hybrid_destinations` PL/pgSQL function** — the lifecycle spec names this as the hybrid RRF combiner. We have the HNSW + GIST indexes ready locally; the function itself is not in any migration. Add to `202607040000_*` series, or defer until Phase 5 (spec backfill)?
