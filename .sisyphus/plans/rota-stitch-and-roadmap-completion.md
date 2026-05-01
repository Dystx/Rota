# Rota Stitch UI Rollout + Roadmap Completion

## TL;DR

> **Quick Summary**: Re-verify Slice 3 map on a clean runtime, then drive Stitch-based redesigns of the remaining surfaces (Slices 4–7) one slice at a time, with parallel sub-page tasks inside each slice. Close out with a 4-agent Final Verification Wave gated by an explicit `APPROVED` user token.
>
> **Deliverables**:
> - Slice 3 re-verified on clean `next start :3010` runtime (no `RouteStopPointSchema` errors, day switching, partner CTA tracked)
> - Slice 4 `/trip/[tripId]/export` redesigned against Stitch `aa02ed35f5e04ac6a84090981af31168`
> - Slice 5 `/account` + `/portugal` redesigned against Stitch `3e9c2db666c04499a47e1083872e92ed`
> - Slice 6 reviewer (5 sub-pages) redesigned against Stitch `d004025471a64b3e99f2d89f7aa81fc1`
> - Slice 7 admin (7 sub-pages) redesigned against archive + shared editorial system
> - Shared primitives extracted proactively at each slice's Kickoff (1-A)
> - Mobile (375px) + desktop (1440px) Playwright QA per page (4-C)
> - `docs/roadmap.md` status updates per slice (in slice verification tasks only)
> - Auto-generated `.sisyphus/evidence/FINAL_SUMMARY.md` + explicit `APPROVED` token gate (5-A)
>
> **Estimated Effort**: XL (4 sequential slices × parallel sub-page waves + final wave)
> **Parallel Execution**: YES — 15 waves, parallelism inside slices, slices serialized at the slice boundary
> **Critical Path**: T1 → S4-Kickoff → S4-Redesign → S4-Verify → S5-Kickoff → S5-Wave → S5-Verify → S6-Kickoff → S6-Wave → S6-Verify → S7-Kickoff → S7-Wave → S7-Verify → F1–F4 → User Okay

---

## Context

### Original Request
"Plan all remaining roadmap work in order and integrate onto roadmap." User confirmed scope = continue Stitch UI rollout (Slices 4–7) plus re-verify Slice 3, then run a Final Verification Wave. Roadmap §2–5 functional bullets are deferred because `docs/roadmap.md` shows them shipped; any gap surfaces inside slice work.

### Interview Summary
**Key Discussions**:
- One slice at a time across consumer/reviewer/admin, but tasks WITHIN a slice's sub-page wave run in parallel (reconciles "one slice rule" with Maximum Parallelism Principle).
- Verification on clean `next start --port 3010` after `pnpm build`, NOT stale `next dev :3008`.
- Each task starts by re-pulling the relevant Stitch screen JSON via `stitch_get_screen` to avoid drift.
- Brand stays `rumia.pt` despite Stitch project name "Rota".

**Confirmed Decisions** (post-Metis review):
- **1-A** Shared component extraction: proactive at each Kickoff to `packages/ui`.
- **2-A** Sub-page granularity: each sub-page = its own task, parallel within slice wave.
- **3-B** Stitch fidelity: spirit-of-design (composition + tokens), adapt to existing primitives.
- **4-C** Mobile scope: design mobile using Stitch tokens; 375px + 1440px Playwright QA per page.
- **5-A** User-okay gate: read `.sisyphus/evidence/FINAL_SUMMARY.md`, reply with literal `APPROVED` or `REJECTED: <reason>`.
- Slice 3 reverify bugfix: inline if <50 LOC isolated to `packages/routing/`; else Task 1.5.
- Roadmap edits: only in slice verification tasks, never sub-page tasks.
- Auth fixtures: Slice 6 Kickoff builds reviewer fixture, Slice 7 Kickoff extends to admin.

**Research Findings**:
- `packages/routing/src/index.ts` already has `clampMapCoordinate` (Slice 3 schema fix shipped — Task 1 is verification-only unless new bug found).
- `HIGH_TRAVEL_TIME_MINUTES = 75`; coords clamped to `0..100`.
- Hosted Supabase ref `tujrfgtfxphhqpujkeix` linked as `Rumia`.
- Slice 3 build-clean already; awaiting clean-runtime QA only.
- Inventory of imports/analytics/data calls for Slices 4/5/6/7 collected via parallel `explore` agents — referenced inline in each Kickoff task.

### Metis Review
**Identified Gaps** (addressed):
- Sub-page fan-out risk (12 sub-pages) → Granularity decision 2-A + per-slice Kickoff with shared primitives.
- Preserve-functionality drift → `LOCKED_FILES` + `PRESERVED_BEHAVIORS` per task; analytics grep pre/post.
- API contract drift → API route files added to `LOCKED_FILES` list per task.
- Hydration noise from stale `:3008` → standardized lock-cleanup preamble in every QA task.
- Playwright MCP lock recurrence → kill command in plan preamble + QA preflight.
- Stitch fidelity ambiguity → Decision 3-B + side-by-side screenshot comparison as evidence.
- Mobile undefined → Decision 4-C + 375px viewport scenario per page.
- "User okay" undefined → Decision 5-A + auto-generated `FINAL_SUMMARY.md` + literal token.
- Brand leak risk ("Rota" string) → MUST NOT clause on every task.
- Trip-card primitive coupling → extracted in Slice 4 Kickoff (decision 1-A).
- Archive layout coupling → extracted in Slice 5 Kickoff.
- Reviewer/admin auth fixtures → Slice 6/7 Kickoffs respectively.

---

## Work Objectives

### Core Objective
Complete the Stitch-driven UI rollout for the Rota / `rumia.pt` Portugal travel concierge app at `/Users/cheng/rota`, preserving every existing analytics, commerce, auth, and data-fetching behavior, and gate completion behind a verifiable evidence summary plus explicit user approval token.

### Concrete Deliverables
- `apps/web/app/(app)/trip/[tripId]/map/page.tsx` — re-verified on clean runtime (no code change unless bug found).
- `apps/web/app/(app)/trip/[tripId]/export/page.tsx` — redesigned to Stitch screen `aa02ed35f5e04ac6a84090981af31168`.
- `apps/web/app/(app)/account/page.tsx` — redesigned to Stitch archive layout.
- `apps/web/app/(marketing)/portugal/page.tsx` — redesigned to Stitch archive layout.
- `apps/web/app/(reviewer)/reviewer/{queue,trips/[tripId],history,profile,operations}/page.tsx` — 5 redesigns.
- `apps/web/app/(admin)/admin/{places,countries,regions,partners,reviewers,quality,analytics}/page.tsx` — 7 redesigns.
- `packages/ui/src/trip-card/*` (extracted in Slice 4 Kickoff).
- `packages/ui/src/archive-layout/*` (extracted in Slice 5 Kickoff).
- `apps/web/playwright/fixtures/reviewer-auth.ts` + `apps/web/playwright/fixtures/admin-auth.ts` — reviewer/admin QA storage-state scaffolds.
- `docs/roadmap.md` — Stitch implementation order section updated to reflect each completed slice.
- `.sisyphus/evidence/FINAL_SUMMARY.md` — auto-generated evidence index.
- 1440px + 375px Playwright screenshots per page in `.sisyphus/evidence/task-{N}-{slug}-{viewport}.png`.

### Definition of Done
- [ ] `pnpm build` passes from repo root with zero new errors/warnings.
- [ ] `pnpm typecheck` passes from repo root, and any touched package/app with a local `typecheck` script also passes via `pnpm --dir <path> typecheck`.
- [ ] `pnpm exec next start --port 3010` (from `apps/web`) boots cleanly; `/tmp/rumia-web-3010-start.log` shows no errors.
- [ ] All Playwright scenarios across all tasks execute green; evidence files exist at declared paths.
- [ ] F1–F4 review agents return APPROVE.
- [ ] User replies with literal token `APPROVED` against auto-generated `FINAL_SUMMARY.md`.

### Baseline Reference (MANDATORY)
- Before T1 starts, capture the plan baseline ref with:
  - `PLAN_START_REF=$(git merge-base main HEAD)` if `main` exists locally, else
  - `PLAN_START_REF=$(git rev-list --max-parents=0 HEAD | tail -n 1)` as fallback.
- Save it to `.sisyphus/evidence/plan-start-ref.txt` and reuse that exact value anywhere this plan says `<plan-start-ref>`.
- Also record each task commit SHA to `.sisyphus/evidence/task-{N}-commit.txt` immediately after that task’s commit so task-scoped `git show` checks are executable.

### Must Have
- Preserve every existing analytics call (`track*`, `analytics.*`, partner CTA tracking) — verified by pre/post grep diff = empty.
- Preserve every existing API contract — `/api/trips/[tripId]/export/*`, `/api/trips/[tripId]/unlock`, `/api/partner-clicks`, etc. — `LOCKED_FILES`.
- Preserve every server-side data call — `getTripDraftById`, `generateItineraryFromBrief`, `buildEmailPreview`, `listTripExportOptions`, `getTripCommerceState`, `buildTripSharePath`, account/portugal data sources, reviewer/admin queries.
- Preserve current route-access semantics for `(reviewer)` and `(admin)` route groups during this UI rollout — these pages currently have no route-level auth or middleware guard, so do not introduce one as part of the Stitch redesign tasks.
- Preserve commerce gating (locked vs unlocked vs free) UX paths on export page.
- Preserve `data-testid` selectors used by Playwright (or rename only after updating selectors).
- Stitch token alignment (typography, spacing, color, radius) per `packages/ui/src/styles.css`.
- Mobile (375px) + desktop (1440px) coverage per redesigned page.
- Roadmap status updates per slice in `docs/roadmap.md`.
- `rumia.pt` branding visible across all files touched by this plan, with no new or regressed "Rota" strings introduced in changed user-facing surfaces.

### Must NOT Have (Guardrails)
- No edits to API route handlers under `apps/web/app/api/**` (locked).
- No edits to Supabase migrations under `supabase/migrations/**` (locked unless explicitly noted).
- No edits to schemas in `packages/types/**` (locked unless preservation requires).
- No edits to routing logic in `packages/routing/**` (locked except Slice 3 inline-fix path).
- No removal of `track*` / `analytics.*` calls (analytics inventory diff must be empty).
- No introduction of `as any`, `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, `// TODO`, `// FIXME`, `console.log` in production code paths.
- No new or regressed "Rota" string in user-facing copy, alt text, page title, meta tags, or `aria-label` within files touched by this plan.
- No new chat-message/thread UI (working rule: structured cards only).
- No parallelization across consumer/reviewer/admin slice boundaries.
- No `roadmap.md` edits inside sub-page tasks (only in slice verification tasks).
- No `pnpm dev` server runs for verification (use `pnpm build` + `pnpm exec next start --port 3010`).
- No skipping of either viewport (1440 + 375) per redesigned page.
- No marketing landing redesigns (already done).

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** during F1–F4. Final user-okay gate is the ONLY human step, and it's a literal-token reply.

### Test Decision
- **Infrastructure exists**: Partial — `pnpm exec playwright` available in `apps/web`. No unit-test runner standardized.
- **Automated tests**: Playwright E2E only (no unit/TDD). Existing tests preserved.
- **Framework**: `@playwright/test` via `pnpm exec playwright test` from `apps/web`.
- **TDD**: NO. Tests-after acceptance via per-task Playwright scenarios with evidence capture.

### QA Policy
Every redesign task MUST include agent-executed Playwright scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}-{viewport}.{ext}`.

- **Frontend/UI**: `playwright_browser_*` MCP tools. Two viewports: 1440×900 (desktop), 375×812 (mobile, decision 4-C).
- **API/Backend** (preservation checks): `Bash` with `curl` against `:3010` runtime; assert status + JSON shape.
- **Analytics preservation**: Pre/post `grep -rn 'track\|analytics\.\|gtag' <scope>` saved to `.sisyphus/evidence/task-{N}-analytics-{pre|post}.txt`; diff must be empty.
- **Stitch fidelity**: Side-by-side comparison saved to `.sisyphus/evidence/task-{N}-stitch-compare.png` (left = Stitch ref via `stitch_get_screen` snapshot, right = live page screenshot).

### Standard QA Preamble (every QA task starts with this)
```bash
# Kill stale dev/start servers
lsof -ti:3008 | xargs kill -9 2>/dev/null || true
lsof -ti:3010 | xargs kill -9 2>/dev/null || true

# Kill stale Playwright MCP browser locks
pkill -f mcp-chrome-50c3faa 2>/dev/null || true
rm -rf /Users/cheng/Library/Caches/ms-playwright/mcp-chrome-50c3faa/SingletonLock 2>/dev/null || true

# Clean build + start
cd /Users/cheng/rota && pnpm build 2>&1 | tee /tmp/rumia-web-build.log
cd /Users/cheng/rota/apps/web && nohup pnpm exec next start --port 3010 > /tmp/rumia-web-3010-start.log 2>&1 &
sleep 6
curl -sf http://localhost:3010 > /dev/null && echo "OK: 3010 up" || (echo "FAIL: 3010 down"; tail -50 /tmp/rumia-web-3010-start.log; exit 1)
```

---

## Execution Strategy

### Parallel Execution Waves

> Slices serialized at slice boundaries; sub-page tasks parallelized inside each slice's sub-page wave.

```
Wave 1:  T1 — Slice 3 reverify on clean :3010                          [1 task]
Wave 2:  T2 — Slice 4 Kickoff (snapshot Stitch + extract trip-card)    [1 task]
Wave 3:  T3 — Slice 4 Redesign /trip/[tripId]/export                   [1 task]
Wave 4:  T4 — Slice 4 Verification + roadmap.md update                 [1 task, gates Slice 5]
Wave 5:  T5 — Slice 5 Kickoff (snapshot + extract archive-layout)      [1 task]
Wave 6:  T6, T7 — Slice 5 Sub-page Wave (parallel)                     [2 tasks PARALLEL]
           T6 /account
           T7 /portugal
Wave 7:  T8 — Slice 5 Verification + roadmap.md update                 [1 task, gates Slice 6]
Wave 8:  T9 — Slice 6 Kickoff (snapshot + reviewer auth fixture)       [1 task]
Wave 9:  T10–T14 — Slice 6 Sub-page Wave (parallel)                    [5 tasks PARALLEL]
           T10 /reviewer/queue
           T11 /reviewer/trips/[tripId]
           T12 /reviewer/history
           T13 /reviewer/profile
           T14 /reviewer/operations
Wave 10: T15 — Slice 6 Verification + roadmap.md update                [1 task, gates Slice 7]
Wave 11: T16 — Slice 7 Kickoff (snapshot + admin auth fixture)         [1 task]
Wave 12: T17–T23 — Slice 7 Sub-page Wave (parallel)                    [7 tasks PARALLEL]
           T17 /admin/places
           T18 /admin/countries
           T19 /admin/regions
           T20 /admin/partners
           T21 /admin/reviewers
           T22 /admin/quality
           T23 /admin/analytics
Wave 13: T24 — Slice 7 Verification + roadmap.md update                [1 task]
Wave 14: F1–F4 — Final Verification Wave (parallel)                    [4 tasks PARALLEL]
           F1 oracle plan compliance
           F2 unspecified-high code quality
           F3 unspecified-high real QA
           F4 deep scope fidelity
