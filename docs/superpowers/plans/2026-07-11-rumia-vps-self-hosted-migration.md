# Rumia VPS Self-Hosted Migration Implementation Plan

> **For agentic workers:** Execute inline, one checked task at a time. This plan affects a shared production VPS; do not use subagents, do not apply a host change without the owner's confirmation, and do not stage or commit unrelated worktree changes.

**Goal:** Replace Rumia's Supabase backend with a self-hosted PostgreSQL/Better Auth/Drizzle stack on the existing VPS while preserving Lumes availability and keeping every Rumia private service off the public network.

**Architecture:** The Mac runs local development and migration rehearsal. The VPS uses Caddy as its only ingress, a Node 24 Next.js standalone service at `127.0.0.1:3002`, native PostgreSQL 17 with PostGIS, Better Auth inside the web application, Drizzle for server-only data access, and a future systemd worker/timer backed by a PostgreSQL outbox. Cloudflare R2 stores encrypted backups and later export/media objects.

**Tech Stack:** Debian 13, systemd, Caddy, Node 24, Next.js 16, React 19, PostgreSQL 17, PostGIS 3.5, pgvector 0.8, pg_trgm, Drizzle ORM, Better Auth, Restic, Cloudflare R2, Stripe/Resend/PostHog only after their existing product gates.

## Global Constraints

- The VPS is shared with Lumes. Do not modify, restart, rebuild, move, or expose the Lumes service without a separate explicit request.
- Caddy remains the only public ingress. UFW continues to allow only 22, 80, and 443.
- PostgreSQL must listen only on a Unix socket and `127.0.0.1`; never add a public 5432 rule.
- Do not install Docker or Podman on the VPS. Native systemd is the approved operating model.
- The browser never holds a database credential and never connects directly to PostgreSQL.
- The `rumia_app` runtime role must not have superuser, `CREATEDB`, `CREATEROLE`, `REPLICATION`, or `BYPASSRLS` privileges.
- Maintain Supabase as read-only rollback evidence until the PostgreSQL replacement passes schema, fixture, authorization, backup-restore, and journey checks.
- The current worktree has unrelated uncommitted R1/R2 changes. Preserve them and do not use reset, checkout, clean, or broad formatting commands.
- Do not enable public persistence, accounts, payments, email, worker jobs, uploads, or semantic search until the corresponding release gate passes.

## Target File Structure

| Path | Responsibility |
| --- | --- |
| `drizzle.config.ts` | Drizzle Kit configuration using an owner-only migration URL outside runtime browser config. |
| `packages/db/src/schema/` | Drizzle table definitions grouped by auth, content, trips, operations, and commerce. |
| `packages/db/src/connection.ts` | Server-only PostgreSQL pool and Drizzle client created from `DATABASE_URL`. |
| `packages/db/src/actor.ts` | Typed actor-scoped repository boundary used by every traveler/reviewer/admin query. |
| `packages/auth/src/server.ts` | Better Auth server configuration and PostgreSQL adapter. |
| `packages/auth/src/client.ts` | Browser-safe Better Auth client only; no database configuration. |
| `apps/web/app/api/auth/[...all]/route.ts` | Better Auth Next.js route handler. |
| `apps/web/lib/auth/session.ts` | Next.js session and role/capability adapter replacing `apps/web/lib/supabase/*`. |
| `drizzle/` | Generated, append-only SQL migrations and migration journal. |
| `scripts/run-postgres-policy-tests.mjs` | Fixture-based authorization contract runner against PostgreSQL. |
| `ops/vps/` | Versioned Caddy fragment, systemd units, deployment, backup, and restore scripts. |
| `/etc/rumia/*.env` on the VPS | Root-owned secrets; never committed or copied into browser variables. |

## Task 1: Freeze the Supabase activation path and record the cutover boundary

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `supabase/README.md`
- Modify: `docs/ops/launch.md`
- Create: `docs/ops/supabase-retirement.md`

**Consumes:** The VPS platform design and canonical activity plan.

**Produces:** One explicit rule: no new feature or deployment depends on the hosted Supabase project; it remains read-only rollback evidence.

- [x] **Step 1: Write the failing configuration test**

Add a test to `packages/config/src/config-optional.test.ts` that expects local development to accept `DATABASE_URL` and `BETTER_AUTH_SECRET` without any `SUPABASE_*` variable:

