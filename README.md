# Rota (Rumia)

Portugal-wide activity curation platform: helping travellers decide what is
genuinely worth doing with the time they have.

## Architecture

This project is a monorepo managed by `pnpm` and `Turborepo`.

- `apps/web`: Next.js App Router application (Consumer, Reviewer, Admin surfaces).
- `apps/workers`: Bounded local runner for background export and delivery jobs.
- `packages/ui`: Shared design tokens and React components (aligned with Stitch).
- `packages/config`: Centralized, typed environment configuration.
- `packages/db`: Server-only PostgreSQL/Drizzle repositories with actor-scoped
  access control.
- `packages/types`: Shared Zod schemas and TypeScript definitions.
- `packages/ai`: Deterministic activity-plan and editorial-assistance engine.
- `packages/routing`: Travel-time validation and map layer logic.
- `packages/payments`: Deterministic checkout plan contracts.
- `packages/emails`: Deterministic transactional email templates.
- `packages/spatial-engine`: Provider-agnostic spatial engine with MapLibre
  rendering for explicitly enabled map surfaces.
- `packages/analytics`: Privacy-safe event instrumentation.
- `packages/monitoring`: Error capture and route-health foundation.

## Quick Start

### Prerequisites
- Node.js >= 24.0.0
- pnpm >= 10.0.0

### Installation
```bash
pnpm install
```

### Development
```bash
pnpm dev
```

### Verification
```bash
pnpm typecheck  # Run TypeScript checks across all packages
pnpm lint       # Run linting
pnpm test       # Run unit tests
```

### End-to-End & Specialized Tests
These commands require `apps/web` to be running or use Playwright's webServer config.
```bash
pnpm test:e2e     # Smoke tests (@smoke)
pnpm test:visual  # Visual regression tests (@visual)
pnpm test:a11y    # Accessibility audits (@a11y)
```

## Environment Setup

Copy the root `.env.example` to `apps/web/.env.local`. The target runtime uses a server-only PostgreSQL connection and Better Auth:

```env
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3105
DATABASE_URL=postgresql://rumia_app:local-only-password@127.0.0.1:5432/rumia
BETTER_AUTH_SECRET=local-only-random-secret
```

`DATABASE_URL` and `BETTER_AUTH_SECRET` are server-only. They must never be placed in `NEXT_PUBLIC_*` variables, client components, browser headers, logs, or committed files.

The optional activity map is controlled by `ENABLE_ACTIVITY_MAP=false` and
remains disabled until the content and provider/licensing gates in the current
plan audit are approved.

## Local database development

The approved target is PostgreSQL 17 with PostGIS, pg_trgm, and pgvector. The Mac is the local development/test environment; the VPS is production. See [the VPS platform design](docs/superpowers/specs/2026-07-11-rumia-vps-platform-design.md) and [implementation plan](docs/superpowers/plans/2026-07-11-rumia-vps-self-hosted-migration.md).

## Production Readiness Status

The platform currently operates on **Deterministic Contracts** for local development and testing. This means:
1. The UI and logic are implemented using stable schemas.
2. OpenAI, Stripe, and Resend remain optional, release-gated integrations. The
   map renderer is MapLibre; basemap and route providers are intentionally not
   enabled until the licensing record is owner-approved.
3. **Current status**: the private VPS release, Better Auth/PostgreSQL
   runtime, authorization checks, encrypted off-server backup restore, and
   browser/UI gates are verified. Public ingress is deferred; reviewed-content
   approval and map-provider licensing remain the only product-owner gates for
   the optional activity-map capability. The former hosted Supabase project is
   rollback evidence only and receives no new feature work.
