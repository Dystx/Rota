# Prototype Route Map

**Source**: [`docs/prototype.html`](./prototype.html) — single-file React SPA prototype (2026-07).
**Status**: Reference. Existing Next.js routes in `apps/web/app/` are organized by `(marketing|app|admin|reviewer)` route groups. The prototype uses a flatter `/console/*` namespace.

---

## Client-Facing Routes

| Prototype route | Component | Maps to current | Action |
|---|---|---|---|
| `/` | `HomePage` | `apps/web/app/(marketing)/page.tsx` | Replace with prototype layout |
| `/planner` | `PlannerPage` (AI Intent Engine) | `apps/web/app/(app)/trip/new/page.tsx` | Add page; existing maps to prompt-composer flow |
| `/logistics` | `LogisticsPage` (rent-a-car question) | NEW | Add page; part of intent-engine multi-step flow |
| `/checkout` | `CheckoutPage` (Core AI vs Hybrid upgrade) | NEW | Add page; replace `apps/web/app/(marketing)/pricing/page.tsx` semantics |
| `/itineraries` | `ItinerariesPage` (saved list) | `apps/web/app/(app)/account/page.tsx` | Add page; complement `account` with separate itineraries list |
| `/vault` | `VaultPage` (saved archive) | `apps/web/app/(app)/account/page.tsx` (archive section) | Split vault into separate route |
| `/expert-chat` | `ExpertChatPage` (Tier 2 chat) | `apps/web/app/(reviewer)/reviewer/trips/[tripId]/page.tsx` (chat panel) | Add page; chat-first view for Tier 2 |

---

## Console (Admin + Reviewer + Ops unified)

The prototype uses a single `/console/*` namespace. Current code separates admin and reviewer surfaces.

| Prototype route | Component | Maps to current | Action |
|---|---|---|---|
| `/console` | `ConsolePipeline` | `apps/web/app/(admin)/admin/` | Add `/console` route that redirects to dashboard |
| `/console/pipeline` | `ConsolePipeline` (Operations) | `apps/web/app/(admin)/admin/places/page.tsx` | Add page |
| `/console/workspace` | `ConsoleWorkspace` (Revision) | `apps/web/app/(reviewer)/reviewer/trips/[tripId]/page.tsx` | Add page; the active revision canvas |
| `/console/messages` | `ConsoleMessages` (Messaging Hub) | NEW | Add page; Level 2 chat triage |
| `/console/graph` | `ConsoleGraph` (Knowledge Graph) | `apps/web/app/(admin)/admin/places/page.tsx` (data view) | Add page; graph visualization of places/regions |
| `/console/metrics` | `ConsoleMetrics` (Dashboard) | `apps/web/app/(admin)/admin/analytics/page.tsx` | Add page |
| `/console/config` | `ConsoleConfig` (System Config) | NEW | Add page |

---

## Architectural Decisions Required

1. **Keep `(admin|app|reviewer)` route groups, or flatten to `(app|console|marketing)`?**
   - Current: admin (`/admin/*`), reviewer (`/reviewer/*`), traveler (`/trip/*`)
   - Prototype: everything admin/reviewer/ops under `/console/*`
   - Pro of prototype: single namespace matches single-tier RBAC surface (Tier 1+2 only — see `docs/spec-refined-2026.md`)
   - Pro of current: separation by user role matches Supabase RLS policies

2. **Tier 2 chat surface: `/expert-chat` or `/reviewer/trips/[tripId]`?**
   - Prototype: dedicated `/expert-chat` route (chat-first UX)
   - Current: chat is a panel inside `/reviewer/trips/[tripId]`
   - Chat-first matches the Tier 2 async triage model better

3. **`/logistics` and `/checkout` are checkout-flow steps in the prototype.**
   - Currently `apps/web/app/(marketing)/pricing/page.tsx` exists but isn't wired into a flow
   - These need to become part of the Tier 1 → Tier 2 upsell funnel

---

## Routes NOT in the prototype

The prototype is sparse on purpose — it's a single-file mockup. Real routes that need to exist but aren't in the prototype:

| Route | Purpose |
|---|---|
| `/trip/new/logistics` | Logistics question (currently `/logistics` in prototype) |
| `/trip/new/checkout` | Tier selection (currently `/checkout`) |
| `/trip/[tripId]` | Generated itinerary viewer (current `(app)/trip/[tripId]`) |
| `/trip/[tripId]/map` | Map audit view |
| `/trip/[tripId]/export` | Export hub |
| `/portugal` | Marketing — destination primer |
| `/how-it-works` | Marketing — flow explainer |
| `/human-review` | Marketing — Tier 2 upsell |
| `/admin/places/[placeId]` | Admin place detail (per `docs/architecture.md`) |
| `/admin/countries/[countryId]` | Admin country detail |
| `/admin/regions/[regionId]` | Admin region detail |
| `/admin/reviewers/[reviewerId]` | Admin reviewer detail |
| `/admin/partners/[partnerId]` | Admin partner detail |
| `/admin/reviewer-assignments/[assignmentId]` | Admin assignment detail |

---

## Tailwind Config Differences

