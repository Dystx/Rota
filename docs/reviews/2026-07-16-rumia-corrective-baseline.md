# Rumia corrective baseline — 2026-07-16

This is immutable before/after evidence for the frontend corrective pass. It records the exact checkout artifact before route-presentation source edits; it does not approve any screenshot or visual state.

## Artifact boundary captured before evidence code

- HEAD: `5ea2775bfaa2b4c52ba553fc1ca9467b638d4b41`
- `git status --short --branch` SHA-256: `4714256beb3596aff55cb7e60eba6094bc1ba97d573da8e48836b91a730a1569`
- Status output lines: `364`
- Capture command: `git status --short --branch`
- Evidence runner: `apps/web/playwright/tests/corrective-baseline.spec.ts`
- Runner constraints: one Playwright project, one standalone server/build, one worker; explicit `1440×1000` and `390×844` loops; no snapshot update.

The status hash covers the complete status output, including the existing user-owned dirty worktree. No unrelated file is part of this Task 1 change set.

The pre-edit artifact at the recorded HEAD contained 51 HTTP entries: 48 rendered routes and 3 redirects. The post-authority catalogue implemented by the plan contains 53 entries: 51 rendered routes and 2 redirects; the inventory below is explicitly this post-authority target, not a claim about the pre-edit checkout.

## Catalogue inventory

The current HTTP catalogue contains 53 literal route entries. The two redirect entries are recorded behaviorally; the remaining 51 rendered routes are the intended desktop/mobile capture inventory. The capture was blocked in global setup, so zero of the 51 pairs and zero screenshots were produced.

| Route | Kind | Desktop | Mobile |
| --- | --- | --- | --- |
| `/` | rendered | blocked — no capture | blocked — no capture |
| `/portugal` | rendered | blocked — no capture | blocked — no capture |
| `/explore` | rendered | blocked — no capture | blocked — no capture |
| `/explore/workspace` | rendered | blocked — no capture | blocked — no capture |
| `/activities/[activityId]` | rendered | blocked — no capture | blocked — no capture |
| `/feedback` | rendered | blocked — no capture | blocked — no capture |
| `/how-it-works` | rendered | blocked — no capture | blocked — no capture |
| `/human-review` | redirect → `/local-expertise` | status/destination | status/destination |
| `/local-expertise` | rendered | blocked — no capture | blocked — no capture |
| `/pricing` | rendered | blocked — no capture | blocked — no capture |
| `/planner` | rendered | blocked — no capture | blocked — no capture |
| `/plan` | redirect → `/planner` | status/destination | status/destination |
| `/trip/new` | rendered | blocked — no capture | blocked — no capture |
| `/trip/[tripId]` | rendered | blocked — no capture | blocked — no capture |
| `/trip/[tripId]/map` | rendered | blocked — no capture | blocked — no capture |
| `/trip/[tripId]/export` | rendered | blocked — no capture | blocked — no capture |
| `/checkout` | rendered | blocked — no capture | blocked — no capture |
| `/itineraries` | rendered | blocked — no capture | blocked — no capture |
| `/vault` | rendered | blocked — no capture | blocked — no capture |
| `/account` | rendered | blocked — no capture | blocked — no capture |
| `/logistics` | rendered | blocked — no capture | blocked — no capture |
| `/expert-chat` | rendered | blocked — no capture | blocked — no capture |
| `/sign-in` | rendered | blocked — no capture | blocked — no capture |
| `/support` | rendered | blocked — no capture | blocked — no capture |
| `/privacy` | rendered | blocked — no capture | blocked — no capture |
| `/terms` | rendered | blocked — no capture | blocked — no capture |
| `/sustainability` | rendered | blocked — no capture | blocked — no capture |
| `/offline` | rendered | blocked — no capture | blocked — no capture |
| `/reviewer/queue` | rendered | blocked — no capture | blocked — no capture |
| `/reviewer/history` | rendered | blocked — no capture | blocked — no capture |
| `/reviewer/profile` | rendered | blocked — no capture | blocked — no capture |
| `/reviewer/operations` | rendered | blocked — no capture | blocked — no capture |
| `/reviewer/trips/[tripId]` | rendered | blocked — no capture | blocked — no capture |
| `/admin/places` | rendered | blocked — no capture | blocked — no capture |
| `/admin/countries` | rendered | blocked — no capture | blocked — no capture |
| `/admin/regions` | rendered | blocked — no capture | blocked — no capture |
| `/admin/partners` | rendered | blocked — no capture | blocked — no capture |
| `/admin/reviewers` | rendered | blocked — no capture | blocked — no capture |
| `/admin/specialists` | rendered | blocked — no capture | blocked — no capture |
| `/admin/quality` | rendered | blocked — no capture | blocked — no capture |
| `/admin/analytics` | rendered | blocked — no capture | blocked — no capture |
| `/console` | rendered | blocked — no capture | blocked — no capture |
| `/console/pipeline` | rendered | blocked — no capture | blocked — no capture |
| `/console/workspace` | rendered | blocked — no capture | blocked — no capture |
| `/console/messages` | rendered | blocked — no capture | blocked — no capture |
| `/console/graph` | rendered | blocked — no capture | blocked — no capture |
| `/console/metrics` | rendered | blocked — no capture | blocked — no capture |
| `/console/config` | rendered | blocked — no capture | blocked — no capture |
| `/guide` | rendered | blocked — no capture | blocked — no capture |
| `/guide/onboarding` | rendered | blocked — no capture | blocked — no capture |
| `/b2b` | rendered | blocked — no capture | blocked — no capture |
| `/b2b/[orgSlug]` | rendered | blocked — no capture | blocked — no capture |
| `/api/v1/docs` | rendered | blocked — no capture | blocked — no capture |

