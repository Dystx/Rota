# Rumia Frontend Corrective Convergence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the promised Portugal-wide, activity-first frontend by making every route visibly task-specific, responsive, recoverable, and human-approved rather than accepting a shared beige-and-panel reskin.

**Architecture:** Keep one canonical frontend queue. Add an executable route-presentation catalogue beside the HTTP route catalogue, make scene/surface/footer decisions explicit at each route boundary, then migrate route families in independently reviewable slices. Functional lists remain authoritative, media and maps remain progressive enhancement, and the final gate combines automated state coverage with human inspection of the exact built artifact.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, Tailwind CSS 4, Motion 12, `@repo/ui`, Base UI wrappers, MapLibre boundaries, Vitest, Playwright, Axe, Better Auth, and private PostgreSQL fixtures.

**Status:** ACTIVE — single frontend implementation authority
**Created:** 2026-07-15
**Reopened:** 2026-07-16 after full in-app-browser UI review
**Scope:** All 53 catalogue routes, their meaningful states, and desktop/tablet/mobile visual acceptance

## Global Constraints

- Rumia is Portugal-wide and activity-first. The core journey is `activity situation → judged results → detail → save → chosen day → shape day`.
- Do not add booking, accommodation search, a chatbot, visible AI positioning, or a map-first journey.
- Preserve the current Next.js, React, Tailwind, Motion, `@repo/ui`, Better Auth, commerce, content, and MapLibre boundaries. Add no UI framework.
- No database package/runtime, database schema, Better Auth, commerce API, or saved-day schema change is authorized. Test-only fixture rows are allowed; product schema expansion and pool/adapter changes are not.
- Preserve all existing user-owned dirty-worktree changes. Never reset, clean, broadly stage, or rewrite unrelated files. Before each task, record `git status --short`; stage only that task's exact paths.
- Keep media local and manifest-backed. Record creator, source URL, licence, crop, focal point, bytes, review date, and restrictions. “Free to use” is not “copyright-free”.
- Customer body text is at least 16px, metadata at least 12px, prose remains within 45–75 characters, and customer controls retain at least 44px targets.
- Normal text meets 4.5:1 contrast. Large text, focus indicators, keyboard order, landmarks, labels, and 200% zoom meet applicable WCAG 2.2 requirements.
- Controls use 120–220ms feedback motion; chapter entrances and crossfades use 450–800ms. No scrolljacking, forced tours, novelty cursors, or motion-dependent information.
- Reduced-motion, reduced-data, and low-power conditions remove autoplay, parallax, camera tours, smooth scrolling, and non-essential reveal motion.
- Non-map JavaScript remains at or below 700KB, initial transfer at or below 2.5MB, and measured route timing at or below 6s.
- Above-fold decorative video is at or below 750KB on mobile. Below-fold loops are at or below 1.5MB and load only near the viewport.
- At most one muted, inline, poster-backed, locally hosted autoplay loop may appear per route. Legal, auth, commerce, operator, and developer routes never autoplay.
- Map/list parity is mandatory. A map never hides decision data, starts a camera tour, or becomes the only way to understand a route consequence.
- Snapshot success is evidence, not aesthetic approval. Baselines may be refreshed only after explicit human inspection of the exact desktop and mobile captures.
- MapLibre Phase 2 storytelling, terrain, building extrusion, and richer 3D remain deferred under their separate approval packet.

### Scope and execution pre-flight

- **In scope:** shared scene/chrome/recovery foundations, all 53 catalogue entries, every supported route state, operator access convergence, four-viewport geometry/accessibility, 102 primary desktop/mobile baselines, and human visual approval.
- **Out of scope:** product/database/Auth schema changes, organization membership, booking or accommodation features, MapLibre Phase 2/3 or 3D, public deployment, and unrelated dirty-worktree cleanup.
- **Repository/workflow:** existing TypeScript monorepo; current execution mode is `solo-git` on the existing branch with task-scoped Conventional Commits. No task may broadly stage the checkout, open a release, or push without separate authorization.
- **Mechanical commands:** unit `pnpm test:unit`; build `pnpm build`; lint `pnpm lint`; application and Playwright typecheck `pnpm typecheck && pnpm --dir apps/web test:typecheck`; CI `.github/workflows/ci.yml`.
- **Hard gates:** Tasks 1–4 must pass before route slices; Task 14 must pass before operator page work; Task 17 non-visual proof and owner review must pass before snapshot refresh; deployment and deferred map work require separate approval.
- Tasks 1–4 are bounded foundations. Tasks 5–16 are user-visible vertical route-family slices, each ending in focused browser evidence and an independently revertible commit.

Working vocabulary is fixed: **Cover** is immersive acquisition/media; **Atlas** is Portugal collection or map context; **Decision** is choosing, comparing, sequencing, or shaping activities; **Utility** is quiet account, legal, commerce, recovery, and staff work; **chosen day** is the traveler-owned activity sequence; **unavailable** means a dependency cannot answer and must never masquerade as empty, anonymous, or forbidden.

---

## Why this plan is reopened

The July 16 browser review invalidated the earlier claim that only snapshot approval remained. The implementation is technically polished but visually incomplete:

- `AppLayout`, `PageShell`, and `PublicRouteLayout` let most pages fall through to the same linen/editorial surface.
- The contour field, dark-green rounded lead panel, rounded white cards, ochre micro-labels, and large repeated footer dominate unrelated routes.
- `RouteScene` exists, but its tone names do not yet create the four promised scene grammars and activity detail is its only production route consumer.
- Explore has an 8/4 shell, but the save interaction did not provide sufficiently visible browser feedback and the mobile chosen-day tray is not reliably evident.
- Activity detail puts the verdict, time, caveat, and save action below a media-dominated first viewport; the mobile save action is not persistent.
- Workspace's empty state is a large dark chapter rather than a compact decision canvas.
- How It Works, Local Expertise, Support, legal pages, and beta states remain variations of the repeated panel/card template.
- Itineraries, Vault, and Account repeat nearly the same saved-card plus dark-side-rail composition.
- Reviewer/admin pages are too sparse for high-density work, while console uses a separate shell and inconsistent responsive rules.
- The accepted mobile console-workspace baseline contains a very large blank white region, proving that a green snapshot run did not equal human acceptance.
- In the current no-database development runtime, sign-in, Itineraries, and Vault remain on streamed skeleton/error responses and Account can render a blank 500 shell. Recovery states must be deliberate and testable.
- `/console/*` and `/api/v1/docs` do not currently enforce the access/capability contract declared by the HTTP catalogue.
- `docs/audit/route-matrix.md` lists 51 routes, omits activity detail and feedback, and remains marked pending, while the source catalogue has 53 entries.

The review made no source-code changes. The existing dirty worktree remains the implementation baseline and belongs to the user.

### Dirty-worktree boundary recorded 2026-07-16

- Branch: `main`, three commits ahead of `origin/main` when this corrective plan was written.
- The checkout already contained extensive modified and untracked work across `apps/web`, `packages/ui`, `packages/spatial-engine`, documentation, media, tests, and visual snapshots.
- This planning and re-audit pass changes only this canonical plan, `docs/superpowers/PLAN-INDEX.md`, `specs/PLAN-AUDIT_LATEST.md`, and stale frontend-authority links in `docs/superpowers/plans/2026-07-10-rumia-activity-first-master.md`; it does not claim ownership of any pre-existing source, asset, screenshot, or progress-file change.
- Every implementation task must begin with a fresh `git status --short`, inspect overlapping diffs before editing, and stage only its listed paths. A new user edit to an overlapping path pauses that task for reconciliation.

## Definition of done

This plan is complete only when all of the following are true:

1. Every one of the 53 HTTP catalogue entries has one explicit presentation contract plus executable scenario records containing scenario ID, persona, state, fixture/setup, expected access/transition, and viewport evidence.
2. Cover, Atlas, Decision, and Utility are visually recognizable without reading route copy. Utility surfaces are texture-free.
3. The first viewport of every customer task contains its decision, next action, or honest recovery path; it never contains an accidental blank column or footer-heavy dead space.
4. Explore save/remove feedback, activity-detail save, Workspace sequence edits, planner choices, map/list controls, checkout decisions, and operator triage all visibly change state and announce the change.
5. Static, empty, loading, unavailable, unauthorized, error, saved, populated, conflict, and paid states are covered where the route can genuinely reach them.
6. The organization workspace remains unavailable without data disclosure until a separately authorized membership model exists; this plan does not fake an organization-authorized ready state.
7. Reviewer, admin, console, and developer routes share one authenticated operator shell and preserve their declared role/capability boundary.
8. All route families pass at 1440×1000, 1024×768, 768×1024, and 390×844 with no horizontal overflow, clipped controls, obscured content, or unreachable information.
9. The exact built artifact passes unit, typecheck, lint, build, assets, motion, accessibility, keyboard, zoom, reduced-preference, browser-console, performance, and route/state gates.
10. A human has inspected and approved desktop and mobile captures for every route family before snapshot baselines are replaced.

## Executable route-presentation contract

Legend: scene `Cover`, `Atlas`, `Decision`, `Utility`; footer `full`, `compact`, `utility`, `none`. Redirects render no shell or footer and inherit the destination's presentation contract only for catalogue auditing.

Utility scenes always use `data-surface-texture="none"`. Cover, Atlas, and Decision may use contour only inside an authored scene layer, never as the automatic outer page background.

### Customer and traveler routes

| Route | Scene | Footer / chrome | Required visual acceptance |
| --- | --- | --- | --- |
| `/` | Cover | full public | Full-bleed local cover, activity brief and exclusive CTA above fold; mobile poster crop keeps brief and CTA in the first viewport. |
| `/portugal` | Atlas | full public | Desktop dark atlas plus region navigation; mobile shows one featured collection followed by compact readable entries for every Portugal region. |
| `/explore` | Decision | none, task public | Desktop 8/4 results and sticky authored day rail; mobile list plus chosen-day tray after the first save. |
| `/explore/workspace` | Decision | none, immersive | Desktop activity sequence and day summary; mobile single-column sequence and compact summary; map is explicit and list-equivalent. |
| `/activities/[activityId]` | Cover | compact public | Place media occupies 55–65vh while verdict, duration, caveat, and save remain visible before evidence; mobile save is persistent without obscuring content. |
| `/feedback` | Utility | compact public | Selected-day context and focused feedback form; mobile controls are 44px and missing context produces one truthful recovery action. |
| `/how-it-works` | Cover | compact public | An asymmetric time → judgement → control → optional review sequence; mobile becomes four numbered chapters rather than four generic cards. |
| `/human-review` | redirect → Cover | none | 308 to `/local-expertise`; no intermediate page UI. |
| `/local-expertise` | Cover | full public | Fieldwork media, evidence, reviewer scope, boundaries, and one next action; mobile preserves the evidence order. |
| `/pricing` | Utility | compact public | Texture-free free-first comparison with a clearly perceptible static Portugal image; optional export/review appears after the recommended free activity-day preview. |
| `/planner` | Decision | none, immersive traveler | One-screen brief and live consequence rail; mobile is form-first with one primary decision at a time and a compact summary. |
| `/plan` | redirect → Decision | none | 308 to `/planner`; no intermediate page UI. |
| `/trip/new` | Decision | none, task traveler | Brief editor plus contextual still/summary; mobile presents the current section first and avoids an eleven-card uninterrupted stack. |
| `/trip/[tripId]` | Decision | none, task traveler | Editable activity sequence plus persistent day summary; mobile uses a compact context/action bar. |
| `/trip/[tripId]/map` | Atlas | none, immersive traveler | Desktop map/list controls and route warnings; mobile is list-first with an opt-in map drawer and full information parity. |
| `/trip/[tripId]/export` | Utility | utility traveler | Export formats, current status, delivery outcome, retry, and history are compact and explicit. |
| `/checkout` | Utility | utility traveler | No trip produces one coherent action; a valid trip shows summary, price/value, and optional refinement without competing tiers. |
| `/itineraries` | Utility | utility traveler | Searchable archive without the cloned dark side rail; no-saved-work and filtered empty states use authored inverse Decision panels with distinct recovery actions. |
| `/vault` | Utility | utility traveler | Assets/exports use clear covers, status, next action, list/grid behavior; no-assets uses an authored inverse Decision panel rather than a generic white card. |
| `/account` | Utility | utility traveler | Identity, saved work, consent/preferences, and sign-out are distinct sections rather than another archive clone. |
| `/logistics` | Decision | none, task traveler | Route preview and transport trade-offs remain list-authoritative; selection consequences stay visible. |
| `/expert-chat` | Utility | none, task traveler | Disabled, ineligible, and unavailable states are truthful; an eligible conversation keeps trip context and composer accessible. |
| `/sign-in` | Utility | none, auth | Texture-free form with a static Portugal crop, focused inline errors, sanitized recovery copy, and no autoplay. |
| `/support` | Utility | compact public | Wayfinding/topic index, visible recovery actions, contact boundary, and escalation expectations; no generic six-card wall. |
| `/privacy` | Utility | compact public | Readable document with sticky/collapsible contents navigation, restrained evidence, and no media or contour field. |
| `/terms` | Utility | compact public | Anchored legal document with summary rail and readable mobile disclosure. |
| `/sustainability` | Cover | compact public | Static landscape-led opening followed by measurable commitments and evidence; no video. |
| `/offline` | Utility | compact public | Offline status, cached options, retry, and safe next actions appear above fold. |

`/logistics` is an intentional review-driven supersession of the earlier generic “account, logistics, beta and B2B Utility” grouping. It actively compares transport choices and exposes time/cost/route consequences, so it uses the Decision grammar with task chrome. It remains texture-light, list-authoritative, video-free, and explicitly does not search bookings or accommodation. Account, beta, B2B, commerce, export, and archives remain Utility.

### Reviewer, admin, and console routes

All routes below are Utility scenes with no marketing footer, no ornamental texture, and authenticated operator chrome.

| Route | Required visual acceptance |
| --- | --- |
| `/reviewer/queue` | Sortable triage table and filters on desktop; priority cards preserving every queue action on mobile. |
| `/reviewer/history` | Filterable review log on desktop; chronological drill-in cards on mobile. |
| `/reviewer/profile` | Identity, capacity, regions, languages, and availability as compact sections. |
| `/reviewer/operations` | Workload metrics followed by an actionable queue rather than decorative whitespace. |
| `/reviewer/trips/[tripId]` | Evidence workspace with decision rail; mobile keeps sequential evidence and sticky approve/reject actions. |
| `/admin/places` | Searchable place table/editor; mobile cards and filter sheet without horizontal overflow. |
| `/admin/countries` | Country hierarchy and status table; compact mobile hierarchy. |
| `/admin/regions` | Parent-aware region table; mobile retains country context. |
| `/admin/partners` | Partner state/configuration table; mobile exposes state and actions. |
| `/admin/reviewers` | Capacity/assignment table; mobile keeps assignment actions. |
| `/admin/specialists` | Verification evidence and approve/reject controls in a dense triage flow. |
| `/admin/quality` | Quality metrics followed by actionable issue queue. |
| `/admin/analytics` | Chart grid and detail table with readable axes; mobile labels never clip. |
| `/console` | KPI/task landing with direct entry into the highest-priority work. |
| `/console/pipeline` | Multi-lane board on desktop; explicit lane switcher on mobile rather than a clipped wide canvas. |
| `/console/workspace` | Source/editor/validation split on desktop; pane tabs plus persistent validation state on mobile, with no blank-page tail. |
| `/console/messages` | Conversation list/thread/triage panes on desktop; list-to-thread drill-in and safe-area composer on mobile. |
| `/console/graph` | Graph plus query/details on desktop; equivalent query/list fallback on mobile. |
| `/console/metrics` | Truthful Portugal metrics and thresholds; mobile tables and trends remain readable. |
| `/console/config` | Diff, validation, deployment controls, confirmation, and outcome; mobile deploy action remains reachable. |

### Beta, organization, and developer routes

| Route | Scene | Footer / chrome | Required visual acceptance |
| --- | --- | --- | --- |
| `/guide` | Utility | utility traveler | Compact disabled/ineligible state or clear onboarding handoff; not a generic full-viewport dark panel. |
| `/guide/onboarding` | Utility | utility traveler | Authenticated form sections, progress, save, validation, and unavailable recovery. |
| `/b2b` | Utility | compact public | Concise eligibility/private-beta gateway with one return or interest action. |
| `/b2b/[orgSlug]` | Utility | none, task traveler | Disabled, signed-out, and unavailable states disclose no organization data. Ready remains blocked until membership authority exists. |
| `/api/v1/docs` | Utility | none, operator | Authenticated/capability-gated endpoint navigation, prose, code, and responsive parameter rows. |

## Required state matrix

| Route family | States that must be proven |
| --- | --- |
| Static public (`/`, Portugal, explanatory, legal) | ready, loading shell, offline/system recovery, not-found link recovery; media fallback/reduced preferences where media exists. |
| Explore | results, no reviewed match, save in progress, saved, removed, one selection, multiple selections, URL restoration, compact mobile tray. |
| Activity detail | unsaved, saved, removed, invalid activity/not-found, poster fallback, reduced preferences. |
| Workspace | empty, one selection, multiple selections, duplicate query input, invalid ID, conflict/travel warning, saved handoff, map unavailable/list equivalent. |
| Sign-in/recovery | anonymous ready, invalid credentials, stale/legacy query sanitization, loading, database/configuration unavailable, retry, signed-in redirect. |
| Planner/trip creation | initial, each selected choice, validation failure, navigation pending, navigation failure, restored query state, mobile section switching. |
| Persisted trip/map/export | unauthorized, not-found, loading, empty, one stop, multiple stops, selected stop, conflict, saved, paid/reviewed where supported, export pending/success/failure. |
| Itineraries/Vault/Account/Logistics | empty, populated, filtered empty, loading, unavailable, recovery; selected logistics consequence. |
| Checkout | no trip, draft trip, eligible refinement, paid/complete, unavailable; no partial checkout without a trip. |
| Guide/Expert Chat/B2B | feature disabled, signed out, ineligible, unavailable, authorized ready only where current data contracts support it. Organization ready is explicitly excluded. |
| Reviewer/admin/console/API docs | anonymous redirect, authenticated without capability/forbidden, empty, populated, loading, recoverable error, mobile triage. |

## File structure and ownership

Create or extend the following focused units before route migration:

- `apps/web/lib/routes/route-presentation-catalogue.ts` — the only route-to-scene/footer/chrome manifest and the co-located executable scenario catalogue.
- `apps/web/lib/routes/route-presentation-catalogue.test.ts` — parity, redirect inheritance, texture, footer, and state assertions.
- `apps/web/playwright/visual-state-matrix.ts` — resolves manifest fixtures to concrete test URLs and personas.
- `apps/web/playwright/tests/route-scenes.spec.ts` — asserts rendered scene/chrome markers and redirects at all four viewports.
- `apps/web/playwright/tests/operator-responsive.spec.ts` — targeted reviewer/admin/console responsive task assertions.
- `apps/web/app/global-error.tsx` — root-document recovery when the normal segment boundary cannot render.
- `apps/web/app/_components/route-recovery.tsx` — shared texture-free system recovery composition built on `DecisionStatePanel`.
- `apps/web/lib/auth/session-outcome.ts` — typed UI-safe session availability wrapper; it does not change Better Auth.
- `apps/web/app/console/_components/console-mobile-view-switcher.tsx` — accessible pane/lane switching for mobile console routes.

Modify these shared boundaries before route-specific cleanup:

- `apps/web/lib/routes/http-route-catalogue.ts`
- `apps/web/playwright/route-matrix.ts`
- `scripts/generate-route-matrix.mjs`
- `docs/audit/route-matrix.md`
- `packages/ui/src/components/app-layout.tsx`
- `packages/ui/src/components/shell.tsx`
- `packages/ui/src/components/operator-shell.tsx`
- `packages/ui/src/components/decision-state-panel.tsx`
- `apps/web/app/_components/route-scene.tsx`
- `apps/web/app/_components/public-route-layout.tsx`
- `apps/web/app/_components/site-footer.tsx`
- `apps/web/app/(marketing)/layout.tsx`
- `apps/web/app/(app)/trip/layout.tsx`
- `apps/web/app/globals.css`
- `packages/ui/src/styles.css`

Do not delete legacy route CSS or components until the final consumer has migrated and the full route/state gate passes.

---

## Implementation tasks

### Task 1: Make the route-presentation catalogue executable

**Files:**

