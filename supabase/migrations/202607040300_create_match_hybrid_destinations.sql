-- Phase 3 of the engineering lifecycle (Hybrid Search + RRF).
-- Reciprocal Rank Fusion combiner over the existing HNSW vector index
-- (places.embedding) and GIST spatial index (places.coordinates).
--
-- The lifecycle doc shows the function over a `destinations` table. Our schema
-- uses `places` (text PK) with the same column shape (geom GEOGRAPHY(Point, 4326)
-- + embedding HALFVEC(1536) added in 202607022000 + 202607032300). The function
-- signature is the same; the table name is the only difference. This migration
-- is additive — no other migration is changed.
--
-- The keyword ILIKE + similarity pass reads the descriptive text column
-- `places.local_notes` (added in 202604292240_create_places.sql). An earlier
-- draft of this migration referenced `places.description`; that column does
-- not exist on our schema. If you add a `description` column later, swap
-- `p.local_notes` → `p.description` in the `keyword_pass` CTE below.
--
-- RRF scoring (per the spec):  sum_m  1 / (k + rank_m(d))  with k=60. The
-- constant 60 prevents top ranks from dominating; it's the value used by
-- the original RRF paper and is hard-coded for stability.
--
-- Usage:  select * from match_hybrid_destinations(
--           embedding_param => (select embedding from places where id = 'lisbon-belem-tower'),
--           keyword_query    => 'sintra day trip',
--           target_lat       => 38.7,
--           target_lng       => -9.1,
--           radius_meters    => 50000
--         );
--
-- Returns up to 15 destinations, ranked by combined RRF score, restricted to
-- a `radius_meters` circle around (target_lng, target_lat).

create or replace function public.match_hybrid_destinations(
  embedding_param halfvec(1536),
  keyword_query    text,
  target_lat       double precision,
  target_lng       double precision,
  radius_meters    double precision default 50000
)
returns table (
  place_id      text,
  combined_score double precision
)
language sql
stable
as $$
  with center as (
    select st_setsrid(st_makepoint(target_lng, target_lat), 4326)::geography as geom
  ),
  semantic_pass as (
    select
      p.id,
      row_number() over (
        order by p.embedding <=> embedding_param
      ) as rank
    from public.places p, center c
    where p.embedding is not null
      and st_dwithin(p.coordinates::geography, c.geom, radius_meters)
    order by p.embedding <=> embedding_param
    limit 30
  ),
  keyword_pass as (
    select
      p.id,
      row_number() over (
        order by
          case
            when keyword_query is null or keyword_query = '' then 0
            else similarity(p.name || ' ' || coalesce(p.local_notes, ''), keyword_query)
          end desc
      ) as rank
    from public.places p, center c
    where
      (keyword_query is not null and keyword_query <> '')
      and (p.name ilike '%' || keyword_query || '%' or p.local_notes ilike '%' || keyword_query || '%')
      and st_dwithin(p.coordinates::geography, c.geom, radius_meters)
    limit 30
  ),
  fused as (
    select
      coalesce(s.id, k.id) as place_id,
      (coalesce(1.0 / (60.0 + s.rank), 0.0)
       + coalesce(1.0 / (60.0 + k.rank), 0.0))::double precision as combined_score
    from semantic_pass s
    full outer join keyword_pass k on s.id = k.id
  )
  select f.place_id, f.combined_score
  from fused f
  order by f.combined_score desc
  limit 15;
$$;

comment on function public.match_hybrid_destinations(
  halfvec(1536), text, double precision, double precision, double precision
) is 'RRF hybrid search over places.embedding (HNSW) + places.coordinates (GIST) + ILIKE keyword. Per Phase 3 of docs/engineering-lifecycle.md. Returns up to 15 places ranked by combined RRF score, restricted to radius_meters around the target point. RRF k=60. Drop-in replacement for the spec''s match_hybrid_destinations over the destinations table; our table is named places.';
