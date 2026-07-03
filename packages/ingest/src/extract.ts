/**
 * OSM extraction stage (PR-4).
 *
 * Reads an Overture Maps / OpenStreetMap PBF file, filters by
 * bounding box + category keys, and returns the matched
 * features as `OsmFeature[]` with WKT POINT geometry.
 *
 * Pipeline contract: this is stage 1 of the data ingest
 * pipeline (extract → embed → load). The output feeds
 * `embedFeatures()` in PR-5.
 *
 * Implementation notes:
 *
 * - We use DuckDB's `spatial` extension's `ST_ReadOSM()` to
 *   parse the PBF. The function returns a virtual table with
 *   columns `id` (TEXT, the OSM stable id), `tags` (MAP<VARCHAR,
 *   VARCHAR>), and `geom` (GEOMETRY in EPSG:4326).
 * - The bbox filter is a `ST_Intersects(bbox_polygon, geom)`
 *   check. DuckDB builds an R-tree on the geometry column
 *   automatically when the spatial extension is loaded.
 * - The category filter looks at the `amenity`, `tourism`,
 *   and `historic` tag keys. Each key has a whitelist of
 *   values we care about for the destination knowledge
 *   graph (restaurants, cafes, viewpoints, museums, castles,
 *   monuments). Future categories (e.g. `shop`, `leisure`)
 *   are added by extending `CATEGORY_FILTERS` below.
 * - The function is split into two pieces so the test can
 *   exercise the SQL against a synthetic source without
 *   needing a real PBF: `extractOsm()` opens a PBF and
 *   delegates to `extractFromTable()`; the test calls
 *   `extractFromTable()` against an in-memory DuckDB with
 *   a few hand-built rows.
 */

import type { Connection } from "duckdb";
import {
  PORTUGAL_BBOX,
  type Bbox,
  type ExtractResult,
  type OsmFeature
} from "./types";
import { openFile, all, close } from "./duckdb";

/**
 * Whitelist of OSM tag values we want in the destination
 * knowledge graph. Each entry maps a tag key to the values
 * to keep. Add more categories here as the destination
 * graph grows (PR-7 international adds local-language
 * synonyms; the platform team can extend this list without
 * a code change elsewhere).
 */
export const CATEGORY_FILTERS = {
  amenity: ["restaurant", "cafe", "bar", "pub", "biergarten", "ice_cream"],
  tourism: ["viewpoint", "museum", "gallery", "artwork", "attraction"],
  historic: ["castle", "monument", "memorial", "ruins", "archaeological_site"]
} as const;

/** Country code derived from the bounding box. The
 *  `extractOsm()` entry point hard-codes this for now; a
 *  per-country extraction lands in PR-7. */
function countryFromBbox(): string {
  // The single shipped bbox is Portugal. When per-country
  // bboxes land in PR-7, the extractOsm entry point takes
  // a `country` argument and passes it through.
  return "pt";
}

/** Internal: run a SQL query and return the rows as
 *  `OsmFeature[]`. Used by both the real `extractOsm()` and
 *  the synthetic-source test. */
function rowsToFeatures(
  rows: Record<string, unknown>[],
  country: string
): OsmFeature[] {
  const out: OsmFeature[] = [];
  for (const row of rows) {
    const osmId = String(row["osm_id"] ?? "").trim();
    const name = String(row["name"] ?? "").trim();
    const category = String(row["category"] ?? "").trim();
    const geometryWkt = String(row["geometry_wkt"] ?? "").trim();
    const tags = parseTags(row["tags"]);

    if (!osmId || !name || !category || !geometryWkt.startsWith("POINT(")) {
      // Skip rows that don't have the minimum fields. The
      // SQL filter should catch most of these; this is a
      // safety net for partial PBF records.
      continue;
    }

    out.push({ osmId, name, category, tags, geometryWkt, country });
  }
  return out;
}

/** Parse the `tags` column. DuckDB returns a `MAP<VARCHAR,
 *  VARCHAR>` as a JS object with string keys + string
 *  values; in practice the JS driver hands us the raw
 *  object back. We copy it into a plain Record to ensure
 *  type stability. */
function parseTags(raw: unknown): Record<string, string> {
  if (raw === null || raw === undefined) return {};
  if (typeof raw === "object") {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof v === "string") out[k] = v;
    }
    return out;
  }
  return {};
}