- Create: `apps/web/lib/routes/route-presentation-catalogue.ts`
- Create: `apps/web/lib/routes/route-presentation-catalogue.test.ts`
- Create: `apps/web/playwright/tests/corrective-baseline.spec.ts`
- Create: `docs/reviews/2026-07-16-rumia-corrective-baseline.md`
- Modify: `apps/web/lib/routes/http-route-catalogue.ts`
- Modify: `apps/web/lib/routes/http-route-catalogue.test.ts`
- Modify: `apps/web/playwright/route-matrix.ts`
- Modify: `apps/web/playwright/route-matrix.test.ts`
- Modify: `apps/web/playwright.config.ts`
- Modify: `scripts/generate-route-matrix.mjs`
- Modify: `docs/audit/route-matrix.md`

**Interfaces:**

- Produces `HttpRoutePath`, `RouteSceneContract`, `RouteVisualState`, `RouteVisualScenario`, `RouteFixture`, `ROUTE_PRESENTATION_CATALOGUE`, and `ROUTE_SCENARIO_CATALOGUE`.
- Every later task consumes the manifest; route pages expose matching `data-scene`, `data-shell`, `data-footer-mode`, and `data-surface-texture` markers.

- [ ] **Step 1: Capture the exact current artifact before changing route or UI source**

Before creating the evidence test, record `git rev-parse HEAD`, `git status --short --branch`, and a SHA-256 of that exact status output in the review notes. Then create `corrective-baseline.spec.ts` as evidence-only test code. It reads the current `HTTP_ROUTE_CATALOGUE` without modifying it, resolves the existing activity/traveler/reviewer/admin/B2B fixtures, and captures each currently rendered route at 1440×1000 and 390×844. The 2 redirect entries record status and destination rather than a meaningless intermediate screenshot. For each of the 51 rendered routes record response/status, final URL, persona, viewport, visible H1 count, main count, document width, console/page errors, media/font requests, and screenshot path under `.sisyphus/evidence/rumia-corrective-baseline/<route>/<viewport>.png`.

Use only one Playwright project and loop the two explicit viewports inside the test so the existing `webServer` builds once, starts one standalone process, and tears it down once. Do not call `--update-snapshots`; these are immutable review captures, not accepted baselines. The capture may record visual or runtime failures, but it must not silently omit a route. If the test database/persona setup cannot run, stop before UI edits and record that blocker rather than substituting the development server.

- [ ] **Step 2: Run provenance checks and freeze the baseline report**

```bash
pnpm exec vitest run apps/web/content/font-provenance.test.ts apps/web/content/cinematic-media-manifest.test.ts apps/web/lib/routes/http-route-catalogue.test.ts
pnpm qa:assets
DATABASE_URL='postgresql://rumia_app:build@127.0.0.1:5432/rumia' BETTER_AUTH_SECRET='baseline-only-secret-that-is-at-least-32-characters' NEXT_PUBLIC_APP_URL='http://127.0.0.1:3105' pnpm --dir apps/web exec playwright test playwright/tests/corrective-baseline.spec.ts --config playwright.config.ts --project desktop-1440 --workers=1
```

Write `docs/reviews/2026-07-16-rumia-corrective-baseline.md` with current HEAD, dirty-status hash, build ID, 53-route inventory, 51 desktop/mobile capture pairs, 2 redirect records, current state/persona availability, provenance results, console/runtime failures, and the July 16 design findings that caused reopening. This report is immutable before/after evidence and does not approve any screenshot.

- [ ] **Step 3: Preserve literal HTTP route paths and write the failing parity test**

```ts
// apps/web/lib/routes/http-route-catalogue.ts
// Replace the current declaration line:
export const HTTP_ROUTE_CATALOGUE = [

// Replace the current final `];` after the `/api/v1/docs` record with:
] as const satisfies readonly HttpRouteDefinition[];

export type HttpRoutePath = (typeof HTTP_ROUTE_CATALOGUE)[number]["path"];
```

```ts
// apps/web/lib/routes/route-presentation-catalogue.test.ts
import { describe, expect, it } from "vitest";
import { HTTP_ROUTE_CATALOGUE } from "./http-route-catalogue";
import { ROUTE_PRESENTATION_CATALOGUE, ROUTE_SCENARIO_CATALOGUE } from "./route-presentation-catalogue";

describe("route presentation catalogue", () => {
  it("covers every HTTP route exactly once", () => {
    expect(Object.keys(ROUTE_PRESENTATION_CATALOGUE).sort()).toEqual(
      HTTP_ROUTE_CATALOGUE.map((route) => route.path).sort()
    );
  });

  it("keeps utility and operator routes texture-free", () => {
    for (const [path, route] of Object.entries(ROUTE_PRESENTATION_CATALOGUE)) {
      if (route.scene === "utility" || route.shell === "operator") {
        expect(route.texture, path).toBe("none");
      }
    }
  });

  it("renders no footer for redirects, immersive tasks, or operators", () => {
    for (const [path, route] of Object.entries(ROUTE_PRESENTATION_CATALOGUE)) {
      if (route.redirectTo || route.shell === "operator" || route.chrome === "immersive") {
        expect(route.footerMode, path).toBe("none");
      }
    }
  });

  it("materializes every state obligation as a concrete scenario", () => {
    expect(Object.keys(ROUTE_SCENARIO_CATALOGUE).sort()).toEqual(
      HTTP_ROUTE_CATALOGUE.map((route) => route.path).sort()
    );
    for (const [path, route] of Object.entries(ROUTE_PRESENTATION_CATALOGUE)) {
      const scenarios = ROUTE_SCENARIO_CATALOGUE[path as keyof typeof ROUTE_SCENARIO_CATALOGUE];
      expect([...new Set(scenarios.map((scenario) => scenario.state))].sort(), path)
        .toEqual([...route.states].sort());
      expect(scenarios.filter((scenario) => scenario.viewports === "all-four"), path)
        .toHaveLength(1);
    }
  });

  it("covers protected access and resource non-disclosure", () => {
    for (const route of HTTP_ROUTE_CATALOGUE) {
      const scenarios = ROUTE_SCENARIO_CATALOGUE[route.path as keyof typeof ROUTE_SCENARIO_CATALOGUE];
      if (route.auth !== "public") {
        expect(scenarios.some((scenario) => scenario.persona === "anonymous" && scenario.state === "unauthorized"), route.path).toBe(true);
      }
      if (route.path.includes("[tripId]")) {
        expect(scenarios.some((scenario) => scenario.persona === "foreign-traveler" && scenario.expected.noPrivateDisclosure), route.path).toBe(true);
      }
    }
    for (const path of ["/checkout", "/logistics", "/expert-chat"] as const) {
      expect(ROUTE_SCENARIO_CATALOGUE[path].some((scenario) => scenario.persona === "foreign-traveler" && scenario.expected.noPrivateDisclosure), path).toBe(true);
    }
  });
});
```

- [ ] **Step 4: Run the focused test and confirm the missing catalogue failure**

Run: `pnpm exec vitest run apps/web/lib/routes/route-presentation-catalogue.test.ts`

Expected: FAIL because `route-presentation-catalogue.ts` does not exist.

- [ ] **Step 5: Implement the typed contract and all 53 entries**

```ts
// apps/web/lib/routes/route-presentation-catalogue.ts
import type { SiteFooterMode } from "@/app/_components/site-footer";
import type { RouteSceneTone } from "@/app/_components/route-scene";
import type { HttpRoutePath } from "./http-route-catalogue";

export type RouteVisualState =
  | "ready" | "loading" | "empty" | "unavailable" | "unauthorized"
  | "forbidden" | "error" | "not-found" | "saved" | "populated"
  | "filtered-empty" | "conflict" | "paid" | "redirect" | "removed"
  | "disabled" | "ineligible" | "pending" | "selected"
  | "one-selection" | "multiple-selection";

export type RouteFixture =
  | { kind: "static"; path: string }
  | { kind: "activity"; activityId: "porto-ribeira-slow-walk" }
  | { kind: "traveler-trip"; suffix: "" | "/map" | "/export" }
  | { kind: "reviewer-trip" }
  | { kind: "organization"; slug: "e2e-organization" };

export type RouteSceneContract = {
  scene: RouteSceneTone | "redirect";
  shell: "public" | "traveler" | "operator" | "none";
  chrome: "public" | "task" | "immersive" | "operator" | "none";
  footerMode: SiteFooterMode;
  texture: "editorial" | "none";
  fixture: RouteFixture;
  states: readonly RouteVisualState[];
  redirectTo?: HttpRoutePath;
};

const staticRoute = (path: HttpRoutePath): RouteFixture => ({ kind: "static", path });
const publicReady = ["ready", "loading", "error"] as const;
const utilityStates = ["unauthorized", "empty", "populated", "filtered-empty", "loading", "unavailable", "error"] as const;
const operatorStates = ["unauthorized", "forbidden", "empty", "populated", "loading", "unavailable", "error"] as const;

export const ROUTE_PRESENTATION_CATALOGUE = {
  "/": { scene: "cover", shell: "public", chrome: "public", footerMode: "full", texture: "none", fixture: staticRoute("/"), states: publicReady },
  "/portugal": { scene: "atlas", shell: "public", chrome: "public", footerMode: "full", texture: "none", fixture: staticRoute("/portugal"), states: publicReady },
  "/explore": { scene: "decision", shell: "public", chrome: "task", footerMode: "none", texture: "none", fixture: staticRoute("/explore"), states: ["ready", "empty", "loading", "one-selection", "multiple-selection", "saved", "removed", "error"] },
  "/explore/workspace": { scene: "decision", shell: "none", chrome: "immersive", footerMode: "none", texture: "none", fixture: staticRoute("/explore/workspace"), states: ["empty", "one-selection", "multiple-selection", "loading", "conflict", "saved", "unavailable", "not-found", "error"] },
  "/activities/[activityId]": { scene: "cover", shell: "public", chrome: "task", footerMode: "compact", texture: "none", fixture: { kind: "activity", activityId: "porto-ribeira-slow-walk" }, states: ["ready", "loading", "saved", "removed", "not-found", "error"] },
  "/feedback": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/feedback"), states: ["ready", "empty", "loading", "saved", "unavailable", "error"] },
  "/how-it-works": { scene: "cover", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/how-it-works"), states: publicReady },
  "/human-review": { scene: "redirect", shell: "none", chrome: "none", footerMode: "none", texture: "none", fixture: staticRoute("/human-review"), states: ["redirect"], redirectTo: "/local-expertise" },
  "/local-expertise": { scene: "cover", shell: "public", chrome: "public", footerMode: "full", texture: "none", fixture: staticRoute("/local-expertise"), states: publicReady },
  "/pricing": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/pricing"), states: publicReady },
  "/planner": { scene: "decision", shell: "traveler", chrome: "immersive", footerMode: "none", texture: "none", fixture: staticRoute("/planner"), states: ["ready", "loading", "saved", "error"] },
  "/plan": { scene: "redirect", shell: "none", chrome: "none", footerMode: "none", texture: "none", fixture: staticRoute("/plan"), states: ["redirect"], redirectTo: "/planner" },
  "/trip/new": { scene: "decision", shell: "traveler", chrome: "task", footerMode: "none", texture: "none", fixture: staticRoute("/trip/new"), states: ["unauthorized", "ready", "loading", "saved", "error"] },
  "/trip/[tripId]": { scene: "decision", shell: "traveler", chrome: "task", footerMode: "none", texture: "none", fixture: { kind: "traveler-trip", suffix: "" }, states: ["unauthorized", "not-found", "empty", "one-selection", "multiple-selection", "loading", "conflict", "saved", "error"] },
  "/trip/[tripId]/map": { scene: "atlas", shell: "traveler", chrome: "immersive", footerMode: "none", texture: "none", fixture: { kind: "traveler-trip", suffix: "/map" }, states: ["unauthorized", "empty", "one-selection", "multiple-selection", "selected", "loading", "conflict", "unavailable", "error"] },
  "/trip/[tripId]/export": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: { kind: "traveler-trip", suffix: "/export" }, states: ["unauthorized", "empty", "loading", "pending", "saved", "error"] },
  "/checkout": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/checkout"), states: ["unauthorized", "not-found", "empty", "ready", "loading", "paid", "unavailable", "error"] },
  "/itineraries": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/itineraries"), states: utilityStates },
  "/vault": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/vault"), states: utilityStates },
  "/account": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/account"), states: utilityStates },
  "/logistics": { scene: "decision", shell: "traveler", chrome: "task", footerMode: "none", texture: "none", fixture: staticRoute("/logistics"), states: ["unauthorized", "not-found", "empty", "ready", "selected", "loading", "saved", "unavailable", "error"] },
  "/expert-chat": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "none", texture: "none", fixture: staticRoute("/expert-chat"), states: ["unauthorized", "not-found", "disabled", "ineligible", "empty", "ready", "loading", "saved", "unavailable", "error"] },
  "/sign-in": { scene: "utility", shell: "none", chrome: "none", footerMode: "none", texture: "none", fixture: staticRoute("/sign-in"), states: ["ready", "loading", "unavailable", "error", "redirect"] },
  "/support": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/support"), states: publicReady },
  "/privacy": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/privacy"), states: publicReady },
  "/terms": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/terms"), states: publicReady },
  "/sustainability": { scene: "cover", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/sustainability"), states: publicReady },
  "/offline": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/offline"), states: ["ready", "unavailable", "error"] },
  "/reviewer/queue": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/reviewer/queue"), states: operatorStates },
  "/reviewer/history": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/reviewer/history"), states: operatorStates },
  "/reviewer/profile": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/reviewer/profile"), states: operatorStates },
  "/reviewer/operations": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/reviewer/operations"), states: operatorStates },
  "/reviewer/trips/[tripId]": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: { kind: "reviewer-trip" }, states: operatorStates },
  "/admin/places": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/places"), states: operatorStates },
  "/admin/countries": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/countries"), states: operatorStates },
  "/admin/regions": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/regions"), states: operatorStates },
  "/admin/partners": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/partners"), states: operatorStates },
  "/admin/reviewers": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/reviewers"), states: operatorStates },
  "/admin/specialists": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/specialists"), states: operatorStates },
  "/admin/quality": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/quality"), states: operatorStates },
  "/admin/analytics": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/analytics"), states: operatorStates },
  "/console": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/console"), states: operatorStates },
  "/console/pipeline": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/console/pipeline"), states: operatorStates },
  "/console/workspace": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/console/workspace"), states: operatorStates },
  "/console/messages": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/console/messages"), states: operatorStates },
  "/console/graph": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/console/graph"), states: operatorStates },
  "/console/metrics": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/console/metrics"), states: operatorStates },
  "/console/config": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/console/config"), states: operatorStates },
  "/guide": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/guide"), states: ["unauthorized", "disabled", "ineligible", "unavailable", "ready", "error"] },
  "/guide/onboarding": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/guide/onboarding"), states: ["unauthorized", "disabled", "ineligible", "unavailable", "ready", "loading", "saved", "error"] },
  "/b2b": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/b2b"), states: ["ready", "disabled", "ineligible", "unavailable", "error"] },
  "/b2b/[orgSlug]": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "none", texture: "none", fixture: { kind: "organization", slug: "e2e-organization" }, states: ["unauthorized", "disabled", "ineligible", "unavailable", "error"] },
  "/api/v1/docs": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/api/v1/docs"), states: ["unauthorized", "forbidden", "disabled", "ready", "loading", "unavailable", "error"] }
} as const satisfies Record<HttpRoutePath, RouteSceneContract>;
```

- [ ] **Step 6: Add concrete scenario records; do not execute the string state list directly**

`ROUTE_PRESENTATION_CATALOGUE[path].states` is the review obligation list. `ROUTE_SCENARIO_CATALOGUE[path]` is the executable source for Playwright and must contain one concrete record for every listed state. A route-wide fixture is only the primary default; each scenario owns its actual persona and fixture/setup.

```ts
export type RoutePersona =
  | "public" | "anonymous" | "traveler" | "foreign-traveler"
  | "reviewer" | "admin" | "limited-admin" | "specialist-candidate";

export type RouteFeatureFlag =
  | "ENABLE_OPERATOR_CONSOLE" | "ENABLE_CONSOLE_CONFIG" | "ENABLE_API_DOCS"
  | "ENABLE_GUIDE_BETA" | "ENABLE_TRIP_MESSAGING" | "ENABLE_B2B_BETA";

export type ScenarioFixture =
  | RouteFixture
  | { kind: "traveler-trip"; variant: "draft" | "paid-reviewed" | "foreign"; suffix: "" | "/map" | "/export" }
  | { kind: "reviewer-trip"; variant: "assigned" | "completed" | "unassigned" }
  | { kind: "specialist"; variant: "new" | "draft" | "saved" }
  | { kind: "operator"; variant: "empty" | "populated" };

export type RouteVisualScenario = {
  id: string;
  state: RouteVisualState;
  persona: RoutePersona;
  fixture: ScenarioFixture;
  setup?: {
    query?: Readonly<Record<string, string>>;
    provider?: "ready" | "missing-config" | "unreachable";
    flags?: Partial<Record<RouteFeatureFlag, boolean>>;
    interaction?: "save" | "remove" | "select" | "filter" | "send" | "retry";
    preferences?: { reducedMotion?: true; reducedData?: true; lowPower?: true };
  };
  expected: {
    access: "render" | "redirect" | "not-found";
    transition?: string;
    noPrivateDisclosure?: true;
  };
  viewports: "all-four" | "desktop-mobile";
};
```

The full source file must list all 53 keys. Reusable builders may materialize repetitive public and operator records, but they must return concrete `RouteVisualScenario` objects—never only state strings. Complex routes are explicit. For example:

```ts
const checkoutScenarios: readonly RouteVisualScenario[] = [
  { id: "checkout--anonymous", state: "unauthorized", persona: "anonymous", fixture: staticRoute("/checkout"), expected: { access: "redirect", noPrivateDisclosure: true }, viewports: "desktop-mobile" },
  { id: "checkout--no-trip", state: "empty", persona: "traveler", fixture: staticRoute("/checkout"), expected: { access: "render" }, viewports: "all-four" },
  { id: "checkout--foreign-trip", state: "not-found", persona: "foreign-traveler", fixture: { kind: "traveler-trip", variant: "foreign", suffix: "" }, setup: { query: { trip: "fixture:foreign" } }, expected: { access: "not-found", noPrivateDisclosure: true }, viewports: "desktop-mobile" },
  { id: "checkout--draft", state: "ready", persona: "traveler", fixture: { kind: "traveler-trip", variant: "draft", suffix: "" }, setup: { query: { trip: "fixture:draft" } }, expected: { access: "render" }, viewports: "desktop-mobile" },
  { id: "checkout--paid", state: "paid", persona: "traveler", fixture: { kind: "traveler-trip", variant: "paid-reviewed", suffix: "" }, setup: { query: { trip: "fixture:paid-reviewed" } }, expected: { access: "render" }, viewports: "desktop-mobile" },
  { id: "checkout--provider-unavailable", state: "unavailable", persona: "traveler", fixture: staticRoute("/checkout"), setup: { provider: "unreachable" }, expected: { access: "render" }, viewports: "desktop-mobile" }
];

const expertChatScenarios: readonly RouteVisualScenario[] = [
  { id: "expert-chat--anonymous", state: "unauthorized", persona: "anonymous", fixture: staticRoute("/expert-chat"), expected: { access: "redirect", noPrivateDisclosure: true }, viewports: "desktop-mobile" },
  { id: "expert-chat--disabled", state: "disabled", persona: "traveler", fixture: staticRoute("/expert-chat"), setup: { flags: { ENABLE_TRIP_MESSAGING: false } }, expected: { access: "render" }, viewports: "desktop-mobile" },
  { id: "expert-chat--no-trip", state: "empty", persona: "traveler", fixture: staticRoute("/expert-chat"), setup: { flags: { ENABLE_TRIP_MESSAGING: true } }, expected: { access: "render" }, viewports: "all-four" },
  { id: "expert-chat--foreign-trip", state: "not-found", persona: "foreign-traveler", fixture: { kind: "traveler-trip", variant: "foreign", suffix: "" }, setup: { query: { trip: "fixture:foreign" } }, expected: { access: "redirect", noPrivateDisclosure: true }, viewports: "desktop-mobile" },
  { id: "expert-chat--ineligible", state: "ineligible", persona: "traveler", fixture: { kind: "traveler-trip", variant: "draft", suffix: "" }, setup: { query: { trip: "fixture:draft" } }, expected: { access: "render" }, viewports: "desktop-mobile" },
  { id: "expert-chat--ready", state: "ready", persona: "traveler", fixture: { kind: "traveler-trip", variant: "paid-reviewed", suffix: "" }, setup: { query: { trip: "fixture:paid-reviewed" } }, expected: { access: "render" }, viewports: "desktop-mobile" },
  { id: "expert-chat--sending", state: "loading", persona: "traveler", fixture: { kind: "traveler-trip", variant: "paid-reviewed", suffix: "" }, setup: { query: { trip: "fixture:paid-reviewed" }, interaction: "send" }, expected: { access: "render", transition: "composer announces sending" }, viewports: "desktop-mobile" },
  { id: "expert-chat--saved", state: "saved", persona: "traveler", fixture: { kind: "traveler-trip", variant: "paid-reviewed", suffix: "" }, setup: { query: { trip: "fixture:paid-reviewed" }, interaction: "send" }, expected: { access: "render", transition: "message appears once and composer clears" }, viewports: "desktop-mobile" },
  { id: "expert-chat--send-error", state: "error", persona: "traveler", fixture: { kind: "traveler-trip", variant: "paid-reviewed", suffix: "" }, setup: { query: { trip: "fixture:paid-reviewed" }, interaction: "send" }, expected: { access: "render", transition: "draft is retained and retry is offered" }, viewports: "desktop-mobile" }
];
```

