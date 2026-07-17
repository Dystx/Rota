# Rumia Launch Runbook

Status: **PRIVATE DEPLOYMENT COMPLETE; public DNS/Caddy ingress deferred by owner.**

This is the active launch runbook for Rumia. The current private release runs
on the existing Debian VPS beside Lumes: the Next.js service is loopback-only
on port 3002; Better Auth runs in the application; PostgreSQL 17/PostGIS is
private to the host; encrypted backups use a separate Cloudflare R2 bucket.

## Pre-launch gates

- [x] Mac and VPS apply the same forward Drizzle migrations (15 migrations).
- [x] PostgreSQL listens only on Unix socket/`127.0.0.1`; no public 5432 firewall rule exists.
- [x] `rumia_app` has no superuser, role-creation, database-creation, replication, or RLS-bypass privilege.
- [x] Traveler, reviewer, administrator, and wrong-tenant authorization contracts pass.
- [x] Restic snapshot `52de9966` is restored into `rumia_restore_check` and `postgis_full_version()` succeeds.
- [x] Rumia web service returns 200 on `127.0.0.1:3002/api/health` before Caddy is reloaded.
- [x] `caddy validate --config /etc/caddy/Caddyfile` passed in the 2026-07-13
  VPS read-only audit; no public reload was performed (public ingress remains
  deferred).
- [x] Local standalone Rumia returns 200 on `/`, `/support`, `/api/auth/get-session`, and `/api/health`; the VPS read-only audit confirms Lumes remains on port 3001 and untouched.

The external backup configuration and loopback service are installed and
verified. Public DNS, Caddy, and external HTTPS are deliberately deferred by
the owner; the proposed systemd unit and Caddy fragment have passed temporary
syntax validation.

## First public release

Only reviewed Portugal activity discovery, anonymous URL day state, and privacy-safe measurement are eligible for the first release. Saved days, sign-in, payments, worker jobs, email, uploads, reviewer operations, and B2B remain disabled until their independent release gates pass.

## Smoke checks

For private Mac access while public DNS is deferred:

```sh
ssh -N -L 3302:127.0.0.1:3002 root@152.53.145.9
curl http://127.0.0.1:3302/api/health
```

Mac port 3002 is reserved by the local Lumes development server; use 3302 for
the Rumia tunnel.

For production asset smoke, fetch the homepage, extract one emitted
`/_next/static/*.css` URL, and require HTTP 200 with `text/css`. The standalone
server changes its working directory to the nested app directory, so a release
that keeps `.next/static` only beside `standalone/` will render unstyled.

```sh
curl --fail --silent --show-error https://rumia.pt/api/health
nc -zvw 3 rumia.pt 5432
```

The health check must return 200. The PostgreSQL connection must fail.

## Rollback

1. Point `/opt/apps/rumia/current` back to the previous verified release.
2. Restart only `rumia-web.service`.
3. If a data defect cannot be repaired with a forward migration, restore the verified R2 backup into a separate database, verify it, and schedule a controlled database replacement.
4. Do not restart, roll back, or reconfigure Lumes as part of Rumia rollback.

See [the archived VPS self-hosted migration record](../superpowers/archive/plans/2026-07-11-rumia-vps-self-hosted-migration.md) for the completed execution order.

See [the cutover evidence record](cutover-evidence.md) for the current
rehearsal evidence and the remaining owner-controlled gates.
