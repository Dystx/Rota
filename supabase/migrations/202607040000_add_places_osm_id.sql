-- Add `osm_id` to `places` for the ingest upsert target.
--
-- Why this migration:
--   The data pipeline (PR-5) calls
--     .upsert(rows, { onConflict: "osm_id", count: "exact" })
--   against `public.places` (`packages/ingest/src/supabase-loader.ts:76`),
--   but the current `places` schema has no `osm_id` column — the PK is
--   `id text` (the v1 editorial UUID). The string `osm_id` appears 0
--   times in any active migration; without this column, every
--   `loadPlaces` row fails on first ingest run.
--
-- Why a partial unique index instead of a primary-key switch:
--   The editorial v1 rows (curated by humans for the launch marketing
--   surfaces) have meaningful `id text` PKs and no OSM id. Switching
--   the PK would break them. The partial index `where osm_id is not
--   null` lets the ingest pipeline's `ON CONFLICT (osm_id)` upsert
--   target new OSM rows while leaving editorial rows untouched. When
--   the editorial v1 set is retired (post-GA cleanup), the column can
--   be promoted to a full NOT NULL UNIQUE.
--
-- Type choice:
--   DuckDB's extract emits OSM `id` as VARCHAR
--   (`packages/ingest/src/extract.ts:157`); the JS side coerces to
--   string (`packages/ingest/src/extract.ts:91`); the ingest contract
--   is `PlaceRow.osmId: string` (`packages/ingest/src/types.ts:223`).
--   The OSM stable id is a 64-char-or-less string; `text` is the right
--   type. `varchar(64)` is the planned per-spec cap from
--   `docs/engineering-lifecycle.md:95`.

alter table public.places
  add column if not exists osm_id text;

create unique index if not exists places_osm_id_unique
  on public.places (osm_id)
  where osm_id is not null;

comment on column public.places.osm_id is
  'OSM stable id; ON CONFLICT target for ingest pipeline (PR-5). '
  'Editorial v1 rows may have null osm_id. '
  'See packages/ingest/src/supabase-loader.ts:76 for the upsert contract.';
