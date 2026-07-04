# Rumia — Roadmap

> **Three specs, three axes.** This file bridges them.
>
> - **v4.0 (current authoritative)** → [`docs/spec-v4.md`](./spec-v4.md) — 4-tier ascension model (Tier 1 Core / Tier 2 Curation / Tier 3 Concierge / Tier 4 Marketplace).
> - **v2.0 long-term vision** → [`docs/spec.md`](./spec.md) — 3-tier Tiered Service Model (preserved for historical reference).
> - **Refined 2026 scope** → [`docs/spec-refined-2026.md`](./spec-refined-2026.md) — visual identity (olive/ochre) + UI/UX details; Tier 3 + Mobile deferred.
> - **Operational launch-readiness** → §3 below. Drives *how* we ship.
> - **Engineering lifecycle (6-phase master plan)** → [`docs/engineering-lifecycle.md`](./engineering-lifecycle.md) — week-by-week engineering sequencing; this roadmap is the operational view of the same work.
>
> Section 2 maps current state to the v4 5-phase engineering plan.

> **Last verified 2026-07-04.** Specialist onboarding + verification queue (PR-11) now in tree. Observability foundation (Sentry + perf budget) wired. 534/534 tests green. Operational Phase 2 hosted Supabase apply is the only blocker for production.

---

## 1. What Rumia Is

Four-tier travel concierge platform for Portugal-first, AI-powered itinerary planning:

- **Tier 1 (Core AI Wrapper)**: structured brief → RAG-generated day-by-day itinerary with maps, routing, opening-hour validation. Free; monetized via exports + affiliate bookings.
- **Tier 2 (Specialist Curation)**: human specialist audit + async chat. One-time flat fee per booking.
- **Tier 3 (Full Remote Support)**: 24/7 concierge lifeline during the active trip. AI pre-triage (parking, hours, transit) → specialist rota (taste, nuance, urgent transactional). Daily rate subscription.
- **Tier 4 (On-Site Real Guide)**: RNAAT-licensed physical guide dispatch. Premium flat-day fee.

The immediate implementation focus is Tier 1 + Tier 2 with Tier 3 in-progress (per `docs/spec-v4.md`). Tier 4 is gated on RNAAT compliance + ops partner (see spec §3).

---

## 2. Current State vs Refined 2026 Phases (last verified 2026-07-04)

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