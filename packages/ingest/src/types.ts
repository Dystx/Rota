/**
 * Typed contracts for the data ingestion pipeline.
 *
 * This module defines the *interface* between the three pipeline
 * stages (extract → embed → load). The implementations land in
 * PR-4 (extract) and PR-5 (embed + load); this PR is
 * infrastructure only.
 *
 * Why a types-only module: the pipeline orchestration lives in
 * `apps/workers` (driven by Upstash QStash); the actual data
 * manipulation lives in this package. The contracts are the
 * handoff between the two so the worker can be implemented and
 * tested independently of the DuckDB + OpenAI work.
 */

import { z } from "zod";

/**
 * A single OSM feature, normalized to the shape we want in
 * the `places` / `destinations` table. Tags are flattened to
 * `Record<string, string>` for portability; geometry is
 * WKT (PostGIS parses it natively).
 *
 * The shape here is the *minimum* the destination table needs
 * for the retrieval layer. Fields like `opening_hours`,
 * `cuisine`, `wheelchair` are kept in the `metadata` JSONB
 * blob for now and surfaced through the destination table
 * once the post-Phase 7 schema additions land.
 */
export interface OsmFeature {
  /** Overture Maps / OSM stable id. */
  osmId: string;
  /** Display name (English or local-language OSM `name` tag). */
  name: string;
  /** High-level category — `restaurant`, `viewpoint`, `museum`, etc. */
  category: string;
  /** The full OSM tag dictionary, flattened. */
  tags: Record<string, string>;
  /** WKT POINT representation (e.g. `POINT(-9.1393 38.7223)`). */
  geometryWkt: string;
  /** ISO-3166-1 alpha-2 country code — derived from the
   *  bounding box, not the OSM tag. */
  country: string;
}

/** Bounding box for the Portugal extract. Hard-coded
 *  for now; future per-country boxes (ES/IT/FR/GR) live in
 *  a sibling file. */
export const PORTUGAL_BBOX = {
  minLat: 36.9601,
  maxLat: 42.1543,
  minLon: -9.5,
  maxLon: -6.1892
} as const;

/** Bounding box shape. The Portugal one is a `readonly` tuple;
 *  per-country boxes in PR-7 are plain objects. */
export interface Bbox {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

/** Zod schema for the OsmFeature shape — used by the worker
 *  when it receives an extract payload from QStash. */
export const OsmFeatureSchema = z.object({
  osmId: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  tags: z.record(z.string(), z.string()),
  geometryWkt: z.string().regex(/^POINT\(/),
  country: z.string().length(2)
});

/** Result of an `extractOsm` run — the raw features before
 *  embedding, ready for the `embedFeatures` stage. */
export interface ExtractResult {
  features: readonly OsmFeature[];
  /** Total OSM features in the bounding box, before
   *  category filtering. Useful for monitoring / progress. */
  totalScanned: number;
  /** ISO-8601 timestamp of when the extract completed. */
  extractedAt: string;
}

/** A feature with its OpenAI embedding attached. The
 *  embedding is a 1536-dim vector matching
 *  `places.embedding VECTOR(1536)`. */
export interface EmbeddedFeature extends OsmFeature {
  embedding: readonly number[];
  /** Which OpenAI model produced the embedding. Recorded
   *  so we can re-embed when the model version changes. */
  embeddingModel: string;
}

/** Result of an `embedFeatures` run — the features with
 *  their 1536-dim embeddings, ready for the `loadPlaces`
 *  stage. */
export interface EmbedResult {
  embedded: readonly EmbeddedFeature[];
  /** Number of features that failed embedding (rate-limit
   *  / validation / etc.). Surfaced for monitoring. */
  failed: number;
  /** Tokens used across the batch. */
  totalTokens: number;
}

/** Result of a `loadPlaces` run — how many rows landed in
 *  Supabase and how many failed (constraint violations,
 *  connection errors, etc.). */
export interface LoadResult {
  inserted: number;
  updated: number;
  failed: number;
}

/**
 * The full pipeline orchestration result — one QStash
 * invocation = one full pipeline run (extract → embed →
 * load) for a single bounding box. Used by the worker to
 * emit a single status payload back to ops when the
 * pipeline completes.
 */
export interface PipelineResult {
  bbox: typeof PORTUGAL_BBOX;
  extract: ExtractResult;
  embed: EmbedResult;
  load: LoadResult;
  /** ISO-8601 timestamp of when the pipeline started. */
  startedAt: string;
  /** ISO-8601 timestamp of when the pipeline completed. */
  completedAt: string;
}

/** Stub return for the (not-yet-implemented) `runPipeline`
 *  function. Replaced by the real implementation in PR-4 + PR-5. */
export const PIPELINE_NOT_IMPLEMENTED: PipelineResult = {
  bbox: PORTUGAL_BBOX,
  extract: { features: [], totalScanned: 0, extractedAt: "1970-01-01T00:00:00Z" },
  embed: { embedded: [], failed: 0, totalTokens: 0 },
  load: { inserted: 0, updated: 0, failed: 0 },
  startedAt: "1970-01-01T00:00:00Z",
  completedAt: "1970-01-01T00:00:00Z"
};
