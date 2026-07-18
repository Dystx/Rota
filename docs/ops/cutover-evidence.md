# Rumia cutover evidence

Status: **private deployment complete; public ingress deferred by owner**

This record separates evidence gathered during the local/VPS rehearsal from
the gates that require external credentials or an explicit owner decision. It
must not be read as evidence that Rumia is publicly deployed.

## Rehearsal identity

- Date: 2026-07-13 (cinematic frontend refresh; prior database and service evidence remains
  dated 2026-07-11/12 below)
- Worktree: `/Users/cheng/rota`
- Branch: `main`
- Source baseline: `main @ 4b394905` plus the approved dirty-worktree
  cinematic tranche; release artifact identity is recorded below.
- Public activation: not performed
- Private Rumia service: enabled on `127.0.0.1:3002`, release
  `20260713T204125Z-cinematic-fix`
- Private runtime URL: `http://127.0.0.1:3002`
- Lumes mutation: none

## Current release boundary audit

- The implementation was merged to `main` and pushed to the canonical
  `Dystx/Rota` repository. The release was built from that exact commit; no
  feature-branch deployment was attempted.
- A standalone release artifact was prepared with the required nested Next
  assets (`server.js`, `.next/static`, and `public`) and passed the
  artifact-shape checks. The artifact is active on the VPS.
- VPS audit after the cinematic refresh: Rumia is healthy and active on
  `127.0.0.1:3002`, with the current symlink pointing to release
  `20260713T204125Z-cinematic-fix`. Lumes remains healthy on `0.0.0.0:3001`; no
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
- The private cutover is complete. Remaining external work is the
  owner/legal map-provider decision packet and, separately, public ingress;
  public `rumia.pt` remains deferred.

### Local visual-hardening candidate — 2026-07-18

- Local candidate checkpoint: `7cf4a19` on
  `codex/rumia-visual-hardening`. Its production source change is `7c01a23`;
  the Task 3 ledger checkpoint is `af2dd19`. The exact artifact was built after
  both and reused unchanged through the approval and final-gate sequence.
- Exact local receipt: build `yOnVK7qbn55IFxrzqRCkV`, digest
  `001ad401de23721cde98ef35643bd9abc38c16f63fd8de34ad13c70a30248867`,
  phase `final`, created `2026-07-18T04:35:41.299Z`, with 743 receipt files.
  Final gate: 1,643 non-visual passed with 2,433 intentional skips; 102 visual
  passed with 306 intentional skips; port 3105 was closed.
- This is a local release-ready candidate and is **not deployed**. The Task 6
  documentation commit is not inside this already-built artifact and is
  recorded separately in its task report after commit.
- The active private VPS release remains
  `20260713T204125Z-cinematic-fix` on `127.0.0.1:3002`; public DNS/Caddy
  ingress remains deferred. No VPS service, Caddy, DNS, or ingress mutation was
  made for this local candidate.

### Local final-review fix candidate — 2026-07-18

- Source fix: `1e4786d3a4cdcb6570f98ee4548e4bcaa1ecf6d9`, tree
  `3533320ea135cfb0d8131b6da8e653e5b5680646`, on
  `codex/rumia-visual-hardening`. Candidate creation recorded tracked-clean
  source and rejected changes outside the intentionally untracked `output/`
  evidence root.
- Exact local receipt: schema 2, build `j4CxzJH3lYqvjoIzeD9o-`, digest
  `e079b2cd79032599315a24bad318cb31d04626ac1032b64752ff0e4de968d22c`,
  created `2026-07-18T06:06:02.144Z`, with 2,622 regular-file/symlink
  inventory entries across the complete standalone tree. Pre-approval and
  final verification retained the same identity and did not recopy served
  assets.
- Bounded Console pre-approval passed 6 non-visual and 2 visual checks, with 18
  and 6 intentional skips. The complete final phase passed 1,640 non-visual
  checks, skipped 2,433, and failed 3 intermittent Itineraries transition-state
  Axe checks. The harness did not run visual after that failure; a supplemental
  complete visual run against the unchanged receipt-bound candidate passed 102
  with 306 intentional skips and no snapshot updates.
