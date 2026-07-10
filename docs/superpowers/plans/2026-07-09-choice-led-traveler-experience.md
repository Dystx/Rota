# Choice-led Traveler Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace traveler-facing form-heavy planning with a coherent, accessible choice-led Portugal journey from discovery through trip export, while preserving the existing Rumia data contracts and editorial visual language.

**Architecture:** Keep `TripBrief` as the persistence/API contract and add a client-side `TripChoiceDraft` adapter that turns visible selections into the existing planner URL and brief review state. Add reusable choice, sheet, context, consequence, and summary components in `@repo/ui`; route components compose those primitives and keep server mutations unchanged until their inputs are confirmed. Use progressive enhancement for view transitions and scroll-driven storytelling, with complete static and reduced-motion equivalents.

**Tech Stack:** Next.js App Router, React 19, TypeScript strict mode, Tailwind token classes, `@repo/ui`, `@repo/types`, `@repo/db`, Vitest, Testing Library, Playwright, axe, CSS View Transitions and scroll-driven animation feature detection.

## Global Constraints

- Traveler decisions use cards, chips, map taps, tabs, segmented controls, or focused option sheets.
- A text input is allowed only for authentication, Stripe-hosted payment, support contact, or optional free-form trip context inside a collapsed refinement surface.
- Every high-impact choice has a visible selected state and communicates a route outcome before or immediately after selection.
- The app keeps one primary action visible per screen or decision sheet.
- Keyboard, touch, and pointer input produce equivalent outcomes.
- Use the existing olive, ochre, linen, Playfair Display, Inter, and JetBrains Mono tokens.
- No public traveler surface uses remote Google, Picsum, or Pravatar imagery.
- No route reads a trip with a privileged DB helper unless the caller is authenticated and ownership/role access is checked first.
- View and scroll transitions enhance only supported, no-preference motion environments; the static experience is complete and equivalent.
- Every touched route must retain exactly one `main`, one visible `h1`, a working skip link, and zero document-level mobile overflow.

## Execution status (2026-07-10)

The implementation steps in Tasks 1–13 are complete in the current tree. The
authoritative evidence is the route matrix and the committed test artifacts:

- Choice-led planner, brief review, logistics, trip lifecycle, export, archive,
  vault, account, and truthful messaging behavior are implemented and covered
  by unit/component tests plus the traveler journey specs.
- Public, traveler, reviewer, admin, console, and beta gateway routes have
  desktop/mobile visual baselines, axe checks, and mobile-overflow checks.
- The serialized browser gate passes **289 tests with 31 intentional skips**;
  Vitest passes **94 files / 689 tests**; lint, build, and `git diff --check`
  pass.
- Task 14 local gates are complete. Production activation remains dependent on
  the external Supabase schema/RLS apply and provider credentials listed in
  `docs/ops/launch.md`; `@repo/config health:print` currently reports those
  required-for-action providers as missing. The durable export-job migration
  is now defined locally in `202607100200_create_trip_export_jobs.sql` and is
  awaiting the same hosted migration apply.

---

## File Map and Responsibilities

