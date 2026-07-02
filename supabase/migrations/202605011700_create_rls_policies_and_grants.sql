create schema if not exists private;

revoke all on schema public from public;
grant usage on schema public to anon, authenticated, service_role;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

revoke all on all tables in schema public from anon, authenticated, public;
revoke all on all sequences in schema public from anon, authenticated, public;
alter default privileges in schema public revoke all on tables from anon, authenticated, public;
alter default privileges in schema public revoke all on sequences from anon, authenticated, public;

create or replace function private.current_app_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (
      select user_profiles.app_role
      from public.user_profiles
      where user_profiles.user_id = (select auth.uid())
      limit 1
    ),
    (select auth.jwt() -> 'app_metadata' ->> 'role'),
    'none'
  );
$$;

create or replace function private.current_reviewer_id()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select reviewer_auth_links.reviewer_id
  from public.reviewer_auth_links
  where reviewer_auth_links.user_id = (select auth.uid())
  limit 1;
$$;

revoke all on function private.current_app_role() from public, anon, authenticated;
revoke all on function private.current_reviewer_id() from public, anon, authenticated;
grant execute on function private.current_app_role() to authenticated;
grant execute on function private.current_reviewer_id() to authenticated;

create index if not exists reviewer_assignments_reviewer_trip_idx
  on public.reviewer_assignments(reviewer_id, trip_id);

alter table public.trip_briefs enable row level security;
alter table public.trips enable row level security;
alter table public.places enable row level security;
alter table public.regions enable row level security;
alter table public.reviewers enable row level security;
alter table public.partners enable row level security;
alter table public.reviewer_assignments enable row level security;
alter table public.booking_clicks enable row level security;
alter table public.user_profiles enable row level security;
alter table public.reviewer_auth_links enable row level security;

drop policy if exists "trip_briefs_traveler_owner_select" on public.trip_briefs;
drop policy if exists "trip_briefs_traveler_owner_insert" on public.trip_briefs;
drop policy if exists "trip_briefs_traveler_owner_update" on public.trip_briefs;
drop policy if exists "trip_briefs_reviewer_assigned_select" on public.trip_briefs;
drop policy if exists "trip_briefs_admin_all" on public.trip_briefs;
drop policy if exists "trips_traveler_owner_select" on public.trips;
drop policy if exists "trips_traveler_owner_insert" on public.trips;
drop policy if exists "trips_traveler_owner_update" on public.trips;
drop policy if exists "trips_reviewer_assigned_select" on public.trips;
drop policy if exists "trips_reviewer_assigned_update" on public.trips;
drop policy if exists "trips_admin_all" on public.trips;
drop policy if exists "places_admin_all" on public.places;
drop policy if exists "regions_admin_all" on public.regions;
drop policy if exists "reviewers_reviewer_self_select" on public.reviewers;
drop policy if exists "reviewers_reviewer_self_update" on public.reviewers;
drop policy if exists "reviewers_admin_all" on public.reviewers;
drop policy if exists "partners_admin_all" on public.partners;
drop policy if exists "reviewer_assignments_reviewer_assigned_select" on public.reviewer_assignments;
drop policy if exists "reviewer_assignments_reviewer_assigned_update" on public.reviewer_assignments;
drop policy if exists "reviewer_assignments_admin_all" on public.reviewer_assignments;
drop policy if exists "booking_clicks_admin_select" on public.booking_clicks;
drop policy if exists "user_profiles_self_select" on public.user_profiles;
drop policy if exists "user_profiles_admin_all" on public.user_profiles;
drop policy if exists "reviewer_auth_links_self_select" on public.reviewer_auth_links;
drop policy if exists "reviewer_auth_links_admin_all" on public.reviewer_auth_links;

create policy "trip_briefs_traveler_owner_select"
on public.trip_briefs
for select
to authenticated
using (
  owner_user_id = (select auth.uid())
  and (select private.current_app_role()) = 'traveler'
);

create policy "trip_briefs_traveler_owner_insert"
on public.trip_briefs
for insert
to authenticated
with check (
  owner_user_id = (select auth.uid())
  and (select private.current_app_role()) = 'traveler'
);

create policy "trip_briefs_traveler_owner_update"
on public.trip_briefs
for update
to authenticated
using (
  owner_user_id = (select auth.uid())
  and (select private.current_app_role()) = 'traveler'
)
with check (
  owner_user_id = (select auth.uid())
  and (select private.current_app_role()) = 'traveler'
);

create policy "trip_briefs_reviewer_assigned_select"
on public.trip_briefs
for select
to authenticated
using (
  (select private.current_app_role()) = 'reviewer'
  and exists (
    select 1
    from public.trips
    join public.reviewer_assignments
      on reviewer_assignments.trip_id = trips.id
    where trips.trip_brief_id = trip_briefs.id
      and reviewer_assignments.reviewer_id = (select private.current_reviewer_id())
  )
);

create policy "trip_briefs_admin_all"
on public.trip_briefs
for all
to authenticated
using ((select private.current_app_role()) = 'admin')
with check ((select private.current_app_role()) = 'admin');

create policy "trips_traveler_owner_select"
on public.trips
for select
to authenticated
using (
  owner_user_id = (select auth.uid())
  and (select private.current_app_role()) = 'traveler'
);

create policy "trips_traveler_owner_insert"
on public.trips
for insert
to authenticated
with check (
  owner_user_id = (select auth.uid())
  and (select private.current_app_role()) = 'traveler'
);

create policy "trips_traveler_owner_update"
on public.trips
for update
to authenticated
using (
  owner_user_id = (select auth.uid())
  and (select private.current_app_role()) = 'traveler'
)
with check (
  owner_user_id = (select auth.uid())
  and (select private.current_app_role()) = 'traveler'
);

