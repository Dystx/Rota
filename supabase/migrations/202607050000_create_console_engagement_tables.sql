-- Phase 3 console-engagement tables: itinerary_events + chat_messages
--
-- `itinerary_events` is what the operator's "Push to Timeline" form
-- writes to from the console/messages page. The form is the
-- primary action on the operator surface; without this table the
-- form is a wireframe. (The previous comment at the form's
-- `onSubmit={(e) => e.preventDefault()}` flagged this as
-- "wiring to itinerary_events is gated on Phase 9.1 (chat
-- schema)" — we're landing both at once since they share the
-- same RLS posture.)
--
-- `chat_messages` is the operator's per-conversation chat thread
-- for the async specialist review flow. The console/messages
-- composer currently has no submit handler; this table gives
-- the form somewhere to write.

create extension if not exists "pgcrypto";

create table if not exists public.itinerary_events (
  id uuid primary key default gen_random_uuid(),
  -- The conversation id from the console's local CONVERSATIONS
  -- array (e.g. "eleanor", "hastings"). Text not uuid so the
  -- operator surface can use human-friendly slugs without
  -- coordinating with auth.users.
  conversation_id text not null,
  -- Mirrors the `<select>` options in the form.
  event_type text not null check (
    event_type in ('activity', 'accommodation', 'transfer', 'dining')
  ),
  title text not null,
  event_date date not null,
  event_time time not null,
  internal_notes text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create index if not exists itinerary_events_conversation_id_created_at_idx
  on public.itinerary_events(conversation_id, created_at desc);

create index if not exists itinerary_events_event_date_idx
  on public.itinerary_events(event_date);

-- ---------------------------------------------------------------------

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null,
  -- "operator" (the specialist working the console) or
  -- "traveler" (the customer on the other end).
  author_role text not null check (author_role in ('operator', 'traveler')),
  author_user_id uuid references auth.users(id) on delete set null,
  body text not null check (length(body) > 0),
  -- Optional: a snippet card that was dropped in (JSON
  -- serialized) so the operator can see the source snippet.
  source_snippet_id text,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_conversation_id_created_at_idx
  on public.chat_messages(conversation_id, created_at);

-- ---------------------------------------------------------------------

-- RLS posture:
-- - itinerary_events: operators (role=admin in app_metadata)
--   can read/write. Travelers can read their own events
--   (where created_by = auth.uid()).
-- - chat_messages: both operator and traveler can read
--   messages for their conversations. Operators can write
--   as author_role='operator'; travelers as 'traveler'.

alter table public.itinerary_events enable row level security;
alter table public.chat_messages enable row level security;

create policy "itinerary_events_operator_all" on public.itinerary_events
  for all
  to authenticated
  using ((select private.current_app_role()) = 'admin')
  with check ((select private.current_app_role()) = 'admin');

create policy "itinerary_events_traveler_read_own" on public.itinerary_events
  for select
  to authenticated
  using (created_by = (select auth.uid()));

create policy "itinerary_events_traveler_insert_own" on public.itinerary_events
  for insert
  to authenticated
  with check (created_by = (select auth.uid()));

create policy "chat_messages_read_all_participants" on public.chat_messages
  for select
  to authenticated
  using (true);

create policy "chat_messages_insert_own_role" on public.chat_messages
  for insert
  to authenticated
  with check (
    author_role = 'operator'
      or author_role = 'traveler'
  );

-- Service role has full access (used by server actions).
grant all on public.itinerary_events to service_role;
grant all on public.chat_messages to service_role;

comment on table public.itinerary_events is 'Operator timeline events pushed from the console/messages page. Each row is one Push to Timeline submit.';
comment on table public.chat_messages is 'Operator ↔ traveler async chat messages for the specialist review flow.';
