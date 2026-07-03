/**
 * Pipeline orchestrator (PR-5).
 *
 * Chains the three stages:
 *
 *   extractOsm(pbfPath)        → ExtractResult
 *   embedFeatures(extract)     → EmbedResult
 *   loadPlaces(embed.embedded) → LoadResult
 *
 * Returns a single `PipelineResult` with per-stage counts
 * and ISO-8601 timestamps. The QStash handler in
 * `apps/workers` calls this on each invocation.
 *
 * The orchestrator owns the timing (`startedAt`,
 * `completedAt`) and the per-stage wiring. The stage
 * functions own their own work. The injected
 * `EmbeddingClient` and `SupabaseLoader` are the seams
 * for the test suite; production wires real OpenAI and
 * real Supabase.
 *
 * Idempotency: re-running the pipeline over the same
 * bbox produces the same `LoadResult` shape (more
 * `updated`, fewer `inserted`, as the table fills up).
 * A partial-run failure (extract OK, embed failed, load
 * never starts) leaves the table with a mix of new +
 * old data. Detected via the per-stage counts in the
 * result; a true atomic migration is out of scope
 * (D-6 in ADR-003).
 */

import { PORTUGAL_BBOX, type PipelineResult, type Bbox } from "./types";
import { extractOsm } from "./extract";
import { embedFeatures } from "./embed";
import { loadPlaces } from "./load";

export type RunPipelineOptions = {
  pbfPath: string;
  bbox?: Bbox;
  country?: import("./types").SupportedCountry;
  embeddingClient: import("./types").EmbeddingClient;
  supabaseLoader: import("./types").SupabaseLoader;
};

export async function runPipeline(
  options: RunPipelineOptions
): Promise<PipelineResult> {
  const startedAt = new Date().toISOString();
  const bbox = options.bbox ?? PORTUGAL_BBOX;

  // Stage 1: extract
  const extract = await extractOsm(options.pbfPath, {
    bbox,
    country: options.country
  });

  // Stage 2: embed
  const embed = await embedFeatures(extract.features, {
    client: options.embeddingClient
  });

  // Stage 3: load
  const load = await loadPlaces(embed.embedded, {
    loader: options.supabaseLoader
  });

  const completedAt = new Date().toISOString();
  return {
    bbox,
    extract,
    embed,
    load,
    startedAt,
    completedAt
  };
}
