# Rumia Phase 2 Living Brief Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current planner loop with a sentence-like Living Brief that accepts deterministic phrases or typed replacements, generates a truthful anonymous preview, survives authentication, and claims exactly one persisted trip with RouteVersion 1.

**Architecture:** A strict `TripIntentDraft` is the single planner state. Deterministic choices remain local; only typed replacements cross a revision-aware parser boundary. The server independently evaluates completeness, generates a redacted preview, persists a short-lived server artifact, and issues an opaque HttpOnly claim binding. Claiming runs as one idempotent database transaction and never trusts URL parameters or browser storage as authority.

**Tech Stack:** React 19.2, Next.js 16 App Router, TypeScript 5.9 strict mode, Supabase Postgres/Auth, OpenAI structured outputs behind an adapter, Vitest, Testing Library, Playwright, and axe.

## Global Constraints

- The planner presents prose, inline phrases, and option rails—no form grid, select, combobox dropdown, or chatbot transcript.
- Native `button`, `input`, and `textarea` semantics remain available to keyboard and assistive-technology users.
- Deterministic choices have confidence `1`; typed phrases are accepted only after a current-revision parse with confidence at least `0.8` or explicit clarification.
- Accepted values and pending text are separate; a failed parse never destroys the last accepted value.
- The browser stores only an editable copy. The server artifact, checksum, expiry, owner, and claim record are authoritative.
- Anonymous preview exposes coarse bases, themes, aggregate travel, warnings, and at most two sample stops; the full route remains server-only.
- No deterministic whole-itinerary provider may silently substitute for unavailable live AI outside explicit test/demo mode.
- Phase 3 may extend route and trip contracts but may not replace the RouteVersion identity introduced here.

---

### Task 2.1: Define strict intent, phrase, and completeness contracts

**Files:**
- Create: `packages/types/src/trip-intent.ts`
- Create: `packages/types/src/trip-intent.test.ts`
- Create: `packages/types/src/planner-preview.ts`
- Create: `packages/types/src/planner-preview.test.ts`
- Modify: `packages/types/src/index.ts`

**Interfaces:**

```ts
export type IntentSource = "deterministic_choice" | "custom_parser" | "explicit_unknown";
export type PhraseState =
  | "prompt" | "choosing" | "editing" | "parsing" | "accepted"
  | "needs_clarification" | "conflict" | "provider_unavailable";

export type AcceptedIntentValue<T> = {
  rawText: string;
  value: T;
  source: IntentSource;
  confidence: number;
  revision: number;
};

export type IntentFieldState<T> = {
  status: PhraseState;
  accepted: AcceptedIntentValue<T> | null;
  pendingText: string;
  revision: number;
  issue: { code: string; message: string } | null;
};

export type PreviewReadiness =
  | { ready: true; warnings: readonly string[] }
  | { ready: false; missing: readonly string[]; conflicts: readonly string[] };

export function evaluatePreviewReadiness(draft: TripIntentDraft): PreviewReadiness;
```

`TripIntentDraft` contains destination, duration, `DateWindow` (`exact | month | season | undecided`), party and child ages, transport (`train | car | mixed | help_me_decide`), pace, interests, avoidances, budget, accommodation, and free context. Preview requires destination, duration, an explicit or undecided date stance, party, transport, pace, and at least one interest.

- [ ] **Step 1: Write failing contract and completeness tests** for deterministic confidence, custom-confidence threshold, missing required values, explicit unknown dates, child-age conflicts, impossible duration/date combinations, and optional erased fields.
- [ ] **Step 2: Run** `pnpm exec vitest run packages/types/src/trip-intent.test.ts packages/types/src/planner-preview.test.ts` **and confirm missing-module failures.**
- [ ] **Step 3: Implement the types and a pure, deterministic completeness evaluator.** Do not import React, Supabase, providers, or browser globals.
- [ ] **Step 4: Run** `pnpm exec vitest run packages/types/src/trip-intent.test.ts packages/types/src/planner-preview.test.ts && pnpm --filter @repo/types typecheck` **and expect PASS.**
- [ ] **Step 5: Commit** with `git add packages/types/src && git commit -m "feat: define living brief intent contracts"`.

### Task 2.2: Build the phrase catalogue, reducer, and session copy

