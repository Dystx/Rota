import { Pool } from "pg";
import type { LoadRequest, LoadResponse, PlaceLoader, PlaceRow } from "./types";

export type PostgresLoaderOptions = { databaseUrl?: string };

export function createPostgresLoader(options: PostgresLoaderOptions = {}): PlaceLoader {
  const databaseUrl = options.databaseUrl ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("createPostgresLoader: DATABASE_URL is required");
  }
  const pool = new Pool({ connectionString: databaseUrl, max: 2 });

  return {
    async load(request: LoadRequest): Promise<LoadResponse> {
      if (request.rows.length === 0) return { inserted: 0, updated: 0, failed: 0 };
      const client = await pool.connect();
      try {
        await client.query("begin");
        const slugs = request.rows.map((row) => row.osmId);
        const existing = await client.query<{ slug: string }>(
          "select slug from app.places where slug = any($1::text[])",
          [slugs]
        );
        const existingSlugs = new Set(existing.rows.map((row) => row.slug));
        for (const row of request.rows) {
          await upsertPlace(client, row);
        }
        await client.query("commit");
        return {
          inserted: request.rows.filter((row) => !existingSlugs.has(row.osmId)).length,
          updated: request.rows.filter((row) => existingSlugs.has(row.osmId)).length,
          failed: 0
        };
      } catch (error) {
        await client.query("rollback").catch(() => undefined);
        return { inserted: 0, updated: 0, failed: request.rows.length };
      } finally {
        client.release();
      }
    }
  };
}

async function upsertPlace(client: import("pg").PoolClient, row: PlaceRow): Promise<void> {
  const embedding = `[${row.embedding.join(",")}]`;
  await client.query(
    `insert into app.places
      (slug, name, region_slug, category, editorial_status, source_confidence, coordinates, embedding, local_notes)
     values ($1, $2, $3, $4, 'draft', 'ingested', st_geomfromtext($5, 4326)::geography, $6::vector, $7)
     on conflict (slug) do update set
       name = excluded.name,
       region_slug = excluded.region_slug,
       category = excluded.category,
       source_confidence = excluded.source_confidence,
       coordinates = excluded.coordinates,
       embedding = excluded.embedding,
       local_notes = excluded.local_notes,
       updated_at = now()`,
    [row.osmId, row.name, row.countrySlug, row.category, row.geometryWkt, embedding, JSON.stringify(row.metadata)]
  );
}
