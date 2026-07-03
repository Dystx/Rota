# 2026-07-03 LLM Code Review — LOW Follow-ups

> The first LLM code review (commit `b9481df`) reported 46 findings (7 CRITICAL,
> 8 HIGH, 13 MEDIUM, 11 LOW). The CRITICAL/HIGH/MEDIUM items were closed across
> commits `b9481df`, `3d7ad96`, and `5d1d640`. The 11 LOWs were never captured as
> a list (the reviewer subagent did not write a markdown file), so the items in
> this document come from a fresh LOW-only scan of `main` + the three follow-up
> reviews performed this session.

Each item: severity LOW (definition: naming, comments, minor cleanup, opportunity
to consolidate), file/line, fix.

---

## LOW-1 — `places` table should be `destinations` per the 8-phase plan

- **File:** `supabase/migrations/202607022000_enable_postgis_pgvector_and_places_embeddings.sql`, `packages/ai/src/retrieval.ts:179` (`PLACES` constant), `apps/web/app/console/_components/pipeline-board.tsx:106` (`table: "trips"` — note: this is the realtime subscription, not the table name itself)
- **Issue:** The 8-phase engineering lifecycle (`docs/engineering-lifecycle.md` §2) defines a `destinations` table. Current code uses a `places` table for the same shape (id, name, category, geom, embedding). The naming is a deliberate deviation but undocumented.
- **Fix:** Document the deviation in `docs/engineering-lifecycle.md` §2 with a footnote: "current code uses a table named `places` with the same shape; rename deferred to P2-2." No code change.

## LOW-2 — `mapTripStatus` defaults unknown statuses to `draft`

- **File:** `apps/web/app/console/_components/pipeline-board.tsx:198-203`
- **Issue:** `mapTripStatus("completed")` returns `"draft"`. A completed trip will be visually mis-categorized into the "New Drafts" lane. The plan calls for an explicit mapping for every status; this is a silent misclassification.
- **Fix:** Extend the mapper to return `"active_chat"` for terminal-but-recent statuses (`"completed"`, `"cancelled"`, `"archived"`) and `"draft"` only for genuinely new rows. Document the exhaustive list.

## LOW-3 — `clientName` in pipeline-board renders "Brief #<id>"

- **File:** `apps/web/app/console/_components/pipeline-board.tsx:125-127`
- **Issue:** Realtime path sets `clientName: \`Brief #${row.trip_brief_id}\`` when the row has a foreign key. The fallback dataset shows "E. Sato", "J. Doe" etc. A specialist looking at the live pipeline sees degraded names compared to the fallback. This is a join limitation (the Realtime path is narrow on purpose), but the degraded display is a real UX issue.
- **Fix:** Add a TODO comment + a one-line caveat to the docstring so the gap is visible. The proper fix is a separate `trip_briefs` enrichment pass, which is out of scope for the LOW bucket.

## LOW-4 — RPC null handling in `message-triage.ts`

- **File:** `apps/web/app/console/_components/message-triage.ts:45`
- **Issue:** `data === true ? "granted" : "limited"` treats a `null` return (unusual but possible) as `"limited"`, not `"unavailable"`. The two error states produce different rationale suffixes, and a null payload is semantically closer to "unavailable" than "limited".
- **Fix:** Treat `data === true` → `"granted"`, `data === false` → `"limited"`, anything else → `"unavailable"`. Update the comment.

## LOW-5 — Retention magic number in `triage_rate_limit` migration

- **File:** `supabase/migrations/202607032200_create_triage_rate_limit.sql:58`
- **Issue:** `WHERE minute_bucket < current_bucket - 5` hard-codes a 5-minute retention window. No constant, no comment explaining the choice.
- **Fix:** Add a top-of-file constant via a `COMMENT ON TABLE` and a one-line rationale. Out of scope to refactor to a configurable parameter (would require a function-arg on `consume_triage_token`).

## LOW-6 — Per-request `createServiceRoleSupabaseClient()` in `message-triage.ts`

