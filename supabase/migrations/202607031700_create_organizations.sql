-- Create the `organizations` table that the Phase 8 multi-tenant
-- migration (202607031800_…) references via `REFERENCES public.organizations(id)`
-- on `trips.org_id` and `chat_threads.org_id`. The lint caught the
-- missing definition when this file was added in `5d1d640`.
--
-- The shape here is intentionally minimal: a uuid PK + a name
-- + timestamps. The full B2B org profile (billing, plan, contacts,
-- branding) will land in a follow-up migration per Phase 8 of the
-- refined spec; this commit only fixes the missing-table bug.
--
-- Forward-compatible: the Phase 8 migration adds `org_id` to
-- `trips` and `chat_threads` and creates an `organizations_self_read`
-- RLS policy. The policy depends on `auth_org_id()` which the
-- Phase 8 migration also defines.

CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tracked by the migration lint as an `implicit-sequence`-style
-- reference, but `gen_random_uuid()` doesn't create a sequence, so
-- nothing extra to add here. The lint's IMPLICIT_DEFINE_PATTERNS
-- only register sequences for `SERIAL` / `BIGSERIAL` / IDENTITY
-- columns — UUID PKs are fine.

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- The `organizations_self_read` policy is created in the Phase 8
-- migration (202607031800_…); adding it here too would cause a
-- "policy already exists" error if both files are re-applied in
-- dev. The Phase 8 file owns that policy.

COMMENT ON TABLE public.organizations IS
  'B2B partner orgs (tourism boards, OTAs, agencies) for white-label workspaces. Phase 8 of refined spec. Minimal shape; full B2B profile lands in a follow-up migration.';
