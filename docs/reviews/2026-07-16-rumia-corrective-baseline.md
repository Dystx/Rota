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

## Catalogue inventory

The current HTTP catalogue contains 53 literal route entries. The two redirect entries are recorded behaviorally; the remaining 51 rendered routes each receive a desktop/mobile capture pair.

| Route | Kind | Desktop | Mobile |
| --- | --- | --- | --- |
| `/` | rendered | pending | pending |
| `/portugal` | rendered | pending | pending |
| `/explore` | rendered | pending | pending |
| `/explore/workspace` | rendered | pending | pending |
| `/activities/[activityId]` | rendered | pending | pending |
| `/feedback` | rendered | pending | pending |
| `/how-it-works` | rendered | pending | pending |
| `/human-review` | redirect → `/local-expertise` | status/destination | status/destination |
| `/local-expertise` | rendered | pending | pending |
| `/pricing` | rendered | pending | pending |
| `/planner` | rendered | pending | pending |
| `/plan` | redirect → `/planner` | status/destination | status/destination |
| `/trip/new` | rendered | pending | pending |
| `/trip/[tripId]` | rendered | pending | pending |
| `/trip/[tripId]/map` | rendered | pending | pending |
| `/trip/[tripId]/export` | rendered | pending | pending |
| `/checkout` | rendered | pending | pending |
| `/itineraries` | rendered | pending | pending |
| `/vault` | rendered | pending | pending |
| `/account` | rendered | pending | pending |
| `/logistics` | rendered | pending | pending |
| `/expert-chat` | rendered | pending | pending |
| `/sign-in` | rendered | pending | pending |
| `/support` | rendered | pending | pending |
| `/privacy` | rendered | pending | pending |
| `/terms` | rendered | pending | pending |
| `/sustainability` | rendered | pending | pending |
| `/offline` | rendered | pending | pending |
| `/reviewer/queue` | rendered | pending | pending |
| `/reviewer/history` | rendered | pending | pending |
| `/reviewer/profile` | rendered | pending | pending |
| `/reviewer/operations` | rendered | pending | pending |
| `/reviewer/trips/[tripId]` | rendered | pending | pending |
| `/admin/places` | rendered | pending | pending |
| `/admin/countries` | rendered | pending | pending |
| `/admin/regions` | rendered | pending | pending |
| `/admin/partners` | rendered | pending | pending |
| `/admin/reviewers` | rendered | pending | pending |
| `/admin/specialists` | rendered | pending | pending |
| `/admin/quality` | rendered | pending | pending |
| `/admin/analytics` | rendered | pending | pending |
| `/console` | rendered | pending | pending |
| `/console/pipeline` | rendered | pending | pending |
| `/console/workspace` | rendered | pending | pending |
| `/console/messages` | rendered | pending | pending |
| `/console/graph` | rendered | pending | pending |
| `/console/metrics` | rendered | pending | pending |
| `/console/config` | rendered | pending | pending |
| `/guide` | rendered | pending | pending |
| `/guide/onboarding` | rendered | pending | pending |
| `/b2b` | rendered | pending | pending |
| `/b2b/[orgSlug]` | rendered | pending | pending |
| `/api/v1/docs` | rendered | pending | pending |

## Fixture and provenance status

The evidence runner resolves the existing seeded activity, traveler trip, reviewer trip, admin persona, and B2B organization URL. The generated JSON result at `.sisyphus/evidence/rumia-corrective-baseline/baseline-results.json` records any unavailable fixture, response, navigation, console, page, media, or font failure without omitting the route.

| Check | Command/result |
| --- | --- |
| Font provenance | `pnpm exec vitest run apps/web/content/font-provenance.test.ts` — pass (1 test) |
| Cinematic media manifest | `pnpm exec vitest run apps/web/content/cinematic-media-manifest.test.ts` — pass (1 test) |
| Asset QA | `pnpm qa:assets` — pass |
| Playwright baseline capture | blocked in global setup before route tests; no capture was substituted |
| Build ID/digest | not produced; standalone server was not reached by the test after setup failure |

## Baseline blocker

The required bounded command was attempted first in the sandbox and could not bind `127.0.0.1:3105` (`listen EPERM`). The same command was then retried with local-server permission. Its one configured global setup failed before any route navigation while upserting the seeded persona:

```text
error: new row violates row-level security policy for table "user_profiles"
at apps/web/playwright/global-setup.ts:80
```

Because the database/persona fixture could not be established, the runner produced no `baseline-results.json` and captured no screenshots. This is recorded as an environment/database blocker; the development server was not substituted, and no route UI source edits were made to hide the missing evidence. The route authority catalogue can still be validated independently; the exact command and failure remain available in the Task 1 implementer report.

## July 16 reopening findings

The redesign was reopened because the current implementation still converges on a repeated template across route families, does not make all route/state obligations executable, and lacks a trustworthy four-viewport evidence authority. The corrective queue therefore requires distinct Cover, Atlas, Decision, and Utility scene contracts; explicit footer/chrome/texture markers; authored empty/error/unavailable states; operator density and capability boundaries; and immutable desktop/mobile captures before any visual baseline approval. This report captures the pre-edit artifact and remains evidence, not approval.