Wave 15: U1 — User Okay Gate (literal APPROVED token)                  [1 task, manual]
```

**Critical Path**: T1 → T2 → T3 → T4 → T5 → T6/T7 → T8 → T9 → T10–T14 → T15 → T16 → T17–T23 → T24 → F1–F4 → U1
**Max Concurrent**: 7 (Wave 12 admin sub-page wave)
**Parallel Speedup vs full-sequential**: ~50% (parallelism inside slices only; slices remain serialized)

### Dependency Matrix

- **T1**: depends on — `(none, can start immediately)` — blocks T2.
- **T2 (S4 Kickoff)**: depends on T1 — blocks T3.
- **T3 (S4 Redesign)**: depends on T2 — blocks T4.
- **T4 (S4 Verify)**: depends on T3 — blocks T5.
- **T5 (S5 Kickoff)**: depends on T4 — blocks T6, T7.
- **T6 (/account)**: depends on T5 — blocks T8. Parallel with T7.
- **T7 (/portugal)**: depends on T5 — blocks T8. Parallel with T6.
- **T8 (S5 Verify)**: depends on T6 + T7 — blocks T9.
- **T9 (S6 Kickoff)**: depends on T8 — blocks T10–T14.
- **T10–T14 (reviewer sub-pages)**: depends on T9 — blocks T15. Parallel with each other.
- **T15 (S6 Verify)**: depends on T10–T14 — blocks T16.
- **T16 (S7 Kickoff)**: depends on T15 — blocks T17–T23.
- **T17–T23 (admin sub-pages)**: depends on T16 — blocks T24. Parallel with each other.
- **T24 (S7 Verify)**: depends on T17–T23 — blocks F1–F4.
- **F1–F4**: depends on T24 — blocks U1. Parallel with each other.
- **U1**: depends on F1–F4. Terminal.

### Agent Dispatch Summary

- **Wave 1**: T1 → `unspecified-high` + `playwright` skill (verification only)
- **Wave 2**: T2 → `Sisyphus-Junior` (visual-engineering) + `frontend-ui-ux` skill
- **Wave 3**: T3 → `Sisyphus-Junior` (visual-engineering) + `frontend-ui-ux` skill
- **Wave 4**: T4 → `unspecified-high` + `playwright` skill
- **Wave 5**: T5 → `Sisyphus-Junior` (visual-engineering) + `frontend-ui-ux` skill
- **Wave 6**: T6, T7 → `Sisyphus-Junior` (visual-engineering) + `frontend-ui-ux` skill
- **Wave 7**: T8 → `unspecified-high` + `playwright` skill
- **Wave 8**: T9 → `Sisyphus-Junior` (visual-engineering) + `frontend-ui-ux` skill
- **Wave 9**: T10–T14 → `Sisyphus-Junior` (visual-engineering) + `frontend-ui-ux` skill
- **Wave 10**: T15 → `unspecified-high` + `playwright` skill
- **Wave 11**: T16 → `Sisyphus-Junior` (visual-engineering) + `frontend-ui-ux` skill
- **Wave 12**: T17–T23 → `Sisyphus-Junior` (visual-engineering) + `frontend-ui-ux` skill
- **Wave 13**: T24 → `unspecified-high` + `playwright` skill
- **Wave 14**: F1 → `oracle`; F2 → `unspecified-high`; F3 → `unspecified-high` + `playwright`; F4 → `deep`
- **Wave 15**: U1 → user (manual literal token)

---

## TODOs

- [ ] 1. Slice 3 Reverify on Clean :3010 Runtime

  **What to do**:
  - Run the Standard QA Preamble to kill stale `:3008` / `:3010` and stale Playwright MCP locks.
  - From `/Users/cheng/rota` run `pnpm exec tsc --noEmit` and `pnpm build`; confirm both clean.
  - From `/Users/cheng/rota/apps/web` run `pnpm exec next start --port 3010` (nohup → `/tmp/rumia-web-3010-start.log`).
  - Open Playwright at viewport 1440×900, navigate to `/trip/3/map`. Verify: page renders, day-tabs switch (D1→D2→D3), no schema errors in `/tmp/rumia-web-3010-start.log` (especially zero matches for `RouteStopPointSchema` / `too_big`), partner CTA in any visible itinerary card fires `track*` and persists via `POST /api/partner-clicks`.
  - Capture viewport screenshots for D1 + D2 in both 1440×900 and 375×812 viewports.
  - Capture analytics inventory: `cd /Users/cheng/rota && grep -rn 'track\|analytics\.\|gtag' apps/web/app/\(app\)/trip/\[tripId\]/map > .sisyphus/evidence/task-1-analytics-pre.txt`.
  - **If verification fails AND root cause is <50 LOC isolated to `packages/routing/`**: apply inline fix, re-run pre/post analytics check (must diff empty), re-run all scenarios.
  - **If verification fails AND fix is larger or outside `packages/routing/`**: STOP, escalate as Task 1.5 — do not proceed.

  **Must NOT do**:
  - Do not edit `apps/web/app/(app)/trip/[tripId]/map/page.tsx` (verification only unless inline-fix path triggered).
  - Do not edit `packages/routing/` beyond the <50 LOC isolated bugfix path.
  - Do not edit any API route handler.
  - Do not run `pnpm dev`. Use `pnpm exec next start --port 3010` only.
  - Do not introduce or remove any `track*` / `analytics.*` call.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Verification + conditional <50 LOC bugfix; needs disciplined preserve-functionality + Playwright execution, not visual redesign.
  - **Skills**: [`playwright`]
    - `playwright`: Mandatory for browser MCP scenario execution and evidence screenshots.
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No redesign here.
    - `supabase`: No DB schema work.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (sole task)
  - **Blocks**: T2 (Slice 4 Kickoff)
  - **Blocked By**: None — can start immediately.

  **References**:

  **Pattern References** (existing code to follow):
  - `/Users/cheng/rota/apps/web/app/(app)/trip/[tripId]/map/page.tsx` — current map page, verify behavior unchanged.
  - `/Users/cheng/rota/packages/routing/src/index.ts` — `clampMapCoordinate`, `HIGH_TRAVEL_TIME_MINUTES = 75`, coord clamp `0..100` (already shipped).
  - `/Users/cheng/rota/packages/types/src/routing.ts` — `RouteStopPointSchema` constraints.

  **Test References**:
  - No repo-local Playwright project exists today; use the browser-QA conventions in this plan plus Playwright MCP for runtime verification.

  **External References**: None (verification-only task).

  **WHY Each Reference Matters**:
  - `map/page.tsx`: confirms current shape so any inline fix preserves analytics, partner CTA, and day-tab behavior.
  - `packages/routing/src/index.ts` + `routing.ts` schema: the Slice 3 fix already lives here; this task validates that fix on a clean runtime.
  - `playwright/`: gives the executor the existing Playwright invocation pattern so they don't reinvent fixtures.

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` from `/Users/cheng/rota` exits 0.
  - [ ] `pnpm build` from `/Users/cheng/rota` exits 0 with "Compiled successfully".
  - [ ] `/tmp/rumia-web-3010-start.log` contains zero matches for `RouteStopPointSchema` and zero matches for `too_big`.
  - [ ] `curl -sf http://localhost:3010/trip/3/map` exits 0.
  - [ ] `.sisyphus/evidence/task-1-analytics-pre.txt` and `task-1-analytics-post.txt` diff is empty.

  **QA Scenarios** (MANDATORY):

  ```
  Scenario: Map page renders with day-switch links on desktop
    Tool: Playwright (playwright_browser_*)
    Preconditions: :3010 up, /tmp/rumia-web-3010-start.log shows zero error/warn lines, Playwright at 1440×900.
    Steps:
      1. browser_navigate("http://localhost:3010/trip/3/map") — wait for network idle.
      2. browser_snapshot — assert at least one link exists with href containing `/trip/3/map?day=1` and visible text matching /Day\s*1/.
      3. browser_evaluate("() => Array.from(document.querySelectorAll('a[href*=\"/trip/3/map?day=\"]')).map(a => a.textContent?.trim())") — assert array length ≥ 2.
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-1-map-desktop-d1-1440.png", fullPage=true).
    Expected Result: Page loads HTTP 200; ≥2 day-switch links present; D1 link visible; screenshot saved.
    Failure Indicators: HTTP non-200, zero day links found, "RouteStopPointSchema" appearing in console, screenshot missing.
    Evidence: .sisyphus/evidence/task-1-map-desktop-d1-1440.png

  Scenario: Day-link switching D1→D2 preserves state
    Tool: Playwright
    Preconditions: Continuation from previous scenario.
    Steps:
      1. Click the link whose visible text matches /Day\s*2/.
      2. browser_wait_for(text="Day 2", time=3).
      3. browser_evaluate("() => location.search") — assert string contains `day=2`.
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-1-map-desktop-d2-1440.png", fullPage=true).
    Expected Result: URL updates to `?day=2`; screenshot reflects D2 content.
    Failure Indicators: URL stays on day=1, navigation error, console errors during transition.
    Evidence: .sisyphus/evidence/task-1-map-desktop-d2-1440.png

  Scenario: Map page renders on mobile viewport
    Tool: Playwright
    Preconditions: browser_resize(375, 812).
    Steps:
      1. browser_navigate("http://localhost:3010/trip/3/map").
      2. browser_snapshot — assert no horizontal-scroll overflow (computed scrollWidth ≤ clientWidth + 1px).
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-1-map-mobile-d1-375.png", fullPage=true).
    Expected Result: Page renders without horizontal overflow; screenshot saved at 375px width.
    Failure Indicators: Horizontal scrollbar present, layout broken, content cut off.
    Evidence: .sisyphus/evidence/task-1-map-mobile-d1-375.png

  Scenario: Partner CTA uses GET redirect + persists click
    Tool: Playwright + Bash (curl)
    Preconditions: Desktop viewport, /trip/3/map open, at least one partner CTA visible.
    Steps:
      1. browser_evaluate("() => Array.from(document.querySelectorAll('a[href*=\"/api/partner-clicks?\"]')).map(a => a.getAttribute('href'))") — assert array length ≥ 1 and save the first href.
      2. From shell, request that captured href against `http://localhost:3010` and assert response status is `307` with a `Location` header pointing to an absolute partner URL.
      3. Click the first partner CTA in the browser and assert navigation begins toward the redirected target or opens the redirect endpoint without client error.
    Expected Result: CTA href points to `/api/partner-clicks?...`; endpoint returns 307 redirect; browser click does not error.
    Failure Indicators: Missing CTA href, 4xx/5xx on fully-parameterized GET, missing redirect location.
    Evidence: .sisyphus/evidence/task-1-partner-cta-redirect.txt

  Scenario: Schema-error regression check (failure scenario, must NOT trigger)
    Tool: Bash
    Preconditions: All prior scenarios completed; /tmp/rumia-web-3010-start.log accumulated logs.
    Steps:
      1. `grep -E 'RouteStopPointSchema|too_big|ZodError' /tmp/rumia-web-3010-start.log` — expect exit 1 (no matches).
      2. Save full log: `cp /tmp/rumia-web-3010-start.log .sisyphus/evidence/task-1-runtime-log.txt`.
    Expected Result: grep exits 1 (no matches). If matches found → escalate per inline-fix or Task 1.5 rule.
    Failure Indicators: Any match for the listed patterns.
    Evidence: .sisyphus/evidence/task-1-runtime-log.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-1-map-desktop-d1-1440.png`
  - [ ] `.sisyphus/evidence/task-1-map-desktop-d2-1440.png`
  - [ ] `.sisyphus/evidence/task-1-map-mobile-d1-375.png`
  - [ ] `.sisyphus/evidence/task-1-partner-cta-redirect.txt`
  - [ ] `.sisyphus/evidence/task-1-runtime-log.txt`
  - [ ] `.sisyphus/evidence/task-1-analytics-pre.txt` + `task-1-analytics-post.txt` (diff empty)

  **Commit**: YES (only if inline-fix triggered)
  - Message: `fix(routing): <bug summary>` (only if fix applied; otherwise no commit — verification-only)
  - Files: `packages/routing/src/<file>` (only on fix path)
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 2. Slice 4 Kickoff — Stitch Pull + Trip-Card Primitive Extraction

  **What to do**:
  - Re-pull live Stitch screen JSON via `stitch_get_screen("aa02ed35f5e04ac6a84090981af31168")` and save to `.sisyphus/evidence/task-2-stitch-export-screen.json`. Capture composition: header, two-column grid (export options left / share + access right), included-in-PDF tile list.
  - Audit Slice 2 (`/trip/[tripId]/page.tsx`) and Slice 4 export page for repeated card composition (icon + title + caption + CTA) — confirm overlap, decide on extraction shape.
  - Extract a `TripCard` (or similar) primitive into `packages/ui/src/components/trip-card.tsx` exposing the minimum API both slices need:
    - props: `{ icon?: ReactNode; title: string; caption?: string; meta?: ReactNode; href?: string; cta?: ReactNode; tone?: "default"|"highlight"; testid?: string }`.
    - re-uses existing `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Button`, `Badge` primitives — does NOT replace them.
  - Add export to `packages/ui/src/index.ts`. Run `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build` — must stay clean.
  - **Do not yet wire** Slice 2 or Slice 4 page to use `TripCard`. That happens in T3 (and any Slice 2 retrofit is OUT OF SCOPE here — Slice 2 is shipped).

  **Must NOT do**:
  - Do not edit Slice 2 page. Existing trip overview is shipped.
  - Do not edit any API route handler.
  - Do not modify `packages/db`, `packages/ai`, `packages/emails`, `packages/types`, `packages/routing`.
  - Do not introduce a new state-management library (no Zustand/Jotai/Redux); use props + existing patterns.
  - Do not introduce client-only deps that would force `"use client"` on the export page (it's a server component — preserve that).
  - Do not place "Rota" anywhere — primitive must be brand-agnostic.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
    - Reason: UI primitive extraction with strict preserve-functionality constraint; visual-engineering category fits.
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Composition + token alignment with existing `packages/ui/src/styles.css`.
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed — no QA scenario here, T3 covers it.
    - `supabase`: No DB work.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sole task)
  - **Blocks**: T3
  - **Blocked By**: T1

  **References**:

  **Pattern References**:
  - `/Users/cheng/rota/packages/ui/src/components/card.tsx:4-40` — `Card`, `CardHeader`, `CardTitle`, `CardContent` — wrap, do not replace.
  - `/Users/cheng/rota/packages/ui/src/components/button.tsx:28-50` — `Button` API to compose CTA prop around.
  - `/Users/cheng/rota/packages/ui/src/components/badge.tsx:4-21` — `Badge` API for `meta` slot.
  - `/Users/cheng/rota/packages/ui/src/components/shell.tsx:4-63` — `PageShell` + `SectionHeading` show variant pattern (`variant="app"`).
  - `/Users/cheng/rota/packages/ui/src/styles.css` — Stitch tokens (typography, spacing, color, radius). Compose only with these.

  **API/Type References**:
  - `/Users/cheng/rota/apps/web/lib/trip-export.ts:283-305` — `ExportOption` shape (label, description, href, format) — primitive `TripCard` must be expressive enough to render this without lossy mapping.

  **External References**:
  - Stitch screen `projects/10857043349147902133/screens/aa02ed35f5e04ac6a84090981af31168` — composition reference for card grid + meta chips.

  **WHY Each Reference Matters**:
  - Existing UI primitives = composition target; `TripCard` wraps them so style stays consistent.
  - `ExportOption` = the most demanding consumer (icon + label + description + href format chip); designing the API to fit this consumer ensures Slice 4 redesign in T3 is a clean drop-in.
  - Stitch screen = visual + composition reference; spirit-of-design fidelity (decision 3-B).

  **Acceptance Criteria**:
  - [ ] `packages/ui/src/components/trip-card.tsx` exists, exports `TripCard`.
  - [ ] `packages/ui/src/index.ts` exports `TripCard` (and any sub-types).
  - [ ] `cd /Users/cheng/rota && pnpm exec tsc --noEmit` exits 0.
  - [ ] `cd /Users/cheng/rota && pnpm build` exits 0.
  - [ ] `grep -rn 'Rota' packages/ui/src --include='*.tsx' --include='*.ts'` returns zero matches.
  - [ ] No new dependency added to `packages/ui/package.json`.

  **QA Scenarios** (MANDATORY):

  ```
  Scenario: Primitive type-checks and exports correctly
    Tool: Bash
    Preconditions: Branch checked out at T2 commit.
    Steps:
      1. cd /Users/cheng/rota && pnpm exec tsc --noEmit (workdir).
      2. cd /Users/cheng/rota && pnpm build (workdir).
      3. grep -n 'TripCard' /Users/cheng/rota/packages/ui/src/index.ts > .sisyphus/evidence/task-2-export-check.txt.
      4. Assert `.sisyphus/evidence/task-2-export-check.txt` is non-empty.
    Expected Result: Both commands exit 0; TripCard export is declared from the real source entrypoint.
    Failure Indicators: Non-zero exit, missing export, type errors.
    Evidence: .sisyphus/evidence/task-2-tsc-build.txt (capture stdout+stderr of both commands).

  Scenario: TripCard renders in isolation (smoke render)
    Tool: Bash (next dev sanity is forbidden; use a node-side import smoke test instead)
    Preconditions: Build artifact present.
    Steps:
      1. Read `/Users/cheng/rota/packages/ui/src/components/trip-card.tsx` and confirm the exported component accepts `title` and renders it in the JSX tree.
      2. Save a short verification note to `.sisyphus/evidence/task-2-render-smoke.html` quoting the relevant source lines.
      3. Assert the note includes the `title` prop name and render location.
    Expected Result: Source-level verification note shows the component renders the title prop.
    Failure Indicators: Missing `title` prop, no JSX render path, or evidence note missing.
    Evidence: .sisyphus/evidence/task-2-render-smoke.html

  Scenario: Brand-leak guard (failure scenario, must NOT trigger)
    Tool: Bash
    Steps:
      1. cd /Users/cheng/rota && grep -rn 'Rota' packages/ui/src --include='*.tsx' --include='*.ts' | grep -vE '^\s*(//|\*)' > .sisyphus/evidence/task-2-brand-leak.txt
      2. Assert file is empty (`test ! -s .sisyphus/evidence/task-2-brand-leak.txt`).
    Expected Result: Empty file. (Comments allowed; user-facing strings forbidden.)
    Failure Indicators: Non-empty file → fix before completing task.
    Evidence: .sisyphus/evidence/task-2-brand-leak.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-2-stitch-export-screen.json`
  - [ ] `.sisyphus/evidence/task-2-tsc-build.txt`
  - [ ] `.sisyphus/evidence/task-2-render-smoke.html`
  - [ ] `.sisyphus/evidence/task-2-brand-leak.txt` (empty)

  **Commit**: YES
  - Message: `refactor(ui): extract TripCard primitive for export + future reuse`
  - Files: `packages/ui/src/components/trip-card.tsx`, `packages/ui/src/index.ts`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 3. Slice 4 Redesign — `/trip/[tripId]/export`

  **What to do**:
  - Re-pull `stitch_get_screen("aa02ed35f5e04ac6a84090981af31168")`; save to `.sisyphus/evidence/task-3-stitch-export-screen.json`.
  - Redesign `/Users/cheng/rota/apps/web/app/(app)/trip/[tripId]/export/page.tsx` against the Stitch composition AND with mobile (375px) responsive design (decision 4-C):
    - Header via `SectionHeading` (eyebrow + title + description) — preserved.
    - Two-column grid (xl:`grid-cols-[1.4fr_1fr]` or similar — match Stitch proportions) collapsing to single column at <1024px.
    - Left column: Export Options card → render via `TripCard` primitive from T2; one tile per `listTripExportOptions(tripId)` result. Anchor `<a href={option.href}>` — preserve href, do NOT introduce client-side routing.
    - Right column: Share + Delivery card (`buildTripSharePath`, `buildEmailPreview`), Access card (commerce badges + canExport gate text + Back / Open route map links), Included-in-PDF tile list.
    - Print view branch (`view === "print"`) preserved with same data shape; visual restyle allowed but information identical.
    - `infoMessage` info card preserved when persistence config error or generation error.
    - Mobile (375px): single column, badges wrap, CTAs full-width, comfortable tap targets ≥44px.
  - Add `data-testid` selectors for QA stability:
    - `data-testid="export-options"` on left card.
    - `data-testid="export-option-{format}"` on each option (format ∈ pdf|calendar|markdown|print).
    - `data-testid="share-card"`, `data-testid="access-card"`, `data-testid="included-list"`.
    - `data-testid="info-message"` on conditional info card.
  - Capture analytics inventory pre/post:
    - `cd /Users/cheng/rota && grep -rn 'track\|analytics\.\|gtag' apps/web/app/\(app\)/trip/\[tripId\]/export/ > .sisyphus/evidence/task-3-analytics-pre.txt` BEFORE editing.
    - Same after editing → `task-3-analytics-post.txt`.
    - Per export-page inventory there are NO analytics calls today; post must remain empty.
  - Run `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`.

  **Must NOT do**:
  - Do not change the file's server-component nature (no `"use client"`).
  - Do not edit `apps/web/app/api/trips/[tripId]/export/route.ts`, `unlock/route.ts`, `review/route.ts` (LOCKED_FILES).
  - Do not modify `apps/web/lib/trip-export.ts`, `apps/web/lib/trip-commerce.ts`, `packages/ai/src/index.ts`, `packages/db/src/index.ts`, `packages/emails/src/index.ts` (LOCKED_FILES).
  - Do not change href targets of any export option — they map 1:1 to API contracts.
  - Do not remove the `view === "print"` branch or change its data shape.
  - Do not remove `infoMessage` handling or `isPersistenceConfigError` classification.
  - Do not remove the commerce gate (`tripCommerceState.canExport`) or its conditional copy.
  - Do not introduce any "Rota" string in user-facing copy.
  - Do not introduce `as any`, `@ts-ignore`, `@ts-expect-error`, `console.log`, `// TODO`, `// FIXME`.
  - Do not edit Slice 2 trip overview page.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
    - Reason: Pure UI redesign with strict preserve-functionality constraint.
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: Stitch fidelity + responsive design + token alignment.
    - `playwright`: QA scenarios are part of this task.
  - **Skills Evaluated but Omitted**:
    - `supabase`: No DB work.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sole task)
  - **Blocks**: T4
  - **Blocked By**: T2

  **References**:

  **Pattern References**:
  - `/Users/cheng/rota/apps/web/app/(app)/trip/[tripId]/export/page.tsx:1-180` — current page; preserve every behavior.
  - `/Users/cheng/rota/apps/web/app/(app)/trip/[tripId]/page.tsx` — Slice 2 (shipped) reference for token + composition consistency.
  - `/Users/cheng/rota/packages/ui/src/components/trip-card.tsx` — primitive extracted in T2 (use here).
  - `/Users/cheng/rota/packages/ui/src/components/shell.tsx:4-63` — `PageShell variant="app"`, `SectionHeading`.
  - `/Users/cheng/rota/packages/ui/src/styles.css` — Stitch tokens.

  **API/Type References** (LOCKED — read-only):
  - `/Users/cheng/rota/apps/web/app/api/trips/[tripId]/export/route.ts:12-76` — GET handler; href contract `?format=pdf|calendar|markdown` and `?view=print`.
  - `/Users/cheng/rota/apps/web/lib/trip-export.ts:283-305` — `listTripExportOptions(tripId)` returns ExportOption[]; preserve render of every option.
  - `/Users/cheng/rota/apps/web/lib/trip-export.ts:279-281` — `buildTripSharePath`.
  - `/Users/cheng/rota/apps/web/lib/trip-commerce.ts:19-89` — `getTripCommerceState`; preserve all 3 badge labels + canExport gating.
  - `/Users/cheng/rota/packages/emails/src/index.ts:10-43` — `buildEmailPreview(kind, tripTitle)`; preserve subject + preview rendering.
  - `/Users/cheng/rota/packages/db/src/index.ts:127-129` — `isPersistenceConfigError` classifier; preserve error→infoMessage mapping.
  - `/Users/cheng/rota/packages/db/src/index.ts:186-204` — `getTripDraftById`; server-only, preserve call.
  - `/Users/cheng/rota/packages/ai/src/index.ts:146-148` — `generateItineraryFromBrief`; preserve call.

  **External References**:
  - Stitch screen `projects/10857043349147902133/screens/aa02ed35f5e04ac6a84090981af31168`.

  **WHY Each Reference Matters**:
  - Page file: source of truth for current behavior; redesign is structural-only.
  - LOCKED API/lib files: contract boundary; touching breaks the build, gating, or commerce flow.
  - Stitch screen: composition + token reference per decision 3-B (spirit, not pixel).

  **PRESERVED_BEHAVIORS** (acceptance gate):
  - [ ] Print view (`view=print`) renders same days+stops shape; back-to-export and back-to-trip links functional.
  - [ ] Each export option's anchor href unchanged from `listTripExportOptions(tripId)` output.
  - [ ] Commerce badges (accessLabel, exportLabel, reviewLabel) all rendered.
  - [ ] `canExport` true/false branch text both reachable and correct.
  - [ ] `infoMessage` card renders when persistence error path triggered.
  - [ ] Back-to-trip and Open-route-map links present.
  - [ ] Page remains a server component (no `"use client"` directive).

  **LOCKED_FILES** (must not appear in this task's diff):
  - `apps/web/app/api/trips/[tripId]/export/route.ts`
  - `apps/web/app/api/trips/[tripId]/unlock/route.ts`
  - `apps/web/app/api/trips/[tripId]/review/route.ts`
  - `apps/web/lib/trip-export.ts`
  - `apps/web/lib/trip-commerce.ts`
  - `packages/ai/src/**`
  - `packages/db/src/**`
  - `packages/emails/src/**`
  - `packages/types/src/**`
  - `packages/routing/src/**`
  - `apps/web/app/(app)/trip/[tripId]/page.tsx` (Slice 2 — shipped)

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] `diff .sisyphus/evidence/task-3-analytics-pre.txt .sisyphus/evidence/task-3-analytics-post.txt` is empty.
  - [ ] `git show --name-only --format='' <task-3-commit>` contains exactly `apps/web/app/(app)/trip/[tripId]/export/page.tsx` (no LOCKED_FILES).
  - [ ] Brand-leak grep returns zero matches.
  - [ ] All QA scenarios below PASS.

  **QA Scenarios** (MANDATORY):

  ```
  Scenario: Export page renders all 4 options on desktop
    Tool: Playwright
    Preconditions: Standard QA Preamble done; :3010 up; viewport 1440×900.
    Steps:
      1. browser_navigate("http://localhost:3010/trip/3/export"). Wait for network idle.
      2. browser_evaluate("() => Array.from(document.querySelectorAll('[data-testid^=\"export-option-\"]')).map(e => e.getAttribute('data-testid'))") — assert array length = 4 with values containing pdf, calendar, markdown, print.
      3. browser_evaluate("() => Array.from(document.querySelectorAll('[data-testid^=\"export-option-\"] a')).map(a => a.getAttribute('href'))") — assert each href matches /^\/api\/trips\/3\/export\?format=(pdf|calendar|markdown)$|^\/trip\/3\/export\?view=print$/.
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-3-export-desktop-1440.png", fullPage=true).
    Expected Result: 4 options present; hrefs unchanged from baseline; screenshot saved.
    Failure Indicators: Fewer than 4 options, modified href, missing testid.
    Evidence: .sisyphus/evidence/task-3-export-desktop-1440.png

  Scenario: Export page renders on mobile (375px)
    Tool: Playwright
    Preconditions: browser_resize(375, 812).
    Steps:
      1. browser_navigate("http://localhost:3010/trip/3/export").
      2. browser_evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1") — assert true.
      3. browser_evaluate("() => Array.from(document.querySelectorAll('[data-testid=\"export-options\"] a')).every(a => a.getBoundingClientRect().height >= 40)") — assert true (tap target sanity).
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-3-export-mobile-375.png", fullPage=true).
    Expected Result: No horizontal overflow; CTAs ≥40px tall; screenshot saved.
    Failure Indicators: Horizontal scroll, CTAs <40px, content cut off.
    Evidence: .sisyphus/evidence/task-3-export-mobile-375.png

  Scenario: Print-view branch preserved
    Tool: Playwright
    Preconditions: Desktop viewport.
    Steps:
      1. browser_navigate("http://localhost:3010/trip/3/export?view=print").
      2. browser_evaluate("() => !!document.querySelector('[data-testid=\"print-view\"]') || document.body.textContent.includes('Print')") — assert true.
      3. browser_evaluate("() => Array.from(document.querySelectorAll('a')).map(a => a.getAttribute('href')).filter(h => h && (h.endsWith('/trip/3') || h.endsWith('/trip/3/export'))).length") — assert ≥ 2 (back-to-trip + back-to-export-options links present).
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-3-export-print-1440.png", fullPage=true).
    Expected Result: Print view renders with both back links.
    Failure Indicators: Missing back links, layout broken, content missing.
    Evidence: .sisyphus/evidence/task-3-export-print-1440.png

  Scenario: Commerce gate (canExport=false branch text)
    Tool: Playwright
    Preconditions: Desktop viewport, locked trip (use trip with status=draft if available; otherwise use tripId=3 and assume current state).
    Steps:
      1. browser_navigate("http://localhost:3010/trip/3/export").
      2. browser_evaluate("() => document.querySelector('[data-testid=\"access-card\"]')?.textContent || ''") — capture access card text.
      3. Verify text contains either an "unlocked" affirmation OR an unlock-instruction snippet (one of two known canExport branches).
      4. Save text to .sisyphus/evidence/task-3-access-card-text.txt.
    Expected Result: Access card text matches one of the two canExport branches.
    Failure Indicators: Empty text, neither branch matched, missing testid.
    Evidence: .sisyphus/evidence/task-3-access-card-text.txt

  Scenario: Export GET API contract still works (failure-mode regression check)
    Tool: Bash (curl)
    Steps:
      1. curl -s -o /tmp/export-md.txt -w "%{http_code}" "http://localhost:3010/api/trips/3/export?format=markdown" > .sisyphus/evidence/task-3-api-markdown-status.txt
      2. Assert status code matches one of: 200, 403 (locked), 404 (not found) — any 5xx is failure.
      3. curl -s -o /tmp/export-cal.txt -w "%{http_code}" "http://localhost:3010/api/trips/3/export?format=calendar" >> .sisyphus/evidence/task-3-api-markdown-status.txt
      4. Same assertion.
    Expected Result: API responds 2xx/4xx (semantic), never 5xx.
    Failure Indicators: 500/502/503 — indicates redesign broke server-side data flow.
    Evidence: .sisyphus/evidence/task-3-api-markdown-status.txt

  Scenario: Brand-leak + slop guard (failure scenario, must NOT trigger)
    Tool: Bash
    Steps:
      1. cd /Users/cheng/rota && grep -n 'Rota\|as any\|@ts-ignore\|console\.log\|// TODO\|// FIXME' apps/web/app/\(app\)/trip/\[tripId\]/export/page.tsx > .sisyphus/evidence/task-3-slop-guard.txt
      2. Filter out comment lines (those starting with // or *).
      3. Assert remaining lines = 0.
    Expected Result: Zero non-comment matches.
    Failure Indicators: Any non-comment match → fix before commit.
    Evidence: .sisyphus/evidence/task-3-slop-guard.txt

  Scenario: Stitch fidelity side-by-side
    Tool: Playwright + Bash
    Steps:
      1. From Stitch screen JSON, generate static reference render via stitch_get_screen → save the screen's rendered preview URL/image to .sisyphus/evidence/task-3-stitch-ref.png (use stitch_get_screen response thumbnail or rendered HTML).
      2. browser_take_screenshot of /trip/3/export at 1440×900 → already captured as task-3-export-desktop-1440.png.
      3. Save side-by-side composition note to .sisyphus/evidence/task-3-stitch-compare.md describing matched composition: header, 2-col grid, options card, share card, access card, included list.
    Expected Result: Composition matches Stitch (spirit-of-design per decision 3-B).
    Failure Indicators: Note documents major composition divergence (e.g., wrong layout direction, missing region).
    Evidence: .sisyphus/evidence/task-3-stitch-compare.md
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-3-stitch-export-screen.json`
  - [ ] `.sisyphus/evidence/task-3-analytics-pre.txt` + `task-3-analytics-post.txt` (diff empty)
  - [ ] `.sisyphus/evidence/task-3-export-desktop-1440.png`
  - [ ] `.sisyphus/evidence/task-3-export-mobile-375.png`
  - [ ] `.sisyphus/evidence/task-3-export-print-1440.png`
  - [ ] `.sisyphus/evidence/task-3-access-card-text.txt`
  - [ ] `.sisyphus/evidence/task-3-api-markdown-status.txt`
  - [ ] `.sisyphus/evidence/task-3-slop-guard.txt` (empty after comment filter)
  - [ ] `.sisyphus/evidence/task-3-stitch-compare.md`

  **Commit**: YES
  - Message: `feat(export): redesign /trip/[tripId]/export to Stitch screen aa02ed35`
  - Files: `apps/web/app/(app)/trip/[tripId]/export/page.tsx` only (verified by `git diff --name-only`).
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 4. Slice 4 Verification + Roadmap Status Update

  **What to do**:
  - Run Standard QA Preamble.
  - Re-execute every QA scenario from T3 (regression sweep).
  - Run cross-link integration:
    - From `/trip/3` (Slice 2 overview) — find and click any link to `/trip/3/export`. Assert navigation succeeds.
    - From `/trip/3/export` — click "Open route map" — assert lands on `/trip/3/map` (Slice 3).
    - Back-to-trip navigation works.
  - Update `docs/roadmap.md` Stitch implementation order section: mark Slice 4 export complete with date + commit refs.
  - Single slice-completion commit including the roadmap edit.

  **Must NOT do**:
  - Do not edit `apps/web/app/(app)/trip/[tripId]/export/page.tsx` (T3 owns it).
  - Do not edit `packages/ui/src/components/trip-card.tsx` (T2 owns it).
  - Do not edit any LOCKED_FILES from T3.
  - Do not edit any roadmap section other than the Stitch implementation order block.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Cross-cutting verification + small docs edit; needs Playwright + disciplined preserve-functionality.
  - **Skills**: [`playwright`]
    - `playwright`: Re-run scenarios + integration nav.
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No redesign here.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (sole task)
  - **Blocks**: T5
  - **Blocked By**: T3

  **References**:

  **Pattern References**:
  - `/Users/cheng/rota/docs/roadmap.md` — Stitch implementation order section (find heading, append slice-complete bullet inline).
  - Slice 1, 2, 3 completion edits in roadmap git history (`git log --oneline docs/roadmap.md | head -20`) — match the existing format/style.

  **WHY Each Reference Matters**:
  - Roadmap consistency: roadmap edit format must match prior slice completions; reviewers look for consistency.

  **Acceptance Criteria**:
  - [ ] All T3 scenarios re-pass.
  - [ ] Slice 2 → Slice 4 → Slice 3 nav loop works (3 transitions).
  - [ ] `docs/roadmap.md` shows Slice 4 marked complete with commit ref.
  - [ ] `git show --name-only --format='' <task-4-commit>` contains only `docs/roadmap.md`.
  - [ ] `pnpm build` and `tsc` still clean.

  **QA Scenarios** (MANDATORY):

  ```
  Scenario: Slice 2 → Slice 4 → Slice 3 navigation loop
    Tool: Playwright
    Preconditions: Standard QA Preamble; :3010 up; desktop 1440×900.
    Steps:
      1. browser_navigate("http://localhost:3010/trip/3").
      2. Click any link with text matching /Export|Share|Download/i pointing to `/trip/3/export`.
      3. browser_evaluate("() => location.pathname") — assert "/trip/3/export".
      4. Click "Open route map" link → browser_evaluate path → assert "/trip/3/map".
      5. browser_navigate_back() twice → assert back at /trip/3.
      6. browser_take_screenshot(filename=".sisyphus/evidence/task-4-nav-loop.png").
    Expected Result: Three transitions succeed; final URL = /trip/3.
    Failure Indicators: Any 404, missing link, wrong landing path.
    Evidence: .sisyphus/evidence/task-4-nav-loop.png

  Scenario: Roadmap update committed
    Tool: Bash
    Steps:
      1. cd /Users/cheng/rota && git log -1 --name-only --oneline > .sisyphus/evidence/task-4-roadmap-commit.txt.
      2. Assert output contains "docs/roadmap.md".
      3. cd /Users/cheng/rota && grep -A2 -i "Slice 4" docs/roadmap.md >> .sisyphus/evidence/task-4-roadmap-commit.txt.
      4. Assert grep finds a "complete" or checked-box marker for Slice 4.
    Expected Result: Roadmap commit recorded; Slice 4 marked complete.
    Failure Indicators: No roadmap edit committed, or Slice 4 not marked.
    Evidence: .sisyphus/evidence/task-4-roadmap-commit.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-4-nav-loop.png`
  - [ ] `.sisyphus/evidence/task-4-roadmap-commit.txt`
  - [ ] (Re-captured T3 screenshots as `.sisyphus/evidence/task-4-regression-{name}.png`)

  **Commit**: YES
  - Message: `docs(roadmap): mark Slice 4 export complete`
  - Files: `docs/roadmap.md`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 5. Slice 5 Kickoff — Stitch Pull + Archive-Layout Primitive Extraction + Auth Fixture Prep

  **What to do**:
  - Re-pull live Stitch screen JSON via `stitch_get_screen("3e9c2db666c04499a47e1083872e92ed")` and save to `.sisyphus/evidence/task-5-stitch-archive-screen.json`. Capture composition: header, card grid, filter chips, tile list.
  - Audit `/account/page.tsx` and `/portugal/page.tsx` for repeated layout composition (header + card grid + filter row + tile list) — confirm overlap, decide on extraction shape.
  - Extract an `ArchiveLayout` (or similar) primitive into `packages/ui/src/components/archive-layout.tsx` exposing:
    - props: `{ header: { eyebrow?: string; title: string; description?: string }; filters?: { label: string; active?: boolean; href?: string }[]; children: ReactNode; emptyState?: ReactNode; testid?: string }`.
    - re-uses existing `PageShell`, `SectionHeading`, `Card`, `Button`, `Badge` — does NOT replace them.
  - Add export to `packages/ui/src/index.ts`. Run `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build` — must stay clean.
  - **Do not yet wire** Slice 5 pages to use `ArchiveLayout`. That happens in T6/T7.
  - Prepare Playwright auth fixture patterns for Slice 6/7 by documenting the existing auth flow (no fixture file created yet — that happens in T9/T16).

  **Must NOT do**:
  - Do not edit Slice 5 pages. They are T6/T7 responsibility.
  - Do not edit any API route handler.
  - Do not modify `packages/db`, `packages/ai`, `packages/emails`, `packages/types`, `packages/routing`.
  - Do not place "Rota" anywhere.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
    - Reason: UI primitive extraction with preserve-functionality constraint.
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Composition + token alignment.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 5 (sole task)
  - **Blocks**: T6, T7
  - **Blocked By**: T4

  **References**:
  - `/Users/cheng/rota/packages/ui/src/components/shell.tsx:4-63` — `PageShell` + `SectionHeading` variant pattern.
  - `/Users/cheng/rota/packages/ui/src/components/card.tsx:4-40` — `Card` family.
  - `/Users/cheng/rota/packages/ui/src/styles.css` — Stitch tokens.
  - `/Users/cheng/rota/apps/web/app/(app)/account/page.tsx` — current account page (read for overlap, do not edit).
  - `/Users/cheng/rota/apps/web/app/(marketing)/portugal/page.tsx` — current portugal page (read for overlap, do not edit).
  - Stitch screen `projects/10857043349147902133/screens/3e9c2db666c04499a47e1083872e92ed`.

  **Acceptance Criteria**:
  - [ ] `packages/ui/src/components/archive-layout.tsx` exists, exports `ArchiveLayout`.
  - [ ] `packages/ui/src/index.ts` exports `ArchiveLayout`.
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] Brand-leak grep returns zero matches.

  **QA Scenarios**:
  ```
  Scenario: Primitive type-checks and exports correctly
    Tool: Bash
    Steps:
      1. cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build
      2. grep -n 'ArchiveLayout' /Users/cheng/rota/packages/ui/src/index.ts > .sisyphus/evidence/task-5-export-check.txt.
      3. Assert `.sisyphus/evidence/task-5-export-check.txt` is non-empty.
    Expected Result: Both exit 0; ArchiveLayout export is declared from the real source entrypoint.
    Evidence: .sisyphus/evidence/task-5-tsc-build.txt

  Scenario: Brand-leak guard
    Tool: Bash
    Steps:
      1. grep -rn 'Rota' packages/ui/src --include='*.tsx' --include='*.ts' | grep -vE '^\s*(//|\*)' > .sisyphus/evidence/task-5-brand-leak.txt
      2. Assert file empty.
    Expected Result: Empty file.
    Evidence: .sisyphus/evidence/task-5-brand-leak.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-5-stitch-archive-screen.json`
  - [ ] `.sisyphus/evidence/task-5-tsc-build.txt`
  - [ ] `.sisyphus/evidence/task-5-brand-leak.txt`

  **Commit**: YES
  - Message: `refactor(ui): extract ArchiveLayout primitive for account + portugal reuse`
  - Files: `packages/ui/src/components/archive-layout.tsx`, `packages/ui/src/index.ts`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 6. Slice 5 Sub-page — `/account`

  **What to do**:
  - Re-pull Stitch screen JSON; save to `.sisyphus/evidence/task-6-stitch-account-screen.json`.