- This final-review candidate is **not release-ready and not deployed**. The
  active private VPS release remains `20260713T204125Z-cinematic-fix`; no VPS
  service, Caddy, DNS, ingress, schema, environment, dependency, or product
  behavior mutation was made. Port 3105 is closed.

### Cinematic frontend refresh — 2026-07-13

- Local full unit suite passed at **177 files / 897 tests**; web typecheck and
  production build passed with **64 routes**. Asset, motion, diff, live
  autoplay, reduced-motion, console, and media-byte checks passed.
- The exact standalone artifact was uploaded and activated atomically as
  `20260713T204125Z-cinematic-fix` with
  `/usr/local/sbin/deploy-rumia.sh`; only `rumia-web.service` was restarted.
- Loopback health returned `{"status":"ok","database":"ready"}`. The
  rendered CSS returned HTTP 200 with `text/css`, and both local MP4 derivatives
  returned HTTP 200 as `video/mp4` at 565,629 and 1,276,925 bytes.
- Through the temporary `127.0.0.1:33302` tunnel, desktop/mobile route smoke
  passed for `/`, `/portugal`, `/explore`, `/explore/workspace`, `/planner`,
  `/support`, `/sign-in`, and the activity detail. Each route had one H1/main,
  no horizontal overflow, and no console/page errors. Reduced-motion rendered
  poster-only media.
- The activity situation → save → chosen day → feedback flow completed through
  the deployed artifact. The homepage proof rail was made pointer-transparent
  after the first remote interaction smoke found it intercepting the CTA.
- Port 3001/Lumes remained unchanged; no Caddy, DNS, or public ingress change
  was made.

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
- Deployed merged-artifact unit evidence: 171 files, 885 tests passed. The
  latest un-deployed local closeout adds the current **173 files / 890 tests**
  suite and **13/13** changed-slice suite; it is recorded separately from this
  private release and does not alter the VPS release identity.
- The deployed commit includes the proof-rail, pricing hierarchy, saved-plan
  editor, saved-traveler surface, and utility recovery UI slices. The release
  was built from the merged `main` commit after the full unit and production
  build gates passed.
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
  than a blank canvas; export state chips have explicit contrast. These checks
  are represented by the deployed release.
- The local current-source utility recovery pass covers `/offline`,
  `/feedback`, `/sign-in`, and `/support` at 1440×900 and 393×852: all return
  200 with one H1/main, no horizontal overflow, no browser console errors, and
  no serious/critical axe findings. Offline now exposes recovery context,
  feedback controls show explicit selected/disabled states, and sign-in has a
  compact trust rail for privacy/editorial boundaries. These checks are
  represented by the deployed release.
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

- Release `20260713T042000Z-main-2a8c394` is the active `current` target. It places
  Next's static and public assets under the nested standalone app directory,
  matching the server's working directory.
- The local and remote standalone server entrypoints have the same SHA-256:
  `6c3fa489c72e7f8f160af78b2831b83bfea5a7eba8cbd62a209d811a0ea51608`.
- The release wrapper restarted only `rumia-web.service`, rolled forward
  atomically, and its health check returned `{"status":"ok","database":"ready"}`.
- Loopback/tunnel smoke returned HTTP 200 for `/`, `/explore`,
  `/explore/workspace`, `/planner`, `/portugal`, `/support`, `/sign-in`, and
  `/api/health` after the refresh.
- The homepage-emitted `/_next/static/*.css` URL returned HTTP 200 with
  `text/css; charset=UTF-8` through the temporary private Mac SSH tunnel on
  port `33302`.
- The temporary tunnel was closed after verification. Rumia remains loopback
  only on the VPS at `127.0.0.1:3002`; Lumes remains on `0.0.0.0:3001`.
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
