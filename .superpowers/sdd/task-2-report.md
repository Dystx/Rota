# Task 2 — Accessible shared choice primitives

## Scope

Added the six shared `@repo/ui` primitives and their focused tests:

- `ChoiceCard`
- `ChoiceChipGroup`
- `OptionSheet`
- `TripContextBar`
- `RouteConsequence`
- `TripSummary`

The package owns structural `TripContextValues` and `ChoiceGroupOption` types. It does not import the app-local `TripChoiceDraft` type or create any persistence contract.

## TDD evidence

### RED

Command:

```sh
pnpm --filter @repo/ui test -- choice-card choice-chip-group option-sheet trip-context-bar route-consequence trip-summary
```

Result: exit 1, with six expected failing suites. Each failure was an unresolved import for a component not yet created:

```txt
Failed to resolve import "./choice-card"
Failed to resolve import "./choice-chip-group"
Failed to resolve import "./option-sheet"
Failed to resolve import "./trip-context-bar"
Failed to resolve import "./route-consequence"
Failed to resolve import "./trip-summary"
```

### GREEN

The first implementation run exposed a focus-restoration failure for `OptionSheet`: the wrapper unmounted `Modal` before it observed `isOpen=false`. The sheet now remains mounted and delegates closed rendering to `Modal`, allowing its focus-restoration effect to run.

Fresh verification commands:

```sh
pnpm --filter @repo/ui test -- choice-card choice-chip-group option-sheet trip-context-bar route-consequence trip-summary
pnpm --filter @repo/ui typecheck
```

Result:

```txt
Test Files  33 passed (33)
Tests       158 passed (158)
@repo/ui typecheck: tsc --noEmit (exit 0)
```

## Changed files

- `packages/ui/src/components/choice-card.tsx`
- `packages/ui/src/components/choice-card.test.tsx`
- `packages/ui/src/components/choice-chip-group.tsx`
- `packages/ui/src/components/choice-chip-group.test.tsx`
- `packages/ui/src/components/option-sheet.tsx`
- `packages/ui/src/components/option-sheet.test.tsx`
- `packages/ui/src/components/trip-context-bar.tsx`
- `packages/ui/src/components/trip-context-bar.test.tsx`
- `packages/ui/src/components/route-consequence.tsx`
- `packages/ui/src/components/route-consequence.test.tsx`
- `packages/ui/src/components/trip-summary.tsx`
- `packages/ui/src/components/trip-summary.test.tsx`
- `packages/ui/src/index.ts`

## Self-review

- `ChoiceCard` is a native button with `role="radio"`, `aria-checked`, selected styling, keyboard activation, and a visible focus shadow.
- `ChoiceChipGroup` reuses `ChipGroup`; its native buttons expose `aria-pressed` and preserve touch, pointer, and keyboard activation.
- `OptionSheet` delegates dialog semantics, Escape/backdrop closing, focus trap, and focus restoration to the existing `Modal`.
- `TripContextBar` offers an explicit, visible-focus edit button for each draft field.
- `RouteConsequence` uses live status, alert/retry, ready, and idle states; its loading animation respects reduced-motion preference.
- `TripSummary` contains one primary action and no secondary controls.
- `ChoiceCard` only renders local, root-relative image paths, so the primitive does not render remote images.
- `git diff --check` returned clean for tracked changes. The repository ESLint config ignores `packages/ui` files, producing warnings but no lint errors for the scoped command.

## Concerns

No blockers. The task's focused test command runs all UI package tests under the current Vitest configuration; all 158 tests passed. No visual browser test was added because the requested behaviors are covered by jsdom interaction tests and existing component primitives.

---

## Review follow-up — Task 2 fixes

### Changed files

- `packages/ui/src/components/choice-card.tsx`
- `packages/ui/src/components/choice-card.test.tsx`
- `packages/ui/src/components/choice-chip-group.test.tsx`
- `packages/ui/src/components/trip-summary.tsx`
- `packages/ui/src/components/trip-summary.test.tsx`
- `.superpowers/sdd/task-2-report.md`

### Changes

