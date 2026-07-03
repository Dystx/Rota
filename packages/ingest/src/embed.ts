/**
 * Embedding stage (PR-5).
 *
 * Takes the extracted `OsmFeature[]` from PR-4 and returns
 * `EmbeddedFeature[]` with a 1536-dim OpenAI
 * `text-embedding-3-small` vector for each feature's
 * flattened-tag text.
 *
 * The OpenAI client is **injected** so the test suite can
 * run without an `OPENAI_API_KEY`. Production wires
 * `@ai-sdk/openai` (already in the workspace at v5) into
 * the `OpenAIEmbeddingClient` below.
 *
 * Batching: OpenAI's `text-embedding-3-small` accepts up
 * to 2048 inputs per request. We batch at 100 to keep
 * request latency bounded; the rest is parallel on the
 * client side. The batch size is a constant, not a config,
 * because the only knob is the OpenAI rate limit (RPM),
 * and adjusting that is an operations concern (PR-5 follow-
 * up: adaptive batch size on 429).
 */

import type {
  EmbedResult,
  EmbeddedFeature,
  EmbeddingClient,
  EmbeddingRequest,
  OsmFeature
} from "./types";

const BATCH_SIZE = 100;

/** Default model. The model's name is recorded on every
 *  `EmbeddedFeature.embeddingModel` so re-embedding on a
 *  model bump is mechanical (D-5 in ADR-003). */
const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";

/** Flatten OSM tags into a single string suitable for
 *  embedding. Format: `key1: value1; key2: value2; ...`.
 *  We include the most discriminative tags first
 *  (name, category-key, category-value) so the embedding
 *  has signal even when the rest of the tag bag is noisy. */
export function flattenTagsForEmbedding(feature: OsmFeature): string {
  const parts: string[] = [];
  parts.push(`name: ${feature.name}`);
  // The category column already has the `key/value` shape
  // (e.g. "amenity/restaurant"). Pass it through.
  parts.push(`category: ${feature.category}`);
  // Add the rest of the tags. Skip empty values.
  for (const [k, v] of Object.entries(feature.tags)) {
    if (!v || k === "name" || k.startsWith("name:")) continue;
    parts.push(`${k}: ${v}`);
  }
  return parts.join("; ");
}

/** Run the embedding stage. Batches the input and calls
 *  the injected embedding client. Returns an `EmbedResult`
 *  with per-feature vectors + per-batch token counts. */
export async function embedFeatures(
  features: readonly OsmFeature[],
  options: {
    client: EmbeddingClient;
    model?: string;
  }
): Promise<EmbedResult> {
  if (features.length === 0) {
    return { embedded: [], failed: 0, totalTokens: 0 };
  }

  const model = options.model ?? DEFAULT_EMBEDDING_MODEL;
  const embedded: EmbeddedFeature[] = [];
  let failed = 0;
  let totalTokens = 0;

  for (let i = 0; i < features.length; i += BATCH_SIZE) {
    const batch = features.slice(i, i + BATCH_SIZE);
    const inputs = batch.map(flattenTagsForEmbedding);
    const request: EmbeddingRequest = { inputs, model };
    try {
      const result = await options.client.embed(request);
      for (let j = 0; j < batch.length; j++) {
        const feature = batch[j];
        const embedding = result.embeddings[j];
        if (!feature || !embedding) {
          failed += 1;
          continue;
        }
        embedded.push({
          ...feature,
          embedding,
          embeddingModel: result.model
        });
      }
      totalTokens += result.totalTokens;
    } catch {
      // The whole batch failed (rate limit, network, etc.).
      // For PR-5 we mark every feature in the batch as
      // failed and continue. A future PR adds retry with
      // exponential backoff on 429.
      failed += batch.length;
    }
  }

  return { embedded, failed, totalTokens };
}
