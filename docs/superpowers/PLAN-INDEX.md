# Rumia plan index

**Reconciled:** 2026-07-16 after the full in-app-browser design review and adversarial corrective-plan audit

This is the authority map for Rumia planning. Only documents marked **ACTIVE**
may supply implementation tasks. Supporting contracts constrain those tasks;
deferred packets require a new approval gate; archived plans are evidence only.

## Current truth

- Product scope is Portugal-wide and activity-first.
- The completed 2026-07-14 convergence queue is preserved as historical
  evidence; it does not supply new implementation tasks.
- Frontend implementation remains owned by one canonical document:
  `plans/2026-07-15-rumia-frontend-finish.md`. It has been reopened and expanded
  into the corrective route/state implementation plan; no parallel redesign
  queue was created.
- The active product plan now points to that July 15 frontend authority; its
  stale July 14 frontend link was removed. `specs/PLAN-AUDIT_LATEST.md` records
  a READY-for-implementation verdict, not frontend completion.
- The July 16 live browser review found that the promised four scene grammars
  are not yet implemented as route-wide compositions. Most customer routes
  still inherit the same linen/contour field, dark rounded chapter, white cards,
  ochre labels, and repeated footer.
- Home and Planner are the strongest distinct surfaces. Portugal's desktop
  atlas, Pricing's free-first hierarchy, and Checkout's no-trip state are useful
  foundations, but they do not close their route-family acceptance gates.
- Primary open defects include weak Explore save feedback, a missing or
  unreliable mobile chosen-day tray, below-fold activity judgement, an
  oversized Workspace empty state, repetitive trust/legal/beta routes, cloned
  traveler archive layouts, sparse reviewer/admin pages, and a separate Console
  shell.
- The accepted mobile Console Workspace baseline contains a large blank white
  tail. Snapshot success is therefore not human visual approval.
- The source HTTP catalogue has 53 entries: 51 rendered routes and 2 redirects.
  `docs/audit/route-matrix.md` currently has only 51 rows, omits activity detail
  and feedback, and does not yet express the required state matrix.
- In a development runtime without database/auth configuration, Sign-in,
  Itineraries, and Vault can remain in streamed skeleton/error responses and
  Account can render a blank 500 shell. Typed unavailable recovery is an open P0
  task; provider failure must not masquerade as anonymous or forbidden access.
- `/console/*` and `/api/v1/docs` must enforce the role/capability contract
  declared by the catalogue before operator visual work is accepted.
- `/b2b/[orgSlug]` cannot have a truthful organization-ready state under the
  active frontend authority because no membership contract exists and schema
  changes are out of scope. It remains unavailable without organization-data
  disclosure.
- Earlier unit, typecheck, build, accessibility, performance, and browser
  results remain technical evidence only. They do not override the July 16
  design review or authorize snapshot refresh.
- No snapshot baseline is approved for replacement and no deployment is
  authorized. Acceptance must use one exact standalone artifact with one
  Playwright worker; a long-lived development server is not release evidence.
- Task 17 now provides that exact-artifact harness and manifest-driven route,
  recovery, preference, and visual contracts. Its pre-approval run materialized
  one build and closed port 3105, but authenticated global setup still stops at
  `apps/web/playwright/global-setup.ts:113` because local PostgreSQL rejects the
  `app.user_profiles` insert under RLS. The 102-row snapshot approval ledger is
  therefore open and no snapshot update has been authorized.
- Public ingress and optional map/provider/legal decisions remain separate.
- Map Phase 2/3 and richer 3D remain deferred and must not enter this finish.
- Existing dirty worktree material must be preserved; no reset or broad cleanup
  is part of the visual plan.

## Active authority

| Status | Document | Owns |
| --- | --- | --- |
| **ACTIVE — PRODUCT** | [`plans/2026-07-10-rumia-activity-first-master.md`](plans/2026-07-10-rumia-activity-first-master.md) | Portugal-wide activity promise, non-goals, release order, validation |
| **ACTIVE — FRONTEND IMPLEMENTATION** | [`plans/2026-07-15-rumia-frontend-finish.md`](plans/2026-07-15-rumia-frontend-finish.md) | Corrective 53-route presentation contract, concrete persona/fixture/state scenarios, 17 implementation tasks, operator access convergence, and human visual acceptance |

## Supporting contracts

| Status | Document | Constrains |
| --- | --- | --- |
| **SUPPORTING** | [`specs/2026-07-10-rumia-activity-curation-design.md`](specs/2026-07-10-rumia-activity-curation-design.md) | Editorial judgement, evidence, practical activity fields |
| **SUPPORTING** | [`specs/2026-07-11-rumia-vps-platform-design.md`](specs/2026-07-11-rumia-vps-platform-design.md) | Better Auth, PostgreSQL/PostGIS, VPS isolation, backups |
| **SUPPORTING** | [`specs/2026-07-11-rumia-activity-map-capability.md`](specs/2026-07-11-rumia-activity-map-capability.md) | List-first map behavior, fallback, attribution, licensing |
| **SUPPORTING** | [`specs/2026-07-12-rumia-frontend-aesthetic-rework-design.md`](specs/2026-07-12-rumia-frontend-aesthetic-rework-design.md) | Durable visual principles; the 2026-07-15 plan owns current execution |