- Redesign `/Users/cheng/rota/apps/web/app/(app)/account/page.tsx` against Stitch composition with mobile (375px) responsive design:
    - Header via `SectionHeading` (eyebrow + title + description) — preserved.
    - Use `ArchiveLayout` from T5 for page wrapper.
    - Card grid for trip list / account stats / preferences — match Stitch tile proportions.
    - Preserve all existing data calls and derivations exactly as they exist today: `listTripDrafts()`, `buildEmailPreview("export-ready", "Saved trip")`, `getCheckoutPlan("paid-trip")`, `getCheckoutPlan("human-polish")`, and `getTripCommerceState({ hasHumanReview, isPaid })`.
    - Preserve current public-page behavior — do NOT add a new auth redirect or session dependency.
    - Mobile (375px): single column, comfortable tap targets ≥44px, no horizontal overflow.
  - Add `data-testid` selectors:
    - `data-testid="account-header"`
    - `data-testid="trip-list"`, `data-testid="trip-item-{id}"`
    - `data-testid="account-stats"`
    - `data-testid="preferences-section"`
  - Capture analytics inventory pre/post; diff must be empty.
  - Run `pnpm exec tsc --noEmit && pnpm build`.

  **Must NOT do**:
  - Do not change the file's server-component nature if it currently is one.
  - Do not edit API route handlers under `apps/web/app/api/**`.
  - Do not edit `packages/db/src/index.ts`, `packages/emails/src/index.ts`, `packages/payments/src/index.ts`, or `apps/web/lib/trip-commerce.ts`.
  - Do not introduce a new auth redirect, middleware dependency, or session check.
  - Do not remove any analytics call.
  - Do not introduce "Rota" string.
  - Do not edit `/portugal/page.tsx` (T7 owns it).

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: Stitch fidelity + responsive design.
    - `playwright`: QA scenarios.

  **Parallelization**:
  - **Can Run In Parallel**: YES — with T7
  - **Parallel Group**: Wave 6 (with T7)
  - **Blocks**: T8
  - **Blocked By**: T5

  **References**:
  - `/Users/cheng/rota/apps/web/app/(app)/account/page.tsx` — current page (preserve all behavior).
  - `/Users/cheng/rota/packages/ui/src/components/archive-layout.tsx` — T5 primitive (use here).
  - `/Users/cheng/rota/packages/ui/src/components/shell.tsx` — `PageShell`, `SectionHeading`.
  - `/Users/cheng/rota/packages/ui/src/styles.css` — Stitch tokens.
  - `/Users/cheng/rota/packages/db/src/index.ts` — `listTripDrafts`, `isPersistenceConfigError` (LOCKED).
  - `/Users/cheng/rota/packages/emails/src/index.ts` — `buildEmailPreview` (LOCKED).
  - `/Users/cheng/rota/packages/payments/src/index.ts` — `getCheckoutPlan` (LOCKED).
  - `/Users/cheng/rota/apps/web/lib/trip-commerce.ts` — `getTripCommerceState` (LOCKED).
  - Stitch screen `projects/10857043349147902133/screens/3e9c2db666c04499a47e1083872e92ed`.

  **PRESERVED_BEHAVIORS**:
  - [ ] `listTripDrafts()` still loads persisted trip cards.
  - [ ] `getCheckoutPlan("paid-trip")` and `getCheckoutPlan("human-polish")` still drive unlock/review copy.
  - [ ] `buildEmailPreview("export-ready", "Saved trip")` still drives delivery-preview subject text.
  - [ ] `getTripCommerceState` still controls unlock vs export CTA branch per trip.
  - [ ] All trip list items render with correct links to `/trip/{id}`.
  - [ ] The “Next account features” card still renders unlock-plan, delivery-preview, and roadmap bullet content.
  - [ ] Any existing empty-state message preserved.

  **LOCKED_FILES**:
  - `apps/web/app/api/**`
  - `packages/db/src/index.ts`
  - `packages/emails/src/index.ts`
  - `packages/payments/src/index.ts`
  - `apps/web/lib/trip-commerce.ts`
  - `packages/types/src/**`
  - `apps/web/app/(marketing)/portugal/page.tsx`

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] Analytics pre/post diff empty.
  - [ ] `git show --name-only --format='' <task-6-commit>` contains only `apps/web/app/(app)/account/page.tsx`.
  - [ ] All QA scenarios PASS.

  **QA Scenarios**:
  ```
  Scenario: Account page renders on desktop
    Tool: Playwright
    Preconditions: Standard QA Preamble; :3010 up; viewport 1440×900; user authenticated (use existing auth or anonymous if page allows).
    Steps:
      1. browser_navigate("http://localhost:3010/account").
      2. browser_snapshot — assert `data-testid="account-header"` present.
      3. browser_evaluate("() => document.querySelectorAll('[data-testid^=\"trip-item-\"]').length") — assert ≥ 0 (empty state allowed).
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-6-account-desktop-1440.png", fullPage=true).
    Expected Result: Page loads; header present; trip list or empty state visible; screenshot saved.
    Failure Indicators: 404, missing header, crash.
    Evidence: .sisyphus/evidence/task-6-account-desktop-1440.png

  Scenario: Account page renders on mobile (375px)
    Tool: Playwright
    Preconditions: browser_resize(375, 812).
    Steps:
      1. browser_navigate("http://localhost:3010/account").
      2. browser_evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1") — assert true.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-6-account-mobile-375.png", fullPage=true).
    Expected Result: No horizontal overflow; screenshot saved.
    Failure Indicators: Scrollbar, content cut off.
    Evidence: .sisyphus/evidence/task-6-account-mobile-375.png

  Scenario: Anonymous access semantics preserved
    Tool: Playwright
    Preconditions: Clear cookies / anonymous session.
    Steps:
      1. browser_navigate("http://localhost:3010/account").
      2. browser_evaluate("() => location.pathname") — assert equals "/account".
      3. browser_evaluate("() => !!document.querySelector('[data-testid=\"account-header\"]')") — assert true.
      4. Save result to .sisyphus/evidence/task-6-anonymous-access.txt.
    Expected Result: Page remains reachable without auth, matching current semantics.
    Failure Indicators: Redirect, 401/403, or crash.
    Evidence: .sisyphus/evidence/task-6-anonymous-access.txt

  Scenario: Stitch fidelity side-by-side
    Tool: Playwright + Bash
    Steps:
      1. stitch_get_screen → save ref to .sisyphus/evidence/task-6-stitch-ref.png.
      2. browser_take_screenshot of /account at 1440×900.
      3. Save composition note to .sisyphus/evidence/task-6-stitch-compare.md.
    Expected Result: Composition matches Stitch spirit-of-design.
    Evidence: .sisyphus/evidence/task-6-stitch-compare.md
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-6-stitch-account-screen.json`
  - [ ] `.sisyphus/evidence/task-6-analytics-pre.txt` + `task-6-analytics-post.txt` (diff empty)
  - [ ] `.sisyphus/evidence/task-6-account-desktop-1440.png`
  - [ ] `.sisyphus/evidence/task-6-account-mobile-375.png`
  - [ ] `.sisyphus/evidence/task-6-anonymous-access.txt`
  - [ ] `.sisyphus/evidence/task-6-stitch-compare.md`

  **Commit**: YES
  - Message: `feat(account): redesign /account to Stitch archive screen`
  - Files: `apps/web/app/(app)/account/page.tsx`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 7. Slice 5 Sub-page — `/portugal`

  **What to do**:
  - Re-pull Stitch screen JSON; save to `.sisyphus/evidence/task-7-stitch-portugal-screen.json`.
