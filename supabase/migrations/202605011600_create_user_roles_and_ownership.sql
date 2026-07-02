create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  app_role text not null default 'traveler',
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_app_role_check check (app_role in ('traveler', 'reviewer', 'admin', 'none'))
);

create table if not exists public.reviewer_auth_links (
  user_id uuid primary key references public.user_profiles(user_id) on delete cascade,
  reviewer_id text not null unique references public.reviewers(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.trip_briefs
  add column if not exists owner_user_id uuid null references auth.users(id) on delete set null;

alter table public.trips
  add column if not exists owner_user_id uuid null references auth.users(id) on delete set null;

create index if not exists user_profiles_app_role_user_id_idx
  on public.user_profiles(app_role, user_id);

create index if not exists reviewer_auth_links_reviewer_id_idx
  on public.reviewer_auth_links(reviewer_id);

create index if not exists trip_briefs_owner_user_id_idx
  on public.trip_briefs(owner_user_id);

create index if not exists trips_owner_user_id_idx
  on public.trips(owner_user_id);

create index if not exists trips_owner_user_id_created_at_idx
  on public.trips(owner_user_id, created_at desc);

alter table public.user_profiles enable row level security;
alter table public.reviewer_auth_links enable row level security;

grant select, insert, update, delete on public.user_profiles to service_role;
grant select, insert, update, delete on public.reviewer_auth_links to service_role;

comment on table public.user_profiles is 'Server-owned profile and trusted application role mapping. Authorization must not read auth.users.raw_user_meta_data.';
comment on column public.user_profiles.app_role is 'Trusted role for app authorization: traveler, reviewer, admin, or none. Keep synchronized with auth.users.raw_app_meta_data.role for getClaims-based route checks.';
comment on table public.reviewer_auth_links is 'Trusted mapping from an authenticated user profile to one reviewer row for reviewer self and assignment policies.';
comment on column public.trip_briefs.owner_user_id is 'Trusted traveler owner prerequisite for future owner-scoped RLS policies.';
comment on column public.trips.owner_user_id is 'Trusted traveler owner prerequisite for future owner-scoped RLS policies.';
