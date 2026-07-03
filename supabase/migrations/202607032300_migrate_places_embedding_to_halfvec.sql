-- Migrate places.embedding from VECTOR(1536) to HALFVEC(1536) for memory
-- efficiency, with headroom to grow to HALFVEC(3072) when we upgrade from
-- text-embedding-3-small (1536-dim) to text-embedding-3-large (3072-dim).
--
-- Why HALFVEC:
--   - 2 bytes/dim vs 4 bytes/dim for VECTOR. For a 1536-dim vector that
--     is 3KB/row vs 6KB/row; for the HNSW index the savings compound.
--   - cosine distance is the same; HNSW operator class for halfvec is
--     `halfvec_cosine_ops` (pgvector 0.7.0+).
--   - The forward-compat path is straightforward: ALTER ... TYPE
--     HALFVEC(3072) when we ship the larger model. pgvector widens the
--     column on ALTER (no rewrite if you keep the same dim).
--
-- Why this migration is conditional:
--   - halfvec was added in pgvector 0.7.0 (Aug 2023). Supabase has shipped
--     0.7.0+ for ~2 years, but we guard with a DO block so older
--     instances skip gracefully instead of failing. The HNSW index and
--     column type stay at VECTOR(1536) in that case.
--   - HNSW index build is memory-hungry. See
--     packages/ingest/README.md § "HNSW index build — memory budget" for
--     the maintenance_work_mem + VACUUM ANALYZE ritual to run around
--     this migration. Without that, the index build OOMs and the
--     migration rolls back.

do $$
declare
  v_has_halfvec boolean;
  v_index_name  constant text := 'places_embedding_hnsw';
begin
  select exists (select 1 from pg_type where typname = 'halfvec') into v_has_halfvec;

  if not v_has_halfvec then
    raise notice 'pgvector halfvec type not available on this instance; skipping embedding halfvec migration';
    return;
  end if;

  -- 1) Drop the existing HNSW index on VECTOR(1536). Required because the
  --    index column type is changing.
  execute format('drop index if exists public.%I', v_index_name);

  -- 2) Migrate the column type. Using USING ... ::halfvec(1536) so the
  --    cast happens in-place; pgvector's vector -> halfvec cast is a
  --    bin-exact reinterpretation, not a re-embedding.
  alter table public.places
    alter column embedding type halfvec(1536) using embedding::halfvec(1536);

  -- 3) Recreate the HNSW index on the new column type. We use the same
  --    operator class as before; pgvector ships halfvec_cosine_ops
  --    alongside vector_cosine_ops. `m=16, ef_construction=64` are the
  --    pgvector defaults and are fine for our corpus size.
  execute format(
    'create index %I on public.places using hnsw (embedding halfvec_cosine_ops) '
    'with (m = 16, ef_construction = 64)',
    v_index_name
  );

  -- 4) Update the column comment so future readers know which model +
  --    precision is the source of truth.
  comment on column public.places.embedding is
    'OpenAI text-embedding-3-small vector (1536 dims), stored as HALFVEC(1536) (2 bytes/dim). '
    'Forward-compat: ALTER TYPE HALFVEC(3072) when we upgrade to text-embedding-3-large.';
end
$$ language plpgsql;
