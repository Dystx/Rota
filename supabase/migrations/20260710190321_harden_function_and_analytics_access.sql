-- Resolve database-advisor findings without changing public product behavior.
-- `match_hybrid_destinations` resolves all application objects by their fixed
-- OIDs, but a fixed search path prevents attacker-controlled name resolution
-- if the function is revised later.
alter function public.match_hybrid_destinations(
  halfvec(1536), text, double precision, double precision, double precision
) set search_path = pg_catalog, public;

-- Behavioral telemetry is currently retained only in the browser's local
-- cache; no client code writes this table yet.  Leaving an anonymous INSERT
-- policy open would make the public Data API a spam endpoint, so service-role
-- ingestion remains the sole allowed path until a rate-limited server action
-- is introduced.
drop policy if exists user_behavior_events_anon_insert on public.user_behavior_events;
revoke insert on public.user_behavior_events from anon, authenticated;
grant select, insert, update, delete on public.user_behavior_events to service_role;

comment on table public.user_behavior_events is
  'Privacy-safe behavioral telemetry. Client writes stay disabled until a rate-limited server-side ingestion endpoint is implemented; service role is the sole reader and writer.';
