-- Alter chat_threads: add service_level to distinguish Tier 2 from Tier 3
--
-- Spec: docs/spec-v4.md §4
-- Purpose: a chat thread is either:
--   service_level = 2  -> pre-trip verification (Tier 2 / Specialist Curation)
--                          async, 4-hour response window during local business hours
--   service_level = 3  -> active on-trip support (Tier 3 / Full Remote Support)
--                          MRT < 5m SLA per docs/spec-v4.md §1
--
-- Both share the same chat_messages table; service_level drives the
-- routing + SLA enforcement. Default is 2 (most threads are pre-trip).
--
-- Co-existence: existing chat_threads table already exists; this
-- migration adds the column + index without rewriting data.

alter table public.chat_threads
  add column if not exists assigned_specialist_id UUID
    REFERENCES public.specialist_profiles(id),
  add column if not exists service_level INT NOT NULL DEFAULT 2
    CHECK (service_level IN (2, 3));

-- Hot-path index: Tier 3 active threads (the SLA-critical subset)
create index if not exists chat_threads_service_level_active_idx
  on public.chat_threads (service_level, status)
  where status = 'active';

-- Note: chat_threads_assigned_specialist_id_fkey references the new
-- specialist_profiles table (from migration 202607022110). If applying
-- out of order, defer this constraint to a follow-up migration.

comment on column public.chat_threads.assigned_specialist_id is
  'Specialist on the rota for this thread. NULL until a specialist
  picks up the conversation or AI triage escalates.';

comment on column public.chat_threads.service_level is
  'Tier-2 (pre-trip verification, 4h SLA) or Tier-3 (active on-trip
  support, MRT<5m SLA). Drives routing + escalation policy per
  docs/spec-v4.md §2 Hybrid Triage Engine.';