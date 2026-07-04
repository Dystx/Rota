# Stale migrations

This directory holds migrations that were **never applied to the
remote Supabase** and have been removed from the active
`supabase/migrations/` tree. They are kept here as historical
reference for the schema design discussions they document.

## Policy

- Stale migrations are **not auto-applied**. The `supabase db
  push` workflow only reads from `supabase/migrations/` directly.
- Re-deriving a stale migration's schema is the responsibility of
  the phase that needs it. Do **not** apply a stale file as-is.
- Stale files are deleted when:
  - The schema is fully captured by an active migration, OR
  - The feature is out of scope for the current roadmap

## Current contents

- (none — the 5 stale files were triaged and deleted in commit
  `<this commit's hash>`)

## Why this directory exists

During the Phase 2 schema sync (commit `358059b`), 5 migrations
were moved here because they could not be applied to the remote
Supabase: the chat tables didn't exist, the multi-tenant
`auth_in_org` predicate was loose, and the Tier 3/4 features
were out of scope. The 2026-07-03 review of the plan
(`docs/roadmap.md`) confirmed all 5 should be deleted and the
schema re-derived when the corresponding phase reactivates
(chat infrastructure for Phase 9, Tier 3 for Phase 7+).
