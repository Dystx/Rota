# ADR-003 — Data Pipeline Architecture

> **Status:** Accepted (PR-3, 2026-07-03)
> **Deciders:** Engineering (consensus from the 2026-07-03 review-fix session)
> **Related:** `docs/roadmap.md` §3.5 (2026-07-03 decision log), `docs/engineering-lifecycle.md` §2

## Context

The Rumia retrieval layer (Phase 3 of the 8-phase engineering
lifecycle) currently runs against 9 fixture destinations. Production
needs the full Portugal (and later Spain, Italy, France, Greece)
dataset loaded into a Supabase `places` / `destinations` table with
PostGIS geometry + pgvector embeddings. The data pipeline has three
stages:

1. **Extract** — Pull OpenStreetMap features for a bounding box,
   filter by category, normalize tags.
2. **Embed** — Generate a 1536-dim `text-embedding-3-small` vector
   for each feature's flattened-tag text.
3. **Load** — Upsert into Supabase with ON CONFLICT semantics so
   re-runs are idempotent.

A long-running worker drives the pipeline. The worker is the
runtime boundary for the pipeline; the data work is a separate
package. This ADR records the architectural decisions for both.

## Decisions

### D-1. Runtime: Node-side DuckDB, not WASM

The DuckDB connection lives in `@repo/ingest`. Per the 2026-07-03
decision log, we use the Node-side `duckdb` package (not the WASM
build). Trade-off: ~30MB native dep, must run on Node (not
Edge/Cloudflare Workers). The benefit is the speed of the C++ core
for batch Parquet I/O and a stable, well-tested binding.

### D-2. Worker runtime: Upstash QStash, not Vercel Cron

The worker is invoked by Upstash QStash. QStash gives us:

- HTTP-cron semantics that survive deploys (Vercel Cron can drop
  jobs during a deploy window)
- Idempotency keys + retry-with-backoff built in
- Signature verification (HMAC-SHA256 over the body) for
  authentication
- A portable shape — we can move the worker off Vercel without
  rewriting the trigger

The QStash handler lives in `apps/workers/src/index.ts` as
`handleQStashRequest()`. It verifies the signature, dispatches by
`kind`, and returns a typed result. The `apps/workers`
`package.json` adds `@upstash/qstash` + `@upstash/redis` for the
real implementation in PR-4 + PR-5.

### D-3. Cache: Upstash Redis

The pipeline cache lives in Upstash Redis. Use cases:

- Bbox + category filter results (re-extract is expensive)
- Per-feature embedding cache (so re-runs don't re-bill OpenAI)
- Pipeline run status (so ops can poll "is the Portugal
  extract still running?")

The cache is opt-in per call; the worker can run without it.

### D-4. Bounding box per country, not global

Each country gets a hard-coded bounding box (`PORTUGAL_BBOX` in
`packages/ingest/src/types.ts`). Per-country boxes (ES/IT/FR/GR)
land in PR-7 (international expansion). The Overture Maps / OSM
PBF files are large (~10GB for Europe), so a country-level
bounding box is a 100x reduction in I/O vs. a global extract.

### D-5. Embedding model: text-embedding-3-small

The model is `text-embedding-3-small` (1536-dim). The
`EmbeddedFeature.embeddingModel` field records which model produced
each vector so we can re-embed when the model version bumps.
Future: 3072-dim `text-embedding-3-large` is a config change, not
a schema change.

### D-6. Idempotent load via ON CONFLICT

The `loadPlaces` stage uses Supabase upsert (`ON CONFLICT
(osm_id) DO UPDATE SET ...`) keyed on the OSM stable id. Re-runs
of the pipeline overwrite the existing row with the latest tag
snapshot. The pgvector embedding is replaced wholesale (the only
correct semantics — partial updates would corrupt the vector).

### D-7. Pipeline runs are resumable

The QStash handler is idempotent: a retry that lands on an
already-processed bbox is a no-op (the load stage's ON CONFLICT
handles it). The pipeline result includes a `startedAt` and
`completedAt` so ops can detect "stuck" runs (e.g. started 4h
ago, no completion — likely a worker crash).

## Consequences

### Positive

- The package boundary (`@repo/ingest`) keeps the data work
  testable without spinning up QStash + Redis.
- The QStash handler is a thin seam: swap the trigger (Vercel
  Cron, direct HTTP, GitHub Action) without touching the
  pipeline.
- The `OnConflict` upsert makes re-runs safe; a partial pipeline
  failure is recoverable by re-running.
- The Redis cache keeps OpenAI re-bills bounded — a second pass
  over the same bbox is essentially free.

### Negative

- DuckDB's native dep (~30MB) means the worker must run on a
  Node-only host (Render, Fly.io, Railway). Edge / Cloudflare
  Workers are out.
- QStash adds a vendor dependency. The lock-in is medium (QStash
  has portable HTTP-cron semantics; the Upstash Redis cache is
  replaceable with Vercel KV or a self-hosted Redis).
- The OnConflict strategy means a partial run (extract done,
  embed partial, load never starts) leaves the table with a mix
  of new + old data. The pipeline result includes per-stage
  counts so ops can spot the gap, but a true atomic migration
  would need a shadow-table swap. Defer to a follow-up if the
  partial-run issue becomes material.

## Implementation sequencing

- **PR-3 (this PR)** — package skeleton, types, DuckDB
  connection helper, QStash handler seam. No real extraction or
  embedding.
- **PR-4** — `extractOsm()` against Overture Maps / OSM PBF.
  Includes the worker route that triggers the extract via
  QStash.
- **PR-5** — `embedFeatures()` (OpenAI batching, rate-limit
  handling, Redis cache) + `loadPlaces()` (Supabase upsert).
  Includes the orchestrator that chains all three stages.
- **PR-7** — International: ES/IT/FR/GR bounding boxes + per-
  country OSM extract.

## Open questions

- **OpenAI rate-limit strategy** — batch size of 100 features?
  Adaptive backoff on 429? Defer to PR-5.
- **PBF source** — Overture Maps (frequent updates, large file)
  vs. Geofabrik (per-country, smaller, weekly refresh). Pick
  Geofabrik for the first cut (smaller blast radius).
- **Shadow-table swap for atomic migrations** — defer until the
  partial-run issue becomes material.
- **Telemetry** — which QStash events do we want to track?
  Pipeline run duration, OpenAI token usage, Supabase upsert
  failures. Emit through `@repo/analytics` (`tier_3_metrics`
  has 8 metrics; consider reusing the recording helpers).

## References

- `docs/roadmap.md` §3.5 — 2026-07-03 decision log
- `docs/engineering-lifecycle.md` §2 — Data Seeding section
- `packages/ingest/README.md` — module status + planned structure
- `apps/workers/src/index.ts` — `handleQStashRequest` seam