The prototype uses **Tailwind CDN** with `tailwind.config = {...}` syntax. The current project uses **Tailwind v4.2.4** with `@theme` directive in CSS.

| Concern | Prototype (CDN) | Current (v4 + PostCSS) |
|---|---|---|
| Token definition | JS object in `<script id="tailwind-config">` | CSS `@theme { --color-* }` block |
| Class usage | `bg-ochre-dark`, `text-linen-dark`, etc. | Same — `@theme` auto-generates utilities |
| Custom typography | `font-body-md`, `font-display` (multiple aliases) | Same names mapped via `@theme --font-*` |
| Glass surfaces | Inline class `bg-glass-light/65 backdrop-blur-md` | `@layer components .glass-panel` |
| Container queries | `container-queries` plugin | Built-in to v4 |

`docs/design-tokens-olive-ochre.css` provides the v4 `@theme` translation.

---

## Migration Plan

1. **Add new prototype-mapped routes as Next.js pages** (5 client-facing, 7 console routes) ✅ **DONE 2026-07-02**
2. **Keep `(admin|app|reviewer)` route groups as-is** for now — adds `/console/*` as an alias/redirect layer later if desired
3. **Apply `docs/design-tokens-olive-ochre.css`** by replacing `packages/ui/src/styles.css` content ✅ **DONE additively 2026-07-02**
4. **Audit `.rota-*` component classes** in `packages/ui/src/styles.css` for hardcoded Cinematic Concierge references; rename or repoint to olive/ochre tokens ✅ **DONE 2026-07-02**
5. **Replace page-level hero sections** in `(marketing)/*` and `(app)/trip/new/page.tsx` with prototype's hero layout (`h-[819px]` cinematic background + glass card overlay) ✅ **DONE 2026-07-02**
6. **Verify** `pnpm typecheck` and `pnpm test` still pass after token swap ✅ **DONE**

Each step is its own commit; smallest-reviewable diff.

---

## Migration Progress (as of 2026-07-02)

| Step | Status | Commit |
|---|---|---|
| 1. Add prototype-mapped routes as Next.js pages | ✅ **11/12 routes ported** | `c007883`, `8476954`, `af25df7`, `7bcf504` |
| 2. Olive/ochre tokens applied to `packages/ui/src/styles.css` | ✅ Done additively | `baf0042`, `081b40f` |
| 3. Prototype served verbatim at `/prototype.html` | ✅ Done | `061165d` |
| 4. `.rota-*` audit + repoint | ✅ Done (Option D: value repoint in `:root`) | `66fc9cc` |
| 5. Replace page-level heroes in `(marketing)/(app)` | ✅ Done (marketing + trip/new) | `022b228`, `a57a45e` |
| 6. Verify pnpm typecheck / test / build | ✅ All pass (13/13 typecheck, 131/131 @repo/ui tests, 49/49 build) | — |

---

## Pending work (credentials-blocked)

These items require Supabase project access from the user's environment, not local code changes:

| Item | Reference | What's needed |
|---|---|---|
| **Phase 2 — Production Supabase reconciliation** | `docs/ops/launch.md` §1 + `docs/roadmap.md` Phase 2 | Hosted Supabase project URL + service-role key + apply permission. 12 + 4 v4 migrations to apply in order (oldest first, PITR backup before each). |
| **v4 schema apply** | `supabase/migrations/202607022{100,110,120,130,140}_*.sql` | Same access as Phase 2; the migrations are committed locally. |
| **E2E + visual + a11y + perf test suites** | `pnpm test:e2e` etc. | Running Supabase (local CLI or hosted) so Playwright global-setup can resolve the project URL. |

### Routes ported

| Prototype route | Next.js path | Commit |
|---|---|---|
| `/planner` | `apps/web/app/planner/page.tsx` | `8476954` |
| `/logistics` | `apps/web/app/logistics/page.tsx` | `af25df7` |
| `/checkout` | `apps/web/app/checkout/page.tsx` | `c007883` |
| `/itineraries` | `apps/web/app/itineraries/page.tsx` | `af25df7` |
| `/vault` | `apps/web/app/vault/page.tsx` | `af25df7` |
| `/expert-chat` | `apps/web/app/expert-chat/page.tsx` | `af25df7` |
| `/console/pipeline` | `apps/web/app/console/pipeline/page.tsx` | `7bcf504` |
| `/console/workspace` | `apps/web/app/console/workspace/page.tsx` | `7bcf504` |
| `/console/messages` | `apps/web/app/console/messages/page.tsx` | `7bcf504` |
| `/console/graph` | `apps/web/app/console/graph/page.tsx` | `7bcf504` |
| `/console/metrics` | `apps/web/app/console/metrics/page.tsx` | `7bcf504` |
| `/console/config` | `apps/web/app/console/config/page.tsx` | `7bcf504` |

### Routes NOT ported (intentional)

| Prototype route | Reason |
|---|---|
| `/` (HomePage) | Conflicts with existing `apps/web/app/(marketing)/page.tsx` (the actual Rota marketing homepage). The prototype's HomePage is a hero-only mockup; the existing marketing page is the real entry point. |