Scenario builders must enforce these invariants in tests:

- Every route has exactly one primary scenario with `viewports: "all-four"`; redirects use their redirect scenario as primary.
- Every `states` value has at least one scenario and every scenario state is declared by the route.
- Every `auth !== "public"` route has an anonymous redirect/no-disclosure scenario.
- Dynamic owner routes and owner routes accepting a trip-resource query have a foreign-resource not-found/no-disclosure scenario; account-like routes without a resource parameter do not invent one.
- Operator routes have anonymous, wrong-role or limited-capability, authorized empty/populated, loading, unavailable, and error scenarios.
- Guide onboarding uses the `specialist-candidate` persona with separate `new`, `draft`, and `saved` fixtures.
- Guide, Expert Chat, B2B, Console, Config, and API docs record feature flags explicitly.
- Organization scenarios never include `ready` and never resolve organization data.

```ts
export const ROUTE_SCENARIO_CATALOGUE = {
  // All 53 literal HttpRoutePath keys are required here. Family builders return
  // RouteVisualScenario objects with stable IDs; complex arrays such as
  // checkoutScenarios and expertChatScenarios are supplied directly.
  "/checkout": checkoutScenarios,
  "/expert-chat": expertChatScenarios
  // The parity test fails until the other 51 keys are supplied.
} satisfies Record<HttpRoutePath, readonly RouteVisualScenario[]>;
```

The two-entry red-state example is intentional test-first code, not a final implementation placeholder: Step 5 must fail with 51 missing keys, and the implementation step fills those keys from the route/state obligations above before the task can pass.

- [ ] **Step 7: Generate a truthful route/state matrix from the scenario catalogue**

Change `RouteMatrixRow` to carry the complete `RouteVisualScenario`, preserve redirect assertions, and write `docs/audit/route-matrix.md` from `ROUTE_SCENARIO_CATALOGUE`. Every rendered route's primary state runs at all four viewports. Every additional state runs at desktop-1440 and mobile-390; add tablet coverage only when that state has a breakpoint-specific layout. Fixture-token and query resolution belongs in `visual-state-matrix.ts`, not in page code. This keeps the matrix exhaustive without multiplying every edge state into four identical captures.

- [ ] **Step 8: Establish the four viewport projects before route work**

```ts
projects: [
  { name: "desktop-1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
  { name: "tablet-landscape", use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 768 } } },
  { name: "tablet-portrait", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
  { name: "mobile-390", use: { ...devices["Pixel 5"], viewport: { width: 390, height: 844 } } }
]
```

Keep `workers: 1` and `fullyParallel: false`. Route-family commands in Tasks 5–16 run against these four projects unless they explicitly scope a desktop/mobile visual candidate. This configuration is a foundation dependency, not a final-gate afterthought.

- [ ] **Step 9: Run the catalogue and matrix tests**

Run: `pnpm exec vitest run apps/web/lib/routes/http-route-catalogue.test.ts apps/web/lib/routes/route-presentation-catalogue.test.ts apps/web/playwright/route-matrix.test.ts apps/web/lib/routes/redirects.test.ts && pnpm typecheck && pnpm --dir apps/web test:typecheck`

Expected: PASS with 53 presentation keys, 53 scenario keys, 2 redirects, stable unique scenario IDs, no missing state obligations, and no unresolved fixture/query tokens.

- [ ] **Step 10: Commit baseline evidence and authority files**

```bash
git add apps/web/playwright/tests/corrective-baseline.spec.ts docs/reviews/2026-07-16-rumia-corrective-baseline.md apps/web/lib/routes/http-route-catalogue.ts apps/web/lib/routes/http-route-catalogue.test.ts apps/web/lib/routes/route-presentation-catalogue.ts apps/web/lib/routes/route-presentation-catalogue.test.ts apps/web/playwright/route-matrix.ts apps/web/playwright/route-matrix.test.ts apps/web/playwright.config.ts scripts/generate-route-matrix.mjs docs/audit/route-matrix.md
git commit -m "test(frontend): make route presentation contracts executable"
```

### Task 2: Finish fonts, media, navigation, and explicit route frames

**Files:**

- Modify: `apps/web/app/_components/route-scene.tsx`
- Modify: `apps/web/app/_components/route-scene.test.tsx`
- Modify: `apps/web/app/_components/public-route-layout.tsx`
- Modify: `apps/web/app/_components/public-route-layout.test.tsx`
- Modify: `apps/web/app/_components/site-footer.tsx`
- Modify: `apps/web/app/_components/site-footer.test.tsx`
- Modify: `apps/web/app/_components/top-nav.tsx`
- Modify: `apps/web/app/_components/top-nav.test.tsx`
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/content/font-provenance.json`
- Modify: `apps/web/content/font-provenance.test.ts`
- Reconcile and include: `apps/web/public/fonts/newsreader/Newsreader-Variable.ttf`
- Reconcile and include: `apps/web/public/fonts/source-sans-3/SourceSans3-Variable.ttf`
- Reconcile and include: `apps/web/public/fonts/ibm-plex-mono/IBMPlexMono-Regular.ttf`
- Reconcile and include: `apps/web/public/fonts/ibm-plex-mono/IBMPlexMono-Medium.ttf`
- Reconcile and include: `apps/web/public/fonts/ibm-plex-mono/IBMPlexMono-SemiBold.ttf`
- Reconcile and include: `apps/web/public/fonts/licenses/Newsreader-OFL.txt`
- Reconcile and include: `apps/web/public/fonts/licenses/SourceSans3-OFL.txt`
- Reconcile and include: `apps/web/public/fonts/licenses/IBMPlexMono-OFL.txt`
- Modify: `apps/web/content/cinematic-media-manifest.ts`
- Modify: `apps/web/content/cinematic-media-manifest.test.ts`
- Modify: `apps/web/content/asset-manifest.json`
- Modify: `packages/ui/src/components/cinematic-media.tsx`
- Modify: `packages/ui/src/components/cinematic-media.test.tsx`
- Modify: `packages/ui/src/lib/media-preferences.ts`
- Modify: `packages/ui/src/lib/media-preferences.test.ts`
- Modify: `packages/ui/src/components/app-layout.tsx`
- Modify: `packages/ui/src/components/app-layout.test.tsx`
- Modify: `packages/ui/src/components/shell.tsx`
- Modify: `packages/ui/src/components/shell.test.tsx`
- Modify: `packages/ui/src/styles.css`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/app/(marketing)/layout.tsx`
- Modify: `apps/web/app/(marketing)/page.tsx`
- Modify: `apps/web/app/(marketing)/portugal/page.tsx`
- Modify: `apps/web/app/(marketing)/explore/page.tsx`
- Modify: `apps/web/app/(marketing)/explore/workspace/page.tsx`
- Modify: `apps/web/app/(marketing)/activities/[activityId]/page.tsx`
- Modify: `apps/web/app/(marketing)/feedback/page.tsx`
- Modify: `apps/web/app/(marketing)/how-it-works/page.tsx`
- Modify: `apps/web/app/(marketing)/local-expertise/page.tsx`
- Modify: `apps/web/app/(marketing)/pricing/page.tsx`
- Modify: `apps/web/app/(app)/account/layout.tsx`
- Modify: `apps/web/app/(app)/trip/layout.tsx`
- Modify: `apps/web/app/support/layout.tsx`
- Modify: `apps/web/app/sign-in/page.tsx`
- Modify: `apps/web/app/itineraries/page.tsx`
- Modify: `apps/web/app/checkout/page.tsx`
- Modify: `apps/web/app/guide/onboarding/page.tsx`
- Modify: `apps/web/app/_components/legal-page.tsx`
- Modify: `apps/web/app/b2b/[orgSlug]/page.tsx`
- Modify: `apps/web/app/_components/beta-unavailable.tsx`
- Modify: `apps/web/app/logistics/page.tsx`
- Modify: `apps/web/app/expert-chat/page.tsx`
- Modify: `apps/web/app/expert-chat/_components/expert-chat.tsx`
- Modify: `apps/web/app/vault/page.tsx`
- Modify: `apps/web/app/offline/page.tsx`

**Interfaces:**

- `AppLayout` produces explicit `data-surface` and `data-surface-texture` markers.
- `PublicRouteLayout` requires `scene`, `surfaceTone`, `surfaceTexture`, and `footerMode`; no public caller falls through to linen/editorial defaults.
- `RouteScene` produces the scene landmark and one declared focal layer while allowing route-authored composition.
- Local OFL fonts remain `Newsreader Variable`, `Source Sans 3 Variable`, and `IBM Plex Mono`, with system fallbacks and licence/provenance files verified in tests; no font request leaves the origin.
- Public navigation is exactly `Portugal`, `How it works`, `Local expertise`, `Pricing`, plus one primary `What is worth doing?` action to `/explore`.
- `CinematicMedia` preserves the current MP4 `src` caller while adding optional mobile/WebM sources, near-viewport attachment, offscreen/document-hidden pause, poster-only reduced-preference behavior, and explicit desktop/mobile text-safe zones.

- [ ] **Step 1: Write failing explicit-surface and scene tests**

```tsx
it("requires an explicit public presentation", () => {
  render(
    <PublicRouteLayout
      scene="utility"
      surfaceTone="linen"
      surfaceTexture="none"
      footerMode="compact"
    >
      <p>Document</p>
    </PublicRouteLayout>
  );
  const layout = screen.getByTestId("public-route-layout");
  expect(layout).toHaveAttribute("data-scene", "utility");
  expect(layout).toHaveAttribute("data-surface-texture", "none");
  expect(layout).toHaveAttribute("data-footer-mode", "compact");
});

it.each(["cover", "atlas", "decision", "utility"] as const)(
  "renders a recognizable %s scene marker",
  (tone) => {
    render(<RouteScene tone={tone} focalLayer="typography">Scene</RouteScene>);
    expect(screen.getByTestId("route-scene")).toHaveAttribute("data-tone", tone);
    expect(screen.getByTestId("route-scene")).toHaveAttribute("data-focal-layer", "typography");
  }
);

it("renders one exclusive public explore action", () => {
  render(<TopNav />);
  expect(screen.getAllByRole("link", { name: "What is worth doing?" })).toHaveLength(1);
  expect(screen.getByRole("link", { name: "Portugal" })).toHaveAttribute("href", "/portugal");
  expect(screen.getByRole("link", { name: "How it works" })).toHaveAttribute("href", "/how-it-works");
  expect(screen.getByRole("link", { name: "Local expertise" })).toHaveAttribute("href", "/local-expertise");
  expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
  expect(screen.queryByRole("link", { name: /^Explore$/ })).not.toBeInTheDocument();
});

it("keeps video detached until it is near and pauses it when hidden", () => {
  render(<CinematicMedia src="/media/cover.mp4" webmSrc="/media/cover.webm" mobileSrc="/media/cover-mobile.mp4" mobileWebmSrc="/media/cover-mobile.webm" poster="/media/cover.webp" alt="Atlantic coast" width={1600} height={900} textSafeZone={{ x: 0.04, y: 0.08, width: 0.46, height: 0.74 }} mobileTextSafeZone={{ x: 0.08, y: 0.5, width: 0.84, height: 0.42 }} />);
  expect(screen.getByTestId("cinematic-video")).not.toHaveAttribute("src");
  intersectMedia({ isIntersecting: true });
  expect(screen.getByTestId("cinematic-video")).toHaveAttribute("preload", "metadata");
  setDocumentVisibility("hidden");
  expect(pauseSpy).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run the shared component tests and verify they fail**

Run: `pnpm exec vitest run packages/ui/src/components/app-layout.test.tsx packages/ui/src/components/shell.test.tsx packages/ui/src/components/cinematic-media.test.tsx packages/ui/src/lib/media-preferences.test.ts apps/web/app/_components/public-route-layout.test.tsx apps/web/app/_components/route-scene.test.tsx apps/web/app/_components/site-footer.test.tsx apps/web/app/_components/top-nav.test.tsx apps/web/content/font-provenance.test.ts apps/web/content/cinematic-media-manifest.test.ts`

Expected: FAIL if texture/scene inputs, `focalLayer`, exact navigation, provenance, or media loading/pause/safe-zone behavior is missing.

- [ ] **Step 3: Implement the explicit shared contracts**

```tsx
// packages/ui/src/components/app-layout.tsx
export type AppSurfaceTexture = "editorial" | "none";

interface AppLayoutProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AppLayoutVariant;
  bare?: boolean;
  topNav?: ReactNode;
  siteFooter?: ReactNode;
  children: ReactNode;
  surface: AppSurface;
  surfaceTexture: AppSurfaceTexture;
}

export function AppLayout({
  variant = "marketing",
  bare = false,
  topNav,
  siteFooter,
  surface,
  surfaceTexture,
  className,
  children,
  ...props
}: AppLayoutProps) {
  return (
    <div
      data-surface={surface}
      data-surface-texture={surfaceTexture}
      data-layout-variant={variant}
      className={cn(
        "min-h-screen flex flex-col antialiased rumia-app-layout rumia-surface rumia-page-enter",
        `rumia-surface-${surface}`,
        variantClassName[variant],
        className
      )}
      {...props}
    >
      {bare ? null : topNav}
      <main id="main-content" className={cn("flex-1", bare ? "" : "pt-header-height")}>{children}</main>
      {bare ? null : siteFooter}
    </div>
  );
}
```

Make `PageShell` content-only so it can no longer paint a competing route surface:

```tsx
export function PageShell({
  className,
  children,
  variant = "marketing",
  bare = false
}: HTMLAttributes<HTMLDivElement> & {
  variant?: "marketing" | "app" | "reviewer" | "admin";
  bare?: boolean;
}) {
  return (
    <div
      className={cn("rumia-page-shell rumia-page-enter", className)}
    >
      {children}
    </div>
  );
}
```

Preserve the existing content measure/header behavior while removing surface and texture ownership; the outer route layout owns those markers.

```tsx
// apps/web/app/_components/public-route-layout.tsx
export interface PublicRouteLayoutProps {
  children: ReactNode;
  scene: RouteSceneTone;
  footerMode: SiteFooterMode;
  surfaceTone: AppSurface;
  surfaceTexture: AppSurfaceTexture;
}

export function PublicRouteLayout(props: PublicRouteLayoutProps) {
  return (
    <AppLayout
      data-testid="public-route-layout"
      data-scene={props.scene}
      data-shell="public"
      data-footer-mode={props.footerMode}
      variant="marketing"
      topNav={<TopNav />}
      surface={props.surfaceTone}
      surfaceTexture={props.surfaceTexture}
      siteFooter={props.footerMode === "none" ? null : <SiteFooter mode={props.footerMode} />}
    >
      {props.children}
    </AppLayout>
  );
}
```

```tsx
// apps/web/app/_components/route-scene.tsx
export type RouteSceneFocalLayer = "media" | "typography" | "illustration" | "data";

const toneClass: Record<RouteSceneTone, string> = {
  cover: "rumia-route-scene--cover",
  atlas: "rumia-route-scene--atlas",
  decision: "rumia-route-scene--decision",
  utility: "rumia-route-scene--utility"
};

const bleedClass: Record<RouteSceneBleed, string> = {
  full: "relative left-1/2 w-screen max-w-none -translate-x-1/2",
  contained: "mx-auto w-full max-w-wide"
};

// Add focalLayer to RouteSceneProps, then use these exact attributes:
// data-focal-layer={focalLayer}
// className={cn("rumia-route-scene relative isolate grid gap-6", toneClass[tone], bleedClass[bleed], className)}
```

Give each tone only its durable field and safe-zone variables in CSS. Do not encode one fixed grid in the primitive:

```css
.rumia-route-scene--cover { --scene-field: var(--color-midnight); --scene-ink: var(--color-linen-dark); }
.rumia-route-scene--atlas { --scene-field: var(--color-primary); --scene-ink: var(--color-linen-dark); }
.rumia-route-scene--decision { --scene-field: var(--color-linen); --scene-ink: var(--color-primary); }
.rumia-route-scene--utility { --scene-field: transparent; --scene-ink: var(--color-primary); }
.rumia-route-scene { background: var(--scene-field); color: var(--scene-ink); }
```

- [ ] **Step 4: Lock the font, navigation, media, token, and motion contracts**

The font files are pre-existing untracked work at plan time, so inspect and reconcile them before staging. Preserve them only after their hashes, OFL licences, source URLs, and provenance match. `font-provenance.test.ts` must verify every file, licence file, family name, source URL, and system fallback; browser tests must observe no remote font request. Keep display/body/mono assignments as Newsreader/Source Sans 3/IBM Plex Mono. Do not redownload or silently replace a user-owned binary.

Define responsive tokens for display/title/body/metadata sizes, spacing, radii, overlays, media safe zones, shadows, and motion. Body/metadata floors remain 16px/12px; reading measure stays 45–75 characters. Control feedback uses 120–220ms and chapter/crossfade motion 450–800ms. Reduced motion/data/low power resolves durations to zero or the poster/static state.

Extend both `CinematicMediaEntry` and `CinematicMediaProps` without breaking existing MP4 callers:

```ts
type CinematicMediaSourceExtension = {
  webmSrc?: string;
  mobileSrc?: string;
  mobileWebmSrc?: string;
  mobilePoster?: string;
  loadStrategy?: "eager" | "near-viewport";
  pauseWhenHidden?: boolean;
  textSafeZone?: { x: number; y: number; width: number; height: number };
  mobileTextSafeZone?: { x: number; y: number; width: number; height: number };
};
```

Prefer mobile WebM, mobile MP4, desktop WebM, then desktop MP4 in `<source>` order with media/type attributes. For `near-viewport`, attach sources only after an `IntersectionObserver` with `rootMargin: "300px"` reports proximity. Pause when offscreen or `document.visibilityState === "hidden"`; resume only when visible, intersecting, autoplay-eligible, and not manually paused. Reduced preferences render the poster/fallback with identical information. Emit safe-zone CSS variables for desktop and mobile. Existing `src` + `poster` MP4 callers continue to compile unchanged.

TopNav desktop and mobile disclosures use the same exact four links and one CTA. Remove the duplicate plain `/explore` link. The mobile disclosure returns focus to its trigger on close and keeps every target at least 44px.

- [ ] **Step 5: Migrate all wrapper callers before removing the defaults**

For each current caller, copy its scene/footer/texture from `ROUTE_PRESENTATION_CATALOGUE`. Marketing and trip layouts may own navigation, but must not force one footer or outer texture across every child route. Do not branch on `window.location` in a client layout.

The marketing route-group layout becomes presentation-neutral:

```tsx
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

Each rendered marketing page wraps its existing content in the explicit `PublicRouteLayout` contract from the manifest. Redirect-only pages remain redirects. This avoids nested `main` landmarks and avoids client pathname branching.

- [ ] **Step 6: Use TypeScript as the regression gate for accidental defaults**

Run: `pnpm typecheck`

Expected: PASS. Any `PublicRouteLayout` or `AppLayout` caller missing an explicit presentation prop fails TypeScript with `TS2741`.

- [ ] **Step 7: Run shared tests, assets, typecheck, and diff check**

