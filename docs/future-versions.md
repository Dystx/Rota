# Rumia — Future Versions

> Forward-looking companion to `docs/roadmap.md` (which is operational-launch-readiness focused, phase-numbered 0–9). This document defines the *what comes next* after Phase 1d (Spatial Engine 2D Workspace) lands — explicit version-by-version plans, acceptance criteria, cross-cutting concerns, and risks.

---

## 0. What's Shipped (Phases 0 – 1d)

Brief recap of the recent work, since future versions build on it:

| Phase | Theme | Key commits |
|---|---|---|
| **0** | Audit + housekeeping (repo cleanup, copy fixes, db shadow removal) | `e49a624` … `e7e7f23` |
| **1** | Pre-existing tech debt (shadow exports, EmptyState, vitest `*.test.tsx`, scratch scripts) | `bc1aa48`, `3cb58a1`, `253da10` |
| **1b** | Visual parity + planner intent-engine (100% parity against `docs/prototype.html`) | `4591c5a` … `e055636` |
| **1c** | Spatial Engine foundation: provider-agnostic core + MapLibre adapter + 3D globe on `/explore` | `e067a64` |
| **1d** | Spatial Engine 2D Workspace: `WorkspaceCanvas` + `LayerRegistry` + `RouteLayer` + fixtures + `/explore/workspace` | `ab6d5a8` |
| **(uncommitted)** | Camera Choreography + home hero = live map canopies + Portugal-focused initial camera | `e0d8152`, `f669040` |
| **(uncommitted)** | Destination deep-links via `?focus=` query param + `destinations.ts` fixture + bento rewire | `7a88ced` |

The spatial engine now covers: home hero (3D/2D canopy toggle, Iberia-anchored), `/explore` (3D discovery hub), `/explore/workspace` (2D trip workspace), home bento cards (destination deep-links via `?focus=`). The renderer-agnostic core + MapLibre adapter pattern is paying off — every consumer above uses the same engine surface without code duplication.

---

## 1. Version Plan

Versions are ordered for minimum dependency stalls. Each version is a coherent shippable milestone — at the end of any version, the codebase could ship a small release if needed.

### Phase 1e — Spatial Engine 1.5: Workspace UI + CinematicMap Migration

**Theme**: One map engine across the entire app. The workspace stops being a demo and becomes a usable trip planning surface. The legacy `@repo/maps` Mapbox code is removed.

**Scope**:
- Build out `/explore/workspace` to match mock 1.4 (Dynamic Workspace): side panel with day labels (Day 3 of 7), refinement toggles (Relaxed / Active, Hidden Gems / Classics), quick action buttons (share / download), filmstrip of stop cards at the bottom with `Navigate` CTA
- Migrate `@repo/maps` `CinematicMap` → `@repo/spatial-engine` `WorkspaceCanvas` on `/trip/[tripId]/map` and `/trip/[tripId]/_components/cinematic-map-section` (3 consumer sites total)
- Migrate `@repo/maps` `ProviderMap` → `@repo/spatial-engine` `WorkspaceCanvas` (light-theme variant)
- `packages/maps` deleted; `mapbox-gl` dependency removed from `apps/web`
- Add `useTripRoute(tripId)` hook that fetches the trip's itinerary from `@repo/db` and feeds the `RouteLayer` (instead of `fixtureRouteCollection`)
- Add `useTripStops(tripId)` for the filmstrip cards

**Acceptance criteria**:
- `/explore/workspace` renders the full mock 1.4 surface (timeline panel + refinement toggles + filmstrip)
- `/trip/[tripId]/map` uses the spatial-engine `WorkspaceCanvas` and shows the actual trip route
- `@repo/maps` is deleted; `mapbox-gl` no longer in `apps/web/package.json`
- Playwright E2E: load a trip → map renders → click a stop card → map flies to that stop

**Dependencies**: Phase 1d (done); needs at least one real trip in `@repo/db` to render against (currently fixtures)

**Risks**:
- CinematicMap may have MapLibre-specific rendering quirks that the spatial-engine tests don't catch (e.g. text label density, fog halo, custom icons)
- Trip route shape may not match `SpatialFeatureCollection` directly — need a `tripRouteToFeatures(trip)` adapter

---

### Phase 1f — Spatial Engine 2.0: Weather + Travelers + Persistence