**Files:**
- Create: `apps/web/app/planner/_lib/phrase-catalog.ts`
- Create: `apps/web/app/planner/_lib/phrase-catalog.test.ts`
- Create: `apps/web/app/planner/_lib/trip-intent-reducer.ts`
- Create: `apps/web/app/planner/_lib/trip-intent-reducer.test.ts`
- Create: `apps/web/app/planner/_lib/draft-storage.ts`
- Create: `apps/web/app/planner/_lib/draft-storage.test.ts`
- Modify: `apps/web/app/planner/_lib/choice-model.ts`
- Modify: `apps/web/app/planner/_lib/choice-model.test.ts`

**Interfaces:**

```ts
export function createTripIntentDraft(input?: Partial<TripIntentDraft>): TripIntentDraft;
export function reduceTripIntentDraft(state: TripIntentDraft, action: TripIntentAction): TripIntentDraft;
export function loadSessionDraft(draftId: string, now?: Date): DraftLoadResult;
export function saveSessionDraft(draft: TripIntentDraft): void;
export function clearSessionDraft(draftId: string): void;
```

- [ ] **Step 1: Write failing reducer/storage tests** proving a deterministic option accepts immediately, edit preserves the accepted value, stale parser results are ignored, required deletion returns to prompt, optional deletion erases, conflict resolution increments revision, and storage expires after exactly 24 hours.
- [ ] **Step 2: Run** `pnpm exec vitest run apps/web/app/planner/_lib` **and verify the new exports are absent.**
- [ ] **Step 3: Implement the complete Portugal-first phrase catalogue** with stable IDs and plain-language options for all required and refinement fields. Keep the Phase 1 homepage choice model as a one-way adapter into `TripIntentDraft`, not a second canonical state.
- [ ] **Step 4: Implement versioned session serialization** that rejects corrupt, expired, and schema-mismatched payloads without logging traveler text.
- [ ] **Step 5: Run** `pnpm exec vitest run apps/web/app/planner/_lib && pnpm --filter web typecheck` **and expect PASS.**
- [ ] **Step 6: Commit** with `git add apps/web/app/planner/_lib && git commit -m "feat: add living brief state model"`.

### Task 2.3: Assemble the accessible Living Brief Composer

**Files:**
- Create: `apps/web/app/planner/_components/living-brief-composer.tsx`
- Create: `apps/web/app/planner/_components/living-brief-composer.test.tsx`
- Create: `apps/web/app/planner/_components/living-sentence.tsx`
- Create: `apps/web/app/planner/_components/living-sentence.test.tsx`
- Create: `apps/web/app/planner/_components/planner-consequence-line.tsx`
- Create: `apps/web/app/planner/_components/planner-consequence-line.test.tsx`
- Modify: `apps/web/app/planner/_components/planner-single-screen.tsx`
- Modify: `apps/web/app/planner/_components/planner-single-screen.test.tsx`
- Modify: `apps/web/app/planner/planner-client.tsx`
- Modify: `apps/web/app/planner/page.tsx`

**Consumes:** `AcceptedPhrase` and `PhraseChoiceRail` from Phase 0; `TripIntentDraft` and the reducer from Tasks 2.1–2.2.

- [ ] **Step 1: Write failing interaction tests** for inline wrapping, click-to-edit, autosizing input/textarea, Enter/Space selection, four-arrow roving focus, Escape restore, Tab accept-and-advance, Down Arrow from editor into the rail, caret restoration, IME composition, delete/erase, conflict copy, and accessible state/value labels.
- [ ] **Step 2: Run** `pnpm exec vitest run apps/web/app/planner/_components/living-brief-composer.test.tsx apps/web/app/planner/_components/living-sentence.test.tsx` **and confirm missing components.**
- [ ] **Step 3: Implement one readable sentence flow:** “I’m going to [destination] for [duration], around [dates], with [party]. We’ll travel by [transport], at a [pace] pace, mainly for [interests].” Put optional fields behind an inline “Refine this plan” disclosure, never a separate form panel.
- [ ] **Step 4: Replace the old sequential stepper visually** while retaining a temporary adapter only for existing deep-link tests. The page has one visible `h1`, one polite status region, and one primary “Preview my route” action enabled only by `evaluatePreviewReadiness`.
- [ ] **Step 5: Run focused tests,** `pnpm --filter web typecheck`, and a manual keyboard pass at 390px and 1440px.
- [ ] **Step 6: Commit** with `git add apps/web/app/planner && git commit -m "feat: build the living brief composer"`.

### Task 2.4: Add the revision-safe custom phrase parser