Run: `pnpm exec vitest run packages/ui/src/components/app-layout.test.tsx packages/ui/src/components/shell.test.tsx packages/ui/src/components/cinematic-media.test.tsx packages/ui/src/lib/media-preferences.test.ts apps/web/app/_components/public-route-layout.test.tsx apps/web/app/_components/route-scene.test.tsx apps/web/app/_components/site-footer.test.tsx apps/web/app/_components/top-nav.test.tsx apps/web/content/font-provenance.test.ts apps/web/content/cinematic-media-manifest.test.ts && pnpm qa:assets && pnpm typecheck && git diff --check`

Expected: PASS; `rg -n "<PublicRouteLayout(>|\s*$)" apps/web/app` finds no implicit presentation caller.

- [ ] **Step 8: Commit the shared foundation and frame only**

```bash
git add packages/ui/src/components/app-layout.tsx packages/ui/src/components/app-layout.test.tsx packages/ui/src/components/shell.tsx packages/ui/src/components/shell.test.tsx packages/ui/src/components/cinematic-media.tsx packages/ui/src/components/cinematic-media.test.tsx packages/ui/src/lib/media-preferences.ts packages/ui/src/lib/media-preferences.test.ts packages/ui/src/styles.css apps/web/app/layout.tsx apps/web/app/_components/route-scene.tsx apps/web/app/_components/route-scene.test.tsx apps/web/app/_components/public-route-layout.tsx apps/web/app/_components/public-route-layout.test.tsx apps/web/app/_components/site-footer.tsx apps/web/app/_components/site-footer.test.tsx apps/web/app/_components/top-nav.tsx apps/web/app/_components/top-nav.test.tsx apps/web/content/font-provenance.json apps/web/content/font-provenance.test.ts apps/web/public/fonts/newsreader/Newsreader-Variable.ttf apps/web/public/fonts/source-sans-3/SourceSans3-Variable.ttf apps/web/public/fonts/ibm-plex-mono/IBMPlexMono-Regular.ttf apps/web/public/fonts/ibm-plex-mono/IBMPlexMono-Medium.ttf apps/web/public/fonts/ibm-plex-mono/IBMPlexMono-SemiBold.ttf apps/web/public/fonts/licenses/Newsreader-OFL.txt apps/web/public/fonts/licenses/SourceSans3-OFL.txt apps/web/public/fonts/licenses/IBMPlexMono-OFL.txt apps/web/content/cinematic-media-manifest.ts apps/web/content/cinematic-media-manifest.test.ts apps/web/content/asset-manifest.json apps/web/app/globals.css apps/web/app/'(marketing)'/layout.tsx apps/web/app/'(marketing)'/page.tsx apps/web/app/'(marketing)'/portugal/page.tsx apps/web/app/'(marketing)'/explore/page.tsx apps/web/app/'(marketing)'/explore/workspace/page.tsx apps/web/app/'(marketing)'/activities/'[activityId]'/page.tsx apps/web/app/'(marketing)'/feedback/page.tsx apps/web/app/'(marketing)'/how-it-works/page.tsx apps/web/app/'(marketing)'/local-expertise/page.tsx apps/web/app/'(marketing)'/pricing/page.tsx apps/web/app/'(app)'/trip/layout.tsx apps/web/app/'(app)'/account/layout.tsx apps/web/app/support/layout.tsx apps/web/app/sign-in/page.tsx apps/web/app/itineraries/page.tsx apps/web/app/checkout/page.tsx apps/web/app/guide/onboarding/page.tsx apps/web/app/_components/legal-page.tsx apps/web/app/b2b/'[orgSlug]'/page.tsx apps/web/app/_components/beta-unavailable.tsx apps/web/app/logistics/page.tsx apps/web/app/expert-chat/page.tsx apps/web/app/expert-chat/_components/expert-chat.tsx apps/web/app/vault/page.tsx apps/web/app/offline/page.tsx
git commit -m "feat(frontend): enforce explicit visual foundations"
```

### Task 3: Replace streamed auth/database failures with typed recovery

**Files:**

- Create: `apps/web/lib/auth/session-outcome.ts`
- Create: `apps/web/lib/auth/session-outcome.test.ts`
- Create: `apps/web/app/_components/route-recovery.tsx`
- Create: `apps/web/app/_components/route-recovery.test.tsx`
- Create: `apps/web/app/global-error.tsx`
- Create: `apps/web/app/global-error.test.tsx`
- Create: `apps/web/app/(app)/error.tsx`
- Create: `apps/web/app/(reviewer)/error.tsx`
- Create: `apps/web/app/(admin)/error.tsx`
- Modify: `packages/ui/src/components/decision-state-panel.tsx`
- Modify: `packages/ui/src/components/decision-state-panel.test.tsx`
- Modify: `apps/web/lib/auth/session.ts`
- Modify: `apps/web/lib/auth/session.test.ts`
- Modify: `apps/web/lib/auth/current-user.ts`
- Modify: `apps/web/lib/auth/authorization.ts`
- Modify: `apps/web/app/error.tsx`
- Modify: `apps/web/app/loading.tsx`
- Modify: `apps/web/app/(app)/loading.tsx`
- Modify: `apps/web/app/(marketing)/loading.tsx`
- Modify: `apps/web/app/sign-in/page.tsx`
- Modify: `apps/web/app/sign-in/page.test.tsx`
- Modify: `apps/web/app/itineraries/page.tsx`
- Create: `apps/web/app/itineraries/page.test.tsx`
- Modify: `apps/web/app/vault/page.tsx`
- Create: `apps/web/app/vault/page.test.tsx`
- Modify: `apps/web/app/(app)/account/page.tsx`
- Create: `apps/web/app/(app)/account/page.test.tsx`
- Modify: `apps/web/app/(reviewer)/reviewer/layout.tsx`
- Modify: `apps/web/app/(admin)/admin/layout.tsx`
- Modify: `apps/web/app/guide/onboarding/page.tsx`
- Modify: `README.md`

**Interfaces:**

- Produces `SessionOutcome = ready | anonymous | unavailable` through one bounded, single-flight web/auth probe without changing `@repo/db` or Better Auth and without exposing configuration names or database errors.
- `unavailable` never becomes `anonymous` or `forbidden`.
- App-layout recovery is content-only and relies on the shell's existing `main`; root-document recovery explicitly owns the only `main`. Both modes produce one visible `h1`, Retry, Support, and a Utility/texture-free surface.

- [ ] **Step 1: Write failing outcome and sanitization tests**

```ts
it("distinguishes provider failure from an anonymous session", async () => {
  const outcome = createSessionOutcomeLoader({
    getSession: async () => { throw Object.assign(new Error("connection"), { code: "ECONNREFUSED" }); },
    environment: validTestEnvironment,
    timeoutMs: 4_000,
    cooldownMs: 30_000
  });
  await expect(outcome()).resolves.toEqual({ kind: "unavailable" });
});

it("shares one never-settling probe instead of accumulating queries", async () => {
  const getSession = vi.fn(() => new Promise<never>(() => undefined));
  const load = createSessionOutcomeLoader({
    getSession,
    environment: validTestEnvironment,
    timeoutMs: 10,
    cooldownMs: 30_000
  });
  await expect(Promise.all(Array.from({ length: 20 }, () => load())))
    .resolves.toEqual(Array.from({ length: 20 }, () => ({ kind: "unavailable" })));
  expect(getSession).toHaveBeenCalledTimes(1);
});

it("does not expose provider internals", async () => {
  render(<RouteRecovery kind="unavailable" onRetry={() => undefined} />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("This part of Rumia is temporarily unavailable");
  expect(screen.queryByRole("main")).not.toBeInTheDocument();
  expect(screen.queryByText(/DATABASE_URL|BETTER_AUTH_SECRET|ECONN|stack/i)).not.toBeInTheDocument();
});

it("owns the landmark only for root-document recovery", () => {
  render(<RouteRecovery kind="error" landmark="document" />);
  expect(screen.getAllByRole("main")).toHaveLength(1);
});
```

- [ ] **Step 2: Run the focused recovery tests and verify failure**

Run: `pnpm exec vitest run apps/web/lib/auth/session-outcome.test.ts apps/web/app/_components/route-recovery.test.tsx apps/web/app/sign-in/page.test.tsx`

Expected: FAIL because the outcome and recovery components do not exist.

- [ ] **Step 3: Implement the typed UI-safe boundary**

```ts
// apps/web/lib/auth/session-outcome.ts
import { getCurrentSession } from "./session";

type CurrentSession = Awaited<ReturnType<typeof getCurrentSession>>;
export type SessionOutcome =
  | { kind: "ready"; session: NonNullable<CurrentSession> }
  | { kind: "anonymous" }
  | { kind: "unavailable" };

type SessionEnvironment = Readonly<Record<string, string | undefined>>;
type LoaderDependencies = {
  getSession: typeof getCurrentSession;
  environment: SessionEnvironment;
  timeoutMs: number;
  cooldownMs: number;
  now?: () => number;
};

const knownProviderCodes = new Set(["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "EAI_AGAIN", "ERR_INVALID_URL", "57P01", "57P02", "57P03"]);

function hasSessionConfiguration(environment: SessionEnvironment) {
  return Boolean(environment.DATABASE_URL?.trim()) && (environment.BETTER_AUTH_SECRET?.length ?? 0) >= 32;
}

function isKnownProviderFailure(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && knownProviderCodes.has(String(error.code)));
}

export function createSessionOutcomeLoader(dependencies: LoaderDependencies) {
  let probe: Promise<SessionOutcome> | null = null;
  let underlyingPending = false;
  let unavailableUntil = 0;
  const now = dependencies.now ?? Date.now;

  return async function loadSessionOutcome(): Promise<SessionOutcome> {
    if (!hasSessionConfiguration(dependencies.environment)) return { kind: "unavailable" };
    if (underlyingPending || now() < unavailableUntil) return probe ?? { kind: "unavailable" };
    if (probe) return probe;

    underlyingPending = true;
    const underlying = dependencies.getSession();
    void underlying.finally(() => { underlyingPending = false; }).catch(() => undefined);
    let deadlineTimer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<SessionOutcome>((resolve) => {
      deadlineTimer = setTimeout(() => {
        unavailableUntil = now() + dependencies.cooldownMs;
        resolve({ kind: "unavailable" });
      }, dependencies.timeoutMs);
    });

    probe = Promise.race([
      underlying.then((session) => session ? { kind: "ready", session } as const : { kind: "anonymous" } as const),
      deadline
    ]).catch((error) => {
      if (isKnownProviderFailure(error)) {
        unavailableUntil = now() + dependencies.cooldownMs;
        return { kind: "unavailable" } as const;
      }
      throw error;
    }).finally(() => {
      if (deadlineTimer) clearTimeout(deadlineTimer);
      probe = null;
    });
    return probe;
  };
}

export const loadSessionOutcome = createSessionOutcomeLoader({
  getSession: getCurrentSession,
  environment: process.env,
  timeoutMs: 4_000,
  cooldownMs: 30_000
});
```

This is deliberately a web/auth circuit breaker, not a database timeout change. All concurrent callers share one deadline and one underlying session probe. After a deadline, no new probe starts while the old one is pending or during cooldown. The background promise always has rejection/finally handlers, so a stalled provider cannot create an unbounded query/timer chain. Arbitrary programming/render errors are rethrown to the normal segment boundary. Tests use fake timers and prove one underlying call for concurrent and repeated requests.

- [ ] **Step 4: Build the shared recovery composition**

```tsx
export function RouteRecovery({
  kind,
  onRetry,
  landmark = "content"
}: {
  kind: "error" | "unavailable";
  onRetry?: () => void;
  landmark?: "content" | "document";
}) {
  const panel = (
    <DecisionStatePanel
      kind={kind}
      tone="light"
      headingLevel={1}
      title={kind === "unavailable" ? "This part of Rumia is temporarily unavailable" : "We hit a detour"}
      description="Your saved work has not been changed. Try again, or return to support."
      primaryAction={onRetry ? <button onClick={onRetry}>Try again</button> : <a href="/">Return home</a>}
      secondaryAction={<a href="/support">Get support</a>}
    />
  );

  const className = "min-h-screen bg-linen px-6 py-16";
  return landmark === "document" ? (
    <main id="main-content" data-scene="utility" data-surface-texture="none" className={className}>{panel}</main>
  ) : (
    <section aria-label="Route recovery" data-scene="utility" data-surface-texture="none" className={className}>{panel}</section>
  );
}
```

Add `headingLevel?: 1 | 2 | 3` to `DecisionStatePanel`; render the corresponding semantic heading without changing its visual token. Route-level recovery uses level 1. Embedded panels under an existing page heading use level 2.

- [ ] **Step 5: Update dependent pages and loading shells**

Use `loadSessionOutcome` before data queries on sign-in, Itineraries, Vault, Account, admin/reviewer layouts, and Guide onboarding. App-layout pages render content-mode `RouteRecovery`; only `global-error.tsx` passes `landmark="document"`. Preserve anonymous redirects and forbidden states. Add stable `role="status"`, `aria-busy="true"`, and route-specific test IDs to loading shells.

- [ ] **Step 6: Add the unavailable runtime browser gate**

Create `apps/web/playwright.unavailable.config.ts` and `apps/web/playwright/tests/persistence-unavailable.spec.ts`. Run missing-config and unreachable modes sequentially on a separate port without persona global setup. Assert recovery replaces the skeleton within five seconds on `/sign-in`, `/itineraries`, `/vault`, and `/account`; `/account` is never blank; no raw environment name, connection detail, stack, or Next diagnostic appears.

- [ ] **Step 7: Correct the README secret example and run recovery gates**

Run:

```bash
pnpm exec vitest run apps/web/lib/auth/session.test.ts apps/web/lib/auth/session-outcome.test.ts apps/web/lib/auth/current-user.test.ts apps/web/lib/auth/authorization.test.ts apps/web/app/_components/route-recovery.test.tsx packages/ui/src/components/decision-state-panel.test.tsx apps/web/app/sign-in/page.test.tsx apps/web/app/itineraries/page.test.tsx apps/web/app/vault/page.test.tsx apps/web/app/'(app)'/account/page.test.tsx apps/web/app/global-error.test.tsx
PERSISTENCE_FAILURE_MODE=missing-config pnpm --dir apps/web exec playwright test --config playwright.unavailable.config.ts --grep @persistence-unavailable --workers=1
PERSISTENCE_FAILURE_MODE=unreachable pnpm --dir apps/web exec playwright test --config playwright.unavailable.config.ts --grep @persistence-unavailable --workers=1
```

Expected: both modes show authored recovery within five seconds at desktop and mobile, with no leaked internals.

- [ ] **Step 8: Commit recovery separately**

```bash
git add packages/ui/src/components/decision-state-panel.tsx packages/ui/src/components/decision-state-panel.test.tsx apps/web/lib/auth/session.ts apps/web/lib/auth/session.test.ts apps/web/lib/auth/session-outcome.ts apps/web/lib/auth/session-outcome.test.ts apps/web/lib/auth/current-user.ts apps/web/lib/auth/authorization.ts apps/web/app/_components/route-recovery.tsx apps/web/app/_components/route-recovery.test.tsx apps/web/app/error.tsx apps/web/app/global-error.tsx apps/web/app/global-error.test.tsx apps/web/app/loading.tsx apps/web/app/'(app)'/loading.tsx apps/web/app/'(marketing)'/loading.tsx apps/web/app/'(app)'/error.tsx apps/web/app/'(reviewer)'/error.tsx apps/web/app/'(admin)'/error.tsx apps/web/app/sign-in/page.tsx apps/web/app/sign-in/page.test.tsx apps/web/app/itineraries/page.tsx apps/web/app/itineraries/page.test.tsx apps/web/app/vault/page.tsx apps/web/app/vault/page.test.tsx apps/web/app/'(app)'/account/page.tsx apps/web/app/'(app)'/account/page.test.tsx apps/web/app/'(reviewer)'/reviewer/layout.tsx apps/web/app/'(admin)'/admin/layout.tsx apps/web/app/guide/onboarding/page.tsx apps/web/playwright.unavailable.config.ts apps/web/playwright/tests/persistence-unavailable.spec.ts README.md
git commit -m "fix(frontend): render bounded persistence recovery"
```

### Task 4: Seed deterministic personas, capabilities, and route states

**Files:**

- Modify: `apps/web/playwright/global-setup.ts`
- Create: `apps/web/playwright/fixtures/admin-limited-auth.ts`
- Create: `apps/web/playwright/fixtures/reviewer-trip.ts`
- Create: `apps/web/playwright/fixtures/reviewed-trip.ts`
- Create: `apps/web/playwright/fixtures/specialist-candidate-auth.ts`
- Modify: `apps/web/playwright/fixtures/traveler-trip.ts`
- Modify: `apps/web/playwright/route-matrix.test.ts`

**Interfaces:**

- Normal admin has every catalogue capability.
- Limited admin proves capability-denied behavior.
- Reviewer has assigned and completed-review fixtures.
- Traveler retains the current draft plus a separate paid/reviewed trip for eligible Expert Chat.
- No fake organization member is seeded.

- [ ] **Step 1: Write fixture-contract tests before adding rows**

```ts
it("declares deterministic fixtures for every dynamic authorized state", () => {
  expect(resolveFixture("reviewer-trip")).toMatch(/^\/reviewer\/trips\/[0-9a-f-]+$/);
  expect(resolveFixture("traveler-trip", "/map")).toMatch(/^\/trip\/[0-9a-f-]+\/map$/);
});

it("never declares an organization-ready fixture", () => {
  expect(ROUTE_PRESENTATION_CATALOGUE["/b2b/[orgSlug]"].states).not.toContain("ready");
});
```

- [ ] **Step 2: Run the matrix test and verify missing fixture failures**

Run: `pnpm exec vitest run apps/web/playwright/route-matrix.test.ts`

Expected: FAIL for missing limited-admin, reviewer-trip, reviewed-trip, and specialist-candidate fixture resolution.

- [ ] **Step 3: Add deterministic seed helpers**

In `global-setup.ts`, add one helper per fixture responsibility:

```ts
const ADMIN_CAPABILITIES = [
  "content:manage", "operations:manage", "specialists:verify",
  "analytics:read", "configuration:deploy", "developer_docs:read"
] as const;

async function ensureCapabilityGrants(owner: pg.Pool, userId: string, capabilities: readonly string[]) {
  await owner.query("delete from app.capability_grants where subject_user_id = $1", [userId]);
  for (const capability of capabilities) {
    await owner.query(
      "insert into app.capability_grants (subject_user_id, app_role, capability, reason, granted_by) values ($1, 'admin', $2, 'Playwright capability fixture', $1)",
      [userId, capability]
    );
  }
}
```

Add helpers for an active reviewer assignment, a completed assignment, a paid/reviewed owner trip, and a specialist-candidate draft. Keep the existing traveler draft unchanged so empty/draft and paid/reviewed states never contaminate each other.

- [ ] **Step 4: Add fixture readers and deterministic path resolution**

Each fixture module reads one JSON record written by global setup, validates required IDs, and exports a path function. Do not hard-code a random trip ID in the route catalogue.

- [ ] **Step 5: Run fixture typecheck and route-matrix tests**

Run: `pnpm exec vitest run apps/web/playwright/route-matrix.test.ts && pnpm --dir apps/web test:typecheck`

Expected: PASS; no dynamic capture path contains `[` or `]`; organization has no ready fixture.

- [ ] **Step 6: Commit fixtures without UI changes**

```bash
git add apps/web/playwright/global-setup.ts apps/web/playwright/fixtures/admin-limited-auth.ts apps/web/playwright/fixtures/reviewer-trip.ts apps/web/playwright/fixtures/reviewed-trip.ts apps/web/playwright/fixtures/specialist-candidate-auth.ts apps/web/playwright/fixtures/traveler-trip.ts apps/web/playwright/route-matrix.test.ts
git commit -m "test(frontend): seed deterministic visual states"
```

### Task 5: Finish the Home Cover and Portugal Atlas

**Files:**

- Modify: `apps/web/app/(marketing)/page.tsx`
- Modify: `apps/web/app/(marketing)/page.test.tsx`
- Modify: `apps/web/app/_components/destination-bento.tsx`
- Modify: `apps/web/app/_components/destination-bento.test.tsx`
- Modify: `apps/web/app/(marketing)/portugal/page.tsx`
- Modify: `apps/web/app/(marketing)/portugal/portugal-atlas.tsx`
- Create or modify: `apps/web/app/(marketing)/portugal/portugal-atlas.test.tsx`
- Modify: `apps/web/content/asset-manifest.json` only if a changed crop/source is required
- Modify: `apps/web/playwright/tests/public-discovery.spec.ts`