| Area | Files | Responsibility |
| --- | --- | --- |
| Choice state | `apps/web/app/planner/_lib/choice-model.ts`, `apps/web/app/planner/_lib/choice-model.test.ts` | Stable draft type, option metadata, URL encoding, brief phrase adapter. |
| Shared UI | `packages/ui/src/components/choice-card.tsx`, `choice-chip-group.tsx`, `option-sheet.tsx`, `trip-context-bar.tsx`, `route-consequence.tsx`, `trip-summary.tsx` and tests | Accessible selection primitives shared by public and traveler routes. |
| Motion | `packages/ui/src/lib/view-transition.ts`, `packages/ui/src/lib/view-transition.test.ts`, `packages/ui/src/styles.css` | Capability checks, named transition helpers, reduced-motion rules. |
| Public entry | `apps/web/app/(marketing)/_components/hero-intent-card.tsx`, `hero-quick-start.tsx`, `destination-bento.tsx`, `hero-map.tsx`, `(marketing)/page.tsx` | Three high-confidence starter choices and destination atlas entry points. |
| Planner | `apps/web/app/planner/_components/planner-single-screen.tsx`, `where-step.tsx`, `when-step.tsx`, `transport-step.tsx`, `vibe-step.tsx`, `planner-client.tsx` and tests | Choice canvas; no traveler text fields or dominant `<form>`. |
| Brief review | `apps/web/app/(app)/trip/new/trip-brief-form.tsx`, `trip-brief-review.tsx`, tests | Exception-only confirmation with option sheets and collapsed refinement. |
| Route consequence | `apps/web/app/_components/logistics/mobility-tiles.tsx`, `apps/web/app/logistics/page.tsx`, tests | Trip-scoped transport selection and deterministic consequence copy. |
| Trip surfaces | `apps/web/app/(app)/trip/[tripId]/page.tsx`, `_components/stop-filmstrip.tsx`, `_components/cinematic-map-section.tsx`, `map/page.tsx`, `export/page.tsx`, tests | Shared context, day/stop synchronization, accessible map equivalent, export states. |
| Commerce/archive | `apps/web/app/checkout/page.tsx`, `itineraries/page.tsx`, `itineraries/_components/*`, `vault/_components/vault-gallery.tsx`, `account/_components/*` | Choice-driven package/format/filter controls; persisted data only. |
| Data access | `packages/db/src/index.ts`, `packages/db/src/index.test.ts`, `apps/web/app/lib/trip-access.ts` | Owner-scoped traveler reads for logistics, checkout, map, export, and archive. |
| E2E/visual | `apps/web/playwright/tests/choice-led-traveler.spec.ts`, existing visual/a11y/overflow specs | Desktop/mobile journey, keyboard, reduced motion, and route matrix coverage. |

## Release 0 — State, primitives, and safety

### Task 1: Define the choice draft and adapters

**Files:**
- Create: `apps/web/app/planner/_lib/choice-model.ts`
- Test: `apps/web/app/planner/_lib/choice-model.test.ts`

**Interfaces:**

```ts
export type TripChoiceDraft = {
  destination: string;
  days: number;
  travelWindow: string | null;
  transport: "car" | "transit";
  vibe: "restorative" | "balanced" | "high_energy";
  interests: string[];
};

export type ChoiceOption = {
  value: string;
  label: string;
  description: string;
  consequence: string;
  imageSrc?: string;
};

export function normalizeDraft(input: Partial<TripChoiceDraft>): TripChoiceDraft;
export function draftToPlannerPrompt(draft: TripChoiceDraft): string;
export function draftToPlannerUrl(draft: TripChoiceDraft): string;
```

- [ ] **Step 1: Write failing tests** for default values, clamping days to 1–60, ignoring unsupported transport/vibe values, URL encoding of destination/window, and prompt phrases for both transport modes and all three vibes.
- [ ] **Step 2: Run the focused test** with `pnpm --filter web exec vitest run app/planner/_lib/choice-model.test.ts`; expect failures because the module does not exist.
- [ ] **Step 3: Implement the exact types and functions** above. Preserve `TransportChoice` and `Vibe` aliases by importing them from the existing planner step modules rather than creating duplicate string unions in route components.
- [ ] **Step 4: Run the focused test** again; expect all cases to pass.
- [ ] **Step 5: Commit** with `git add apps/web/app/planner/_lib/choice-model.ts apps/web/app/planner/_lib/choice-model.test.ts && git commit -m "feat: add choice-led trip draft model"`.

### Task 2: Add accessible shared choice primitives

**Files:**
- Create: `packages/ui/src/components/choice-card.tsx`
- Create: `packages/ui/src/components/choice-card.test.tsx`
- Create: `packages/ui/src/components/choice-chip-group.tsx`
- Create: `packages/ui/src/components/choice-chip-group.test.tsx`
- Create: `packages/ui/src/components/option-sheet.tsx`
- Create: `packages/ui/src/components/option-sheet.test.tsx`
- Create: `packages/ui/src/components/trip-context-bar.tsx`
- Create: `packages/ui/src/components/trip-context-bar.test.tsx`
- Create: `packages/ui/src/components/route-consequence.tsx`
- Create: `packages/ui/src/components/route-consequence.test.tsx`
- Create: `packages/ui/src/components/trip-summary.tsx`
- Create: `packages/ui/src/components/trip-summary.test.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

```tsx
export function ChoiceCard(props: {
  id: string;
  name: string;
  value: string;
  label: string;
  description: string;
  consequence?: string;
  imageSrc?: string;
  selected: boolean;
  onSelect: (value: string) => void;
}): JSX.Element;

