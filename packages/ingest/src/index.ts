/**
 * @repo/ingest — Data ingestion pipeline for the Rumia
 * destination knowledge graph.
 *
 * Pipeline stages (PR-4 + PR-5 will implement):
 *   1. `extractOsm(bbox)` — DuckDB query against Overture Maps
 *      / OSM PBF, filter to the bounding box + category keys
 *      (`amenity`, `tourism`, `historic`), return
 *      `OsmFeature[]` with WKT geometry.
 *   2. `embedFeatures(features)` — OpenAI `text-embedding-3-small`
 *      for each feature's flattened-tag text, return
 *      `EmbeddedFeature[]` with 1536-dim vectors.
 *   3. `loadPlaces(embedded)` — PostgreSQL upsert into
 *      `places` (id, name, category, country_slug, geometry,
 *      embedding, metadata), return `LoadResult` with
 *      inserted/updated/failed counts.
 *
 * The orchestration lives in `apps/workers` and is driven by
 * Upstash QStash (see `apps/workers/src/index.ts`). This
 * package owns the three stage functions and their types.
 *
 * The DuckDB + Upstash infrastructure is wired in PR-3 (this
 * commit). The actual stage implementations land in PR-4 +
 * PR-5.
 */

export * from "./types";
export {
  openInMemory,
  openFile,
  run,
  all,
  close
} from "./duckdb";
export {
  extractOsm,
  extractFromTable,
  buildExtractQuery,
  bboxForCountry,
  CATEGORY_FILTERS
} from "./extract";
export {
  embedFeatures,
  flattenTagsForEmbedding
} from "./embed";
export {
  loadPlaces,
  featureToRow
} from "./load";
export {
  runPipeline,
  type RunPipelineOptions
} from "./pipeline";
export { createOpenAIEmbeddingClient } from "./openai-client";
export { createPostgresLoader } from "./postgres-loader";
