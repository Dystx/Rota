# Rumia Phase 5 Admin and Control Plane Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn admin and console routes into a capability-scoped control plane for Portugal content, specialists, quality, operations cases, metrics, versioned configuration, and organization-isolated B2B beta workspaces.

**Architecture:** Content management, operations, analytics, configuration, specialist verification, and developer documentation use separate database-authoritative capabilities. Console pipeline state lives in dedicated operations-case tables rather than overloading traveler trips; configuration is immutable and two-principal approved. Organization membership comes from database rows, with the URL slug treated only as a cosmetic lookup key.

**Tech Stack:** Next.js 16 App Router, React 19.2, TypeScript 5.9 strict mode, Supabase Postgres/Auth/Storage/PostGIS/pgvector, shared `OperatorShell`, Vitest, Playwright, SQL policy tests, and axe.

## Global Constraints

- Capability navigation is exact: Content shows Places, Regions, Partners, Specialists, and Quality; Operations shows Pipeline and Messages; Knowledge requires `content:manage`; Metrics requires `analytics:read`; Configuration requires `configuration:deploy` plus readiness. Workspace is contextual and appears only for a selected case.
- Places/regions/partners/knowledge/quality require `content:manage`; specialist decisions require `specialists:verify`; pipeline/workspace/messages require `operations:manage`; metrics require `analytics:read`; configuration requires `configuration:deploy`; API docs require `developer_docs:read`.
- Protected pages, APIs/actions, RLS/functions, and Storage each enforce the same capability independently.
- Every mutation records actor, capability, reason, correlation ID, timestamp, and before/after checksum.
- Production empty data remains empty. Explicit demo mode is labeled “Demo data,” disabled in production, and disables every mutation.
- Operations cases and console messages remain separate from traveler route/review/message records.
- Configuration changes are immutable versions with validation, diff, distinct requester/confirmer, deploy, rollback, and audit.
- Organization membership is database authoritative; `orgSlug` never grants access and wrong/unknown organizations are indistinguishable externally.
- Tables become labeled cards below `md`; desktop drag/drop always has keyboard/button alternatives.
- Operator closed choices and filters use labelled chips, segmented modes, direct cards, or phrase rails—never a user-facing `<select>` dropdown. Native text/number/file controls remain only for intrinsically open values and evidence uploads.

---

### Task 5.1: Standardize responsive operator data primitives and capability layouts

**Files:**
- Create: `packages/ui/src/components/operator-data-view.tsx`
- Create: `packages/ui/src/components/operator-data-view.test.tsx`
- Create: `packages/ui/src/components/operator-filters.tsx`
- Create: `packages/ui/src/components/operator-filters.test.tsx`
- Create: `packages/ui/src/components/operator-state.tsx`
- Create: `packages/ui/src/components/operator-state.test.tsx`
- Create: `packages/ui/src/components/operator-page-header.tsx`
- Create: `packages/ui/src/components/operator-page-header.test.tsx`
- Create: `packages/ui/src/components/operator-status-strip.tsx`
- Create: `packages/ui/src/components/operator-status-strip.test.tsx`
- Create: `packages/ui/src/components/operator-mode-switcher.tsx`
- Create: `packages/ui/src/components/operator-mode-switcher.test.tsx`
- Create: `packages/ui/src/components/operator-detail-drawer.tsx`
- Create: `packages/ui/src/components/operator-detail-drawer.test.tsx`
- Modify: `packages/ui/src/components/operator-shell.tsx`
- Modify: `packages/ui/src/components/operator-shell.test.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `apps/web/app/(admin)/admin/layout.tsx`
- Modify: `apps/web/app/console/layout.tsx`
- Modify: `apps/web/app/(admin)/admin/places/page.tsx`
- Modify: `apps/web/app/(admin)/admin/regions/page.tsx`
- Modify: `apps/web/app/(admin)/admin/partners/page.tsx`
- Modify: `apps/web/app/(admin)/admin/specialists/page.tsx`
- Modify: `apps/web/app/(admin)/admin/quality/page.tsx`
- Create: `apps/web/lib/readiness/operator.ts`
- Create: `apps/web/lib/readiness/operator.test.ts`

**Interfaces:**

```ts
export type OperatorColumn<Row> = {
  id: string;
  header: string;
  cell: (row: Row) => React.ReactNode;
  mobileLabel: string;
  sortKey?: string;
};