```ts
expect(createPublicConfig().appUrl).toBe("http://127.0.0.1:3105");
expect(createServerDatabaseConfig().databaseUrl).toBe("postgresql://rumia_app:test@127.0.0.1:5432/rumia");
```

- [x] **Step 2: Run the focused test to prove the current configuration fails**

Run: `pnpm exec vitest run packages/config/src/config-optional.test.ts`

Expected: failure because the current configuration requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

- [x] **Step 3: Write the retirement runbook**

Document the exact retention rule in `docs/ops/supabase-retirement.md`:

```markdown
1. Disable all write paths to the hosted project.
2. Export schema and any authorized data snapshot without storing credentials in the repository.
3. Record table counts and a SHA-256 checksum for every export artifact.
4. Keep the hosted project read-only until PostgreSQL migration, authorization, and restore evidence is accepted.
5. Delete hosted secrets and project only after the rollback window expires.
```

- [x] **Step 4: Make launch documentation PostgreSQL-first**

Replace Supabase launch prerequisites with the private PostgreSQL, R2 backup restore, Better Auth, and Caddy health gates. Keep historical Supabase migration files listed only as source material for the new Drizzle schema, not as a production deployment instruction.

- [x] **Step 5: Run the documentation check and preserve the intentional red test**

Run: `git diff --check && pnpm exec vitest run packages/config/src/config-optional.test.ts`

Verified 2026-07-11: whitespace validation and the replacement database-config test pass. No documentation tells an operator to apply a new hosted Supabase migration.

## Task 2: Make the VPS safe for a second production workload

**Files:**
- Create: `ops/vps/rumia-web.service`
- Create: `ops/vps/rumia-worker.service`
- Create: `ops/vps/rumia-worker.timer`
- Create: `ops/vps/rumia.caddy`
- Create: `ops/vps/backup-rumia.sh`
- Create: `ops/vps/restore-rumia-check.sh`
- Create: `ops/vps/README.md`

**Consumes:** The existing Caddy/UFW/Lumes host audit.

**Produces:** A non-root Rumia runtime, encrypted off-server recovery path, and systemd/Caddy assets that do not alter Lumes.

- [x] **Step 1: Create a non-root host identity and directories after owner confirmation**

Run on the VPS only after approval:

```sh
adduser --system --group --home /opt/apps/rumia --shell /usr/sbin/nologin rumia
install -d -o rumia -g rumia -m 0750 /opt/apps/rumia/releases /var/lib/rumia /var/log/rumia
install -d -o root -g rumia -m 0750 /etc/rumia
```

Verify:

```sh
id rumia
stat -c '%U:%G %a %n' /opt/apps/rumia /var/lib/rumia /etc/rumia
```

Expected: `rumia` cannot log in interactively and has write access only to its application directories.

- [x] **Step 2: Add swap and verify it without changing Lumes**

Run on the VPS only after approval:

```sh
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
printf '/swapfile none swap sw 0 0\n' >> /etc/fstab
```

Verify: `swapon --show` reports a 2 GiB file and `free -h` reports non-zero swap.

- [x] **Step 3: Install native PostgreSQL and required extensions**

Run on the VPS only after backup preparation is approved:

```sh
apt-get update
apt-get install -y postgresql-17 postgresql-17-postgis-3 postgresql-17-pgvector postgresql-contrib restic
```

Set PostgreSQL `listen_addresses = '127.0.0.1'` and `password_encryption = 'scram-sha-256'` in the PostgreSQL 17 configuration, then restart only PostgreSQL.

Verify:

```sh
ss -ltnp | grep 5432
sudo -u postgres psql -d postgres -c 'show listen_addresses'
```

Expected: the listener is loopback-only and the setting reports `127.0.0.1`.

- [x] **Step 4: Install a verified Node 24 runtime for the Rumia service**

Download the `linux-x64.tar.xz` asset named by the official `latest-v24.x/SHASUMS256.txt`, verify its SHA-256 against that manifest, and extract it below a versioned directory such as `/opt/node-v24.*/`. Do not replace `/usr/bin/node` or add a global `/usr/local/bin/node` symlink: the Rumia systemd units must use the versioned absolute runtime path. The existing Debian Node 22 installation and Lumes runtime remain untouched.

Verify:

```sh
/opt/node-v24.18.0/bin/node --version
sudo -u lumes /usr/bin/node --version
```

