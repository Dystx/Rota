-- Shared rate-limit counter for the `triageInboundMessage` server
-- action. Replaces the in-memory token bucket
-- (`apps/web/app/console/_components/message-triage.ts`) which
-- only worked inside a single long-lived Node process. In a
-- serverless deploy (Vercel functions, Cloudflare Workers) each
-- cold start resets the in-memory array, so the 30/min limit
-- never applies across instances. The function in this migration
-- is the single source of truth.
--
-- How it works: every call to `consume_triage_token(30)` either
-- increments the count for the current minute bucket and returns
-- TRUE (token granted), or — when the bucket is already at the
-- cap — returns FALSE without incrementing (caller falls back to
-- `keywordTriage`). The bucket key is `unix_minute` (bigint),
-- which auto-rolls over every 60s. Old rows are cleaned up
-- opportunistically on insert.

CREATE TABLE IF NOT EXISTS public.triage_rate_limit (
  minute_bucket bigint PRIMARY KEY,
  call_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.triage_rate_limit ENABLE ROW LEVEL SECURITY;

-- No policies: only the SECURITY DEFINER function below can
-- read/write the table. The anon and authenticated roles
-- implicitly have no access.
DROP POLICY IF EXISTS triage_rate_limit_no_read ON public.triage_rate_limit;
DROP POLICY IF EXISTS triage_rate_limit_no_write ON public.triage_rate_limit;
CREATE POLICY triage_rate_limit_no_read ON public.triage_rate_limit
  FOR SELECT
  USING (false);
CREATE POLICY triage_rate_limit_no_write ON public.triage_rate_limit
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Atomic increment + return-whether-allowed. The function takes
-- the per-minute cap as a parameter so the same code path can be
-- reused for other rate-limited actions (e.g. a future
-- `consume_itinerary_token`).
CREATE OR REPLACE FUNCTION public.consume_triage_token(max_per_minute integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_bucket bigint := (extract(epoch from now())::bigint / 60);
  new_count integer;
BEGIN
  -- Opportunistically drop buckets older than 5 minutes so the
  -- table doesn't grow unbounded. A real cron job would be
  -- cleaner, but this keeps the cost bounded for the
  -- low-volume triage path.
  DELETE FROM public.triage_rate_limit
  WHERE minute_bucket < current_bucket - 5;

  INSERT INTO public.triage_rate_limit (minute_bucket, call_count)
  VALUES (current_bucket, 1)
  ON CONFLICT (minute_bucket) DO UPDATE
    SET call_count = public.triage_rate_limit.call_count + 1,
        updated_at = now()
  RETURNING call_count INTO new_count;

  RETURN new_count <= max_per_minute;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_triage_token(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_triage_token(integer) TO service_role;
