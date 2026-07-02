# Deployment & Rollback Runbook

This runbook covers standard deployments, hotfixes, and rollback procedures.

## 1. Standard Deployment

### Build & Test
All deployments must pass CI gates:
1. `pnpm build` (Turbo cache hit for packages)
2. `pnpm typecheck`
3. `pnpm lint`
4. `pnpm test:e2e` (Playwright smoke suite)

### Schema Changes
1. Inspect `supabase/migrations/` for new `.sql` files.
2. Run `supabase db lint` locally.
3. Apply to staging/preview branch first.
4. Verify RLS policies with `get_advisors(security)`.

## 2. Rollback Procedures

### Application Rollback (Vercel/Web)
1. Navigate to Deployment history.
2. Identify last "Green" deployment.
3. Select "Redeploy" or "Promote to Production".
4. Estimated time: < 2 minutes.

### Worker Rollback
1. Revert worker image/script to previous stable version.
2. Check `LocalWorkerState` for interrupted jobs.
3. Estimated time: < 5 minutes.

### Database Rollback
**WARNING: Destructive Operation.**
1. Check if the issue can be fixed with a "forward-only" migration (e.g., dropping a bad index).
2. If schema is corrupted/unstable:
   - Use Supabase Point-in-Time Recovery (PITR).
   - Restore to timestamp immediately preceding the deployment.
   - **Note**: This will lose any data written between the deploy and the restore.
3. Refer to `backup-restore.md` for restoration steps.

## 3. Key Rotation (T1)

### Supabase Service Role Key
1. Generate new key in Supabase Dashboard.
2. Update `<SUPABASE_SERVICE_ROLE_KEY>` in Production Environment Variables.
3. Redeploy `apps/web` and `@repo/workers`.
4. Revoke old key in Supabase Dashboard.

### Provider Keys (Stripe, Resend, etc.)
1. Rotate in provider dashboard.
2. Update corresponding environment variable.
3. Trigger redeploy.
4. Verify integration via `provider_error` monitoring signal.
