# Rumia architecture

**Current source of truth:**

- [Rumia plan index](superpowers/PLAN-INDEX.md)
- [Rumia activity-first master plan](superpowers/plans/2026-07-10-rumia-activity-first-master.md)
- [Frontend polish and visual completion plan](superpowers/plans/2026-07-14-rumia-frontend-polish.md)
- [VPS platform design](superpowers/specs/2026-07-11-rumia-vps-platform-design.md)
- [Latest plan audit](../specs/PLAN-AUDIT_LATEST.md)

Rumia is a Portugal-wide, activity-first travel guide. Its primary job is to
help a traveller decide what is worth doing with limited time. The generated
activity plan and editorial verdicts are authoritative; maps are a later,
list-equivalent enhancement.

## Runtime topology

The repository is a `pnpm` + Turborepo monorepo. Development and browser
verification run on the Mac. The private production release runs on the
existing Debian VPS beside Lumes:

```text
Mac development/tests
        |
        v
VPS: Caddy (future public edge, currently deferred)
        |
        +-- Lumes on :3001 (unchanged)
        +-- Rumia web on 127.0.0.1:3002 (rumia-web.service)
        +-- PostgreSQL/PostGIS/pgvector on private local socket/loopback
        +-- Better Auth in the Next.js application
        +-- Restic encrypted backups to the dedicated Cloudflare R2 bucket
```

Public `rumia.pt` ingress is intentionally deferred. The private service is
the verified release boundary; no PostgreSQL port is exposed publicly.

## Packages and boundaries

- `apps/web`: Next.js App Router application with public, traveler, reviewer,
  and operator route groups.
- `apps/workers`: bounded local worker for export and delivery jobs.
- `packages/ui`: shared design tokens and React components.
- `packages/config`: typed environment configuration and opt-in feature flags.
- `packages/db`: server-only PostgreSQL/Drizzle repositories with actor-scoped
  authorization.
- `packages/auth`: Better Auth integration and session boundary.
- `packages/types`: shared Zod schemas and TypeScript contracts.
- `packages/ai`: deterministic activity-plan and editorial-assistance logic;
  live AI remains release-gated.
- `packages/routing`: travel-time and route-layer contracts.
- `packages/spatial-engine`: provider-agnostic MapLibre renderer for explicitly
  enabled surfaces; the optional activity map is currently unimplemented.
- `packages/analytics`: privacy-safe event instrumentation.
- `packages/monitoring`: route health and error-capture foundation.

## Data and authorization

The production direction is private PostgreSQL with PostGIS, `pg_trgm`, and
pgvector, accessed through Drizzle. Better Auth owns the application session
boundary. Database roles are separated between application and owner/admin
operations. The browser never connects directly to PostgreSQL.

Supabase files remain archive/rollback evidence only. There is no active
Supabase client, hosted-Supabase activation path, or Supabase-shaped CI stack.

## Map boundary

The core activity list, save/remove/reorder flow, and chosen-day workspace do
not depend on MapLibre. A future `ENABLE_ACTIVITY_MAP` flag must remain off by
default until the reviewed-content, provider/licensing, attribution, route,
performance, reduced-motion, and 2D fallback gates are approved. See the
[activity-map capability](superpowers/specs/2026-07-11-rumia-activity-map-capability.md)
and [map-provider licensing record](ops/map-provider-licensing.md).

## Quality gates

The release gate is proportional to the changed surface:

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm test:unit`
4. `pnpm build`
5. `pnpm --dir apps/web test:e2e`
6. `pnpm --dir apps/web test:visual`
7. `pnpm --dir apps/web test:a11y`
8. `pnpm --dir apps/web test:perf`
9. `@viewport-qa` at 1024×768 and 768×768
10. `node scripts/check-runtime-architecture.mjs`

Current evidence and remaining owner gates are recorded in
[PLAN-AUDIT_LATEST.md](../specs/PLAN-AUDIT_LATEST.md), not in the older
Cloudflare/Supabase roadmap snapshots.
