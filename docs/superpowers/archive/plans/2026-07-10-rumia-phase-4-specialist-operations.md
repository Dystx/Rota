# Rumia Phase 4 Specialist Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give approved local specialists a secure queue, persisted-route revision workspace, proposal workflow, profile, history, and traveler messaging while completing the gated specialist application lifecycle.

**Architecture:** `specialist_profiles` becomes the canonical approved identity and is reconciled with reviewer assignments through trusted database links. Reviewer pages receive server-produced projections only for an active assignment; commands run through audited state transitions and never regenerate a route. The Guide beta is a separate applicant lifecycle whose approval transaction provisions reviewer access atomically.

**Tech Stack:** Next.js 16 App Router, React 19.2, TypeScript 5.9 strict mode, Supabase Postgres/Auth/Storage, shared `OperatorShell`, immutable `RouteVersion`, Vitest, Playwright, SQL policy tests, and axe.

## Global Constraints

- Reviewer navigation is Queue, Active reviews, History, and Profile; `/reviewer/operations` is a permanent redirect to the queue.
- Queue, trip, history, profile, review commands, messages, and attachments require a database-authoritative reviewer identity and the correct active assignment.
- Reviewers read the traveler’s persisted published route version; no reviewer page calls route generation from the brief.
- Required checks, proposals, traveler decisions, conflicts, and audit events remain distinct durable records.
- Proposal acceptance publishes a new route version and never mutates a prior version.
- Internal notes are never visible to travelers; traveler-visible reasons and impact are explicit fields.
- Applicants may edit only their own draft; portraits/evidence remain in private Storage and are visible only to the applicant or `specialists:verify` capability.
- Specialist approval, reviewer-role grant, reviewer linkage, decision audit, and access audit are one transaction.
- Desktop supports full review/edit. Mobile revision modes are Brief, Route, Checks, and Proposals; messaging modes are Conversations, Thread, and Trip Context. No mode creates document-level overflow.
- Closed specialist choices use phrase rails, chips, segmented modes, or direct cards; no onboarding, profile, check, or proposal flow presents a dropdown or conventional form grid.

---

### Task 4.1: Reconcile canonical specialist identity and reviewer linkage

**Files:**
- Create: `packages/types/src/specialist-identity.ts`
- Create: `packages/types/src/specialist-identity.test.ts`
- Modify: `packages/types/src/reviewer.ts`
- Modify: `packages/types/src/reviewer-assignment.ts`
- Modify: `packages/types/src/index.ts`
- Modify: `packages/db/src/specialists.ts`
- Modify: `packages/db/src/specialists.test.ts`
- Modify: `packages/db/src/reviewers.ts`
- Create: `packages/db/src/reviewers.test.ts`
- Modify: `packages/db/src/reviewer-assignments.ts`
- Create: `packages/db/src/reviewer-assignments.test.ts`
- Modify: `packages/db/src/index.ts`
- Create via CLI: `supabase/migrations/*_reconcile_specialist_reviewer_identity.sql`
- Create: `supabase/policy-tests/phase-4-specialist-identity-matrix.sql`

**Interfaces:**

```ts
export type SpecialistIdentity = {
  specialistId: string;
  userId: string;
  displayName: string;
  regions: readonly string[];
  languages: readonly string[];
  capabilities: readonly string[];
  approvalStatus: "approved" | "suspended" | "revoked";
};

export async function getSpecialistIdentityForActor(
  actor: AuthorizedActor,
  options: UserDataOptions
): Promise<SpecialistIdentity | null>;
```

- [ ] **Step 1: Write failing identity/assignment tests** for approved, suspended, revoked, missing link, duplicate link, legacy reviewer backfill, and active versus historical assignment.
- [ ] **Step 2: Run focused tests and confirm current reviewer/specialist models diverge.**
- [ ] **Step 3: Run `pnpm exec supabase migration new reconcile_specialist_reviewer_identity`** using `specialist_profiles` as canonical. Add one trusted unique reviewer link, backfill only through `reviewer_auth_links.user_id → specialist_profiles.user_id`, preserve unmapped legacy history, forbid new active assignments without a specialist UUID, and add active assignment indexes.
- [ ] **Step 4: Replace JWT-role fallback in reviewer identity resolution** with the Phase 0 authorized actor plus canonical specialist lookup.
- [ ] **Step 5: Run package tests, Supabase reset/policy tests/lint, typechecks, and commit** with `git commit -m "feat: reconcile specialist reviewer identity"`.

