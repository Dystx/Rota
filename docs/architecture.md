# Architecture scaffold notes

This repo starts with the roadmap's Phase 1 shape:

- monorepo via `pnpm` + `turbo`
- `apps/web` for the first delivery surface
- shared `packages/ui`
- placeholders for `db`, `api`, `ai`, `maps`, `routing`, `payments`, `emails`, `analytics`, and shared `types`
- `supabase/` and `scripts/` directories reserved for the next implementation phases

## What is intentionally deferred

- live Supabase integration
- auth wiring
- AI generation pipeline
- route matrix providers
- Stripe checkout logic
- PDF export logic
- admin mutation tools
- reviewer write workflows

The shell is still aligned to the roadmap because the route groups and package boundaries already exist.

## Dependency notes after package research

The original roadmap already made the right core calls:

- Next.js
- TypeScript
- Tailwind CSS + shadcn/ui
- Zod
- Supabase
- Stripe
- Mapbox or MapLibre
- Resend
- PostHog
- Sentry
- pnpm + Turborepo

### Packages already implied by the UI plan

When shadcn/ui is introduced properly, these should be treated as expected supporting packages rather than separate product decisions:

- `lucide-react` for icons
- Radix primitives used by shadcn/ui
- `react-day-picker` for calendar/date UI
- `@tanstack/react-table` for reviewer/admin tables
- `cmdk` for command palette UX

### Recommended additions not explicitly called out in the roadmap

These are useful but should be added only as the matching product need appears:

- `date-fns` for trip date formatting, range logic, and itinerary labeling
- `tailwind-merge` and `clsx` for safer shared component class composition
- `class-variance-authority` for shared UI variants
- `sonner` for lightweight notifications
- `motion` for restrained editorial animation and transitions
- `@tanstack/react-query` when server-state caching and background refetch become necessary
- `next-themes` if theme switching becomes a product requirement
- `recharts` only when the admin/analytics surface genuinely needs charts

### Dependency posture

- keep the initial dependency set small
- prefer adding packages when a specific surface demands them
- do not add a heavyweight form library unless the trip brief and reviewer forms justify it
- keep animation restrained and editorial, not flashy

### Current implementation decision

After the dependency research pass, the immediate roadmap step remains the same: build the structured trip brief first.

For that milestone, add only:

- `zod` now, because the roadmap explicitly calls for validated structured data and `TripBriefSchema`

Defer until the matching surfaces exist:

- `react-hook-form` and `@hookform/resolvers` until forms become complex enough to justify them
- `@tanstack/react-query` until real server-state fetching and mutation flows land
- `date-fns` until real trip date calculations or formatted itinerary output land
- `sonner` until user-facing async actions need toast feedback
- `motion` until functional flows are stable and ready for polish
- `recharts` until the admin analytics surface is implemented
- `zustand` unless client-only state actually becomes awkward with plain React state
- `vitest` and `playwright` as soon as meaningful logic and end-to-end flows exist beyond static shells

## Current persistence shape

The repo now includes the first minimal persistence path:

- a shared `@repo/db` package for server-side draft-trip writes
- the same db package now exposes read methods for trip detail and saved trip lists
- a Supabase migration that creates `trip_briefs` and `trips`
- a `POST /api/trips` route in the web app
- client-side submission from the trip brief form after schema validation
- server-rendered account and trip detail pages now consume persisted draft data when configured

This path intentionally uses a server-only Supabase service role key for the first unauthenticated MVP write flow.

### Important caveat

- the service role key bypasses RLS, so it must remain server-only
- authentication, rate limiting, and stricter policies should be added before opening this flow broadly

## Current AI shape

The repo now includes a minimal, swappable AI layer:

- shared itinerary and question schemas in `@repo/types`
- a deterministic itinerary generator in `@repo/ai`
- server-rendered trip detail preview that consumes the generated structured output

This is intentionally model-free for now, but the package shape mirrors a future OpenAI structured-output integration: schema-driven output, a provider interface, and page code that does not care whether the generator is deterministic or model-backed.

## Current routing shape

The repo now includes a minimal route-validation layer:

- shared route-layer and warning schemas in `@repo/types`
- a deterministic `@repo/routing` package that converts itinerary days into map layers and route warnings
- the trip map page and reviewer trip workspace now consume the same route-validation output
- this keeps the map and reviewer surfaces ready for a future provider-backed routing engine without changing their data contract

## Current monetization and trust shape

The repo now includes a first shared unlock/review and export layer:

- persisted trip rows already expose `is_paid` and `has_human_review`
- a web-side trip-commerce helper maps those booleans into user-facing unlock, export, queue, and trust labels
- trip detail, account, reviewer queue, reviewer trip detail, pricing, and human-review pages now render the same trust-marker language
- `POST /api/trips/[tripId]/unlock` mutates the persisted trip into the paid state
- `GET /api/trips/[tripId]/export?format=markdown` generates a deterministic markdown export from the saved brief and itinerary
- `POST /api/trips/[tripId]/review` moves a paid trip into review and lets the reviewer mark it reviewed