- Redesign `/Users/cheng/rota/apps/web/app/(marketing)/portugal/page.tsx` against Stitch composition with mobile (375px) responsive design:
    - Header via `SectionHeading` — preserved.
    - Use `ArchiveLayout` from T5 for page wrapper.
    - Region cards for the existing static `regions` array — match Stitch tile proportions.
    - Preserve the page’s current public/static nature — no data fetching, no auth gate, no extra CTA links.
    - Preserve inherited root-layout brand metadata (`rumia.pt`) without adding page-specific SEO/OG tags unless the redesign needs them and they remain brand-correct.
    - Mobile (375px): single column, comfortable tap targets ≥44px, no horizontal overflow.
  - Add `data-testid` selectors:
    - `data-testid="portugal-header"`
    - `data-testid="region-grid"`, `data-testid="region-card-{slug}"`
  - Capture analytics inventory pre/post; diff must be empty.
  - Run `pnpm exec tsc --noEmit && pnpm build`.

  **Must NOT do**:
  - Do not edit API route handlers.
  - Do not remove analytics calls.
  - Do not introduce "Rota" string.
  - Do not introduce a new CTA link that does not exist today.
  - Do not edit `/account/page.tsx` (T6 owns it).

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with T6
  - **Parallel Group**: Wave 6 (with T6)
  - **Blocks**: T8
  - **Blocked By**: T5

  **References**:
  - `/Users/cheng/rota/apps/web/app/(marketing)/portugal/page.tsx` — current page (preserve SEO + data).
  - `/Users/cheng/rota/packages/ui/src/components/archive-layout.tsx` — T5 primitive.
  - `/Users/cheng/rota/packages/ui/src/components/shell.tsx` — `PageShell`, `SectionHeading`.
  - `/Users/cheng/rota/packages/ui/src/styles.css` — Stitch tokens.
  - `/Users/cheng/rota/apps/web/app/layout.tsx` — root metadata is `rumia.pt`; page inherits this unless explicitly overridden.
  - Stitch screen `projects/10857043349147902133/screens/3e9c2db666c04499a47e1083872e92ed`.

  **PRESERVED_BEHAVIORS**:
  - [ ] All 9 existing static region cards still render from the local `regions` array.
  - [ ] Existing copy (“Portugal launch market”, “Start narrow, then expand country by country”, etc.) remains brand-correct.
  - [ ] No new page-specific CTA link is introduced unless it is explicitly added as part of the redesign spec.
  - [ ] No auth gate (marketing page is public).

  **LOCKED_FILES**:
  - `apps/web/app/api/**`
  - `packages/db/src/**`
  - `packages/types/src/**`
  - `apps/web/app/(app)/account/page.tsx`

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] Analytics pre/post diff empty.
  - [ ] `git show --name-only --format='' <task-7-commit>` contains only `apps/web/app/(marketing)/portugal/page.tsx`.
  - [ ] All QA scenarios PASS.

  **QA Scenarios**:
  ```
  Scenario: Portugal page renders on desktop
    Tool: Playwright
    Preconditions: Standard QA Preamble; :3010 up; viewport 1440×900.
    Steps:
      1. browser_navigate("http://localhost:3010/portugal").
      2. browser_snapshot — assert `data-testid="portugal-header"` present.
      3. browser_evaluate("() => document.querySelectorAll('[data-testid^=\"region-card-\"]').length") — assert equals 9.
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-7-portugal-desktop-1440.png", fullPage=true).
    Expected Result: Page loads; header present; content visible; screenshot saved.
    Evidence: .sisyphus/evidence/task-7-portugal-desktop-1440.png

  Scenario: Portugal page renders on mobile (375px)
    Tool: Playwright
    Preconditions: browser_resize(375, 812).
    Steps:
      1. browser_navigate("http://localhost:3010/portugal").
      2. browser_evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1") — assert true.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-7-portugal-mobile-375.png", fullPage=true).
    Expected Result: No horizontal overflow; screenshot saved.
    Evidence: .sisyphus/evidence/task-7-portugal-mobile-375.png

  Scenario: Root metadata remains brand-correct
    Tool: Playwright
    Steps:
      1. browser_navigate("http://localhost:3010/portugal").
      2. browser_evaluate("() => document.title") — assert contains "rumia.pt" and does NOT contain "Rota".
      3. browser_evaluate("() => !!document.querySelector('[data-testid=\"region-grid\"]')") — assert true.
      4. Save to .sisyphus/evidence/task-7-seo-check.txt.
    Expected Result: Root metadata title still brand-correct; region grid present.
    Evidence: .sisyphus/evidence/task-7-seo-check.txt

  Scenario: Stitch fidelity side-by-side
    Tool: Playwright + Bash
    Steps:
      1. stitch_get_screen → save ref to .sisyphus/evidence/task-7-stitch-ref.png.
      2. browser_take_screenshot of /portugal at 1440×900.
      3. Save composition note to .sisyphus/evidence/task-7-stitch-compare.md.
    Expected Result: Composition matches Stitch spirit-of-design.
    Evidence: .sisyphus/evidence/task-7-stitch-compare.md
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-7-stitch-portugal-screen.json`
  - [ ] `.sisyphus/evidence/task-7-analytics-pre.txt` + `task-7-analytics-post.txt` (diff empty)
  - [ ] `.sisyphus/evidence/task-7-portugal-desktop-1440.png`
  - [ ] `.sisyphus/evidence/task-7-portugal-mobile-375.png`
  - [ ] `.sisyphus/evidence/task-7-seo-check.txt`
  - [ ] `.sisyphus/evidence/task-7-stitch-compare.md`

  **Commit**: YES
  - Message: `feat(portugal): redesign /portugal to Stitch archive screen`
  - Files: `apps/web/app/(marketing)/portugal/page.tsx`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 8. Slice 5 Verification + Roadmap Status Update

  **What to do**:
  - Run Standard QA Preamble.
  - Re-execute every QA scenario from T6 and T7 (regression sweep).
  - Run cross-link integration:
    - From `/account` — click a trip item → assert lands on `/trip/{id}` (Slice 2).
    - From `/portugal` — verify the page remains publicly reachable and still renders 9 region cards with no auth gate.
  - Update `docs/roadmap.md` Stitch implementation order section: mark Slice 5 complete with date + commit refs.
  - Single slice-completion commit including roadmap edit.

  **Must NOT do**:
  - Do not edit T6 or T7 page files.
  - Do not edit any LOCKED_FILES.
  - Do not edit any roadmap section other than Stitch implementation order block.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 7 (sole task)
  - **Blocks**: T9
  - **Blocked By**: T6 + T7

  **References**:
  - `/Users/cheng/rota/docs/roadmap.md` — Stitch implementation order section.
  - Prior slice completion edits in git history — match format.

  **Acceptance Criteria**:
  - [ ] All T6/T7 scenarios re-pass.
  - [ ] Account → trip detail nav works.
  - [ ] Portugal page remains public and still renders 9 region cards.
  - [ ] `docs/roadmap.md` shows Slice 5 marked complete.
  - [ ] `git show --name-only --format='' <task-8-commit>` contains only `docs/roadmap.md`.

  **QA Scenarios**:
  ```
  Scenario: Account → trip detail integration
    Tool: Playwright
    Preconditions: Standard QA Preamble; :3010 up; desktop 1440×900; authenticated.
    Steps:
      1. browser_navigate("http://localhost:3010/account").
      2. Click first trip item link.
      3. browser_evaluate("() => location.pathname") — assert matches /^\/trip\/\d+$/.
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-8-account-trip-nav.png").
    Expected Result: Lands on trip detail page.
    Evidence: .sisyphus/evidence/task-8-account-trip-nav.png

  Scenario: Portugal page remains public and complete
    Tool: Playwright
    Preconditions: Desktop viewport.
    Steps:
      1. browser_navigate("http://localhost:3010/portugal").
      2. browser_evaluate("() => document.querySelectorAll('[data-testid^=\"region-card-\"]').length") — assert equals 9.
      3. browser_evaluate("() => location.pathname") — assert "/portugal".
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-8-portugal-public.png").
    Expected Result: Public page loads and retains 9 region cards.
    Evidence: .sisyphus/evidence/task-8-portugal-public.png

  Scenario: Roadmap update committed
    Tool: Bash
    Steps:
      1. git log -1 --name-only --oneline > .sisyphus/evidence/task-8-roadmap-commit.txt
      2. Assert output contains "docs/roadmap.md".
      3. grep -A2 -i "Slice 5" docs/roadmap.md >> .sisyphus/evidence/task-8-roadmap-commit.txt
      4. Assert grep finds "complete" or checked-box marker.
    Expected Result: Roadmap commit recorded; Slice 5 marked complete.
    Evidence: .sisyphus/evidence/task-8-roadmap-commit.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-8-account-trip-nav.png`
  - [ ] `.sisyphus/evidence/task-8-portugal-public.png`
  - [ ] `.sisyphus/evidence/task-8-roadmap-commit.txt`

  **Commit**: YES
  - Message: `docs(roadmap): mark Slice 5 account + portugal complete`
  - Files: `docs/roadmap.md`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 9. Slice 6 Kickoff — Stitch Pull + Reviewer Auth Fixture + Shared Table Primitive

  **What to do**:
  - Re-pull live Stitch screen JSON via `stitch_get_screen("d004025471a64b3e99f2d89f7aa81fc1")` and save to `.sisyphus/evidence/task-9-stitch-reviewer-screen.json`.
  - Audit all 5 reviewer pages for shared composition: `PageShell` + `SectionHeading` + `Card` + `DataTable` pattern repeats. Decide on extraction.
  - Extract a `DataTableShell` primitive into `packages/ui/src/components/data-table-shell.tsx` if warranted (wraps `Card` + table header + empty state + pagination stubs) — ONLY if at least 3 reviewer pages use an identical table layout. Otherwise skip extraction and document the decision.
  - Create Playwright reviewer auth fixture:
    - File: `apps/web/playwright/fixtures/reviewer-auth.ts` (new QA scaffold path for this plan; no repo-local Playwright config exists today).
    - Exports a `createReviewerStorageState()` function that generates a Playwright `storageState` object with a mock session cookie/token representing an authenticated reviewer (role=`reviewer`, id=`ines-almeida` to match current hardcoded data).
    - If Playwright is not configured with a fixtures dir, create the file anyway and note its path for T10–T14 usage.
  - Add exports to `packages/ui/src/index.ts` if extraction happened. Run `pnpm exec tsc --noEmit && pnpm build`.
  - **Do not yet wire** reviewer pages. That happens in T10–T14.

  **Must NOT do**:
  - Do not edit reviewer page files.
  - Do not edit API route handlers.
  - Do not introduce actual auth guards in the app — the current codebase has none; this fixture is for QA only.
  - Do not place "Rota" anywhere.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Primitive extraction + fixture design.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 8 (sole task)
  - **Blocks**: T10–T14
  - **Blocked By**: T8

  **References**:
  - `/Users/cheng/rota/apps/web/app/(reviewer)/reviewer/queue/page.tsx` — table pattern reference.
  - `/Users/cheng/rota/apps/web/app/(reviewer)/reviewer/history/page.tsx` — table pattern reference.
  - `/Users/cheng/rota/packages/ui/src/components/shell.tsx` — `PageShell` + `SectionHeading`.
  - `/Users/cheng/rota/packages/ui/src/components/card.tsx` — `Card` family.
  - Stitch screen `projects/10857043349147902133/screens/d004025471a64b3e99f2d89f7aa81fc1`.
  - No `apps/web/playwright.config.*` file exists today — fixture path is a new QA-scaffolding convention for this slice.

  **Acceptance Criteria**:
  - [ ] Stitch screen JSON saved.
  - [ ] If extraction happened: `packages/ui/src/components/data-table-shell.tsx` exists and exports; `packages/ui/src/index.ts` updated; tsc + build clean.
  - [ ] If extraction skipped: `.sisyphus/evidence/task-9-extraction-decision.md` documents why (e.g., "only 2 pages use table, not 3").
  - [ ] `apps/web/playwright/fixtures/reviewer-auth.ts` exists with `createReviewerStorageState()` export.
  - [ ] Brand-leak grep returns zero matches.

  **QA Scenarios**:
  ```
  Scenario: Fixture file exports the expected symbol
    Tool: Bash
    Steps:
      1. grep -n 'export function createReviewerStorageState\|export const createReviewerStorageState' apps/web/playwright/fixtures/reviewer-auth.ts > .sisyphus/evidence/task-9-fixture-export.txt
      2. Assert `.sisyphus/evidence/task-9-fixture-export.txt` is non-empty.
    Expected Result: Fixture file contains the named export.
    Evidence: .sisyphus/evidence/task-9-fixture-export.txt

  Scenario: Type-check clean
    Tool: Bash
    Steps:
      1. cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build
    Expected Result: Both exit 0.
    Evidence: .sisyphus/evidence/task-9-tsc-build.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-9-stitch-reviewer-screen.json`
  - [ ] `.sisyphus/evidence/task-9-extraction-decision.md` (if skipped)
  - [ ] `.sisyphus/evidence/task-9-fixture-export.txt`
  - [ ] `.sisyphus/evidence/task-9-tsc-build.txt`

  **Commit**: YES
  - Message: `chore(reviewer): add Stitch snapshot, table primitive, and Playwright reviewer auth fixture`
  - Files: `packages/ui/src/components/data-table-shell.tsx` (if extracted), `packages/ui/src/index.ts` (if changed), `apps/web/playwright/fixtures/reviewer-auth.ts`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 10. Slice 6 Sub-page — `/reviewer/queue`

  **What to do**:
  - Re-pull Stitch screen JSON; save to `.sisyphus/evidence/task-10-stitch-queue-screen.json`.
  - Redesign `/Users/cheng/rota/apps/web/app/(reviewer)/reviewer/queue/page.tsx` against Stitch composition with mobile (375px) responsive design:
    - Header via `SectionHeading` — preserved.
    - `DataTable` of trips awaiting review — match Stitch proportions.
    - Preserve `listTripDrafts()` + `getLatestAssignmentForTrip(trip.id)` per row.
    - Preserve link to `/reviewer/trips/{id}` for each row.
    - Preserve `isPersistenceConfigError` info card.
    - Mobile (375px): table becomes card list or horizontal-scroll table, comfortable tap targets ≥44px.
  - Add `data-testid` selectors:
    - `data-testid="reviewer-queue-header"`
    - `data-testid="queue-table"` or `data-testid="queue-list"`
    - `data-testid="queue-item-{tripId}"`
  - Capture analytics inventory pre/post; diff must be empty.
  - Run `pnpm exec tsc --noEmit && pnpm build`.

  **Must NOT do**:
  - Do not edit `packages/db/src/reviewer-assignments.ts` or `packages/db/src/index.ts`.
  - Do not remove `getLatestAssignmentForTrip` call.
  - Do not change row link targets.
  - Do not introduce "Rota" string.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with T11, T12, T13, T14
  - **Parallel Group**: Wave 9
  - **Blocks**: T15
  - **Blocked By**: T9

  **References**:
  - `/Users/cheng/rota/apps/web/app/(reviewer)/reviewer/queue/page.tsx` — current page.
  - `/Users/cheng/rota/packages/db/src/reviewer-assignments.ts` — `getLatestAssignmentForTrip` (LOCKED).
  - `/Users/cheng/rota/packages/db/src/index.ts` — `listTripDrafts`, `isPersistenceConfigError` (LOCKED).
  - `/Users/cheng/rota/packages/ui/src/components/data-table-shell.tsx` — T9 primitive (if extracted).
  - Stitch screen `projects/10857043349147902133/screens/d004025471a64b3e99f2d89f7aa81fc1`.

  **PRESERVED_BEHAVIORS**:
  - [ ] `listTripDrafts()` called exactly once.
  - [ ] `getLatestAssignmentForTrip(trip.id)` called per row.
  - [ ] Each row links to `/reviewer/trips/{tripId}`.
  - [ ] `isPersistenceConfigError` card renders when env misconfigured.

  **LOCKED_FILES**:
  - `packages/db/src/reviewer-assignments.ts`
  - `packages/db/src/index.ts`
  - `apps/web/app/api/**`

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] Analytics pre/post diff empty.
  - [ ] `git show --name-only --format='' <task-10-commit>` contains only `apps/web/app/(reviewer)/reviewer/queue/page.tsx`.

  **QA Scenarios**:
  ```
  Scenario: Queue page renders on desktop
    Tool: Playwright
    Preconditions: Standard QA Preamble; :3010 up; viewport 1440×900; use reviewer auth fixture if page requires auth (currently no guard, so anonymous works).
    Steps:
      1. browser_navigate("http://localhost:3010/reviewer/queue").
      2. browser_snapshot — assert `data-testid="reviewer-queue-header"` present.
      3. browser_evaluate("() => document.querySelectorAll('[data-testid^=\"queue-item-\"]').length") — assert ≥ 0.
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-10-queue-desktop-1440.png", fullPage=true).
    Expected Result: Page loads; header present; items or empty state visible.
    Evidence: .sisyphus/evidence/task-10-queue-desktop-1440.png

  Scenario: Queue page renders on mobile (375px)
    Tool: Playwright
    Preconditions: browser_resize(375, 812).
    Steps:
      1. browser_navigate("http://localhost:3010/reviewer/queue").
      2. browser_evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1") — assert true.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-10-queue-mobile-375.png", fullPage=true).
    Expected Result: No horizontal overflow.
    Evidence: .sisyphus/evidence/task-10-queue-mobile-375.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-10-stitch-queue-screen.json`
  - [ ] `.sisyphus/evidence/task-10-analytics-pre.txt` + `task-10-analytics-post.txt`
  - [ ] `.sisyphus/evidence/task-10-queue-desktop-1440.png`
  - [ ] `.sisyphus/evidence/task-10-queue-mobile-375.png`

  **Commit**: YES
  - Message: `feat(reviewer): redesign /reviewer/queue to Stitch reviewer screen`
  - Files: `apps/web/app/(reviewer)/reviewer/queue/page.tsx`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 11. Slice 6 Sub-page — `/reviewer/trips/[tripId]`

  **What to do**:
  - Re-pull Stitch screen JSON; save to `.sisyphus/evidence/task-11-stitch-reviewer-trip-screen.json`.
  - Redesign `/Users/cheng/rota/apps/web/app/(reviewer)/reviewer/trips/[tripId]/page.tsx` against Stitch composition with mobile (375px) responsive design:
    - Header via `SectionHeading` — preserved.
    - Preserve `getTripDraftById(tripId)`, `generateItineraryFromBrief(trip.brief)`, `buildRouteValidation(itinerary)`.
    - Preserve reviewer action form posting to `/api/trips/[tripId]/review`.
    - Preserve day tabs + `RouteMap`/`MapPanel` + validation findings.
    - Preserve `isPersistenceConfigError` info card.
    - Mobile (375px): tabs stack or become dropdown, map collapses to button-expand, comfortable tap targets.
  - Add `data-testid` selectors:
    - `data-testid="reviewer-trip-header"`
    - `data-testid="review-action-form"`
    - `data-testid="day-tabs"`
    - `data-testid="route-map"`
    - `data-testid="validation-findings"`
  - Capture analytics inventory pre/post; diff must be empty.
  - Run `pnpm exec tsc --noEmit && pnpm build`.

  **Must NOT do**:
  - Do not edit `packages/ai/src/index.ts`, `packages/routing/src/index.ts`, `packages/db/src/index.ts`.
  - Do not change the review action form POST target.
  - Do not remove `RouteMap` or `MapPanel`.
  - Do not introduce "Rota" string.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with T10, T12, T13, T14
  - **Parallel Group**: Wave 9
  - **Blocks**: T15
  - **Blocked By**: T9

  **References**:
  - `/Users/cheng/rota/apps/web/app/(reviewer)/reviewer/trips/[tripId]/page.tsx` — current page.
  - `/Users/cheng/rota/packages/ai/src/index.ts` — `generateItineraryFromBrief` (LOCKED).
  - `/Users/cheng/rota/packages/routing/src/index.ts` — `buildRouteValidation` (LOCKED).
  - `/Users/cheng/rota/packages/db/src/index.ts` — `getTripDraftById`, `isPersistenceConfigError` (LOCKED).
  - Stitch screen `projects/10857043349147902133/screens/d004025471a64b3e99f2d89f7aa81fc1`.

  **PRESERVED_BEHAVIORS**:
  - [ ] `getTripDraftById(tripId)` called.
  - [ ] `generateItineraryFromBrief(trip.brief)` called.
  - [ ] `buildRouteValidation(itinerary)` called.
  - [ ] Review action form POSTs to `/api/trips/[tripId]/review`.
  - [ ] Day tabs switch and render map + validation findings.

  **LOCKED_FILES**:
  - `packages/ai/src/index.ts`
  - `packages/routing/src/index.ts`
  - `packages/db/src/index.ts`
  - `apps/web/app/api/trips/[tripId]/review/route.ts`

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] Analytics pre/post diff empty.
  - [ ] `git show --name-only --format='' <task-11-commit>` contains only `apps/web/app/(reviewer)/reviewer/trips/[tripId]/page.tsx`.
  - [ ] All QA scenarios PASS.

  **QA Scenarios**:
  ```
  Scenario: Reviewer trip page renders on desktop
    Tool: Playwright
    Preconditions: Standard QA Preamble; :3010 up; viewport 1440×900.
    Steps:
      1. browser_navigate("http://localhost:3010/reviewer/trips/3").
      2. browser_snapshot — assert `data-testid="reviewer-trip-header"` present.
      3. browser_evaluate("() => document.querySelectorAll('[data-testid=\"day-tabs\"] [role=\"tab\"]').length") — assert ≥ 1.
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-11-reviewer-trip-desktop-1440.png", fullPage=true).
    Expected Result: Page loads; header + tabs present.
    Evidence: .sisyphus/evidence/task-11-reviewer-trip-desktop-1440.png

  Scenario: Reviewer trip page renders on mobile (375px)
    Tool: Playwright
    Preconditions: browser_resize(375, 812).
    Steps:
      1. browser_navigate("http://localhost:3010/reviewer/trips/3").
      2. browser_evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1") — assert true.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-11-reviewer-trip-mobile-375.png", fullPage=true).
    Expected Result: No horizontal overflow.
    Evidence: .sisyphus/evidence/task-11-reviewer-trip-mobile-375.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-11-stitch-reviewer-trip-screen.json`
  - [ ] `.sisyphus/evidence/task-11-analytics-pre.txt` + `task-11-analytics-post.txt`
  - [ ] `.sisyphus/evidence/task-11-reviewer-trip-desktop-1440.png`
  - [ ] `.sisyphus/evidence/task-11-reviewer-trip-mobile-375.png`

  **Commit**: YES
  - Message: `feat(reviewer): redesign /reviewer/trips/[tripId] to Stitch reviewer screen`
  - Files: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/page.tsx`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 12. Slice 6 Sub-page — `/reviewer/history`

  **What to do**:
  - Re-pull Stitch screen JSON; save to `.sisyphus/evidence/task-12-stitch-history-screen.json`.
  - Redesign `/Users/cheng/rota/apps/web/app/(reviewer)/reviewer/history/page.tsx` against Stitch composition with mobile (375px) responsive design:
    - Header via `SectionHeading` — preserved.
    - Preserve `getReviewerById("ines-almeida")` and `listReviewerAssignments(20, "ines-almeida")`.
    - Preserve metric cards and `DataTable`.
    - Preserve `isPersistenceConfigError` info card.
    - Mobile (375px): metrics stack vertically, table becomes card list.
  - Add `data-testid` selectors:
    - `data-testid="reviewer-history-header"`
    - `data-testid="history-metrics"`
    - `data-testid="history-table"` or `data-testid="history-list"`
  - Capture analytics inventory pre/post; diff must be empty.
  - Run `pnpm exec tsc --noEmit && pnpm build`.

  **Must NOT do**:
  - Do not edit `packages/db/src/reviewers.ts` or `packages/db/src/reviewer-assignments.ts`.
  - Do not change hardcoded reviewer id `"ines-almeida"` (preservation of current behavior).
  - Do not introduce "Rota" string.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with T10, T11, T13, T14
  - **Parallel Group**: Wave 9
  - **Blocks**: T15
  - **Blocked By**: T9

  **References**:
  - `/Users/cheng/rota/apps/web/app/(reviewer)/reviewer/history/page.tsx` — current page.
  - `/Users/cheng/rota/packages/db/src/reviewers.ts` — `getReviewerById` (LOCKED).
  - `/Users/cheng/rota/packages/db/src/reviewer-assignments.ts` — `listReviewerAssignments` (LOCKED).
  - Stitch screen `projects/10857043349147902133/screens/d004025471a64b3e99f2d89f7aa81fc1`.

  **PRESERVED_BEHAVIORS**:
  - [ ] `getReviewerById("ines-almeida")` called.
  - [ ] `listReviewerAssignments(20, "ines-almeida")` called.
  - [ ] Metric cards render same stats.

  **LOCKED_FILES**:
  - `packages/db/src/reviewers.ts`
  - `packages/db/src/reviewer-assignments.ts`

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] Analytics pre/post diff empty.
  - [ ] `git show --name-only --format='' <task-12-commit>` contains only `apps/web/app/(reviewer)/reviewer/history/page.tsx`.
  - [ ] All QA scenarios PASS.

  **QA Scenarios**:
  ```
  Scenario: History page renders on desktop
    Tool: Playwright
    Preconditions: Standard QA Preamble; :3010 up; viewport 1440×900.
    Steps:
      1. browser_navigate("http://localhost:3010/reviewer/history").
      2. browser_snapshot — assert `data-testid="reviewer-history-header"` present.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-12-history-desktop-1440.png", fullPage=true).
    Expected Result: Page loads; header present.
    Evidence: .sisyphus/evidence/task-12-history-desktop-1440.png

  Scenario: History page renders on mobile (375px)
    Tool: Playwright
    Preconditions: browser_resize(375, 812).
    Steps:
      1. browser_navigate("http://localhost:3010/reviewer/history").
      2. browser_evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1") — assert true.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-12-history-mobile-375.png", fullPage=true).
    Expected Result: No horizontal overflow.
    Evidence: .sisyphus/evidence/task-12-history-mobile-375.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-12-stitch-history-screen.json`
  - [ ] `.sisyphus/evidence/task-12-analytics-pre.txt` + `task-12-analytics-post.txt`
  - [ ] `.sisyphus/evidence/task-12-history-desktop-1440.png`
  - [ ] `.sisyphus/evidence/task-12-history-mobile-375.png`

  **Commit**: YES
  - Message: `feat(reviewer): redesign /reviewer/history to Stitch reviewer screen`
  - Files: `apps/web/app/(reviewer)/reviewer/history/page.tsx`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 13. Slice 6 Sub-page — `/reviewer/profile`

  **What to do**:
  - Re-pull Stitch screen JSON; save to `.sisyphus/evidence/task-13-stitch-profile-screen.json`.
  - Redesign `/Users/cheng/rota/apps/web/app/(reviewer)/reviewer/profile/page.tsx` against Stitch composition with mobile (375px) responsive design:
    - Header via `SectionHeading` — preserved.
    - Preserve `getReviewerById("ines-almeida")`.
    - Preserve profile card + coverage/specialties cards.
    - Preserve `isPersistenceConfigError` info card.
    - Mobile (375px): cards stack vertically, no horizontal overflow.
  - Add `data-testid` selectors:
    - `data-testid="reviewer-profile-header"`
    - `data-testid="profile-card"`
    - `data-testid="coverage-card"`
    - `data-testid="specialties-card"`
  - Capture analytics inventory pre/post; diff must be empty.
  - Run `pnpm exec tsc --noEmit && pnpm build`.

  **Must NOT do**:
  - Do not edit `packages/db/src/reviewers.ts`.
  - Do not change hardcoded reviewer id.
  - Do not introduce "Rota" string.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with T10, T11, T12, T14
  - **Parallel Group**: Wave 9
  - **Blocks**: T15
  - **Blocked By**: T9

  **References**:
  - `/Users/cheng/rota/apps/web/app/(reviewer)/reviewer/profile/page.tsx` — current page.
  - `/Users/cheng/rota/packages/db/src/reviewers.ts` — `getReviewerById` (LOCKED).
  - Stitch screen `projects/10857043349147902133/screens/d004025471a64b3e99f2d89f7aa81fc1`.

  **PRESERVED_BEHAVIORS**:
  - [ ] `getReviewerById("ines-almeida")` called.
  - [ ] Profile, coverage, and specialties data all render.

  **LOCKED_FILES**:
  - `packages/db/src/reviewers.ts`

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] Analytics pre/post diff empty.
  - [ ] `git show --name-only --format='' <task-13-commit>` contains only `apps/web/app/(reviewer)/reviewer/profile/page.tsx`.
  - [ ] All QA scenarios PASS.

  **QA Scenarios**:
  ```
  Scenario: Profile page renders on desktop
    Tool: Playwright
    Preconditions: Standard QA Preamble; :3010 up; viewport 1440×900.
    Steps:
      1. browser_navigate("http://localhost:3010/reviewer/profile").
      2. browser_snapshot — assert `data-testid="reviewer-profile-header"` present.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-13-profile-desktop-1440.png", fullPage=true).
    Expected Result: Page loads; header present.
    Evidence: .sisyphus/evidence/task-13-profile-desktop-1440.png

  Scenario: Profile page renders on mobile (375px)
    Tool: Playwright
    Preconditions: browser_resize(375, 812).
    Steps:
      1. browser_navigate("http://localhost:3010/reviewer/profile").
      2. browser_evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1") — assert true.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-13-profile-mobile-375.png", fullPage=true).
    Expected Result: No horizontal overflow.
    Evidence: .sisyphus/evidence/task-13-profile-mobile-375.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-13-stitch-profile-screen.json`
  - [ ] `.sisyphus/evidence/task-13-analytics-pre.txt` + `task-13-analytics-post.txt`
  - [ ] `.sisyphus/evidence/task-13-profile-desktop-1440.png`
  - [ ] `.sisyphus/evidence/task-13-profile-mobile-375.png`

  **Commit**: YES
  - Message: `feat(reviewer): redesign /reviewer/profile to Stitch reviewer screen`
  - Files: `apps/web/app/(reviewer)/reviewer/profile/page.tsx`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 14. Slice 6 Sub-page — `/reviewer/operations`

  **What to do**:
  - Re-pull Stitch screen JSON; save to `.sisyphus/evidence/task-14-stitch-operations-screen.json`.
  - Redesign `/Users/cheng/rota/apps/web/app/(reviewer)/reviewer/operations/page.tsx` against Stitch composition with mobile (375px) responsive design:
    - Header via `SectionHeading` — preserved.
    - Preserve `buildWorkerPlan({ tripId: "1", isPaid: true, hasHumanReview: false })`, `listCheckoutPlans()`, `buildEmailPreview(...)`.
    - Preserve worker-plan card + checkout plan card + email preview card.
    - Mobile (375px): cards stack vertically.
  - Add `data-testid` selectors:
    - `data-testid="reviewer-operations-header"`
    - `data-testid="worker-plan-card"`
    - `data-testid="checkout-plan-card"`
    - `data-testid="email-preview-card"`
  - Capture analytics inventory pre/post; diff must be empty.
  - Run `pnpm exec tsc --noEmit && pnpm build`.

  **Must NOT do**:
  - Do not edit `apps/workers/src/index.ts`, `packages/payments/src/index.ts`, `packages/emails/src/index.ts`.
  - Do not introduce "Rota" string.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with T10, T11, T12, T13
  - **Parallel Group**: Wave 9
  - **Blocks**: T15
  - **Blocked By**: T9

  **References**:
  - `/Users/cheng/rota/apps/web/app/(reviewer)/reviewer/operations/page.tsx` — current page.
  - `/Users/cheng/rota/apps/workers/src/index.ts` — `buildWorkerPlan` (LOCKED).
  - `/Users/cheng/rota/packages/payments/src/index.ts` — `listCheckoutPlans` (LOCKED).
  - `/Users/cheng/rota/packages/emails/src/index.ts` — `buildEmailPreview` (LOCKED).
  - Stitch screen `projects/10857043349147902133/screens/d004025471a64b3e99f2d89f7aa81fc1`.

  **PRESERVED_BEHAVIORS**:
  - [ ] `buildWorkerPlan` called with same args.
  - [ ] `listCheckoutPlans` called.
  - [ ] `buildEmailPreview` called.

  **LOCKED_FILES**:
  - `apps/workers/src/index.ts`
  - `packages/payments/src/index.ts`
  - `packages/emails/src/index.ts`

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] Analytics pre/post diff empty.
  - [ ] `git show --name-only --format='' <task-14-commit>` contains only `apps/web/app/(reviewer)/reviewer/operations/page.tsx`.
  - [ ] All QA scenarios PASS.

  **QA Scenarios**:
  ```
  Scenario: Operations page renders on desktop
    Tool: Playwright
    Preconditions: Standard QA Preamble; :3010 up; viewport 1440×900.
    Steps:
      1. browser_navigate("http://localhost:3010/reviewer/operations").
      2. browser_snapshot — assert `data-testid="reviewer-operations-header"` present.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-14-operations-desktop-1440.png", fullPage=true).
    Expected Result: Page loads; header present.
    Evidence: .sisyphus/evidence/task-14-operations-desktop-1440.png

  Scenario: Operations page renders on mobile (375px)
    Tool: Playwright
    Preconditions: browser_resize(375, 812).
    Steps:
      1. browser_navigate("http://localhost:3010/reviewer/operations").
      2. browser_evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1") — assert true.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-14-operations-mobile-375.png", fullPage=true).
    Expected Result: No horizontal overflow.
    Evidence: .sisyphus/evidence/task-14-operations-mobile-375.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-14-stitch-operations-screen.json`
  - [ ] `.sisyphus/evidence/task-14-analytics-pre.txt` + `task-14-analytics-post.txt`
  - [ ] `.sisyphus/evidence/task-14-operations-desktop-1440.png`
  - [ ] `.sisyphus/evidence/task-14-operations-mobile-375.png`

  **Commit**: YES
  - Message: `feat(reviewer): redesign /reviewer/operations to Stitch reviewer screen`
  - Files: `apps/web/app/(reviewer)/reviewer/operations/page.tsx`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 15. Slice 6 Verification + Roadmap Status Update

  **What to do**:
  - Run Standard QA Preamble.
  - Re-execute every QA scenario from T10–T14 (regression sweep).
  - Run cross-link integration:
    - From `/reviewer/queue` — click first trip item → assert lands on `/reviewer/trips/{id}`.
    - From `/reviewer/trips/3` — click back or queue link → assert returns to `/reviewer/queue`.
  - Update `docs/roadmap.md` Stitch implementation order section: mark Slice 6 complete.
  - Single slice-completion commit including roadmap edit.

  **Must NOT do**:
  - Do not edit T10–T14 page files.
  - Do not edit any LOCKED_FILES.
  - Do not edit any roadmap section other than Stitch implementation order block.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 10 (sole task)
  - **Blocks**: T16
  - **Blocked By**: T10 + T11 + T12 + T13 + T14

  **References**:
  - `/Users/cheng/rota/docs/roadmap.md` — Stitch implementation order section.
  - Prior slice completion edits in git history — match format.

  **Acceptance Criteria**:
  - [ ] All T10–T14 scenarios re-pass.
  - [ ] Queue → trip detail → queue nav loop works.
  - [ ] `docs/roadmap.md` shows Slice 6 marked complete.
  - [ ] `git show --name-only --format='' <task-15-commit>` contains only `docs/roadmap.md`.

  **QA Scenarios**:
  ```
  Scenario: Queue → trip detail → queue nav loop
    Tool: Playwright
    Preconditions: Standard QA Preamble; :3010 up; desktop 1440×900.
    Steps:
      1. browser_navigate("http://localhost:3010/reviewer/queue").
      2. Click first trip item link.
      3. browser_evaluate("() => location.pathname") — assert matches /^\/reviewer\/trips\/\d+$/.
      4. browser_navigate("http://localhost:3010/reviewer/queue").
      5. browser_evaluate("() => location.pathname") — assert "/reviewer/queue".
      6. browser_take_screenshot(filename=".sisyphus/evidence/task-15-nav-loop.png").
    Expected Result: Both transitions succeed.
    Evidence: .sisyphus/evidence/task-15-nav-loop.png

  Scenario: Roadmap update committed
    Tool: Bash
    Steps:
      1. git log -1 --name-only --oneline > .sisyphus/evidence/task-15-roadmap-commit.txt
      2. Assert output contains "docs/roadmap.md".
      3. grep -A2 -i "Slice 6" docs/roadmap.md >> .sisyphus/evidence/task-15-roadmap-commit.txt
      4. Assert grep finds "complete" or checked-box marker.
    Expected Result: Roadmap commit recorded; Slice 6 marked complete.
    Evidence: .sisyphus/evidence/task-15-roadmap-commit.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-15-nav-loop.png`
  - [ ] `.sisyphus/evidence/task-15-roadmap-commit.txt`

  **Commit**: YES
  - Message: `docs(roadmap): mark Slice 6 reviewer complete`
  - Files: `docs/roadmap.md`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 16. Slice 7 Kickoff — Stitch Snapshot + Admin Auth Fixture + Admin Pattern Inventory

  **What to do**:
  - Re-pull the relevant Stitch screens for admin alignment and save a combined note to `.sisyphus/evidence/task-16-stitch-admin-screens.md` referencing the archive/reviewer compositions already in use plus any admin-target screens from the project.
  - Inventory all 7 admin pages and classify them into patterns:
    - editor pattern: `places/page.tsx` + `place-editor.tsx`
    - table pattern: `countries`, `partners`, `reviewers`
    - summary + table pattern: `regions`
    - summary + tile queue pattern: `quality`
    - metrics + leaderboard pattern: `analytics`
  - Create Playwright admin auth fixture scaffold at `apps/web/playwright/fixtures/admin-auth.ts`.
    - This is QA scaffolding only, not route protection.
    - It should mirror reviewer fixture shape but identify the actor as admin.
  - Document current no-auth semantics for admin routes in `.sisyphus/evidence/task-16-admin-auth-semantics.md` so later QA verifies preservation rather than inventing redirects.
  - Run `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`.

  **Must NOT do**:
  - Do not edit admin page files yet.
  - Do not add route middleware, role checks, or redirects.
  - Do not edit API route handlers.
  - Do not introduce "Rota" string.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 11 (sole task)
  - **Blocks**: T17–T23
  - **Blocked By**: T15

  **References**:
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/places/page.tsx` — shell around client editor.
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/places/place-editor.tsx` — actual complex admin interaction surface.
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/countries/page.tsx` — table pattern.
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/regions/page.tsx` — summary + table pattern.
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/partners/page.tsx` — table pattern.
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/reviewers/page.tsx` — summary + table pattern.
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/quality/page.tsx` — summary + tile queue pattern.
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/analytics/page.tsx` — metrics + leaderboard pattern.
  - `/Users/cheng/rota/apps/web/app/layout.tsx` — root metadata and no-auth root semantics.

  **Acceptance Criteria**:
  - [ ] `apps/web/playwright/fixtures/admin-auth.ts` exists.
  - [ ] `.sisyphus/evidence/task-16-admin-auth-semantics.md` exists.
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.

  **QA Scenarios**:
  ```
  Scenario: Admin fixture file exists with exported creator
    Tool: Bash
    Steps:
      1. grep -n 'admin' apps/web/playwright/fixtures/admin-auth.ts > .sisyphus/evidence/task-16-admin-fixture.txt
      2. Assert file exists and grep output is non-empty.
    Expected Result: Fixture scaffold present.
    Evidence: .sisyphus/evidence/task-16-admin-fixture.txt

  Scenario: Type-check clean
    Tool: Bash
    Steps:
      1. cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build
    Expected Result: Both exit 0.
    Evidence: .sisyphus/evidence/task-16-tsc-build.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-16-stitch-admin-screens.md`
  - [ ] `.sisyphus/evidence/task-16-admin-auth-semantics.md`
  - [ ] `.sisyphus/evidence/task-16-admin-fixture.txt`
  - [ ] `.sisyphus/evidence/task-16-tsc-build.txt`

  **Commit**: YES
  - Message: `chore(admin): add admin QA fixture scaffolding and pattern inventory`
  - Files: `apps/web/playwright/fixtures/admin-auth.ts`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 17. Slice 7 Sub-page — `/admin/places`

  **What to do**:
  - Redesign `apps/web/app/(admin)/admin/places/page.tsx` and `apps/web/app/(admin)/admin/places/place-editor.tsx` to match Stitch/admin composition while preserving all current behavior.
  - Preserve client-editor behavior exactly:
    - `useEffect` load from `/api/places`
    - local fallback to `initialPlaces`
    - `POST /api/places` create path
    - `PATCH /api/places/[placeId]` edit path
    - optimistic/local fallback message updates
  - Add stable selectors:
    - `data-testid="admin-places-header"`
    - `data-testid="places-table"`
    - `data-testid="place-form"`
    - `data-testid="place-save-button"`
  - Preserve `"use client"` in `place-editor.tsx`.
  - Run analytics grep pre/post (expect empty both).

  **Must NOT do**:
  - Do not edit `/api/places` route handlers.
  - Do not remove `useEffect`, optimistic fallback behavior, or local rehearsal data.
  - Do not remove `"use client"`.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with T18–T23
  - **Parallel Group**: Wave 12
  - **Blocks**: T24
  - **Blocked By**: T16

  **References**:
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/places/page.tsx` — shell page.
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/places/place-editor.tsx` — editor logic and fetch/save behavior.
  - `/Users/cheng/rota/apps/web/app/api/places/route.ts` — create/list contract (LOCKED).
  - `/Users/cheng/rota/apps/web/app/api/places/[placeId]/route.ts` — patch/get contract (LOCKED).

  **PRESERVED_BEHAVIORS**:
  - [ ] `/api/places` load still occurs on mount.
  - [ ] POST create path still used for new places.
  - [ ] PATCH path still used for edits.
  - [ ] Local fallback messages still appear when persistence unavailable.

  **LOCKED_FILES**:
  - `apps/web/app/api/places/route.ts`
  - `apps/web/app/api/places/[placeId]/route.ts`

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] Analytics pre/post diff empty.
  - [ ] `git show --name-only --format='' <task-17-commit>` contains only `apps/web/app/(admin)/admin/places/page.tsx` and `apps/web/app/(admin)/admin/places/place-editor.tsx`.
  - [ ] All QA scenarios PASS.

  **QA Scenarios**:
  ```
  Scenario: Admin places shell renders on desktop
    Tool: Playwright
    Preconditions: Standard QA Preamble; viewport 1440×900.
    Steps:
      1. browser_navigate("http://localhost:3010/admin/places").
      2. Assert `data-testid="admin-places-header"` and `data-testid="place-form"` present.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-17-places-desktop-1440.png", fullPage=true).
    Expected Result: Header and form visible.
    Evidence: .sisyphus/evidence/task-17-places-desktop-1440.png

  Scenario: Admin places save form remains interactive
    Tool: Playwright
    Steps:
      1. Fill place form inputs with sample values.
      2. Click `data-testid="place-save-button"`.
      3. Assert page does not crash and a status/message region updates.
    Expected Result: Save flow still interactive.
    Evidence: .sisyphus/evidence/task-17-place-save-flow.txt

  Scenario: Admin places renders on mobile (375px)
    Tool: Playwright
    Preconditions: browser_resize(375, 812).
    Steps:
      1. browser_navigate("http://localhost:3010/admin/places").
      2. browser_evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1") — assert true.
      3. Assert `data-testid="place-form"` remains visible.
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-17-places-mobile-375.png", fullPage=true).
    Expected Result: No horizontal overflow; form remains usable on mobile.
    Evidence: .sisyphus/evidence/task-17-places-mobile-375.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-17-places-desktop-1440.png`
  - [ ] `.sisyphus/evidence/task-17-place-save-flow.txt`
  - [ ] `.sisyphus/evidence/task-17-places-mobile-375.png`

  **Commit**: YES
  - Message: `feat(admin): redesign /admin/places shell and editor`
  - Files: `apps/web/app/(admin)/admin/places/page.tsx`, `apps/web/app/(admin)/admin/places/place-editor.tsx`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 18. Slice 7 Sub-page — `/admin/countries`

  **What to do**:
  - Redesign `apps/web/app/(admin)/admin/countries/page.tsx`.
  - Preserve `listRegions()`-driven country derivation exactly, including fallback rows.
  - Preserve `isPersistenceConfigError` card behavior.
  - Add selectors: `admin-countries-header`, `countries-table`.
  - Preserve the derived status logic (`Active MVP` / `Planned` / `Research`) and Portugal currency/language special-casing.
  - Capture analytics inventory pre/post; diff must be empty.
  - Run `pnpm exec tsc --noEmit && pnpm build`.

  **Must NOT do**:
  - Do not edit `packages/db/src/regions.ts` or `packages/db/src/index.ts`.
  - Do not change derived country status rules.
  - Do not introduce "Rota" string.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with T17, T19, T20, T21, T22, T23
  - **Parallel Group**: Wave 12
  - **Blocks**: T24
  - **Blocked By**: T16

  **References**:
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/countries/page.tsx` — current page.
  - `/Users/cheng/rota/packages/db/src/regions.ts` — region source data (LOCKED).
  - `/Users/cheng/rota/packages/db/src/index.ts` — `isPersistenceConfigError` export (LOCKED).

  **PRESERVED_BEHAVIORS**:
  - [ ] `listRegions()` still drives all derived country rows.
  - [ ] Portugal row still maps to `EUR` and `EN / PT`.
  - [ ] Fallback rows still render when persisted data absent.

  **LOCKED_FILES**:
  - `packages/db/src/regions.ts`
  - `packages/db/src/index.ts`

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] Analytics pre/post diff empty.
  - [ ] `git show --name-only --format='' <task-18-commit>` contains only `apps/web/app/(admin)/admin/countries/page.tsx`.

  **QA Scenarios**:
  ```
  Scenario: Countries page renders
    Tool: Playwright
    Steps:
      1. browser_navigate("http://localhost:3010/admin/countries").
      2. Assert `data-testid="admin-countries-header"` present.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-18-countries-desktop-1440.png", fullPage=true).
    Expected Result: Page renders and table visible.
    Evidence: .sisyphus/evidence/task-18-countries-desktop-1440.png

  Scenario: Countries page renders on mobile
    Tool: Playwright
    Steps:
      1. browser_resize(375, 812).
      2. browser_navigate("http://localhost:3010/admin/countries").
      3. browser_evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1") — assert true.
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-18-countries-mobile-375.png", fullPage=true).
    Expected Result: No horizontal overflow.
    Evidence: .sisyphus/evidence/task-18-countries-mobile-375.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-18-analytics-pre.txt` + `task-18-analytics-post.txt`
  - [ ] `.sisyphus/evidence/task-18-countries-desktop-1440.png`
  - [ ] `.sisyphus/evidence/task-18-countries-mobile-375.png`

  **Commit**: YES
  - Message: `feat(admin): redesign /admin/countries`
  - Files: `apps/web/app/(admin)/admin/countries/page.tsx`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 19. Slice 7 Sub-page — `/admin/regions`

  **What to do**:
  - Redesign `apps/web/app/(admin)/admin/regions/page.tsx`.
  - Preserve `listRegions()` data flow, summary cards, badges, info card, and `DataTable`.
  - Add selectors: `admin-regions-header`, `regions-summary`, `regions-table`.
  - Preserve the three summary cards and their specific metrics/content.
  - Capture analytics inventory pre/post; diff must be empty.
  - Run `pnpm exec tsc --noEmit && pnpm build`.

  **Must NOT do**:
  - Do not edit `packages/db/src/regions.ts`.
  - Do not remove the badge list or summary-card content.
  - Do not introduce "Rota" string.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with T17, T18, T20, T21, T22, T23
  - **Parallel Group**: Wave 12
  - **Blocks**: T24
  - **Blocked By**: T16

  **References**:
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/regions/page.tsx` — current page.
  - `/Users/cheng/rota/packages/db/src/regions.ts` — region source data (LOCKED).

  **PRESERVED_BEHAVIORS**:
  - [ ] `listRegions()` still drives rows.
  - [ ] Summary cards still show active launch shape, current rules, and next rollout concern.
  - [ ] Fallback rows still appear when no persisted regions exist.

  **LOCKED_FILES**:
  - `packages/db/src/regions.ts`

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] Analytics pre/post diff empty.
  - [ ] `git show --name-only --format='' <task-19-commit>` contains only `apps/web/app/(admin)/admin/regions/page.tsx`.

  **QA Scenarios**:
  ```
  Scenario: Regions page renders
    Tool: Playwright
    Steps:
      1. browser_navigate("http://localhost:3010/admin/regions").
      2. Assert `data-testid="admin-regions-header"` present.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-19-regions-desktop-1440.png", fullPage=true).
    Expected Result: Page renders.
    Evidence: .sisyphus/evidence/task-19-regions-desktop-1440.png

  Scenario: Regions page renders on mobile
    Tool: Playwright
    Steps:
      1. browser_resize(375, 812).
      2. browser_navigate("http://localhost:3010/admin/regions").
      3. browser_evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1") — assert true.
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-19-regions-mobile-375.png", fullPage=true).
    Expected Result: No horizontal overflow.
    Evidence: .sisyphus/evidence/task-19-regions-mobile-375.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-19-analytics-pre.txt` + `task-19-analytics-post.txt`
  - [ ] `.sisyphus/evidence/task-19-regions-desktop-1440.png`
  - [ ] `.sisyphus/evidence/task-19-regions-mobile-375.png`

  **Commit**: YES
  - Message: `feat(admin): redesign /admin/regions`
  - Files: `apps/web/app/(admin)/admin/regions/page.tsx`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 20. Slice 7 Sub-page — `/admin/partners`

  **What to do**:
  - Redesign `apps/web/app/(admin)/admin/partners/page.tsx`.
  - Preserve `listPartners()` data flow, badge group, info card, and partner table.
  - Add selectors: `admin-partners-header`, `partners-table`.
  - Capture analytics inventory pre/post; diff must be empty.
  - Run `pnpm exec tsc --noEmit && pnpm build`.

  **Must NOT do**:
  - Do not edit `packages/db/src/partners.ts`.
  - Do not remove the partner-posture badges or link-policy card.
  - Do not introduce "Rota" string.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with T17, T18, T19, T21, T22, T23
  - **Parallel Group**: Wave 12
  - **Blocks**: T24
  - **Blocked By**: T16

  **References**:
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/partners/page.tsx` — current page.
  - `/Users/cheng/rota/packages/db/src/partners.ts` — partner source data (LOCKED).

  **PRESERVED_BEHAVIORS**:
  - [ ] `listPartners()` still drives rows.
  - [ ] Partner-posture badge group remains present.
  - [ ] Link-policy explanatory card remains present.

  **LOCKED_FILES**:
  - `packages/db/src/partners.ts`

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] Analytics pre/post diff empty.
  - [ ] `git show --name-only --format='' <task-20-commit>` contains only `apps/web/app/(admin)/admin/partners/page.tsx`.

  **QA Scenarios**:
  ```
  Scenario: Partners page renders
    Tool: Playwright
    Steps:
      1. browser_navigate("http://localhost:3010/admin/partners").
      2. Assert `data-testid="admin-partners-header"` present.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-20-partners-desktop-1440.png", fullPage=true).
    Expected Result: Page renders.
    Evidence: .sisyphus/evidence/task-20-partners-desktop-1440.png

  Scenario: Partners page renders on mobile
    Tool: Playwright
    Steps:
      1. browser_resize(375, 812).
      2. browser_navigate("http://localhost:3010/admin/partners").
      3. browser_evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1") — assert true.
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-20-partners-mobile-375.png", fullPage=true).
    Expected Result: No horizontal overflow.
    Evidence: .sisyphus/evidence/task-20-partners-mobile-375.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-20-analytics-pre.txt` + `task-20-analytics-post.txt`
  - [ ] `.sisyphus/evidence/task-20-partners-desktop-1440.png`
  - [ ] `.sisyphus/evidence/task-20-partners-mobile-375.png`

  **Commit**: YES
  - Message: `feat(admin): redesign /admin/partners`
  - Files: `apps/web/app/(admin)/admin/partners/page.tsx`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 21. Slice 7 Sub-page — `/admin/reviewers`

  **What to do**:
  - Redesign `apps/web/app/(admin)/admin/reviewers/page.tsx`.
  - Preserve `listReviewers()` data flow, summary cards, badge tags, info card, and reviewer roster table.
  - Add selectors: `admin-reviewers-header`, `reviewers-table`.
  - Capture analytics inventory pre/post; diff must be empty.
  - Run `pnpm exec tsc --noEmit && pnpm build`.

  **Must NOT do**:
  - Do not edit `packages/db/src/reviewers.ts`.
  - Do not remove summary cards or assignment-tag badges.
  - Do not introduce "Rota" string.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with T17, T18, T19, T20, T22, T23
  - **Parallel Group**: Wave 12
  - **Blocks**: T24
  - **Blocked By**: T16

  **References**:
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/reviewers/page.tsx` — current page.
  - `/Users/cheng/rota/packages/db/src/reviewers.ts` — reviewer source data (LOCKED).

  **PRESERVED_BEHAVIORS**:
  - [ ] `listReviewers()` still drives rows.
  - [ ] Reviewer coverage, assignment tags, and review quality goal cards remain present.
  - [ ] Fallback reviewer rows still render when persisted data absent.

  **LOCKED_FILES**:
  - `packages/db/src/reviewers.ts`

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] Analytics pre/post diff empty.
  - [ ] `git show --name-only --format='' <task-21-commit>` contains only `apps/web/app/(admin)/admin/reviewers/page.tsx`.

  **QA Scenarios**:
  ```
  Scenario: Reviewers page renders
    Tool: Playwright
    Steps:
      1. browser_navigate("http://localhost:3010/admin/reviewers").
      2. Assert `data-testid="admin-reviewers-header"` present.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-21-reviewers-desktop-1440.png", fullPage=true).
    Expected Result: Page renders.
    Evidence: .sisyphus/evidence/task-21-reviewers-desktop-1440.png

  Scenario: Reviewers page renders on mobile
    Tool: Playwright
    Steps:
      1. browser_resize(375, 812).
      2. browser_navigate("http://localhost:3010/admin/reviewers").
      3. browser_evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1") — assert true.
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-21-reviewers-mobile-375.png", fullPage=true).
    Expected Result: No horizontal overflow.
    Evidence: .sisyphus/evidence/task-21-reviewers-mobile-375.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-21-analytics-pre.txt` + `task-21-analytics-post.txt`
  - [ ] `.sisyphus/evidence/task-21-reviewers-desktop-1440.png`
  - [ ] `.sisyphus/evidence/task-21-reviewers-mobile-375.png`

  **Commit**: YES
  - Message: `feat(admin): redesign /admin/reviewers`
  - Files: `apps/web/app/(admin)/admin/reviewers/page.tsx`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 22. Slice 7 Sub-page — `/admin/quality`

  **What to do**:
  - Redesign `apps/web/app/(admin)/admin/quality/page.tsx`.
  - Preserve `listPlaces()` data flow, computed quality metrics, flagged place calculations, and tile queue.
  - Add selectors: `admin-quality-header`, `quality-metrics`, `quality-queue`.
  - Capture analytics inventory pre/post; diff must be empty.
  - Run `pnpm exec tsc --noEmit && pnpm build`.

  **Must NOT do**:
  - Do not edit `packages/db/src/places.ts`.
  - Do not change the flagged-place calculation rules.
  - Do not introduce "Rota" string.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with T17, T18, T19, T20, T21, T23
  - **Parallel Group**: Wave 12
  - **Blocks**: T24
  - **Blocked By**: T16

  **References**:
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/quality/page.tsx` — current page.
  - `/Users/cheng/rota/packages/db/src/places.ts` — places source data (LOCKED).

  **PRESERVED_BEHAVIORS**:
  - [ ] `listPlaces()` still drives quality metrics and review queue.
  - [ ] Average-quality and flagged-place calculations remain intact.
  - [ ] Fallback review item still appears when no flagged places exist.

  **LOCKED_FILES**:
  - `packages/db/src/places.ts`

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] Analytics pre/post diff empty.
  - [ ] `git show --name-only --format='' <task-22-commit>` contains only `apps/web/app/(admin)/admin/quality/page.tsx`.

  **QA Scenarios**:
  ```
  Scenario: Quality page renders
    Tool: Playwright
    Steps:
      1. browser_navigate("http://localhost:3010/admin/quality").
      2. Assert `data-testid="admin-quality-header"` present.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-22-quality-desktop-1440.png", fullPage=true).
    Expected Result: Page renders.
    Evidence: .sisyphus/evidence/task-22-quality-desktop-1440.png

  Scenario: Quality page renders on mobile
    Tool: Playwright
    Steps:
      1. browser_resize(375, 812).
      2. browser_navigate("http://localhost:3010/admin/quality").
      3. browser_evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1") — assert true.
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-22-quality-mobile-375.png", fullPage=true).
    Expected Result: No horizontal overflow.
    Evidence: .sisyphus/evidence/task-22-quality-mobile-375.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-22-analytics-pre.txt` + `task-22-analytics-post.txt`
  - [ ] `.sisyphus/evidence/task-22-quality-desktop-1440.png`
  - [ ] `.sisyphus/evidence/task-22-quality-mobile-375.png`

  **Commit**: YES
  - Message: `feat(admin): redesign /admin/quality`
  - Files: `apps/web/app/(admin)/admin/quality/page.tsx`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 23. Slice 7 Sub-page — `/admin/analytics`

  **What to do**:
  - Redesign `apps/web/app/(admin)/admin/analytics/page.tsx`.
  - Preserve `listBookingClicks()` data flow, 7-day window computation, source counts, partner leaderboard, and funnel cards.
  - Add selectors: `admin-analytics-header`, `analytics-metrics`, `funnel-card`, `partner-leaderboard`.
  - Capture analytics inventory pre/post; diff must be empty.
  - Run `pnpm exec tsc --noEmit && pnpm build`.

  **Must NOT do**:
  - Do not edit `packages/db/src/booking-clicks.ts`.
  - Do not change the 7-day window or partner leaderboard sort logic.
  - Do not introduce "Rota" string.

  **Recommended Agent Profile**:
  - **Category**: `Sisyphus-Junior` (visual-engineering)
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with T17, T18, T19, T20, T21, T22
  - **Parallel Group**: Wave 12
  - **Blocks**: T24
  - **Blocked By**: T16

  **References**:
  - `/Users/cheng/rota/apps/web/app/(admin)/admin/analytics/page.tsx` — current page.
  - `/Users/cheng/rota/packages/db/src/booking-clicks.ts` — analytics source data (LOCKED).

  **PRESERVED_BEHAVIORS**:
  - [ ] `listBookingClicks()` still drives metrics.
  - [ ] 7-day click window still computed from `Date.now() - 7 * 24 * 60 * 60 * 1000`.
  - [ ] Partner leaderboard still sorts descending by clicks and slices top 4.

  **LOCKED_FILES**:
  - `packages/db/src/booking-clicks.ts`

  **Acceptance Criteria**:
  - [ ] `pnpm exec tsc --noEmit` exits 0.
  - [ ] `pnpm build` exits 0.
  - [ ] Analytics pre/post diff empty.
  - [ ] `git show --name-only --format='' <task-23-commit>` contains only `apps/web/app/(admin)/admin/analytics/page.tsx`.

  **QA Scenarios**:
  ```
  Scenario: Analytics page renders
    Tool: Playwright
    Steps:
      1. browser_navigate("http://localhost:3010/admin/analytics").
      2. Assert `data-testid="admin-analytics-header"` present.
      3. browser_take_screenshot(filename=".sisyphus/evidence/task-23-analytics-desktop-1440.png", fullPage=true).
    Expected Result: Page renders.
    Evidence: .sisyphus/evidence/task-23-analytics-desktop-1440.png

  Scenario: Analytics page renders on mobile
    Tool: Playwright
    Steps:
      1. browser_resize(375, 812).
      2. browser_navigate("http://localhost:3010/admin/analytics").
      3. browser_evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1") — assert true.
      4. browser_take_screenshot(filename=".sisyphus/evidence/task-23-analytics-mobile-375.png", fullPage=true).
    Expected Result: No horizontal overflow.
    Evidence: .sisyphus/evidence/task-23-analytics-mobile-375.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-23-analytics-pre.txt` + `task-23-analytics-post.txt`
  - [ ] `.sisyphus/evidence/task-23-analytics-desktop-1440.png`
  - [ ] `.sisyphus/evidence/task-23-analytics-mobile-375.png`

  **Commit**: YES
  - Message: `feat(admin): redesign /admin/analytics`
  - Files: `apps/web/app/(admin)/admin/analytics/page.tsx`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