## Deferred packet

| Status | Document | Gate |
| --- | --- | --- |
| **DEFERRED** | [`plans/2026-07-12-rumia-map-phase2-3-unblock.md`](plans/2026-07-12-rumia-map-phase2-3-unblock.md) | Owner/legal/provider, licence, attribution, privacy, quota, performance, fallback, rollback |

Map/3D work must not start before the core generated-plan/activity-day journey
and the frontend polish plan are visually stable.

## Current evidence

| Evidence | Purpose |
| --- | --- |
| [`../reviews/2026-07-14-rumia-frontend-visual-audit.md`](../reviews/2026-07-14-rumia-frontend-visual-audit.md) | Fresh 13-route desktop/mobile audit and current visual findings |
| [`../reviews/2026-07-15-rumia-frontend-finish-verification.md`](../reviews/2026-07-15-rumia-frontend-finish-verification.md) | Prior exact-artifact technical evidence; superseded as aesthetic acceptance by the July 16 corrective plan |
| [`../reviews/2026-07-16-rumia-cleanup-allowlist.md`](../reviews/2026-07-16-rumia-cleanup-allowlist.md) | Task 17 exact-file cleanup decision and migrated acceptance-file deletion |
| [`../reviews/2026-07-16-rumia-snapshot-approval.md`](../reviews/2026-07-16-rumia-snapshot-approval.md) | Open 102-row primary baseline review; no owner approval or snapshot refresh |
| [`../reviews/2026-07-14-rumia-frontend-convergence-baseline.md`](../reviews/2026-07-14-rumia-frontend-convergence-baseline.md) | Exact implementation checkpoint and route ownership |
| [`../reviews/2026-07-13-rumia-ui-ux-visual-review.md`](../reviews/2026-07-13-rumia-ui-ux-visual-review.md) | Earlier functional and cinematic closeout; superseded for aesthetic acceptance |
| [`../reviews/2026-07-13-rumia-full-bleed-media-research.md`](../reviews/2026-07-13-rumia-full-bleed-media-research.md) | Media/licensing direction and bounded cinematic rationale |
| [`../../specs/PLAN-AUDIT_LATEST.md`](../../specs/PLAN-AUDIT_LATEST.md) | Adversarial readiness audit for the corrective plan; explicitly not implementation or aesthetic approval |
| [`../ops/cutover-evidence.md`](../ops/cutover-evidence.md) | Private VPS operational evidence |

## Archived implementation history

Finished and superseded plans have been removed from the active queue and are
kept under `docs/superpowers/archive/` for provenance only.

Newly archived in this reconciliation:

- [`archive/plans/2026-07-14-rumia-frontend-convergence-implementation.md`](archive/plans/2026-07-14-rumia-frontend-convergence-implementation.md) — completed convergence implementation history.
- [`archive/plans/2026-07-12-rumia-frontend-deep-redesign.md`](archive/plans/2026-07-12-rumia-frontend-deep-redesign.md) — completed technical/cinematic implementation history.
- [`archive/plans/2026-07-11-rumia-vps-self-hosted-migration.md`](archive/plans/2026-07-11-rumia-vps-self-hosted-migration.md) — completed private VPS migration/cutover history.

Previously archived families remain historical:

- `archive/plans/2026-07-09-*`
- `archive/plans/2026-07-10-rumia-full-rework-*`
- `archive/plans/2026-07-10-rumia-phase-*`
- `archive/plans/2026-07-11-rumia-full-redesign-and-ui-plan.md`
- `archive/plans/2026-07-12-rumia-frontend-aesthetic-rework*.md`
- `archive/plans/2026-07-12-rumia-frontend-foundation-planner-slice.md`

The older root documents `docs/roadmap.md`, `docs/master-roadmap.md`,
`docs/engineering-lifecycle.md`, `docs/spec.md`, `docs/spec-v4.md`, and
`docs/spec-refined-2026.md` are explicitly labelled historical. They are not
execution plans even though they remain in place for cross-reference and git
provenance.

Do not reopen an archived checklist. Copy a still-valid requirement into the
active plan, reconcile this index, and gather fresh evidence.

## Next checkpoint

Execute the active plan in this order:

1. Freeze the exact current 53-route desktop/mobile/provenance baseline, then
   build the route-presentation plus concrete scenario catalogues, four
   viewport projects, explicit surface/chrome contracts, bounded web/auth
   recovery, and deterministic persona/state fixtures.
2. Primary public journey, trust/reading routes, traveler product, and gated
   surfaces in independently reviewed route-family commits.
3. Catalogue-derived capability enforcement and one shared operator shell.
4. Reviewer/admin density, Console truth/mobile repair, and API docs.
5. Complete the blocked authenticated route/state/Axe/performance run, then
   human review of all 102 primary desktop/mobile baselines before any scoped
   snapshot refresh. The current blocker is local `user_profiles` RLS, not a
   visual pass or release approval.

Do not begin route cleanup, baseline regeneration, deployment, Map Phase 2/3,
or 3D work before its preceding gate is explicitly closed.