- **File:** `apps/web/app/console/_components/message-triage.ts:40`
- **Issue:** Every triage call creates a new Supabase client (which re-reads env via `createServerConfig` and instantiates a new `createClient`). For high-volume triage this is a per-request cost. Low impact at current traffic, but the pattern is wrong.
- **Fix:** Add a module-level cache for the service-role client, lazily initialized. Mention in a comment that test environments should reset this via `vi.resetModules()`.

## LOW-7 — Deterministic generator emits a "still does not yet validate opening hours" warning

- **File:** `packages/ai/src/index.ts:158-159`
- **Issue:** The pipeline emits a `warnings: ["This is still a deterministic route preview and does not yet validate opening hours..."]` string that is now a lie: the data is partial but the warning is hardcoded into the deterministic generator regardless of the trip's data quality.
- **Fix:** Move the warning behind a flag (`includeLimitationsWarning: boolean`) that callers can set; default `true` for backward compat. The `generateItineraryFromBrief` path keeps `true`; the retrieval-aware path (Phase 3) sets `false` once opening hours are wired.

## LOW-8 — Consent toggle has triple-state (`true | false | null`) with no hydration-mismatch guard

- **File:** `apps/web/app/(app)/account/_components/behavior-consent-toggle.tsx:15-21`
- **Issue:** The component renders a "Loading personalization preferences…" placeholder on the server and after first render, then switches to the real toggle. The `enabled: boolean | null` state has no `suppressHydrationWarning` — React will log a mismatch if the placeholder is ever removed.
- **Fix:** Add `suppressHydrationWarning` to the loading-state container, or refactor to use a `useSyncExternalStore`-style read so the value is stable across hydration.

## LOW-9 — `STATUS_LABELS` keys are coupled to `PipelineItem["status"]` but the type allows for runtime drift

- **File:** `apps/web/app/console/_components/pipeline-board.tsx:68-72`
- **Issue:** `STATUS_LABELS: Record<PipelineItem["status"], ...>` is statically typed, but `mapTripStatus` (line 198) returns a status string. If the upstream status enum is changed without updating `mapTripStatus`, the runtime return is a fresh string that `Record<...>` would not match. The current `Record` type prevents this at compile time, but the runtime check is implicit.
- **Fix:** No code change needed; document the contract. Out of scope to add a runtime assertion.

## LOW-10 — `console.warn` for "LLM intent parse failed" doesn't tag the error with the trip id

- **File:** `packages/ai/src/index.ts:191-194`
- **Issue:** The log is useful for ops but has no correlation id. When a traveler reports a degraded itinerary, ops can't easily trace the request to the trip.
- **Fix:** Accept a `correlationId` in `generateItineraryFromBrief` and include it in the warning. This is a small contract change; needs to be threaded through the callers. Out of scope unless a follow-up spins it up.

## LOW-11 — `behavioral-profiler` has no flush path for the ring buffer

- **File:** `apps/web/app/_lib/behavioral-profiler.ts:54-90`
- **Issue:** `drainBehaviorBuffer()` exists but no caller invokes it. The buffer fills up to 100 events and is then overwritten. There is no path to a Supabase `user_behavior_events` table (the table doesn't exist yet — see P6-1 in `docs/engineering-lifecycle.md`).
- **Fix:** Mark as an explicit TODO pointing to P6-1. No code change.

---

## Summary

- 11 LOWs identified, all minor.
- 5 are code-fixable in a single small PR (LOW-2, LOW-4, LOW-5, LOW-6, LOW-8).
- 4 are documentation comments (LOW-1, LOW-3, LOW-9, LOW-11).
- 2 are deferred to roadmap items (LOW-7 → P3-3; LOW-10 → P6-1).
- 0 are critical-path blockers.

The 5 code fixes ship in a follow-up commit; the 4 documentation comments are inlined into the relevant files; the 2 deferred items are tracked in `docs/engineering-lifecycle.md`.
