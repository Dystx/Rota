drop policy if exists trips_tenant_isolation on public.trips;
drop policy if exists organizations_self_read on public.organizations;
drop function if exists public.auth_in_org(uuid);
drop function if exists public.auth_org_id();

drop policy if exists chat_messages_read_all_participants on public.chat_messages;
drop policy if exists chat_messages_insert_own_role on public.chat_messages;
revoke all on public.chat_messages from public, anon, authenticated;
revoke all on public.itinerary_events from public, anon, authenticated;

create or replace function private.current_app_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select profile.app_role
      from public.user_profiles profile
      where profile.user_id = (select auth.uid())
      limit 1
    ),
    'none'
  );
$$;

create or replace function private.current_reviewer_id()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select link.reviewer_id
  from public.reviewer_auth_links link
  where link.user_id = (select auth.uid())
  limit 1;
$$;

revoke all on function private.current_app_role() from public, anon, authenticated;
revoke all on function private.current_reviewer_id() from public, anon, authenticated;
grant execute on function private.current_app_role() to authenticated, service_role;
grant execute on function private.current_reviewer_id() to authenticated, service_role;

-- The triage RPC is called exclusively by the server's service-role client.
-- It does not need elevated execution, so keep the public API entrypoint as
-- SECURITY INVOKER and avoid exposing another public SECURITY DEFINER helper.
create or replace function public.consume_triage_token(max_per_minute integer)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_bucket bigint := (extract(epoch from now())::bigint / 60);
  new_count integer;
begin
  delete from public.triage_rate_limit
  where minute_bucket < current_bucket - 5;

  insert into public.triage_rate_limit (minute_bucket, call_count)
  values (current_bucket, 1)
  on conflict (minute_bucket) do update
    set call_count = public.triage_rate_limit.call_count + 1,
        updated_at = now()
  returning call_count into new_count;

  return new_count <= max_per_minute;
end;
$$;

revoke all on function public.consume_triage_token(integer) from public, anon, authenticated;
grant execute on function public.consume_triage_token(integer) to service_role;
grant select, insert, update, delete on public.triage_rate_limit to service_role;

comment on function private.current_app_role() is 'Returns the role stored in user_profiles. It never trusts any JWT metadata.';
comment on table public.chat_messages is 'Quarantined legacy operator messages. Phase 4 replaces this with trip-scoped messaging and owner/reviewer RLS.';
