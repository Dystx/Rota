# Rota (Rumia.pt)

Portugal-first travel planning platform.

## Architecture

This project is a monorepo managed by `pnpm` and `Turborepo`.

- `apps/web`: Next.js App Router application (Consumer, Reviewer, Admin surfaces).
- `apps/workers`: Bounded local runner for background export and delivery jobs.
- `packages/ui`: Shared design tokens and React components (aligned with Stitch).
- `packages/config`: Centralized, typed environment configuration.
- `packages/db`: Supabase client and CRUD helpers.
- `packages/types`: Shared Zod schemas and TypeScript definitions.
- `packages/ai`: Deterministic itinerary generation engine.
- `packages/routing`: Travel-time validation and map layer logic.
- `packages/payments`: Deterministic checkout plan contracts.
- `packages/emails`: Deterministic transactional email templates.
- `packages/maps`: Map provider abstractions.
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

Copy the root `.env.example` to `apps/web/.env.local` and fill in your Supabase credentials.

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (Server only!)
```

**Security Warning**: `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS policies. It must never be exposed to the client or committed to version control.

## Supabase Development

For local development with the Supabase CLI:
```bash
npx supabase start
npx supabase db reset
```

## Production Readiness Status

The platform currently operates on **Deterministic Contracts** for local development and testing. This means:
1. The UI and logic are implemented using stable schemas.
2. External providers (OpenAI, Stripe, Resend, Mapbox) are currently stubbed or bounded in their respective `@repo/*` packages to allow for decoupled development.
3. **Current Blocker**: The hosted Supabase environment has significant schema drift. Production deployment is blocked until `owner_user_id` columns, RLS policies, and missing schema elements are reconciled.