This is still a minimal internal flow. Stripe checkout, richer export formats, background export jobs, and detailed reviewer edits remain future implementation work.

## Current worker planning shape

The repo now includes the first explicit worker-plan layer:

- shared worker job schemas in `@repo/types`
- a deterministic `apps/workers` plan builder for export, review-assignment, review-completion, and route-refresh tasks
- a reviewer operations page that exposes those planned background jobs to the product surface

This is still planning only. No external queue, cron, or worker runner is attached yet.

## Current payments and email shape

The repo now includes deterministic provider-free package layers for commerce and delivery:

- `@repo/payments` exposes shared checkout-plan records for free preview, paid unlock, and human review
- `@repo/emails` exposes shared transactional preview content for payment receipt, export ready, and review complete flows
- pricing, trip detail, account, human-review, and reviewer operations pages now consume those packages instead of hardcoded copy
- the worker-plan builder now references the same checkout and delivery records when describing downstream background work

This is still intentionally provider-free. Stripe checkout sessions, order records, webhook handling, and real email delivery remain future implementation work.

## Current export shape

The repo now includes the first roadmap-aligned export center:

- `/trip/[tripId]/export` groups PDF, calendar, markdown, print, and share actions after unlock
- `apps/web/lib/trip-export.ts` now builds deterministic markdown, calendar, and simple PDF artifacts from the saved trip and itinerary
- `GET /api/trips/[tripId]/export` returns those export files only for unlocked trips
- the worker plan includes both markdown and PDF export tasks so background handling can grow without changing the product surface

This is still a minimal export layer. The PDF is generated without a dedicated renderer, share links are path-based, and richer storage-backed export history remains future work.

## Current reviewer dashboard shape

The repo now includes the first complete reviewer dashboard shell described by the roadmap:

- reviewer queue, trip detail, worker operations, profile, and history pages all exist under the reviewer route group
- reviewer trip detail links back into reviewer profile/history and still uses the shared route-validation and trust-marker flow
- the new profile/history pages are deterministic shells for reviewer identity, throughput, and quality-review context until reviewer persistence is added

This is still not a full reviewer CMS. Assignment logic, reviewer scoring persistence, and visible note mutation tools remain future work.

## Current admin place-management shape

The admin places surface now includes a client-side editor shell:

- admins can rehearse create/edit place flows for name, region, category, quality, and source confidence
- the editor is intentionally local-only so the workflow can be validated before adding real Supabase-backed place mutations

This is still pre-persistence.

## Current admin CMS shape

The admin route group now covers the roadmap's first CMS module set:

- countries, regions, partners, reviewers, quality, analytics, and places all have explicit route surfaces
- these pages are still deterministic shells, but they preserve the final IA and product language needed for future persistence and role-based access
- the places surface is the only admin page with interactive editing so far; the others focus on curation, rollout, and measurement structure

Real admin mutations, analytics ingestion, reviewer assignment persistence, and partner data models remain future work.

## Current admin place data shape

The repo now includes the first real admin persistence slice for places:

- shared place schemas live in `@repo/types`
- Supabase migration scaffolds a `places` table with quality and source-confidence fields
- `@repo/db` now exposes minimal place CRUD helpers
- `apps/web/app/api/places` now provides list, create, read, and update route handlers
- the admin place editor prefers the real API and falls back to local-only updates when Supabase is unavailable

This keeps the admin workflow usable before full infrastructure is ready while preserving the final route and data boundaries.

## Current region and reviewer data shape

The repo now includes the next admin persistence slice:

- shared region and reviewer schemas live in `@repo/types`
- Supabase migration scaffolds `regions` and `reviewers` tables
- `@repo/db` now exposes minimal region and reviewer CRUD helpers
- `apps/web/app/api/regions` and `apps/web/app/api/reviewers` provide list, create, read, and update route handlers
- admin regions/admin reviewers and reviewer profile/history pages now prefer real data and keep graceful fallback copy when Supabase is unavailable

Reviewer assignments, reviewer history persistence, and region-driven trip brief configuration are still future work.

## Current partner and reviewer-assignment shape

The repo now includes the next persistence slice for marketplace-adjacent and reviewer workflow data:

- shared partner and reviewer-assignment schemas live in `@repo/types`
- Supabase migration scaffolds `partners` and `reviewer_assignments` tables
- `@repo/db` now exposes partner CRUD plus reviewer-assignment creation/history helpers
- `/api/partners` and `/api/reviewer-assignments` route handlers now exist
- reviewer queue/history and the trip review mutation now prefer assignment persistence while still keeping the existing trip review flow working when Supabase is unavailable

Partner offer enrichment, booking click tracking, and deeper reviewer-note persistence remain future roadmap layers.
