create index if not exists trips_created_at_idx
  on public.trips(created_at desc);

create index if not exists trips_owner_user_id_status_created_at_idx
  on public.trips(owner_user_id, status, created_at desc);

create index if not exists trips_status_created_at_idx
  on public.trips(status, created_at desc);

create index if not exists trips_trip_brief_id_idx
  on public.trips(trip_brief_id);

create index if not exists trip_briefs_status_created_at_idx
  on public.trip_briefs(status, created_at desc);

create index if not exists reviewer_assignments_reviewer_id_created_at_idx
  on public.reviewer_assignments(reviewer_id, created_at desc);

create index if not exists reviewer_assignments_reviewer_id_status_created_at_idx
  on public.reviewer_assignments(reviewer_id, status, created_at desc);

create index if not exists reviewer_assignments_trip_id_created_at_idx
  on public.reviewer_assignments(trip_id, created_at desc);

create index if not exists booking_clicks_created_at_idx
  on public.booking_clicks(created_at desc);

create index if not exists booking_clicks_partner_id_created_at_idx
  on public.booking_clicks(partner_id, created_at desc);

create index if not exists booking_clicks_trip_id_created_at_idx
  on public.booking_clicks(trip_id, created_at desc)
  where trip_id is not null;

create index if not exists places_created_at_idx
  on public.places(created_at desc);

create index if not exists regions_created_at_idx
  on public.regions(created_at desc);

create index if not exists partners_created_at_idx
  on public.partners(created_at desc);

create index if not exists reviewers_created_at_idx
  on public.reviewers(created_at desc);

create or replace function public.create_trip_draft(
  p_destination_country text,
  p_destination_regions text[],
  p_start_date date,
  p_end_date date,
  p_trip_length_days integer,
  p_travelers_count integer,
  p_traveler_type text,
  p_budget_level text,
  p_pace text,
  p_interests text[],
  p_food_preferences text[],
  p_avoidances text[],
  p_transport_mode text,
  p_accommodation_location text,
  p_raw_input text,
  p_normalized_json jsonb,
  p_title text,
  p_owner_user_id uuid default null
)
returns table(trip_brief_id bigint, trip_id bigint)
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_trip_brief_id bigint;
  v_trip_id bigint;
begin
  insert into public.trip_briefs (
    accommodation_location,
    avoidances,
    budget_level,
    destination_country,
    destination_regions,
    end_date,
    food_preferences,
    interests,
    normalized_json,
    owner_user_id,
    pace,
    raw_input,
    start_date,
    status,
    transport_mode,
    traveler_type,
    travelers_count,
    trip_length_days
  )
  values (
    p_accommodation_location,
    p_avoidances,
    p_budget_level,
    p_destination_country,
    p_destination_regions,
    p_end_date,
    p_food_preferences,
    p_interests,
    p_normalized_json,
    p_owner_user_id,
    p_pace,
    p_raw_input,
    p_start_date,
    'submitted',
    p_transport_mode,
    p_traveler_type,
    p_travelers_count,
    p_trip_length_days
  )
  returning id into v_trip_brief_id;

  insert into public.trips (
    country_slug,
    has_human_review,
    is_paid,
    owner_user_id,
    status,
    title,
    trip_brief_id,
    visibility
  )
  values (
    p_destination_country,
    false,
    false,
    p_owner_user_id,
    'draft',
    p_title,
    v_trip_brief_id,
    'private'
  )
  returning id into v_trip_id;

  trip_brief_id := v_trip_brief_id;
  trip_id := v_trip_id;
  return next;
end;
$$;

revoke all on function public.create_trip_draft(
  text,
  text[],
  date,
  date,
  integer,
  integer,
  text,
  text,
  text,
  text[],
  text[],
  text[],
  text,
  text,
  text,
  jsonb,
  text,
  uuid
) from public, anon, authenticated;

