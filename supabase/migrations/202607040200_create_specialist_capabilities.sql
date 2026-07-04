-- Specialist capabilities (PR-11c).
--
-- Four pieces of information sit on a specialist profile
-- beyond the v1 PR-11 columns: skills (e.g. "Sintra Expert"),
-- spoken languages (fixed enum), free-text bio, and an
-- external photo URL. Two storage shapes:
--
--   1. bio + photo_url → columns on the existing
--      specialist_profiles row. 1:1, always present in
--      the row even if empty.
--
--   2. skills + languages → new specialist_capabilities
--      table, one row per (specialist_id, type, value).
--      Multiple skills and multiple languages per
--      specialist are allowed; a partial unique index
--      on (specialist_id, type, value) prevents
--      duplicates.
--
-- The plan called for a single "wide" capabilities table
-- with `skill`, `language`, `bio`, `photo_url` columns.
-- That shape is awkward: skill/language would have to
-- be nullable and the row type would be ambiguous. The
-- split above is the same end state, normalized, with
-- one CHECK per value domain and one unique index
-- (instead of four partial unique indexes on a wide
-- table).
--
-- Skill is free text (specialists describe themselves);
-- language is a closed enum enforced at the DB layer.
-- Bio is free text up to 2KB. Photo URL is a validated
-- URL up to 2KB; the app layer enforces http(s) and
-- length.

alter table public.specialist_profiles
  add column if not exists bio text,
  add column if not exists photo_url text;

comment on column public.specialist_profiles.bio is
  'Specialist-authored bio. Free text, max 2KB; app-layer validates.';

comment on column public.specialist_profiles.photo_url is
  'External photo URL. App-layer validates http(s) and 2KB ceiling.';

create table if not exists public.specialist_capabilities (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null
    references public.specialist_profiles(id) on delete cascade,
  type text not null check (type in ('skill', 'language')),
  value text not null,
  -- Language values are constrained to a closed set; the
  -- DB enforces it. Skill values are free text but the
  -- app layer trims and length-caps.
  constraint specialist_capabilities_language_value_check
    check (
      type <> 'language'
      or value in ('pt', 'en', 'es', 'fr', 'it', 'de')
    ),
  constraint specialist_capabilities_skill_value_check
    check (
      type <> 'skill'
      or (length(value) between 1 and 80)
    ),
  created_at timestamptz not null default now(),
  unique (specialist_id, type, value)
);

create index if not exists specialist_capabilities_specialist_idx
  on public.specialist_capabilities (specialist_id);

create index if not exists specialist_capabilities_type_idx
  on public.specialist_capabilities (type);

comment on table public.specialist_capabilities is
  'Per-specialist capabilities (skills + spoken languages). One row per (specialist, type, value).';

comment on column public.specialist_capabilities.type is
  'Capability discriminator: skill (free text) or language (closed enum).';

comment on column public.specialist_capabilities.value is
  'The capability value. Free text for skills; closed enum for languages (enforced via CHECK).';

-- RLS: a specialist can read/write their own; admins
-- (service_role in practice) can read/write all. The
-- web app's RLS-aware client is the authenticated user,
-- so the "own rows" policy uses auth.uid().

alter table public.specialist_capabilities enable row level security;

drop policy if exists specialist_capabilities_select_own on public.specialist_capabilities;
create policy specialist_capabilities_select_own on public.specialist_capabilities
  for select to authenticated
  using (
    specialist_id in (
      select id from public.specialist_profiles where user_id = auth.uid()
    )
  );

drop policy if exists specialist_capabilities_insert_own on public.specialist_capabilities;
create policy specialist_capabilities_insert_own on public.specialist_capabilities
  for insert to authenticated
  with check (
    specialist_id in (
      select id from public.specialist_profiles where user_id = auth.uid()
    )
  );

drop policy if exists specialist_capabilities_update_own on public.specialist_capabilities;
create policy specialist_capabilities_update_own on public.specialist_capabilities
  for update to authenticated
  using (
    specialist_id in (
      select id from public.specialist_profiles where user_id = auth.uid()
    )
  )
  with check (
    specialist_id in (
      select id from public.specialist_profiles where user_id = auth.uid()
    )
  );

drop policy if exists specialist_capabilities_delete_own on public.specialist_capabilities;
create policy specialist_capabilities_delete_own on public.specialist_capabilities
  for delete to authenticated
  using (
    specialist_id in (
      select id from public.specialist_profiles where user_id = auth.uid()
    )
  );

-- Admin: full read for the verification queue. The web
-- app reads the table as an authenticated user; admins
-- are encoded as a service_role bypass in the data
-- client (`createPrivilegedServerDataClient`). The
-- RLS-aware path is the specialist's own rows.
