# Rumia Backup & Restore Runbook

Rumia's active data-protection path is native PostgreSQL on the VPS with an
encrypted Restic repository in Cloudflare R2. The historical hosted Supabase
project is rollback evidence only; this document contains no Supabase command.

## Backup

Install `/etc/rumia/backup.env` as `root:root` mode `0600`, including a
separate Restic password file. Then install and run the root-owned
`ops/vps/backup-rumia.sh` script. It creates a custom-format `pg_dump` of the
`rumia` database, uploads it with the `rumia-postgres` tag, and applies the
daily/weekly/monthly retention policy. The temporary dump is deleted on exit.

## Restore drill

Run `ops/vps/restore-rumia-check.sh` as root on the VPS. The script restores the
latest tagged snapshot into a new `rumia_restore_check` database, verifies the
PostGIS extension, and drops the temporary database and staging directory on
exit. It refuses to overwrite an existing check database.

The drill is evidence only when the command exits successfully and the output
is recorded without secrets. A successful backup upload alone is not restore
proof.

## Recovery order

1. Stop public writes or place the app in a truthful unavailable state.
2. Preserve the current release symlink and incident timestamps.
3. Restore into a separate database first; run migrations/authorization and
   `/api/health` checks.
4. If approved, switch the database or release during a defined rollback
   window, then verify owner/reviewer/admin isolation.
5. Keep the previous database snapshot and release available until the owner
   records the rollback decision.

See [VPS operations](../../ops/vps/README.md), the
[self-hosted migration plan](../superpowers/plans/2026-07-11-rumia-vps-self-hosted-migration.md),
and [Supabase retirement](supabase-retirement.md) for the boundaries between
active recovery and historical rollback evidence.
