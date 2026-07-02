-- Enable PostGIS + pgvector; extend `places` with spatial + semantic columns.
--
-- Spec: docs/spec.md §5 (database schema), docs/spec-refined-2026.md §4
-- (refined Phase 2: Knowledge Graph Seeding — Portugal Module).
--
-- Apply order:
--   1. This migration first (idempotent: extensions + add column with IF NOT EXISTS).
--   2. Seed place lists for Lisbon, Sintra, Porto, Algarve (Phase 6.1).
--   3. Generate text descriptions -> pgvector embeddings (Phase 6.2).
--
-- This migration does NOT backfill `coordinates` or `embedding` for existing rows.
-- Backfill is a separate phase (6.x) — embeddings are not free; existing places
-- without coordinates will have null spatial values until a geocoder pass runs.

-- ----------------------------------------------------------------------------
-- 1. Extensions
-- ----------------------------------------------------------------------------

create extension if not exists postgis;
create extension if not exists vector;

-- ----------------------------------------------------------------------------
-- 2. Extend `places` with the schema columns from docs/spec.md §5
-- ----------------------------------------------------------------------------

alter table public.places
  add column if not exists coordinates       GEOMETRY(Point, 4326),
  add column if not exists embedding          VECTOR(1536),
  add column if not exists opening_hours      JSONB,
  add column if not exists local_notes        TEXT,
  add column if not exists is_tourist_trap    BOOLEAN NOT NULL DEFAULT FALSE,
  add column if not exists average_spend      NUMERIC(6,2);

-- ----------------------------------------------------------------------------
-- 3. Indexes
-- ----------------------------------------------------------------------------

-- Spatial index (GIST) for PostGIS proximity queries
-- ("places within 5km of this accommodation")
create index if not exists places_coordinates_gist
  on public.places
  using gist (coordinates);

-- Semantic index (HNSW) for pgvector cosine-similarity nearest-neighbour
-- ("places matching this text description")
-- vector_cosine_ops is the right operator class for normalized embeddings
-- (OpenAI text-embedding-3-small returns normalized vectors).
create index if not exists places_embedding_hnsw
  on public.places
  using hnsw (embedding vector_cosine_ops);

-- ----------------------------------------------------------------------------
-- 4. Column comments (documentation only)
-- ----------------------------------------------------------------------------

comment on column public.places.coordinates is
  'PostGIS Point geometry in EPSG:4326 (WGS84). Source: geocoded address or manual pin.';

comment on column public.places.embedding is
  'OpenAI text-embedding-3-small vector (1536 dims). Generated from name + region + category + local_notes. Used by the Level 1 semantic retrieval step.';

comment on column public.places.opening_hours is
  'JSONB structured weekly hours. Example: {"mon":[["09:00","18:00"]],"tue":[["09:00","18:00"]]}. Used by Step 4 (Logic Validation) of the AI pipeline.';

comment on column public.places.is_tourist_trap is
  'Editorial flag (true if the place is overrated or carries heavy tourist markup). Used by the Invisible AI UI to suggest "Swap for hidden gems".';

comment on column public.places.average_spend is
  'Average per-person spend in EUR. Nullable. Used by budget-aware tier recommendations.';

-- ----------------------------------------------------------------------------
-- 5. RLS posture preserved
-- ----------------------------------------------------------------------------
-- The `places` table was already RLS-enabled with service_role grants
-- (see supabase/migrations/202604292240_create_places.sql). No policy
-- changes are required for this migration; new columns inherit the
-- existing grant scope.

-- ----------------------------------------------------------------------------
-- Verification queries (run after apply; do NOT include in CI):
-- ----------------------------------------------------------------------------
--   select extname, extversion from pg_extension
--     where extname in ('postgis','vector') order by extname;
--
--   select column_name, data_type from information_schema.columns
--     where table_schema='public' and table_name='places'
--     order by ordinal_position;
--
--   select indexname, indexdef from pg_indexes
--     where schemaname='public' and tablename='places'
--     and indexname in ('places_coordinates_gist','places_embedding_hnsw');