**Interfaces:**

- Home is the only autoplay Cover in this task and remains useful with the poster alone.
- Portugal owns the public Atlas grammar and exposes every region through semantic links at every viewport.

- [ ] **Step 1: Write failing composition and mobile-disclosure tests**

```tsx
it("alternates cover, editorial, and atlas chapters", () => {
  render(<HomePage />);
  expect(screen.getByTestId("home-cover")).toHaveAttribute("data-tone", "cover");
  expect(screen.getByTestId("home-editorial-chapter")).toHaveAttribute("data-focal-layer", "typography");
  expect(screen.getByTestId("home-atlas-chapter")).toHaveAttribute("data-tone", "atlas");
});

it("renders one featured Portugal collection followed by compact region entries", () => {
  render(<PortugalAtlas />);
  expect(screen.getByTestId("portugal-featured-region")).toBeInTheDocument();
  expect(screen.getByTestId("portugal-compact-region-list").getElementsByTagName("a").length).toBeGreaterThanOrEqual(4);
});
```

- [ ] **Step 2: Run the focused public tests and verify failure**

Run: `pnpm exec vitest run apps/web/app/'(marketing)'/page.test.tsx apps/web/app/_components/destination-bento.test.tsx apps/web/app/'(marketing)'/portugal/portugal-atlas.test.tsx`

Expected: FAIL for missing scene/chapter markers or compact region list.

- [ ] **Step 3: Recompose Home without changing the activity-first brief**

Use this order and no additional competing brand mark:

```tsx
<RouteScene tone="cover" bleed="full" focalLayer="media" data-testid="home-cover" media={<HomeCoverMedia />} foreground={<HomeActivityBrief />} actions={<HomeExploreAction />} />
<RouteScene tone="utility" bleed="contained" focalLayer="typography" data-testid="home-editorial-chapter" foreground={<HomeJudgementChapter />} />
<RouteScene tone="cover" bleed="contained" focalLayer="media" media={<HomeFieldNote />} foreground={<HomeFieldNoteCopy />} />
<RouteScene tone="atlas" bleed="contained" focalLayer="illustration" data-testid="home-atlas-chapter" foreground={<DestinationBento />} />
```

Keep the activity brief and exclusive `/explore` CTA within the first 1000px desktop viewport and first 844px mobile viewport. Use frame-independent gradient/text shadow derived from the media text-safe zone. Correct the Lisbon collection to use `/trip-covers/lisbon-tagus.svg` and its Lisbon alt text; do not label the Porto street photograph as Lisbon.

- [ ] **Step 4: Recompose Portugal mobile disclosure**

Desktop retains the atlas. Below 768px, render one featured region with image/summary/action, then a semantic list of compact region links with name, one-line judgement, and activity count. Do not shrink the existing five desktop cards into a tiny dark stack.

- [ ] **Step 5: Prove Home and Portugal at four viewports**

Add Playwright assertions for above-fold brief/CTA, text contrast overlay, every region link, compact mobile card height, no horizontal overflow, and no more than one autoplay video.

Run: `pnpm --dir apps/web exec playwright test playwright/tests/public-discovery.spec.ts --config playwright.config.ts --grep "home|Portugal" --workers=1`

Expected: PASS at 1440×1000, 1024×768, 768×1024, and 390×844.

- [ ] **Step 6: Commit the Cover/Atlas pair**

```bash
git add apps/web/app/'(marketing)'/page.tsx apps/web/app/'(marketing)'/page.test.tsx apps/web/app/_components/destination-bento.tsx apps/web/app/_components/destination-bento.test.tsx apps/web/app/'(marketing)'/portugal/page.tsx apps/web/app/'(marketing)'/portugal/portugal-atlas.tsx apps/web/app/'(marketing)'/portugal/portugal-atlas.test.tsx apps/web/playwright/tests/public-discovery.spec.ts apps/web/content/asset-manifest.json
git commit -m "feat(frontend): distinguish the home cover and Portugal atlas"
```

### Task 6: Complete the Explore decision loop and visible save feedback

**Files:**

- Modify: `apps/web/app/(marketing)/explore/page.tsx`
- Modify: `apps/web/app/(marketing)/explore/activity-explorer.tsx`
- Modify: `apps/web/app/(marketing)/explore/activity-explorer.test.tsx`
- Modify: `apps/web/app/(marketing)/_components/activity-result-card.tsx`
- Modify: `apps/web/app/(marketing)/_components/activity-result-card.test.tsx`
- Modify: `apps/web/app/(marketing)/_components/activity-day-tray.tsx`
- Create or modify: `apps/web/app/(marketing)/_components/activity-day-tray.test.tsx`
- Modify: `apps/web/playwright/tests/public-discovery.spec.ts`

**Interfaces:**

- Save/remove updates `aria-pressed`, card marker, visible status, URL state, desktop rail, and mobile tray in one transaction.
- The empty rail remains authored and useful on desktop; mobile tray appears only after the first saved activity.

- [ ] **Step 1: Write the failing interaction test**

```tsx
it("makes a saved activity visible in every decision surface", async () => {
  const user = userEvent.setup();
  render(<ActivityExplorer initialIntent={PORTO_INTENT} />);
  const save = screen.getByRole("button", { name: /save .* to this day/i });
  await user.click(save);
  expect(save).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByTestId("activity-result-card")).toHaveAttribute("data-saved", "true");
  expect(screen.getByRole("status")).toHaveTextContent(/added to your day/i);
  expect(screen.getByTestId("activity-day-tray")).toHaveTextContent("1 activity");
});
```

- [ ] **Step 2: Run the Explore tests and verify the missing visible contract**

Run: `pnpm exec vitest run apps/web/app/'(marketing)'/explore/activity-explorer.test.tsx apps/web/app/'(marketing)'/_components/activity-result-card.test.tsx apps/web/app/'(marketing)'/_components/activity-day-tray.test.tsx`

Expected: FAIL until the visible tray/status contract and stable test IDs are present.

- [ ] **Step 3: Implement the authored 8/4 Decision composition**

Wrap the main results/brief and rail in a Decision scene. Keep the results column authoritative. The desktop rail must contain, even when empty: what saving does, time-cost explanation, and the next action. Results must show verdict, trade-off, time, save state, and alternative without a repeated white card shell.

Add these stable markers:

```tsx
<div data-testid="explore-results-column" className="min-w-0">
  <section id="judged-activities" aria-label="Judged activities">
    {activities.map((activity, index) => (
      <ActivityResultCard
        key={activity.id}
        activity={activity}
        index={index}
        alternativeTitle={activity.alternativeId ? activitiesById.get(activity.alternativeId)?.title : undefined}
        saved={savedIds.includes(activity.id)}
        onToggle={toggle}
      />
    ))}
  </section>
</div>
<aside data-testid="explore-day-rail" aria-label="Your chosen day">
  <ActivityDayTray activities={savedActivities} onRemove={toggle} onContinue={continueToWorkspace} />
</aside>
```

- [ ] **Step 4: Make mobile tray geometry safe**

The tray appears after the first save, includes count, total time, and “See this day”, respects `env(safe-area-inset-bottom)`, and adds matching document bottom padding. It must not cover the last result, feedback link, or focus target.

- [ ] **Step 5: Add live browser assertions**

```ts
await page.getByRole("button", { name: /save .* to this day/i }).first().click();
await expect(page.getByRole("button", { name: /remove .* from this day/i }).first()).toHaveAttribute("aria-pressed", "true");
await expect(page.getByTestId("activity-day-tray")).toBeVisible();
await expect(page.getByRole("status")).toContainText("added to your day");
await expect(page).toHaveURL(/activity=/);
```

Run: `pnpm --dir apps/web exec playwright test playwright/tests/public-discovery.spec.ts --config playwright.config.ts --grep "save|chosen day|Explore" --workers=1`

Expected: PASS on desktop and 390×844.

- [ ] **Step 6: Commit the decision loop**

```bash
git add apps/web/app/'(marketing)'/explore/page.tsx apps/web/app/'(marketing)'/explore/activity-explorer.tsx apps/web/app/'(marketing)'/explore/activity-explorer.test.tsx apps/web/app/'(marketing)'/_components/activity-result-card.tsx apps/web/app/'(marketing)'/_components/activity-result-card.test.tsx apps/web/app/'(marketing)'/_components/activity-day-tray.tsx apps/web/app/'(marketing)'/_components/activity-day-tray.test.tsx apps/web/playwright/tests/public-discovery.spec.ts
git commit -m "feat(frontend): complete the visible Explore save loop"
```

### Task 7: Put activity judgement above the fold and compact Workspace

**Files:**

- Modify: `apps/web/app/(marketing)/activities/[activityId]/page.tsx`
- Modify: `apps/web/app/(marketing)/activities/[activityId]/page.test.tsx`
- Modify: `apps/web/app/(marketing)/activities/[activityId]/_components/activity-detail-save-action.tsx`
- Modify or create: `apps/web/app/(marketing)/activities/[activityId]/_components/activity-detail-save-action.test.tsx`
- Modify: `apps/web/app/(marketing)/explore/workspace/activity-workspace.tsx`
- Modify: `apps/web/app/(marketing)/explore/workspace/activity-workspace.test.tsx`
- Modify: `apps/web/app/(marketing)/_components/activity-map.tsx`
- Modify: `apps/web/app/(marketing)/_components/activity-map-fallback.tsx`
- Modify: `apps/web/playwright/tests/public-discovery.spec.ts`

**Interfaces:**

- Activity Cover combines media and decision foreground; evidence follows below.
- Workspace retains URL-backed selected IDs; no persistence/schema change.
- Map disclosure always has the same activities, order, durations, and warnings as the list.

- [ ] **Step 1: Write first-viewport and state tests**

```tsx
it("puts the judgement summary inside the activity cover", async () => {
  render(await ActivityDetailPage({ params: Promise.resolve({ activityId: "porto-ribeira-slow-walk" }) }));
  const hero = screen.getByTestId("activity-detail-hero");
  expect(within(hero).getByText("Rumia verdict")).toBeVisible();
  expect(within(hero).getByText("Time to allow")).toBeVisible();
  expect(within(hero).getByRole("button", { name: /save/i })).toBeVisible();
});

it.each([[0, "empty"], [1, "one"], [2, "multiple"]] as const)(
  "renders the %s-selection workspace state",
  (count, state) => {
    render(<ActivityWorkspace initialActivities={ACTIVITIES.slice(0, count)} />);
    expect(screen.getByTestId("activity-workspace")).toHaveAttribute("data-state", state);
  }
);
```

- [ ] **Step 2: Run the detail/workspace tests and verify failures**

Run: `pnpm exec vitest run apps/web/app/'(marketing)'/activities/'[activityId]'/page.test.tsx apps/web/app/'(marketing)'/activities/'[activityId]'/_components/activity-detail-save-action.test.tsx apps/web/app/'(marketing)'/explore/workspace/activity-workspace.test.tsx`

Expected: FAIL until the judgement is inside the cover and Workspace exposes explicit states.

- [ ] **Step 3: Recompose the activity Cover**

```tsx
<RouteScene
  tone="cover"
  bleed="contained"
  focalLayer="media"
  data-testid="activity-detail-hero"
  media={<CinematicMedia {...media} motionPolicy="poster-only" textSafeZone={safeZone} />}
  foreground={
    <ActivityJudgementSummary
      title={activity.title}
      verdict={activity.verdict}
      duration={timeLabel(activity.durationMinutes)}
      caveat={activity.avoidWhen}
    />
  }
  actions={<ActivityDetailSaveAction activityId={activity.id} activityTitle={activity.title} />}
/>
```

Desktop foreground sits in the declared safe zone. Mobile shortens media enough that title, verdict, time, caveat, and save are all encountered before the first 844px ends. The mobile save bar is sticky or fixed with safe-area padding and matching document padding; it never covers evidence links.

- [ ] **Step 4: Implement compact Workspace states**

Empty state height is bounded to its content and one next action. One/multiple states render an ordered activity sequence, total activity time, travel/pause caveat, remove/reorder controls, and day summary. Invalid IDs are ignored with an announced warning. The optional map opens only after user action and never replaces the list.

- [ ] **Step 5: Prove viewport geometry and map/list parity**

At each viewport, assert hero summary bottom is within the first viewport, sticky save does not overlap the evidence link, empty Workspace has no accidental column, and every map activity has an equivalent list item.

Run: `pnpm --dir apps/web exec playwright test playwright/tests/public-discovery.spec.ts --config playwright.config.ts --grep "activity detail|Workspace" --workers=1`

Expected: PASS at all four viewports.

- [ ] **Step 6: Commit detail and Workspace together**

```bash
git add apps/web/app/'(marketing)'/activities/'[activityId]'/page.tsx apps/web/app/'(marketing)'/activities/'[activityId]'/page.test.tsx apps/web/app/'(marketing)'/activities/'[activityId]'/_components/activity-detail-save-action.tsx apps/web/app/'(marketing)'/activities/'[activityId]'/_components/activity-detail-save-action.test.tsx apps/web/app/'(marketing)'/explore/workspace/activity-workspace.tsx apps/web/app/'(marketing)'/explore/workspace/activity-workspace.test.tsx apps/web/app/'(marketing)'/_components/activity-map.tsx apps/web/app/'(marketing)'/_components/activity-map-fallback.tsx apps/web/playwright/tests/public-discovery.spec.ts
git commit -m "feat(frontend): surface judgement and compact the chosen day"
```

### Task 8: Redesign explanatory, expertise, pricing, support, and feedback routes

**Files:**

- Modify: `apps/web/app/(marketing)/how-it-works/page.tsx`
- Create: `apps/web/app/(marketing)/how-it-works/page.test.tsx`
- Modify: `apps/web/app/(marketing)/pricing/page.tsx`
- Modify: `apps/web/app/(marketing)/pricing/page.test.tsx`
- Modify: `apps/web/app/(marketing)/local-expertise/page.tsx`
- Create: `apps/web/app/(marketing)/local-expertise/page.test.tsx`
- Modify: `apps/web/app/support/layout.tsx`
- Modify: `apps/web/app/support/page.tsx`
- Create: `apps/web/app/support/page.test.tsx`
- Modify: `apps/web/app/(marketing)/feedback/page.tsx`
- Modify: `apps/web/app/(marketing)/feedback/activity-feedback-form.tsx`
- Modify: `apps/web/app/(marketing)/feedback/activity-feedback-form.test.tsx`
- Modify: `apps/web/app/globals.css`

**Interfaces:**

- How It Works is a four-chapter visual sequence, not four equal cards.
- Pricing presents the free preview as the single recommended starting choice.
- Local Expertise explains evidence and boundaries; Support explains recovery channels; they do not share the same composition.

- [ ] **Step 1: Write route-specific hierarchy tests**

```tsx
it("orders the four How It Works chapters", () => {
  render(<HowItWorksPage />);
  expect(screen.getAllByTestId("how-chapter").map((node) => node.getAttribute("data-step")))
    .toEqual(["time", "judgement", "control", "review"]);
});

it("makes the free preview the only recommended pricing choice", () => {
  render(<PricingPage />);
  expect(screen.getAllByText(/recommended/i)).toHaveLength(1);
  expect(screen.getByTestId("pricing-place-image")).toBeVisible();
  expect(screen.getByTestId("pricing-free-preview")).toContainElement(
    screen.getByRole("link", { name: /start with the free preview/i })
  );
});
```

- [ ] **Step 2: Run the route tests and verify the old template fails**

Run: `pnpm exec vitest run apps/web/app/'(marketing)'/how-it-works/page.test.tsx apps/web/app/'(marketing)'/pricing/page.test.tsx apps/web/app/'(marketing)'/local-expertise/page.test.tsx apps/web/app/support/page.test.tsx apps/web/app/'(marketing)'/feedback/activity-feedback-form.test.tsx`

Expected: FAIL for missing chapter order, exclusive recommendation, and route-specific evidence structures.

- [ ] **Step 3: Implement five different information architectures**

- How It Works: asymmetric Cover orientation followed by numbered `time`, `judgement`, `control`, and `review` chapters alternating media/type alignment.
- Pricing: texture-free Utility ledger with one locally hosted static Portugal crop that remains clearly perceptible rather than buried under an opaque overlay. Free preview is visually primary; export and human review appear as later optional refinements, not equal competing tiers. No video/autoplay. At desktop the visible image and free starting choice both appear in the first viewport; at mobile the image is a shallow place strip and never pushes the recommended choice below 844px.
- Local Expertise: Cover still plus field-note evidence, what reviewers check, what they do not promise, turnaround, and one CTA.
- Support: Utility topic index, self-service recovery actions, contact boundary, response expectation, and escalation path; use disclosure groups instead of six white cards.
- Feedback: selected-day context, compact rating controls, specific text feedback, privacy note, success state, and one coherent empty-state action.

- [ ] **Step 4: Remove the coupled How/Pricing CSS selectors**

Replace shared selector blocks around the existing How/Pricing styles with route-owned class groups. Keep tokens shared; do not keep a shared dark rounded opening chapter solely to make both pages look related.

- [ ] **Step 5: Run focused Axe and responsive checks**

Run: `pnpm --dir apps/web exec playwright test playwright/tests/accessibility.spec.ts playwright/tests/viewport-contract.spec.ts --config playwright.config.ts --grep "how-it-works|pricing|local-expertise|support|feedback" --workers=1`

For Pricing, assert the image has a non-zero natural size, a visible bounding box, and no overlay above 55% opacity. Expected: one main/H1, 44px controls, perceptible media, no mobile overflow, and correct heading order.

- [ ] **Step 6: Commit the trust/acquisition family**

```bash
git add apps/web/app/'(marketing)'/how-it-works/page.tsx apps/web/app/'(marketing)'/how-it-works/page.test.tsx apps/web/app/'(marketing)'/pricing/page.tsx apps/web/app/'(marketing)'/pricing/page.test.tsx apps/web/app/'(marketing)'/local-expertise/page.tsx apps/web/app/'(marketing)'/local-expertise/page.test.tsx apps/web/app/support/layout.tsx apps/web/app/support/page.tsx apps/web/app/support/page.test.tsx apps/web/app/'(marketing)'/feedback/page.tsx apps/web/app/'(marketing)'/feedback/activity-feedback-form.tsx apps/web/app/'(marketing)'/feedback/activity-feedback-form.test.tsx apps/web/app/globals.css
git commit -m "feat(frontend): give trust routes distinct compositions"
```

### Task 9: Finish legal, sustainability, sign-in, offline, and not-found surfaces

**Files:**

- Modify: `apps/web/app/_components/legal-page.tsx`
- Create: `apps/web/app/_components/legal-page.test.tsx`
- Modify: `apps/web/app/privacy/page.tsx`
- Modify: `apps/web/app/terms/page.tsx`
- Modify: `apps/web/app/sustainability/page.tsx`
- Create: `apps/web/app/sustainability/page.test.tsx`
- Modify: `apps/web/app/sign-in/page.tsx`
- Modify: `apps/web/app/sign-in/page.test.tsx`
- Modify: `apps/web/app/sign-in/_components/sign-in-form.tsx`
- Modify: `apps/web/app/sign-in/_components/sign-in-form.test.tsx`
- Modify: `apps/web/app/offline/page.tsx`
- Modify: `apps/web/app/not-found.tsx`
- Create or modify: `apps/web/app/not-found.test.tsx`

**Interfaces:**

- Legal pages share reading mechanics, not one dark-rail/white-card composition.
- Sustainability uses a static Cover and evidence list; sign-in/auth uses a static place crop and Utility surface; neither autoplays.

- [ ] **Step 1: Write reading-navigation and auth-media tests**

```tsx
it("links every legal section from the contents navigation", () => {
  render(<LegalPage title="Privacy" summary="Summary" sections={SECTIONS} />);
  for (const section of SECTIONS) {
    expect(screen.getByRole("link", { name: section.heading })).toHaveAttribute("href", `#${section.id}`);
    expect(screen.getByRole("heading", { name: section.heading })).toHaveAttribute("id", section.id);
  }
});

