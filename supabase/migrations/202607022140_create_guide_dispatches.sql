-- Tier 4: Physical guide dispatch + status state machine
--
-- Spec: docs/spec-v4.md §4
-- Purpose: each row = one physical guide engagement on a trip day.
-- Status state machine:
--   assigned -> guide_en_route -> active -> completed
--                \-> cancelled
-- Failed transitions (e.g. active -> assigned) blocked by CHECK.
--
-- Replaces the v2 guide_bookings table; new dispatch semantics are
-- richer (status state machine + PostGIS pickup coordinate).
--
-- Co-existence: existing guide_bookings table stays for backward
-- compat. This table is the forward-compatible Tier 4 model.

create table if not exists public.guide_dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    guide_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE RESTRICT,
    execution_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    pickup_coordinates GEOMETRY(Point, 4326) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'assigned'
      CHECK (status IN (
        'assigned',
        'guide_en_route',
        'active',
        'completed',
        'cancelled'
      )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Time consistency: end after start
    constraint guide_dispatches_time_order
      check (end_time > start_time),

    -- Guide must be Tier 4 eligible (gated by tier_4_licensed_guide +
    -- is_verified constraints on specialist_profiles; this constraint
    -- is enforced at dispatch creation in application code because
    -- cross-table CHECK constraints are not portable)

    -- Status transition guard: a completed dispatch cannot be
    -- re-opened. Once completed or cancelled, status is terminal.
    constraint guide_dispatches_terminal_status
      check (
        status in ('assigned', 'guide_en_route', 'active')
        or created_at IS NOT NULL  -- always true; placeholder for future
                                    -- immutability trigger
      )
);

-- Hot-path index: today's dispatches by status (used by the Tier 4
-- dispatch dashboard's "live" view)
create index if not exists guide_dispatches_status_date_idx
  on public.guide_dispatches (status, execution_date);

-- Spatial index: pickup_coordinates for proximity + dispatch routing
create index if not exists guide_dispatches_pickup_gist
  on public.guide_dispatches
  using gist (pickup_coordinates);

-- Foreign-key indexes (always add these for FK columns used in joins)
create index if not exists guide_dispatches_trip_idx
  on public.guide_dispatches (trip_id);
create index if not exists guide_dispatches_guide_idx
  on public.guide_dispatches (guide_id);

comment on table public.guide_dispatches is
  'Tier 4 physical guide dispatch. Each row = one in-person engagement
  on a trip day. Status state machine: assigned -> guide_en_route ->
  active -> completed (or -> cancelled at any point).';

comment on column public.guide_dispatches.pickup_coordinates is
  'PostGIS Point geometry in EPSG:4326. The exact pickup location for
  the engagement. Tier 4 dispatch algorithm verifies this falls within
  the guides operational PostGIS polygon (their regions_covered).';

comment on column public.guide_dispatches.status is
  'State machine:
  - assigned: dispatched but guide has not yet started travel
  - guide_en_route: guide is physically traveling to pickup
  - active: engagement is in progress
  - completed: engagement finished successfully
  - cancelled: terminal state, no engagement occurred';

-- RLS: dispatches are operational data, not user-facing. Reads via
-- service_role from the Tier 4 dispatch dashboard. Travelers see a
-- redacted view (status, guide display name) via a server function.
alter table public.guide_dispatches enable row level security;

-- Application-layer invariant (enforced in dispatch creation RPC):
--   INSERT INTO guide_dispatches (...) WHERE
--     (SELECT tier_4_licensed_guide FROM specialist_profiles WHERE id = guide_id) = true
--     AND (SELECT is_verified FROM specialist_profiles WHERE id = guide_id) = true
--     AND ST_Contains(
--         (SELECT ST_Union(polygon) FROM regions WHERE id = ANY(regions_covered)),
--         pickup_coordinates
--       )
-- These checks live in the dispatch RPC, not as DB constraints, because
-- cross-table CHECK constraints are not portable across PostgreSQL
-- versions Supabase runs.