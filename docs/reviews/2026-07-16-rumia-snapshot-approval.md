# Rumia snapshot approval

Date: 2026-07-16
Task: 17 — human visual gate

Status: **OPEN — owner approval required.** The exact-artifact runner materialized build `c9xuE8cM28hlmqUSFhDD6` with digest `634ac23b6869c56fd066859ba84fa26939153d623f769d5b21d83e18cb1d4a7a`, but the authenticated Playwright global setup stopped before capture at `apps/web/playwright/global-setup.ts:113` because the local `user_profiles` insert is rejected by PostgreSQL RLS. No snapshot update command was run and no candidate image is approved.

The matrix below is the complete 51-rendered-route × 2-primary-viewport obligation (102 rows). `old baseline`, `candidate`, and `diff` remain intentionally unmaterialized until the authenticated gate can run. The review decision is not inferred from the code checks or pixel expectations.

| Scenario ID | Route | Persona/state | Viewport | Old baseline | Candidate | Diff | Review decision | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `home--ready` | `/` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `home--ready` | `/` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `portugal--ready` | `/portugal` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `portugal--ready` | `/portugal` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `explore--ready` | `/explore` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `explore--ready` | `/explore` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `explore-workspace--empty` | `/explore/workspace` | public / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `explore-workspace--empty` | `/explore/workspace` | public / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `activities-[activityId]--ready` | `/activities/[activityId]` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `activities-[activityId]--ready` | `/activities/[activityId]` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `feedback--ready` | `/feedback` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `feedback--ready` | `/feedback` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `how-it-works--ready` | `/how-it-works` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `how-it-works--ready` | `/how-it-works` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `local-expertise--ready` | `/local-expertise` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `local-expertise--ready` | `/local-expertise` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `pricing--ready` | `/pricing` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `pricing--ready` | `/pricing` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `planner--ready` | `/planner` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `planner--ready` | `/planner` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `trip-new--ready` | `/trip/new` | traveler / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `trip-new--ready` | `/trip/new` | traveler / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `trip-[tripId]--empty` | `/trip/[tripId]` | traveler / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `trip-[tripId]--empty` | `/trip/[tripId]` | traveler / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `trip-[tripId]-map--empty` | `/trip/[tripId]/map` | traveler / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `trip-[tripId]-map--empty` | `/trip/[tripId]/map` | traveler / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `trip-[tripId]-export--empty` | `/trip/[tripId]/export` | traveler / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `trip-[tripId]-export--empty` | `/trip/[tripId]/export` | traveler / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `checkout--no-trip` | `/checkout` | traveler / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `checkout--no-trip` | `/checkout` | traveler / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `itineraries--empty` | `/itineraries` | traveler / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `itineraries--empty` | `/itineraries` | traveler / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `vault--empty` | `/vault` | traveler / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `vault--empty` | `/vault` | traveler / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `account--empty` | `/account` | traveler / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `account--empty` | `/account` | traveler / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `logistics--empty` | `/logistics` | traveler / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `logistics--empty` | `/logistics` | traveler / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `expert-chat--no-trip` | `/expert-chat` | traveler / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `expert-chat--no-trip` | `/expert-chat` | traveler / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `sign-in--ready` | `/sign-in` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `sign-in--ready` | `/sign-in` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `support--ready` | `/support` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `support--ready` | `/support` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `privacy--ready` | `/privacy` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `privacy--ready` | `/privacy` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `terms--ready` | `/terms` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `terms--ready` | `/terms` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `sustainability--ready` | `/sustainability` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `sustainability--ready` | `/sustainability` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `offline--ready` | `/offline` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `offline--ready` | `/offline` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `reviewer-queue--empty` | `/reviewer/queue` | reviewer / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `reviewer-queue--empty` | `/reviewer/queue` | reviewer / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `reviewer-history--empty` | `/reviewer/history` | reviewer / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `reviewer-history--empty` | `/reviewer/history` | reviewer / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `reviewer-profile--empty` | `/reviewer/profile` | reviewer / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `reviewer-profile--empty` | `/reviewer/profile` | reviewer / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `reviewer-operations--empty` | `/reviewer/operations` | reviewer / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `reviewer-operations--empty` | `/reviewer/operations` | reviewer / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `reviewer-trips-[tripId]--empty` | `/reviewer/trips/[tripId]` | reviewer / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `reviewer-trips-[tripId]--empty` | `/reviewer/trips/[tripId]` | reviewer / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-places--empty` | `/admin/places` | admin / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-places--empty` | `/admin/places` | admin / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-countries--empty` | `/admin/countries` | admin / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-countries--empty` | `/admin/countries` | admin / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-regions--empty` | `/admin/regions` | admin / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-regions--empty` | `/admin/regions` | admin / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-partners--empty` | `/admin/partners` | admin / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-partners--empty` | `/admin/partners` | admin / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-reviewers--empty` | `/admin/reviewers` | admin / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-reviewers--empty` | `/admin/reviewers` | admin / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-specialists--empty` | `/admin/specialists` | admin / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-specialists--empty` | `/admin/specialists` | admin / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-quality--empty` | `/admin/quality` | admin / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-quality--empty` | `/admin/quality` | admin / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-analytics--empty` | `/admin/analytics` | admin / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `admin-analytics--empty` | `/admin/analytics` | admin / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `console--empty` | `/console` | admin / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `console--empty` | `/console` | admin / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `console-pipeline--empty` | `/console/pipeline` | admin / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `console-pipeline--empty` | `/console/pipeline` | admin / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `console-workspace--empty` | `/console/workspace` | admin / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `console-workspace--empty` | `/console/workspace` | admin / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `console-messages--empty` | `/console/messages` | admin / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `console-messages--empty` | `/console/messages` | admin / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `console-graph--empty` | `/console/graph` | admin / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `console-graph--empty` | `/console/graph` | admin / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `console-metrics--empty` | `/console/metrics` | admin / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `console-metrics--empty` | `/console/metrics` | admin / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `console-config--empty` | `/console/config` | admin / empty | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `console-config--empty` | `/console/config` | admin / empty | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `guide--ready` | `/guide` | traveler / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `guide--ready` | `/guide` | traveler / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `guide-onboarding--ready` | `/guide/onboarding` | traveler / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `guide-onboarding--ready` | `/guide/onboarding` | traveler / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `b2b--ready` | `/b2b` | public / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `b2b--ready` | `/b2b` | public / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `b2b-[orgSlug]--disabled` | `/b2b/[orgSlug]` | traveler / disabled | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `b2b-[orgSlug]--disabled` | `/b2b/[orgSlug]` | traveler / disabled | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `api-v1-docs--ready` | `/api/v1/docs` | admin / ready | desktop-1440 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |
| `api-v1-docs--ready` | `/api/v1/docs` | admin / ready | mobile-390 | not mapped | not produced | not produced | PENDING | Authenticated gate stopped before capture |

Approval rule: the owner must make an explicit decision for every row above before any `--update-snapshots` command is allowed. A small pixel diff is not approval; captures must also pass the human checks for blank columns, unassigned bands, invisible media, missing next actions, footer-heavy first viewports, clipped controls, and repetitive composition.
