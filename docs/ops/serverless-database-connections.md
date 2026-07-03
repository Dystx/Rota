# Serverless database connections — operational notes

This doc captures the serverless / edge / Vercel-Render-Fly
connection-management decisions for Rumia, including the
ones where generic advice from the wider ecosystem does not
apply to our stack.

## 1. Server Action body size limit

Server Actions cap request bodies at **1MB by default** in
Next.js. Our trip-brief Route Action payload is small today,
but the cinematic trip page posts feature collections and
brief edits that are expected to push past 1MB as the product
grows. We bump the cap to **4MB** (Vercel's documented limit
for the Node.js runtime) in `apps/web/next.config.ts`:

```ts
experimental: {
  serverActions: {
    bodySizeLimit: "4mb"
  }
}
```

Bump to 8MB only if the trip-brief action starts clipping at
4MB; the Vercel hard ceiling is 4MB on the Node.js runtime
in the current Next.js major version. The Edge runtime cap
is 4MB total (including the entire Request, not just the
body), so any future move to Edge needs a different cap
strategy.

## 2. Supabase connection pool — **does NOT use `pg.Pool`**

Generic serverless / Vercel advice often recommends wrapping
a raw `pg.Pool` with `import { attachDatabasePool } from
"@vercel/functions"` so the function instance can be kept
warm across invocations. **This advice does not apply to
Rumia.**

We use **`@supabase/ssr`'s `createServerClient`** for all
database access in Server Components, Server Actions, and
Route Handlers. `@supabase/ssr` builds on `@supabase/supabase-js`,
which manages its own connection pool internally via
`postgres-meta` / PostgREST fetch calls. There is no raw
`pg.Pool` in our stack to wrap:

```bash
$ grep -rn "from \"pg\"\|new Pool\|attachDatabasePool" apps/ packages/ \
    --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules
# (no matches)
```

### The right serverless fix for our stack

Two knobs, both configured at the **connection string /
runtime layer**, not in code:

1. **Use the Supabase pooler URL**, not the direct Postgres
   URL. The pooler URL is in the Supabase dashboard under
   *Connect → Connection pooling → Transaction mode* and
   looks like:
   ```
   postgres://postgres.PROJECTREF:[PASSWORD]@aws-0-REGION.pooler.supabase.com:6543/postgres
   ```
   The `6543` port and `pooler.supabase.com` host route
   through PgBouncer in transaction mode, which keeps the
   upstream Postgres connection count flat regardless of how
   many serverless instances are live.

2. **Pass `pgbouncer=true&connection_limit=1`** in the
   `postgres-js` connection string (the underlying driver
   `@supabase/supabase-js` uses for direct connections). The
   `connection_limit=1` is the single most important line —
   it caps each serverless instance to one upstream
   connection, multiplied by N instances in a cold burst
   you're still bounded.

For Vercel specifically, both knobs go in the Vercel project
**Environment Variables** under the same `DATABASE_URL` /
`POSTGRES_URL` key the existing Supabase client reads. No
code change required.

### When would `attachDatabasePool` apply?

If a future feature introduces a long-lived worker (e.g. the
ingest pipeline running in `apps/workers` for hours), and
that worker opens a raw `pg.Pool` to do bulk upserts, then
**that specific worker** would benefit from
`attachDatabasePool` to survive the Function's idle
reaping. The ingest worker is a long-running Node process on
Render/Fly (not a serverless function), so it doesn't need
it either — the worker opens one `pg.Pool` at boot and keeps
it open for the process lifetime.

## 3. QStash idempotency

QStash retries on the receiver side if a 5xx is returned
within the response window. We dedupe in two places:

- **Sender side:** every `qstash.publish()` call passes
  `headers: { "Upstash-Idempotency-Key": payload.idempotencyKey }`
  so QStash itself collapses duplicates that arrive within
  the dedup window. This is the primary mechanism.
- **Receiver side:** `apps/workers/src/index.ts runJob()` and
  `handleQStashRequest()` check the `idempotencyKey` against
  the in-memory `state.completedDeliveries` set and short-
  circuit to `status: "skipped"` if a delivery for the same
  key has already succeeded. This is the safety net for the
  case where QStash delivered the message but the worker
  crashed before recording completion.

See `packages/ingest/README.md § "QStash idempotency"` for
the exact sender-side `qstash.publish` snippet. The
receiver-side dedup is tested in
`apps/workers/src/index.test.ts`.

## 4. HNSW index build memory

See `packages/ingest/README.md § "HNSW index build — memory
budget"`. The short version: bump
`maintenance_work_mem` to 2GB+ before applying the
halfvec migration and any future `ALTER TYPE ...` on
`places.embedding`, then `VACUUM ANALYZE public.places;`
afterward. Without this ritual the HNSW build OOMs and
rolls back.

## 5. Summary checklist

When you next touch the serverless / database boundary:

- [ ] Are you using `@supabase/ssr` / `@supabase/supabase-js`?
  Use the pooler URL + `pgbouncer=true&connection_limit=1`. No
  code change.
- [ ] Did you open a new raw `pg.Pool`? Only then consider
  `attachDatabasePool`, and only for true serverless
  function contexts (not long-running workers).
- [ ] Are you posting > 1MB to a Server Action? Confirm
  `next.config.ts experimental.serverActions.bodySizeLimit`
  matches the payload shape.
- [ ] Are you scheduling a QStash job? Pass
  `Upstash-Idempotency-Key` on `publish()` and confirm
  the receiver dedupes on the matching field.
- [ ] Are you altering `places.embedding`? Bump
  `maintenance_work_mem` and run `VACUUM ANALYZE` around
  the migration.
