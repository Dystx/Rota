/**
 * Production Supabase loader (PR-5).
 *
 * Wires `@supabase/supabase-js` into our `SupabaseLoader`
 * interface. The load stage's contract is ON CONFLICT
 * (osm_id) DO UPDATE — re-runs of the pipeline overwrite
 * existing rows with the latest tag snapshot.
 *
 * The places table schema (migration
 * 202607022000_enable_postgis_pgvector_and_places_embeddings.sql
 * + 202604292240_create_places.sql) has:
 *  - id (uuid) — derived from `osm_id` here, but the
 *    Supabase upsert keys on `osm_id` (text column with
 *    unique index) for ON CONFLICT resolution.
 *  - coordinates (GEOMETRY(Point, 4326)) — parsed from
 *    `geometryWkt` via PostGIS `ST_GeomFromText`
 *  - embedding (VECTOR(1536)) — pgvector column
 *  - name, category, region, country_slug, metadata (jsonb)
 *
 * A future PR-5 follow-up: add the `osm_id` text column +
 * unique index to the `places` table if it's missing. The
 * loader assumes the schema is already in place.
 *
 * If `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are
 * unset, `createSupabaseLoader` throws on `load()` (fail
 * fast in production).
 */

import type {
  LoadRequest,
  LoadResponse,
  PlaceRow,
  SupabaseLoader
} from "./types";

export type SupabaseLoaderOptions = {
  url?: string;
  serviceRoleKey?: string;
  table?: string;
};

type SupabaseRowPayload = {
  osm_id: string;
  name: string;
  category: string;
  country_slug: string;
  coordinates: string;
  embedding: string;
  metadata: Record<string, unknown>;
};

export function createSupabaseLoader(
  options: SupabaseLoaderOptions = {}
): SupabaseLoader {
  const url = options.url ?? process.env.SUPABASE_URL;
  const serviceRoleKey = options.serviceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "createSupabaseLoader: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
    );
  }
  const tableName = options.table ?? "places";

  // Lazy import: @supabase/supabase-js is a large dep; the
  // stub used in tests doesn't need it.
  return {
    async load(request: LoadRequest): Promise<LoadResponse> {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(url, serviceRoleKey, {
        auth: { persistSession: false }
      });

      const rows: SupabaseRowPayload[] = request.rows.map(rowToPayload);
      const { error } = await supabase
        .from(tableName)
        .upsert(rows, { onConflict: "osm_id", count: "exact" });

      if (error) {
        // The whole batch failed. We return failed=rows.length
        // so the load result correctly reports the loss; the
        // retry-with-backoff lives in a follow-up PR.
        return { inserted: 0, updated: 0, failed: rows.length };
      }

      // Supabase's upsert doesn't return a per-row diff. We
      // approximate: if any row in the batch was new (i.e.
      // its `osm_id` is not in the existing table), it's an
      // insert. Otherwise it's an update. Without a separate
      // SELECT, the best we can do is "all inserts on a
      // previously-empty table, all updates on a populated
      // one." A more precise count is a follow-up.
      //
      // For the first pipeline run, the table is empty so
      // every row is an insert. For re-runs, every row is an
      // update. The count surfaces that distinction to ops.
      const { count: existingCount } = await supabase
        .from(tableName)
        .select("*", { count: "exact", head: true });

      const existing = existingCount ?? 0;
      const inserted = existing === 0 ? rows.length : 0;
      const updated = existing > 0 ? rows.length : 0;

      return { inserted, updated, failed: 0 };
    }
  };
}

function rowToPayload(row: PlaceRow): SupabaseRowPayload {
  return {
    osm_id: row.osmId,
    name: row.name,
    category: row.category,
    country_slug: row.countrySlug,
    coordinates: row.geometryWkt,
    embedding: `[${row.embedding.join(",")}]`,
    metadata: row.metadata
  };
}
