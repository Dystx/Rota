# Rumia snapshot approval

Date: 2026-07-16 (closed 2026-07-17)
Task: 17 — human visual gate

Status: **APPROVED — exact visual family closed.** On 2026-07-17 the final exact-artifact runner materialized build `F5CzHygTrY-JgoMIi9Sxt` with digest `e839dcd3790d560ffbd2fb8c694d1c02277c5353a628440b9e70358aed6277e0`. The authenticated route/state matrix completed, the approved desktop/mobile family was materialized, and the final visual suite passed 102/102 rows. The owner explicitly approved the exact served artifact.

The matrix below is the complete 51-rendered-route × 2-primary-viewport obligation (102 rows). Each row now records the approved exact-artifact capture and review decision; the earlier unauthenticated/RLS blocker is retained in the Task 17 report as historical evidence. The review decision is based on the exact served artifact and explicit owner approval, not inferred from code checks or pixel expectations alone.

Closeout evidence: final exact non-visual gate 1,640 passed / 2,424 intentional skips from 4,064 tests; final exact visual gate 102 passed / 306 intentional skips from 408 tests; focused accessibility rerun 157 passed / 3 intentional skips; approved visual update 102 passed; mobile overflow contract 32/32 passed. No deployment, schema, or environment-file change was made.

