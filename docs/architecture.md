# Architecture Notes

This platform is built as a modular monorepo, prioritizing decoupled UI development through deterministic data contracts.

## Core Packages

- `apps/web`: Next.js application containing all user-facing surfaces.
- `apps/workers`: Bounded local runner for background tasks (exports, emails).
- `@repo/ui`: Shared React components and design tokens.
- `@repo/types`: Single source of truth for Zod schemas and TypeScript interfaces.
- `@repo/db`: Supabase client and query helpers.
- `@repo/ai`: Itinerary generation logic (deterministic contract).
- `@repo/routing`: Travel-time and map layer calculations.
- `@repo/payments`: Checkout and pricing plan contracts.
- `@repo/emails`: Transactional template and delivery abstractions.
- `@repo/spatial-engine`: Provider-agnostic map and globe foundation (MapLibre adapter + CARTO basemaps); single map surface for home hero, `/explore`, `/explore/workspace`, and the trip routes.
- `@repo/analytics`: Privacy-safe instrumentation.
- `@repo/monitoring`: Error tracking and health checks.

## The Deterministic Contract Pattern

To enable rapid UI iteration and stable testing, we use a pattern where complex external services are stubbed or bounded behind schema-validated interfaces. 

- **AI**: Generates valid travel plans based on input briefs without live model calls.
- **Payments**: Provides checkout and pricing metadata without live Stripe calls.
- **Emails**: Provides template previews and bounded local delivery without live Resend calls.
- **Workers**: Implements a bounded local runner for rehearsing background jobs.

## Current Production Blockers

The local implementation is feature-ready for the current MVP scope. The single remaining production blocker is the **hosted Supabase schema apply** (Phase 2 of the master roadmap), which is operator-driven — every migration is local-ready and the runbook is in place.

For the authoritative breakdown, see:

- [`docs/master-roadmap.md`](./master-roadmap.md) — the consolidated 6-phase Cloudflare Pages + R2 + PMTiles deployment blueprint with the phase-to-PR cross-reference and the 2026-07-04 status table.
- [`docs/ops/launch.md`](./ops/launch.md) — the operator's playbook: 4 ordered migration batches (Phase-2 foundation / PostGIS + pgvector + places / PR-11 specialist / hybrid search + audit) + the security configuration + the 3-step smoke test (traveler / specialist / provider).
- [`docs/roadmap.md`](./roadmap.md) — the operational launch-readiness view with the §3.10 visual reference catalog (13/13 at parity) and the §3.11 engineering-lifecycle cross-reference.

## Quality Gates

The repository uses the following quality gates:
1. `pnpm typecheck`: Full workspace TypeScript verification.
2. `pnpm lint`: Code style and linting.
3. `pnpm test`: Unit tests for shared logic.
4. `pnpm test:e2e`: Smoke tests for critical user paths (Draft -> Itinerary -> Export).

Note: Some pre-existing type errors in `@repo/monitoring` and assertion failures in `@repo/db` are documented and must be resolved before production.


