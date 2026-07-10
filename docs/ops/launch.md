# Launch Runbook

Status: **BLOCKED** on hosted Supabase schema apply and local Docker policy verification
Last updated: 2026-07-10

This runbook defines the pre-flight, launch, and smoke-test procedures for Rumia.pt.

## Phase 0 evidence

- Required local commands: `pnpm repo:safety`, `pnpm qa:assets`, `pnpm check:migrations`, `pnpm test:unit`, and `pnpm test:rls` after `pnpm exec supabase db reset`.
- This workstation has not run the database reset or browser capture gate because Docker is unavailable and port `3105` is in use by an existing local server.
- Stripe, live AI, transactional email, trip messaging, Guide, B2B, operator console, and configuration flags remain off until their later release gates pass.

## 1. Pre-Launch Gate (Hosted Schema Apply)

The following migrations MUST be applied to the hosted Supabase project before production traffic. They are additive and safe to apply in any order as long as the ordering below is respected (each section builds on the previous).

### 1.1 Phase-2 Foundation (apply first, in order)

- [ ] `202605011600_create_user_roles_and_ownership.sql` — adds `owner_user_id` to `trips` and `trip_briefs`
- [ ] `202605011700_create_rls_policies_and_grants.sql` — enables core RLS boundaries
- [ ] `202605011800_add_indexes_constraints_trip_transaction.sql` — fixes unindexed-FK perf findings
- [ ] `202605020230_create_payment_webhook_events.sql` — Stripe ledger
- [ ] `20260504010324_admin_audit_trail.sql` — operational visibility

### 1.2 PostGIS + pgvector + places (apply as a batch)

- [ ] `202607022000_enable_postgis_pgvector_and_places_embeddings.sql` — extensions + `places.coordinates GEOMETRY(Point, 4326)` + GIST index + `places.embedding VECTOR(1536)` + HNSW index
- [ ] **Before** `202607032300_migrate_places_embedding_to_halfvec.sql`: in the SQL editor, run
  ```sql
  SET maintenance_work_mem = '2GB';
  VACUUM ANALYZE public.places;
  ```
  per `packages/ingest/README.md`. Then apply the halfvec migration (idempotent on pgvector < 0.7.0).
- [ ] `202607040000_add_places_osm_id.sql` — `places.osm_id text` + partial unique index for ingest upsert

### 1.3 Specialist Onboarding + Verification (PR-11)

- [ ] `202607022110_create_specialist_profiles.sql` — `specialist_profiles` with tier-3/tier-4 + license + verification CHECKs
- [ ] `202607040200_create_specialist_capabilities.sql` — `specialist_capabilities` (skill / language rows)

### 1.4 Hybrid Search + Audit Log

- [ ] `202607040100_create_place_adjustment_log.sql` — append-only audit table for specialist swaps
- [ ] `202607040300_create_match_hybrid_destinations.sql` — PL/pgSQL RRF combiner over HNSW + GIST + ILIKE
- [ ] `202607100200_create_trip_export_jobs.sql` — durable owner-scoped PDF/calendar/markdown export job state

### 1.5 Verification

- [ ] `select * from supabase_migrations.schema_migrations order by version desc limit 20;` — every migration above is present
- [ ] `select * from get_advisors('security') where status <> 'OK';` — empty
- [ ] `select count(*) from public.specialist_profiles;` — returns (count may be 0)
- [ ] `select extname, extversion from pg_extension where extname in ('postgis', 'vector');` — both installed

### 1.6 Security Configuration

- [ ] **Enable Leaked Password Protection** in Supabase Auth dashboard (Authentication → Sign In/Up → Security)
- [ ] **Rotate `SUPABASE_SERVICE_ROLE_KEY`** and update Vercel + Workers secrets
- [ ] **PITR** — verify Point-in-Time Recovery is enabled (Settings → Database → Backups). See `backup-restore.md`.
- [ ] Verify RLS is enabled and active for every public table (`get_advisors(security)` returns no failing rows)

## 2. Launch Sequence

### 2.1 Environment Readiness

Required secrets (Vercel + Workers + Supabase):