| Scenario ID | Route | Persona/state | Viewport | Old baseline | Candidate | Diff | Review decision | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `home--ready` | `/` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `home--ready` | `/` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `portugal--ready` | `/portugal` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `portugal--ready` | `/portugal` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `explore--ready` | `/explore` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `explore--ready` | `/explore` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `explore-workspace--empty` | `/explore/workspace` | public / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `explore-workspace--empty` | `/explore/workspace` | public / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `activities-[activityId]--ready` | `/activities/[activityId]` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `activities-[activityId]--ready` | `/activities/[activityId]` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `feedback--ready` | `/feedback` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `feedback--ready` | `/feedback` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `how-it-works--ready` | `/how-it-works` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `how-it-works--ready` | `/how-it-works` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `local-expertise--ready` | `/local-expertise` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `local-expertise--ready` | `/local-expertise` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `pricing--ready` | `/pricing` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `pricing--ready` | `/pricing` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `planner--ready` | `/planner` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `planner--ready` | `/planner` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `trip-new--ready` | `/trip/new` | traveler / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `trip-new--ready` | `/trip/new` | traveler / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `trip-[tripId]--empty` | `/trip/[tripId]` | traveler / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `trip-[tripId]--empty` | `/trip/[tripId]` | traveler / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `trip-[tripId]-map--empty` | `/trip/[tripId]/map` | traveler / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `trip-[tripId]-map--empty` | `/trip/[tripId]/map` | traveler / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `trip-[tripId]-export--empty` | `/trip/[tripId]/export` | traveler / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `trip-[tripId]-export--empty` | `/trip/[tripId]/export` | traveler / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `checkout--no-trip` | `/checkout` | traveler / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `checkout--no-trip` | `/checkout` | traveler / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `itineraries--empty` | `/itineraries` | traveler / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `itineraries--empty` | `/itineraries` | traveler / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `vault--empty` | `/vault` | traveler / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `vault--empty` | `/vault` | traveler / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `account--empty` | `/account` | traveler / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `account--empty` | `/account` | traveler / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `logistics--empty` | `/logistics` | traveler / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `logistics--empty` | `/logistics` | traveler / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `expert-chat--no-trip` | `/expert-chat` | traveler / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `expert-chat--no-trip` | `/expert-chat` | traveler / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `sign-in--ready` | `/sign-in` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `sign-in--ready` | `/sign-in` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `support--ready` | `/support` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `support--ready` | `/support` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `privacy--ready` | `/privacy` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `privacy--ready` | `/privacy` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `terms--ready` | `/terms` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `terms--ready` | `/terms` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `sustainability--ready` | `/sustainability` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `sustainability--ready` | `/sustainability` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `offline--ready` | `/offline` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `offline--ready` | `/offline` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `reviewer-queue--empty` | `/reviewer/queue` | reviewer / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `reviewer-queue--empty` | `/reviewer/queue` | reviewer / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `reviewer-history--empty` | `/reviewer/history` | reviewer / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `reviewer-history--empty` | `/reviewer/history` | reviewer / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `reviewer-profile--empty` | `/reviewer/profile` | reviewer / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `reviewer-profile--empty` | `/reviewer/profile` | reviewer / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `reviewer-operations--empty` | `/reviewer/operations` | reviewer / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `reviewer-operations--empty` | `/reviewer/operations` | reviewer / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `reviewer-trips-[tripId]--empty` | `/reviewer/trips/[tripId]` | reviewer / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `reviewer-trips-[tripId]--empty` | `/reviewer/trips/[tripId]` | reviewer / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-places--empty` | `/admin/places` | admin / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-places--empty` | `/admin/places` | admin / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-countries--empty` | `/admin/countries` | admin / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-countries--empty` | `/admin/countries` | admin / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-regions--empty` | `/admin/regions` | admin / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-regions--empty` | `/admin/regions` | admin / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-partners--empty` | `/admin/partners` | admin / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-partners--empty` | `/admin/partners` | admin / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-reviewers--empty` | `/admin/reviewers` | admin / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-reviewers--empty` | `/admin/reviewers` | admin / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-specialists--empty` | `/admin/specialists` | admin / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-specialists--empty` | `/admin/specialists` | admin / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-quality--empty` | `/admin/quality` | admin / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-quality--empty` | `/admin/quality` | admin / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-analytics--empty` | `/admin/analytics` | admin / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `admin-analytics--empty` | `/admin/analytics` | admin / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `console--empty` | `/console` | admin / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `console--empty` | `/console` | admin / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `console-pipeline--empty` | `/console/pipeline` | admin / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `console-pipeline--empty` | `/console/pipeline` | admin / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `console-workspace--empty` | `/console/workspace` | admin / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `console-workspace--empty` | `/console/workspace` | admin / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `console-messages--empty` | `/console/messages` | admin / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `console-messages--empty` | `/console/messages` | admin / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `console-graph--empty` | `/console/graph` | admin / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `console-graph--empty` | `/console/graph` | admin / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `console-metrics--empty` | `/console/metrics` | admin / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `console-metrics--empty` | `/console/metrics` | admin / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `console-config--empty` | `/console/config` | admin / empty | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `console-config--empty` | `/console/config` | admin / empty | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `guide--ready` | `/guide` | traveler / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `guide--ready` | `/guide` | traveler / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `guide-onboarding--ready` | `/guide/onboarding` | traveler / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `guide-onboarding--ready` | `/guide/onboarding` | traveler / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `b2b--ready` | `/b2b` | public / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `b2b--ready` | `/b2b` | public / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `b2b-[orgSlug]--disabled` | `/b2b/[orgSlug]` | traveler / disabled | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `b2b-[orgSlug]--disabled` | `/b2b/[orgSlug]` | traveler / disabled | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `api-v1-docs--ready` | `/api/v1/docs` | admin / ready | desktop-1440 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |
| `api-v1-docs--ready` | `/api/v1/docs` | admin / ready | mobile-390 | pre-approval baseline | exact-artifact capture | reviewed | APPROVED | Owner approval and final exact-artifact gate |

Approval rule: the owner must make an explicit decision for every row before an approved snapshot update. That rule was satisfied on 2026-07-17 for all 102 rows after exact-artifact capture and review. A small pixel diff is not approval; captures also passed the human checks for blank columns, unassigned bands, invisible media, missing next actions, footer-heavy first viewports, clipped controls, and repetitive composition.

## 2026-07-18 bounded hardening delta

Single exact candidate: build `yOnVK7qbn55IFxrzqRCkV`, digest `001ad401de23721cde98ef35643bd9abc38c16f63fd8de34ad13c70a30248867`.

Gate summary: all Step 1 gates passed. The first same-build pre-approval accumulated-run stopped on a `60s` `admin-specialists--populated` timeout after the page had rendered; the exact scenario then passed once in `633ms` and three one-worker repeats in `532ms`, `545ms`, and `529ms`. The clean full same-build rerun passed `1,643` non-visual checks (`2,433` skipped) and produced exactly the six intentional stale visual deltas below (`96` other visual checks passed; `306` skipped). No seventh delta was observed. No snapshots were updated.

Immutable delta algorithm: `delta_sha256 = SHA-256(UTF8("rumia-visual-delta-v1\0") || uint64be(old_byte_length) || old_bytes || uint64be(approved_byte_length) || approved_bytes)`. Git object IDs and direct byte SHA-256 values make every old/approved pair reproducible without transient Playwright candidates or diff images.

| Scenario | Route | Persona/state | Viewport | Old baseline commit / blob / SHA-256 | Approved baseline commit / blob / SHA-256 | Deterministic delta SHA-256 | Decision and visual reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `home--ready` | `/` | public / ready | desktop-1440 | `5e45bc52e64dc0d20162e6369d1c863b4a8edaf6` / `963b326d66c36da01b9182c4a8a11e307660ba3f` / `4ca841b8504456099467286f7211dfe7a752f8e360f5748c5105c7805c648289` | `41c12654eafa854b7cc613149957c53a04cd3f88` / `62af079dfdabfd96842987e23fe1149d3ef9ed9e` / `8cd3560de644a22a190d0b301ff32819149d6731586a344d6e98b813f18bdd94` | `37fdb55876ec9ebc6b409e1b9681b58240ce65e4f0b25ba277e01b49b9469af6` | APPROVED 2026-07-18 — H1 and primary CTA fit; readable linen/midnight decision chapter and editorial field-note cadence; no overflow. |
| `home--ready` | `/` | public / ready | mobile-390 | `5e45bc52e64dc0d20162e6369d1c863b4a8edaf6` / `0aef540ee79b70680eda7179443f7cdc87a64087` / `58d2c2b1d1e143b3620e9bda787da3aee240c0495944cfa7cdb98c86040e959a` | `41c12654eafa854b7cc613149957c53a04cd3f88` / `dd21202576773dcf3dac4893559aa703b8eea149` / `412d6e855e1b184975e257dc1650acf90bd8bfd095f5305a14c283beb4bf8016` | `9b4e6a6a341c2021f0c183789f32b11f500e65200aeb2a924cfe394b22bb786e` | APPROVED 2026-07-18 — one-up full-width recommendation cards are unclipped and readable; no horizontal overflow. |
| `planner--ready` | `/planner` | public / ready | desktop-1440 | `5e45bc52e64dc0d20162e6369d1c863b4a8edaf6` / `d555ec4641fa28fe764b04ea2ea8743cd0925bb4` / `9e48c3386314e4ee1f8ed08439730c068b5e4873f816ac299c28e0621602d0ed` | `41c12654eafa854b7cc613149957c53a04cd3f88` / `80a5849898aeef1f5d308c9992144460021a4111` / `73fb0a8e6d9cf506da30d301e7880ccd54df8d63417de16e73581ede24bdae68` | `749412143a5b9ea599b5146cf572d5bb7fd7bf9a5dd2de230879e262663b5758` | APPROVED 2026-07-18 — readable midnight field, finite choice controls, visible selected state, and primary CTA within viewport. |
| `planner--ready` | `/planner` | public / ready | mobile-390 | `5e45bc52e64dc0d20162e6369d1c863b4a8edaf6` / `a5d1a0fd88d79caf0a3e81762fbbc79f1e51ee99` / `c682a5a6998cc5597d0b260ef0759f6f543af3e639cd4d7545bd625ff2c8cf26` | `41c12654eafa854b7cc613149957c53a04cd3f88` / `629c4d13119b4858f7d98d39969e3d528ed7eaa5` / `892653d585b15cd9d3f7d78d44e48254d53802d87f1d5d378d672f12e853a0a2` | `47d71aefe76304e88e75c4a21c66bbc50d37722df3af848940a1b49a00e044c8` | APPROVED 2026-07-18 — zero inputs/selects/textareas; selected Place has gold outline plus `aria-pressed=true`; CTA reachable with no overflow. |
| `console-workspace--empty` | `/console/workspace` | admin / empty | desktop-1440 | `5e45bc52e64dc0d20162e6369d1c863b4a8edaf6` / `e96c9e042a3b09f8f26ac50a5a0c3c770d0c2510` / `43c368f077126fcc0ae80260d6714b8db9632720eedee99545020b0ea1b152ca` | `41c12654eafa854b7cc613149957c53a04cd3f88` / `538d51759ef763b9634e3c0b1cae804b3003a917` / `4275fd119991250bec8b54b92bfe66a9c8d1f3cfa417c430833376193b9f28ba` | `b3a86e889f6ecd4f702128e0bb46bd2ab6d53a72db6c82c4ce63c61c36114b02` | APPROVED 2026-07-18 — intentional three-pane workspace is retained. |
| `console-workspace--empty` | `/console/workspace` | admin / empty | mobile-390 | `5e45bc52e64dc0d20162e6369d1c863b4a8edaf6` / `d76b55059ab5f8dc03257f1caacc3d3c6fde8494` / `95dc938937242ae99587b6ee08131993b19834b03885a9a5bea6e7868e2c77f3` | `41c12654eafa854b7cc613149957c53a04cd3f88` / `e728dc6df41251a8352d2d51a226de60f206e928` / `6761948f4ce4f39c9778099c7a43c7aaf8a8291d09638c67845ae970bac7090a` | `8eb08a6d42aba45a047b4c0af08927c01d4e1a03ccc058b313aa693cc1627bb5` | APPROVED 2026-07-18 — tabs plus one pane; capture ends intentionally with no inherited nested viewport or empty tail. |

Hardening delta result: all six changed rows received explicit owner approval, the scoped update changed only those six PNGs, and the final exact-artifact gate passed against the same recorded build ID/digest. This approval does not authorize deployment or public ingress.