**Files:**
- Create: `packages/ai/src/phrase-parser.ts`
- Create: `packages/ai/src/phrase-parser.test.ts`
- Modify: `packages/ai/src/index.ts`
- Create: `apps/web/app/api/planner/parse/route.ts`
- Create: `apps/web/app/api/planner/parse/route.test.ts`
- Modify: `packages/config/src/readiness.ts`
- Modify: `packages/config/src/readiness.test.ts`
- Modify: `.env.example`

**Interfaces:**

```ts
export interface PhraseParser {
  parse(request: PhraseParseRequest): Promise<PhraseParseResult>;
}

export function createLivePhraseParser(options: {
  apiKey: string;
  model: string;
  timeoutMs: number;
}): PhraseParser;
```

The request and response both carry `phraseId`, `field`, and `revision`. Results are `accepted`, `needs_clarification`, `conflict`, or `provider_unavailable`; structured output is schema-validated before use.

- [ ] **Step 1: Write failing adapter/API tests** for valid parse, schema rejection, timeout, aborted request, missing readiness, stale revision, low confidence, and PII-safe error envelopes.
- [ ] **Step 2: Run** `pnpm exec vitest run packages/ai/src/phrase-parser.test.ts apps/web/app/api/planner/parse/route.test.ts` **and confirm failures.**
- [ ] **Step 3: Implement the provider-neutral interface and live adapter.** Read the model from server configuration; do not hardcode a model name. Never send the entire brief when one phrase is sufficient.
- [ ] **Step 4: Implement the route with rate limiting, body limits, schema validation, composite AI readiness, abort propagation, and no raw provider errors.** The client cancels the previous parse and discards every response whose revision no longer matches.
- [ ] **Step 5: Run focused tests and** `pnpm --filter @repo/ai typecheck && pnpm --filter web typecheck`.
- [ ] **Step 6: Commit** with `git add packages/ai/src packages/config/src apps/web/app/api/planner/parse .env.example && git commit -m "feat: add safe custom phrase parsing"`.

### Task 2.5: Persist RouteVersion and route-generation job foundations

**Files:**
- Create: `packages/types/src/route-version.ts`
- Create: `packages/types/src/route-version.test.ts`
- Create: `packages/types/src/trip-lifecycle.ts`
- Create: `packages/types/src/trip-lifecycle.test.ts`
- Modify: `packages/types/src/index.ts`
- Create: `packages/db/src/route-versions.ts`
- Create: `packages/db/src/route-versions.test.ts`
- Create: `packages/db/src/trip-projections.ts`
- Create: `packages/db/src/trip-projections.test.ts`
- Modify: `packages/db/src/index.ts`
- Create via CLI: `supabase/migrations/*_create_route_versions_and_generation_jobs.sql`
- Create: `supabase/policy-tests/phase-2-route-version-matrix.sql`

**Interfaces:**

```ts
export type RouteVersion = {
  id: string;
  tripId: string;
  version: number;
  briefSnapshot: TripIntentDraft;
  days: RouteDay[];
  legs: RouteLeg[];
  warnings: RouteWarning[];
  integrity: RouteIntegrityResult[];
  provenance: RouteGenerationProvenance;
  checksum: string;
  creator: { kind: "generation" | "traveler" | "reviewer"; userId: string | null };
  createdAt: string;
  supersedesVersion: number | null;
  destinationTimeZone: "Europe/Lisbon" | "Atlantic/Azores";
};

export async function publishRouteVersion(input: PublishRouteVersionInput, options: SystemDataOptions): Promise<RouteVersion>;
```

- [ ] **Step 1: Write failing type/DB tests** for canonical checksum stability, unique `(trip_id, version)`, immutable versions, sequential publish, base-version conflicts, provenance, and redacted/free versus full projections.
- [ ] **Step 2: Run the focused tests** and confirm missing contracts.
- [ ] **Step 3: Generate the migration** with `pnpm exec supabase migration new create_route_versions_and_generation_jobs`; create `route_versions`, `route_generation_jobs`, immutable state events, required indexes, private helpers, and deny direct client reads of raw versions/jobs.
- [ ] **Step 4: Implement DB modules** with explicit system/user data contexts; no helper may silently fall back to a service-role client.
- [ ] **Step 5: Reset and verify** with `pnpm check:migrations && pnpm exec supabase db reset && pnpm test:rls && pnpm exec supabase db lint --local`, using the exact lint syntax confirmed by `pnpm exec supabase db lint --help`.
- [ ] **Step 6: Run package tests/typecheck and commit** only the generated migration, policy test, and declared package files with `git commit -m "feat: persist immutable route versions"`.