**Theme**: The engine becomes truly real-time and operationally useful. Future weather overlays (per executive summary) and live traveler positions land.

**Scope**:
- `WeatherOverlayLayer` — fetches 7-day forecast from Open-Meteo (free, no API key) for each fixtureTraveler's coordinates; renders temperature + precipitation as a color-graded `circle` layer bound to a new `"weather"` telemetry channel
- `LiveTravelerLayer` — replaces the static `AmbientPulseLayer` with positions streamed from Supabase Realtime (traveler geo-coords update at ~30s intervals); visual: small ochre dot with bearing indicator
- `InMemoryTelemetryService` → `SupabaseRealtimeTelemetryService` adapter; factory selects based on env (`SUPABASE_REALTIME_URL` present)
- Persist spatial-engine state: when a route is edited on `/explore/workspace`, write back to `trip_stops` table; subscribe on `/trip/[tripId]/map` to reflect edits
- Add `CameraExecutor.rotateTo(bearing, duration?)` for future auto-rotation use cases (not wired yet — interface surface only)

**Acceptance criteria**:
- Weather overlay visible on `/explore` with 7-day forecast for 3 PT cities; toggleable via layer-registry UI
- Live traveler positions update within 30s on `/explore` when the source table changes
- Trip stop edits on `/explore/workspace` persist and reflect on `/trip/[tripId]/map` after refresh
- `InMemoryTelemetryService` retained for tests; production wiring uses Supabase Realtime

**Dependencies**: Phase 2 from `roadmap.md` (Supabase reconciliation) for the Realtime adapter to work against hosted; Phase 1e for the trip route shape

**Risks**:
- Open-Meteo rate limits + CORS for browser fetches — may need a worker proxy
- Supabase Realtime connection management in a long-running map session (reconnect on tab focus, etc.)
- Coordinate write-back race conditions if multiple users edit the same trip

---

### Phase 1g — Planner v2: Wizard + Logistical + Checkout

**Theme**: Tier 1 end-to-end. A user can land on `/`, click "Begin Journey", fill out the wizard, get an itinerary, see the trip on the map, and (optionally) upgrade to Tier 2.

**Scope**:
- Wizard v2 (mock 1.2 polish): natural language input with inline editable values ("Portugal for 7 days in May"), Vibe + Accommodation sliders, "Synthesize Itinerary" CTA → routes to `/trip/new?brief=<json>`
- Smart Logistical Cards (mock 1.3): "Will you rent a car?" interstitial between brief submit and itinerary render — actually changes the AI's recommendation
- Tier Ascension Checkout (mock 1.5): Core AI (included) vs Hybrid Specialist Review (€65) split-screen at `/trip/[tripId]/checkout`; Stripe live
- Brief handoff E2E test: `/planner` → POST → `/trip/new?brief=<json>` → TripBriefForm prefills → submit → `/trip/[tripId]`
- Add `app/(app)/trip/[tripId]/checkout/page.tsx` with mock 1.5 layout
- Add `app/(app)/trip/[tripId]/logistics/page.tsx` for the logistical cards flow
- Stripe webhook → `payment_webhook_events` ledger table; receipt + confirmation email via `@repo/emails`

**Acceptance criteria**:
- E2E: anonymous user goes through planner → wizard → logistics → trip renders → checkout → upgraded trip with specialist annotation visible
- Tier Ascension flow: free user sees Tier 2 upgrade prompt; upgraded user has specialist-attached itinerary
- Stripe test mode: payment succeeds → webhook fires → `payment_webhook_events` row created → trip upgraded

**Dependencies**: Phase 4 (live Stripe) from `roadmap.md`; `@repo/ai` Vercel AI SDK migration (Phase 7.1) so the wizard prompt is on the production path

**Risks**:
- Wizard UX depends on AI response quality — bad recommendations create churn
- Logistics interstitial adds a step to the funnel — must measure drop-off
- Stripe + Resend live mode requires production credentials + tax setup

---

### Phase 1h — Vault + Expert Chat

**Theme**: Tier 2 async chat lives. Saved itineraries become a first-class surface.