export type ChoiceGroupOption = {
  value: string;
  label: string;
  description?: string;
  consequence?: string;
  imageSrc?: string;
};

export function ChoiceChipGroup(props: {
  label: string;
  options: ChoiceGroupOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
}): JSX.Element;

export function OptionSheet(props: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}): JSX.Element | null;

export type TripContextValues = {
  destination: string;
  days: number;
  travelWindow: string | null;
  transport: string;
  vibe: string;
};

export function TripContextBar(props: {
  draft: TripContextValues;
  onEdit: (key: keyof TripContextValues) => void;
  tripState?: "draft" | "preview" | "unlocked" | "review";
}): JSX.Element;

export function RouteConsequence(props: {
  status: "idle" | "updating" | "ready" | "error";
  stopCount?: number;
  travelMinutes?: number;
  transportLabel?: string;
  warnings?: string[];
  onRetry?: () => void;
}): JSX.Element;

export function TripSummary(props: {
  draft: TripContextValues;
  primaryAction: string;
  onPrimaryAction: () => void;
}): JSX.Element;
```

- [ ] **Step 1: Write tests** asserting `ChoiceCard` has radio semantics and selected styling, `ChoiceChipGroup` toggles with `aria-pressed`, `OptionSheet` traps focus and restores it, `TripContextBar` exposes edit buttons, `RouteConsequence` renders loading/error/retry states, and `TripSummary` renders one primary action.
- [ ] **Step 2: Run `pnpm --filter @repo/ui test -- choice-card choice-chip-group option-sheet trip-context-bar route-consequence trip-summary`**; expect failures for missing modules.
- [ ] **Step 3: Implement the primitives** using existing `Button`, `Card`, `Modal`, `ChipGroup`, `cn`, and `useReducedMotion`. Use real `<button>` elements, `role="radiogroup"`/`role="radio"` where exclusive, `aria-pressed` for multi-select, and a visible focus ring.
- [ ] **Step 4: Export the six components** from `packages/ui/src/index.ts` and run the focused tests; expect all cases to pass.
- [ ] **Step 5: Commit** with `git add packages/ui/src/components packages/ui/src/index.ts && git commit -m "feat: add accessible choice primitives"`.

### Task 3: Add progressive motion helpers and tokens

**Files:**
- Create: `packages/ui/src/lib/view-transition.ts`
- Create: `packages/ui/src/lib/view-transition.test.ts`
- Modify: `packages/ui/src/styles.css`
- Modify: `apps/web/app/globals.css`

**Interfaces:**

```ts
export function supportsViewTransitions(): boolean;
export function runViewTransition(update: () => void): void;
export function setTransitionName(element: HTMLElement, name: string | null): void;
```

- [ ] **Step 1: Write tests** with mocked `document.startViewTransition` and `matchMedia`, asserting supported/no-preference motion calls the API, unsupported browsers run the update synchronously, and reduced motion skips the API.
- [ ] **Step 2: Run `pnpm --filter @repo/ui test -- view-transition`; expect failure.
- [ ] **Step 3: Implement feature detection without importing browser globals at module evaluation time. Add `::view-transition-old/new` opacity rules and the `[data-reduced-motion="true"]` fallback. Add `scroll-timeline-name` rules only to public storytelling selectors; controls must remain visible without them.
- [ ] **Step 4: Run the focused test and `pnpm --filter @repo/ui typecheck`; expect PASS.
- [ ] **Step 5: Commit** with `git add packages/ui/src/lib/view-transition.ts packages/ui/src/lib/view-transition.test.ts packages/ui/src/styles.css apps/web/app/globals.css && git commit -m "feat: add progressive traveler motion system"`.

### Task 4: Close the owner-scoped data-access gap

**Files:**
- Create: `apps/web/app/lib/trip-access.ts`
- Create: `apps/web/app/lib/trip-access.test.ts`
- Modify: `packages/db/src/index.ts`
- Modify: `packages/db/src/index.test.ts`
- Modify: `apps/web/app/logistics/page.tsx`
- Modify: `apps/web/app/checkout/page.tsx`
- Modify: `apps/web/app/(app)/trip/[tripId]/map/page.tsx`
- Modify: `apps/web/app/(app)/trip/[tripId]/export/page.tsx`
- Modify: `apps/web/app/(app)/trip/[tripId]/page.tsx`
- Modify: `apps/web/app/itineraries/page.tsx`
- Modify: `apps/web/app/expert-chat/page.tsx`

**Interfaces:**

```ts
export type TripAccessResult =
  | { kind: "ok"; trip: TripDraftDetail; userId: string }
  | { kind: "anonymous" }
  | { kind: "forbidden" }
  | { kind: "missing" };

