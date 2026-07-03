-- API key issuance for the B2B developer portal (PR-15).
--
-- Each B2B partner (tourism board, OTA, agency) gets one
-- or more API keys scoped to their `org_id`. The key
-- itself is a random 32-byte hex string returned to the
-- user once at creation; we store only the SHA-256 hash
-- (`key_hash`) and an 8-character prefix (`key_prefix`,
-- for display in the dashboard). Revocation sets
-- `revoked_at`; the lookup query filters on that.

CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  -- SHA-256 hash of the API key. Never store the raw
  -- key value. Indexed for the lookup query path.
  key_hash text NOT NULL UNIQUE,
  -- First 8 chars of the raw key, for display in the
  -- dashboard ("rumia_live_abc12345…"). Not a secret.
  key_prefix text NOT NULL,
  -- Optional human-readable name ("Production",
  -- "Mobile SDK", "Wordpress plugin").
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Last successful use; useful for "is this key still
  -- active?" dashboards. Updated by the gateway.
  last_used_at timestamptz,
  -- Soft-delete. Revoked keys are kept for audit
  -- purposes; the gateway filters `revoked_at IS NULL`.
  revoked_at timestamptz
);

-- Lookup path: a single key_hash → org_id lookup. The
-- unique index on key_hash is already the primary index;
-- this is an explicit index on org_id for the admin
-- dashboard's "list keys for org X" view.
CREATE INDEX IF NOT EXISTS api_keys_org_id_idx
  ON public.api_keys (org_id)
  WHERE revoked_at IS NULL;

COMMENT ON TABLE public.api_keys IS
  'B2B partner API keys. Hash-only storage; raw key returned once at creation. Issued via the developer portal.';

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- service_role is the only role that reads / writes
-- this table. The public API gateway uses the service-
-- role client to look up keys (it's the only path that
-- needs to read the hash). End-users never see this
-- table; the developer portal reads it through a
-- server-only path.
DROP POLICY IF EXISTS api_keys_service_role_all ON public.api_keys;
CREATE POLICY api_keys_service_role_all ON public.api_keys
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