### Task 4.2: Add the specialist application and eligibility lifecycle

**Files:**
- Create: `packages/types/src/specialist-application.ts`
- Create: `packages/types/src/specialist-application.test.ts`
- Create: `packages/db/src/specialist-applications.ts`
- Create: `packages/db/src/specialist-applications.test.ts`
- Modify: `packages/types/src/index.ts`
- Modify: `packages/db/src/index.ts`
- Create: `apps/web/app/guide/_components/application-status.tsx`
- Create: `apps/web/app/guide/_components/application-status.test.tsx`
- Modify: `apps/web/app/guide/page.tsx`
- Modify: `apps/web/app/guide/onboarding/page.tsx`
- Modify: `apps/web/app/guide/onboarding/actions.ts`
- Modify: `apps/web/app/guide/onboarding/portrait-upload.ts`
- Create: `apps/web/app/guide/onboarding/_lib/stages.ts`
- Create: `apps/web/app/guide/onboarding/_lib/stages.test.ts`
- Create: `apps/web/app/guide/onboarding/_components/staged-onboarding.tsx`
- Create: `apps/web/app/guide/onboarding/_components/staged-onboarding.test.tsx`
- Create: `apps/web/app/guide/onboarding/_components/stage-rail.tsx`
- Create: `apps/web/app/guide/onboarding/_components/service-mode-picker.tsx`
- Create: `apps/web/app/guide/onboarding/_components/identity-evidence-step.tsx`
- Create: `apps/web/app/guide/onboarding/_components/review-step.tsx`
- Modify: `apps/web/app/guide/onboarding/_components/region-picker.tsx`
- Modify: `apps/web/app/guide/onboarding/_components/languages-picker.tsx`
- Modify: `apps/web/app/guide/onboarding/_components/skills-input.tsx`
- Remove: `apps/web/app/guide/onboarding/_components/guide-onboarding-form.tsx`
- Create via CLI: `supabase/migrations/*_create_specialist_applications_and_events.sql`
- Create via CLI: `supabase/migrations/*_create_specialist_evidence_storage.sql`
- Modify: `supabase/policy-tests/phase-4-specialist-identity-matrix.sql`

**Interfaces:**

```ts
export type SpecialistApplicationStatus =
  | "invited" | "draft" | "submitted" | "pending"
  | "approved" | "denied" | "withdrawn";

export async function decideSpecialistApplication(
  input: {
    applicationId: string;
    decision: "approve" | "deny";
    reason: string;
    actorUserId: string;
    correlationId: string;
  },
  options: SystemDataOptions
): Promise<SpecialistApplication>;
```

- [ ] **Step 1: Write failing lifecycle tests** for every allowed/denied transition, invitation eligibility, draft ownership, submit completeness, resubmit policy, denied reason, withdrawn application, approved immutability, and verifier-only evidence access.
- [ ] **Step 2: Generate application/event and private Storage migrations** with applicant ownership, `current_stage`, completeness, decision/audit records, and explicit grants. Evidence path is `<owner uuid>/<application uuid>/<random uuid>.<ext>`; draft owners can write/read, submitted evidence is immutable, and only the owner or `specialists:verify` can receive a short signed read. Extend the portrait bucket only through forward policy changes.
- [ ] **Step 3: Implement the fixed staged flow** Regions → Languages → Specialties → Service mode → Identity/evidence → Review. Enumerations use choice rails; custom text is limited to legal name, optional bio, and licence/evidence context. Render flag-off, ineligible, invited, draft, submitted, pending, approved, denied, and withdrawn truthfully.
- [ ] **Step 4: Replace external portrait URLs** with owner-prefixed private upload, client preflight, server validation, and short signed previews. Implement `decideSpecialistApplication()` as one locking transaction that validates pending evidence, records the reason, provisions the specialist profile, reviewer compatibility row/link, reviewer role grant, and decision/access audits.
- [ ] **Step 5: Run focused tests, Storage/RLS policy tests, typechecks, visual/a11y checks, and commit** with `git commit -m "feat: add specialist application lifecycle"`.