export async function getOwnedTrip(tripId: string): Promise<TripAccessResult>;
```

- [ ] **Step 1: Add tests** for anonymous, missing, owner, and non-owner results using a mocked current user and mocked DB result.
- [ ] **Step 2: Add an owner-filtered DB query** that accepts `ownerUserId` and includes `.eq("owner_user_id", ownerUserId)` before `.single()`. Keep reviewer/admin reads on their existing role-specific paths.
- [ ] **Step 3: Implement `getOwnedTrip`** with `getCurrentUser`; return `anonymous` before any privileged lookup, `missing` for no row, and `forbidden` when an owner ID differs.
- [ ] **Step 4: Replace direct traveler calls** in logistics, checkout, trip detail, map, export, itineraries, and expert chat with the access helper. Anonymous users go to `/sign-in?next=...`; forbidden/missing states go to `/itineraries` with a truthful message.
- [ ] **Step 5: Run `pnpm --filter @repo/db test -- index` and `pnpm --filter web typecheck`; expect PASS.
- [ ] **Step 6: Commit** with `git add apps/web/app/lib/trip-access.ts apps/web/app/lib/trip-access.test.ts packages/db/src/index.ts packages/db/src/index.test.ts apps/web/app/logistics/page.tsx apps/web/app/checkout/page.tsx 'apps/web/app/(app)/trip/[tripId]/map/page.tsx' 'apps/web/app/(app)/trip/[tripId]/export/page.tsx' 'apps/web/app/(app)/trip/[tripId]/page.tsx' apps/web/app/itineraries/page.tsx apps/web/app/expert-chat/page.tsx && git commit -m "fix: scope traveler trip reads to owners"`.

---

## Release 1 — Public discovery and trust routes

### Task 5: Replace public hero inputs with starter choices

**Files:**
- Modify: `apps/web/app/(marketing)/_components/hero-intent-card.tsx`
- Modify: `apps/web/app/(marketing)/_components/hero-quick-start.tsx`
- Modify: `apps/web/app/(marketing)/_components/destination-bento.tsx`
- Modify: `apps/web/app/(marketing)/hero-map.tsx`
- Modify: `apps/web/app/(marketing)/page.tsx`
- Test: `apps/web/app/(marketing)/_components/hero-intent-card.test.tsx`

- [ ] **Step 1: Write tests** asserting the hero renders destination, duration, and style cards; clicking each changes visible selection; `Build my route` navigates to `/planner` with encoded draft values; no hero text input or form exists; keyboard activation matches pointer activation.
- [ ] **Step 2: Replace editable fields** with `ChoiceCard` groups. Use fixed Portugal regions, durations `[3, 5, 7, 10]`, and styles `restorative/balanced/high_energy`; use `draftToPlannerUrl` for navigation.
- [ ] **Step 3: Keep the globe/map as enhancement** and render a static Portugal schematic with the same destination buttons when WebGL or imagery is unavailable. Ensure each map pin has a labelled button equivalent.
- [ ] **Step 4: Make bento cards call the same draft navigation** and give each card one action. Add view-transition names only around supported destination-card → planner elements.
- [ ] **Step 5: Run `pnpm exec vitest run --config vitest.config.ts 'apps/web/app/(marketing)/_components/hero-intent-card.test.tsx'` and `pnpm --filter web typecheck`; expect PASS.
- [ ] **Step 6: Commit** with `git add 'apps/web/app/(marketing)/_components/hero-intent-card.tsx' 'apps/web/app/(marketing)/_components/hero-quick-start.tsx' 'apps/web/app/(marketing)/_components/destination-bento.tsx' 'apps/web/app/(marketing)/hero-map.tsx' 'apps/web/app/(marketing)/page.tsx' 'apps/web/app/(marketing)/_components/hero-intent-card.test.tsx' && git commit -m "feat: make public discovery choice led"`.

### Task 6: Align destination atlas and trust pages

**Files:**
- Modify: `apps/web/app/(marketing)/portugal/page.tsx`
- Modify: `apps/web/app/(marketing)/explore/page.tsx`
- Modify: `apps/web/app/(marketing)/explore/workspace/workspace-shell.tsx`
- Modify: `apps/web/app/(marketing)/how-it-works/page.tsx`
- Modify: `apps/web/app/(marketing)/pricing/page.tsx`
- Modify: `apps/web/app/(marketing)/human-review/page.tsx`
- Modify: `apps/web/app/support/page.tsx`
- Modify: `apps/web/app/offline/page.tsx`
- Modify: `apps/web/app/privacy/page.tsx`
- Modify: `apps/web/app/terms/page.tsx`
- Modify: `apps/web/app/sustainability/page.tsx`
- Modify: `apps/web/app/plan/page.tsx`
- Modify: `apps/web/app/sign-in/page.tsx`
- Modify: `apps/web/app/_components/top-nav.tsx`
- Modify: `apps/web/app/_components/site-footer.tsx`
- Test: `apps/web/playwright/tests/public-discovery.spec.ts`

- [ ] **Step 1: Add Playwright assertions** for one visible `h1`, one `main`, public navigation labels, destination card keyboard activation, plan selection cards, and offline recovery link.
- [ ] **Step 2: Make Portugal, Explore, and Workspace share destination option metadata** from a single module; region cards, map pins, day previews, and chips update the same URL draft format.
- [ ] **Step 3: Rewrite trust copy** to the single ascension model “free preview → itinerary unlock → expert polish,” with price, timing, and limitations visible in plan cards and one CTA per section.
- [ ] **Step 4: Convert support to topic cards/accordions** and offline to cached-trip explanation plus recovery action. Keep contact text input outside the traveler planning path.
- [ ] **Step 5: Make legal pages use the shared public shell and current claims**, remove unsupported operational promises, make `/plan` a permanent redirect to `/planner`, and make sign-in preserve an originally requested permitted route through its `next` parameter.
- [ ] **Step 6: Keep public navigation exact** (`Discover`, `Destinations`, `How it works`, `Pricing`, `Plan a trip`) and remove disabled locale controls, beta routes, and operator links from the public footer/header.
- [ ] **Step 7: Run `pnpm --filter web exec playwright test playwright/tests/public-discovery.spec.ts --project=desktop-chrome --project=mobile-chromium`; expect PASS for 1440px and 390px projects.
- [ ] **Step 8: Commit** with `git add 'apps/web/app/(marketing)' apps/web/app/support/page.tsx apps/web/app/offline/page.tsx apps/web/app/privacy/page.tsx apps/web/app/terms/page.tsx apps/web/app/sustainability/page.tsx apps/web/app/plan/page.tsx apps/web/app/sign-in/page.tsx apps/web/app/_components/top-nav.tsx apps/web/app/_components/site-footer.tsx apps/web/playwright/tests/public-discovery.spec.ts && git commit -m "feat: unify discovery atlas and trust routes"`.

---

## Release 2 — Planning and route consequence

### Task 7: Rebuild the planner as a choice composition canvas

**Files:**
- Modify: `apps/web/app/planner/_components/planner-single-screen.tsx`
- Modify: `apps/web/app/planner/_components/where-step.tsx`
- Modify: `apps/web/app/planner/_components/when-step.tsx`
- Modify: `apps/web/app/planner/_components/transport-step.tsx`
- Modify: `apps/web/app/planner/_components/vibe-step.tsx`
- Modify: `apps/web/app/planner/planner-client.tsx`
- Create: `apps/web/app/planner/_components/planner-single-screen.test.tsx`

- [ ] **Step 1: Write tests** for destination card selection, duration card selection, travel-window sheet selection, transport/vibe selection, live summary updates, disabled/active primary action, URL handoff, escape-to-close sheets, and zero `<input>`/`<textarea>` elements in the rendered planner.
- [ ] **Step 2: Run the focused test** with `pnpm --filter web exec vitest run app/planner/_components/planner-single-screen.test.tsx`; expect failures.
- [ ] **Step 3: Replace destination/days/window `Input` controls and the `<form>` submit with `ChoiceCard`, `ChoiceChipGroup`, and `OptionSheet`. The planner state is `TripChoiceDraft`; the primary button calls `router.push(draftToPlannerUrl(draft))` and sets `pending` before navigation.
- [ ] **Step 4: Render `TripContextBar`, `RouteConsequence`, and `TripSummary` in desktop columns; on mobile stack context → one focused option group → consequence → primary action. Keep the close button and skip link behavior intact.
- [ ] **Step 5: Add a deterministic consequence adapter** with copy such as “Transit keeps the route to two bases; car opens the Douro interior” and expose `Updating your route` only while a server result is pending.
- [ ] **Step 6: Run focused tests, `pnpm --filter web typecheck`, and `pnpm lint`; expect PASS.
- [ ] **Step 7: Commit** with `git add apps/web/app/planner && git commit -m "feat: rebuild planner as choice canvas"`.

### Task 8: Turn trip/new into exception-only brief review

**Files:**
- Modify: `apps/web/app/(app)/trip/new/trip-brief-form.tsx`
- Create: `apps/web/app/(app)/trip/new/trip-brief-review.tsx`
- Create: `apps/web/app/(app)/trip/new/trip-brief-review.test.tsx`
- Modify: `apps/web/app/(app)/trip/new/page.tsx`

- [ ] **Step 1: Write tests** for prefilled valid drafts showing summary rows, each row opening an option sheet, missing required values showing only the relevant choice, collapsed `Refine this plan`, and API submission preserving the existing `TripBrief` payload.
- [ ] **Step 2: Extract the current API submit/validation logic** into a small function that accepts a validated `TripBrief`; keep server error display and sign-in return behavior unchanged.
- [ ] **Step 3: Render destination, dates, transport, pace, and interests as selected summary rows backed by `ChoiceCard`/`ChoiceChipGroup`; remove visible text inputs/selects from the main path.
- [ ] **Step 4: Keep food preferences, avoidances, accommodation, and `rawBrief` inside `Refine this plan`; make its closed state the default when the planner supplied a complete draft.
- [ ] **Step 5: Add an inline missing-field stepper** that opens one `OptionSheet` at a time and blocks submission until all required values are selected; announce changes in an `aria-live="polite"` status.
- [ ] **Step 6: Run `pnpm --filter web exec vitest run 'app/(app)/trip/new/trip-brief-review.test.tsx'` and `pnpm --filter web typecheck`; expect PASS.
- [ ] **Step 7: Commit** with `git add 'apps/web/app/(app)/trip/new' && git commit -m "feat: make trip brief review choice led"`.

### Task 9: Make logistics a trip-scoped consequence scene

**Files:**
- Modify: `apps/web/app/_components/logistics/mobility-tiles.tsx`
- Modify: `apps/web/app/logistics/page.tsx`
- Create: `apps/web/app/_components/logistics/mobility-tiles.test.tsx`

- [ ] **Step 1: Write tests** for owner-approved trip render, car/transit selection, consequence copy, selected state, keyboard operation, and redirect behavior for missing, anonymous, and forbidden trip access.
- [ ] **Step 2: Replace generic mobility tiles** with `ChoiceCard` options that display drive/transit minutes, base count, warnings, and a visible selected state.
- [ ] **Step 3: Wire selected transport into the trip draft/update boundary** without claiming persistence until the server response succeeds; show a retry state retaining the last valid selection on failure.
- [ ] **Step 4: Run `pnpm --filter web exec vitest run app/_components/logistics/mobility-tiles.test.tsx` and `pnpm --filter web typecheck`; expect PASS.
- [ ] **Step 5: Commit** with `git add apps/web/app/_components/logistics apps/web/app/logistics/page.tsx && git commit -m "feat: add route consequences to logistics"`.

---

## Release 3 — Trip lifecycle and commerce surfaces

### Task 10: Synchronize trip detail, map, and stop selection

**Files:**
- Modify: `apps/web/app/(app)/trip/[tripId]/page.tsx`
- Modify: `apps/web/app/(app)/trip/[tripId]/_components/stop-filmstrip.tsx`
- Modify: `apps/web/app/(app)/trip/[tripId]/_components/cinematic-map-section.tsx`
- Modify: `apps/web/app/(app)/trip/[tripId]/map/page.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/_components/trip-route-sync.test.tsx`

- [ ] **Step 1: Write tests** for `TripContextBar`, today-first hierarchy, day tab selection, stop selection, map/list synchronization, mobile single-card snap behavior, and list-equivalent announcements for map-only information.
- [ ] **Step 2: Add `TripContextBar`** below the trip hero and make each value open the corresponding sheet; use the existing persisted trip data as the only source of truth.
- [ ] **Step 3: Keep desktop multi-card filmstrip and set mobile cards to `min-w-[calc(100vw-4rem)]` with visible pagination and `View day agenda`; constrain horizontal scrolling to the labelled filmstrip region.
- [ ] **Step 4: Add day/transport/layer chips to map route and a visually equivalent stop list. Use `runViewTransition` for stop → map focus when supported.
- [ ] **Step 5: Replace preview-only fallback copy with truthful loading/empty/error states that identify whether the itinerary is generating, unavailable, or ready.
- [ ] **Step 6: Run the focused test, `pnpm --filter web typecheck`, and `pnpm lint`; expect PASS.
- [ ] **Step 7: Commit** with `git add 'apps/web/app/(app)/trip/[tripId]' && git commit -m "feat: synchronize trip map and agenda choices"`.

### Task 11: Make checkout, export, archives, vault, and account choice driven

**Files:**
- Modify: `apps/web/app/checkout/page.tsx`
- Modify: `apps/web/app/(app)/trip/[tripId]/export/page.tsx`
- Modify: `apps/web/app/itineraries/page.tsx`
- Modify: `apps/web/app/itineraries/_components/itinerary-search.tsx`
- Modify: `apps/web/app/itineraries/_components/itinerary-export-drawer.tsx`
- Modify: `apps/web/app/vault/_components/vault-gallery.tsx`
- Modify: `apps/web/app/(app)/account/page.tsx`
- Modify: `apps/web/app/(app)/account/_components/trip-card.tsx`
- Create: `apps/web/playwright/tests/trip-lifecycle.spec.ts`

- [ ] **Step 1: Write Playwright tests** for package card selection, persisted checkout return state, export format card selection, queued/ready/error/retry states, archive filter chips, empty-state planner link, and account trip-card actions.
- [ ] **Step 2: Render checkout packages as selectable cards** while leaving Stripe-hosted payment fields as the sole payment input; never treat query parameters as payment proof.
- [ ] **Step 3: Render export formats as cards** with locked/unlocked status, job state, download action, and retry action; keep long-running generation state persisted by trip ID.
- [ ] **Step 4: Replace search-first archive controls** with status/filter chips and a secondary text search control; remove hardcoded Kyoto/demo cards and derive labels from persisted trip state.
- [ ] **Step 5: Make vault and account actions use the same selected state, empty state, and `TripContextBar` language; keep sign-out/auth forms as permitted exceptions.
- [ ] **Step 6: Run `pnpm --filter web exec playwright test playwright/tests/trip-lifecycle.spec.ts --project=desktop-chrome --project=mobile-chromium`; expect PASS at 1440px and 390px.
- [ ] **Step 7: Commit** with `git add apps/web/app/checkout apps/web/app/'(app)'/trip apps/web/app/itineraries apps/web/app/vault apps/web/app/'(app)'/account apps/web/playwright/tests/trip-lifecycle.spec.ts && git commit -m "feat: make trip lifecycle controls choice driven"`.

### Task 12: Keep gated messaging truthful

**Files:**
- Modify: `apps/web/app/expert-chat/page.tsx`
- Modify: `apps/web/app/expert-chat/_components/expert-chat.tsx`
- Create: `apps/web/app/expert-chat/_components/expert-chat.test.tsx`
- Modify: `apps/web/app/_components/beta-unavailable.tsx`

- [ ] **Step 1: Write tests** asserting the disabled flag renders availability copy with no canned messages, the enabled route requires a paid reviewed trip, and the return link preserves the trip ID.
- [ ] **Step 2: Keep `ENABLE_TRIP_MESSAGING` as the gate** and remove fixture conversations from all disabled and unauthorized states.
- [ ] **Step 3: When enabled, render only trip-scoped messages supplied by the authenticated conversation API; show loading, empty, denied, and provider-error states with no fabricated replies.
- [ ] **Step 4: Run `pnpm --filter web exec vitest run app/expert-chat/_components/expert-chat.test.tsx` and `pnpm --filter web typecheck`; expect PASS.
- [ ] **Step 5: Commit** with `git add apps/web/app/expert-chat apps/web/app/_components/beta-unavailable.tsx && git commit -m "fix: keep expert messaging states truthful"`.

---

## Verification and release gates

### Task 13: Add route-level visual, accessibility, and overflow coverage

**Files:**
- Create: `apps/web/playwright/tests/choice-led-traveler.spec.ts`
- Modify: `apps/web/playwright/tests/visual.spec.ts`
- Modify: `apps/web/playwright/tests/accessibility.spec.ts`
- Modify: `apps/web/playwright/tests/mobile-overflow.spec.ts`
- Modify: `docs/audit/route-matrix.md`

- [ ] **Step 1: Add Playwright projects** for anonymous and traveler fixtures. Each authenticated fixture must assert a signed-in marker before screenshot capture.
- [ ] **Step 2: Add journey tests** covering `/` → `/planner` → `/trip/new` → trip route → map → checkout return → export, with keyboard-only selection and reduced-motion context.
- [ ] **Step 3: Add route assertions** for exactly one `main`, one visible `h1`, no third-party placeholder image URL, no `<input>`/`<textarea>` in the planner main path, and no document-level horizontal overflow at 390px.
- [ ] **Step 4: Capture all traveler/public routes** at 1440px and 390px after shared-shell or choice-component changes. Reject screenshots containing stale navigation, demo data, unauthorized screens, or fallback placeholder imagery.
- [ ] **Step 5: Run `pnpm --filter web exec playwright test playwright/tests/choice-led-traveler.spec.ts playwright/tests/visual.spec.ts playwright/tests/accessibility.spec.ts playwright/tests/mobile-overflow.spec.ts --project=desktop-chrome --project=mobile-chromium`; expect PASS with zero serious/critical axe violations.
- [ ] **Step 6: Update the route matrix** with actual screenshot/test artifact names and state coverage for each completed route.
- [ ] **Step 7: Commit** with `git add apps/web/playwright/tests docs/audit/route-matrix.md && git commit -m "test: cover choice led traveler journey"`.

### Task 14: Run the full release gate

- [ ] **Step 1: Run** `pnpm lint`; expected output ends with all workspace lint/typecheck commands completed successfully.
- [ ] **Step 2: Run** `pnpm test`; expected output reports zero failing test files.
- [ ] **Step 3: Run** `pnpm --filter web build`; expected output reports a successful Next production build; existing workspace-root and middleware deprecation warnings may remain but must be recorded.
- [ ] **Step 4: Run** the route-level Playwright command from Task 13 at both viewport projects and inspect screenshots for visual regressions.
- [ ] **Step 5: Run** `git diff --check`; expected output is empty.
- [ ] **Step 6: Commit** any test-only fixture or documentation updates with `git add apps/web/playwright docs/audit && git commit -m "chore: close traveler release gate"`.

## Self-review checklist before execution

- **Spec coverage:** Tasks 1–4 cover state, primitives, motion, and owner-scoped safety; Tasks 5–6 cover public discovery/trust; Tasks 7–9 cover planning; Tasks 10–12 cover trip lifecycle/commerce/messaging; Tasks 13–14 cover the route matrix and release gates.
- **No-form requirement:** Tasks 5, 7, and 8 explicitly remove planner/hero primary inputs and retain only the permitted refinement/auth/payment/support inputs.
- **Security finding:** Task 4 blocks the privileged-read gap found during review before logistics and other trip-scoped surfaces ship.
- **Type consistency:** `TripChoiceDraft` is the only new draft type; `TripBrief`, `TransportChoice`, and `Vibe` remain the existing contracts. Shared components consume stable string arrays and callbacks.
- **Motion safety:** Task 3 requires capability detection, synchronous fallback, and reduced-motion equivalence; no route depends on animation to reveal controls.
- **Accessibility:** Tasks 2, 7, 9, 10, and 13 specify keyboard semantics, announcements, map list equivalents, one-main/one-h1 checks, and overflow checks.
- **Placeholder scan:** Every step contains a concrete file, interface, test, command, or expected result; no placeholder instruction remains.
