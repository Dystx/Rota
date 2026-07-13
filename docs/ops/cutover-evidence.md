# Rumia cutover evidence

Status: **private deployment complete; public ingress deferred by owner**

This record separates evidence gathered during the local/VPS rehearsal from
the gates that require external credentials or an explicit owner decision. It
must not be read as evidence that Rumia is publicly deployed.

## Rehearsal identity

- Date: 2026-07-13 (frontend refresh; prior database and service evidence remains
  dated 2026-07-11/12 below)
- Worktree: `/Users/cheng/rota/.worktrees/rumia-phase0`
- Branch: `codex/rumia-phase0`
- Public activation: not performed
- Private Rumia service: enabled on `127.0.0.1:3002`
- Private runtime URL: `http://127.0.0.1:3002`
- Lumes mutation: none

## Current release boundary audit

- The checked-out implementation remains on feature branch
  `codex/rumia-phase0` with uncommitted implementation changes; no
  feature-branch deployment was attempted.
- A standalone release candidate was prepared locally with the required
  nested Next assets (`server.js`, `.next/static`, and `public`) and passed
  the artifact-shape checks. The candidate is not active on the VPS.
- VPS read-only audit: Rumia is healthy and active on `127.0.0.1:3002`, with
  the current symlink still pointing to release
  `20260713T0128Z-provider-gate`. Lumes remains healthy on `0.0.0.0:3001`; no
  Lumes service restart or configuration change was performed.
- Map preflight listeners remain isolated to Rumia-owned loopback ports
  `3010`, `3011`, and `3012`; production map/story/3D flags remain disabled.
- The 2026-07-13 service audit confirms `rumia-web.service` and
  `postgresql.service` are active. The optional `rumia-worker.service` and
  `rumia-worker.timer` units are not installed or enabled because the active
  release does not contain `apps/worker/dist/worker.mjs`; no timer was
  enabled against a missing artifact.
- The configured backup files remain root-owned mode `0600`, Restic is
  installed, and the dedicated repository currently contains one snapshot.
  The documented restore check was rerun on 2026-07-13 and successfully
  restored the snapshot into `rumia_restore_check`, validated PostGIS, and
  removed its temporary database and dump staging files.
- The next cutover requires a reviewed release branch/merge plus the
  owner/legal map-provider decision packet. Public `rumia.pt` ingress remains
  deferred.

## Verified evidence

### Database and authorization

- Local and VPS Drizzle journals both contain 15 migrations.
- Local and VPS PostgreSQL expose `pg_trgm`, PostGIS, and pgvector.
- `rumia_app` and `rumia_owner` are login roles without superuser,
  `CREATEDB`, `CREATEROLE`, replication, or `BYPASSRLS` privileges.
- PostgreSQL listens on loopback/Unix socket; no public 5432 listener was
  opened.
- Local PostgreSQL policy tests pass, including cross-owner and role-boundary
  cases.

### Application and browser gates

- Better Auth session, sign-in, sign-out, forged-cookie, and role-layout tests
  pass.
- Runtime/configuration scan returns no `@supabase`, `SUPABASE_*`, or hosted
  Supabase client reference in `apps`, `packages`, or `scripts`.
- `node scripts/check-runtime-architecture.mjs` passes and the CI workflow no
  longer starts or resets a hosted-Supabase-shaped local stack.
- Unit suite: 171 files, 885 tests passed (including the editorial proof-rail, map-panel, and schematic-fallback component tests).
- The current worktree also contains the subsequent proof-rail, pricing
  hierarchy, saved-plan editor, saved-traveler surface, and utility recovery UI
  slices; they are
  locally verified but are not represented by the deployed
  `20260713T0128Z-provider-gate` release.
- Full smoke browser suite: 303 passed, 33 intentional skips across desktop and
  mobile projects, rerun after the schematic spatial-fallback polish.
- Full visual matrix: 104 passed, 32 intentional skips; dedicated accessibility
  is 61 passed with 1 expected skip; performance matrix is 14 passed.
- Tablet contract: `@viewport-qa` **120/120 passed** at 1024×768 and 768×768;
  first-viewport captures are stored under
  `.sisyphus/evidence/future-roadmap/viewport-contract/`.
- Standalone build exists at
  `apps/web/.next/standalone/apps/web/server.js`.
- Local standalone smoke returned HTTP 200 for `/`, `/support`,
  `/api/auth/get-session`, and `/api/health`; health reported
  `{"status":"ok","database":"ready"}`.
- Visual baselines were regenerated and verified for the current Portugal-wide
  activity-first Rumia experience.
