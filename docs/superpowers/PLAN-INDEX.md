# Rumia plan index

**Reconciled:** 2026-07-18 after the Task 17 closeout, bounded visual-hardening pass, and second final-review fix evidence

This is the authority map for Rumia planning. Only documents marked **ACTIVE**
may supply implementation tasks. Supporting contracts constrain those tasks;
deferred packets require a new approval gate; archived plans are evidence only.

## Current truth

- Product scope is Portugal-wide and activity-first. The product helps a
  traveler decide what is genuinely worth doing; the saved-day workspace is a
  secondary shaping tool.
- The 2026-07-15 17-task frontend finish plan is complete and remains the
  accepted 53-route baseline. Its exact Task 17 artifact
  (`F5CzHygTrY-JgoMIi9Sxt`, digest
  `e839dcd3790d560ffbd2fb8c694d1c02277c5353a628440b9e70358aed6277e0`)
  passed the final non-visual and 102-row visual gates and received owner
  approval on 2026-07-17.
- The 53-entry route catalogue, persona/state fixtures, typed recovery,
  capability enforcement, shared operator shell, and truthful gated surfaces
  are accepted baseline behavior. The earlier local `user_profiles` RLS block
  is closed and must not be reported as current.
- The 2026-07-18 visual-hardening plan was the only active frontend follow-up
  and is complete: Planner contrast, Home mobile chapter/card geometry, and
  Console Workspace mobile blank-tail composition are its bounded defects.
  This was a hardening pass, not a route-wide redesign or a reopening of the
  completed July 15 queue. No frontend follow-up is currently active; the
  activity-first master remains the active product authority.
- The July 17 102-row snapshot approval remains valid historical evidence. All
  six changed Home, Planner, and Console Workspace desktop/mobile delta rows
  received explicit owner approval; their scoped PNG update and final
  exact-artifact gate are closed. The later 2026-07-18 exact Console image
  approval explicitly supersedes the plan's provisional 78% endpoint with the
  measured 70% per-pane floor plus viewport, overflow, containment, and
  truthfulness checks; it does not authorize changing approved pixels.
- The completed follow-up reused one exact standalone artifact, build
  `yOnVK7qbn55IFxrzqRCkV`, digest
  `001ad401de23721cde98ef35643bd9abc38c16f63fd8de34ad13c70a30248867`,
  with verified port closure. A development server is not release evidence.
- The earlier hardening and j4Cx final-review candidates remain historical
  evidence. The current schema-3 replacement candidate is build
  `rudKclU2P-R_aXinasLka`, digest
  `2be3e21cc9773f72434a08c14a0d2c78abf33eac042fbe8ab6c38013396e3164`,
  bound to clean source `91d9256` / tree `248a548` with 2,623 runtime entries.
  Post-build test-only commit `6928a8b` is outside candidate bytes. The final
  gate passed 1,643 non-visual and 102 visual checks, with 2,433 and 306
  intentional project skips. The candidate is local release-ready. None of
  these local candidates was deployed; the private VPS evidence remains the
  July 13 release, and public DNS/Caddy ingress remains deferred.
- Public ingress, deployment, Map Phase 2/3, richer 3D, saved-account launch,
  payments, workers, email, uploads, reviewer operations, and B2B enablement
  remain separate gates.
- Existing dirty worktree material must be preserved; no reset or broad cleanup
  is part of the hardening pass.

## Active authority

| Status | Document | Owns |
| --- | --- | --- |
| **ACTIVE — PRODUCT** | [`plans/2026-07-10-rumia-activity-first-master.md`](plans/2026-07-10-rumia-activity-first-master.md) | Portugal-wide activity promise, non-goals, release order, validation |

## Completed frontend baseline

| Status | Document | Evidence |
| --- | --- | --- |
| **COMPLETED — 2026-07-17** | [`plans/2026-07-15-rumia-frontend-finish.md`](plans/2026-07-15-rumia-frontend-finish.md) | 17-task 53-route implementation, exact-artifact receipt, 102 approved desktop/mobile rows, and final non-visual/visual gate |
| **COMPLETED — FRONTEND HARDENING** | [`plans/2026-07-18-rumia-visual-hardening-release-readiness.md`](plans/2026-07-18-rumia-visual-hardening-release-readiness.md) | Six approved Home/Planner/Console delta rows, scoped six-PNG refresh, final gate on the recorded exact artifact, and local release readiness |

## Supporting contracts

| Status | Document | Constrains |
| --- | --- | --- |
| **SUPPORTING** | [`specs/2026-07-10-rumia-activity-curation-design.md`](specs/2026-07-10-rumia-activity-curation-design.md) | Editorial judgement, evidence, practical activity fields |
| **SUPPORTING** | [`specs/2026-07-11-rumia-vps-platform-design.md`](specs/2026-07-11-rumia-vps-platform-design.md) | Better Auth, PostgreSQL/PostGIS, VPS isolation, backups |
| **SUPPORTING** | [`specs/2026-07-11-rumia-activity-map-capability.md`](specs/2026-07-11-rumia-activity-map-capability.md) | List-first map behavior, fallback, attribution, licensing |
| **SUPPORTING** | [`specs/2026-07-12-rumia-frontend-aesthetic-rework-design.md`](specs/2026-07-12-rumia-frontend-aesthetic-rework-design.md) | Durable visual principles; the completed 2026-07-18 plan is evidence, not an active follow-up |

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
| [`../reviews/2026-07-15-rumia-frontend-finish-verification.md`](../reviews/2026-07-15-rumia-frontend-finish-verification.md) | Completed frontend technical and exact-artifact evidence |
| [`../reviews/2026-07-16-rumia-cleanup-allowlist.md`](../reviews/2026-07-16-rumia-cleanup-allowlist.md) | Task 17 exact-file cleanup decision and migrated acceptance-file deletion |
| [`../reviews/2026-07-16-rumia-snapshot-approval.md`](../reviews/2026-07-16-rumia-snapshot-approval.md) | Approved 102-row baseline plus the approved July 18 six-row hardening delta and final-gate result |
| [`../../.superpowers/sdd/final-review-fix-report.md`](../../.superpowers/sdd/final-review-fix-report.md) | Second final-review mechanism fix, schema-3 replacement provenance/archive, Console authority supersession, test-only timing stabilization, and complete green same-receipt final gate |
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

The July 18 frontend hardening closure is local release-readiness evidence only.
Do not infer authorization for push, deployment, public ingress, Map Phase 2/3,
3D work, or gated-feature enablement from this completed plan; each remains a
separate explicit gate.
