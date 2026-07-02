# Supabase Backup & Restore Runbook

This runbook covers data protection, backups, and recovery procedures for the hosted Supabase environment.

## 1. Backup Strategy

### Automated Backups
- **Daily Backups**: Managed by Supabase (standard).
- **PITR (Point-in-Time Recovery)**: **ACTION REQUIRED**. Verify PITR is enabled for Production in the Supabase Dashboard. Allows restoration to any specific second within the retention period (typically 7-30 days).

### Manual Exports (Pre-Migration)
Before running high-risk migrations:
```bash
# Export schema only
npx supabase db dump --db-url "<SUPABASE_DB_URL>" -f backup_schema_$(date +%Y%m%d).sql

# Export data only (Caution: PII/Secrets)
# npx supabase db dump --db-url "<SUPABASE_DB_URL>" --data-only -f backup_data.sql
```

## 2. Restore Procedure (Non-Destructive/Staging)

To verify a backup without touching production:
1. Create a new Supabase project (e.g., `rota-restore-test`).
2. Use the Supabase CLI to push the dumped schema/data:
   ```bash
   npx supabase db push --db-url "<TEST_PROJECT_DB_URL>"
   ```
3. Verify RLS and data integrity in the test project.

## 3. Production Restore (PITR)

**WARNING: This is a destructive operation for any data written after the target timestamp.**

1. Navigate to Supabase Dashboard -> Database -> Backups.
2. Select "Point-in-Time Recovery".
3. Select target Date and Time.
4. Review the "Impact Analysis" (Number of transactions to be reverted).
5. Confirm Restoration.
6. **Post-Restore**:
   - Re-verify `owner_user_id` and RLS policies (T40 drift check).
   - Check `admin_audit_trail` for gap analysis.

## 4. Disaster Recovery (RLS Lockout)

If an RLS policy accidentally blocks all access (including admins using the Data API):
1. Use the **Supabase SQL Editor** (which uses a privileged connection).
2. Fix or drop the offending policy:
   ```sql
   DROP POLICY "Offending Policy" ON "target_table";
   ```
3. If SQL Editor is also blocked (unlikely), contact Supabase Support or use the `SUPABASE_SERVICE_ROLE_KEY` via the Supabase CLI's `db query` command from an authorized environment to remediate. **CRITICAL**: Re-enable RLS or fix policies immediately after recovery and log the incident in the audit trail.
