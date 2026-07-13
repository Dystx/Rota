# Retired Supabase Migration Archive

Supabase is not part of Rumia's future runtime architecture. This folder is retained temporarily as source material for translating the historical schema and policy intent into forward Drizzle/PostgreSQL migrations.

Do not:

- run `supabase start`, `supabase db reset`, `supabase link`, or `supabase db push` for Rumia;
- apply a new migration to the hosted Supabase project;
- copy Supabase URL, anon, service-role, or access-token values into Rumia configuration;
- enable a public feature using the hosted project.

The active target is private PostgreSQL 17 with PostGIS, pg_trgm, and pgvector; Better Auth runs inside the Next.js application; Drizzle owns migrations and server-only repositories. The active instructions are:

- [VPS platform design](../docs/superpowers/specs/2026-07-11-rumia-vps-platform-design.md)
- [VPS self-hosted migration plan](../docs/superpowers/plans/2026-07-11-rumia-vps-self-hosted-migration.md)
- [Supabase retirement runbook](../docs/ops/supabase-retirement.md)

The hosted project remains read-only rollback evidence until the PostgreSQL migration, user-journey verification, and restore drill have all passed. Only an explicit owner decision after the documented rollback window may remove this archive and delete the hosted project.
