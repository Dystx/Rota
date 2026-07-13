# @repo/ingest

Data ingestion pipeline for the Rumia destination knowledge graph.

## Status

**Infrastructure only (PR-3).** The DuckDB Node-side connection
helper is wired; the Upstash QStash consumer lands in `apps/workers`
in the same PR. The actual pipeline stages (extract, embed, load)
are stubs and land in PR-4 + PR-5.

## Pipeline

```
   Overture Maps / OSM PBF
              │
              ▼
   ┌────────────────────┐
   │ extractOsm(bbox)   │  PR-4 — DuckDB query + bbox filter + WKT
   └────────┬───────────┘
            │ OsmFeature[]
            ▼
   ┌────────────────────┐
   │ embedFeatures()    │  PR-5 — OpenAI text-embedding-3-small
   └────────┬───────────┘
            │ EmbeddedFeature[]
            ▼
   ┌────────────────────┐
   │ loadPlaces()       │  PR-5 — owner-role PostgreSQL upsert into places
   └────────┬───────────┘
            │
            ▼
       places table
       (geometry + embedding + metadata)
```

## Module layout

- `src/types.ts` — typed contracts (`OsmFeature`, `EmbeddedFeature`,
  `ExtractResult`, `EmbedResult`, `LoadResult`, `PipelineResult`).
  These are the handoff between `apps/workers` (orchestrator) and
  this package (data work).
- `src/duckdb.ts` — Node-side DuckDB connection helper. Single
  seam for the pipeline. `openInMemory` for the extract stage;
  `openFile(path)` for the embed/load stages that stream from
  Parquet.
- `src/index.ts` — barrel re-exports.

## Decisions

- **DuckDB runtime:** Node-side `duckdb` (not the WASM build). See
  the 2026-07-03 decision log in `docs/roadmap.md` §3.5. Trade-off:
  ~30MB native dep, but the Node binding is faster for batch
  Parquet I/O and runs cleanly on Render/Fly.io.
- **Bounding box:** `PORTUGAL_BBOX` is hard-coded for now. ES/IT/FR/GR
  land in PR-7 (international expansion).
- **Embedding model:** `text-embedding-3-small` (1536-dim). The
  `embeddingModel` field on `EmbeddedFeature` records which model
  produced each vector so we can re-embed on a model-version bump.
- **PostgreSQL target table:** `app.places` through the server-only Drizzle
  boundary. The migration lint catches the `places` vs `destinations` naming
  decision; any rename remains a separate owner-role migration.

## Open work (after this PR)

- **PR-4:** `extractOsm` implementation — DuckDB query against
  Overture Maps, bbox + category filter, Parquet write to a
  scratch path. Includes the worker entrypoint that triggers
  this stage via QStash.
- **PR-5:** `embedFeatures` (OpenAI batching, rate-limit
  handling) + `loadPlaces` (owner-role PostgreSQL upsert with ON CONFLICT
  semantics). The `runPipeline` orchestrator that chains all
  three stages.
- **PR-7:** ES/IT/FR/GR bounding boxes + localized OSM extract.

## Verification

```bash
pnpm --filter @repo/ingest typecheck
```

The pipeline stages land in later PRs; this PR is package
scaffold + types + DuckDB connection helper. Tests land with
the implementations.

## HNSW index build — memory budget

The pgvector HNSW index on `places.embedding` is rebuilt by the
`202607032300_migrate_places_embedding_to_halfvec.sql` migration
(when pgvector ≥ 0.7.0 is available) and by any future
`ALTER TYPE ... HALFVEC(3072)` migration. HNSW builds are
**memory-hungry** — the working buffer is the whole `places`
table on disk, plus neighbor-graph scratch. On a small PostgreSQL
host the build can OOM and roll back if you don't bump
`maintenance_work_mem` first.

Run this through the approved PostgreSQL owner maintenance connection
(`psql` on the Mac rehearsal database or VPS), in the same session before
applying the migration:

```sql
-- Bump maintenance_work_mem for the HNSW build. 2GB is conservative
-- for our ~12k-row corpus; scale to 4GB for 1M+ rows.
set maintenance_work_mem = '2GB';

-- Apply the halfvec migration, then re-run ANALYZE so the planner
-- picks up the new HNSW index stats.
-- Apply the corresponding Drizzle migration from the current release here.
-- Do not run a hosted Supabase migration for Rumia.

vacuum analyze public.places;
```

The `set` is per-session, so run the migration in the same
connection. `VACUUM ANALYZE` (not just `ANALYZE`) is required
because the HNSW index needs a fresh visibility map for the
neighbor graph to populate correctly.

If the build still OOMs, drop `ef_construction` to 32 in the
migration (trades a few percent recall for ~half the memory)
or run the build during a planned owner-role maintenance window where
`maintenance_work_mem` can be raised higher.

## pgvector dimension limit — forward compat

`pgvector`'s `VECTOR(n)` and `HALFVEC(n)` types cap `n` at
**2000** in pgvector 0.6 and earlier; pgvector 0.7.0+ raises
the cap to **16000** on current pgvector releases. Our
current model is `text-embedding-3-small` at 1536-dim — well
under either cap. The next model bump
(`text-embedding-3-large` at 3072-dim) also fits.

The halfvec migration above is what makes the bump safe: it
doubles the available headroom by halving per-vector memory
and is the on-disk format we want long-term.

## QStash idempotency — sender-side pattern

The receiver (`apps/workers/src/index.ts handleQStashRequest`)
deduplicates on the `idempotencyKey` field of the job
envelope. When the QStash sender lands (cron schedule for the
ingest pipeline), it must pass that same key as the
`Upstash-Idempotency-Key` header on the `qstash.publish()` call
so QStash itself collapses duplicates before they reach the
worker:

```ts
await qstash.publish({
  url: `${WORKER_BASE_URL}/qstash`,
  body: JSON.stringify(payload),
  headers: { "Upstash-Idempotency-Key": payload.idempotencyKey }
});
```

The receiver-side dedup is a safety net for retries where
QStash did deliver a message but the worker crashed before
recording it. The sender-side header is the primary
deduplication mechanism.
