-- These policies predate the console-message quarantine and survive as schema
-- drift on the hosted project.  Browser roles have no table grants today, but
-- retaining the policies would re-open the tables if a later grant is added.
drop policy if exists itinerary_events_operator_all on public.itinerary_events;
drop policy if exists itinerary_events_traveler_read_own on public.itinerary_events;
drop policy if exists itinerary_events_traveler_insert_own on public.itinerary_events;
