/**
 * Load stage (PR-5).
 *
 * Takes `EmbeddedFeature[]` from the embed stage and
 * upserts them into the PostgreSQL `app.places` table via
 * ON CONFLICT (osm_id) DO UPDATE. The contract is
 * idempotent: a re-run of the pipeline overwrites the
 * existing row with the latest tag snapshot.
 *
 * The PostgreSQL loader is **injected** so the test suite
 * can count inserts/updates/failed without a live
 * database. Production wires the existing
 * a `PlaceLoader` adapter.
 *
 * Why a custom adapter instead of calling PostgreSQL
 * directly: the load stage's contract is small and
 * stable; a real adapter can be added without changing
 * the orchestrator. PR-5 ships the seam; PR-5 follow-up
 * ships the PostgreSQL adapter.
 */

import type {
  EmbeddedFeature,
  LoadResult,
  PlaceRow,
  PlaceLoader
} from "./types";

const BATCH_SIZE = 100;

/** Convert an `EmbeddedFeature` into the row shape the
 *  PostgreSQL upsert expects. Drops `embeddingModel` (the
 *  audit is the load result's job, not the row's) and
 *  reshapes the country code into a `country_slug`
 *  column. */
export function featureToRow(
  feature: EmbeddedFeature
): PlaceRow {
  // `category` is "amenity/restaurant"; split on `/` to
  // give the destination table a key + value pair. The
  // existing places table doesn't have a `category` +
  // `category_value` split, so we put the joined form
  // in `category` and the key in `metadata.category_key`.
  const [categoryKey = "", ...rest] = feature.category.split("/");
  const categoryValue = rest.join("/");

  return {
    osmId: feature.osmId,
    name: feature.name,
    category: feature.category,
    geometryWkt: feature.geometryWkt,
    countrySlug: feature.country,
    embedding: feature.embedding,
    metadata: {
      ...feature.tags,
      category_key: categoryKey,
      category_value: categoryValue,
      embedding_model: feature.embeddingModel
    }
  };
}

/** Run the load stage. Batches the input and calls the
 *  injected PostgreSQL loader. Returns a `LoadResult` with
 *  per-batch counts. */
export async function loadPlaces(
  features: readonly EmbeddedFeature[],
  options: { loader: PlaceLoader }
): Promise<LoadResult> {
  if (features.length === 0) {
    return { inserted: 0, updated: 0, failed: 0 };
  }

  const rows: PlaceRow[] = features.map(featureToRow);
  let inserted = 0;
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    try {
      const result = await options.loader.load({ rows: batch });
      inserted += result.inserted;
      updated += result.updated;
      failed += result.failed;
    } catch {
      // Whole-batch failure: mark every row as failed and
      // continue. A future PR adds retry-with-backoff on
      // 5xx responses.
      failed += batch.length;
    }
  }

  return { inserted, updated, failed };
}