Expected: Rumia resolves a `v24.*` runtime through its absolute unit path while Lumes keeps its existing Node/Bun runtime unchanged.

- [x] **Step 5: Provision PostgreSQL roles, database, extensions, and grants**

Run once as PostgreSQL superuser from a root-owned SQL file with mode `0600`. Because the `postgres` OS account cannot read a root-only file, have root open the file and pipe it to `sudo -u postgres psql`; do not use `psql --file` under the `postgres` account:

```sh
sudo -u postgres psql --set=owner_password="$owner_password" --set=app_password="$app_password" < /root/rumia-provision.sql
```

The SQL file contains only parameter references, never literal passwords, and is removed immediately after a successful run:

```sql
create role rumia_owner login noinherit password :'owner_password';
create role rumia_app login noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls password :'app_password';
create database rumia owner rumia_owner;
\connect rumia
create extension if not exists postgis;
create extension if not exists pg_trgm;
create extension if not exists vector;
revoke all on database rumia from public;
grant connect on database rumia to rumia_app;
alter role rumia_app in database rumia set search_path = authn, app, public;
```

Verify:

```sql
select extname, extversion from pg_extension where extname in ('postgis', 'pg_trgm', 'vector') order by extname;
select rolname, rolsuper, rolcreaterole, rolcreatedb, rolreplication, rolbypassrls from pg_roles where rolname = 'rumia_app';
```

Expected: all three extensions exist; every privileged boolean for `rumia_app` is false.

Verified 2026-07-11 on the VPS: `rumia_app` and `rumia_owner` are login roles with superuser, role-creation, database-creation, replication, and RLS-bypass privileges all false; `postgis`, `pg_trgm`, and `vector` are installed.

- [x] **Step 6: Configure encrypted external backup and prove a restore**

Create `/etc/rumia/backup.env` with mode `0600`, owner `root:root`, containing only `RESTIC_REPOSITORY`, `RESTIC_PASSWORD_FILE`, and R2 S3 credentials. Create a root-owned password file with mode `0600`. Create `/var/lib/rumia/backups` as `root:root` with mode `0700`; it is root-only transient backup staging and is not an application data directory.

`ops/vps/backup-rumia.sh` must execute:

```sh
set -eu
. /etc/rumia/backup.env
stamp=$(date -u +%Y%m%dT%H%M%SZ)
dump=/var/lib/rumia/backups/rumia-${stamp}.dump
install -d -o root -g root -m 0700 /var/lib/rumia/backups
# Root opens the protected staging file; PostgreSQL writes the dump to stdout.
sudo -u postgres pg_dump --format=custom --no-owner --no-privileges rumia > "$dump"
restic backup --tag rumia-postgres "$dump"
rm -f "$dump"
restic forget --keep-daily 14 --keep-weekly 8 --keep-monthly 12 --prune
```

`ops/vps/restore-rumia-check.sh` must restore the newest artifact into `rumia_restore_check`, execute `select postgis_full_version();`, then drop that database.

Verify: run both scripts and retain only the successful command output and timestamp, never the credentials.

Verified 2026-07-11: the private R2 bucket `rumia-backups-prod` is initialized as Restic repository `b213b6acb2`; snapshot `52de9966` was created by `backup-rumia.sh`, and `restore-rumia-check.sh` restored it into `rumia_restore_check`, validated `postgis_full_version()`, and cleaned up successfully. The scripts export sourced backup variables and hand the temporary restore tree to the `postgres` OS user before `pg_restore`. `/etc/rumia/backup.env` and the Restic password file are `0600 root:root`; staging cleanup left no `.dump` files. No public activation is allowed before the remaining release gates pass.

- [x] **Step 7: Define service isolation and Caddy routing**

Create `ops/vps/rumia-web.service` with these required directives:

```ini
[Service]
User=rumia
Group=rumia
Environment=HOSTNAME=127.0.0.1
Environment=PORT=3002
EnvironmentFile=/etc/rumia/web.env
WorkingDirectory=/opt/apps/rumia/current
ExecStart=/opt/node-v24.18.0/bin/node apps/web/.next/standalone/apps/web/server.js
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/var/lib/rumia /var/log/rumia
MemoryMax=1500M
CPUQuota=150%
```

Create `ops/vps/rumia.caddy`:

```caddyfile
rumia.pt, www.rumia.pt {
  encode zstd gzip
  reverse_proxy 127.0.0.1:3002
}
```