### Task 2.6: Generate consequences and a redacted preview

**Files:**
- Create: `packages/routing/src/intent-consequences.ts`
- Create: `packages/routing/src/intent-consequences.test.ts`
- Modify: `packages/routing/src/index.ts`
- Create: `packages/ai/src/route-generator.ts`
- Create: `packages/ai/src/route-generator.test.ts`
- Modify: `packages/ai/src/index.ts`
- Create: `apps/web/app/planner/_components/planner-map-preview.tsx`
- Create: `apps/web/app/planner/_components/planner-map-preview.test.tsx`
- Create: `apps/web/app/planner/_components/planner-preview.tsx`
- Create: `apps/web/app/planner/_components/planner-preview.test.tsx`
- Create: `apps/web/app/api/planner/preview/route.ts`
- Create: `apps/web/app/api/planner/preview/route.test.ts`
- Modify: `apps/web/app/planner/planner-client.tsx`
- Modify: `packages/analytics/src/index.ts`
- Modify: `packages/analytics/src/index.test.ts`

- [ ] **Step 1: Write failing consequence tests** proving transport, pace, duration, accessibility, season, and party choices cause deterministic visible route implications and warnings.
- [ ] **Step 2: Write failing API/projection tests** proving the server revalidates readiness, blocking conflicts prevent generation, the free response has at most two stops, no full agenda/private notes leak, and provider failure stays truthful.
- [ ] **Step 3: Implement `deriveIntentConsequence()` and the provider-neutral `RouteGenerator`.** Generate the complete route server-side, checksum its canonical representation, then create a physically redacted `FreePreviewProjection`.
- [ ] **Step 4: Implement the preview UI** as a calm route reveal with static list equivalent, progressive map loading, warnings, “why this fits,” and the next action. Do not expose locked detail blurred in the DOM.
- [ ] **Step 5: Instrument** `brief_started`, `phrase_accepted`, `brief_completed`, `route_preview_generated`, and `route_conflict_seen` using IDs/enums only—never free text.
- [ ] **Step 6: Run focused tests, package typechecks, and commit** with `git commit -m "feat: generate redacted route previews"`.

### Task 2.7: Persist drafts and claim anonymous previews exactly once

**Files:**
- Create: `packages/db/src/planner-drafts.ts`
- Create: `packages/db/src/planner-drafts.test.ts`
- Modify: `packages/db/src/index.ts`
- Create: `apps/web/lib/planner/preview-receipt.ts`
- Create: `apps/web/lib/planner/preview-receipt.test.ts`
- Create: `apps/web/app/api/planner/drafts/[draftId]/route.ts`
- Create: `apps/web/app/api/planner/drafts/[draftId]/route.test.ts`
- Create: `apps/web/app/api/planner/claim/route.ts`
- Create: `apps/web/app/api/planner/claim/route.test.ts`
- Modify: `apps/web/app/auth/callback/route.ts`
- Modify: `apps/web/app/sign-in/_actions/sign-in.ts`
- Modify: `apps/web/app/auth/safe-next.ts`
- Create via CLI: `supabase/migrations/*_create_living_brief_drafts_and_preview_claims.sql`
- Modify: `supabase/policy-tests/phase-2-route-version-matrix.sql`

**Claim result:**

```ts
export type ClaimPreviewResult = {
  tripId: string;
  routeVersion: 1;
  alreadyClaimed: boolean;
};
```

- [ ] **Step 1: Write failing receipt/claim tests** for tampering, expiry, checksum mismatch, missing cookie, canceled sign-in, callback recovery, refresh repeat, two claim keys for one preview, simultaneous tabs, and foreign ownership.
- [ ] **Step 2: Run tests and confirm the claim path is absent.**
- [ ] **Step 3: Generate the migration** `create_living_brief_drafts_and_preview_claims`. Create owned `trip_intent_drafts`; server-only `planner_previews` and `planner_preview_claims`; expiry, unique idempotency keys, audit fields, and indexed ownership/expiry predicates.
- [ ] **Step 4: Issue a short-lived opaque HttpOnly, Secure-in-production, `SameSite=Lax` claim cookie.** Keep sessionStorage as the editable client copy; never put the receipt or raw intent in a URL. Use `BroadcastChannel("rumia-draft-claim")` only to notify sibling tabs.
- [ ] **Step 5: Implement one locking claim transaction:** verify user, expiry, receipt hash, route checksum, and unclaimed state; create the trip in `preview_ready`; write RouteVersion 1 with canonical destination timezone; set the published version; append lifecycle/audit events; persist the claim result; return the same trip on every valid retry. The claim creates no paid or review entitlement.
- [ ] **Step 6: Reset Supabase, run policy/focused tests and typechecks, then commit** with `git commit -m "feat: claim planner previews idempotently"`.