create policy "trips_reviewer_assigned_select"
on public.trips
for select
to authenticated
using (
  (select private.current_app_role()) = 'reviewer'
  and exists (
    select 1
    from public.reviewer_assignments
    where reviewer_assignments.trip_id = trips.id
      and reviewer_assignments.reviewer_id = (select private.current_reviewer_id())
  )
);

create policy "trips_reviewer_assigned_update"
on public.trips
for update
to authenticated
using (
  (select private.current_app_role()) = 'reviewer'
  and exists (
    select 1
    from public.reviewer_assignments
    where reviewer_assignments.trip_id = trips.id
      and reviewer_assignments.reviewer_id = (select private.current_reviewer_id())
  )
)
with check (
  (select private.current_app_role()) = 'reviewer'
  and exists (
    select 1
    from public.reviewer_assignments
    where reviewer_assignments.trip_id = trips.id
      and reviewer_assignments.reviewer_id = (select private.current_reviewer_id())
  )
);

create policy "trips_admin_all"
on public.trips
for all
to authenticated
using ((select private.current_app_role()) = 'admin')
with check ((select private.current_app_role()) = 'admin');

create policy "places_admin_all"
on public.places
for all
to authenticated
using ((select private.current_app_role()) = 'admin')
with check ((select private.current_app_role()) = 'admin');

create policy "regions_admin_all"
on public.regions
for all
to authenticated
using ((select private.current_app_role()) = 'admin')
with check ((select private.current_app_role()) = 'admin');

create policy "reviewers_reviewer_self_select"
on public.reviewers
for select
to authenticated
using (
  id = (select private.current_reviewer_id())
  and (select private.current_app_role()) = 'reviewer'
);

create policy "reviewers_reviewer_self_update"
on public.reviewers
for update
to authenticated
using (
  id = (select private.current_reviewer_id())
  and (select private.current_app_role()) = 'reviewer'
)
with check (
  id = (select private.current_reviewer_id())
  and (select private.current_app_role()) = 'reviewer'
);

create policy "reviewers_admin_all"
on public.reviewers
for all
to authenticated
using ((select private.current_app_role()) = 'admin')
with check ((select private.current_app_role()) = 'admin');

create policy "partners_admin_all"
on public.partners
for all
to authenticated
using ((select private.current_app_role()) = 'admin')
with check ((select private.current_app_role()) = 'admin');

create policy "reviewer_assignments_reviewer_assigned_select"
on public.reviewer_assignments
for select
to authenticated
using (
  reviewer_id = (select private.current_reviewer_id())
  and (select private.current_app_role()) = 'reviewer'
);

create policy "reviewer_assignments_reviewer_assigned_update"
on public.reviewer_assignments
for update
to authenticated
using (
  reviewer_id = (select private.current_reviewer_id())
  and (select private.current_app_role()) = 'reviewer'
)
with check (
  reviewer_id = (select private.current_reviewer_id())
  and (select private.current_app_role()) = 'reviewer'
);

create policy "reviewer_assignments_admin_all"
on public.reviewer_assignments
for all
to authenticated
using ((select private.current_app_role()) = 'admin')
with check ((select private.current_app_role()) = 'admin');

create policy "booking_clicks_admin_select"
on public.booking_clicks
for select
to authenticated
using ((select private.current_app_role()) = 'admin');

create policy "user_profiles_self_select"
on public.user_profiles
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "user_profiles_admin_all"
on public.user_profiles
for all
to authenticated
using ((select private.current_app_role()) = 'admin')
with check ((select private.current_app_role()) = 'admin');

create policy "reviewer_auth_links_self_select"
on public.reviewer_auth_links
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "reviewer_auth_links_admin_all"
on public.reviewer_auth_links
for all
to authenticated
using ((select private.current_app_role()) = 'admin')
with check ((select private.current_app_role()) = 'admin');

grant select, insert, update on public.trip_briefs to authenticated;
grant select, insert, update on public.trips to authenticated;
grant select, insert, update, delete on public.places to authenticated;
grant select, insert, update, delete on public.regions to authenticated;
grant select, insert, update, delete on public.reviewers to authenticated;
grant select, insert, update, delete on public.partners to authenticated;
grant select, insert, update, delete on public.reviewer_assignments to authenticated;
grant select on public.booking_clicks to authenticated;
grant select, insert, update, delete on public.user_profiles to authenticated;
grant select, insert, update, delete on public.reviewer_auth_links to authenticated;

grant usage, select on sequence public.trip_briefs_id_seq to authenticated;
grant usage, select on sequence public.trips_id_seq to authenticated;
grant usage, select on sequence public.reviewer_assignments_id_seq to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

comment on schema private is 'Internal helper schema for RLS predicates. Do not add this schema to Supabase exposed schemas.';
comment on function private.current_app_role() is 'Returns trusted role from user_profiles, falling back to immutable Auth app_metadata role. Never reads user_metadata.';
comment on function private.current_reviewer_id() is 'Returns the trusted reviewer id linked to the current authenticated user for reviewer-scoped RLS.';
comment on table public.booking_clicks is 'Direct client writes are intentionally not granted. Public /api/partner-clicks logging stays server-owned; authenticated admins may read analytics through RLS.';
comment on table public.partners is 'Admin-only direct table access for the current T3 model. Traveler partner offers remain server-rendered until a separate public-safe read model exists.';
comment on table public.places is 'Admin-only direct table access for the current T3 admin CMS model. Public place discovery requires a separate scoped read model.';
comment on table public.regions is 'Admin-only direct table access for the current T3 admin country/region model. Public marketing pages do not need Data API grants.';