## Fixture and provenance status

The evidence runner is designed to resolve the existing seeded activity, traveler trip, reviewer trip, admin persona, and B2B organization URL. When navigation starts, it writes `.sisyphus/evidence/rumia-corrective-baseline/baseline-results.json` with any unavailable fixture, response, navigation, console, page, media, or font failure without omitting the route. For this baseline attempt, that JSON was not produced because global setup stopped at the confirmed database RLS error below.

| Check | Command/result |
| --- | --- |
| Font provenance | `pnpm exec vitest run apps/web/content/font-provenance.test.ts` — pass (1 test) |
| Cinematic media manifest | `pnpm exec vitest run apps/web/content/cinematic-media-manifest.test.ts` — pass (1 test) |
| Asset QA | `pnpm qa:assets` — pass |
| Playwright baseline capture | blocked in global setup before route tests; no capture was substituted |
| Build ID/digest | capture blocked before standalone server; the evidence runner derives `buildId` from `RUMIA_BUILD_ID` or the exact `git rev-parse HEAD` rather than recording `unknown` |

## Baseline blocker

The required bounded command was attempted first in the sandbox and could not bind `127.0.0.1:3105` (`listen EPERM`). The same command was then retried with local-server permission. Its one configured global setup failed before any route navigation while upserting the seeded persona:

```text
error: new row violates row-level security policy for table "user_profiles"
at apps/web/playwright/global-setup.ts:80
```

Because the database/persona fixture could not be established, the runner produced no `baseline-results.json` and captured no screenshots. This is recorded as an environment/database blocker; the development server was not substituted, and no route UI source edits were made to hide the missing evidence. The route authority catalogue can still be validated independently; the exact command and failure remain available in the Task 1 implementer report.

The absence is intentional and internally consistent: no rendered route record, screenshot pair, or baseline-results JSON exists for this attempt. The inventory above is the planned 51-pair scope, not evidence that those captures completed.

## July 16 reopening findings

The redesign was reopened because the current implementation still converges on a repeated template across route families, does not make all route/state obligations executable, and lacks a trustworthy four-viewport evidence authority. The corrective queue therefore requires distinct Cover, Atlas, Decision, and Utility scene contracts; explicit footer/chrome/texture markers; authored empty/error/unavailable states; operator density and capability boundaries; and immutable desktop/mobile captures before any visual baseline approval. This report captures the pre-edit artifact and remains evidence, not approval.

## Review fix

The corrective code and test changes are committed as `6fc83c6` (`fix(frontend): close route catalogue review findings`). Existing dirty snapshot PNGs were intentionally left untouched and are not part of that commit.

The fix closes the review findings by:

- making checkout and expert-chat state/fixture/interaction scenarios explicit, including anonymous, empty, foreign, loading, unavailable, error, and successful transitions;
- assigning reviewer personas and `reviewer-trip` variants (`unassigned`, `assigned`, and `completed`) to authorized `/reviewer/*` scenarios while preserving anonymous/forbidden boundaries;
- restricting public routes to their declared canonical states and keeping the primary all-four scenario normal/ready/empty rather than a foreign not-found case;
- defining and consuming the exact `desktop-1440`, `tablet-landscape`, `tablet-portrait`, and `mobile-390` projects, with the visual suite mapping only desktop/mobile assertions to the existing snapshot filenames;
- deriving evidence `buildId` from `RUMIA_BUILD_ID` or the exact git HEAD and marking a route `rendered` only after navigation and screenshot success.

Verification completed after the fix:

| Check | Result |
| --- | --- |
| Focused route, matrix, HTTP, and redirect tests | `pnpm exec vitest run ...` — 4 files, 20 tests passed |
| Web typecheck | `pnpm --dir apps/web test:typecheck` — pass |
| Workspace typecheck | `pnpm typecheck` — 15/15 tasks passed |
| Route-matrix regeneration and whitespace check | `node scripts/generate-route-matrix.mjs && git diff --check` — pass; 53 routes, 319 scenarios, 737 expanded rows |
| Playwright project discovery | `--list --workers=1` — each canonical project lists 288 tests across 22 files |

The full baseline capture remains blocked at global setup by the confirmed database RLS error (`new row violates row-level security policy for table "user_profiles"` at `apps/web/playwright/global-setup.ts:80`). Consequently no screenshots or `baseline-results.json` were produced; no server substitution was used. That environment blocker is the remaining evidence concern, not a code-test failure.