The install procedure first runs `caddy validate --config /etc/caddy/Caddyfile`, then reloads Caddy; it does not restart Lumes.

Verified 2026-07-11: the service unit passes `systemd-analyze verify` and the
Caddy fragment passes the VPS Caddy 2.6.2 Caddyfile adapter in temporary files.
Neither file has been installed or reloaded.

- [ ] **Step 8: Harden access after the deployment account is verified**

Set `X11Forwarding no` in a dedicated `/etc/ssh/sshd_config.d/rumia-hardening.conf`, validate with `sshd -t`, reload SSH, and prove a separate non-root key login before changing root SSH access. Do not disable root login in the same step.

## Task 3: Establish identical local and VPS PostgreSQL migration workflows

**Files:**
- Create: `drizzle.config.ts`
- Create: `drizzle/0000_initial_rumia.sql`
- Create: `packages/db/src/schema/index.ts`
- Create: `packages/db/src/connection.ts`
- Create: `scripts/db-migrate.mjs`
- Create: `scripts/db-reset.mjs`
- Modify: `package.json`
- Modify: `.env.example`
- Modify: `scripts/README.md`
- Modify: `packages/config/src/public.ts`
- Modify: `packages/config/src/server.ts`

**Consumes:** PostgreSQL 17/PostGIS/pgvector on the Mac and VPS.

**Produces:** One forward-only Drizzle migration stream that creates the Rumia schema without Supabase services.

- [x] **Step 1: Add failing connection/config tests**

Create `packages/db/src/connection.test.ts`:

```ts
it('rejects missing DATABASE_URL without mentioning Supabase', () => {
  expect(() => createDatabaseConfig({})).toThrow('Missing required environment variable: DATABASE_URL');
});
```

Create a matching `packages/config` test for `BETTER_AUTH_SECRET` being server-only.

- [x] **Step 2: Add dependencies and migration commands**