- The local current-source saved-traveler pass covers `/account`,
  `/trip/[tripId]`, `/trip/[tripId]/map`, and `/trip/[tripId]/export` at
  1440×900 and 393×852: all return 200 with one H1, no horizontal overflow,
  no browser console errors, and no serious/critical axe findings. The map
  details panel is labelled and keyboard discoverable; partial/unsourced map
  data renders a schematic fallback with the geometry status inline rather
  than a blank canvas; export state chips have explicit contrast. This evidence
  is local-only and does not alter the VPS release.
- The local current-source utility recovery pass covers `/offline`,
  `/feedback`, `/sign-in`, and `/support` at 1440×900 and 393×852: all return
  200 with one H1/main, no horizontal overflow, no browser console errors, and
  no serious/critical axe findings. Offline now exposes recovery context,
  feedback controls show explicit selected/disabled states, and sign-in has a
  compact trust rail for privacy/editorial boundaries. This evidence is
  local-only and does not alter the VPS release.
- The homepage uses a static Portugal context illustration; MapLibre and DEM
  terrain remain opt-in until the provider/licence gate is approved.
- A separate local standalone canary used `RUMIA_MAP_STYLE_URL` and the
  loopback Protomaps preflight through an SSH tunnel: map mode rendered, the
  activity/list equivalent remained visible, OSM/Protomaps attribution was
  present, and browser console errors were zero. This canary did not alter the
  deployed private flags or public ingress.

### VPS isolation

- `rumia` Unix identity and Node 24 runtime exist.
- Final read-only verification on 2026-07-12 confirms `rumia-web.service` is
  active and enabled (the unit is deliberately named `rumia-web.service`, not
  the shorthand `rumia`).
- Lumes remains on port 3001.
- Rumia listens only on `127.0.0.1:3002`; the service is enabled and serving
  the verified release.
- `/etc/rumia/web.env` is root-only (`0600`) and uses the private loopback
  runtime URL; the Rumia Caddy fragment is not installed because the owner
  deferred the `rumia.pt` domain and public ingress.
- `/etc/rumia/backup.env` and `/var/lib/rumia/backups` are root-only and
  installed for the verified backup gate; the staging directory is empty after
  cleanup.
- The installed systemd unit passes `systemd-analyze verify`; the Caddy
  fragment passes the VPS Caddyfile validator in temporary files but has not
  been installed or reloaded.

### Backup and restore

- Private R2 bucket: `rumia-backups-prod` (WEUR, Standard storage).
- Restic repository initialized successfully; repository ID is recorded in the
  migration plan, not in application configuration.
- Snapshot `52de9966` was created with tag `rumia-postgres`.
- `restore-rumia-check.sh` restored the snapshot into `rumia_restore_check`,
  validated `postgis_full_version()`, and exited successfully.
- The temporary database and local `.dump` staging file were removed after the
  check; no credential values are recorded here.

### Private deployment

- Release `20260713T0128Z-provider-gate` is the active `current` target. It places
  Next's static and public assets under the nested standalone app directory,
  matching the server's working directory.
- The local and remote standalone server entrypoints have the same SHA-256:
  `0ad9393852f225bdb93be2496f25ee79842cd9069b7cef5e5e4b0aa5d322f604`.
- The release wrapper restarted only `rumia-web.service`, rolled forward
  atomically, and its health check returned `{"status":"ok","database":"ready"}`.
- Loopback smoke returned HTTP 200 for `/`, `/portugal`, `/support`,
  `/api/health`, and `/api/auth/get-session` after the refresh.
- The homepage-emitted `/_next/static/*.css` URL returned HTTP 200 with
  `text/css; charset=UTF-8` through the private Mac tunnel on port 3302.
- A private SSH tunnel on Mac port 3302 returned the refreshed Rumia homepage
  and health responses; Mac port 3002 remains the separate local Lumes
  development server.
- Fresh desktop (1440px) and mobile (393px) browser checks against the tunnel
  passed for `/`, `/explore`, `/explore/workspace`, `/planner`, `/support`,
  `/sign-in`, and `/activities/porto-ribeira-slow-walk`: all returned 200, one
  visible H1, no horizontal overflow, and no console errors.
- Lumes remains on `0.0.0.0:3001`; no Lumes process, unit, or port was changed.

## Deferred public-phase gates

These items are intentionally deferred and are not blockers for the private
loopback release:

1. If public ingress is later approved, point `rumia.pt` and `www.rumia.pt`
   DNS records at this VPS, then validate
   and reload the Caddy fragment without touching Lumes.
2. Run external HTTPS health and negative PostgreSQL-network checks.
3. Verify the deployment account before applying the optional SSH-hardening
   step.
4. Record the public activation date, threshold decision, rollback-expiry
   date, and explicit Supabase retirement decision.

Until public ingress is explicitly approved, the hosted Supabase project
remains read-only rollback evidence and Rumia remains private on the VPS.