**Scope**:
- Saved Vault (mock 1.7): `/vault` grid of saved itineraries with cover image, region tag, day count; click → drawer with PDF / Sync / Share export options
- Expert Chat (mock 1.6): `/trip/[tripId]/chat` with timeline sidebar (left), chat stream (right), `Add to Itinerary` recommendation node
- Chat infrastructure: `chat_threads` + `chat_messages` tables; Supabase Realtime for live messages; specialist read-only access via assignment
- PDF Export Engine: `@repo/pdf` package with editorial layout (Playfair Display headlines, Inter body, ochre accents) for the trip timeline
- Calendar Export: `.ics` generation; opens in Apple Calendar / Google Calendar
- Affiliate booking attribution: `booking_clicks` table populated on outbound link click; `attribution_source` enum (wizard / chat / vault)

**Acceptance criteria**:
- User can save a trip from `/trip/[tripId]` → appears in `/vault` → click → drawer with all 3 export options functional
- Chat thread created on Tier 2 upgrade; user + specialist can exchange messages; specialist recommendations show "Add to Itinerary" CTA that modifies the trip
- PDF export downloads an editorial-grade file with map snapshot + timeline + booking links
- `.ics` export imports cleanly into Google Calendar / Apple Calendar
- Affiliate links carry `utm_source=rumia&trip_id=<id>` and fire `booking_click` event

**Dependencies**: Phase 4 (live providers); `@repo/payments` Tier 2 unlock gate; `chat_threads` schema from Phase 9 of `roadmap.md`

**Risks**:
- Chat is the highest-touch surface; any UX friction creates churn
- Specialist assignment routing logic (which specialist gets which thread) needs actual ops partner buy-in
- PDF generation must complete in <5s to feel responsive — may need worker queue (Phase 3 of `roadmap.md`)

---

### Phase 1i — Tier 1 Mock-to-App Parity: Marketing Pages

**Theme**: Close the 1-to-1 gap between the 12 mock HTMLs and the live app for the 4 marketing/app surfaces that currently have headings but no real body. Goal: every marketing surface matches its mock at desktop + mobile.

**Scope**:
- `app/logistics/page.tsx` (mock 1.3 Smart Logistical Cards): replace heading-only stub with the glass-morphism Yes/No tiles (`car_rental` / `directions_transit` Material Symbols, `hover-pull` transition, `.selected` state turns icon ochre-dark and shows `check_circle` badge, "Continue" button enabled only when a tile is selected, Back/Continue footer)
- `app/checkout/page.tsx` (mock 1.5 Tier Ascension Checkout): replace 2-card skeleton with the full split-screen tier comparison — 4 feature bullets per tier (algorithmic route optimization / standard predictive pacing / automated logistical mapping for Core AI; human verification / exclusive experiences / direct specialist access / priority booking for Hybrid Specialist Review), "€65" price on Tier 2 in `ochre-light`, gold accent glow blob, "Secure Transaction" footer with lock icon
- `app/expert-chat/page.tsx` (mock 1.6 Level 2 Expert Chat): replace single-section placeholder with the 2-column glass layout — left rail with 5-stop timeline (Day 1 Arrival / Day 2 Higashiyama / Day 3 Bamboo / etc.) with active node (pulsing ochre) and inactive nodes (olive outline), right column with Ana avatar + online status, user/specialist message bubbles (round-2xl + tail), and a `Specialist Recommendation` card with image + "Add to Itinerary" CTA
- `app/vault/page.tsx` (mock 1.7 Saved Vault & Export): replace 1-card placeholder with the 3-column gallery (3 itinerary cards with type badges "Itinerary" / "Draft", day-count metadata, hover-forward icon) + right-side sticky export drawer (PDF / Sync to Mobile / Share Link / Execute Export button)
- Add `app/_components/{logistics,checkout,expert-chat,vault}/` subfolders for the larger components (e.g. `app/_components/expert-chat/chat-terminal.tsx`, `app/_components/vault/export-drawer.tsx`)
- All new components use existing design tokens: `bg-glass-light`, `bg-glass-dark`, `ochre-light`, `ochre-dark`, `olive-light`, `olive-dark`, `linen-dark`, Playfair Display headlines, Inter body, JetBrains Mono micro-labels

**Acceptance criteria**:
- `pnpm typecheck` clean (`cd apps/web && pnpm typecheck`)
- `pnpm --filter web dev` boots; all 4 routes render visually equivalent to mocks at desktop (1024px+) and mobile (360px, 768px)
- Logistics: clicking a Yes/No tile enables the Continue button (state held in component state, not URL)
- Checkout: Tier 2 has the gold accent glow, price in ochre, 4 feature bullets per tier
- Expert chat: messages visible, Ana avatar shown, recommendation card renders
- Vault: 3 cards visible at md+ breakpoint, export drawer slides in on card click
- Each interactive element has `aria-label`, keyboard focus, focus-visible ring

