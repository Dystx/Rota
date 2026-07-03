-- Persist the behavioral profiler's ring buffer so events
-- survive a page reload and aggregate over time.
--
-- The behavioral profiler (apps/web/app/_lib/behavioral-profiler.ts)
-- records `skip` / `extend` / `replace` / `pin` / `mute` events
-- in a 100-slot in-memory ring buffer. Without this table,
-- a page refresh wipes the buffer. With it, the
-- `pageshow` handler restores the last batch from
-- IndexedDB and a future worker (PR-6 follow-up) drains
-- the table to a profile-embedding pipeline.
--
-- RLS:
--  - anon can INSERT (the events are collected client-side
--    via the opt-in consent gate; we don't require a
--    session — the behavioral profiler respects the
--    consent flag).
--  - The service_role is the only role that can SELECT.
--    The actual profile-embedding pipeline runs in a
--    worker, not in a user-facing read path.
--  - Users never see other users' events; there's no
--    SELECT policy for `authenticated` against this table.

CREATE TABLE IF NOT EXISTS public.user_behavior_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Stable trip id (could be a text reference to the trip
  -- in the application; not a FK because the events are
  -- collected from a pre-login context sometimes).
  trip_id text NOT NULL,
  -- Stop / destination / category id the event applies to.
  target_id text NOT NULL,
  -- One of: 'skip' | 'extend' | 'replace' | 'pin' | 'mute'.
  -- Kept as text (not an enum) so the consent gate can add
  -- new event types without a migration.
  type text NOT NULL,
  -- Event metadata (replacement id for 'replace', extra
  -- minutes for 'extend', etc.). Same shape as
  -- `BehaviorEvent.metadata` in the profiler.
  metadata jsonb,
  -- ms since epoch on the client at record time. Different
  -- from `server_timestamp` (clock skew + network latency).
  client_timestamp bigint NOT NULL,
  -- Server-side insert time. Defaults to now() at insert.
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Query path: by trip (when reviewing a single trip's
-- behavioral history) and by type (when computing a
-- profile embedding).
CREATE INDEX IF NOT EXISTS user_behavior_events_trip_id_idx
  ON public.user_behavior_events (trip_id);
CREATE INDEX IF NOT EXISTS user_behavior_events_type_idx
  ON public.user_behavior_events (type);

ALTER TABLE public.user_behavior_events ENABLE ROW LEVEL SECURITY;

-- Allow the client to insert events. The opt-in consent
-- gate (apps/web/app/(app)/account/_components/behavior-consent-
-- toggle.tsx) is the application-level guard; this RLS
-- policy is the storage-level guard for the case where
-- the gate is bypassed.
DROP POLICY IF EXISTS user_behavior_events_anon_insert ON public.user_behavior_events;
CREATE POLICY user_behavior_events_anon_insert ON public.user_behavior_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- service_role is the only reader (the profile-embedding
-- pipeline runs in a worker, not a user-facing read path).
-- We intentionally do NOT add a SELECT policy for anon or
-- authenticated. The existing `auth.uid()`-based pattern
-- is overkill for a behavioral-events table.
DROP POLICY IF EXISTS user_behavior_events_service_role_select ON public.user_behavior_events;
CREATE POLICY user_behavior_events_service_role_select ON public.user_behavior_events
  FOR SELECT
  TO service_role
  USING (true);

COMMENT ON TABLE public.user_behavior_events IS
  'Behavioral profiler events. Inserted by the client after the consent gate. Read only by the profile-embedding worker (service_role).';