- [ ] 24. Slice 7 Verification + Roadmap Status Update

  **What to do**:
  - Run Standard QA Preamble.
  - Re-execute all admin-page QA scenarios from T17–T23.
  - Verify current admin public/no-auth semantics are preserved during this UI rollout: `/admin/places` and `/admin/analytics` still load without introducing redirects or middleware errors.
  - Update `docs/roadmap.md` Stitch implementation order section: mark Slice 7 complete.
  - Create one slice-completion commit for `docs/roadmap.md`.

  **Must NOT do**:
  - Do not edit T17–T23 page files.
  - Do not edit any API route handler.
  - Do not edit any roadmap section outside the Stitch implementation order block.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 13 (sole task)
  - **Blocks**: F1–F4
  - **Blocked By**: T17–T23

  **Acceptance Criteria**:
  - [ ] All T17–T23 scenarios re-pass.
  - [ ] `/admin/places` and `/admin/analytics` remain reachable without new auth regressions.
  - [ ] `docs/roadmap.md` shows Slice 7 marked complete.
  - [ ] This task diff is limited to `docs/roadmap.md`.

  **QA Scenarios**:
  ```
  Scenario: Admin routes still reachable after redesign
    Tool: Playwright
    Steps:
      1. browser_navigate("http://localhost:3010/admin/places").
      2. Assert `location.pathname === "/admin/places"`.
      3. browser_navigate("http://localhost:3010/admin/analytics").
      4. Assert `location.pathname === "/admin/analytics"`.
      5. browser_take_screenshot(filename=".sisyphus/evidence/task-24-admin-reachability.png").
    Expected Result: Both pages reachable; no redirect loop or 500.
    Evidence: .sisyphus/evidence/task-24-admin-reachability.png

  Scenario: Roadmap update committed
    Tool: Bash
    Steps:
      1. git log -1 --name-only --oneline > .sisyphus/evidence/task-24-roadmap-commit.txt
      2. Assert output contains "docs/roadmap.md".
      3. grep -A2 -i "Slice 7" docs/roadmap.md >> .sisyphus/evidence/task-24-roadmap-commit.txt
      4. Assert Slice 7 marked complete.
    Expected Result: Roadmap update present.
    Evidence: .sisyphus/evidence/task-24-roadmap-commit.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-24-admin-reachability.png`
  - [ ] `.sisyphus/evidence/task-24-roadmap-commit.txt`

  **Commit**: YES
  - Message: `docs(roadmap): mark Slice 7 admin complete`
  - Files: `docs/roadmap.md`
  - Pre-commit: `cd /Users/cheng/rota && pnpm exec tsc --noEmit && pnpm build`