- `ChoiceCard` now accepts only root-relative image paths that begin with one slash; protocol-relative paths beginning with `//` are not rendered.
- `ChoiceCard` activates selection for Enter and Space, matching the existing shared chip keyboard pattern.
- `TripSummary` renders `1 day` and uses `days` for every other value.
- Added Enter and Space activation assertions for `ChoiceCard` and `ChoiceChipGroup`, plus a regression test for rejected protocol-relative images and singular day wording.

### Commands and outputs

#### RED — regression coverage

```sh
pnpm --filter @repo/ui test -- choice-card choice-chip-group trip-summary
```

Result: exit 1. `ChoiceCard` failed both new keyboard assertions because `onSelect` was not called, and failed the protocol-relative URL assertion because it rendered `//cdn.example.com/train.jpg`. `TripSummary` failed the new singular test because it rendered `1 days`. The new `ChoiceChipGroup` Enter and Space assertions passed via its existing `ChipGroup` keyboard behavior.

```txt
Test Files  1 failed | 32 passed (33)
Tests       3 failed | 161 passed (164)
```

#### Typecheck diagnostic

```sh
pnpm --filter @repo/ui typecheck
```

Initial result: exit 2. Vitest's configured matcher types do not expose `toHaveBeenCalledExactlyOnceWith`.

```txt
src/components/choice-card.test.tsx(54,22): error TS2339: Property 'toHaveBeenCalledExactlyOnceWith' does not exist on type 'Assertion<Mock<Procedure>>'.
```

The assertion now combines the supported `toHaveBeenCalledOnce` and `toHaveBeenCalledWith` matchers, preserving the exact-one-call requirement.

#### Fresh verification

```sh
pnpm --filter @repo/ui typecheck
pnpm --filter @repo/ui test -- choice-card choice-chip-group option-sheet trip-context-bar route-consequence trip-summary
git diff --check -- packages/ui/src/components/choice-card.tsx packages/ui/src/components/choice-card.test.tsx packages/ui/src/components/choice-chip-group.test.tsx packages/ui/src/components/trip-summary.tsx packages/ui/src/components/trip-summary.test.tsx
```

Result: all commands exited 0.

```txt
@repo/ui typecheck: tsc --noEmit
Test Files  33 passed (33)
Tests       164 passed (164)
git diff --check: clean
```

### Self-review

```txt
Verdict: pass
Blocking issues: none
Non-blocking issues: none
Test gaps: none for the three requested review findings
Suggested fixes: none
Files reviewed:
  - packages/ui/src/components/choice-card.tsx
  - packages/ui/src/components/choice-card.test.tsx
  - packages/ui/src/components/choice-chip-group.test.tsx
  - packages/ui/src/components/trip-summary.tsx
  - packages/ui/src/components/trip-summary.test.tsx
```

### Concerns

No blockers. The focused command runs all UI package tests under the current Vitest configuration rather than filtering to only the named test files; the complete package suite passed.

---

## Review follow-up — single-select and image-source fixes

### Changed files

- `packages/ui/src/components/choice-chip-group.tsx`
- `packages/ui/src/components/choice-chip-group.test.tsx`
- `packages/ui/src/components/choice-card.test.tsx`

### RED

Command:

```sh
pnpm --filter @repo/ui test -- choice-card choice-chip-group
```

Result: exit 1. The new direct `multiple={false}` tests found that `ChoiceChipGroup` always passed `multiple={true}` to `ChipGroup`: it exposed `role="group"` and `aria-pressed` buttons instead of a radiogroup and radios. The initial test run also caught a test-query issue for the intentionally empty-alt local image; that assertion was corrected to inspect the rendered image element directly.

### GREEN

Commands:

```sh
pnpm --filter @repo/ui test -- choice-card choice-chip-group option-sheet trip-context-bar route-consequence trip-summary
pnpm --filter @repo/ui typecheck
```

Result: both commands exited 0.

```txt
Test Files  33 passed (33)
Tests       168 passed (168)
@repo/ui typecheck: tsc --noEmit (exit 0)
```

### Self-review

```txt
Verdict: pass
Blocking issues: none
Non-blocking issues: none
```

