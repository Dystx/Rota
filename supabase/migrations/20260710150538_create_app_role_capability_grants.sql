create schema if not exists private;

create table if not exists public.app_role_capability_grants (
  id uuid primary key default gen_random_uuid(),
  subject_user_id uuid not null references auth.users(id) on delete cascade,
  app_role text not null check (app_role in ('traveler', 'reviewer', 'admin')),
  capability text not null check (capability in (
    'access:manage', 'content:manage', 'operations:manage', 'analytics:read',
    'configuration:deploy', 'developer_docs:read', 'specialists:verify'
  )),
  reason text not null check (length(trim(reason)) > 0),
  granted_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (revoked_at is null or revoked_at >= created_at)
);

create unique index if not exists app_role_capability_grants_active_unique
  on public.app_role_capability_grants(subject_user_id, capability)
  where revoked_at is null;

create index if not exists app_role_capability_grants_active_lookup
  on public.app_role_capability_grants(subject_user_id, capability, expires_at)
  where revoked_at is null;

create table if not exists public.app_role_capability_audit_events (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid not null references public.app_role_capability_grants(id) on delete cascade,
  action text not null check (action in ('granted', 'revoked')),
  actor_user_id uuid references auth.users(id) on delete set null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.app_role_capability_grants enable row level security;
alter table public.app_role_capability_audit_events enable row level security;

revoke all on public.app_role_capability_grants from public, anon, authenticated;
revoke all on public.app_role_capability_audit_events from public, anon, authenticated;
grant all on public.app_role_capability_grants to service_role;
grant all on public.app_role_capability_audit_events to service_role;

create or replace function private.has_app_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_profiles
    where subject_user_id = (select auth.uid())
      and app_role = required_role
  );
$$;

create or replace function private.has_capability(required_capability text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.app_role_capability_grants
    where user_id = (select auth.uid())
      and capability = required_capability
      and revoked_at is null
      and (expires_at is null or expires_at > now())
  );
$$;

create or replace function private.has_active_reviewer_assignment(required_trip_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.reviewer_assignments assignment
    join public.reviewer_auth_links link on link.reviewer_id = assignment.reviewer_id
    where assignment.trip_id = required_trip_id
      and link.user_id = (select auth.uid())
      and assignment.status in ('assigned', 'submitted')
  );
$$;

-- Membership will be implemented from the organization_memberships table in
-- Phase 5. Returning false keeps beta organization data closed until then.
create or replace function private.has_organization_membership(required_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select false;
$$;

revoke all on function private.has_app_role(text) from public, anon;
revoke all on function private.has_capability(text) from public, anon;
revoke all on function private.has_active_reviewer_assignment(bigint) from public, anon;
revoke all on function private.has_organization_membership(uuid) from public, anon;
grant execute on function private.has_app_role(text) to authenticated, service_role;
grant execute on function private.has_capability(text) to authenticated, service_role;
grant execute on function private.has_active_reviewer_assignment(bigint) to authenticated, service_role;
grant execute on function private.has_organization_membership(uuid) to authenticated, service_role;

insert into public.app_role_capability_grants (subject_user_id, app_role, capability, reason)
select profile.user_id, profile.app_role, capabilities.capability, 'Phase 0 trusted admin backfill'
from public.user_profiles profile
cross join (values
  ('access:manage'), ('content:manage'), ('operations:manage'), ('analytics:read'),
  ('configuration:deploy'), ('developer_docs:read'), ('specialists:verify')
) as capabilities(capability)
where profile.app_role = 'admin'
on conflict (subject_user_id, capability) where revoked_at is null do nothing;

comment on table public.app_role_capability_grants is 'Explicit server-owned operator capabilities. Never derive access from JWT user metadata.';
comment on table public.app_role_capability_audit_events is 'Append-only capability grant/revocation audit events.';
