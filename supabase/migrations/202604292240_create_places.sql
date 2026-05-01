create table if not exists public.places (
  id text primary key,
  name text not null,
  region text not null,
  category text not null default 'Uncategorized',
  quality numeric null,
  source_confidence text not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.places enable row level security;

grant select, insert, update, delete on public.places to service_role;
