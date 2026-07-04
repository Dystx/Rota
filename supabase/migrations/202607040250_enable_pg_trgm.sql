-- Enable pg_trgm for the hybrid search function.
--
-- `match_hybrid_destinations` (created in 202607040300) uses
-- `similarity()` in its keyword_pass CTE. That function is provided
-- by the `pg_trgm` extension, which is not in the 202607022000
-- extension-enable migration (that file ships only postgis + vector).
--
-- Apply order: this file must run BEFORE 202607040300. The filename
-- timestamp 202607040250 sorts between 202607040200 (specialist_capabilities)
-- and 202607040300 (match_hybrid_destinations), so the supabase CLI
-- applies it in the right place.
--
-- Idempotent: re-running is a no-op (extension + index both use IF NOT EXISTS).
--
-- Bonus: a GIN trigram index on `places.local_notes` speeds up the
-- `ILIKE` filter inside `keyword_pass` from a sequential scan to an
-- index scan. The `pg_trgm` extension must exist before the index can
-- use the `gin_trgm_ops` opclass.

create extension if not exists pg_trgm;

create index if not exists places_local_notes_trgm_gin
  on public.places
  using gin (local_notes gin_trgm_ops);
