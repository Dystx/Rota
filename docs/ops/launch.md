# Launch Runbook

Status: **BLOCKED** by T40 (Supabase Schema Drift)

This runbook defines the pre-flight, launch, and smoke-test procedures for Rumia.pt.

## 1. Pre-Launch Gate (T40 Remediation)

The following blockers MUST be resolved in the hosted Supabase environment before proceeding with the production launch:

### Database Schema Reconciliation
- [ ] Apply migration `202605011600_create_user_roles_and_ownership.sql` (Adds `owner_user_id` to `trips` and `trip_briefs`)
- [ ] Apply migration `202605011700_create_rls_policies_and_grants.sql` (Enables core security boundaries)
- [ ] Apply migration `202605011800_add_indexes_constraints_trip_transaction.sql` (Fixes unindexed foreign key performance findings)
- [ ] Apply migration `202605020230_create_payment_webhook_events.sql` (Stripe ledger)
- [ ] Apply migration `20260504010324_admin_audit_trail.sql` (Operational visibility)
- [ ] Verify `public.reviewer_auth_links` and `public.user_profiles` exist.

### Security Configuration
- [ ] **Enable Leaked Password Protection** in Supabase Auth Dashboard.
- [ ] **Rotate Supabase Service Role Key** (T1) and update production secrets.
- [ ] Verify RLS is enabled and active for all public tables using `get_advisors(security)`.

## 2. Launch Sequence

### Step 1: Environment Readiness
- [ ] Verify all required secrets are set in production (Vercel/Supabase/Workers):
  - `<SUPABASE_PROJECT_REF>`
  - `<SUPABASE_ACCESS_TOKEN>`
  - `<SUPABASE_SERVICE_ROLE_KEY>`
  - `<STRIPE_WEBHOOK_SECRET>`
  - `<RESEND_API_KEY>`
  - `<POSTHOG_PROJECT_ID>`
  - `<MAPBOX_PUBLIC_TOKEN>`
- [ ] Run `pnpm --filter @repo/config health:print` to ensure all providers are reachable.

### Step 2: Database Migration
- [ ] Backup production (even if empty/scaffolded).
- [ ] Apply final schema migrations.
- [ ] Verify indices and EXPLAIN plans for hot paths (`/account`, `/reviewer/queue`).

### Step 3: Deployment
- [ ] Deploy `@repo/workers` to background job runner.
- [ ] Deploy `apps/web` to Vercel/Production host.
- [ ] Enable monitoring (Switch from `NoopMonitoringProvider` to real provider).

## 3. Smoke Test (Post-Launch)

1. **Traveler Path**:
   - Create a new trip at `/trip/new`.
   - Verify trip appears in `/account`.
   - Verify RLS prevents `<OUTSIDER_TEST_USER>` from seeing this trip.
2. **Reviewer Path**:
   - Assign trip to a reviewer via Admin UI/API.
   - Verify trip appears in `/reviewer/queue`.
3. **Provider Path**:
   - Trigger a test Stripe checkout.
   - Verify `payment_webhook_events` logs the attempt.
   - Verify `worker_dead_letter` remains empty.

## 4. Rollback Plan

If smoke tests fail:
1. Revert `apps/web` deployment to previous stable hash.
2. Revert `@repo/workers`.
3. If schema changes are breaking: Restore Supabase from PITR backup (See `backup-restore.md`).
