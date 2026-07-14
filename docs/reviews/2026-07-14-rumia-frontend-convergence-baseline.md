# Rumia frontend convergence baseline

**Date:** 2026-07-14  
**Authority:** `docs/superpowers/specs/2026-07-14-rumia-frontend-convergence-design.md`  
**Implementation plan:** `docs/superpowers/plans/2026-07-14-rumia-frontend-convergence-implementation.md`

## Exact review artifact

- Checkout: `main @ 3c9035a` plus pre-existing user-owned dirty files
- Review server: `next-server v16.2.4` production artifact
- Review URL: `http://127.0.0.1:3311/`
- Review evidence: `output/playwright/full-ui-review-2026-07-14/`
- Acceptance viewports: 1440×1000, 1024×768, 768×1024, 390×844
- Existing VPS/Lumes services were not changed by this frontend pass.

## Ownership and preservation

The working tree contains intentional changes from previous Rumia release and
visual passes, plus user-owned captures and scratch files. This convergence
slice preserves those files and stages only explicitly changed source or plan
files. No reset, checkout, broad cleanup, deployment, or VPS mutation is part
of this checkpoint.

## Current route ownership

| Surface | Owner batch | Primary job |
| --- | --- | --- |
| `/`, `/portugal`, `/explore`, `/activities/[activityId]` | public acquisition | discover and judge worthwhile activities |
| `/planner`, `/explore/workspace` | chosen-day composition | test time, transport, selected activities, and consequences |
| `/vault`, `/itineraries`, `/account`, `/trip/new`, `/trip/[tripId]` | saved traveler work | preserve, reopen, edit, or recover chosen days/trips |
| `/how-it-works`, `/pricing`, `/local-expertise`, `/feedback`, `/support` | public explanation | explain promise, boundaries, help, and feedback |
| `/sign-in`, `/privacy`, `/terms`, `/sustainability`, `/offline`, `/error`, `/not-found` | auth/legal/recovery | safely recover, inform, and continue |
| `/guide`, `/guide/onboarding`, `/beta`, `/b2b`, `/b2b/[orgSlug]`, `/checkout` | beta/commerce/developer | expose only truthful availability and chosen-day commerce |
| `/api/v1/docs` | developer | document the real API contract without marketing copy |
| `/console/**` | operator | operate queues and status with dense utility UI |
| `/(reviewer)/**`, `/(admin)/**` | protected operator | authenticated review/admin work only |

## Browser findings carried into implementation

- Direct `/planner` remains trip-first despite activity-first copy and uses
  `3/5/7/14 days`, destinations, and a `Your trip` summary.
- The direct planner continuation can remain disabled as “Saving this
  context” after navigation, with no success/retry state.
- Mobile footer height is roughly 643px on sparse public routes; desktop is
  roughly 379px. Link preservation and compact presentation must be solved in
  the shared footer rather than by hiding navigation.
- Sustainability has a desktop title/intro collision.
- `/checkout`, `/trip/new`, `/vault`, and the raw API docs still expose legacy
  whole-trip or obsolete commercial language and need explicit route-batch
  treatment.
- Sign-in failures can duplicate inline and toast feedback; one accessible
  alert path is required.

## Existing green evidence preserved

The prior closeout evidence remains useful for behavior already proven:

- 26-pair desktop/mobile route sweep had successful responses, one main and one
  H1, no horizontal overflow, and no browser page errors.
- Reduced motion disables non-essential autoplay/smooth scrolling and leaves
  the UI understandable.
- Keyboard focus, skip link, mobile navigation escape, activity save/remove,
  undo, and share flows were covered.

This baseline does not claim the new convergence plan is complete. It is the
starting checkpoint for the implementation tasks and their fresh evidence.
