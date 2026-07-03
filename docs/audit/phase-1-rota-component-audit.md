# Phase 1 — `.rota-*` Component Class Audit

**Date**: 2026-07-02
**Scope**: `packages/ui/src/styles.css` `@layer components` block
**Goal**: Identify which `.rota-*` classes reference Cinematic Concierge tokens (the v1 palette) vs olive/ochre (the v4 palette) so the migration to olive/ochre is auditable.

---

## 1. Inventory

21 `.rota-*` classes exist in the active stylesheet. All currently reference **Cinematic Concierge** tokens (`--font-rota-display`, `--color-foreground`, `--color-muted-foreground`, `--color-secondary`, `--color-border`, `--color-surface-muted`).

| Class | Tokens referenced | Where used (search) |
|---|---|---|
| `.rota-display` | `--font-rota-display`, `--color-foreground` | headlines in `(marketing)/` and `(app)/trip/*` |
| `.rota-heading` | `--font-rota-display`, `--color-foreground` | section headings |
| `.rota-kicker` | `--color-muted-foreground` | small caps labels |
| `.rota-muted` | `--color-muted-foreground` | muted body text |
| `.rota-glass-panel` | (inline rgba; no token refs) | glass surfaces |
| `.rota-list-row` | (layout-only) | list layouts |
| `.rota-dot` | `--color-secondary` | status dots |
| `.rota-stack-list` | `--color-muted-foreground` | ordered lists |
| `.rota-input-placeholder` | `--color-border` (hardcoded rgba) | placeholders |
| `.rota-stop-card` | `--color-border` (hardcoded rgba) | itinerary stop cards |
| `.rota-form-field` | (layout-only) | form layouts |
| `.rota-form-label` | `--color-muted-foreground` | form labels |
| `.rota-form-hint` | `--color-muted-foreground` | form hints |
| `.rota-form-input` | `--color-border` (hardcoded rgba) | form inputs |
| `.rota-form-error` | (hardcoded #b42318) | error text |
| `.rota-check-card` | (hardcoded rgba) | selectable cards |
| `.rota-json-preview` | (hardcoded rgba) | JSON preview blocks |

---

## 2. Two Palette Strategy

Both palettes now coexist in `packages/ui/src/styles.css`:

- **Cinematic Concierge tokens** (paper/cream/ink/atlantic/aqua) — drive the `.rota-*` component classes above. Used by the existing 5-commit wave's pages.
- **Olive + Ochre tokens** (--color-primary, --color-olive-light, --color-ochre-light, --color-linen-dark, --color-glass-light/-dark) — drive the new prototype ports (`/planner`, `/checkout`, `/logistics`, `/itineraries`, `/vault`, `/expert-chat`, `/console/*`).

The two palettes use different token names, so they don't conflict in `:root` or `@theme`. Both render correctly today.

---

## 3. Migration Options (decision required)

### Option A — Keep both palettes indefinitely

`.rota-*` classes stay Cinematic Concierge. New prototype ports use olive/ochre utilities. Pages visually diverge.

- **Pro**: zero risk of breaking existing pages; smallest diff.
- **Con**: visual inconsistency between the two route groups; design language is fragmented.

### Option B — Repoint `.rota-*` classes to olive/ochre tokens

Rename Cinematic Concierge tokens (e.g. `--color-foreground` → `--color-olive-light`) AND update the `.rota-*` classes to reference the new names. Old Cinematic Concierge tokens are removed.

- **Pro**: unified design language.
- **Con**: requires coordinated rename across `packages/ui/src/styles.css` AND every component that imports `@repo/ui/styles.css`; high risk of breaking visual parity in existing pages.

### Option C — Dual-palette via class scope

Keep both palettes, but add a `.olive` (or `.rumia-v4`) scope class that overrides `--color-foreground` etc. within its scope. New pages opt-in via `<div className="rumia-v4">` wrapper.

- **Pro**: explicit, opt-in; both palettes available; no global rename.
- **Con**: requires every new page to remember the wrapper class; hard to enforce.

### Option D — Cinematic Concierge deprecation path

1. Add olive/ochre aliases for each Cinematic Concierge token (e.g. `--color-foreground-olive` aliased to `--color-foreground`).
2. Update `.rota-*` classes to use the olive-aliased tokens.
3. Existing pages render with olive palette (close to Cinematic Concierge's neutral look).
4. Remove Cinematic Concierge tokens in a follow-up commit.

- **Pro**: incremental, reversible at each step; visual change is small per step.
- **Con**: takes multiple commits; requires a long-lived branch for the deprecation.

---

## 4. Recommended Path

**Option D** — staged Cinematic Concierge deprecation. Three atomic commits:

1. **Aliases**: add olive/ochre aliases for each Cinematic Concierge token. No visual change.
2. **Repoint**: update `.rota-*` classes to use the olive-aliased tokens. Existing pages gain a subtle olive tint (consistent with new prototype ports).
3. **Cleanup**: remove Cinematic Concierge tokens from `:root`. All `.rota-*` classes keep working via the olive-aliased values.

**This audit doc is the work plan for that path. The aliases + repoint + cleanup can be triggered with "apply Option D" or staged with explicit "commit 1", "commit 2", "commit 3".**

---

## 5. What's NOT in scope

- The olive/ochre `.glass-panel` / `.btn-primary` / `.btn-ochre` / `.nav-link` classes documented in `docs/design-tokens-olive-ochre.css` are NOT yet in `packages/ui/src/styles.css`. They live in a reference doc.
- The new prototype ports (`/planner`, `/checkout`, etc.) use direct Tailwind utilities (`bg-olive-light`, `text-ochre-dark`, etc.) without `.rota-*` classes. So the new pages are unaffected by the `.rota-*` audit.

---

## 6. Cross-references

- `docs/prototype-routes.md` — prototype migration plan
- `docs/design-tokens-olive-ochre.css` — full olive/ochre v4 `@theme` reference
- `docs/spec-v4.md` §6 — visual identity (olive/ochre/cream/sage) canonical spec
- `packages/ui/src/styles.css` — active stylesheet
