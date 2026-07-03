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

While the local implementation is feature-ready for the current MVP scope, the hosted production environment is currently in a "drifted" state.

1. **Schema Drift**: The hosted Supabase database is missing critical migrations including `owner_user_id` for trip isolation and the `admin_audit_trail` table.
2. **Security Config**: RLS policies are not yet enforced on the hosted database, and leaked password protection is disabled in Supabase Auth.
3. **Infrastructure**: Background worker jobs in `apps/workers` are currently bounded for local execution; they lack a hosted/distributed runner (e.g., Inngest or Upstash).

## Quality Gates

The repository uses the following quality gates:
1. `pnpm typecheck`: Full workspace TypeScript verification.
2. `pnpm lint`: Code style and linting.
3. `pnpm test`: Unit tests for shared logic.
4. `pnpm test:e2e`: Smoke tests for critical user paths (Draft -> Itinerary -> Export).

Note: Some pre-existing type errors in `@repo/monitoring` and assertion failures in `@repo/db` are documented and must be resolved before production.


