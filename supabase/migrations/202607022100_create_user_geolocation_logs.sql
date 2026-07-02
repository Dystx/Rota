-- Tier 3: User geolocation log layer for live tracking
--
-- Spec: docs/spec-v4.md §4
-- Purpose: stores the GPS coordinate stream from the mobile companion
-- app while a trip is active. Drives the Run-Time Geolocation Buffer
-- that detects "traveler is still at a museum at 14:30 when the next
-- stop is a 45-minute drive away" and triggers the auto-push booking
-- notification.
--
-- Apply order: after 202607022000 (places + embeddings), before any
-- trip is in active execution state.

create table if not exists public.user_geolocation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hot-path index: latest coordinate stream per trip
create index if not exists user_geolocation_logs_trip_recorded_idx
  on public.user_geolocation_logs (trip_id, recorded_at DESC);

-- Spatial index: PostGIS proximity queries ("is user within X km of
-- the next scheduled stop?")
create index if not exists user_geolocation_logs_coordinates_gist
  on public.user_geolocation_logs
  using gist (coordinates);

comment on table public.user_geolocation_logs is
  'Tier 3 GPS coordinate stream. Powers the Run-Time Geolocation Buffer
  (docs/spec-v4.md §2): pushes bookings when traveler falls behind schedule.';

comment on column public.user_geolocation_logs.coordinates is
  'PostGIS Point geometry in EPSG:4326 (WGS84). Source: mobile companion
  app GPS sampling at configurable cadence (default 60s when app is
  foregrounded, 5min when backgrounded).';

comment on column public.user_geolocation_logs.recorded_at is
  'Server-side ingestion timestamp. The mobile companion writes the
  device-local timestamp into metadata if drift > 30s detected.';

-- RLS posture: this table is server-only ingestion (mobile companion
-- uses service_role or a dedicated edge function). User-facing reads
-- are not exposed. Document the explicit policy below.
alter table public.user_geolocation_logs enable row level security;

-- No authenticated SELECT policy: geolocation history is operational
-- data, never user-facing. Specialists reviewing an active trip see
-- only the most recent coordinate (Tier 3 view), fetched through a
-- server function that respects trip ownership.
-- Inserts come from service_role via the geolocation edge function only.

-- Note: when applying on hosted, also add retention policy (e.g.,
-- DELETE WHERE recorded_at < NOW() - INTERVAL '30 days' via cron) to
-- prevent unbounded growth.