-- Tighten the `auth_in_org` helper to prevent cross-tenant leakage.
--
-- The original Phase 8 helper (migration 202607031800_…) returns
-- TRUE for any caller when `target_org` is NULL:
--
--   target_org IS NULL  -- NULL org_id = single-tenant row, always readable
--
-- This was a forward-compat shortcut so existing single-tenant
-- consumer rows (org_id IS NULL) continue to read. But it has a
-- security hole: a B2B user (auth_org_id() = X) can read every
-- single-tenant row, because `auth_in_org(NULL)` evaluates to
-- TRUE for them too. A travel-agency partner with a compromised
-- credential could scrape every consumer's trip data.
--
-- Fix: NULL org_id is only readable to callers who also have no
-- org claim (consumers). B2B users with a non-NULL claim are
-- denied access to NULL org_id rows. To migrate a single-tenant
-- row into a B2B tenant, the partner onboarding flow must
-- backfill org_id explicitly — never rely on the policy to grant
-- access to a NULL row.
--
-- The new predicate:
--   (target_org IS NOT NULL AND target_org = auth_org_id())
--   OR
--   (target_org IS NULL     AND auth_org_id() IS NULL)
--
-- This is a behavior change for B2B users who were relying on
-- the loose policy. The fix is intentional: any cross-tenant
-- read of a NULL row is a leak. Consumers are unaffected
-- (consumer = no org claim = reads single-tenant rows as before).

CREATE OR REPLACE FUNCTION public.auth_in_org(target_org uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT
    (target_org IS NOT NULL AND target_org = public.auth_org_id())
    OR (target_org IS NULL AND public.auth_org_id() IS NULL);
$$;