### Task 2.8: Turn `/trip/new` into an exception resolver

**Files:**
- Modify: `apps/web/app/(app)/trip/new/page.tsx`
- Create: `apps/web/app/(app)/trip/new/page.test.ts`
- Create: `apps/web/app/(app)/trip/new/trip-draft-resolver.tsx`
- Create: `apps/web/app/(app)/trip/new/trip-draft-resolver.test.tsx`
- Remove: `apps/web/app/(app)/trip/new/trip-brief-form.tsx`
- Modify: `apps/web/app/planner/planner-client.tsx`

**Exact outcomes:** no draft → `307 /planner`; known locally expired → `307 /planner` with a recovery notice; malformed, unknown, or foreign → uniform `404`; valid unresolved → only the first blocking inline phrase; complete unclaimed → `307 /planner?stage=preview`; claimed → `307 /trip/{id}`.

- [ ] **Step 1: Write failing route tests for all six outcomes,** including indistinguishable unknown/foreign responses.
- [ ] **Step 2: Run** `pnpm exec vitest run 'apps/web/app/(app)/trip/new'` **and confirm current form behavior fails.**
- [ ] **Step 3: Implement the resolver using server-owned draft state** and the same phrase primitive; do not create another form or accept an arbitrary return URL.
- [ ] **Step 4: Run focused tests, web typecheck, and route smoke tests.**
- [ ] **Step 5: Commit** with `git add 'apps/web/app/(app)/trip/new' apps/web/app/planner && git commit -m "feat: resolve incomplete trip drafts"`.

### Task 2.9: Prove the complete planner-to-claim release gate

**Files:**
- Create: `apps/web/playwright/tests/planner-living-brief.spec.ts`
- Create: `apps/web/playwright/tests/anonymous-preview-claim.spec.ts`
- Modify: `apps/web/playwright/tests/visual.spec.ts`
- Modify: `apps/web/playwright/tests/accessibility.spec.ts`
- Modify: `apps/web/playwright/tests/mobile-overflow.spec.ts`
- Modify: `apps/web/playwright/tests/protected-routes.spec.ts`
- Modify: `docs/audit/route-matrix.md`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add failing journeys** for deterministic completion, custom typed phrase, clarification, provider unavailable, anonymous preview, magic-link/new-tab claim, repeat claim, signed-in autosave, 390px keyboard flow, reduced motion, and full-detail non-disclosure.
- [ ] **Step 2: Add the Phase 2 SQL policy matrix to CI** after a clean `supabase db reset`; no policy test may be skipped because credentials or data are absent.
- [ ] **Step 3: Build production and run:**

```bash
pnpm lint
pnpm typecheck
pnpm exec vitest run
pnpm build
pnpm check:migrations
pnpm exec supabase db reset
pnpm test:rls
pnpm --dir apps/web test:e2e -- planner-living-brief anonymous-preview-claim
pnpm --dir apps/web test:visual
pnpm --dir apps/web test:a11y
pnpm --dir apps/web test:perf
pnpm qa:motion-gate
pnpm qa:mapbox-budget
pnpm qa:perf-budget
git diff --check
```

- [ ] **Step 4: Manually verify at 390px and 1440px:** no form-grid impression, no dropdown, every phrase editable/erasable, list alternative for map content, one `main`, one visible `h1`, no horizontal document overflow, and no traveler text in analytics/error output.
- [ ] **Step 5: Update the route matrix with evidence paths and commit** with `git commit -m "test: gate the living brief release"`.

## Phase 2 release condition

Release anonymous and signed-in route preview only when deterministic choices work with AI disabled, custom phrases fail truthfully when AI is unavailable, anonymous work survives a new-tab sign-in, concurrent claims return one trip and RouteVersion 1, free responses contain no locked detail, and all Phase 2 policy/visual/accessibility/performance gates pass in staging. Keep checkout, export, reviewer, and messaging flags off.
