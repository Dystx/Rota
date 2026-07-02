# Problems


## 2026-05-01T14:18:45+00:00 — Task: T1 Secret Lockdown
- Unresolved production gate: confirm Supabase Dashboard/API key rotation before deployment. Evidence file `.sisyphus/evidence/future-roadmap/task-1-rotation-confirmation.md` contains the manual steps and explicitly avoids claiming rotation occurred.

## 2026-05-01T14:31:05Z — Task: T3 Access Inventory
- Unresolved production gate: implement real Supabase Auth/session guards plus trusted role mapping before any traveler, reviewer, or admin route/API is production-exposed.
- Unresolved production gate: add ownership/assignment checks and future RLS so trip ids, reviewer ids, assignments, analytics, and admin CRUD data cannot be accessed by anonymous or wrong-role users.

## 2026-05-01T00:00:00Z — Task: T4 Roadmap Reconciliation
- Unresolved production gate: provider rollout still needs live Stripe, Resend, PostHog, and Mapbox integration work, even though deterministic contracts exist.
- Unresolved production gate: QA evidence proves prior slice verification, but it does not replace fresh verification for future production hardening tasks.

## 2026-05-01T14:42:01Z — Task: T5 QA Performance Baseline
- Unresolved production gate: add standardized QA/performance tooling before launch so the current baseline can evolve into enforceable CI checks.
- Unresolved documentation issue: route screenshots prove shell renderability, but they do not verify auth boundaries or production data correctness.

## 2026-05-01T14:50:21Z — Task: T6 Supabase Schema Audit
- Unresolved production gate: T9 must add trusted ownership/role mapping before T10 can write effective traveler/reviewer/admin RLS policies.
- Unresolved production gate: T10/T11/T40 must clear Supabase advisor findings for missing policies and unindexed foreign keys, then verify hot paths with EXPLAIN on local/staging data.

## 2026-05-01T15:27:00+00:00 — Task: T8 Supabase SSR Middleware
- Unresolved production gate: T9 still needs trusted role/profile mapping before wrong-role reviewer/admin behavior can be enforced beyond the deterministic helper contract.
- Unresolved production gate: traveler ownership and RLS-backed request-path data access still need T9/T10; T8 only blocks anonymous reviewer/admin surfaces and establishes client/session boundaries.


## 2026-05-01T16:00:00+00:00 — Task: T9 Role/Profile Schema
- Unresolved production gate: run `npx supabase db reset`, seed local personas, and execute live role/ownership queries once Supabase CLI and Docker/local stack are available.
- Unresolved production gate: T10 must add explicit policies/grants using `user_profiles`, `reviewer_auth_links`, and `owner_user_id`; current new tables intentionally remain deny-all to anon/authenticated under RLS.


## 2026-05-01T17:00:00+00:00 Task: T10 RLS Policies
- Unresolved production gate: apply the T10 migration to local/staging, run `supabase/policy-tests/task-10-rls-policy-matrix.sql`, and rerun Supabase security/performance advisors once CLI/Docker or another execution target is available.
- Unresolved production gate: T12 still needs to stop request-path reads/writes from relying on service-role/admin helpers except for approved server/webhook/job paths.
