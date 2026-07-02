# Phase 0.4 — Cinematic Redesign Audit

**Audited**: commits `49b87f9` … `94228d8` (5 commits, 224 file changes, +14.5K/-2K)
**Reference specs**: `packages/ui/src/styles.css` (design tokens), `docs/architecture.md` (package boundaries), `README.md` (project framing)
**Verdict**: **PASS with 1 finding** (forbidden copy leakage in admin/reviewer pages — see §6)

---

## 1. Motion Discipline

| Check | Result |
|---|---|
| `framer-motion` imports (excluding the gate script) | **0 violations** |
| `@motionone/*` imports | **0 violations** |
| `gsap` / `@gsap` / `lenis` / `scrollama` / `react-map-gl` / `mapbox-gl` wrappers | **0 violations** |
| `motion/react`, `motion/react-client`, `motion/react-m` runtime imports | **10 occurrences** |

**PASS** — single-motion-package strategy holds.

---

## 2. Reduced-motion Compliance

| Check | Result |
|---|---|
| `useReducedMotion` / `prefers-reduced-motion` references | **70 occurrences** |
| `@media (prefers-reduced-motion: reduce)` CSS blocks | **1** (in `packages/ui/src/styles.css`) |
| Motion duration tokens overridden to `0ms` in reduced-motion media query | ✅ |

**PASS** — runtime guards (70) + CSS-level duration override (1) cover both code-driven and token-driven motion paths.

---

## 3. Design Token Compliance

### Tokens defined (`packages/ui/src/styles.css`)

```css
--color-paper: #fdfbf7;        --color-cream: #f4efe6;
--color-ink: #1a1c20;          --color-ink-soft: #2d3131;
--color-atlantic: #1f3b4d;     --color-aqua: #7fb2c4;
```

Plus surface/foreground/border tokens, status color tokens, spacing rhythm tokens (`--spacing-section: 120px`, `--spacing-gutter: max(5vw, 2rem)`), motion duration tokens (`--motion-duration-fast/base/slow`).

### Token consumers

| Pattern | Count |
|---|---|
| `var(--color-*)` references | **101** |
| Hardcoded hex / rgb in TSX/CSS | **47** |

**The 47 hardcoded values are concentrated in expected places** — status colors (success/warning/danger), skeleton/hover tints, glass shadow alphas, mockup-only `apps/web/app/test-t*/` pages, and the `STATUS_COLOR` map inside `packages/ui/src/components/table.tsx`. None introduce new colors that bypass the token system.

**PASS** — paper/cream/ink/atlantic/aqua tokens defined and consumed consistently.

---

## 4. Scroll-jacking (anti-pattern)

| Check | Result |
|---|---|
| `scroll-snap-type` / `scrollSnapType` | **0** |
| `overscroll-behavior: contain` on forms/tables | **0** |

**PASS** — native scroll mechanics preserved per Cinematic Concierge anti-patterns.

---

## 5. Scope Fidelity

### 5-commit wave footprint

```
116 files added, 9,412 insertions
108 files modified, +5,055/-1,984
 0 files deleted
```

### Out-of-boundary files

```
.sisyphus/boulder.json                                   ← tool state, reverted
.sisyphus/notepads/cinematic-redesign-b/issues.md        ← tool state, reverted
.sisyphus/notepads/cinematic-redesign-b/learnings.md     ← tool state, reverted
.sisyphus/notepads/future-production-roadmap/decisions.md ← tool state, reverted
.sisyphus/notepads/future-production-roadmap/issues.md    ← tool state, reverted
.sisyphus/notepads/future-production-roadmap/learnings.md ← tool state, reverted
.sisyphus/notepads/future-production-roadmap/problems.md  ← tool state, reverted
README.md                                                  ← metadata update, intentional
```

All `.sisyphus/*` additions were already reverted in commit `bc1aa48` and untracked from the index in `339ffb9`. `README.md` change is the documented production-readiness section refresh.

**PASS** — scope is contained to `apps/`, `packages/`, `docs/`, root configs.

---

## 6. **Finding** — Forbidden Copy Leakage in Admin / Reviewer

The `Cinematic Concierge` anti-patterns forbid exposing "Stitch / MVP / roadmap / scaffold / shell" language in production UI. The 5-commit wave contains these violations in `EmptyState` placeholder copy and one status label:

| File | Line | Copy |
|---|---:|---|
| `apps/web/app/(admin)/admin/regions/page.tsx` | 43 | `title="Region management shell"` |
| `apps/web/app/(admin)/admin/quality/page.tsx` | 59 | `title="Quality dashboard shell"` |
| `apps/web/app/(admin)/admin/quality/page.tsx` | 60 | `description="Surfaces the roadmap's quality-review layer for itinerary health, reviewer trust, and route realism."` |
| `apps/web/app/(admin)/admin/reviewers/page.tsx` | 42 | `title="Reviewer management shell"` |
| `apps/web/app/(admin)/admin/reviewers/page.tsx` | 43 | `description="Matches the roadmap's reviewer-management layer: region fit, language coverage, specialties, and assignment readiness."` |
| `apps/web/app/(admin)/admin/places/page.tsx` | 11 | `title="Places database shell"` |
| `apps/web/app/(admin)/admin/analytics/page.tsx` | 81 | `title="Analytics shell"` |
| `apps/web/app/(reviewer)/reviewer/trips/[tripId]/page.tsx` | 290 | `{activeDay ? '${activeDay.label} edit layer' : "Map editor shell"}` |
| `apps/web/app/(admin)/admin/countries/page.tsx` | 36 | status label `"Active MVP"` (vs `"Planned"`, `"Research"`) |
| `apps/web/app/(admin)/admin/countries/page.tsx` | 53 | seed row `["Portugal", "Active MVP", "EUR", "EN / PT"]` |
| `apps/web/app/(admin)/admin/countries/page.tsx` | 65 | badge tone condition uses `"Active MVP"` literal |

These are placeholder labels in `EmptyState` components and one status enum. They're shipped to production as-is. Per the Cinematic Concierge anti-patterns, this is forbidden copy leakage.

**Recommendation**: replace with production-grade copy. Owner: `apps/web/app/(admin|reviewer)` pages. Decide copy per surface (suggested defaults below — needs product sign-off):

- "Region management shell" → "No regions configured yet."
- "Quality dashboard shell" → "Quality data appears here once reviews accumulate."
- "Reviewer management shell" → "No reviewers assigned yet."
- "Places database shell" → "No places have been added."
- "Analytics shell" → "Analytics will populate as traffic arrives."
- "Map editor shell" → "Map editor"
- "Active MVP" → "Active" (or "In pilot" if pre-launch distinction matters)
- Quality/Reviewers descriptions: drop "Surfaces the roadmap's" / "Matches the roadmap's" framing

Add to Phase 1 as remediation task `1.5`.

---

## Summary

| Section | Verdict |
|---|---|
| 1. Motion discipline | ✅ PASS |
| 2. Reduced-motion compliance | ✅ PASS |
| 3. Design token compliance | ✅ PASS |
| 4. Scroll-jacking | ✅ PASS |
| 5. Scope fidelity | ✅ PASS |
| 6. Forbidden copy leakage | ⚠️ **1 finding** — 11 occurrences across admin/reviewer pages |

**Overall**: PASS with one remediation task to add to Phase 1.