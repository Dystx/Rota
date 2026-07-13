# Supabase Retirement Runbook

The hosted Supabase project is a read-only rollback archive, not a Rumia runtime dependency.

1. Disable all Rumia write paths to the hosted project before PostgreSQL cutover.
2. Create an authorized schema/data export without placing credentials or data dumps in the repository.
3. Record table counts and SHA-256 checksums for export artifacts in a private cutover record.
4. Keep the hosted project read-only until PostgreSQL migrations, authorization tests, backup restore, and end-to-end journeys are accepted.
5. Record a rollback-expiry date. Before that date, do not delete the project or its archive.
6. After the expiry date, obtain an explicit owner decision, rotate/delete the hosted credentials, remove the historical archive, and then delete the hosted project.

The active platform instructions are the [VPS platform design](../superpowers/specs/2026-07-11-rumia-vps-platform-design.md) and [self-hosted migration plan](../superpowers/plans/2026-07-11-rumia-vps-self-hosted-migration.md).
