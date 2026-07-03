-- Phase 8 of the roadmap: multi-tenant isolation for white-label
-- B2B partnerships (tourism boards, OTAs, agencies). Adds an
-- `org_id` (uuid, nullable) to the consumer-facing tables and
-- an RLS policy that scopes reads + writes by org.
--
-- The migration is forward-compatible:
--  - `org_id` is NULLABLE so existing single-tenant rows continue
--    to work without backfill
--  - The RLS policy lets a row with NULL org_id be read/written
--    by anyone — this preserves the current single-tenant
--    behaviour for the consumer product
--  - Once a B2B partner is onboarded, we backfill org_id on
--    the relevant rows and the RLS policy scopes them to the
--    partner's auth.uid()-derived org claim
--
-- The helper SQL function `auth_org_id()` reads the org claim
-- from the JWT (set by the B2B partner's IdP or by Supabase
-- Auth hooks). The migration also adds an index on (org_id)
-- for the B2B query path.

-- Helper: read the org_id from the JWT app_metadata. Returns
-- NULL when the claim is absent (single-tenant consumer).
CREATE OR REPLACE FUNCTION public.auth_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::jsonb
      -> 'app_metadata' ->> 'org_id',
    ''
  )::uuid;
$$;

-- Helper: does the current user belong to the given org?
CREATE OR REPLACE FUNCTION public.auth_in_org(target_org uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT
    target_org IS NULL  -- NULL org_id = single-tenant row, always readable
    OR target_org = public.auth_org_id();
$$;

-- ---------------------------------------------------------------------------
-- trips: add org_id
-- ---------------------------------------------------------------------------
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS trips_org_id_idx ON public.trips(org_id);

-- RLS: scope trips to the caller's org. Existing single-tenant
-- rows (org_id IS NULL) remain visible to all callers.
DROP POLICY IF EXISTS trips_tenant_isolation ON public.trips;
CREATE POLICY trips_tenant_isolation ON public.trips
  FOR ALL
  USING (public.auth_in_org(org_id))
  WITH CHECK (public.auth_in_org(org_id));

-- ---------------------------------------------------------------------------
-- chat_threads: add org_id
-- ---------------------------------------------------------------------------
ALTER TABLE public.chat_threads
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS chat_threads_org_id_idx ON public.chat_threads(org_id);

DROP POLICY IF EXISTS chat_threads_tenant_isolation ON public.chat_threads;
CREATE POLICY chat_threads_tenant_isolation ON public.chat_threads
  FOR ALL
  USING (public.auth_in_org(org_id))
  WITH CHECK (public.auth_in_org(org_id));

-- ---------------------------------------------------------------------------
-- chat_messages: scope via thread.org_id
-- A user can read/write a message if they belong to the thread's
-- org (or the thread has no org).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS chat_messages_tenant_isolation ON public.chat_messages;
CREATE POLICY chat_messages_tenant_isolation ON public.chat_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id = chat_messages.thread_id
        AND public.auth_in_org(t.org_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id = chat_messages.thread_id
        AND public.auth_in_org(t.org_id)
    )
  );

-- ---------------------------------------------------------------------------
-- organizations: a user can see only their own org
-- (org members are managed via service-role in the admin app)
-- ---------------------------------------------------------------------------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS organizations_self_read ON public.organizations;
CREATE POLICY organizations_self_read ON public.organizations
  FOR SELECT
  USING (id = public.auth_org_id());