grant execute on function public.create_trip_draft(
  text,
  text[],
  date,
  date,
  integer,
  integer,
  text,
  text,
  text,
  text[],
  text[],
  text[],
  text,
  text,
  text,
  jsonb,
  text,
  uuid
) to service_role;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'trip_briefs_destination_country_check'
  ) then
    alter table public.trip_briefs
      add constraint trip_briefs_destination_country_check
      check (destination_country = 'portugal') not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'trip_briefs_trip_length_days_check'
  ) then
    alter table public.trip_briefs
      add constraint trip_briefs_trip_length_days_check
      check (trip_length_days between 2 and 21) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'trip_briefs_travelers_count_check'
  ) then
    alter table public.trip_briefs
      add constraint trip_briefs_travelers_count_check
      check (travelers_count between 1 and 12) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'trip_briefs_date_pair_check'
  ) then
    alter table public.trip_briefs
      add constraint trip_briefs_date_pair_check
      check ((start_date is null and end_date is null) or (start_date is not null and end_date is not null)) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'trip_briefs_date_order_check'
  ) then
    alter table public.trip_briefs
      add constraint trip_briefs_date_order_check
      check (start_date is null or end_date is null or end_date >= start_date) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'trip_briefs_traveler_type_check'
  ) then
    alter table public.trip_briefs
      add constraint trip_briefs_traveler_type_check
      check (traveler_type in ('solo', 'couple', 'family', 'friends')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'trip_briefs_budget_level_check'
  ) then
    alter table public.trip_briefs
      add constraint trip_briefs_budget_level_check
      check (budget_level in ('budget', 'mid-range', 'premium')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'trip_briefs_pace_check'
  ) then
    alter table public.trip_briefs
      add constraint trip_briefs_pace_check
      check (pace in ('calm', 'balanced', 'full')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'trip_briefs_transport_mode_check'
  ) then
    alter table public.trip_briefs
      add constraint trip_briefs_transport_mode_check
      check (transport_mode in ('no-car', 'rental-car', 'train-and-transfers')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'trip_briefs_status_check'
  ) then
    alter table public.trip_briefs
      add constraint trip_briefs_status_check
      check (status in ('submitted')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'trips_status_check'
  ) then
    alter table public.trips
      add constraint trips_status_check
      check (status in ('draft', 'paid', 'in_review', 'reviewed')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'trips_visibility_check'
  ) then
    alter table public.trips
      add constraint trips_visibility_check
      check (visibility in ('private')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'trips_review_status_check'
  ) then
    alter table public.trips
      add constraint trips_review_status_check
      check (
        (status <> 'paid' or is_paid)
        and (status <> 'in_review' or is_paid)
        and (status <> 'reviewed' or (is_paid and has_human_review))
      ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'places_quality_check'
  ) then
    alter table public.places
      add constraint places_quality_check
      check (quality is null or (quality >= 0 and quality <= 10)) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'places_source_confidence_check'
  ) then
    alter table public.places
      add constraint places_source_confidence_check
      check (source_confidence in ('Low', 'Medium', 'High', 'Pending')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'regions_launch_status_check'
  ) then
    alter table public.regions
      add constraint regions_launch_status_check
      check (launch_status in ('Research', 'Planned', 'Active')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'reviewers_status_check'
  ) then
    alter table public.reviewers
      add constraint reviewers_status_check
      check (status in ('Onboarding', 'Active', 'Inactive')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'reviewers_rating_check'
  ) then
    alter table public.reviewers
      add constraint reviewers_rating_check
      check (rating is null or (rating >= 0 and rating <= 5)) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'partners_status_check'
  ) then
    alter table public.partners
      add constraint partners_status_check
      check (status in ('Draft', 'Research', 'Candidate', 'Active')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'reviewer_assignments_status_check'
  ) then
    alter table public.reviewer_assignments
      add constraint reviewer_assignments_status_check
      check (status in ('assigned', 'submitted', 'completed', 'returned')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'reviewer_assignments_completed_at_check'
  ) then
    alter table public.reviewer_assignments
      add constraint reviewer_assignments_completed_at_check
      check (completed_at is null or status = 'completed') not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'booking_clicks_source_target_check'
  ) then
    alter table public.booking_clicks
      add constraint booking_clicks_source_target_check
      check (length(btrim(source)) > 0 and length(btrim(target)) > 0) not valid;
  end if;
end $$;

comment on index public.trips_created_at_idx is 'T11: supports service-owned trip draft lists ordered by newest first.';
comment on index public.trips_owner_user_id_status_created_at_idx is 'T11: supports owner/status trip lists under T10 traveler RLS and future authenticated list filters.';
comment on index public.trips_status_created_at_idx is 'T11: supports status-filtered reviewer/admin trip queues ordered by newest first.';
comment on index public.trips_trip_brief_id_idx is 'T11: supports trip-to-brief joins and reviewer trip_briefs RLS EXISTS predicates.';
comment on index public.trip_briefs_status_created_at_idx is 'T11: supports status-filtered trip brief operations ordered by newest first.';
comment on index public.reviewer_assignments_reviewer_id_created_at_idx is 'T11: supports reviewer assignment history by reviewer ordered by newest first.';
comment on index public.reviewer_assignments_reviewer_id_status_created_at_idx is 'T11: supports reviewer queue/status filters and reviewer-scoped RLS predicates.';
comment on index public.reviewer_assignments_trip_id_created_at_idx is 'T11: supports latest assignment lookup for a trip.';
comment on index public.booking_clicks_created_at_idx is 'T11: supports booking click analytics lists ordered by newest first.';
comment on index public.booking_clicks_partner_id_created_at_idx is 'T11: supports partner click analytics by partner and date.';
comment on index public.booking_clicks_trip_id_created_at_idx is 'T11: supports trip click analytics by trip and date for non-null trip associations.';
comment on index public.places_created_at_idx is 'T11: supports admin CMS place lists ordered by newest first.';
comment on index public.regions_created_at_idx is 'T11: supports admin CMS region lists ordered by newest first.';
comment on index public.partners_created_at_idx is 'T11: supports admin CMS partner lists ordered by newest first.';
comment on index public.reviewers_created_at_idx is 'T11: supports admin CMS reviewer lists ordered by newest first.';
comment on function public.create_trip_draft(
  text,
  text[],
  date,
  date,
  integer,
  integer,
  text,
  text,
  text,
  text[],
  text[],
  text[],
  text,
  text,
  text,
  jsonb,
  text,
  uuid
) is 'T11 service-role-only RPC. Postgres executes the brief and trip inserts in one statement transaction, so a trip insert failure rolls back the trip_briefs insert.';