<!-- TASKS_INSERTION_POINT -->

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Then U1 user-okay gate.

- [ ] F1. **Plan Compliance Audit** — `oracle`

  Read this plan end-to-end. For each "Must Have" item: verify implementation exists by reading the named file, running the named curl, or running the named command. For each "Must NOT Have" guardrail: search the codebase for forbidden patterns and reject with `file:line` if found. Verify every evidence file declared in T1–T24 exists under `.sisyphus/evidence/`. Compare deliverables list against actual files in repo.

  **Concrete checks**:
  - `grep -rn 'as any\|@ts-ignore\|@ts-expect-error\|console\.log\|// TODO\|// FIXME' apps/web/app packages/ui/src --include='*.tsx' --include='*.ts'` — must be empty (excluding pre-existing baseline).
  - `git diff --name-only <plan-start-ref>...HEAD | grep -E '\.(ts|tsx)$' | xargs grep -n 'Rota' | grep -v '^.*://' | grep -vE '\s*(//|\*)'` — must be empty for changed files only.
  - For each task N in 1..24: verify all evidence files declared exist via `test -f`.
  - `git log --oneline` since plan start — verify slice-completion commits exist for slices 4, 5, 6, 7.

  **Output Format**: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [24/24] | Evidence [N/N] | VERDICT: APPROVE/REJECT` plus per-failure file:line list.

  **Blocked By**: T24 (S7 Verification).
  **Parallel With**: F2, F3, F4.

- [ ] F2. **Code Quality Review** — `unspecified-high`

  Run full quality gate. Review every changed file across T1–T24 for code-quality issues and AI-slop patterns.

  **Commands**:
  - `cd /Users/cheng/rota && pnpm exec tsc --noEmit` (must exit 0).
  - `cd /Users/cheng/rota && pnpm build` (must exit 0).
  - If a repo-supported lint command exists, run it and require exit 0; otherwise record `Lint: N/A (no lint command configured in apps/web/package.json)` in the review output.
  - `cd /Users/cheng/rota/apps/web && pnpm exec playwright test` if any unit/e2e specs exist — must pass.

  **Manual review checklist** (per changed file from the union of `git show --name-only --format='' <task-N-commit>` across T1–T24):
  - [ ] No `as any`, `@ts-ignore`, `@ts-expect-error`.
  - [ ] No empty `catch {}` blocks.
  - [ ] No `console.log` in production code paths.
  - [ ] No commented-out code blocks.
  - [ ] No unused imports.
  - [ ] No generic names (`data`, `result`, `item`, `temp`, `foo`).
  - [ ] No premature abstraction (single-use "helpers", over-extracted hooks).
  - [ ] No documentation bloat (excessive JSDoc on obvious code).
  - [ ] No over-validation (>3 error checks per simple input).

  **Output Format**: `Build [PASS/FAIL] | TSC [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files reviewed [N] | Issues found [N] | VERDICT: APPROVE/REJECT` with per-issue file:line.

  **Blocked By**: T24.
  **Parallel With**: F1, F3, F4.

- [ ] F3. **Real Manual QA** — `unspecified-high` + `playwright` skill

  Start from clean state via Standard QA Preamble. Execute EVERY QA scenario from EVERY task T1–T24 — follow exact steps, capture fresh evidence to `.sisyphus/evidence/final-qa/task-{N}-{scenario-slug}-{viewport}.{ext}`. Test cross-task integration:
  - Trip overview → export → back to overview (Slice 2 + 4).
  - Account → trip detail plus Portugal public render regression (Slice 5 + 2).
  - Reviewer queue → trip detail → history (Slice 6 internal flow).
  - Admin places → countries → regions cross-navigation (Slice 7 internal flow).

  Test edge cases:
  - Empty trip list state on `/account`.
  - Invalid `tripId` on `/trip/999/export` preserves current behavior: render the export shell without crashing, with fallback copy and no 5xx.
  - Locked trip on `/trip/[tripId]/export` (commerce gate intact).
  - Anonymous access to `/reviewer/queue` and `/admin/places` preserves current shell behavior (HTTP 200 / no crash), since this UI plan does not introduce new route-level auth guards.
  - Rapid day-tab switching on `/trip/3/map` (no race conditions).

  **Output Format**: `Scenarios [N/N pass] | Integration tests [N/N] | Edge cases [N tested, N pass] | VERDICT: APPROVE/REJECT` plus per-failure scenario name + evidence path.

  **Blocked By**: T24.
  **Parallel With**: F1, F2, F4.

- [ ] F4. **Scope Fidelity Check** — `deep`

  For each task T1–T24: read the task's "What to do" + "Must NOT do" sections, then read the actual diff from git. Verify 1:1 — everything in the spec was built, nothing beyond the spec was built.

  **Per-task checks**:
  - `git log --all --oneline | grep -i "task ${N}\|slice ${slice}"` — find commits associated with the task.
  - If the task created a commit: `git diff <commit>^..<commit> --name-only` — list files touched.
  - If the task intentionally created no commit (T1 verification-only path): verify scope via declared evidence files plus working-tree/file timestamps instead of commit diff.
  - Verify every file in the task's `LOCKED_FILES` is NOT in the diff.
  - Verify every deliverable in the task's "What to do" exists in the diff.
  - Detect cross-task contamination: Task N touching files declared as Task M's responsibility.
  - Detect unaccounted changes: files in diff that belong to no declared task.

  **Output Format**: `Tasks [24/24 compliant] | Locked-file violations [N] | Cross-task contamination [CLEAN/N issues] | Unaccounted files [CLEAN/N files] | Scope creep [N tasks] | Scope shortfall [N tasks] | VERDICT: APPROVE/REJECT` plus per-violation file:line + commit ref.

  **Blocked By**: T24.
  **Parallel With**: F1, F2, F3.

- [ ] U1. **User Okay Gate (literal token)**

  After F1–F4 all return APPROVE, the executor MUST:
  1. Auto-generate `.sisyphus/evidence/FINAL_SUMMARY.md` containing:
     - Plan metadata (name, generated date, total tasks, commits referenced).
     - Per-task summary block: task title, status (PASS/FAIL), evidence file paths (clickable relative links), QA scenario verdicts.
     - F1–F4 verdict block with full structured output from each agent.
     - Roadmap diff (`git diff ${PLAN_START_REF}...HEAD -- docs/roadmap.md` rendered).
     - Top-level success-criteria checklist with PASS/FAIL per item.
     - Final line: `Reply with literal token \`APPROVED\` to mark this plan complete, or \`REJECTED: <reason>\` to send it back for revision.`
  2. Print the summary path and the reply instruction to the user.
  3. **STOP execution and wait** for the user's literal-token reply.

  **Acceptance**:
  - User reply matches regex `^APPROVED$` (case-sensitive) → mark plan complete.
  - User reply matches `^REJECTED:\s*.+` → record rejection reason, route the named issues back through the appropriate review agent, fix, regenerate `FINAL_SUMMARY.md`, re-prompt.

  **Must NOT do**:
  - Do not interpret "looks good", "ship it", "ok", "approved" (lowercase), or any near-miss as approval. Literal `APPROVED` only.
  - Do not auto-mark the plan complete without the explicit token.

  **Blocked By**: F1, F2, F3, F4 all APPROVE.
  **Parallel With**: None — terminal.

<!-- FINAL_VERIFICATION_INSERTION_POINT -->

---

## Commit Strategy

- **Per task**: One commit per completed redesign task once that task's QA evidence is captured.
- **Per slice**: Slice verification task creates a final "slice complete" commit including the `docs/roadmap.md` status update.
- **Format**: Conventional commits — `feat(scope): desc`, `fix(scope): desc`, `refactor(scope): desc`, `docs(roadmap): mark slice N complete`.
- **Pre-commit**: `pnpm typecheck && pnpm build` from repo root must pass before any commit.
- **Branching**: Single working branch (no PR splits). User merges to `main` after U1 APPROVED.

Examples:
- `T2`: `refactor(ui): extract trip-card primitive for export + account reuse`
- `T3`: `feat(export): redesign /trip/[tripId]/export to Stitch screen aa02ed35`
- `T4`: `docs(roadmap): mark Slice 4 export complete`
- `T9`: `feat(reviewer): add Playwright reviewer auth fixture`
- `T16`: `feat(admin): add Playwright admin auth fixture extending reviewer`
- `F-final`: `chore(evidence): generate FINAL_SUMMARY.md`

---

## Success Criteria

### Verification Commands

```bash
# 1) TS clean across monorepo
cd /Users/cheng/rota && pnpm typecheck
# Expected: exit 0, no error output

# 2) Build clean
cd /Users/cheng/rota && pnpm build
# Expected: exit 0, "Compiled successfully" in output

# 3) Clean runtime boots
cd /Users/cheng/rota/apps/web && pnpm exec next start --port 3010 &
sleep 6 && curl -sf http://localhost:3010 > /dev/null
# Expected: curl exit 0; /tmp/rumia-web-3010-start.log shows zero error/warn lines

# 4) Analytics inventory diffs all empty
cd /Users/cheng/rota && for pre in .sisyphus/evidence/task-*-analytics-pre.txt; do post="${pre/-analytics-pre.txt/-analytics-post.txt}"; diff "$pre" "$post" || exit 1; done
# Expected: every per-task analytics diff is empty; loop exits 0

# 5) Brand-leak check (changed files only)
cd /Users/cheng/rota && git diff --name-only <plan-start-ref>...HEAD | grep -E '\.(ts|tsx)$' | xargs grep -n 'Rota' | grep -v '// '
# Expected: zero matches in changed user-facing strings (comments OK)

# 6) Evidence files exist
ls -1 .sisyphus/evidence/task-*-{1440,375}.png | wc -l
# Expected: ≥ (count of redesign tasks × 2 viewports × ≥1 happy-path scenario)

# 7) FINAL_SUMMARY.md exists
test -f .sisyphus/evidence/FINAL_SUMMARY.md && echo "OK"
# Expected: "OK"
```

### Final Checklist
- [ ] All "Must Have" items verified by their respective verification commands.
- [ ] All "Must NOT Have" guardrails verified absent (grep checks empty).
- [ ] All Playwright scenarios across T1–T24 green; evidence files present.
- [ ] F1, F2, F3, F4 all return APPROVE verdict in their structured outputs.
- [ ] `.sisyphus/evidence/FINAL_SUMMARY.md` exists, lists every task's evidence paths and F1–F4 verdicts.
- [ ] User has replied with literal token `APPROVED` against `FINAL_SUMMARY.md`.
