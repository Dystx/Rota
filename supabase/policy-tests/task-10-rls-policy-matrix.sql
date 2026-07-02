-- Task 10 static RLS policy checks.
-- Run against a local/staging Supabase database after migrations are applied.
-- This script intentionally avoids printing JWTs, secrets, connection strings, or full row data.

begin;

do $$
declare
  policy_count integer;
  unsafe_policy_count integer;
begin
  if has_table_privilege('anon', 'public.trip_briefs', 'select')
    or has_table_privilege('anon', 'public.trips', 'select')
    or has_table_privilege('anon', 'public.reviewer_assignments', 'select')
    or has_table_privilege('anon', 'public.booking_clicks', 'insert') then
    raise exception 'anon has direct private table privileges';
  end if;

  if has_table_privilege('authenticated', 'public.booking_clicks', 'insert') then
    raise exception 'authenticated has direct booking_clicks insert despite server-only click logging decision';
  end if;

  if has_sequence_privilege('authenticated', 'public.booking_clicks_id_seq', 'usage') then
    raise exception 'authenticated has booking_clicks sequence usage despite server-only click logging decision';
  end if;

  select count(*) into policy_count
  from pg_policies
  where schemaname = 'public'
    and policyname in (
      'trip_briefs_traveler_owner_select',
      'trip_briefs_traveler_owner_insert',
      'trip_briefs_traveler_owner_update',
      'trip_briefs_reviewer_assigned_select',
      'trip_briefs_admin_all',
      'trips_traveler_owner_select',
      'trips_traveler_owner_insert',
      'trips_traveler_owner_update',
      'trips_reviewer_assigned_select',
      'trips_reviewer_assigned_update',
      'trips_admin_all',
      'places_admin_all',
      'regions_admin_all',
      'reviewers_reviewer_self_select',
      'reviewers_reviewer_self_update',
      'reviewers_admin_all',
      'partners_admin_all',
      'reviewer_assignments_reviewer_assigned_select',
      'reviewer_assignments_reviewer_assigned_update',
      'reviewer_assignments_admin_all',
      'booking_clicks_admin_select',
      'user_profiles_self_select',
      'user_profiles_admin_all',
      'reviewer_auth_links_self_select',
      'reviewer_auth_links_admin_all'
    );

  if policy_count <> 25 then
    raise exception 'expected 25 task-10 policies, found %', policy_count;
  end if;

  select count(*) into unsafe_policy_count
  from pg_policies
  where schemaname = 'public'
    and (
      lower(coalesce(qual, '')) in ('true', '(true)')
      or lower(coalesce(with_check, '')) in ('true', '(true)')
      or lower(coalesce(qual, '') || ' ' || coalesce(with_check, '')) like '%user_metadata%'
      or lower(coalesce(qual, '') || ' ' || coalesce(with_check, '')) like '%raw_user_meta_data%'
    );

  if unsafe_policy_count <> 0 then
    raise exception 'found unsafe broad or user-metadata-based policy predicates: %', unsafe_policy_count;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and 'anon' = any(roles)
  ) then
    raise exception 'anon policies are present despite no direct public table-read decision';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'trips'
      and policyname = 'trips_traveler_owner_select'
      and cmd = 'SELECT'
      and lower(qual) like '%owner_user_id%'
      and lower(qual) like '%auth.uid%'
      and lower(qual) like '%current_app_role%'
      and lower(qual) like '%traveler%'
  ) then
    raise exception 'traveler trip ownership SELECT policy is missing or no longer owner/role scoped';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'trips'
      and policyname = 'trips_reviewer_assigned_select'
      and cmd = 'SELECT'
      and lower(qual) like '%current_app_role%'
      and lower(qual) like '%reviewer%'
      and lower(qual) like '%reviewer_assignments%'
      and lower(qual) like '%current_reviewer_id%'
  ) then
    raise exception 'reviewer assigned-trip SELECT policy is missing or no longer assignment/role scoped';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'places'
      and policyname = 'places_admin_all'
      and cmd = 'ALL'
      and lower(qual) like '%current_app_role%'
      and lower(qual) like '%admin%'
      and lower(with_check) like '%current_app_role%'
      and lower(with_check) like '%admin%'
  ) then
    raise exception 'admin CMS policy is missing or no longer admin-role scoped';
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and (
        lower(coalesce(qual, '')) like '%''none''%'
        or lower(coalesce(with_check, '')) like '%''none''%'
      )
  ) then
    raise exception 'outsider none-role policy path exists unexpectedly';
  end if;

  if exists (
    select 1
    from pg_proc
    join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.prosecdef
  ) then
    raise exception 'security definer functions exist in exposed public schema';
  end if;
end $$;

select 'PASS: task-10 static RLS/grant assertions succeeded' as result;

rollback;
