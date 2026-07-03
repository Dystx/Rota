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
   │ loadPlaces()       │  PR-5 — Supabase upsert into places
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
- **Supabase target table:** `places` (current code) — see
  `docs/reviews/2026-07-03-llm-review.md` LOW-1 for the
  `places` vs `destinations` naming decision. The migration lint
  already catches the rename; the rename itself is a separate
  task.

## Open work (after this PR)

- **PR-4:** `extractOsm` implementation — DuckDB query against
  Overture Maps, bbox + category filter, Parquet write to a
  scratch path. Includes the worker entrypoint that triggers
  this stage via QStash.
- **PR-5:** `embedFeatures` (OpenAI batching, rate-limit
  handling) + `loadPlaces` (Supabase upsert with ON CONFLICT
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
