# Rumia VPS Platform Design

**Status:** Approved direction · private release verified · public ingress deferred

## Decision

Rumia will retire Supabase across its future architecture. The product will run beside Lumes on the existing Debian 13 VPS, while the Mac remains the local development and database-test machine.

Rumia is self-hosted as a small native systemd deployment, not as a self-hosted Supabase instance and not as a Docker stack. This matches the host's existing Caddy and Bun/systemd operating model, avoids introducing a privileged Docker daemon to a shared production machine, and keeps PostgreSQL inaccessible from the public internet.

## Observed host baseline

The VPS has 4 CPU cores, 8 GiB RAM, 236 GiB free disk, Caddy as the public
reverse proxy, UFW allowing only SSH/HTTP/HTTPS, Fail2ban for SSH, unattended
upgrades, and a native Lumes Bun service on port 3001. PostgreSQL 17 with
PostGIS, pgvector, and pg_trgm is now installed for Rumia; Docker/Podman is
intentionally not part of the architecture. Restic/R2 backup and restore proof
are recorded in `docs/ops/cutover-evidence.md`.

The host is viable for Rumia at MVP traffic. PostgreSQL/PostGIS/pgvector,
least-privilege roles, Restic/R2 backup, and restore evidence are now verified
for the private release. Lumes and Rumia share a host-level failure domain; a
second VPS becomes the required next step before either workload's resource or
security needs exceed this host.

## Production topology

```text
Internet
  └─ Caddy on the VPS, ports 80/443 only
       ├─ lumes.pt → 127.0.0.1:3001 (existing service)
       └─ rumia.pt → 127.0.0.1:3002 (Rumia web service; public ingress deferred)

Rumia web service (Node 24 / Next.js standalone)
  ├─ Better Auth route handlers and secure session cookies
  ├─ Drizzle server-only data-access package
  ├─ PostgreSQL 17 via Unix socket or 127.0.0.1 only
  └─ Cloudflare R2 for later export and upload objects

Rumia worker systemd service/timer
  └─ PostgreSQL outbox and idempotent job records

PostgreSQL 17
  ├─ PostGIS 3.5 for geographic activity and map queries
  ├─ pgvector 0.8 only once semantic retrieval is enabled
  └─ pg_trgm and native full-text search for lexical retrieval
```

No Rumia service listens on a public high port. Caddy is the only ingress. PostgreSQL does not receive a UFW rule, public port binding, Vercel connection, browser connection, or database credential in a `NEXT_PUBLIC_*` variable.

## Runtime components

| Component | Responsibility | Initial state |
| --- | --- | --- |
| `rumia-web.service` | Next.js 16 production server, Better Auth, route handlers, server-rendered pages | Starts after PostgreSQL and binds `127.0.0.1:3002` |
| `postgresql@17-main` | Rumia relational data, PostGIS, future vector/search extensions | Local-only listen address and a dedicated `rumia` database |
| `rumia-worker.service` and timer | Claims durable outbox jobs, processes exports/delivery safely | Disabled until a durable job feature exists |
| Caddy | TLS, host routing, response compression, proxy to loopback Rumia web service | Existing process; one new Rumia virtual host only |
| Cloudflare R2 | Encrypted off-server backup destination and later immutable export/media objects | Separate private buckets and least-privilege credentials |
| Mac local environment | Development, migration rehearsal, RLS/authorization tests, browser checks | Never public production ingress |

## Data and authorization model

The browser never connects to the database. All private data is reached through Next.js server components, server actions, and route handlers after Better Auth session validation.

The database has separate roles:

- `rumia_owner`: migration/DDL role; not used by the web process.
- `rumia_app`: runtime role; no superuser, `CREATEDB`, `CREATEROLE`, `REPLICATION`, or `BYPASSRLS` capability.
- `rumia_readonly`: optional reporting role; no write grants.

`@repo/db` becomes a server-only Drizzle boundary. Its owner-scoped functions accept an authenticated actor ID and include the ownership predicate in every select, update, delete, and mutation-returning query. Reviewer, admin, and organization operations use explicit capability predicates and assignment/organization checks. Cross-user and wrong-tenant tests remain mandatory even though Supabase's browser Data API and service-role model disappear.

RLS is defense in depth for tables that contain traveler-owned data. The application never exposes a general SQL endpoint or database role to clients. Database migrations run from the owner role; the runtime process uses only `rumia_app`.

## Backup, recovery, and operational safety

For the private release, the following safeguards are installed and verified;
they remain operational requirements for any later public cutover:

1. Keep an encrypted swap policy so a temporary memory spike does not immediately kill PostgreSQL or either web service.
2. Keep Restic and a separate encrypted Cloudflare R2 backup bucket; the repository and database use distinct prefixes and retention policies.
3. Run a scheduled logical PostgreSQL backup and a filesystem backup of only Rumia deployment metadata.
4. Restore a backup into a separate local database name and run a query/authorization smoke test. A successful upload alone is not backup evidence.
5. Keep a non-root `rumia` runtime user and a separate deployment account. Do not put either account in the Docker group because Docker is not part of this architecture.
6. Keep UFW limited to ports 22, 80, and 443. Disable SSH X11 forwarding. Restrict root SSH only after the deployment account's key-based access has been verified.

The existing Lumes service should later bind to `127.0.0.1:3001`; UFW currently protects its public `0.0.0.0:3001` listener, but loopback binding removes unnecessary exposure.

## Migration strategy

The change is staged; no Supabase package, migration, or environment variable is deleted until its replacement passes focused tests.

1. Establish local PostgreSQL 17/PostGIS and the VPS database baseline.
2. Add Drizzle schema/migrations and reproduce the current data model in the new database.
3. Add Better Auth, replace Supabase session helpers, and prove sign-in/sign-out/session/role behavior.
4. Replace `@repo/db` Supabase clients and storage/feedback/trip paths with server-only Drizzle repositories.
5. Replace policy tests with PostgreSQL role plus route/actor authorization tests.
6. Migrate the static/public activity flow first; keep saved days and other persistence features disabled until their repository paths are proven.
7. Retire Supabase dependencies, CLI configuration, migrations, deployment secrets, and active documentation after the self-hosted replacement contract passes. The existing hosted project remains read-only rollback evidence; retirement/deletion still requires an explicit owner decision.

There is currently no authorized production Rumia user dataset, so the first migration is schema and fixture based. If real production data exists when execution begins, the plan adds an export/checksum/import/reconciliation/rollback cutover task before any hosted-project deletion.

## Explicit non-goals

- Do not run self-hosted Supabase, PostgREST, GoTrue, Studio, Realtime, or a public database API.
- Do not install Docker merely for Rumia on this shared host.
- Do not expose PostgreSQL, a database admin UI, or the worker process directly to the internet.
- Do not make the Mac a public production server.
- Do not add Stripe, email, uploads, semantic retrieval, or a continuously running worker before their product release gates require them.

## Acceptance criteria

- A fresh Mac database and the VPS database both apply the same Drizzle migrations and enable required extensions.
- The private Caddy fragment validates without disrupting Lumes; public HTTPS
  proxying remains deferred until `rumia.pt` ingress is approved.
- Rumia binds only to loopback; a remote connection to PostgreSQL is impossible.
- Backup restore proof, service health proof, and an owner/reviewer/admin authorization matrix exist before any public persistence feature is enabled.
- Supabase packages, keys, migrations, and documentation are removed only after their replacement contract tests pass.