**Dependencies**: Existing TopNav + SiteFooter (already in `_components/`); existing design tokens in `packages/ui/src/styles.css`

**Risks**:
- 4 substantial component builds in one PR — review burden
- Mock 1.6 chat has rich content (avatar, online status, recommendation card with image) that needs a real Ana avatar asset — use `https://i.pravatar.cc/64?img=47` or similar
- Mock 1.7 vault cards use Unsplash backgrounds — use `https://picsum.photos/seed/<slug>/800/400` placeholders

---

### Phase 1j — Tier 2 Mock-to-App Parity: Console Pages

**Theme**: Build out the 6 console/admin pages that are currently 21-line "Interface" stubs. Specialists, ops, and engineering get real surfaces instead of placeholder text.

**Scope**:
- `app/console/pipeline/page.tsx` (mock 2.1 Operations Pipeline Board): replace stub with 3-lane Kanban (New Drafts / In Revision / Active Chats) with cards showing SLA badges (`error` red for <2h, `ochre-dark` for <12h, neutral for longer), client avatars, drag handles, search bar in topbar
- `app/console/workspace/page.tsx` (mock 2.2 Master Revision Workspace): replace stub with split workspace — left rail with 3 traveler-anchor cards (HARD CONSTRAINT shellfish allergy in `error-container` / PREFERENCE pacing in `surface-container-high` / FLEXIBLE ryokan in `secondary-fixed`), right timeline editor with 3 timeline items (standard olive nodes, 1 "In Revision" ochre node with editor note textarea + 2 alternate-restaurant suggestions), bottom validation bar (1 CONFLICT / TRANSIT FEASIBLE / PACING MET) with "Resolve Conflicts" CTA
- `app/console/messages/page.tsx` (mock 2.3 Specialist Messaging Hub): replace stub with 3-column glass terminal — left conversations list (2 threads with online dots + last message preview + search), center chat terminal with message bubbles + drag-target input + send button, right tools panel (Snippet Library with draggable items + Update Timeline form with Event Type / Title / Date / Time / Internal Notes)
- `app/console/metrics/page.tsx` (mock 3.1 Global Metrics Dashboard): replace stub with bento grid — 3 KPI cards (GMV $2.4M / Conversion 42.8% / SLA 1h 14m) with trend indicators, Volume Trends bar chart (custom CSS bars at h-[40-90%], "Peak" tooltip on hover), Regional Performance list (NA 54% / EU 32% / APAC 14% with +2.1% / -0.8% / +5.4% deltas)
- `app/console/graph/page.tsx` (mock 3.2 Knowledge Graph Vector CMS): replace stub with 3-pane dark layout — left hierarchy tree (Asia > Japan > Tokyo/Kyoto/Hokkaido, active node highlighted with `ochre-light` left border), right record details with Japan node (id `node_geog_jp_0991a`, Active status), Semantic Vector Map (1536-dim vector preview, "Model: text-embedding-3-large"), PostGIS spatial data (POINT(138.2529 36.2048))
- `app/console/config/page.tsx` (mock 3.3 System Variable Config): replace stub with bento — LLM Prompt Multipliers (Serendipity Bias / Cultural Density with sync'd range + number input pairs, `ochre-dark` slider thumb), Transit & Logistics Engine (Movement Speed Multiplier / Connection Safety Buffer), Engine Status dark card (1,402 active routes / 88.4% cache hit / 42m last deploy), Routing Overrides toggles (Strict Linearization / Prioritize Verified POIs / Allow Experimental Nodes)
- New `app/console/_components/` subfolder for: `kanban-card.tsx`, `revision-timeline.tsx`, `messaging-terminal.tsx`, `volume-chart.tsx`, `vector-map.tsx`, `prompt-multiplier.tsx`

**Acceptance criteria**:
- All 6 routes render substantive layouts matching the mocks at desktop
- Pipeline: 3 lanes visible with 2-3 cards each; SLA badges color-coded
- Revision workspace: 3 anchor cards, 3 timeline items, validation bar
- Messaging: 3 columns, drag-target highlights on dragover (no actual drag persistence needed)
- Metrics: KPI cards with numeric values + trend, bar chart visible, regional list with deltas
- Knowledge graph: dark theme, hierarchy tree, vector + PostGIS panels
- Config: LLM sliders, transit inputs, engine status card, routing toggles
- `pnpm typecheck` clean

**Dependencies**: Existing ConsoleNav; existing design tokens

**Risks**:
- 6 substantial console surfaces — review burden
- Dark theme in 3.2 is intentional (matches mock) but conflicts with light-mode tokens — use `bg-olive-dark` and `text-linen-dark` for that sub-pane
- Knowledge graph dark layout requires a separate `bg-glass-dark` parent for those sub-panes
- Drag-and-drop in messaging is visual-only (no persistence) — state lives in `useState` only

---

### Phase 1k — A11y Quick Wins (12 of 14 Critical)

**Theme**: Close the 12 Critical a11y issues from the audit that don't conflict with the in-flight CinematicMap migration or Zustand store work. Plus the systemic pattern fixes that prevent future regressions.

**Scope**:
- **TopNav** (`app/_components/top-nav.tsx`): add `focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2` on every nav link (#7, #8); resize profile button to `w-11 h-11` (44×44px) (#9); add `alt=""` on avatar img (#10)
- **SiteFooter** (`app/_components/site-footer.tsx`): add focus-visible on every link (#11); remove `opacity-80` from links, use `text-on-surface-variant` (#34)
- **DestinationBento** (`app/_components/destination-bento.tsx`): use `<h2>` not `<h3>` in card titles (#3); add `motion-safe:hover:scale-105` instead of unconditional transition (#4); add `group-focus-visible:ring-2 group-focus-visible:ring-ochre-light` on the bento card wrapper (#5)
- **`/explore` + `/explore/workspace` + `/vault`**: add `id="main-content"` to `<main>` (#18, #22, #60)
- **`/explore`**: remove `&nbsp;` and `&middot;` HTML entities, use CSS spacing (#21)
- **`/portugal`**: wrap regions in `<ul>` + `<li>` (#17); change CTA color to `text-olive-light` (#16)
- **planner-client**: add `aria-label="Describe your trip"` on the free-text input (#31); wrap the dynamic region in `<div role="status" aria-live="polite">` (#28); add `role="radiogroup"` + `aria-checked` on the follow-up question pills (#30)
- **prompt-composer**: stop truncating accessible names — use the full text in `aria-label`, only visually truncate (#63)
- **trip-brief-form**: add focus-visible on submit button (#43)
- **packages/ui components**: `aria-hidden="true"` sweep on every decorative `<span class="material-symbols-outlined">` that has adjacent text (P6 — resolves 6+ issues across all pages)
- **All consumer pages**: introduce a `<MainContent>` wrapper component that owns `id="main-content"` (P3 — fixes 5 issues at once)

**Acceptance criteria**:
- axe DevTools: 0 Critical on the 8 consumer pages (`/`, `/planner`, `/itineraries`, `/vault`, `/expert-chat`, `/portugal`, `/explore`, `/explore/workspace`)
- Keyboard test: Tab through each page, every interactive element has a visible focus ring
- Screen reader test (VoiceOver or NVDA): free-text input is announced as "Describe your trip, edit text"
- Dynamic region in planner announces "Recommended: <destination>" on update
- All decorative icons are skipped by VoiceOver

**Dependencies**: TopNav/SiteFooter/DestinationBento (existing, not changing structure)

**Risks**:
- 12 separate file changes — review burden
- P6 icon sweep requires auditing ~30 icon spans across the codebase
- `<MainContent>` wrapper change touches 5 page files
- The 2 Critical issues not addressed here (#49 cinematic-hero broken tokens, #73 TripCard cta+href fight) need design decisions and ship as separate Phase 12 sub-tasks

---

### Phase 10 — Specialist Console

**Theme**: The specialists (concierges) have their own surface. They see the pipeline, revise itineraries, and chat with travelers — without touching the consumer app.

**Scope**:
- Operations Pipeline (mock 2.1): `/console/pipeline` kanban board (New Drafts / In Revision / Active Chats); SLA badge per card; drag-and-drop lane changes
- Master Revision Workspace (mock 2.2): `/console/trip/[tripId]/revision` with traveler-anchors sidebar (left), timeline editor (center), validation bar (bottom: 1 conflict / transit feasible / pacing met)
- Specialist Messaging Hub (mock 2.3): `/console/messaging` with conversation list + chat terminal + snippet library + timeline integration form
- AI triage pre-routing: incoming traveler message → AI classifies (logistical / informational / urgent) → routes to specialist if non-logistical
- Add `console` route group with its own topnav + sidenav (existing `/reviewer/*` routes fold into this)

**Acceptance criteria**:
- Specialist can see all active trips in pipeline; drag a card between lanes → status updates in DB
- Specialist can edit a trip's timeline (add/remove/reorder stops) → validation bar reflects constraints → publish changes
- Specialist can chat with traveler; AI triage routes correctly on test scenarios
- `/reviewer/*` redirects to `/console/*` with backward-compatible URLs

**Dependencies**: Phase 9 (chat infrastructure) from `roadmap.md`; Phase 1e (workspace UI patterns)

**Risks**:
- Specialist console requires actual ops partner + SLA definition before building
- Validation bar rules (transit feasible, pacing met) need real routing engine output
- AI triage could mis-route urgent messages → needs human-in-the-loop fallback

---

### Phase 11 — System Console

**Theme**: Internal team can tune the system. Operators see metrics; content team manages the knowledge graph; engineering adjusts system variables.

**Scope**:
- Global Metrics Dashboard (mock 3.1): `/console/metrics` with GMV, conversion (T1→T2), specialist SLA cards; weekly volume trends chart; regional performance list
- Knowledge Graph CMS (mock 3.2): `/console/knowledge` with hierarchy traversal (Asia → Japan → Kyoto) + record details (vector embeddings dim=1536, PostGIS coordinates, status badge)
- System Variables Config (mock 3.3): `/console/config` with LLM prompt multipliers (serendipity bias, cultural density) + transit engine (movement speed, connection buffer) + routing overrides
- Add metrics aggregation worker (Postgres materialized views refreshed nightly)
- Add `console/metrics`, `console/knowledge`, `console/config` routes

**Acceptance criteria**:
- Specialist / lead sees real metrics (not placeholder 0s); refresh triggers materialization
- Content team can browse → edit → publish a knowledge graph node; changes reflect in `/explore` after refresh
- Engineering can adjust a prompt multiplier → `signal-strength.json` regenerated → AI engine picks up on next deploy

**Dependencies**: Phase 2 (Supabase reconciliation) for materialized views; actual trip / chat data for real metrics

**Risks**:
- Metrics without real data look embarrassing — needs sample-data generator or actual users
- Knowledge Graph CMS is a rabbit hole (vector search, embeddings refresh, taxonomy management) — scope tightly

---

### Phase 12 — Polish + Performance + Analytics

**Theme**: The app feels fast, works for everyone, and we know what users do.

**Scope**:
- Accessibility audit: WCAG 2.1 AA across all surfaces; keyboard navigation; focus management on map; reduced-motion respected; ARIA labels on icon buttons
- Performance pass: lazy-load bento images; bundle splits per route; image opt (AVIF); preload critical fonts
- Analytics: PostHog (or Vercel Analytics) for page views + custom events (wizard_started, brief_submitted, upgrade_clicked); funnels for T1→T2 conversion
- SEO: per-page meta + OpenGraph; sitemap.xml; robots.txt; structured data for destination pages
- Mobile responsive: all marketing surfaces pass at 360px / 768px / 1024px; map gestures work on touch
- 404 / 500 / loading / empty states polish; consistent skeletons
- Error monitoring: Sentry or equivalent; alerts on 5xx

**Acceptance criteria**:
- Lighthouse scores: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95 on `/`, `/planner`, `/trip/[id]`
- Bundle size: initial JS ≤ 200KB gzipped
- Analytics dashboard shows funnels for T1→T2 conversion + wizard completion
- 0 critical / 0 serious a11y issues on axe scan of all surfaces

**Dependencies**: All prior phases (must exist to polish)

**Risks**:
- Performance budget can be tight with map libraries (MapLibre is ~250KB) — needs careful code-splitting
- A11y on map surfaces is non-trivial — MapLibre canvas doesn't expose ARIA by default; need aria-live announcements for camera moves

---

### Phase 13 — Beta Launch

**Theme**: Real users, real feedback, real bugs.

**Scope**:
- Limited rollout: 100 invited beta users via email
- Onboarding flow: sign up → first trip wizard walkthrough → save → share
- Feedback collection: in-app survey after trip save; NPS-style monthly; email support channel
- Production monitoring: error rate + p95 latency dashboards; alert thresholds
- Status page: status.rumia.travel
- Legal: Terms of Service, Privacy Policy, Cookie Policy live
- Cookie consent banner (GDPR)
- Beta → paid conversion messaging at end of beta period

**Acceptance criteria**:
- 100 invited users; ≥ 30% activate (complete first trip); ≥ 10% convert to Tier 2
- P95 page load < 3s; error rate < 0.5%
- NPS ≥ 40 from beta cohort
- Top 10 bug reports filed and triaged

**Dependencies**: All prior phases; Stripe live; Resend live; domain + hosting production

**Risks**:
- Beta users find critical UX issues that force iteration
- Scale problems (DB connection pool, MapLibre tile caching) only surface under load
- Stripe + Resend live mode requires legal/tax compliance first

---

### Phase 14 — GA Launch

**Theme**: Public launch.

**Scope**:
- Public launch announcement: blog post, press release, social media
- Pricing page live: Tier 1 free / Tier 2 €65 / Tier 3 €X per day (Tier 3 gated on Phase 7 of refined spec)
- Payment flows live in production
- Beta → paid conversion messaging
- Marketing site updates: pricing in TopNav, launch banner
- Customer support: help.rumia.travel with knowledge base

**Acceptance criteria**:
- Public site accessible; sign-up + first trip < 5 min
- Pricing transparency; upgrade flow works end-to-end
- ≥ 100 paid Tier 2 conversions in first month
- Status page shows ≥ 99.5% uptime

**Dependencies**: Phase 13 (beta); Tier 3 ops partner (or explicitly defer)

**Risks**:
- Launch day bugs (DNS, CDN, payment)
- PR / coverage cycle if a critical bug hits a major outlet

---

## 2. Cross-Cutting Concerns (run in parallel)

These threads run continuously, not as discrete versions:

### 2.1 Accessibility
- Every new surface ships keyboard-navigable from day one
- Map surfaces get aria-live region announcing camera moves + clicked features
- Focus management on dialogs, drawers, modal flows
- Reduced-motion: every animation respects `prefers-reduced-motion`
- Screen reader test pass on every consumer surface quarterly

### 2.2 Performance Budget
- Initial JS: ≤ 200KB gzipped per route
- Map libraries lazy-loaded, only loaded when a map surface is in view
- LCP < 2.5s, FCP < 1.8s, CLS < 0.1 (Lighthouse mobile)
- Image opt: AVIF with JPEG fallback, responsive `srcset`
- Font preload: only Inter + Playfair Display + JetBrains Mono; Material Symbols lazy

### 2.3 Security
- RLS tested per `docs/ops/launch.md` §3
- Secrets rotated quarterly
- OWASP Top 10 reviewed per release
- CSP headers: no inline scripts; nonce-based
- Dependency audit: `pnpm audit` clean per release

### 2.4 Privacy
- GDPR + CCPA compliant (cookie consent, data export, deletion)
- Data retention policies documented
- Logs scrub PII

### 2.5 Internationalization
- EN (default) → PT → ES → FR for launch
- Currency: EUR (display) + USD (Stripe default)
- Date/time: localized via `Intl`
- All copy in `messages/<locale>.json` from day one of any new surface

### 2.6 Monitoring
- Error tracking: Sentry
- Performance monitoring: Vercel Analytics (Web Vitals)
- Uptime: status page + cron-based checks
- Business metrics: PostHog funnels

### 2.7 Documentation
- ADRs per major architectural decision (`docs/adr/00X-...md`)
- Per-package README in each `packages/<name>/`
- Per-app README in each `apps/<name>/`
- Architecture overview kept current in `docs/architecture.md`
- Runbook for production incidents (`docs/ops/incidents.md`)

---

## 3. Dependency Graph

```
Phase 1e (Workspace UI + CinematicMap migration)
  ↓
Phase 1f (Weather + Travelers + Persistence)
  ↓                              ↘
Phase 1g (Planner v2)        Phase 10 (Specialist Console)
  ↓                              ↘
Phase 1h (Vault + Expert Chat)  Phase 11 (System Console)
  ↓                              ↓
Phase 12 (Polish + Analytics)
  ↓
Phase 13 (Beta Launch)
  ↓
Phase 14 (GA Launch)
```

Parallel tracks:
- Operational (`docs/roadmap.md` Phases 2–9): Supabase, Workers, Live Providers, Spec Backfill — must complete before GA
- Cross-cutting (§2 above): runs throughout

---

## 4. Risk Register

| Risk | Severity | Phase | Mitigation |
|---|---|---|---|
| CinematicMap migration surfaces MapLibre-specific bugs | Medium | 1e | Side-by-side; ship migration behind feature flag if needed |
| Open-Meteo CORS or rate limits block weather overlay | Low | 1f | Worker proxy fallback; cache aggressively |
| Wizard UX depends on AI quality | High | 1g | Synthetic eval set; iterate prompt before user-facing ship |
| Logistics interstitial drops funnel conversion | Medium | 1g | A/B test optional skip; measure carefully |
| Specialist console requires ops partner buy-in | Medium | 10 | Document operational requirements before building |
| Metrics without real data look embarrassing | Low | 11 | Use sample-data generator; flag explicitly as "synthetic" |
| Map perf budget tight with MapLibre bundle | Medium | 12 | Code-split; lazy-load MapLibre only when map surface in viewport |
| Map a11y is hard (canvas doesn't expose ARIA) | High | 12 | aria-live region; keyboard panning via custom controls |
| Beta users find critical UX issues | Medium | 13 | Reserve 1-week buffer after beta to iterate |
| Stripe / Resend live mode requires tax / legal | Medium | 13 | Block on legal sign-off; document in launch checklist |
| Tier 3 ops partner may not be ready for GA | Low | 14 | Explicitly defer Tier 3 per refined scope; document reactivation trigger |

---

## 5. Estimated Timeline

Assuming 1–2 weeks per phase at sustained pace:

| Phase | Weeks | Cumulative |
|---|---|---|
| 1e | 1 | 1 |
| 1f | 2 | 3 |
| 1g | 2 | 5 |
| 1h | 2 | 7 |
| 10 | 2 | 9 |
| 11 | 1 | 10 |
| 12 | 1 | 11 |
| 13 | 1 | 12 |
| 14 | 1 | 13 |

**~13 weeks to GA** (≈ 3 months from this snapshot, assuming operational roadmap Phases 2–9 complete in parallel).

Critical-path risks: Phases 1g and 10 depend on operational Phase 4 (live Stripe) and Phase 9 (chat infra) respectively. If those slip, GA slips.

---

## 6. Open Questions (need user call)

1. **Beta launch cohort size** — 100 (small, white-glove) vs 1000 (signal-rich, more support load)?
2. **Tier 2 chat SLA** — what's the target response time for specialist first-reply? (spec §7 hints at 12h but doesn't commit)
3. **Tier 3 deferral** — confirm Tier 3 (in-person guide) stays deferred post-GA per refined spec §5?
4. **Pricing copy** — final pricing for Tier 2 (€65 currently in mock 1.5) and any launch promo?
5. **Hosting** — Vercel confirmed for web, but where do Supabase Edge Functions + workers live? (Vercel functions vs Fly.io vs Railway)
6. **Mobile** — defer per refined spec, or scaffold-abandon so the monorepo doesn't carry a half-built `apps/mobile/`?
7. **International launch** — EN-only at GA, or PT/EN/ES/FR at GA? (i18n effort is non-trivial)
8. **Open data strategy** — does Rumia ship a public API for partner integrations (booking.com, viator)?

---

## 7. References

- **`docs/roadmap.md`** — operational launch-readiness roadmap (Phases 2–9 of supabase/workers/providers/spec-backfill work)
- **`docs/spec-v4.md`** — v4 master spec (4-tier ascension model)
- **`docs/spec-refined-2026.md`** — refined 2026 scope (Tier 1+2 immediate focus; Tier 3+Mobile deferred)
- **`docs/prototype.html`** — single-file React SPA prototype; canonical visual identity
- **`docs/prototype-routes.md`** — prototype routes mapped to current Next.js routes
- **`docs/architecture.md`** — current architecture overview
- **`docs/adr/`** — architecture decision records
- **`docs/ops/launch.md`** — pre-launch gate (Phase 2 of operational roadmap)
- **`docs/spec-v4.md` §3 (Tier 4 gating)** — RNAAT compliance + ops partner requirement