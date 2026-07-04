-- Append-only audit log for specialist feedback on places.
--
-- Why this migration:
--   The side-by-side review panel exposes `onSwapForHiddenGem` and
--   `onFixLogisticsBottleneck` callbacks
--   (apps/web/app/console/_components/raw-ai-vs-editable-panel.tsx:42-43)
--   and `decrementPlaceQuality` in `packages/db/src/places.ts:153-173`
--   already mutates `places.quality`. What's missing is the
--   attribution: who did the action, on which trip, and why. Without
--   the audit log, "if N specialists flag the same place in M days"
--   aggregations are impossible (the future-state aggregation job
--   noted in `places.ts:148-151`).
--
-- Schema choices:
--   - `place_id text not null references public.places(id) on delete cascade`
--     — matches the `id text` PK on `places` (v1 editorial schema;
--     osm_id rows land with a text OSM id when the pipeline runs).
--     Cascade on delete: a place going away takes its audit trail.
--   - `specialist_id uuid not null references public.specialist_profiles(id)
--     on delete restrict` — the specialist's profile id. The
--     auth.user is reachable via `specialist_profiles.user_id` if
--     needed later. `restrict` (not cascade) so a removed specialist
--     keeps their attribution history; the row stays but
--     `specialist_profiles.is_verified = false` flags it.
--   - `trip_id bigint references public.trips(id) on delete set null` —
--     nullable: a swap from the global map (no trip context) is valid.
--     `trips.id` is bigint per
--     202604291900_create_trip_briefs_and_trips.sql:25. Set null on
--     delete: a deleted trip doesn't drag the audit trail with it.
--   - `delta numeric not null` — signed; negative when quality dropped
--     (the only path today, via `decrementPlaceQuality`).
--   - `reason text not null check (reason in (...))` — enum-like
--     constraint; add new reasons here as the panel grows new
--     callbacks.
--   - `created_at timestamptz not null default now()` — no
--     `updated_at` (append-only).

create table if not exists public.place_adjustment_log (
  id uuid primary key default gen_random_uuid(),
  place_id text not null references public.places(id) on delete cascade,
  specialist_id uuid not null references public.specialist_profiles(id) on delete restrict,
  trip_id bigint references public.trips(id) on delete set null,
  delta numeric not null,
  reason text not null check (reason in ('swap_for_hidden_gem', 'fix_logistics_bottleneck')),
  created_at timestamptz not null default now()
);

create index if not exists place_adjustment_log_place_id_created_at_idx
  on public.place_adjustment_log (place_id, created_at desc);

create index if not exists place_adjustment_log_specialist_id_idx
  on public.place_adjustment_log (specialist_id, created_at desc);

comment on table public.place_adjustment_log is
  'Append-only audit log for specialist feedback on places. '
  'Written by decrementPlaceQuality when {specialistId, tripId, reason} are provided. '
  'See packages/db/src/places.ts:153-173 for the writer.';

comment on column public.place_adjustment_log.delta is
  'Signed quality delta. The current code path always writes negative '
  'values (decrementPlaceQuality floors at 0); the column is signed '
  'so a future positive-up path (e.g. an admin override) does not '
  'require a schema change.';

alter table public.place_adjustment_log enable row level security;

-- Specialist can insert their own log rows; everyone can read.
drop policy if exists place_adjustment_log_self_insert on public.place_adjustment_log;
create policy place_adjustment_log_self_insert on public.place_adjustment_log
  for insert to authenticated
  with check (
    specialist_id in (
      select id from public.specialist_profiles where user_id = auth.uid()
    )
  );

drop policy if exists place_adjustment_log_read_all on public.place_adjustment_log;
create policy place_adjustment_log_read_all on public.place_adjustment_log
  for select to authenticated
  using (true);