- `<SUPABASE_PROJECT_REF>`
- `<SUPABASE_ACCESS_TOKEN>`
- `<SUPABASE_SERVICE_ROLE_KEY>`
- `<NEXT_PUBLIC_SUPABASE_URL>`
- `<NEXT_PUBLIC_SUPABASE_ANON_KEY>`
- `<STRIPE_SECRET_KEY>` (Phase 4)
- `<STRIPE_WEBHOOK_SECRET>` (Phase 4)
- `<RESEND_API_KEY>` (Phase 4)
- `<POSTHOG_PROJECT_ID>` + `<NEXT_PUBLIC_POSTHOG_KEY>` (Phase 12)
- `<MAPBOX_PUBLIC_TOKEN>` (Phase 12)

Verify with:

```bash
pnpm --filter @repo/config health:print
```

### 2.2 Database Migration

- [ ] PITR backup is current (within the retention window)
- [ ] Apply the migration batch per §1.1–1.4 in order
- [ ] `select * from supabase_migrations.schema_migrations order by version desc limit 20;` to confirm

### 2.3 Deployment

- [ ] Deploy `@repo/workers` to the background-job runner (Cloudflare Worker / QStash scheduler)
- [ ] Deploy `apps/web` to Vercel
- [ ] Confirm monitoring is on (Sentry + perf budget wired — see §2 of `error-monitoring.md`)

## 3. Smoke Test (Post-Launch)

### 3.1 Traveler Path

1. Open an incognito browser. Sign up at `/login` (email + magic link).
2. Land on `/`. The cinematic 3D/2D map hero renders, bento grid loads.
3. Submit a brief at `/planner`. The brief normalizes (deterministic provider) and renders the follow-up panel.
4. Land on `/trip/[tripId]`. The cinematic hero + asymmetric chapter nav + ItineraryTimeline + filmstrip all render. The bento destinations card on the home page flies to the trip on bento click.
5. **RLS check** — in a second incognito window as a different user, hit `/api/trips/<id>` (or any read of the trip). Expect 404 / empty.
6. **Hybrid search check** — hit `/api/places/match?lng=-9.14&lat=38.72&keyword=lisbon`. Expect a 200 with at least one row from `public.places` when the seed data is in.

### 3.2 Specialist Path

1. Sign up at `/guide/onboarding` as a second user. Fill the form (regions via the checkbox grid, full name, hourly rate, tier-3 / tier-4 toggle). Submit.
2. Land on `/account` (or wherever the post-submit redirect points). The `is_verified` flag is `false` by default.
3. Sign in as an admin. Land at `/admin/specialists`. The new specialist appears in the queue with a Tier 2 / Tier 3 / Tier 4 badge.
4. Click the verify toggle. Expect the row to flip. The `get_advisors('security')` should still be empty.
5. Send a chat message at `/console/messages` to the new specialist's account. The realtime `chat_messages` channel fires, the triage classifier returns a tier, the badge renders.

### 3.3 Provider / Worker Path (Phase 4 — defer if Stripe / Resend not yet provisioned)

1. Trigger a test Stripe checkout. Expect a row in `payment_webhook_events`.
2. `worker_dead_letter` remains empty.
3. `pnpm --filter workers build` is clean.

## 4. Rollback Plan

If smoke tests fail:

1. Revert `apps/web` deployment to the previous stable Vercel hash (`vercel rollback`).
2. Revert `@repo/workers`.
3. If schema changes are breaking: restore Supabase from PITR. See `backup-restore.md`.
4. Rotate any leaked service-role key immediately (the key is in the deploy logs only if a deploy happened after the leak).
5. File an incident per `incidents.md`.

## 5. Post-Launch Monitoring

- Sentry error rate < 1% of sessions
- `/api/health` returns 200 with all providers `up`
- `/api/health/db` returns 200 and the RLS smoke query (`select 1 from auth.users limit 1`) succeeds
- p95 page TTFB < 500 ms (per `error-monitoring.md` perf budget)
- Specialist verification queue backlog < 24 h (per spec-v4 §3 SLA)
