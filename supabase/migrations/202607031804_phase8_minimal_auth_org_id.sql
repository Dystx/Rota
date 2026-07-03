-- Minimal Phase 8 multi-tenant scaffolding — auth_org_id() + trips.org_id only.
--
-- The full Phase 8 migration
-- (202607031803_phase8_multi_tenant_org_id.sql, in .stale/)
-- also adds org_id to chat_threads + chat_messages and creates
-- their RLS policies. The remote's `public.chat_threads` and
-- `public.chat_messages` tables don't exist yet (they're
-- scheduled for a future migration that creates them), so the
-- full Phase 8 migration fails when it ALTERs those tables.
--
-- This migration ships only the parts that don't depend on the
-- chat tables:
--   1. auth_org_id() — reads the org_id claim from the JWT.
--   2. auth_in_org(target_org) — tightened predicate (NULL
--      target_org only readable when the caller has no org
--      claim).
--   3. ALTER TABLE public.trips ADD COLUMN org_id + RLS policy.
--   4. organizations_self_read policy.
--
-- The chat-table parts (org_id on chat_threads, chat_messages,
-- and their RLS policies) are deferred until the chat tables
-- land. The auth_in_org tightening is the priority; the chat
-- additions are a follow-up commit that can land once the
-- chat tables are created.

-- 1. auth_org_id() — single source of truth for "what org is
-- this user claiming to belong to". Returns the org UUID from
-- the JWT's `app_metadata.org_id` claim, or NULL for
-- consumer (single-tenant) users. SECURITY DEFINER so RLS
-- policies can call it without granting direct table access.
CREATE OR REPLACE FUNCTION public.auth_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NULLIF(
    coalesce(
      auth.jwt() -> 'app_metadata' ->> 'org_id',
      (auth.jwt() -> 'user_metadata' ->> 'org_id')
    ),
    ''
  )::uuid;
$$;

-- 2. Tightened predicate. NULL target_org is only readable
-- when the caller has no org claim (consumers). B2B users
-- with a non-NULL claim are denied access to NULL rows. The
-- forward-compat shortcut that allowed B2B users to read
-- single-tenant NULL rows is gone.
CREATE OR REPLACE FUNCTION public.auth_in_org(target_org uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT
    (target_org IS NOT NULL AND target_org = public.auth_org_id())
    OR (target_org IS NULL AND public.auth_org_id() IS NULL);
$$;

-- 3. Add org_id to public.trips + the tenant-isolation policy.
-- The RLS policy gates SELECT/INSERT/UPDATE/DELETE on
-- `public.trips` so a caller can only see rows whose org_id
-- matches their own claim (or NULL for consumers).
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS trips_tenant_isolation ON public.trips;
CREATE POLICY trips_tenant_isolation ON public.trips
  FOR ALL
  USING (public.auth_in_org(org_id))
  WITH CHECK (public.auth_in_org(org_id));

-- 4. organizations_self_read: a user with an org claim can
-- read their own org's row. The new
-- organizations_public_read_by_slug policy (added in
-- 202607031800_add_organizations_branding.sql) lets anon
-- read by slug for the white-label demo.
DROP POLICY IF EXISTS organizations_self_read ON public.organizations;
CREATE POLICY organizations_self_read ON public.organizations
  FOR SELECT
  USING (id = public.auth_org_id());

-- Forward the helper functions to the public, anon, and
-- authenticated roles so RLS policies can call them.
GRANT EXECUTE ON FUNCTION public.auth_org_id() TO public;
GRANT EXECUTE ON FUNCTION public.auth_org_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auth_in_org(uuid) TO public;
GRANT EXECUTE ON FUNCTION public.auth_in_org(uuid) TO anon, authenticated;
