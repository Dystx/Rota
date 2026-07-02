-- Tier 3 & Tier 4: Unified specialist profile database
--
-- Spec: docs/spec-v4.md §4
-- Purpose: replaces the v2 'guide_profiles' + 'reviewers' split with a
-- unified table. One row per human specialist; flags `tier_3_on_call`
-- and `tier_4_licensed_guide` determine which tiers they participate
-- in. RNAAT license number is mandatory for tier_4.
--
-- Co-existence: existing 'public.reviewers' and 'public.partners'
-- tables stay in place (drive the admin/reviewer UIs); this table is
-- the forward-compatible "specialist" model that supersedes both.
-- Migration path: backfill from reviewers + partners, then deprecate.

create table if not exists public.specialist_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,

    -- Operational scope
    regions_covered UUID[] NOT NULL DEFAULT '{}',

    -- Tier participation flags
    tier_3_on_call BOOLEAN NOT NULL DEFAULT FALSE,
    tier_4_licensed_guide BOOLEAN NOT NULL DEFAULT FALSE,

    -- Tier 4 regulatory credential (Portugal RNAAT)
    rnaat_license_number VARCHAR(100),

    -- Verification status (gated by Tier 4 onboarding checklist)
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    -- Tier 4 dispatch rate (EUR/hour). Tier 3 specialists bill via
    -- subscription; their rate is not stored here.
    hourly_rate NUMERIC(6,2) NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Spec validation: tier_4_licensed_guide requires rnaat_license_number
    constraint specialist_profiles_tier4_requires_license
      check (
        tier_4_licensed_guide = false
        or rnaat_license_number IS NOT NULL
      ),

    -- Spec validation: tier_4 must be verified before dispatch
    constraint specialist_profiles_tier4_must_be_verified
      check (
        tier_4_licensed_guide = false
        or is_verified = true
      )
);

create index if not exists specialist_profiles_tier3_idx
  on public.specialist_profiles (tier_3_on_call)
  where tier_3_on_call = true;

create index if not exists specialist_profiles_tier4_idx
  on public.specialist_profiles (tier_4_licensed_guide)
  where tier_4_licensed_guide = true;

create index if not exists specialist_profiles_regions_gin_idx
  on public.specialist_profiles
  using gin (regions_covered);

comment on table public.specialist_profiles is
  'Unified specialist model for Tier 2/3/4. Replaces v2 split between
  reviewers (Tier 2) and partners (Tier 4). One row per human.';

comment on column public.specialist_profiles.regions_covered is
  'Array of region/city UUIDs. Tier 4 dispatch matches via PostGIS
  polygon overlap; Tier 3 rota matches via array containment.';

comment on column public.specialist_profiles.tier_3_on_call is
  'True if the specialist participates in Tier 3 (Full Remote Support)
  on-call rota. Drives the MRT < 5m SLA per docs/spec-v4.md §1.';

comment on column public.specialist_profiles.tier_4_licensed_guide is
  'True if the specialist is a licensed physical guide eligible for
  Tier 4 dispatch. Gated by rnaat_license_number + is_verified.';

comment on column public.specialist_profiles.rnaat_license_number is
  'Registo Nacional dos Agentes de Animação Turística license number
  (Portugal). Required when tier_4_licensed_guide = true.';

comment on column public.specialist_profiles.is_verified is
  'Onboarding complete: license API check, insurance brokered, profile
  reviewed. Required true before any Tier 4 dispatch can be created.';

alter table public.specialist_profiles enable row level security;

-- Spec: chat_threads references specialist_profiles via assigned_specialist_id.
-- See 202607022120 for chat_threads.service_level (Tier 2 vs Tier 3 distinction).
-- See 202607022140 for guide_dispatches FK.

-- Backfill comment (apply separately if/when deprecating reviewers/partners):
-- insert into public.specialist_profiles (user_id, full_name, tier_3_on_call,
--   regions_covered, hourly_rate)
-- select user_id, full_name, true, '{}', hourly_rate from public.reviewers
--   where status = 'active';
-- insert into public.specialist_profiles (user_id, full_name, tier_4_licensed_guide,
--   rnaat_license_number, is_verified, hourly_rate)
-- select user_id, full_name, true, license_number, is_verified, hourly_rate
--   from public.partners where status = 'active';