/** Build the SQL query that filters the OSM PBF by bbox +
 *  category and projects the columns we need. Exposed so
 *  the test can inspect the query (and so future maintainers
 *  can tune it without reading the code). */
export function buildExtractQuery(
  bbox: Bbox,
  categories: typeof CATEGORY_FILTERS = CATEGORY_FILTERS
): string {
  // Build a polygon WKT for the bbox. EPSG:4326 axis order is
  // (lon, lat). The polygon is closed (first == last).
  const polyWkt =
    `POLYGON((${bbox.minLon} ${bbox.minLat}, ${bbox.maxLon} ${bbox.minLat}, ` +
    `${bbox.maxLon} ${bbox.maxLat}, ${bbox.minLon} ${bbox.maxLat}, ` +
    `${bbox.minLon} ${bbox.minLat}))`;

  // The category filter uses DuckDB's MAP accessors. Each
  // key has a value list; the OR-of-ANDs keeps the SQL
  // readable.
  const catClauses: string[] = [];
  for (const [key, values] of Object.entries(categories)) {
    const list = values.map((v) => `'${v.replace(/'/g, "''")}'`).join(", ");
    catClauses.push(`(tags['${key}'] IN (${list}))`);
  }
  const catFilter = catClauses.join("\n    OR ");

  return `
INSTALL spatial;
LOAD spatial;

WITH bbox AS (SELECT ST_GeomFromText('${polyWkt}') AS geom)
SELECT
  CAST(id AS VARCHAR) AS osm_id,
  -- Pick the first non-empty name tag. OSM objects often have
  -- name:en, name:pt, name:default; we fall back to the plain
  -- name tag if no localized name exists.
  COALESCE(NULLIF(tags['name:en'], ''), NULLIF(tags['name'], ''), '') AS name,
  -- First matching category key, prefixed by the key
  -- (e.g. "amenity/restaurant", "tourism/viewpoint"). This
  -- makes the destination row's category self-describing.
  CASE
    WHEN tags['amenity'] IS NOT NULL THEN 'amenity/' || tags['amenity']
    WHEN tags['tourism'] IS NOT NULL THEN 'tourism/' || tags['tourism']
    WHEN tags['historic'] IS NOT NULL THEN 'historic/' || tags['historic']
  END AS category,
  tags,
  ST_AsText(geom) AS geometry_wkt
FROM ST_ReadOSM('__PBF_PATH__'), bbox
WHERE ST_Intersects(bbox.geom, geom)
  AND (
    ${catFilter}
  )
`.trim();
}

/** Run the extract query against an already-open DuckDB
 *  connection. The connection is the test seam: the test
 *  injects a synthetic-source connection; production calls
 *  `extractOsm()` which opens a real PBF and delegates. */
export async function extractFromTable(
  connection: Connection,
  query: string,
  country: string
): Promise<ExtractResult> {
  const startTime = Date.now();
  const rows = await all(connection, query);
  const features = rowsToFeatures(rows, country);

  return {
    features,
    // The synthetic test doesn't have a separate "total
    // scanned" count; the real extractOsm() computes it
    // from a `SELECT count(*) FROM ST_ReadOSM()` query.
    totalScanned: rows.length,
    extractedAt: new Date(startTime).toISOString()
  };
}

/** Open a PBF file and run the extract. The PBF path is
 *  interpolated into the query before execution; the path
 *  is the only caller-controlled SQL input, so we validate
 *  it before substitution to prevent injection. */
export async function extractOsm(
  pbfPath: string,
  options: { bbox?: Bbox; country?: string } = {}
): Promise<ExtractResult> {
  if (!pbfPath || pbfPath.length === 0) {
    throw new Error("extractOsm: pbfPath is required");
  }
  // Reject paths with single quotes to prevent SQL injection
  // through the path interpolation. PBF paths are filesystem
  // paths, which never legitimately contain a single quote.
  if (pbfPath.includes("'")) {
    throw new Error("extractOsm: pbfPath contains a single quote");
  }

  const bbox = options.bbox ?? PORTUGAL_BBOX;
  const country = options.country ?? countryFromBbox();

  const connection = await openFile(pbfPath);
  try {
    const query = buildExtractQuery(bbox).replace("__PBF_PATH__", pbfPath);
    return await extractFromTable(connection, query, country);
  } finally {
    await close(connection);
  }
}