- `ChoiceChipGroup` uses the shared `ChipGroup` single-select prop contract when `multiple={false}` and bridges its scalar callback to the public `string[]` API.
- Direct single-select tests verify radiogroup/radio semantics, exactly one selected item from an over-specified input array, Arrow-key selection and focus movement, and a one-value callback array.
- `ChoiceCard` image tests retain protocol-relative rejection and additionally verify root-relative asset acceptance plus absolute HTTPS rejection.
- `git diff --check` is clean for the Task 2 files.

### Concerns

No blockers. The UI Vitest configuration retains rendered DOM between tests, so the keyboard regression test scopes its role queries to its own render container.

---

## Review follow-up — image URL normalization guard

### Changed files

- `packages/ui/src/components/choice-card.tsx`
- `packages/ui/src/components/choice-card.test.tsx`

### RED

Added a regression case for `imageSrc="/\\cdn.example.com/train.jpg"`.

```sh
pnpm --filter @repo/ui test -- choice-card
```

Result: exit 1. The previous prefix-only guard rendered an image for the path even though URL normalization resolves it to the `cdn.example.com` origin.

```txt
ChoiceCard > does not render root-relative paths normalized to a remote origin
expect(element).not.toBeInTheDocument()
found <img src="/\\cdn.example.com/train.jpg" />

Test Files  1 failed | 32 passed (33)
Tests       1 failed | 168 passed (169)
```

### GREEN

`ChoiceCard` now keeps the root-relative-prefix condition and additionally resolves the path against a fixed local base, rendering only when the resolved origin equals that base's origin. This rejects the backslash-normalization bypass as well as `//...` and absolute remote URLs, while accepting root-relative local assets.

```sh
pnpm --filter @repo/ui test -- choice-card choice-chip-group option-sheet trip-context-bar route-consequence trip-summary
pnpm --filter @repo/ui typecheck
```

Result: both commands exited 0.

```txt
Test Files  33 passed (33)
Tests       169 passed (169)
@repo/ui typecheck: tsc --noEmit (exit 0)
```

### Concerns

No blockers. The fixed base is a validation-only origin sentinel; accepted image paths are still rendered exactly as supplied.

---

## Review follow-up — OptionSheet close-callback stability

### Changed files

- `packages/ui/src/components/option-sheet.tsx`
- `packages/ui/src/components/option-sheet.test.tsx`
- `.superpowers/sdd/task-2-report.md`

### RED / boundary diagnostic

Added a parent harness that keeps `OptionSheet` open, replaces the parent `onClose` function identity, then closes the sheet. It asserts that only the replacement callback runs and focus returns to the original opening trigger.

```sh
pnpm --filter @repo/ui test -- option-sheet
```

Result: exit 0, `33` test files and `170` tests passed. The harness confirms the parent callback identity changes, but jsdom did not expose a failing focus-restoration result when the direct-forwarding implementation was temporarily restored. Source review establishes the unstable boundary: `Modal`'s focus effect depends on `onClose`, so forwarding a changing parent callback permits it to recapture the active element while open.

### GREEN

`OptionSheet` now stores the most recent parent callback in a ref and passes `Modal` a dependency-free `useCallback` wrapper. `Modal` therefore sees one close callback for the sheet lifetime while the close action still invokes the current parent callback.

```sh
pnpm --filter @repo/ui test -- choice-card choice-chip-group option-sheet trip-context-bar route-consequence trip-summary
pnpm --filter @repo/ui typecheck
```

Result: both commands exited 0.

```txt
Test Files  33 passed (33)
Tests       170 passed (170)
@repo/ui typecheck: tsc --noEmit (exit 0)
```

### Self-review

- `OptionSheet` is the callback-stability boundary; `Modal` was not modified.
- The ref is refreshed on every `OptionSheet` render, so a close immediately uses the latest parent callback.
- The regression parent rerenders while the sheet is open, changes callback identity, asserts the original callback is not called, asserts the latest callback runs once, and confirms focus returns to the opening trigger.
- `git diff --check` is clean for the scoped files.

### Concerns

No implementation blockers. The focused Vitest/jsdom scenario does not fail with the direct-forwarding baseline, so the regression test protects the requested user-facing contract but cannot independently demonstrate the prior focus-effect failure in this environment. The source-level boundary is nevertheless required because `Modal` depends on its `onClose` identity.