export function buildOperatorNavigation(
  actor: AuthorizedActor,
  readiness: OperatorReadiness
): readonly OperatorNavGroup[];
```

- [ ] **Step 1: Write failing UI/layout tests** for long headers/values, desktop table, mobile cards, filters/search/pagination labels, loading/empty/error/denied/demo states, destructive confirmation, focus return, and mobile sheet navigation.
- [ ] **Step 2: Run focused tests and confirm each admin/console page currently owns incompatible patterns.**
- [ ] **Step 3: Implement the shared primitives** with semantic table markup at `md+`, definition-list cards below `md`, URL-backed filters, explicit pagination, reusable state panels, typed mobile modes, detail-drawer focus restoration, and no horizontal document overflow. Remove nested `PageShell` and raw Material/Phosphor ligatures from every listed non-redirect admin page.
- [ ] **Step 4: Apply composite readiness and exact capability navigation in both layouts.** Proxy remains coarse only; loaders and handlers resolve the authorized actor.
- [ ] **Step 5: Run UI tests/typecheck/visual/a11y/overflow checks and commit** with `git commit -m "feat: standardize operator data surfaces"`.

### Task 5.2: Complete the Places and evidence workspace

**Files:**
- Modify: `packages/types/src/place.ts`
- Create: `packages/types/src/place-evidence.ts`
- Create: `packages/types/src/place-evidence.test.ts`
- Modify: `packages/types/src/index.ts`
- Modify: `apps/web/app/(admin)/admin/places/page.tsx`
- Create: `apps/web/app/(admin)/admin/places/page.test.tsx`
- Modify: `apps/web/app/(admin)/admin/places/place-editor.tsx`
- Create: `apps/web/app/(admin)/admin/places/place-editor.test.tsx`
- Modify: `apps/web/app/api/places/route.ts`
- Modify: `apps/web/app/api/places/route.test.ts`
- Modify: `apps/web/app/api/places/[placeId]/route.ts`
- Create: `apps/web/app/api/places/[placeId]/route.test.ts`
- Create: `apps/web/app/api/places/[placeId]/evidence/route.ts`
- Create: `apps/web/app/api/places/[placeId]/evidence/route.test.ts`
- Create: `apps/web/app/(admin)/admin/places/_components/place-workspace.tsx`
- Create: `apps/web/app/(admin)/admin/places/_components/place-workspace.test.tsx`
- Create: `apps/web/app/(admin)/admin/places/_components/place-list.tsx`
- Create: `apps/web/app/(admin)/admin/places/_components/place-map.tsx`
- Create: `apps/web/app/(admin)/admin/places/_components/place-edit-drawer.tsx`
- Create: `apps/web/app/(admin)/admin/places/_components/place-evidence-ledger.tsx`
- Create: `packages/db/src/place-evidence.ts`
- Create: `packages/db/src/place-evidence.test.ts`
- Modify: `packages/db/src/places.ts`
- Create: `packages/db/src/places.test.ts`
- Modify: `packages/db/src/audit.ts`
- Modify: `packages/db/src/index.ts`
- Create via CLI: `supabase/migrations/*_extend_place_evidence_and_publication.sql`
- Create: `supabase/policy-tests/phase-5-content-capability-matrix.sql`

- [ ] **Step 1: Write failing API/DB/UI tests** for search/filter/pagination, publication `draft | review | published | retired`, verification `unverified | verified | expired | rejected`, source/evidence verdict and expiry, region/seasonality, create/update/archive, stale revision `409`, coordinate validation, audit checksum, and capability denial.
- [ ] **Step 2: Run `pnpm exec supabase migration new extend_place_evidence_and_publication`** adding place revision/publication/verification fields, normalized evidence, indexes, capability policies, and forward audit changes; do not rewrite historical migrations.
- [ ] **Step 3: Implement place/evidence commands** with `content:manage`, typed errors, server canonicalization, base revision, and immutable audit. Public APIs return published projections only; embedding work is enqueued outside the mutation transaction.
- [ ] **Step 4: Rebuild the workspace with List/Map/Edit modes** and clear sections using option rails/chips for enumerations, native inputs only for necessary free text/numbers, synchronized map/list selection, save status, focus-restoring drawer, and explicit archive confirmation.
- [ ] **Step 5: Run tests, policy matrix, typechecks, keyboard/map verification, and commit** with `git commit -m "feat: harden place knowledge management"`.

### Task 5.3: Complete Regions, partners, and canonical admin redirects

**Files:**
- Modify: `apps/web/app/(admin)/admin/regions/page.tsx`
- Create: `apps/web/app/(admin)/admin/regions/page.test.tsx`
- Modify: `apps/web/app/(admin)/admin/partners/page.tsx`
- Create: `apps/web/app/(admin)/admin/partners/page.test.tsx`
- Modify: `apps/web/app/(admin)/admin/countries/page.tsx`
- Modify: `apps/web/app/(admin)/admin/reviewers/page.tsx`
- Modify: `apps/web/app/(admin)/admin/analytics/page.tsx`
- Modify: `apps/web/app/api/regions/route.ts`
- Create: `apps/web/app/api/regions/route.test.ts`
- Modify: `apps/web/app/api/partners/route.ts`
- Create: `apps/web/app/api/partners/route.test.ts`
- Create: `apps/web/app/api/partners/[partnerId]/route.ts`
- Create: `apps/web/app/api/partners/[partnerId]/route.test.ts`
- Create: `apps/web/app/(admin)/admin/regions/_components/region-rollout-workspace.tsx`
- Create: `apps/web/app/(admin)/admin/regions/_components/region-rollout-workspace.test.tsx`
- Create: `apps/web/app/(admin)/admin/partners/_components/partner-workspace.tsx`
- Create: `apps/web/app/(admin)/admin/partners/_components/partner-workspace.test.tsx`
- Create: `apps/web/app/(admin)/admin/partners/_components/partner-audit-ledger.tsx`
- Modify: `packages/db/src/regions.ts`
- Create: `packages/db/src/regions.test.ts`
- Modify: `packages/db/src/partners.ts`
- Create: `packages/db/src/partners.test.ts`
- Create via CLI: `supabase/migrations/*_extend_region_rollout_and_partner_governance.sql`

**Redirects:** `/admin/countries` → `308 /admin/regions?view=rollout`; `/admin/reviewers` → `308 /admin/specialists?view=assignments`; `/admin/analytics` → `308 /console/metrics?view=product`.

- [ ] **Step 1: Write failing tests** for region rollout status, owned image/content completeness, partner status/placement/disclosure, URL filters, pagination, long values, capability denial, audit, and the exact redirect status/location pairs.
- [ ] **Step 2: Run tests and confirm fixture/inconsistent table behavior.**
- [ ] **Step 3: Run `pnpm exec supabase migration new extend_region_rollout_and_partner_governance`;** implement scoped commands and responsive views with one source of Portugal region rollout readiness and partner agreement/status/coverage/quality/evidence/revision. Mobile region and partner workspaces use Overview/List/Edit and List/Evidence/Decision modes; destructive actions require a reason and second confirmation.
- [ ] **Step 4: Implement permanent redirects and remove legacy destinations from navigation/sitemap/capture lists.**
- [ ] **Step 5: Run tests/typechecks/visual/a11y checks and commit** with `git commit -m "feat: complete regions partners and redirects"`.

### Task 5.4: Make specialist verification and quality auditable

**Files:**
- Modify: `apps/web/app/(admin)/admin/specialists/page.tsx`
- Create: `apps/web/app/(admin)/admin/specialists/page.test.tsx`
- Modify: `apps/web/app/(admin)/admin/specialists/actions.ts`
- Create: `apps/web/app/(admin)/admin/specialists/actions.test.ts`
- Remove: `apps/web/app/(admin)/admin/specialists/_components/flip-verification-form.tsx`
- Create: `apps/web/app/(admin)/admin/specialists/_components/specialist-verification-workspace.tsx`
- Create: `apps/web/app/(admin)/admin/specialists/_components/specialist-verification-workspace.test.tsx`
- Create: `apps/web/app/(admin)/admin/specialists/_components/specialist-evidence-drawer.tsx`
- Create: `apps/web/app/(admin)/admin/specialists/_components/specialist-decision-panel.tsx`
- Create: `apps/web/app/api/admin/specialist-applications/[applicationId]/decision/route.ts`
- Create: `apps/web/app/api/admin/specialist-applications/[applicationId]/decision/route.test.ts`
- Modify: `apps/web/app/(admin)/admin/quality/page.tsx`
- Create: `apps/web/app/(admin)/admin/quality/page.test.tsx`
- Create: `apps/web/app/(admin)/admin/quality/_components/quality-workspace.tsx`
- Create: `apps/web/app/(admin)/admin/quality/_components/quality-workspace.test.tsx`
- Create: `apps/web/app/(admin)/admin/quality/_components/quality-evidence-drawer.tsx`
- Create: `apps/web/app/(admin)/admin/quality/_components/quality-decision-panel.tsx`
- Create: `apps/web/app/api/admin/quality/[caseId]/decision/route.ts`
- Create: `apps/web/app/api/admin/quality/[caseId]/decision/route.test.ts`
- Modify: `packages/db/src/specialist-applications.ts`
- Modify: `packages/db/src/specialist-applications.test.ts`
- Create: `packages/db/src/quality.ts`
- Create: `packages/db/src/quality.test.ts`
- Modify: `packages/db/src/index.ts`
- Create via CLI: `supabase/migrations/*_create_quality_cases_and_decisions.sql`
- Modify: `supabase/policy-tests/phase-5-content-capability-matrix.sql`

- [ ] **Step 1: Write failing tests** for application filters/evidence, approve/deny/suspend/revoke, required reason, self-decision denial, atomic reviewer provisioning, quality issue severity/owner/status, resolution evidence, audit trail, and no demo substitution on empty/error.
- [ ] **Step 2: Run `pnpm exec supabase migration new create_quality_cases_and_decisions`** for quality cases, evidence, revision, and decisions only. Specialist application schema and provisioning remain owned by Phase 4.
- [ ] **Step 3: Make the admin decision API consume Phase 4 `decideSpecialistApplication()`** and require `specialists:verify`; Queue/Evidence/Decision modes restore focus, require denial reason, render real empty/error states, and disable mutation in explicit demo mode.
- [ ] **Step 4: Implement the quality worklist** from real route/place/review integrity signals with filters, assignment, resolution, and links to the authoritative record.
- [ ] **Step 5: Run tests, policy matrices, typechecks, visual/a11y checks, and commit** with `git commit -m "feat: audit specialist and quality operations"`.

### Task 5.5: Create dedicated operations cases and pipeline APIs

**Files:**
- Create: `packages/types/src/operator-case.ts`
- Create: `packages/types/src/operator-case.test.ts`
- Create: `packages/db/src/operator-cases.ts`
- Create: `packages/db/src/operator-cases.test.ts`
- Modify: `packages/types/src/index.ts`
- Modify: `packages/db/src/index.ts`
- Create: `apps/web/app/api/console/cases/route.ts`
- Create: `apps/web/app/api/console/cases/route.test.ts`
- Create: `apps/web/app/api/console/cases/[caseId]/route.ts`
- Create: `apps/web/app/api/console/cases/[caseId]/route.test.ts`
- Modify: `apps/web/app/api/console/pipeline/move/route.ts`
- Create: `apps/web/app/api/console/pipeline/move/route.test.ts`
- Remove: `apps/web/app/api/console/pipeline/move/store.ts`
- Modify: `apps/web/app/console/page.tsx`
- Modify: `apps/web/app/console/pipeline/page.tsx`
- Modify: `apps/web/app/console/pipeline/_components/pipeline-page-client.tsx`
- Modify: `apps/web/app/console/_components/pipeline-board.tsx`
- Modify: `apps/web/app/console/_components/kanban-card.tsx`
- Modify: `apps/web/app/console/_components/kanban-lane.tsx`
- Create via CLI: `supabase/migrations/*_create_operations_cases_and_events.sql`
- Create: `supabase/policy-tests/phase-5-operator-console-matrix.sql`

**Interfaces:**

```ts
export type OperationsCaseState = "intake" | "triage" | "assigned" | "in_progress" | "waiting" | "resolved" | "closed";
export type OperationsCaseCommand =
  | { action: "assign"; assigneeUserId: string; baseVersion: number }
  | { action: "move"; state: OperationsCaseState; baseVersion: number }
  | { action: "set_priority"; priority: "low" | "normal" | "high" | "urgent"; baseVersion: number }
  | { action: "resolve"; reason: string; baseVersion: number };
```

- [ ] **Step 1: Write failing contract/API tests** for every transition, stale version, assignment, priority, SLA, lane counts, filters, pagination, audit, capability denial, and missing/foreign uniform `404`.
- [ ] **Step 2: Generate operations case/event schema** independent of `trips.status`, with explicit forward/return/reopen transitions, immutable events, optimistic revision, case kinds `payment | generation | export | review | content | provider`, priorities `critical | high | normal | low`, assignee/due/SLA indexes, and `operations:manage` policies.
- [ ] **Step 3: Implement list/command APIs** and a real pipeline projection. `/console` becomes permanent `308 /console/pipeline`.
- [ ] **Step 4: Retain desktop drag/drop with buttons/keyboard alternatives;** mobile uses lane tabs/counts and case cards without horizontal board overflow.
- [ ] **Step 5: Run tests/policy matrices/typechecks/visual/a11y checks and commit** with `git commit -m "feat: add operations case pipeline"`.

### Task 5.6: Complete console workspace and separate operations messaging

**Files:**
- Modify: `apps/web/app/console/workspace/page.tsx`
- Create: `apps/web/app/console/workspace/page.test.tsx`
- Modify: `apps/web/app/console/messages/page.tsx`
- Create: `apps/web/app/console/messages/page.test.tsx`
- Modify: `apps/web/app/console/messages/_components/message-thread.tsx`
- Modify: `apps/web/app/console/messages/_components/conversation-list.tsx`
- Modify: `apps/web/app/console/messages/_components/triage-panel.tsx`
- Remove: `apps/web/app/console/messages/_lib/conversations.ts`
- Create: `apps/web/app/console/pipeline/_components/mobile-lane-tabs.tsx`
- Create: `apps/web/app/console/pipeline/_components/mobile-lane-tabs.test.tsx`
- Create: `apps/web/app/console/workspace/_components/workspace-mode-switcher.tsx`
- Create: `apps/web/app/console/messages/_components/messages-mobile-modes.tsx`
- Create: `apps/web/app/console/messages/_components/messages-mobile-modes.test.tsx`
- Create: `apps/web/app/api/console/cases/[caseId]/messages/route.ts`
- Create: `apps/web/app/api/console/cases/[caseId]/messages/route.test.ts`
- Modify: `apps/web/app/api/console/chat-messages/route.ts`
- Remove: `apps/web/app/api/console/chat-messages/store.ts`
- Modify: `apps/web/app/api/console/itinerary-events/route.ts`
- Remove: `apps/web/app/api/console/itinerary-events/store.ts`
- Modify: `packages/db/src/operator-cases.ts`
- Modify: `packages/db/src/operator-cases.test.ts`
- Create via CLI: `supabase/migrations/*_separate_operations_messages.sql`
- Modify: `supabase/policy-tests/phase-5-operator-console-matrix.sql`

- [ ] **Step 1: Write failing tests** for workspace case requirement, no-case `307 /console/pipeline`, uniform missing/foreign `404`, persisted event timeline, case notes/actions, message sender authority, cursor pagination, rate limit, and strict separation from Phase 3 trip messages.
- [ ] **Step 2: Generate `operations_case_messages` and conversation projections** with case/capability policies; quarantine the old console `chat_messages` table, replace its in-memory store, and retire `itinerary-events` with typed `410 Gone` so no parallel unscoped channel remains.
- [ ] **Step 3: Rebuild workspace from the selected case projection.** Remove hard-coded Demo cards and enabled fake Publish actions. Explicit demo mode has a banner and all mutation controls disabled.
- [ ] **Step 4: Rebuild console mobile modes:** Pipeline uses lane tabs/counts; Workspace uses Case/Timeline/Actions; Messages uses Conversations/Thread/Case Context. Messages use triage state, client-only snippet suggestions, server-authored actor, delivery/error states, and links back to the case.
- [ ] **Step 5: Run API/UI/policy tests, typechecks, and commit** with `git commit -m "feat: add scoped operations workspace messaging"`.

### Task 5.7: Implement knowledge graph and truthful aggregate metrics

**Files:**
- Create: `packages/types/src/knowledge.ts`
- Create: `packages/types/src/knowledge.test.ts`
- Create: `packages/types/src/operator-metrics.ts`
- Create: `packages/types/src/operator-metrics.test.ts`
- Modify: `packages/types/src/index.ts`
- Modify: `apps/web/app/console/graph/page.tsx`
- Create: `apps/web/app/console/graph/page.test.tsx`
- Modify: `apps/web/app/console/metrics/page.tsx`
- Create: `apps/web/app/console/metrics/page.test.tsx`
- Create: `apps/web/app/api/console/metrics/route.ts`
- Create: `apps/web/app/api/console/metrics/route.test.ts`
- Create: `apps/web/app/api/console/knowledge/nodes/route.ts`
- Create: `apps/web/app/api/console/knowledge/nodes/route.test.ts`
- Create: `apps/web/app/api/console/knowledge/nodes/[nodeId]/route.ts`
- Create: `apps/web/app/api/console/knowledge/nodes/[nodeId]/route.test.ts`
- Create: `apps/web/app/api/console/knowledge/relationships/route.ts`
- Create: `apps/web/app/api/console/knowledge/relationships/route.test.ts`
- Create: `packages/db/src/knowledge.ts`
- Create: `packages/db/src/knowledge.test.ts`
- Modify: `packages/db/src/analytics.ts`
- Create: `packages/db/src/analytics.test.ts`
- Create: `apps/web/app/console/graph/_components/knowledge-workspace.tsx`
- Create: `apps/web/app/console/graph/_components/knowledge-workspace.test.tsx`
- Create: `apps/web/app/console/metrics/_components/metrics-workspace.tsx`
- Create: `apps/web/app/console/metrics/_components/metrics-workspace.test.tsx`
- Create via CLI: `supabase/migrations/*_create_knowledge_relationships.sql`
- Create via CLI: `supabase/migrations/*_create_aggregate_metrics_projection.sql`

**Interfaces:**

```ts
export type MetricValue =
  | { status: "value"; value: number }
  | { status: "zero" }
  | { status: "untracked" }
  | { status: "unavailable"; reason: string };
```

- [ ] **Step 1: Write failing tests** for knowledge search/filter/relationship editing, embedding/source state, aggregate-only metrics, time window, zero/empty data, GMV currency rules, funnel denominators, latency percentiles, specialist SLA, and capability separation.
- [ ] **Step 2: Generate security-invoker aggregate projections/materialized refresh metadata** that reveal no traveler text, message body, payment identifier, or row-level PII.
- [ ] **Step 3: Implement graph for `content:manage`** with Tree/Node/Relationships mobile modes, evidence/revision on relationships, raw vectors never returned or editable, and explicit provider-unavailable states; delete static hierarchy/vector-preview fixtures.
- [ ] **Step 4: Implement metrics for `analytics:read`** with Summary/Funnel/Cohorts modes and `MetricValue` states. Delete fabricated weekly bars/global regions/GMV/conversion; zero, untracked, and unavailable remain visually and semantically distinct.
- [ ] **Step 5: Run tests/typechecks/performance/visual checks and commit** with `git commit -m "feat: add knowledge graph and real metrics"`.

### Task 5.8: Add immutable two-principal configuration deployment

**Files:**
- Create: `packages/types/src/configuration.ts`
- Create: `packages/types/src/configuration.test.ts`
- Create: `packages/db/src/configuration.ts`
- Create: `packages/db/src/configuration.test.ts`
- Modify: `packages/types/src/index.ts`
- Modify: `packages/db/src/index.ts`
- Modify: `apps/web/app/console/config/page.tsx`
- Create: `apps/web/app/console/config/page.test.tsx`
- Create: `apps/web/lib/readiness/configuration.ts`
- Create: `apps/web/lib/readiness/configuration.test.ts`
- Create: `apps/web/app/api/console/config/versions/route.ts`
- Create: `apps/web/app/api/console/config/versions/route.test.ts`
- Create: `apps/web/app/api/console/config/versions/[versionId]/validate/route.ts`
- Create: `apps/web/app/api/console/config/versions/[versionId]/validate/route.test.ts`
- Create: `apps/web/app/api/console/config/versions/[versionId]/request/route.ts`
- Create: `apps/web/app/api/console/config/versions/[versionId]/request/route.test.ts`
- Create: `apps/web/app/api/console/config/versions/[versionId]/confirm/route.ts`
- Create: `apps/web/app/api/console/config/versions/[versionId]/confirm/route.test.ts`
- Create: `apps/web/app/api/console/config/versions/[versionId]/deploy/route.ts`
- Create: `apps/web/app/api/console/config/versions/[versionId]/deploy/route.test.ts`
- Create: `apps/web/app/api/console/config/versions/[versionId]/rollback/route.ts`
- Create: `apps/web/app/api/console/config/versions/[versionId]/rollback/route.test.ts`
- Create: `apps/web/app/console/config/_components/configuration-workspace.tsx`
- Create: `apps/web/app/console/config/_components/configuration-workspace.test.tsx`
- Create via CLI: `supabase/migrations/*_create_versioned_configuration.sql`
- Modify: `supabase/policy-tests/phase-5-operator-console-matrix.sql`

**Interfaces:**

```ts
export type ConfigurationState = "draft" | "validated" | "awaiting_confirmation" | "deployed" | "superseded" | "rolled_back" | "rejected";
```

- [ ] **Step 1: Write failing tests** for schema validation, immutable version/diff, requester, distinct confirmer, self-confirm denial, stale base, deploy, provider-unavailable, rollback, audit, and fewer-than-two-active-deployers readiness.
- [ ] **Step 2: Generate immutable version/approval/deployment/audit tables** with `configuration:deploy` policies and uniqueness preventing the requester from confirming the same version.
- [ ] **Step 3: Implement draft/validate/request/confirm/deploy/rollback APIs** over allowlisted typed tuning variables only—no secrets or raw prompt bodies. Provider calls happen after persisted approval; deployment result is idempotent. Fewer than two distinct active deploy-capable principals makes readiness unavailable.
- [ ] **Step 4: Replace inert “Production” controls** with Versions/Diff/Deploy mobile modes and actual environment, validation, requester, distinct confirmer, deployment, rollback, and audit states.
- [ ] **Step 5: Run tests/policy matrices/typechecks and commit** with `git commit -m "feat: add versioned configuration deployment"`.

### Task 5.9: Enforce organization-isolated B2B beta

**Files:**
- Create: `packages/types/src/organization.ts`
- Create: `packages/types/src/organization.test.ts`
- Create: `packages/db/src/organization-members.ts`
- Create: `packages/db/src/organization-members.test.ts`
- Create: `packages/db/src/organization-workspace.ts`
- Create: `packages/db/src/organization-workspace.test.ts`
- Modify: `packages/db/src/organizations.ts`
- Modify: `packages/db/src/index.ts`
- Modify: `packages/auth/src/org-id.ts`
- Modify: `packages/auth/src/org-id.test.ts`
- Create: `apps/web/lib/auth/organization.ts`
- Create: `apps/web/lib/auth/organization.test.ts`
- Create: `apps/web/app/b2b/layout.tsx`
- Modify: `apps/web/app/b2b/page.tsx`
- Create: `apps/web/app/b2b/_components/organization-selector.tsx`
- Create: `apps/web/app/b2b/_components/organization-selector.test.tsx`
- Create: `apps/web/app/b2b/_components/beta-interest-status.tsx`
- Modify: `apps/web/app/b2b/[orgSlug]/page.tsx`
- Create: `apps/web/app/b2b/[orgSlug]/_components/workspace.tsx`
- Create: `apps/web/app/b2b/[orgSlug]/_components/workspace.test.tsx`
- Create: `apps/web/app/b2b/[orgSlug]/_components/workspace-modes.tsx`
- Modify: `apps/web/app/_components/org-branding.tsx`
- Create: `apps/web/app/api/b2b/[orgSlug]/members/route.ts`
- Create: `apps/web/app/api/b2b/[orgSlug]/members/route.test.ts`
- Create: `apps/web/app/api/b2b/[orgSlug]/templates/route.ts`
- Create: `apps/web/app/api/b2b/[orgSlug]/templates/route.test.ts`
- Create: `apps/web/app/api/b2b/[orgSlug]/trip-requests/route.ts`
- Create: `apps/web/app/api/b2b/[orgSlug]/trip-requests/route.test.ts`
- Create: `apps/web/app/api/b2b/[orgSlug]/brand-assets/route.ts`
- Create: `apps/web/app/api/b2b/[orgSlug]/brand-assets/route.test.ts`
- Create via CLI: `supabase/migrations/*_create_organization_members.sql`
- Create via CLI: `supabase/migrations/*_create_organization_workspace_entities.sql`
- Create via CLI: `supabase/migrations/*_create_organization_asset_storage.sql`
- Create via CLI: `supabase/migrations/*_remove_jwt_org_authority.sql`
- Create: `supabase/policy-tests/phase-5-organization-isolation-matrix.sql`

**Interfaces:**

```ts
export type OrganizationMemberRole = "owner" | "manager" | "member";
export type OrganizationContext = { organizationId: string; slug: string; memberRole: OrganizationMemberRole; userId: string };
export async function resolveOrganizationContext(actor: AuthorizedActor, orgSlug: string): Promise<OrganizationContext | null>;
```

- [ ] **Step 1: Write failing tests** for DB membership authority, user-metadata/JWT spoofing, owner/manager/member permissions, unknown/wrong-org identical envelope and timing class, cross-tenant tables/Storage/API, slug rename, private branding, and flag-off interest state.
- [ ] **Step 2: Generate membership/workspace/private-asset migrations** and a forward migration removing `user_metadata`/single-org JWT authority and anonymous organization reads. Private helpers use `search_path = ''` and revoke public execution.
- [ ] **Step 3: Resolve the actor’s active database memberships first, then match the cosmetic slug within that trusted set;** never query an arbitrary organization by slug before membership validation. Pass only the trusted organization ID to B2B workspace queries. Keep `/api/v1/destinations` as a public published Portugal projection, outside tenant scope.
- [ ] **Step 4: Render public beta interest and an authorized workspace with Overview/Templates/Requests/Members modes.** Support server-validated active membership selection; validate colors as six-digit hex, private brand files as PNG/JPEG/WebP ≤2MB under `<organization uuid>/<random uuid>.<ext>`, and return one controlled unknown/unauthorized response.
- [ ] **Step 5: Run two-organization policy/API/UI tests, typechecks, headers/Storage checks, and commit** with `git commit -m "feat: isolate organization beta workspaces"`.

### Task 5.10: Gate and correct developer API documentation

**Files:**
- Modify: `apps/web/app/api/v1/docs/page.tsx`
- Create: `apps/web/app/api/v1/docs/page.test.tsx`
- Modify: `apps/web/app/api/v1/destinations/route.ts`
- Create: `apps/web/app/api/v1/destinations/route.test.ts`
- Modify: `packages/config/src/readiness.ts`
- Modify: `packages/config/src/readiness.test.ts`

- [ ] **Step 1: Write failing tests** for production-default `404`, flag off, missing `developer_docs:read`, migration/provider unavailable, ready capability access, one shared-shell `main`, no fake bearer key/org authority, and published-Portugal-only destination output.
- [ ] **Step 2: Run focused tests and confirm the current public docs advertise unsupported contracts.**
- [ ] **Step 3: Require `ENABLE_API_DOCS`, composite readiness, and `developer_docs:read` before rendering.** All denied/disabled production outcomes are `404`; the shared operator shell owns the landmark.
- [ ] **Step 4: Document only the current sanitized API contract** with typed errors, auth/capability requirements, rate limits, and published destination projection. Remove unsupported roadmap promises, example secrets, and user-metadata organization claims.
- [ ] **Step 5: Run tests/typechecks/route normalization and commit** with `git commit -m "docs: secure developer API documentation"`.

### Task 5.11: Gate the admin and control-plane release

**Files:**
- Modify: `apps/web/playwright/fixtures/organization-member-auth.ts`
- Create: `apps/web/playwright/tests/admin-control-plane.spec.ts`
- Create: `apps/web/playwright/tests/operator-console.spec.ts`
- Create: `apps/web/playwright/tests/beta-boundaries.spec.ts`
- Modify: `apps/web/playwright/tests/authorization-matrix.spec.ts`
- Modify: `apps/web/playwright/tests/operator-mobile-modes.spec.ts`
- Modify: `apps/web/playwright/tests/visual.spec.ts`
- Modify: `apps/web/playwright/tests/accessibility.spec.ts`
- Modify: `apps/web/playwright/tests/mobile-overflow.spec.ts`
- Modify: `apps/web/playwright/tests/perf.spec.ts`
- Create: `scripts/check-production-fixtures.mjs`
- Create: `scripts/check-production-fixtures.test.mjs`
- Create: `supabase/policy-tests/phase-5-content-capabilities.sql`
- Create: `supabase/policy-tests/phase-5-operations-cases.sql`
- Create: `supabase/policy-tests/phase-5-configuration.sql`
- Create: `supabase/policy-tests/phase-5-organization-isolation.sql`
- Modify: `docs/audit/route-matrix.md`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add failing journeys and SQL matrices** for content-only, specialist-verifier-only, operations-only, analytics-only, configuration-only, and developer-docs-only admins; cover place edit, specialist decision, quality resolution, case pipeline/workspace/message, graph edit, metrics states, two-principal config/rollback, B2B A/B/consumer table and Storage isolation, uniform wrong/unknown organizations, API docs, and every canonical redirect.
- [ ] **Step 2: Implement a production fixture invariant scanner** that rejects `DEMO_SPECIALISTS`, pipeline `FALLBACK_ITEMS`, canned console conversations, workspace samples, graph hierarchy/vector fixtures, static metric/volume arrays, raw icon names, fixture imports, mutation controls in demo mode, and protected production `using (true)` policies.
- [ ] **Step 3: Run the full gate:**

```bash
pnpm lint
pnpm typecheck
pnpm exec vitest run
pnpm build
pnpm check:migrations
pnpm exec supabase db reset
pnpm test:rls
node scripts/check-production-fixtures.mjs
pnpm --dir apps/web test:e2e
pnpm --dir apps/web test:visual
pnpm --dir apps/web test:a11y
pnpm --dir apps/web test:perf
git diff --check
```

- [ ] **Step 4: Manually verify desktop and 390px operator modes** for wrapping, filters, pagination, destructive confirmations, focus restoration, keyboard alternatives to drag/drop, one main/h1, no overflow, truthful empty/error/denied/unavailable/demo states, and no cross-capability navigation.
- [ ] **Step 5: Record evidence and commit** with `git commit -m "test: gate the admin control plane"`.

## Phase 5 release condition

Enable capabilities independently after their own RLS and journey matrices pass. Keep Console Configuration unavailable until two distinct deploy-capable principals and provider rollback evidence exist. Keep B2B beta off until two-organization isolation, private branding Storage, and uniform wrong-tenant behavior pass in staging. Production fixture scan must be clean for every enabled surface.
