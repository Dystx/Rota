# Rumia database connection and process model

The old serverless/Supabase connection note is retired. Rumia's approved
runtime is a long-lived Next.js process under systemd on the Debian VPS, with
private PostgreSQL on the same host. There is no browser database client,
PostgREST endpoint, or serverless pooler in the active architecture.

## Connection boundary

- `@repo/db` is server-only and uses Drizzle with a bounded `pg.Pool`.
- The web process connects as `rumia_app`; migrations use `rumia_owner`.
- PostgreSQL listens on loopback/Unix socket only; Caddy is the sole public
  ingress and proxies to `127.0.0.1:3002`.
- `DATABASE_URL`, `BETTER_AUTH_SECRET`, and any provider secrets are root-owned
  service environment values. They never appear in `NEXT_PUBLIC_*` variables.
- Better Auth validates the session before owner, reviewer, admin, or
  organization repositories are called.

## Pool and worker rules

- The systemd web service owns one bounded application pool per process. Do not
  add a serverless-specific pooler parameter or create a pool at module import.
- The future worker uses the PostgreSQL outbox and its own bounded process; it
  is disabled until a durable job feature is released.
- Long-running imports must use `packages/ingest` with an explicit maintenance
  memory plan and must not run in the web request path.

## Operational checks

- Check `/api/health` before and after a release.
- Use `systemctl status rumia-web.service` and `journalctl -u rumia-web.service`
  for process health; do not expose PostgreSQL logs or ports publicly.
- Use the [backup/restore runbook](backup-restore.md) for database recovery.
- Use the [VPS operations README](../../ops/vps/README.md) for deployment and
  rollback. Lumes remains unchanged on port 3001.

## Historical archive

The retired hosted project and its old connection notes remain only for the
documented rollback window. Do not add a new Supabase client, pooler URL,
service-role key, or hosted migration instruction.