it("uses a static sign-in place crop", async () => {
  const { container } = render(await SignInPage({ searchParams: Promise.resolve({}) }));
  expect(screen.getByTestId("sign-in-place-media")).toHaveAttribute("data-motion-policy", "poster-only");
  expect(container.querySelector("video")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run focused tests and verify missing structures**

Run: `pnpm exec vitest run apps/web/app/_components/legal-page.test.tsx apps/web/app/sustainability/page.test.tsx apps/web/app/sign-in/page.test.tsx apps/web/app/sign-in/_components/sign-in-form.test.tsx apps/web/app/not-found.test.tsx`

Expected: FAIL for missing contents IDs/static media/recovery structure.

- [ ] **Step 3: Implement typography-led reading layouts**

Desktop uses a compact sticky contents rail and 45–75 character reading column. Mobile contents becomes a native disclosure before the document. Remove nested contour, near-opaque hero, and oversized summary card. Privacy and Terms retain their own sections/copy; sustainability uses a static landscape Cover followed by measurable commitments/evidence, not the legal template.

- [ ] **Step 4: Finish sign-in and system recovery hierarchy**

Sign-in is form-first, texture-free, and uses one static local crop. Keep loading, invalid credentials, sanitized legacy query, provider unavailable, and signed-in redirect distinct. Offline and not-found put status, recovery action, and safe links before any supporting copy; the compact footer must not enter the first viewport on desktop.

- [ ] **Step 5: Prove reading, zoom, and no-autoplay behavior**

Run: `pnpm --dir apps/web exec playwright test playwright/tests/accessibility.spec.ts playwright/tests/viewport-contract.spec.ts --config playwright.config.ts --grep "privacy|terms|sustainability|sign-in|offline|not-found" --workers=1`

Expected: PASS at 200% zoom and all four viewports; no video element on these routes; contents links focus the correct section.

- [ ] **Step 6: Commit reading/auth/system routes**

```bash
git add apps/web/app/_components/legal-page.tsx apps/web/app/_components/legal-page.test.tsx apps/web/app/privacy/page.tsx apps/web/app/terms/page.tsx apps/web/app/sustainability/page.tsx apps/web/app/sustainability/page.test.tsx apps/web/app/sign-in/page.tsx apps/web/app/sign-in/page.test.tsx apps/web/app/sign-in/_components/sign-in-form.tsx apps/web/app/sign-in/_components/sign-in-form.test.tsx apps/web/app/offline/page.tsx apps/web/app/not-found.tsx apps/web/app/not-found.test.tsx
git commit -m "feat(frontend): finish reading auth and recovery surfaces"
```

### Task 10: Strengthen Planner and trip creation decision hierarchy

**Files:**

- Modify: `apps/web/app/planner/page.tsx`
- Modify: `apps/web/app/planner/_components/planner-single-screen.tsx`
- Modify: `apps/web/app/planner/_components/planner-single-screen.test.tsx`
- Modify: `apps/web/app/planner/_components/activity-day-planner.tsx`
- Modify or create: `apps/web/app/planner/_components/activity-day-planner.test.tsx`
- Modify: `apps/web/app/(app)/trip/new/page.tsx`
- Modify: `apps/web/app/(app)/trip/new/trip-brief-review.tsx`
- Modify or create: `apps/web/app/(app)/trip/new/trip-brief-review.test.tsx`
- Modify: `packages/ui/src/components/choice-card.tsx`
- Modify: `packages/ui/src/components/choice-card.test.tsx`
- Modify: `packages/ui/src/components/option-sheet.tsx`
- Modify: `packages/ui/src/components/option-sheet.test.tsx`
- Modify: `apps/web/playwright/tests/choice-led-traveler.spec.ts`
- Modify: `apps/web/playwright/tests/trip-create.spec.ts`

**Interfaces:**

- Selected choices have unmistakable border, field, icon, and `aria-checked`/`aria-pressed` differences.
- Planner remains immersive and form-first on mobile; trip creation uses the same Decision vocabulary without duplicating the planner.

- [ ] **Step 1: Write selected-state and mobile-progress tests**

```tsx
it("visually and semantically distinguishes the selected choice", async () => {
  const user = userEvent.setup();
  render(<PlannerSingleScreen />);
  const porto = screen.getByRole("radio", { name: /Porto/i });
  await user.click(porto);
  expect(porto).toHaveAttribute("aria-checked", "true");
  expect(porto).toHaveAttribute("data-selected", "true");
  expect(screen.getByTestId("planner-summary")).toHaveTextContent("Porto");
});
```

- [ ] **Step 2: Run component tests and verify the selected-state gap**

Run: `pnpm exec vitest run packages/ui/src/components/choice-card.test.tsx packages/ui/src/components/option-sheet.test.tsx apps/web/app/planner/_components/planner-single-screen.test.tsx apps/web/app/planner/_components/activity-day-planner.test.tsx apps/web/app/'(app)'/trip/new/trip-brief-review.test.tsx`

Expected: FAIL until stable selected markers and summary/progress contracts exist.

- [ ] **Step 3: Refine Planner rather than re-template it**

Keep the successful midnight Decision field, form-first mobile grouping, and contextual still. Increase selected/unselected contrast without relying on color alone. Keep the summary sticky only on desktop. On mobile, the current decision comes first and a compact summary/progress control follows; no fixed tray may obscure the last option.

- [ ] **Step 4: Recompose trip creation into progressive sections**

Use explicit current/completed/upcoming progress and a desktop contextual still/summary rail. On mobile, show the current section, completed-choice summary, and one continue action instead of an uninterrupted stack of edit pills. Remove any accommodation-search framing from visible choices; existing stored fields remain untouched.

- [ ] **Step 5: Prove keyboard, focus handoff, restoration, and mobile length**

Test arrow-key radio navigation, OptionSheet focus return, query restoration, validation focus, progress announcement, and that the primary action remains reachable at 390×844 without passing through every edit card.

Run: `pnpm --dir apps/web exec playwright test playwright/tests/choice-led-traveler.spec.ts playwright/tests/trip-create.spec.ts --config playwright.config.ts --workers=1`

Expected: PASS at all four viewports.

- [ ] **Step 6: Commit Planner/trip creation**

```bash
git add apps/web/app/planner/page.tsx apps/web/app/planner/_components/planner-single-screen.tsx apps/web/app/planner/_components/planner-single-screen.test.tsx apps/web/app/planner/_components/activity-day-planner.tsx apps/web/app/planner/_components/activity-day-planner.test.tsx apps/web/app/'(app)'/trip/new/page.tsx apps/web/app/'(app)'/trip/new/trip-brief-review.tsx apps/web/app/'(app)'/trip/new/trip-brief-review.test.tsx packages/ui/src/components/choice-card.tsx packages/ui/src/components/choice-card.test.tsx packages/ui/src/components/option-sheet.tsx packages/ui/src/components/option-sheet.test.tsx apps/web/playwright/tests/choice-led-traveler.spec.ts apps/web/playwright/tests/trip-create.spec.ts
git commit -m "feat(frontend): clarify planner and trip creation decisions"
```

### Task 11: Give trip, map, export, and logistics distinct task compositions

**Files:**

- Modify: `apps/web/app/(app)/trip/[tripId]/page.tsx`
- Modify: `apps/web/app/(app)/trip/[tripId]/_components/workspace-trip-canvas.tsx`
- Modify: `apps/web/app/(app)/trip/[tripId]/_components/stop-filmstrip.tsx`
- Modify: `apps/web/app/(app)/trip/[tripId]/_components/trip-context-bar-client.tsx`
- Modify: `apps/web/app/(app)/trip/[tripId]/map/page.tsx`
- Modify: `apps/web/app/(app)/trip/[tripId]/map/map-components.tsx`
- Modify: `apps/web/app/(app)/trip/[tripId]/map/route-story-controls.tsx`
- Modify: `apps/web/app/(app)/trip/[tripId]/export/page.tsx`
- Modify: `apps/web/app/logistics/page.tsx`
- Modify: `apps/web/app/_components/logistics/mobility-tiles.tsx`
- Modify: `apps/web/app/_components/logistics/mobility-tiles.test.tsx`
- Modify: `apps/web/playwright/tests/trip-lifecycle.spec.ts`
- Modify: `apps/web/playwright/tests/integration/trip-map.spec.ts`

**Interfaces:**

- Trip uses a Decision sequence; map uses an Atlas composition; export uses Utility; logistics uses Decision consequences.
- List order/state is authoritative and remains equivalent when MapLibre is unavailable.

- [ ] **Step 1: Write selected-stop, map/list parity, and export-status tests**

```ts
test("selected stop remains visible in list and map controls", async ({ page }) => {
  await page.goto(travelerTripPath());
  await page.getByRole("button", { name: /select stop 2/i }).click();
  await expect(page.getByTestId("trip-stop-2")).toHaveAttribute("data-selected", "true");
  await expect(page.getByTestId("trip-context-summary")).toContainText(/stop 2/i);
});

test("map fallback contains every route stop", async ({ page }) => {
  await page.goto(travelerTripPath("/map?map=unavailable"));
  await expect(page.getByTestId("route-list-fallback").getByRole("listitem"))
    .toHaveCount(await page.getByTestId("route-stop-count").evaluate((node) => Number(node.textContent)));
});
```

- [ ] **Step 2: Run focused trip/map tests and verify hierarchy failures**

Run: `pnpm exec vitest run apps/web/app/_components/logistics/mobility-tiles.test.tsx && pnpm --dir apps/web exec playwright test playwright/tests/trip-lifecycle.spec.ts playwright/tests/integration/trip-map.spec.ts --config playwright.config.ts --workers=1`

Expected: at least one selected-state, parity, or responsive assertion fails before migration.

- [ ] **Step 3: Migrate persisted trip away from the repeated long guide template**

Render a task-oriented sequence with stop index, selected state, verdict/caveat, travel consequence, edit/remove/reorder actions, and persistent desktop summary. Mobile uses a compact context bar and list-first order. Do not globally rewrite `CinematicGuide`; migrate this route explicitly so other consumers are not silently changed.

- [ ] **Step 4: Make the map an Atlas tool, not a camera story**

Desktop displays map and authoritative list/control rail. Mobile opens map only after user action and provides a clear return to list. Route warnings, stop order, selected stop, and travel consequences must exist outside the canvas. Remove or keep disabled automatic camera storytelling.

- [ ] **Step 5: Make export and logistics truthful utilities**

Export shows pending, ready, failure/retry, and delivery status with one next action. Logistics shows selected transport, time/cost trade-off, route consequence, and unavailable fallback without pretending to search bookings or accommodation.

- [ ] **Step 6: Run lifecycle, Axe, and mobile overflow tests**

Run: `pnpm --dir apps/web exec playwright test playwright/tests/trip-lifecycle.spec.ts playwright/tests/integration/trip-map.spec.ts playwright/tests/accessibility.spec.ts playwright/tests/mobile-overflow.spec.ts --config playwright.config.ts --grep "trip|map|export|logistics" --workers=1`

Expected: PASS with no automatic camera dependency or document overflow.

- [ ] **Step 7: Commit the persisted-trip family**

```bash
git add apps/web/app/'(app)'/trip/'[tripId]'/page.tsx apps/web/app/'(app)'/trip/'[tripId]'/_components/workspace-trip-canvas.tsx apps/web/app/'(app)'/trip/'[tripId]'/_components/stop-filmstrip.tsx apps/web/app/'(app)'/trip/'[tripId]'/_components/trip-context-bar-client.tsx apps/web/app/'(app)'/trip/'[tripId]'/map/page.tsx apps/web/app/'(app)'/trip/'[tripId]'/map/map-components.tsx apps/web/app/'(app)'/trip/'[tripId]'/map/route-story-controls.tsx apps/web/app/'(app)'/trip/'[tripId]'/export/page.tsx apps/web/app/logistics/page.tsx apps/web/app/_components/logistics/mobility-tiles.tsx apps/web/app/_components/logistics/mobility-tiles.test.tsx apps/web/playwright/tests/trip-lifecycle.spec.ts apps/web/playwright/tests/integration/trip-map.spec.ts
git commit -m "feat(frontend): separate trip map export and logistics tasks"
```

### Task 12: Differentiate traveler archives, Account, Vault, and Checkout

**Files:**

- Modify: `apps/web/app/itineraries/page.tsx`
- Modify: `apps/web/app/itineraries/_components/itinerary-search.tsx`
- Modify: `apps/web/app/itineraries/_components/itinerary-search.test.tsx`
- Modify: `apps/web/app/itineraries/_components/itinerary-export-drawer.tsx`
- Modify: `apps/web/app/vault/page.tsx`
- Modify: `apps/web/app/vault/_components/vault-gallery.tsx`
- Modify: `apps/web/app/vault/_components/vault-gallery.test.tsx`
- Modify: `apps/web/app/(app)/account/page.tsx`
- Modify: `apps/web/app/(app)/account/_components/account-trips-state.tsx`
- Modify: `apps/web/app/(app)/account/_components/account-trips-state.test.tsx`
- Modify: `apps/web/app/(app)/account/_components/trip-card.tsx`
- Modify: `apps/web/app/(app)/account/_components/trip-card.test.tsx`
- Modify: `apps/web/app/checkout/page.tsx`
- Modify: `apps/web/app/checkout/page.test.tsx`
- Modify: `apps/web/app/checkout/_components/package-selector.tsx`
- Modify: `apps/web/playwright/tests/traveler-lifecycle.spec.ts`
- Modify: `apps/web/playwright/tests/itinerary-export-drawer.spec.ts`

**Interfaces:**

- Itineraries is an archive/search task; Vault is an asset/export task; Account is a settings/identity task. They may share cards/tokens but not the same page composition.
- Checkout never renders a partial purchase flow without a valid owned trip.

- [ ] **Step 1: Write route-identity and state tests**

```tsx
it("gives archive, assets, and settings distinct task markers", () => {
  expect(renderItineraries().getByTestId("itineraries-archive")).toBeInTheDocument();
  expect(renderVault().getByTestId("vault-assets")).toBeInTheDocument();
  expect(renderAccount().getByTestId("account-settings")).toBeInTheDocument();
});

it("shows one no-trip checkout action", async () => {
  render(await CheckoutPage({ searchParams: Promise.resolve({}) }));
  expect(screen.getAllByRole("link", { name: /choose activities|start a day/i })).toHaveLength(1);
  expect(screen.queryByTestId("package-selector")).not.toBeInTheDocument();
});

it("uses distinct inverse decision states for empty archive and vault", () => {
  expect(renderItinerariesEmpty().getByTestId("decision-state-panel")).toHaveAttribute("data-tone", "inverse");
  expect(renderVaultEmpty().getByTestId("decision-state-panel")).toHaveAttribute("data-tone", "inverse");
  expect(renderItinerariesEmpty().getByRole("link", { name: /choose activities/i })).toBeVisible();
  expect(renderVaultEmpty().getByRole("link", { name: /open itineraries/i })).toBeVisible();
});
```

- [ ] **Step 2: Run focused archive/commerce tests and verify failures**

Run: `pnpm exec vitest run apps/web/app/itineraries/_components/itinerary-search.test.tsx apps/web/app/vault/_components/vault-gallery.test.tsx apps/web/app/'(app)'/account/_components/account-trips-state.test.tsx apps/web/app/'(app)'/account/_components/trip-card.test.tsx apps/web/app/checkout/page.test.tsx`

Expected: FAIL for missing distinct task markers or incomplete state contracts.

- [ ] **Step 3: Remove the cloned dark side rail**

- Itineraries: search/filter first, chronological or list cards, export drawer tied to one selected itinerary. No saved work uses `DecisionStatePanel kind="empty" tone="inverse"` with an archive-specific illustration and “Choose activities” action; filtered-empty uses a compact inverse state with “Clear filters”.
- Vault: asset cover, format/status, updated time, download/retry action, grid/list toggle. No assets uses `DecisionStatePanel kind="empty" tone="inverse"` with a vault-specific illustration and “Open itineraries”; unavailable remains a light recovery panel so absence and outage cannot be confused.
- Account: identity and security first, preferences/consent second, saved work summary third; destructive/sign-out actions are separated.

Use one Utility field, restrained dividers, and task-specific page markers. Do not add decorative video.

- [ ] **Step 4: Finish Checkout state hierarchy**

No-trip: one DecisionStatePanel and one action. Valid trip: compact owned-trip summary, recommended current choice, price/value, optional refinement, payment state, and recovery. Paid state does not continue to show an active purchase CTA.

- [ ] **Step 5: Run traveler lifecycle and responsive checks**

Run: `pnpm --dir apps/web exec playwright test playwright/tests/traveler-lifecycle.spec.ts playwright/tests/itinerary-export-drawer.spec.ts playwright/tests/mobile-overflow.spec.ts --config playwright.config.ts --grep "itineraries|vault|account|checkout" --workers=1`

Expected: empty, populated, filtered-empty, unavailable, no-trip, valid-trip, and paid states pass at desktop/mobile.

- [ ] **Step 6: Commit traveler Utility routes**

```bash
git add apps/web/app/itineraries/page.tsx apps/web/app/itineraries/_components/itinerary-search.tsx apps/web/app/itineraries/_components/itinerary-search.test.tsx apps/web/app/itineraries/_components/itinerary-export-drawer.tsx apps/web/app/vault/page.tsx apps/web/app/vault/_components/vault-gallery.tsx apps/web/app/vault/_components/vault-gallery.test.tsx apps/web/app/'(app)'/account/page.tsx apps/web/app/'(app)'/account/_components/account-trips-state.tsx apps/web/app/'(app)'/account/_components/account-trips-state.test.tsx apps/web/app/'(app)'/account/_components/trip-card.tsx apps/web/app/'(app)'/account/_components/trip-card.test.tsx apps/web/app/checkout/page.tsx apps/web/app/checkout/page.test.tsx apps/web/app/checkout/_components/package-selector.tsx apps/web/playwright/tests/traveler-lifecycle.spec.ts apps/web/playwright/tests/itinerary-export-drawer.spec.ts
git commit -m "feat(frontend): differentiate traveler utility routes"
```

### Task 13: Make beta, Guide, Expert Chat, and B2B states truthful

**Files:**

- Modify: `apps/web/app/_components/beta-unavailable.tsx`
- Modify: `apps/web/app/_components/beta-unavailable.test.tsx`
- Create: `apps/web/app/guide/layout.tsx`
- Modify: `apps/web/app/guide/page.tsx`
- Modify: `apps/web/app/guide/onboarding/page.tsx`
- Create or modify: `apps/web/app/guide/onboarding/page.test.tsx`
- Create: `apps/web/app/expert-chat/layout.tsx`
- Modify: `apps/web/app/expert-chat/page.tsx`
- Modify: `apps/web/app/expert-chat/_components/expert-chat.tsx`
- Modify: `apps/web/app/expert-chat/_components/expert-chat.test.tsx`
- Modify: `apps/web/app/b2b/page.tsx`
- Modify: `apps/web/app/b2b/[orgSlug]/page.tsx`
- Create: `apps/web/app/b2b/[orgSlug]/page.test.tsx`

**Interfaces:**

- `BetaUnavailablePanel` is chrome-agnostic; route layouts own the single main/nav/footer.
- Organization-ready is deliberately absent. No request calls `getOrgBySlug` before a separately authorized membership contract exists.

- [ ] **Step 1: Split the unavailable panel and write boundary tests**

```tsx
export function BetaUnavailablePanel(props: BetaUnavailablePanelProps) {
  return <DecisionStatePanel kind="unavailable" tone="light" {...props} />;
}

it("does not add its own page chrome", () => {
  render(<BetaUnavailablePanel title="Private beta" description="Not available yet." />);
  expect(screen.queryByTestId("site-footer")).not.toBeInTheDocument();
  expect(screen.queryByRole("main")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run beta/chat/B2B tests and verify failures**

Run: `pnpm exec vitest run apps/web/app/_components/beta-unavailable.test.tsx apps/web/app/guide/onboarding/page.test.tsx apps/web/app/expert-chat/_components/expert-chat.test.tsx apps/web/app/b2b/'[orgSlug]'/page.test.tsx`

Expected: FAIL until the panel is chrome-agnostic and B2B prevents unauthorized lookup.

- [ ] **Step 3: Implement route-specific gated states**

- Guide: disabled, signed-out exact return, candidate new/draft/saved, unavailable, and error. Mobile is form-first; desktop may use one static context rail.
- Expert Chat: disabled, no trip, foreign trip, unpaid/unreviewed, eligible ready, loading, send error, and saved message. Composer respects the mobile safe area.
- B2B index: concise private-beta/eligibility gateway; never redirect anonymous visitors to a default organization.
- B2B organization: signed-out and enabled requests render generic unauthorized/unavailable responses without resolving or disclosing the organization slug. Do not implement a ready state under this plan.

- [ ] **Step 4: Add exact authorization assertions**

```ts
expect(getOrgBySlug).not.toHaveBeenCalled();
expect(screen.queryByText(/organization name|branding|slug/i)).not.toBeInTheDocument();
expect(screen.getByRole("heading", { name: /workspace is not available/i })).toBeVisible();
```

- [ ] **Step 5: Run feature-flag, auth, and responsive tests**

Run: `pnpm --dir apps/web exec playwright test playwright/tests/protected-routes.spec.ts playwright/tests/viewport-contract.spec.ts --config playwright.config.ts --grep "guide|expert-chat|b2b" --workers=1`

Expected: disabled/signed-out/ineligible/unavailable/eligible-chat states are distinct; no organization data is disclosed; no nested main/footer exists.

- [ ] **Step 6: Commit gated surfaces**

```bash
git add apps/web/app/_components/beta-unavailable.tsx apps/web/app/_components/beta-unavailable.test.tsx apps/web/app/guide/layout.tsx apps/web/app/guide/page.tsx apps/web/app/guide/onboarding/page.tsx apps/web/app/guide/onboarding/page.test.tsx apps/web/app/expert-chat/layout.tsx apps/web/app/expert-chat/page.tsx apps/web/app/expert-chat/_components/expert-chat.tsx apps/web/app/expert-chat/_components/expert-chat.test.tsx apps/web/app/b2b/page.tsx apps/web/app/b2b/'[orgSlug]'/page.tsx apps/web/app/b2b/'[orgSlug]'/page.test.tsx
git commit -m "fix(frontend): make gated product states truthful"
```

### Task 14: Enforce catalogue access and converge on one operator shell

**Files:**

- Create: `apps/web/lib/auth/page-access.ts`
- Create: `apps/web/lib/auth/page-access.test.ts`
- Modify: `apps/web/lib/auth/admin.ts`
- Create or modify: `apps/web/lib/auth/admin.test.ts`
- Modify: `apps/web/lib/auth/authorization.ts`
- Modify: `apps/web/lib/auth/authorization.test.ts`
- Modify: `apps/web/lib/auth/api.ts`
- Modify: `apps/web/lib/auth/api.test.ts`
- Modify: `packages/ui/src/components/operator-shell.tsx`
- Modify: `packages/ui/src/components/operator-shell.test.tsx`
- Modify: `apps/web/app/(reviewer)/reviewer/layout.tsx`
- Modify: `apps/web/app/(admin)/admin/layout.tsx`
- Modify: `apps/web/app/console/layout.tsx`
- Modify: `apps/web/app/api/v1/docs/page.tsx`
- Create or modify: `apps/web/app/api/v1/docs/page.test.tsx`
- Modify: `apps/web/app/_components/operator-loading.tsx`
- Modify: `apps/web/app/api/places/route.ts`
- Modify: `apps/web/app/api/places/[placeId]/route.ts`
- Modify: `apps/web/app/api/places/route.test.ts`
- Modify: `apps/web/app/api/regions/route.ts`
- Modify: `apps/web/app/api/regions/[regionId]/route.ts`
- Create: `apps/web/app/api/regions/route.test.ts`
- Modify: `apps/web/app/api/partners/route.ts`
- Create: `apps/web/app/api/partners/route.test.ts`
- Modify: `apps/web/app/api/reviewers/route.ts`
- Modify: `apps/web/app/api/reviewers/[reviewerId]/route.ts`
- Create: `apps/web/app/api/reviewers/route.test.ts`
- Modify: `apps/web/app/api/reviewer-assignments/route.ts`
- Modify: `apps/web/app/api/reviewer-assignments/[assignmentId]/route.ts`
- Modify: `apps/web/app/api/reviewer-assignments/route.test.ts`
- Modify: `apps/web/app/api/console/chat-messages/route.ts`
- Create: `apps/web/app/api/console/chat-messages/route.test.ts`
- Modify: `apps/web/app/api/console/itinerary-events/route.ts`
- Create: `apps/web/app/api/console/itinerary-events/route.test.ts`
- Modify: `apps/web/app/api/console/pipeline/move/route.ts`
- Create: `apps/web/app/api/console/pipeline/move/route.test.ts`
- Modify: `apps/web/app/console/_components/message-triage.ts`
- Create: `apps/web/app/console/_components/message-triage.test.ts`
- Modify: `apps/web/app/(admin)/admin/specialists/actions.ts`
- Create: `apps/web/app/(admin)/admin/specialists/actions.test.ts`
- Modify: `apps/web/playwright/tests/protected-routes.spec.ts`
- Delete after migration: `apps/web/app/console/_components/console-nav.tsx`

**Interfaces:**

- `resolveHttpRoute(pathname)` returns the catalogue route including required capability and handles dynamic path patterns.
- `requirePageAccess` returns `ready | unauthenticated | forbidden | unavailable`; provider failure never becomes sign-out or forbidden.
- `OperatorShell` supports reviewer, admin, console, and developer navigation with capability filtering, one main landmark, one mobile disclosure, and optional wide content.

- [ ] **Step 1: Write failing access and shell tests**

```ts
it("requires both admin role and the route capability", async () => {
  await expect(requirePageAccess(
    { anyRole: ["admin"], allCapabilities: ["analytics:read"] },
    { loadActorOutcome: async () => ({ kind: "ready", actor: { userId: "1", roles: ["admin"], capabilities: [], reviewerId: null } }) }
  )).resolves.toEqual({ kind: "forbidden" });
});

it("keeps provider failure distinct", async () => {
  await expect(requirePageAccess(
    { anyRole: ["admin"] },
    { loadActorOutcome: async () => ({ kind: "unavailable" }) }
  )).resolves.toEqual({ kind: "unavailable" });
});
```

```tsx
it("renders console inside the shared operator shell", () => {
  render(<OperatorShell section="console" capabilities={["operations:manage"]} currentPath="/console/workspace" user={{ name: "Ops" }}>Work</OperatorShell>);
  expect(screen.getByTestId("operator-main")).toContainElement(screen.getByText("Work"));
  expect(screen.getByRole("link", { name: /workspace/i })).toHaveAttribute("aria-current", "page");
});
```

- [ ] **Step 2: Run auth/shell tests and verify failures**

Run: `pnpm exec vitest run apps/web/lib/auth/page-access.test.ts apps/web/lib/auth/admin.test.ts apps/web/lib/auth/authorization.test.ts apps/web/lib/auth/api.test.ts packages/ui/src/components/operator-shell.test.tsx`

Expected: FAIL because page access and console shell contracts do not exist.

- [ ] **Step 3: Implement catalogue-derived page access**

```ts
export type PageAccessResult =
  | { kind: "ready"; actor: AuthorizedActor }
  | { kind: "unauthenticated" }
  | { kind: "forbidden" }
  | { kind: "unavailable" };

export async function requirePageAccess(
  requirement: AccessRequirement,
  dependencies: AuthorizationDependencies = { loadActorOutcome: loadCurrentAuthorizedActorOutcome }
): Promise<PageAccessResult> {
  const outcome = await dependencies.loadActorOutcome();
  if (outcome.kind === "anonymous") return { kind: "unauthenticated" };
  if (outcome.kind === "unavailable") return outcome;
  const { actor } = outcome;
  if (requirement.anyRole && !requirement.anyRole.some((role) => actor.roles.includes(role))) return { kind: "forbidden" };
  if (requirement.allCapabilities?.some((capability) => !actor.capabilities.includes(capability))) return { kind: "forbidden" };
  return { kind: "ready", actor };
}
```

Apply the catalogue capability mapping exactly:

- Places/countries/regions and Console graph: `content:manage`.
- Partners/reviewers/quality and Console pipeline/workspace/messages: `operations:manage`.
- Specialists and its server action: `specialists:verify`.
- Admin analytics and Console metrics: `analytics:read`.
- Console config: `configuration:deploy`.
- API docs: `developer_docs:read`.

Page guards do not replace matching mutation/API guards. Apply and test the same capability before parsing bodies or calling stores/actions:

| Write/read boundary | Capability |
| --- | --- |
| `POST /api/places`, `PATCH /api/places/[placeId]` | `content:manage` |
| `POST /api/regions`, `PATCH /api/regions/[regionId]` | `content:manage` |
| `POST /api/partners` | `operations:manage` |
| `POST /api/reviewers`, `PATCH /api/reviewers/[reviewerId]` | `operations:manage` |
| `POST /api/reviewer-assignments`, `PATCH /api/reviewer-assignments/[assignmentId]` | `operations:manage` |
| Console chat GET/POST, itinerary-events GET/POST, pipeline move POST | `operations:manage` |
| `triageInboundMessage` server action | `operations:manage` |
| Specialist verification server action | `specialists:verify` |

Anonymous, wrong-role, and limited-capability requests must return before validation/store/AI calls. API routes preserve the shared `{code,message}` error envelope and never return `admin.reason`, raw exceptions, store errors, or provider details. Server actions use the equivalent typed, sanitized `unauthenticated | forbidden | unavailable` result.

- [ ] **Step 4: Write and run boundary tests for every mutation/API**

Each test above asserts anonymous, wrong role, limited capability, provider unavailable, and authorized behavior; spies prove the store, AI classifier, and mutation are not called on denial. Run:

```bash
pnpm exec vitest run apps/web/app/api/places/route.test.ts apps/web/app/api/regions/route.test.ts apps/web/app/api/partners/route.test.ts apps/web/app/api/reviewers/route.test.ts apps/web/app/api/reviewer-assignments/route.test.ts apps/web/app/api/console/chat-messages/route.test.ts apps/web/app/api/console/itinerary-events/route.test.ts apps/web/app/api/console/pipeline/move/route.test.ts apps/web/app/console/_components/message-triage.test.ts apps/web/app/'(admin)'/admin/specialists/actions.test.ts
```

Expected: red before guards, then green with the exact capability table above and sanitized errors.

- [ ] **Step 5: Extend `OperatorShell` and migrate console/API docs**

Add `section: "reviewer" | "admin" | "console" | "developer"`, `capabilities`, and `contentWidth: "standard" | "wide"`. Filter navigation using the same catalogue capabilities. Console and API docs load the actor once, preserve exact requested `next` on sign-in redirect, render unavailable/forbidden without private data, and use the shell's single main. Remove nested page `<main>`, fixed `md:ml-64`, and ornamental outer backgrounds before deleting `ConsoleNav`.

- [ ] **Step 6: Test anonymous, wrong-role, limited-admin, and authorized access**

Run: `pnpm --dir apps/web exec playwright test playwright/tests/protected-routes.spec.ts --config playwright.config.ts --grep "admin|reviewer|console|api/v1/docs" --workers=1`

Before this command, add explicit scenario-driven cases for every Console route and `/api/v1/docs`; do not rely on the current reviewer/admin-only list. Expected: exact-path sign-in redirect, wrong-role denial, limited-admin capability denial, provider-unavailable recovery, feature-disabled recovery, and authorized route all pass without private-content leakage.

- [ ] **Step 7: Commit access and shared operator chrome**

```bash
git add apps/web/lib/auth/page-access.ts apps/web/lib/auth/page-access.test.ts apps/web/lib/auth/admin.ts apps/web/lib/auth/admin.test.ts apps/web/lib/auth/authorization.ts apps/web/lib/auth/authorization.test.ts apps/web/lib/auth/api.ts apps/web/lib/auth/api.test.ts packages/ui/src/components/operator-shell.tsx packages/ui/src/components/operator-shell.test.tsx apps/web/app/'(reviewer)'/reviewer/layout.tsx apps/web/app/'(admin)'/admin/layout.tsx apps/web/app/console/layout.tsx apps/web/app/api/v1/docs/page.tsx apps/web/app/api/v1/docs/page.test.tsx apps/web/app/_components/operator-loading.tsx apps/web/app/api/places/route.ts apps/web/app/api/places/'[placeId]'/route.ts apps/web/app/api/places/route.test.ts apps/web/app/api/regions/route.ts apps/web/app/api/regions/'[regionId]'/route.ts apps/web/app/api/regions/route.test.ts apps/web/app/api/partners/route.ts apps/web/app/api/partners/route.test.ts apps/web/app/api/reviewers/route.ts apps/web/app/api/reviewers/'[reviewerId]'/route.ts apps/web/app/api/reviewers/route.test.ts apps/web/app/api/reviewer-assignments/route.ts apps/web/app/api/reviewer-assignments/'[assignmentId]'/route.ts apps/web/app/api/reviewer-assignments/route.test.ts apps/web/app/api/console/chat-messages/route.ts apps/web/app/api/console/chat-messages/route.test.ts apps/web/app/api/console/itinerary-events/route.ts apps/web/app/api/console/itinerary-events/route.test.ts apps/web/app/api/console/pipeline/move/route.ts apps/web/app/api/console/pipeline/move/route.test.ts apps/web/app/console/_components/message-triage.ts apps/web/app/console/_components/message-triage.test.ts apps/web/app/'(admin)'/admin/specialists/actions.ts apps/web/app/'(admin)'/admin/specialists/actions.test.ts apps/web/playwright/tests/protected-routes.spec.ts apps/web/app/console/_components/console-nav.tsx
git commit -m "fix(operator): enforce access in one shared shell"
```

### Task 15: Increase reviewer/admin density and truthful triage

**Files:**

- Modify: `apps/web/app/(reviewer)/reviewer/queue/page.tsx`
- Modify: `apps/web/app/(reviewer)/reviewer/history/page.tsx`
- Modify: `apps/web/app/(reviewer)/reviewer/profile/page.tsx`
- Modify: `apps/web/app/(reviewer)/reviewer/operations/page.tsx`
- Modify: `apps/web/app/(reviewer)/reviewer/trips/[tripId]/page.tsx`
- Modify: `apps/web/app/(admin)/admin/places/page.tsx`
- Modify: `apps/web/app/(admin)/admin/countries/page.tsx`
- Modify: `apps/web/app/(admin)/admin/regions/page.tsx`
- Modify: `apps/web/app/(admin)/admin/partners/page.tsx`
- Modify: `apps/web/app/(admin)/admin/reviewers/page.tsx`
- Modify: `apps/web/app/(admin)/admin/specialists/page.tsx`
- Modify: `apps/web/app/(admin)/admin/quality/page.tsx`
- Modify: `apps/web/app/(admin)/admin/analytics/page.tsx`
- Modify: `apps/web/app/(admin)/admin/places/place-editor.tsx`
- Modify: `apps/web/app/(admin)/admin/specialists/_components/flip-verification-form.tsx`
- Modify: `packages/ui/src/components/table.tsx`
- Modify: `packages/ui/src/components/badge.tsx`
- Create: `apps/web/playwright/tests/operator-responsive.spec.ts`
- Modify: `apps/web/playwright/tests/reviewer-assigned-access.spec.ts`

**Interfaces:**

- Reviewer/admin pages use shared header/filter/table/status/empty/error patterns, but preserve task-specific columns and actions.
- Missing production data renders unavailable or empty truthfully; hard-coded operational success metrics are forbidden.

- [ ] **Step 1: Write representative dense-layout tests**

```ts
test("reviewer queue retains triage actions on mobile", async ({ page }) => {
  await page.goto("/reviewer/queue");
  await expect(page.getByTestId("reviewer-queue-mobile").getByRole("button")).toHaveCount(2);
  await expect(page.getByTestId("reviewer-queue-mobile")).not.toHaveCSS("overflow-x", "visible");
});

test("admin places keeps filters and actions above the fold", async ({ page }) => {
  await page.goto("/admin/places");
  await expect(page.getByTestId("admin-filter-bar")).toBeVisible();
  await expect(page.getByRole("button", { name: /add place/i })).toBeVisible();
});
```

- [ ] **Step 2: Run representative operator tests and verify failures**

Run: `pnpm --dir apps/web exec playwright test playwright/tests/operator-responsive.spec.ts playwright/tests/reviewer-assigned-access.spec.ts --config playwright.config.ts --grep "reviewer queue|admin places|specialists|analytics" --workers=1`

Expected: FAIL for missing mobile task structures or above-fold density.

- [ ] **Step 3: Standardize reviewer routes**

Queue and history use dense desktop tables plus authored mobile cards. Profile separates identity/capacity/regions/languages/availability. Operations uses real assignment summaries or an unavailable state—remove worker, checkout, and email-preview sample numbers. Assigned trip keeps evidence and decision actions prominent, list-authoritative, and map-optional. Unassigned trips remain indistinguishable from unavailable resources.

- [ ] **Step 4: Standardize admin routes**

Use Places, Specialists, and Analytics as representative patterns for heading, filters, table/card density, selection, status badges, loading, empty, error, and forbidden states. Other admin routes consume the same primitives without copying exact columns. On mobile, use labelled local table scrollers or purpose-built cards; never widen the document.

- [ ] **Step 5: Verify every reviewer/admin route at desktop and mobile**

Run: `pnpm --dir apps/web exec playwright test playwright/tests/operator-responsive.spec.ts playwright/tests/accessibility.spec.ts playwright/tests/mobile-overflow.spec.ts --config playwright.config.ts --grep "reviewer|admin" --workers=1`

Expected: all 13 reviewer/admin pages have one H1, one main, no texture, no accidental empty column, usable empty/error states, and reachable 44px actions.

- [ ] **Step 6: Commit reviewer/admin convergence**

```bash
git add apps/web/app/'(reviewer)'/reviewer/queue/page.tsx apps/web/app/'(reviewer)'/reviewer/history/page.tsx apps/web/app/'(reviewer)'/reviewer/profile/page.tsx apps/web/app/'(reviewer)'/reviewer/operations/page.tsx apps/web/app/'(reviewer)'/reviewer/trips/'[tripId]'/page.tsx apps/web/app/'(admin)'/admin/places/page.tsx apps/web/app/'(admin)'/admin/countries/page.tsx apps/web/app/'(admin)'/admin/regions/page.tsx apps/web/app/'(admin)'/admin/partners/page.tsx apps/web/app/'(admin)'/admin/reviewers/page.tsx apps/web/app/'(admin)'/admin/specialists/page.tsx apps/web/app/'(admin)'/admin/quality/page.tsx apps/web/app/'(admin)'/admin/analytics/page.tsx apps/web/app/'(admin)'/admin/places/place-editor.tsx apps/web/app/'(admin)'/admin/specialists/_components/flip-verification-form.tsx packages/ui/src/components/table.tsx packages/ui/src/components/badge.tsx apps/web/playwright/tests/operator-responsive.spec.ts apps/web/playwright/tests/reviewer-assigned-access.spec.ts
git commit -m "feat(operator): converge reviewer and admin triage"
```

### Task 16: Repair Console mobile composition, truthful data, and API docs

**Files:**

- Modify: `apps/web/app/console/page.tsx`
- Modify: `apps/web/app/console/pipeline/page.tsx`
- Modify: `apps/web/app/console/pipeline/_components/pipeline-header.tsx`
- Modify: `apps/web/app/console/pipeline/_components/pipeline-page-client.tsx`
- Modify: `apps/web/app/console/pipeline/_components/pipeline-page-client.test.tsx`
- Modify: `apps/web/app/console/workspace/page.tsx`
- Modify: `apps/web/app/console/messages/page.tsx`
- Modify: `apps/web/app/console/messages/_components/conversation-list.tsx`
- Modify: `apps/web/app/console/messages/_components/message-thread.tsx`
- Modify: `apps/web/app/console/messages/_components/triage-panel.tsx`
- Modify: `apps/web/app/console/messages/_lib/conversations.ts`
- Modify: `apps/web/app/console/graph/page.tsx`
- Modify: `apps/web/app/console/metrics/page.tsx`
- Modify: `apps/web/app/console/config/page.tsx`
- Modify: `apps/web/app/console/_components/client-anchor-card.tsx`
- Modify: `apps/web/app/console/_components/kanban-card.tsx`
- Modify: `apps/web/app/console/_components/kanban-lane.tsx`
- Modify: `apps/web/app/console/_components/kpi-card.tsx`
- Modify: `apps/web/app/console/_components/pipeline-board.tsx`
- Create or modify: `apps/web/app/console/_components/pipeline-board.test.tsx`
- Modify: `apps/web/app/console/_components/prompt-multiplier.tsx`
- Modify: `apps/web/app/console/_components/raw-ai-vs-editable-panel.tsx`
- Modify: `apps/web/app/console/_components/relative-time.tsx`
- Modify: `apps/web/app/console/_components/snippet-card.tsx`
- Modify: `apps/web/app/console/_components/timeline-item.tsx`
- Modify: `apps/web/app/console/_components/validation-bar.tsx`
- Modify: `apps/web/app/console/_components/volume-chart.tsx`
- Create: `apps/web/app/console/_components/console-mobile-view-switcher.tsx`
- Create: `apps/web/app/console/_components/console-mobile-view-switcher.test.tsx`
- Modify: `apps/web/app/api/console/chat-messages/route.ts`
- Modify: `apps/web/app/api/console/chat-messages/store.ts`
- Modify after Task 14: `apps/web/app/api/console/chat-messages/route.test.ts`
- Modify: `apps/web/app/api/console/itinerary-events/route.ts`
- Modify: `apps/web/app/api/console/itinerary-events/store.ts`
- Modify after Task 14: `apps/web/app/api/console/itinerary-events/route.test.ts`
- Modify: `apps/web/app/api/console/pipeline/move/route.ts`
- Modify: `apps/web/app/api/console/pipeline/move/store.ts`
- Modify after Task 14: `apps/web/app/api/console/pipeline/move/route.test.ts`
- Modify: `apps/web/app/api/v1/docs/page.tsx`
- Create or modify: `apps/web/app/api/v1/docs/page.test.tsx`
- Create: `apps/web/playwright/tests/console-workspace-responsive.spec.ts`
- Modify: `apps/web/playwright/tests/pipeline-search-filter.spec.ts`

**Interfaces:**

- Console desktop preserves dense boards/panes; mobile uses explicit lane/pane switching instead of hiding content beyond a wide canvas.
- No fallback, fake, or sample data is presented as a successful operational result.
- Console config and API docs honor both feature flag and capability.
- `PipelineBoardState` is `{ kind: "ready"; items: readonly PipelineItem[] } | { kind: "empty" } | { kind: "unavailable" }`; only `ready` permits persisted move feedback.

- [ ] **Step 1: Write the mobile workspace and truthful-data tests first**

```ts
test("mobile workspace exposes every pane without a blank-page tail", async ({ page }) => {
  await page.goto("/console/workspace");
  await page.getByRole("tab", { name: "Timeline" }).click();
  await expect(page.getByTestId("workspace-timeline")).toBeVisible();
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByTestId("workspace-validation")).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("overflow-x", "visible");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

it("renders unavailable instead of fallback operational data", () => {
  render(<PipelineBoard state={{ kind: "unavailable" }} />);
  expect(screen.getByRole("heading", { name: /pipeline is unavailable/i })).toBeVisible();
  expect(screen.queryByText(/demo|fallback item|saved successfully/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run console tests and verify current failures**

Run: `pnpm exec vitest run apps/web/app/console/_components/console-mobile-view-switcher.test.tsx apps/web/app/console/_components/pipeline-board.test.tsx apps/web/app/console/pipeline/_components/pipeline-page-client.test.tsx apps/web/app/api/console/chat-messages/route.test.ts apps/web/app/api/console/itinerary-events/route.test.ts apps/web/app/api/console/pipeline/move/route.test.ts apps/web/app/api/v1/docs/page.test.tsx && pnpm --dir apps/web exec playwright test playwright/tests/console-workspace-responsive.spec.ts --config playwright.config.ts --workers=1`

Expected: FAIL for missing mobile switcher, oversized workspace document, or unguarded docs.

- [ ] **Step 3: Remove false operational readiness route by route**

- Pipeline: remove `FALLBACK_ITEMS`; absent feed is empty/unavailable, and a move is never announced as saved without persistence confirmation.
- Workspace: remove ambient SVG, fake trip, and functional-looking publish action; render selected real work or unavailable. Mobile tabs expose anchors, timeline, conflicts, and validation with no blank tail.
- Messages: remove hard-coded conversations from production rendering; show real source or unavailable. Mobile composer respects safe area.
- Graph: real Portugal place/region data or equivalent list/unavailable; no fake vector/count data.
- Metrics: real admin counts or unavailable; remove global regions, fake GMV, and dollar-denominated demo claims.
- Config: require `ENABLE_CONSOLE_CONFIG` plus `configuration:deploy`; unavailable/read-only when persistence is absent.

- [ ] **Step 4: Implement the responsive view switcher**

```tsx
export function ConsoleMobileViewSwitcher({ value, onChange, views }: Props) {
  return (
    <div role="tablist" aria-label="Workspace view" className="grid grid-cols-3 gap-2 lg:hidden">
      {views.map((view) => (
        <button
          key={view.value}
          role="tab"
          aria-selected={value === view.value}
          className="min-h-11 rounded-md border px-3"
          onClick={() => onChange(view.value)}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
```

Pipeline uses the same accessible idea for lane switching. Desktop retains all panes/lanes. Keyboard drag/drop must have an equivalent non-drag move action.

- [ ] **Step 5: Finish API docs as an operator Utility route**

Require `ENABLE_API_DOCS`, admin role, and `developer_docs:read`. Use sticky endpoint navigation on desktop and single-column sections on mobile. Code scrolls locally; parameter tables become responsive rows. Keep paused endpoints explicitly paused; expose no fake key issuance action.

- [ ] **Step 6: Run Console/API access, responsive, Axe, and overflow gates**

Run: `pnpm --dir apps/web exec playwright test playwright/tests/console-workspace-responsive.spec.ts playwright/tests/pipeline-search-filter.spec.ts playwright/tests/protected-routes.spec.ts playwright/tests/accessibility.spec.ts playwright/tests/mobile-overflow.spec.ts --config playwright.config.ts --grep "console|api/v1/docs" --workers=1`

Expected: anonymous access impossible, feature-disabled state truthful, mobile panes reachable, no blank tail or overflow, and no sample operational success.

- [ ] **Step 7: Commit Console/API work separately**

```bash
git add apps/web/app/console/page.tsx apps/web/app/console/pipeline/page.tsx apps/web/app/console/pipeline/_components/pipeline-header.tsx apps/web/app/console/pipeline/_components/pipeline-page-client.tsx apps/web/app/console/pipeline/_components/pipeline-page-client.test.tsx apps/web/app/console/workspace/page.tsx apps/web/app/console/messages/page.tsx apps/web/app/console/messages/_components/conversation-list.tsx apps/web/app/console/messages/_components/message-thread.tsx apps/web/app/console/messages/_components/triage-panel.tsx apps/web/app/console/messages/_lib/conversations.ts apps/web/app/console/graph/page.tsx apps/web/app/console/metrics/page.tsx apps/web/app/console/config/page.tsx apps/web/app/console/_components/client-anchor-card.tsx apps/web/app/console/_components/kanban-card.tsx apps/web/app/console/_components/kanban-lane.tsx apps/web/app/console/_components/kpi-card.tsx apps/web/app/console/_components/pipeline-board.tsx apps/web/app/console/_components/pipeline-board.test.tsx apps/web/app/console/_components/prompt-multiplier.tsx apps/web/app/console/_components/raw-ai-vs-editable-panel.tsx apps/web/app/console/_components/relative-time.tsx apps/web/app/console/_components/snippet-card.tsx apps/web/app/console/_components/timeline-item.tsx apps/web/app/console/_components/validation-bar.tsx apps/web/app/console/_components/volume-chart.tsx apps/web/app/console/_components/console-mobile-view-switcher.tsx apps/web/app/console/_components/console-mobile-view-switcher.test.tsx apps/web/app/api/console/chat-messages/route.ts apps/web/app/api/console/chat-messages/store.ts apps/web/app/api/console/chat-messages/route.test.ts apps/web/app/api/console/itinerary-events/route.ts apps/web/app/api/console/itinerary-events/store.ts apps/web/app/api/console/itinerary-events/route.test.ts apps/web/app/api/console/pipeline/move/route.ts apps/web/app/api/console/pipeline/move/store.ts apps/web/app/api/console/pipeline/move/route.test.ts apps/web/app/api/v1/docs/page.tsx apps/web/app/api/v1/docs/page.test.tsx apps/web/playwright/tests/console-workspace-responsive.spec.ts apps/web/playwright/tests/pipeline-search-filter.spec.ts
git commit -m "fix(operator): repair console truth and mobile triage"
```

### Task 17: Run the complete route/state, accessibility, performance, and human visual gate

**Files:**

- Create: `apps/web/playwright/visual-state-matrix.ts`
- Create: `apps/web/playwright/tests/route-scenes.spec.ts`
- Create: `apps/web/playwright/tests/loading-recovery.spec.ts`
- Create: `apps/web/playwright/tests/preference-accessibility.spec.ts`
- Create: `scripts/run-exact-artifact-gate.mjs`
- Modify: `package.json`
- Modify: `apps/web/playwright.config.ts`
- Modify: `apps/web/playwright/tests/visual.spec.ts`
- Modify or retire after migration: `apps/web/playwright/tests/catalogue-visual.spec.ts`
- Modify: `apps/web/playwright/tests/protected-routes.spec.ts`
- Modify: `apps/web/playwright/tests/accessibility.spec.ts`
- Modify: `apps/web/playwright/tests/mobile-overflow.spec.ts`
- Modify: `apps/web/playwright/tests/viewport-contract.spec.ts`
- Modify: `apps/web/playwright/tests/perf.spec.ts`
- Create: `docs/reviews/2026-07-16-rumia-cleanup-allowlist.md`
- Create: `docs/reviews/2026-07-16-rumia-snapshot-approval.md`
- Modify after proof: `docs/reviews/2026-07-15-rumia-frontend-finish-verification.md`
- Modify after proof: `docs/superpowers/PLAN-INDEX.md`

**Interfaces:**

- `ROUTE_PRESENTATION_CATALOGUE` drives scene/chrome expectations and `ROUTE_SCENARIO_CATALOGUE` drives scenario ID, persona, fixture/setup, state, access/transition, and viewport evidence; no suite owns a divergent hand-written route list.
- The 51 rendered routes have primary desktop/mobile baselines (102 images). The 2 redirects have behavioral assertions. Tablet projects run geometry/accessibility without multiplying baseline approval noise. Additional state captures remain named evidence tied to matrix scenario IDs.

- [ ] **Step 1: Verify the foundational four-viewports and freeze the exact-artifact harness**

```ts
expect(config.projects?.map((project) => project.name)).toEqual([
  "desktop-1440", "tablet-landscape", "tablet-portrait", "mobile-390"
]);
```

Do not rename or resize the projects established in Task 1. Add the external-server acceptance mode described in Step 5 so the final non-visual and visual invocations share one standalone process and one build. Do not use the development server as release evidence.

- [ ] **Step 2: Write the manifest-driven route-scene test**

```ts
for (const scenario of resolveRouteScenarios(ROUTE_SCENARIO_CATALOGUE)) {
  test(`${scenario.id} ${scenario.route} ${scenario.state}`, async ({ page }) => {
    await scenario.applyPersona(page.context());
    await page.goto(scenario.url);
    if (scenario.state === "redirect") {
      await expect(page).toHaveURL(scenario.redirectTo);
      return;
    }
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1:visible")).toHaveCount(1);
    await expect(page.locator("[data-scene]").first()).toHaveAttribute("data-scene", scenario.scene);
    await expect(page.locator("[data-surface-texture]").first()).toHaveAttribute("data-surface-texture", scenario.texture);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  });
}
```

- [ ] **Step 3: Replace raw catalogue screenshots with committed assertions**

Generate 102 primary baselines: 51 rendered routes × desktop-1440/mobile-390. Tablet projects assert layout, landmarks, control geometry, and overflow without baseline snapshots. Non-primary empty/error/unavailable/forbidden/saved/conflict/paid states capture named evidence with scenario ID, route, viewport, and state. Retire `catalogue-visual.spec.ts` once no unique coverage remains.

- [ ] **Step 4: Add deterministic loading and recovery transitions**

Delay a client RSC navigation, assert the route-specific loading shell, release the request, and verify resolved content replaces it. Do not trigger loading with fixed sleeps. Cover root, traveler, and operator loading plus missing/unreachable persistence recovery.

In `preference-accessibility.spec.ts`, drive reduced motion, reduced data/save-data, and the test low-power override before navigation; assert poster/static information, zero autoplay, no hidden motion-dependent content, and usable controls. Run keyboard journeys and 200% zoom for one representative route per scene plus every route with fixed/sticky controls. Legal, auth, commerce, operator, and developer scenarios assert zero autoplay; every other route asserts at most one.

- [ ] **Step 5: Finish runtime cleanup before producing candidates**

Each route task removes superseded code that it alone owns before its task commit. For any cross-family candidate left after Task 16, create `docs/reviews/2026-07-16-rumia-cleanup-allowlist.md` with exact file/selector, current owner, zero-consumer `rg` command, overlapping dirty-diff decision, and deletion result. Delete only allowlisted zero-consumer code with `apply_patch`; never infer permission from a broad directory match.

Run unit, typecheck, and lint after cleanup. If runtime files changed, stage only the exact allowlist entries plus the allowlist document and commit `refactor(frontend): remove superseded route templates`. If no runtime candidate is provably dead, record a no-op and defer it rather than guessing. The current `apps/web/playwright/tests/catalogue-visual.spec.ts` is untracked at plan time: migrate any unique assertion, then remove it after `route-scenes.spec.ts` and `visual.spec.ts` prove parity. Do not pass its absent untracked path to `git add`; if it becomes tracked before execution, confirm with `git ls-files --error-unmatch` and stage only that exact deletion. No runtime or test cleanup is permitted after the candidate build begins; a later necessary cleanup invalidates candidates and restarts Steps 5–10.

- [ ] **Step 6: Materialize one build and run every browser gate against that same process**

Add `PLAYWRIGHT_EXTERNAL_SERVER=1` support to `apps/web/playwright.config.ts`; in that mode `webServer` is `undefined` and Playwright never builds or starts another process. Add `scripts/run-exact-artifact-gate.mjs` with these responsibilities:

1. Refuse to run without `apps/web/.next/BUILD_ID` and the standalone server.
2. Copy `public` and `.next/static` beside the standalone server using Node filesystem APIs.
3. Record the build ID plus a SHA-256 digest of the standalone server/build manifests.
4. Start that standalone server once on `127.0.0.1:3105`, wait for a bounded health response, and set `PLAYWRIGHT_EXTERNAL_SERVER=1` for child test commands.
5. Run the non-visual suite and then the visual candidate suite sequentially against the same PID and build digest.
6. Terminate the process in `finally`, wait for port closure, and fail if a listener remains.

Expose the runner as `"test:acceptance": "node scripts/run-exact-artifact-gate.mjs"` in the root `package.json`; direct `node` commands below keep the accepted phase explicit.

The runner never invokes `next build`. Build exactly once before it:

```bash
pnpm test:unit
pnpm typecheck
pnpm --dir apps/web test:typecheck
pnpm lint
pnpm qa:motion-gate
pnpm qa:assets
pnpm qa:perf-budget
pnpm check:migrations
pnpm repo:safety
git diff --check
pnpm build
node scripts/run-exact-artifact-gate.mjs --phase pre-approval
```

`--phase pre-approval` runs both Playwright commands without `--update-snapshots`. Expected: every non-visual gate passes, both browser suites report the same build ID/digest, visual differences produce candidate/diff artifacts, and no baseline file changes.

- [ ] **Step 7: Commit the acceptance harness without candidate images**

```bash
git add package.json scripts/run-exact-artifact-gate.mjs apps/web/playwright.config.ts apps/web/playwright/visual-state-matrix.ts apps/web/playwright/tests/route-scenes.spec.ts apps/web/playwright/tests/loading-recovery.spec.ts apps/web/playwright/tests/preference-accessibility.spec.ts apps/web/playwright/tests/visual.spec.ts apps/web/playwright/tests/protected-routes.spec.ts apps/web/playwright/tests/accessibility.spec.ts apps/web/playwright/tests/mobile-overflow.spec.ts apps/web/playwright/tests/viewport-contract.spec.ts apps/web/playwright/tests/perf.spec.ts docs/reviews/2026-07-16-rumia-cleanup-allowlist.md
git commit -m "test(frontend): enforce exact-artifact acceptance"
```

Do not stage actual, diff, candidate, or baseline images in this commit.

- [ ] **Step 8: Conduct the mandatory human inspection**

Populate `docs/reviews/2026-07-16-rumia-snapshot-approval.md` with one row per primary baseline: scenario ID, route, persona/state, viewport, old baseline, candidate, diff, review decision, and reason. Inspect route families in this order:

1. Home, Portugal, Explore, activity detail, Workspace.
2. How It Works, Pricing, Local Expertise, Support, legal, sustainability, sign-in, feedback/system recovery.
3. Planner, trip creation, trip, map, export, Logistics, Itineraries, Vault, Account, Checkout.
4. Guide, Expert Chat, B2B.
5. Reviewer, admin, Console, and API docs.

Reject any capture with an accidental empty column, unassigned beige band, invisible media, missing next action, footer-heavy first viewport, clipped control, or obviously repetitive route composition. Do not mark a row approved because its pixel diff is small.

- [ ] **Step 9: Stop for explicit owner approval before updating images**

No command with `--update-snapshots` may run until the approval document contains an explicit owner decision for every changed candidate.

- [ ] **Step 10: Refresh approved families only and rerun**

For each approved family, use the same already-built artifact with a scoped grep, for example:

```bash
node scripts/run-exact-artifact-gate.mjs --phase update-family --grep "primary public journey" --update-snapshots
```

In `update-family` mode the runner starts the same digest, runs only desktop-1440/mobile-390 visual tests, and refuses an unscoped update. Confirm only expected PNGs changed, then run `node scripts/run-exact-artifact-gate.mjs --phase final` without the update flag. Final expected result: all 102 primary baselines pass, every additional state scenario has inspected evidence, both suites used one exact process, and no listener remains.

- [ ] **Step 11: Record honest completion evidence**

Update the verification review and `PLAN-INDEX.md` with exact commands, counts, skips, artifacts, remaining deferrals, and owner approval. Do not call the frontend complete if any route family, required state, browser-console warning, or human approval row remains open.

- [ ] **Step 12: Commit evidence and approved baselines separately**

```bash
git add docs/reviews/2026-07-16-rumia-snapshot-approval.md docs/reviews/2026-07-15-rumia-frontend-finish-verification.md docs/superpowers/PLAN-INDEX.md
git commit -m "docs(frontend): record route-wide visual acceptance"
```

Use a separate, explicitly scoped commit for approved snapshot PNGs. Do not combine runtime behavior changes with baseline regeneration.

---

## Phase checkpoints and parallelism

- Tasks 1–4 are serial foundation gates. No route-family implementation starts until the route contract, explicit surfaces, recovery boundary, and fixtures pass.
- After Task 4, Tasks 5–9 may run as independent public-route workstreams; Tasks 10–13 may run as independent traveler/beta workstreams.
- Task 14 is the operator access/shell gate. Tasks 15 and 16 may proceed in parallel only after it passes.
- Task 17 runs after every route consumer is migrated. Snapshot approval and cleanup never run in parallel with implementation.
- Each task receives a fresh code review before the next dependent task starts. Rework stays in the same task commit boundary.

## Risks and rollback

- **Dirty worktree overlap:** inspect each exact path before editing and stage only task files. If an implementation task overlaps new user changes, stop that task and reconcile the specific file rather than resetting.
- **Duplicate landmarks/chrome:** migrate wrapper ownership before deleting nested route markup; tests require one main and one visible H1.
- **Auth/capability drift:** derive requirements from the HTTP catalogue and enforce writes as well as page reads. Roll back the access/shell task as one unit if role behavior regresses.
- **False operational data:** unavailable is preferable to convincing demo success. Remove fallbacks route by route and keep their commits reversible.
- **Map/WebGL instability:** use list assertions as authority, wait on semantic readiness rather than animation frames, and mask only truly non-deterministic canvas pixels.
- **Snapshot churn:** baseline updates are their own final commit after human approval; reverting them never reverts runtime behavior.
- **Performance/RAM:** use the standalone Playwright artifact, one worker, and no long-lived dev server for acceptance. Do not run normal and persistence-failure servers concurrently.

## Explicit deferrals

- Organization membership/ready workspace remains blocked pending a separately authorized schema/auth contract.
- MapLibre camera storytelling, terrain, building extrusion, and richer 3D remain in the deferred Map Phase 2/3 plan.
- Deployment is not authorized by this plan. The exact local built artifact remains design authority until the user explicitly requests release work.