### Task 4.3: Standardize reviewer shell and route guards

**Files:**
- Modify: `apps/web/app/(reviewer)/reviewer/layout.tsx`
- Modify: `apps/web/app/(reviewer)/_components/require-reviewer-auth.tsx`
- Create: `apps/web/app/(reviewer)/_components/reviewer-readiness-boundary.tsx`
- Create: `apps/web/app/(reviewer)/_components/reviewer-readiness-boundary.test.tsx`
- Modify: `apps/web/app/(reviewer)/reviewer/operations/page.tsx`
- Modify: `apps/web/app/(reviewer)/reviewer/queue/page.tsx`
- Modify: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/page.tsx`
- Modify: `apps/web/app/(reviewer)/reviewer/history/page.tsx`
- Modify: `apps/web/app/(reviewer)/reviewer/profile/page.tsx`
- Modify: `packages/ui/src/components/operator-shell.tsx`
- Modify: `packages/ui/src/components/operator-shell.test.tsx`
- Modify: `apps/web/lib/auth/reviewer.ts`
- Modify: `apps/web/lib/auth/reviewer.test.ts`

- [ ] **Step 1: Write failing shell/guard tests** for anonymous safe-return, traveler `403`, approved reviewer, suspended reviewer, admin without assignment, migration/RLS-not-ready, foreign trip uniform `404`, and mobile sheet keyboard behavior.
- [ ] **Step 2: Run tests and confirm nested legacy shell/role-only access remains.**
- [ ] **Step 3: Make `OperatorShell` the only reviewer chrome owner** with exact navigation and one landmark set. Remove every nested `PageShell` from queue, trip, history, and profile. Layout performs coarse authentication plus readiness; every page loader/API still checks canonical identity/capability/assignment.
- [ ] **Step 4: Change `/reviewer/operations` to permanent `308 /reviewer/queue`.** Remove it from navigation, sitemap, and route capture lists.
- [ ] **Step 5: Run focused tests, protected-route smoke, axe, and mobile keyboard verification; commit** with `git commit -m "feat: unify reviewer navigation and guards"`.

### Task 4.4: Implement active-assignment queue and SLA projections

**Files:**
- Create: `packages/types/src/review-workflow.ts`
- Create: `packages/types/src/review-workflow.test.ts`
- Create: `packages/db/src/review-workflow.ts`
- Create: `packages/db/src/review-workflow.test.ts`
- Modify: `packages/types/src/index.ts`
- Modify: `packages/db/src/index.ts`
- Modify: `apps/web/app/(reviewer)/reviewer/queue/page.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/queue/page.test.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/queue/_components/queue-view.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/queue/_components/queue-view.test.tsx`
- Modify: `apps/web/app/api/reviewer-assignments/route.ts`
- Modify: `apps/web/app/api/reviewer-assignments/route.test.ts`
- Modify: `apps/web/app/api/reviewer-assignments/[assignmentId]/route.ts`
- Create: `apps/web/app/api/reviewer-assignments/[assignmentId]/route.test.ts`
- Create via CLI: `supabase/migrations/*_add_reviewer_assignment_lifecycle_and_sla.sql`
- Create: `supabase/policy-tests/phase-4-reviewer-assignment-matrix.sql`

**Interfaces:**

```ts
export type ReviewerAssignmentState =
  | "assigned" | "in_review" | "awaiting_traveler"
  | "provider_unavailable" | "completed" | "canceled" | "reassigned";
```

- [ ] **Step 1: Write failing lifecycle/projection tests** proving Phase 3 owns review request state (including `queued`), while `view=queue` shows this specialist’s assigned-not-started rows and `view=active` shows `in_review | awaiting_traveler | provider_unavailable`; cover due/SLA, blockers, reassign/cancel, historical denial, and uniform foreign `404`.
- [ ] **Step 2: Run `pnpm exec supabase migration new add_reviewer_assignment_lifecycle_and_sla`** with `assigned_by`, `due_at`, `acknowledged_at`, `started_at`, `ended_at`, revision, immutable assignment events, and a unique active index across `assigned | in_review | awaiting_traveler | provider_unavailable`. Admin assignment requires `operations:manage`; reviewers can invoke only permitted self-transitions.
- [ ] **Step 3: Implement one queue projection** containing trip stage, region, due date/SLA, blocker count, current status, traveler pace/interests summary, and next action—no raw private traveler text in list rows.
- [ ] **Step 4: Build desktop table/board and mobile cards** from the same data. Empty, denied, loading, provider-unavailable, and error states have explicit recovery actions.
- [ ] **Step 5: Run tests, policy matrix, typechecks, visual/a11y/overflow checks, and commit** with `git commit -m "feat: add reviewer assignment queue"`.

### Task 4.5: Build the persisted-route master revision workspace

**Files:**
- Modify: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/page.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/page.test.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/_components/revision-workspace.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/_components/revision-workspace.test.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/_components/mobile-mode-switcher.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/_components/review-checklist.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/_components/proposal-editor.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/_components/audit-timeline.tsx`
- Create: `packages/db/src/reviewer-workspace.ts`
- Create: `packages/db/src/reviewer-workspace.test.ts`
- Create: `apps/web/app/api/reviewer/trips/[tripId]/checks/[checkId]/route.ts`
- Create: `apps/web/app/api/reviewer/trips/[tripId]/checks/[checkId]/route.test.ts`
- Create: `apps/web/app/api/reviewer/trips/[tripId]/proposals/route.ts`
- Create: `apps/web/app/api/reviewer/trips/[tripId]/proposals/route.test.ts`
- Create: `apps/web/app/api/reviewer/trips/[tripId]/proposals/[proposalId]/route.ts`
- Create: `apps/web/app/api/reviewer/trips/[tripId]/proposals/[proposalId]/route.test.ts`
- Create: `apps/web/app/api/reviewer/trips/[tripId]/internal-note/route.ts`
- Create: `apps/web/app/api/reviewer/trips/[tripId]/internal-note/route.test.ts`
- Create: `apps/web/app/api/reviewer/trips/[tripId]/complete/route.ts`
- Create: `apps/web/app/api/reviewer/trips/[tripId]/complete/route.test.ts`
- Modify: `supabase/policy-tests/phase-4-reviewer-assignment-matrix.sql`

**Interfaces:**

```ts
export type ReviewCommand =
  | { action: "start"; baseVersion: number }
  | { action: "propose"; targetRouteVersion: number; changes: readonly AtomicRouteChange[]; reason: string; travelerImpact: string }
  | { action: "revise"; proposalId: string; changes: readonly AtomicRouteChange[] }
  | { action: "withdraw"; proposalId: string; reason?: string }
  | { action: "complete"; baseVersion: number };

export async function getReviewProjection(actor: AuthorizedActor, tripId: string): Promise<ReviewProjection | null>;
export async function executeReviewCommand(actor: AuthorizedActor, tripId: string, command: ReviewCommand): Promise<ReviewProjection>;
```

- [ ] **Step 1: Write failing tests** proving the workspace reads the persisted target version, exposes traveler brief/route/checks/proposals/internal notes/audit, prevents direct mutation, validates atomic changes, and rejects stale/foreign/inactive work.
- [ ] **Step 2: Consume Phase 3 `packages/types/src/review.ts`, `packages/db/src/reviews.ts`, `AssignedReviewerProjection`, and the existing review/check/proposal/message migration.** Add only `reviewer-workspace.ts` as a role-specific projection/command façade; do not create duplicate review tables.
- [ ] **Step 3: Remove itinerary regeneration from the reviewer page** and load `AssignedReviewerProjection`. Use the shared route editor primitives only to compose a proposal; do not publish until traveler acceptance.
- [ ] **Step 4: Build desktop Map/Timeline/Checks/Proposals layout and mobile Brief/Route/Checks/Proposals modes** with persisted selected trip/stop, focus restoration, keyboard-complete list controls, and accessible map equivalents. Reviewer commands derive identity server-side and return `409 route_version_conflict`, `422 review_incomplete`, or uniform `404`.
- [ ] **Step 5: Run focused tests, no-regeneration source scan, visual/a11y/overflow checks, and commit** with `git commit -m "feat: build reviewer revision workspace"`.

### Task 4.6: Enforce completion, rebase, and audit semantics

**Files:**
- Modify: `packages/db/src/reviewer-workspace.ts`
- Modify: `packages/db/src/reviewer-workspace.test.ts`
- Modify: `apps/web/app/api/reviewer/trips/[tripId]/complete/route.ts`
- Modify: `apps/web/app/api/reviewer/trips/[tripId]/complete/route.test.ts`
- Modify: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/_components/revision-workspace.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/_components/completion-gate.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/_components/completion-gate.test.tsx`

- [ ] **Step 1: Write failing transactional tests** for the Phase 3 traveler decision producing a new route/rebase marker, reviewer revise/withdraw, required checks not passed or not-applicable, blocking conflicts, awaiting-traveler decisions, unsettled current proposals, already-completed idempotency, and notification-outbox uniqueness.
- [ ] **Step 2: Run tests and verify completion currently lacks durable blockers/audit.**
- [ ] **Step 3: Implement lock order `trip → published route → review request → proposal IDs`** and keep routing/provider computation outside the transaction. Recheck active assignment and target version immediately before every write.
- [ ] **Step 4: Implement the completion gate** that names each blocker and links to it. Completion appends review/assignment/entitlement/audit events and queues exactly one traveler notification.
- [ ] **Step 5: Run concurrency tests, API tests, typechecks, and commit** with `git commit -m "feat: enforce review completion integrity"`.

### Task 4.7: Replace reviewer history and profile fixtures with scoped data

**Files:**
- Create: `packages/types/src/reviewer-profile.ts`
- Create: `packages/types/src/reviewer-profile.test.ts`
- Create: `packages/db/src/reviewer-profile.ts`
- Create: `packages/db/src/reviewer-profile.test.ts`
- Modify: `packages/types/src/index.ts`
- Modify: `packages/db/src/index.ts`
- Modify: `apps/web/app/(reviewer)/reviewer/history/page.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/history/page.test.tsx`
- Modify: `apps/web/app/(reviewer)/reviewer/profile/page.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/profile/page.test.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/profile/_actions/update-profile.ts`
- Create: `apps/web/app/(reviewer)/reviewer/profile/_actions/update-profile.test.ts`
- Modify: `packages/db/src/reviewers.ts`
- Modify: `packages/db/src/reviewers.test.ts`
- Create via CLI: `supabase/migrations/*_add_specialist_availability_and_preferences.sql`

- [ ] **Step 1: Write failing tests** for real completed-history rows, no fabricated throughput/timing/rating, pagination/filtering, empty/error/denied states, availability, maximum workload, coverage windows/timezone, regions, specialties, languages, notification choices, immutable verification/role fields, and suspended behavior.
- [ ] **Step 2: Run tests and confirm current pages fabricate metrics or have no mutation boundary.**
- [ ] **Step 3: Run `pnpm exec supabase migration new add_specialist_availability_and_preferences`;** implement scoped history projections from completed assignment/review events and reviewer-owned profile update actions with before/after audit, optimistic state, and typed errors.
- [ ] **Step 4: Render sentence-like profile editing and option rails where practical;** use native file input for portrait evidence and native text input only where free text is intrinsically required.
- [ ] **Step 5: Run tests/typechecks/visual/a11y checks and commit** with `git commit -m "feat: add reviewer history and profile data"`.

### Task 4.8: Complete assigned-reviewer messaging and attachments

**Files:**
- Modify: `apps/web/app/api/trips/[tripId]/messages/route.ts`
- Modify: `apps/web/app/api/trips/[tripId]/messages/route.test.ts`
- Create: `apps/web/app/api/trips/[tripId]/messages/attachments/route.ts`
- Create: `apps/web/app/api/trips/[tripId]/messages/attachments/route.test.ts`
- Create: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/_components/reviewer-messages.tsx`
- Create: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/_components/reviewer-messages.test.tsx`
- Create via CLI: `supabase/migrations/*_tighten_review_attachment_assignment_access.sql`
- Create: `supabase/policy-tests/phase-4-review-messaging-matrix.sql`

- [ ] **Step 1: Write failing tests** for owner, assigned reviewer, admin audit, former reviewer, other reviewer, other traveler, disabled readiness, closed review, message length, attachment MIME/size, signed URL expiry, and console-message separation.
- [ ] **Step 2: Consume Phase 3 conversation/message/attachment tables and run `pnpm exec supabase migration new tighten_review_attachment_assignment_access` only for active-assignment policy/index changes.** Private Storage is keyed by trip/review/conversation, uses service writes and reauthorized short signed reads, and has no participant-wide `using(true)` policy or direct raw-row grants.
- [ ] **Step 3: Implement cursor-paginated messages** with server-authored sender role, body validation, correlation ID, delivery state, attachment metadata, and rate limit. The caller never supplies a trusted role.
- [ ] **Step 4: Build reviewer messaging** with mobile Conversations/Thread/Trip Context modes, unread marker, attachment status, retry, and context links; do not add a separate public chat product or production-looking conversation when readiness is unavailable.
- [ ] **Step 5: Run API/UI/policy tests, typechecks, and commit** with `git commit -m "feat: scope specialist trip messaging"`.

### Task 4.9: Gate specialist operations end to end

**Files:**
- Modify: `apps/web/playwright/fixtures/specialist-candidate-auth.ts`
- Create: `apps/web/playwright/tests/reviewer-operations.spec.ts`
- Create: `apps/web/playwright/tests/reviewer-mobile-modes.spec.ts`
- Create: `apps/web/playwright/tests/guide-beta.spec.ts`
- Modify: `apps/web/playwright/global-setup.ts`
- Create: `apps/web/playwright/tests/authorization-matrix.spec.ts`
- Modify: `apps/web/playwright/tests/visual.spec.ts`
- Modify: `apps/web/playwright/tests/accessibility.spec.ts`
- Modify: `apps/web/playwright/tests/mobile-overflow.spec.ts`
- Modify: `docs/audit/route-matrix.md`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add failing journeys** for candidate application, evidence isolation, verifier approval transaction, queue assignment, review start, checks, proposal, traveler partial decision, rebase, completion, messaging, history, profile, suspension, and former-assignment denial.
- [ ] **Step 2: Add SQL policy matrices to CI** after a clean local reset and seed candidate, approved reviewer, suspended reviewer, second reviewer, traveler owner, second traveler, and admin personas.
- [ ] **Step 3: Run the complete gate:**

```bash
pnpm lint
pnpm typecheck
pnpm exec vitest run
pnpm build
pnpm check:migrations
pnpm exec supabase db reset
pnpm test:rls
pnpm --dir apps/web test:e2e
pnpm --dir apps/web test:visual
pnpm --dir apps/web test:a11y
pnpm --dir apps/web test:perf
test -z "$(rg -n 'generateItineraryFromBrief|PageShell' 'apps/web/app/(reviewer)' -g '*.ts' -g '*.tsx' | rg -v '\.test\.')"
git diff --check
```

- [ ] **Step 4: Manually verify reviewer desktop and mobile triage** with one main/h1, keyboard-complete checks/proposals/messages, list equivalents for map data, truthful empty/error/denied/provider-unavailable states, no fabricated identity/metrics, and no inactive-assignment data.
- [ ] **Step 5: Record evidence and commit** with `git commit -m "test: gate specialist operations"`.

## Phase 4 release condition

Enable reviewer access only after canonical identity, active assignment, proposal integrity, private attachment Storage, and complete audit tests pass. Enable Guide beta separately only after application/evidence isolation and atomic approval provisioning pass. Messaging remains off until both Phase 4 and Phase 6 provider/readiness canaries succeed.
