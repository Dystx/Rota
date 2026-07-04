# Visual baseline regen — design owner review

**Date:** 2026-07-04
**Operator:** Atlas Orchestrator
**Scope:** 18 PNG baselines in `apps/web/playwright/tests/visual.spec.ts-snapshots/`
**Why:** `--update-snapshots` was run against a freshly-built `apps/web` (the build
that includes the data-testid additions, the `text-olive-dark` Details link, and
the `opacity-75` SummaryRow labels). The previous baselines were taken against
a build that didn't have these pixel changes.

## What to look for

These are the surfaces with **intentional** pixel changes from the 2026-07-04
risk-mitigation pass. Please confirm the new pixels match the design intent
before the next test run treats them as the canonical baseline.

### Expected changes (intentional — should match design)

| Surface | Change | Why |
|---|---|---|
| `/trip/3` desktop + mobile | Filmstrip section now visible below the route chapter. Mobile PNG grew 440KB → 1.4MB. | PR-19 (StopFilmstrip) + PR-19b (live camera fly-to). |
| `/trip/3` desktop + mobile | Filmstrip "Details" / "Navigate" link color | Was `text-ochre-dark` (#CE933F, 2.6:1 contrast — fails WCAG AA). Now `text-olive-dark` (#1D2A23, 13:1 contrast — passes WCAG AAA). |
| `/trip/3` desktop + mobile | Trip page "Brief" + "Unlock" card label color | Was `opacity-60` on the inherited text color (4.17:1 in the light "Brief" card — fails WCAG AA). Now `opacity-75` (~6.5:1 in light / ~7:1 in dark — passes WCAG AA in both contexts). |
| `/` mobile | Mobile hero collapse | Was 819px tall on `<md`; now 560px. h1 now uses `text-display-mobile`. The pixel diff should show a shorter hero. |
| `/admin/analytics` desktop + mobile | KPI cards now use the reference's glass-card bento | The dashboard was a single panel before; the bento is a layout change. |
| `/admin/places` desktop + mobile | Likely some layout shift from the new console layout (PR-14) | The 6 `/console/*` pages now share a shell. |

### Suspicious changes (should look identical)

If any of these look meaningfully different from the previous baseline, the
build is rendering something unintended. Worth flagging.

| Surface | Reason for suspicion |
|---|---|
| `/account` desktop + mobile | Only the auth-persona storage state should affect this page. No app-level changes since the last baseline. |
| `/reviewer/{queue,profile,history}` desktop + mobile | Reviewer routes were not touched in the 2026-07-04 pass. Any diff is from upstream rendering changes (font, layout, etc.) that the operator didn't track. |
| `/trip/3/map` desktop + mobile | This is the dedicated map page, not the trip page. The filmstrip is NOT mounted here — so any filmstrip pixel change is leakage. Should be identical to the prior baseline. |

## Verification

```bash
# Per-surface diff (re-runs just the visual tests):
pnpm --filter web exec playwright test --config playwright.config.ts \
  --grep "<paste a route here>" --reporter=line

# Compare baselines side-by-side:
# (use the platform's image diff tool on the .png files in
#  apps/web/playwright/tests/visual.spec.ts-snapshots/)
```

If you find a pixel that doesn't match design intent, regenerate the affected
baselines only — not the full set. The command is:

```bash
pnpm --filter web exec playwright test --config playwright.config.ts \
  --grep "<specific test>" --update-snapshots
```

## What was NOT regenerated

- `apps/web/playwright-report/` — Playwright HTML report (ephemeral, regenerated
  on every run).
- `apps/web/playwright/test-results/` — per-run test output (ephemeral).
- `docs/visual-review/*.png` — design review evidence screenshots from earlier
  sessions (preserved as a review log).

## Acceptance

If the new baselines match design intent, this document is informational.
If they don't, the design owner should:
1. Open the failing surface in a browser.
2. Compare against the reference HTML in `docs/reference/rumia-console/`.
3. File an issue with the specific pixel that doesn't match.