Add `drizzle-orm`, `drizzle-kit`, `pg`, `better-auth`, and the required type packages. Replace root scripts with:

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "node scripts/db-migrate.mjs",
  "db:reset": "node scripts/db-reset.mjs",
  "test:db-policy": "node scripts/run-postgres-policy-tests.mjs"
}
```

Do not remove the Supabase CLI dependency yet; it remains until the replacement test suite is green.

- [x] **Step 3: Define explicit schema namespaces and initial tables**

Use PostgreSQL schemas named `authn`, `app`, and `private`. Better Auth owns tables in `authn`; Rumia product tables live in `app`; migration helpers and non-exposed internal records live in `private`.

`0000_initial_rumia.sql` must create the roles/schema grants, `app.user_profiles`, `app.capability_grants`, `app.places`, `app.editorial_activity_profiles`, `app.saved_activity_days`, `app.saved_activity_selections`, `app.trip_briefs`, `app.trips`, `app.reviewer_assignments`, `app.payment_webhook_events`, `app.activity_feedback`, and `private.job_outbox` with explicit primary keys, timestamps, ownership columns, foreign keys, checks, and indexes.

Use `geography(Point, 4326)` for `app.places.coordinates`, a GIST index for geographic lookup, and leave embeddings nullable until the semantic retrieval release.

For traveler-owned tables, enable RLS, revoke `PUBLIC` privileges, and add owner policies that compare `owner_user_id` to the transaction actor setting. The only code path that sets that actor setting is the server-only `withActor()` transaction helper introduced in Task 5. The migration must also deny the `rumia_app` role direct access to `private`.

- [x] **Step 4: Implement the server-only Drizzle client**

`packages/db/src/connection.ts` must enforce a server import boundary and use a singleton pool:

```ts
import 'server-only';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const pool = new Pool({ connectionString: createDatabaseConfig(process.env).databaseUrl, max: 10 });
export const db = drizzle({ client: pool });
```

The pool must never be imported by a Client Component.

- [x] **Step 5: Prove local/VPS parity**

Run on the Mac and, after owner approval, on the VPS:

```sh
pnpm db:migrate
psql "$DATABASE_URL" -c "select extname from pg_extension where extname in ('postgis','pg_trgm','vector') order by extname"
```

Expected: the same migration journal and extension list in both environments.

Verified 2026-07-11: local and VPS journals each contain 15 migrations and both expose `pg_trgm`, `postgis`, and `vector`.

## Task 4: Replace Supabase Auth with Better Auth

**Files:**
- Create: `packages/auth/src/server.ts`
- Create: `packages/auth/src/client.ts`
- Create: `apps/web/app/api/auth/[...all]/route.ts`
- Create: `apps/web/lib/auth/session.ts`
- Modify: `apps/web/app/sign-in/_actions/sign-in.ts`
- Modify: `apps/web/app/(app)/account/_actions/sign-out.ts`
- Modify: `apps/web/app/sign-in/page.tsx`
- Modify: `apps/web/app/(app)/account/page.tsx`
- Remove after replacement tests pass: `apps/web/lib/supabase/`

**Consumes:** `authn` database schema, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, and server-only `DATABASE_URL`.

**Produces:** Cookie-backed Better Auth sessions and one `getCurrentSession()` primitive for all protected Rumia paths.

- [x] **Step 1: Add failing session tests**

Create `apps/web/lib/auth/session.test.ts`:

```ts
it('returns null without a session and never exposes a database client', async () => {
  await expect(getCurrentSession()).resolves.toBeNull();
});
```

Add route tests for valid login, invalid credentials, sign out, redirect preservation, and a forged cookie returning unauthenticated.

- [x] **Step 2: Configure Better Auth on PostgreSQL**

`packages/auth/src/server.ts` must mount Better Auth with PostgreSQL and secure cookie settings:

```ts
export const auth = betterAuth({
  database: new Pool({ connectionString: createDatabaseConfig(process.env).databaseUrl }),
  secret: requireServerEnv('BETTER_AUTH_SECRET'),
  baseURL: createPublicConfig().appUrl,
  emailAndPassword: { enabled: true },
  plugins: [nextCookies()]
});
```

`apps/web/app/api/auth/[...all]/route.ts` exports `GET` and `POST` from `toNextJsHandler(auth)`.

- [x] **Step 3: Replace session consumers in one vertical slice**

Implement `getCurrentSession()` using `auth.api.getSession({ headers: await headers() })`, then migrate sign-in, sign-out, account, reviewer, and admin layouts to that helper. Preserve the existing `AuthorizedActor` capability type; only the session source changes. Reviewer/admin data reads still use the explicitly marked legacy client bridge until their Task 5 repositories are ported; they no longer use Supabase as the identity/session source.

- [x] **Step 4: Run auth proof**

Run: `pnpm exec vitest run apps/web/lib/auth apps/web/app/sign-in packages/auth`

Expected: login/session/sign-out tests pass without importing `@supabase/ssr` or `@supabase/supabase-js`.

Verified 2026-07-11: session, sign-in, sign-out, forged-cookie, Better Auth PostgreSQL, and role-layout consumer tests pass (9 focused tests).

## Task 5: Replace the data-access layer and authorization contracts

**Files:**
- Create: `packages/db/src/actor.ts`
- Create: `packages/db/src/trips.ts`
- Create: `packages/db/src/activity-days.ts`
- Create: `packages/db/src/feedback.ts`
- Modify: `packages/db/src/access-control.ts`
- Modify: `packages/db/src/places.ts`
- Modify: `packages/db/src/roles.ts`
- Modify: `scripts/run-policy-tests.mjs`
- Rename: `scripts/run-policy-tests.mjs` to `scripts/run-postgres-policy-tests.mjs`
- Modify: all route handlers found by `rg -l 'createServerSupabaseClient|resolvePrivilegedServerDataClient|@supabase' apps packages`

**Consumes:** Better Auth session IDs and Drizzle schema.

**Produces:** Typed actor-scoped repositories; no route or page has a database client capable of unrestricted browser-derived access.

- [x] **Step 1: Write cross-owner failures first**

Add contract cases for traveler A attempting to read/update/delete traveler B's saved day and trip, an unassigned reviewer attempting to read a trip, and a wrong-organization admin request. Each case must expect the same not-found result as a nonexistent resource.

- [x] **Step 2: Define the actor-scoped interface**

`packages/db/src/actor.ts` exposes:

```ts
export type DatabaseActor = { userId: string; roles: readonly AppRole[]; capabilities: readonly Capability[]; reviewerId: string | null };
export type ActorDb = { actor: DatabaseActor; db: typeof db };
export async function requireActor(userId: string): Promise<DatabaseActor>;
export async function withActor<T>(actor: DatabaseActor, work: (actorDb: ActorDb) => Promise<T>): Promise<T>;
```

`withActor()` opens one transaction, executes `select set_config('app.actor_id', ${actor.userId}, true)`, and calls `work()` with the transaction-scoped client. All traveler-owned repository methods accept `ActorDb`, not a raw user ID supplied by a client request.

- [x] **Step 3: Port repositories one bounded domain at a time**

Progress (2026-07-11): the actor/profile boundary, anonymous activity feedback,
Portugal places/editorial reads and writes, audit events, traveler trip-draft
creation/list/detail paths, saved activity days/selections, reviewer assignment
reads/writes, partner/region/admin operations, console messages/events/pipeline,
triage, specialist profiles, and payment ledger now have PostgreSQL/Drizzle
implementations with local integration proof. All production route/page callers
pass an actor-scoped option; the explicit-client bridge remains only as a
test-compatibility seam and throws when invoked without a client. Migration
journals and RLS policy tests pass in both local and VPS databases.

Port in this order: profiles/capabilities → places/editorial activity data → activity feedback → saved activity days → trip briefs/trips → reviewer assignments → partner/region/admin operations → payment webhook ledger → messaging/export jobs. Preserve existing public TypeScript return types where possible so UI changes remain mechanical.

- [x] **Step 4: Replace Supabase RPCs with transaction functions**

Progress (2026-07-11): UUID-backed payment fulfillment, trip creation,
assignment completion, reviewer operations, and console mutations use
actor-scoped PostgreSQL transaction functions. The legacy numeric/explicit
client paths remain only for existing unit-test fixtures; no production caller
uses them.

For payment fulfillment, trip creation, assignment completion, and other former RPC calls, use `db.transaction(async (tx) => { ... })`, explicit `for update` locking where idempotency is required, unique event IDs for webhooks, and typed return values. Never emulate a service role by accepting an arbitrary actor ID.

- [x] **Step 5: Prove authorization and spatial behavior**

Run:

```sh
pnpm test:db-policy
pnpm exec vitest run packages/db apps/web/app/api
psql "$DATABASE_URL" -c "explain analyze select id from app.places order by coordinates <-> st_setsrid(st_makepoint(-8.61,41.15),4326)::geography limit 5"
```

Expected: cross-owner tests deny access; the query plan uses the GIST index after seed data exists.

Verified 2026-07-11: local PostgreSQL policy tests passed, the focused DB/API suite passed, and `EXPLAIN (COSTS OFF)` selected `app_places_coordinates_gist` for the nearest-place query. The same policy runner and 15-migration/extension parity were also exercised against the VPS database.

## Task 6: Remove Supabase from configuration, browser code, fixtures, and documentation

**Files:**
- Modify: `packages/config/src/public.ts`
- Modify: `packages/config/src/server.ts`
- Modify: `packages/config/src/health.ts`
- Modify: `.env.example`
- Modify: `apps/web/package.json`
- Modify: `packages/db/package.json`
- Modify: `package.json`
- Modify: `apps/web/playwright/global-setup.ts`
- Modify: `apps/web/playwright/tests/smoke.spec.ts`
- Remove: `apps/web/lib/supabase/`
- Retain as read-only rollback evidence until the Task 8 expiry decision: `supabase/`

**Consumes:** passing Better Auth, Drizzle, and policy tests.

**Produces:** no Supabase runtime or build dependency and no Supabase secret in any deployment environment.

- [x] **Step 1: Replace configuration types**

Replace the `supabase` server/public configuration blocks with:

```ts
export type ServerDatabaseConfig = { databaseUrl: string };
export type ServerAuthConfig = { betterAuthSecret: string };
```

`DATABASE_URL` and `BETTER_AUTH_SECRET` are server-only. `.env.example` must contain neither a Supabase URL/key nor a `NEXT_PUBLIC_DATABASE_URL`.

- [x] **Step 2: Port Playwright fixtures to Better Auth**

Create test users through the Better Auth test helper or the PostgreSQL fixture loader. Never create them through an HTTP route that accepts arbitrary roles. Seed roles/capabilities directly through the owner-only fixture path.

- [x] **Step 3: Remove dependencies only after zero-reference proof**

Run:

```sh
rg -n '@supabase|SUPABASE_|createServerSupabaseClient|createClient\(' apps packages scripts --glob '!**/*.md'
```

Verified 2026-07-11: the scan returns no runtime/configuration result; `apps/web/lib/supabase/` and hosted Supabase package dependencies are removed. The historical `supabase/` directory remains read-only rollback evidence by design.

- [x] **Step 4: Run the complete local gate**

Run:

```sh
pnpm repo:safety
pnpm check:migrations
pnpm test:unit
pnpm lint
pnpm build
pnpm test:db-policy
pnpm test:e2e
pnpm test:a11y
git diff --check
```

Verified 2026-07-13: all listed gates pass; the unit suite is 170 files/882 tests, the full browser smoke suite is 303 passed/33 intentional skips, the visual matrix is 104 passed/32 intentional skips, the dedicated accessibility matrix is 61 passed/1 expected skip, the performance matrix is 14 passed, and the tablet contract is 120/120 at 1024×768 and 768×768. `check:migrations` validates Drizzle migration order rather than Supabase CLI history.

## Task 7: Deploy Rumia safely beside Lumes

**Files:**
- Create: `ops/vps/deploy-rumia.sh`
- Modify: `apps/web/next.config.ts`
- Modify: `docs/ops/deploy-rollback.md`
- Modify: `docs/ops/launch.md`

**Consumes:** a passing local build, verified backups, and approved VPS service assets.

**Produces:** an atomic private Rumia release on loopback with a rollback that
does not modify Lumes; public `rumia.pt` ingress is optional future work.

Current owner decision: public `rumia.pt` ingress is deferred. The active
release is private loopback-only on `127.0.0.1:3002`; Caddy, DNS, and external
HTTPS are future work and are not required for this private phase.

Progress (2026-07-11): the versioned release/rollback wrapper exists, passes
shell syntax validation, and now waits up to 30 seconds for the loopback health
endpoint before rolling back. The approved release is active privately on the
VPS with `/etc/rumia/web.env`, `rumia-web.service`, and port 3002 verified;
DNS/Caddy/public smoke is deferred by the owner.

- [x] **Step 1: Enable standalone Next output and test it locally**

Set `output: 'standalone'` in `apps/web/next.config.ts` with the workspace tracing root so the monorepo artifact is deterministic. Run the production build with the PostgreSQL/Better Auth environment, verify `apps/web/.next/standalone/apps/web/server.js`, and copy the browser assets into the nested standalone app that owns the server process: `apps/web/.next/standalone/apps/web/.next/static/` and `apps/web/.next/standalone/apps/web/public/`. Starting the artifact locally on loopback must verify both the HTML and at least one `/_next/static/*.css` response (the original VPS artifact passed `/` but omitted the nested assets, which produced an unstyled page). Direct `zod` imports are declared in the web, AI, and DB package manifests so the tracing-root build does not depend on a parent checkout's hoisted modules.

- [x] **Step 2: Create versioned release deployment**

`ops/vps/deploy-rumia.sh` accepts a prebuilt release directory, verifies the standalone server plus its nested static/public asset directories, copies it to `/opt/apps/rumia/releases/<git-sha>`, validates ownership, atomically updates `/opt/apps/rumia/current`, restarts only `rumia-web.service`, then polls `http://127.0.0.1:3002/api/health`.

The wrapper retries the loopback health endpoint for up to 30 seconds. On
failure, it restores the prior symlink and restarts only `rumia-web.service`.

Verified 2026-07-13: release `20260713T0128Z-provider-gate` is active, the service
is enabled, `/api/health`, `/`, `/portugal`, `/support`, and
`/api/auth/get-session` return HTTP 200 on port 3002, and the stylesheet and
JavaScript URLs emitted by `/` return HTTP 200 through the private Mac tunnel
on port 3302. Lumes remains on port 3001. The runtime `NEXT_PUBLIC_APP_URL` is now
`http://127.0.0.1:3002` for the private phase.

- [ ] **Step 3: Install Caddy route after loopback smoke test (deferred)**

Start Rumia on loopback, verify `curl --fail http://127.0.0.1:3002/api/health`, install the Rumia Caddy fragment, run `caddy validate`, then reload Caddy. Do not restart the Caddy process and do not touch Lumes configuration.

Owner-deferred: no `rumia.pt` domain for this phase. The asset syntax is
validated, but Caddy installation and reload are intentionally postponed.

- [ ] **Step 4: Run external and negative-network smoke checks (deferred)**

Run from a machine outside the VPS:

```sh
curl --fail --silent --show-error https://rumia.pt/api/health
nc -zvw 3 rumia.pt 5432
```

Expected when public ingress is later enabled: health returns 200; the
PostgreSQL connection fails. These checks are not applicable to the current
private loopback-only release.

- [x] **Step 5: Record rollback evidence**

Progress (2026-07-11): `docs/ops/deploy-rollback.md` documents the
application symlink rollback, bounded health retry, forward-only database
policy, and verified R2 restore evidence.

Update `docs/ops/deploy-rollback.md` with release symlink rollback, database forward-fix policy, and restore-from-R2 steps. Do not describe Supabase PITR or Vercel rollback as Rumia production procedures.

## Task 8: Enable features in product order and retire the hosted project

**Files:**
- Modify: `docs/ops/launch.md`
- Modify: `docs/roadmap.md`
- Modify: `docs/master-roadmap.md`
- Create: `docs/ops/cutover-evidence.md`

**Consumes:** deployed VPS stack and all preceding evidence.

**Produces:** controlled public activation and an auditable Supabase retirement decision.

Progress (2026-07-13): `docs/ops/cutover-evidence.md` now records the
verified rehearsal evidence and the owner-controlled gates. No public
activation or hosted-project retirement is claimed.

- [ ] **Step 1: Deploy public reviewed activity discovery first**

Enable only the static/reviewed Portugal corpus, anonymous URL day state, and privacy-safe event instrumentation. Do not require sign-in, stored days, payments, or worker jobs for this release.

- [ ] **Step 2: Apply the validation threshold**

Continue to persisted saved days only after the canonical thresholds are met: 100 completed activity briefs, more than 40% brief completion, more than 30% plan save/share, 15 real-trip users, five accommodation tests, and ten upgraded-plan payment signals.

- [ ] **Step 3: Enable persistence and jobs independently**

Enable Better Auth and saved days after cross-owner tests. Enable the worker only after durable outbox/dead-letter tests. Enable Stripe, email, uploads, reviewer operations, and B2B only after their existing authorization and rollback gates pass.

- [ ] **Step 4: Close the Supabase rollback window**

Record export checksums, PostgreSQL table counts, user-facing journey evidence, successful R2 restore evidence, and a chosen rollback-expiry date in `docs/ops/cutover-evidence.md`. Only after that date and an explicit owner decision may credentials be rotated/deleted and the hosted project be deleted.

## Execution checkpoint — 2026-07-11

- Local and VPS databases now share 15 Drizzle migrations; both expose `pg_trgm`, PostGIS, and pgvector.
- Better Auth, actor-scoped Drizzle repositories, saved activity days, reviewer assignments, console/triage operations, and UUID-backed payment fulfillment have local integration proof; production callers pass actors and the legacy explicit-client seam is test-only.
- The final local gate is green: 170 unit files / 882 tests, full typecheck, lint, build, migration check, PostgreSQL policy tests, repository safety, visual/performance checks, tablet contract, and diff hygiene.
- Full Playwright smoke is green: 303 passed / 33 intentional desktop skips. Visual baselines are aligned with the current Portugal-wide activity-first Rumia design; the standalone `/api/health` smoke returns HTTP 200 with a ready database.
- The VPS remains private and safe: PostgreSQL is loopback-only, `rumia_app` and `rumia_owner` have no elevated role flags, the verified backup and web environments are installed, Rumia is enabled only on loopback port 3002, Caddy has not been changed, and Lumes remains on port 3001 and untouched.
- Public DNS/Caddy/HTTPS gates are explicitly deferred by the owner. Remaining
  future work is SSH-hardening account verification, threshold-based feature
  enablement, and the eventual public-ingress decision.

## Plan Self-Review

- **Coverage:** the plan covers host isolation, local parity, native PostgreSQL, backup/restore, Better Auth, Drizzle data migration, authorization, Supabase removal, deployment, controlled activation, and eventual hosted-project retirement.
- **Safety:** future service, release, and public-ingress mutations remain deferred to execution-time owner approval; no task exposes PostgreSQL or restarts Lumes.
- **Ordering:** backups and private database setup precede data migration; auth precedes actor-scoped repositories; contract tests precede dependency removal; loopback health checks precede Caddy routing; evidence precedes hosted-project deletion.
- **Known decision:** Docker is intentionally excluded on this shared VPS. Revisit only if Rumia moves to its own host or the owner explicitly changes this architecture.
