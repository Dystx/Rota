-- Alter chat_messages: add metadata JSONB for proposed stop adjustment nodes
--
-- Spec: docs/spec-v4.md §4
-- Purpose: when the AI triage layer proposes an itinerary adjustment
-- (e.g. 'replace this stop with an alternative') the proposal is
-- embedded in the chat message as a structured node. The specialist
-- reviews + approves, or overrides.
--
-- Shape: { "type": "stop_adjustment", "stop_id": ..., "replacement":
-- { "place_id": ..., "reason": ..., "embedding_similarity": ... } }

alter table public.chat_messages
  add column if not exists metadata JSONB;

comment on column public.chat_messages.metadata is
  'Structured payload for non-text message intents. Shape varies by
  sender_type:
  - system_triage: stop_adjustment proposals (replace/drop/add stop)
  - specialist: stop_confirmed / stop_rejected (paired with system_triage)
  - user: client_intent_signal (e.g. "is there parking near...") used
    by the AI triage pre-classifier to route to the right specialist.

  Example:
  {
    "type": "stop_adjustment",
    "operation": "replace",
    "stop_id": "...",
    "candidate_place_id": "...",
    "reason": "user-requested 'quieter alternative for this afternoon'",
    "embedding_similarity": 0.84,
    "postgis_polygon": "within-original-trip"
  }';

create index if not exists chat_messages_metadata_gin_idx
  on public.chat_messages
  using gin (metadata);

-- Rationale: GIN index enables efficient queries like
--   select * from chat_messages where metadata @> '{"type":"stop_adjustment"}';
-- for the Tier 3 specialist dashboard's "pending adjustments" view.