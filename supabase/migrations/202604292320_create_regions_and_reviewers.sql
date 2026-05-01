create table if not exists public.regions (
  id text primary key,
  name text not null,
  country_slug text not null default 'portugal',
  best_for text[] not null default '{}',
  seasonality text not null default '',
  launch_status text not null default 'Planned',
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviewers (
  id text primary key,
  name text not null,
  country text not null default 'Portugal',
  regions text[] not null default '{}',
  languages text[] not null default '{}',
  specialties text[] not null default '{}',
  status text not null default 'Onboarding',
  rating numeric null,
  bio text not null default '',
  response_promise text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.regions enable row level security;
alter table public.reviewers enable row level security;

grant select, insert, update, delete on public.regions to service_role;
grant select, insert, update, delete on public.reviewers to service_role;
