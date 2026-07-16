# Task 2 — Explicit visual foundations

## Status

DONE. Committed as `4e31a1b` (`feat(frontend): enforce explicit visual foundations`) with follow-up `df414d3` (`fix(frontend): keep deferred media element stable`).

## Scope delivered

- `AppLayout` now requires explicit `surface` and `surfaceTexture` markers; `PageShell` is content-only so route shells own the single `main` landmark and field.
- `PublicRouteLayout` requires `scene`, `surfaceTone`, `surfaceTexture`, and `footerMode`, with an opt-out navigation mode for immersive product routes.
- `RouteScene` declares `focalLayer` and emits inspectable scene/tone/bleed markers with cover, atlas, decision, and utility field tokens.
- Marketing pages and utility surfaces listed in the brief were migrated to explicit route frames; the marketing group layout is presentation-neutral. Trip/account/support/auth shells declare their own surface/texture/footer ownership.
- Public navigation is the four-link Portugal / How it works / Local expertise / Pricing set plus one `What is worth doing?` action to `/explore`; the duplicate Explore link and sign-in chrome were removed.
- `CinematicMedia` preserves MP4 callers and adds mobile WebM, mobile MP4, desktop WebM ordering, a stable near-viewport video element with source attachment at a 300px root margin, offscreen/document-hidden pause, poster-only preference behavior, and desktop/mobile text-safe-zone variables.
- Local OFL font binaries and notices are provenance-recorded with SHA-256 checks, local-only CSS assertions, and system fallback stacks. Motion/scene/media-safe responsive tokens were added.
- Cinematic media/asset manifest metadata now records mobile safe zones and distinguishes Unsplash source licensing from Rumia-owned derivatives.

## Changed paths

All staged paths were limited to the Task 2 allowlist from `task-2-brief.md` (57 files, including the five local font binaries and three OFL notices). Unrelated dirty worktree files remain unstaged and untouched.

## Verification

Focused shared suite:

```sh
pnpm exec vitest run packages/ui/src/components/app-layout.test.tsx packages/ui/src/components/shell.test.tsx packages/ui/src/components/cinematic-media.test.tsx packages/ui/src/lib/media-preferences.test.ts apps/web/app/_components/public-route-layout.test.tsx apps/web/app/_components/route-scene.test.tsx apps/web/app/_components/site-footer.test.tsx apps/web/app/_components/top-nav.test.tsx apps/web/content/font-provenance.test.ts apps/web/content/cinematic-media-manifest.test.ts
```

Result: `10` files and `31` tests passed before the deferred-media follow-up; the focused cinematic suite was rerun afterward with `9` tests passing. JSDOM prints its expected `HTMLMediaElement.prototype.play` not-implemented warning for autoplay tests; the test suite remains green and browser playback is guarded.

```sh
pnpm qa:assets
git diff --check
pnpm typecheck
```

All passed; typecheck completed all 15 workspace tasks successfully.

## Self-review and concerns

- Existing user-owned changes in overlapping Task 2 paths were preserved; no reset, clean, broad staging, database/auth/schema change, or dev-server watcher was used.
- The inherited Task 1 environment concern remains: its baseline Playwright setup encountered PostgreSQL `user_profiles` RLS. This task does not change DB/Auth and does not claim a browser baseline pass.
- The focused JSDOM media tests intentionally exercise `play()` and therefore log JSDOM's unsupported-media warning; no unhandled test failures remain.

## Review fix pass

Reviewer findings were closed in `69c2f7f` (`fix(frontend): close shared foundation review gaps`):

- Added and exported the standalone `NavigationSheet` component and focused test. The clean Task 2 head no longer relies on an uncommitted dirty UI index to compile `TopNav`.
- Committed the explicit `LegalPage` consumers for `/privacy`, `/terms`, and `/sustainability`, so a clean checkout cannot retain implicit `PublicRouteLayout` props.
- Removed the inner legal `rumia-surface`/texture ownership and added `legal-page.test.tsx` to assert the outer utility frame owns the field.
- Kept the `df414d3` stable-video/source-attachment behavior unchanged.

Fresh review-fix verification:

```sh
pnpm exec vitest run packages/ui/src/components/app-layout.test.tsx packages/ui/src/components/shell.test.tsx packages/ui/src/components/cinematic-media.test.tsx packages/ui/src/lib/media-preferences.test.ts packages/ui/src/components/navigation-sheet.test.tsx apps/web/app/_components/public-route-layout.test.tsx apps/web/app/_components/route-scene.test.tsx apps/web/app/_components/site-footer.test.tsx apps/web/app/_components/top-nav.test.tsx apps/web/app/_components/legal-page.test.tsx apps/web/content/font-provenance.test.ts apps/web/content/cinematic-media-manifest.test.ts
```

Result: `12` files and `33` tests passed (with the same expected JSDOM `HTMLMediaElement.prototype.play` warning).

```sh
pnpm typecheck
pnpm qa:assets
git diff --check
```

All passed; typecheck completed all 15 workspace tasks successfully. No database/auth/schema files or unrelated dirty files were staged.

## Review fix pass — clean-head dependency closure

The second review identified dependencies that had been present only in the dirty worktree. They are now closed in `f83109c` (`fix(frontend): close clean-head foundation dependencies`) without staging unrelated changes:

- Added `@base-ui/react` to `packages/ui/package.json` and staged only its importer, package, floating-ui, reselect, and snapshot entries in `pnpm-lock.yaml`; unrelated Wrangler, Next, and lockfile churn remains unstaged.
- Committed the direct Task 2 route-frame dependencies `hero-editorial-media.tsx`, `portugal-editorial-chapter.tsx`, and `editorial-chapter-close.tsx`.
- Committed `DecisionStatePanel` (source and test) because `/beta`, `/checkout`, and `/itineraries` import it from `@repo/ui`.
- Committed `EditorialMedia` (source and test) because the Portugal editorial chapter imports it from `@repo/ui`.
- Committed the activity-detail `ActivityDetailSaveAction` source and test used by the committed activity detail route.
- Isolated the `side-sheet` export during the first clean-head pass; the follow-up dependency audit (closed in `3f97646` below) showed the committed itinerary export drawer requires it, so the final artifact includes its exact source/test.
- Removed nested `rumia-surface`/`data-surface-texture="editorial"` ownership from `/offline`, leaving the outer utility frame's explicit `surfaceTexture="none"` authoritative.

The dependency classification is intentional: the route and UI callers are Task 2 committed surfaces; their missing helper/component files and the Base UI lock chain were pre-existing dirty/untracked dependencies. No database, auth, schema, or PNG files were staged.

Fresh focused verification:

```sh
pnpm exec vitest run packages/ui/src/components/app-layout.test.tsx packages/ui/src/components/shell.test.tsx packages/ui/src/components/cinematic-media.test.tsx packages/ui/src/lib/media-preferences.test.ts packages/ui/src/components/navigation-sheet.test.tsx packages/ui/src/components/decision-state-panel.test.tsx packages/ui/src/components/editorial-media.test.tsx apps/web/app/_components/public-route-layout.test.tsx apps/web/app/_components/route-scene.test.tsx apps/web/app/_components/site-footer.test.tsx apps/web/app/_components/top-nav.test.tsx apps/web/app/_components/legal-page.test.tsx 'apps/web/app/(marketing)/activities/[activityId]/_components/activity-detail-save-action.test.tsx' apps/web/content/font-provenance.test.ts apps/web/content/cinematic-media-manifest.test.ts
```

Result: `15` files and `43` tests passed. JSDOM emitted only the expected `HTMLMediaElement.prototype.play` not-implemented warning from autoplay tests.

```sh
pnpm typecheck
pnpm qa:assets
git diff --cached --check
git diff --check
```

All passed; typecheck completed all 15 typecheck tasks across 16 packages in scope, and asset provenance checks remained green.

Clean-head import audit:

```text
Audited 61 changed TS/TSX files against HEAD.
No missing local relative or @/ import targets.
```

This audit includes `packages/ui/src/index.ts` and confirms the committed route/helper/import chain resolves without relying on the remaining dirty worktree files.

## Final dependency closure

The clean-head audit then followed the committed `/itineraries` chain through `ItinerarySearch` → `ItineraryExportDrawer` and found its `SideSheet`/`SideSheetClose` imports. `f83109c`'s temporary export removal was therefore corrected in `3f97646` (`fix(frontend): retain itinerary side sheet dependency`) by committing the exact `packages/ui/src/components/side-sheet.tsx` source and test and restoring that export. The Base UI dependency already staged in `f83109c` supplies the shared dialog implementation.

Final dependency verification:

```sh
pnpm --filter web exec tsc --noEmit --pretty false
```

Passed with no diagnostics (non-cached direct web typecheck).

```sh
pnpm exec vitest run packages/ui/src/components/app-layout.test.tsx packages/ui/src/components/shell.test.tsx packages/ui/src/components/cinematic-media.test.tsx packages/ui/src/lib/media-preferences.test.ts packages/ui/src/components/navigation-sheet.test.tsx packages/ui/src/components/side-sheet.test.tsx packages/ui/src/components/decision-state-panel.test.tsx packages/ui/src/components/editorial-media.test.tsx apps/web/app/_components/public-route-layout.test.tsx apps/web/app/_components/route-scene.test.tsx apps/web/app/_components/site-footer.test.tsx apps/web/app/_components/top-nav.test.tsx apps/web/app/_components/legal-page.test.tsx 'apps/web/app/(marketing)/activities/[activityId]/_components/activity-detail-save-action.test.tsx' apps/web/content/font-provenance.test.ts apps/web/content/cinematic-media-manifest.test.ts
pnpm typecheck
pnpm qa:assets
git diff --check
git diff --cached --check
```

Result: `16` files and `45` tests passed; asset provenance and whitespace checks passed. JSDOM's four expected media-play warnings remain non-failing.

## Release-review fix wave

The release-review closure is complete across three commits:

- `73d4457` (`fix(frontend): close release review gaps`) commits the 12 existing manifest-backed Unsplash files under `apps/web/public/media/unsplash/` without redownloading or altering bytes; adds the `apps/web/content/**/*.test.ts` Vitest include; makes `LegalPage` accept an optional scene (utility by default) and passes `scene="cover"` from `/sustainability`; adds the cover-scene assertion while retaining utility defaults for privacy/terms; removes the Task 2-added SideSheet source/test/export from the clean artifact while leaving the user's copies untracked; and normalizes the three OFL notice files to LF with trailing whitespace removed.
- `bcf8db5` (`fix(frontend): sync normalized font provenance`) updates only the three `licenseSha256` values in `apps/web/content/font-provenance.json` to match those normalized bytes. The license text content is unchanged after stripping line endings/trailing whitespace for comparison.
- `515bf50` (`fix(frontend): complete Base UI lock snapshot`) adds the missing `reselect@5.2.0` snapshot entry discovered by a frozen clean-archive install; this completes the previously committed `@base-ui/react` lock chain without unrelated lockfile churn.

The committed media set is exactly: `douro-terraces-card.webp`, `douro-terraces-editorial.webp`, `douro-terraces-loop.mp4`, `douro-terraces.jpg`, `douro-terraces.webp`, `porto-cobblestone-card.webp`, `porto-cobblestone-street.jpg`, `porto-cobblestone-street.webp`, `portugal-coast-card.webp`, `portugal-coast-golden-hour-loop.mp4`, `portugal-coast-golden-hour.jpg`, and `portugal-coast-golden-hour.webp`.

Final verification:

```sh
pnpm exec vitest run packages/ui/src/components/app-layout.test.tsx packages/ui/src/components/shell.test.tsx packages/ui/src/components/cinematic-media.test.tsx packages/ui/src/lib/media-preferences.test.ts packages/ui/src/components/navigation-sheet.test.tsx packages/ui/src/components/decision-state-panel.test.tsx packages/ui/src/components/editorial-media.test.tsx apps/web/app/_components/public-route-layout.test.tsx apps/web/app/_components/route-scene.test.tsx apps/web/app/_components/site-footer.test.tsx apps/web/app/_components/top-nav.test.tsx apps/web/app/_components/legal-page.test.tsx 'apps/web/app/(marketing)/activities/[activityId]/_components/activity-detail-save-action.test.tsx' apps/web/content/font-provenance.test.ts apps/web/content/cinematic-media-manifest.test.ts
pnpm --filter @repo/ui exec tsc --noEmit --pretty false
pnpm --filter web exec tsc --noEmit --pretty false
pnpm typecheck
pnpm qa:assets
node scripts/check-assets.mjs
git diff --check f1dc287..HEAD
git diff --check
```

Results: `15` focused files and `44` tests passed; the only output is the existing JSDOM `HTMLMediaElement.prototype.play` warning from media tests. Direct UI/web typechecks passed. Full typecheck passed with `15` successful tasks across `16` packages in scope. Asset QA and both range/worktree diff checks passed.

The committed artifact itself was extracted with `git archive HEAD`; `node scripts/check-assets.mjs` passed there with no reliance on dirty files. A frozen offline install of that archive completed after `515bf50` fixed the lock snapshot. A clean-package typecheck remains separately limited by the pre-existing `packages/ui` imports of `next/link` without a package-local Next dependency; the normal workspace direct UI/web/full typechecks above pass.

Clean-head import and asset audit:

```text
Audited 62 changed TS/TSX files against HEAD.
No missing local relative or @/ import targets.
Manifest files: 21; missing in worktree: 0.
```

The clean UI index retains `NavigationSheet` for `TopNav` and no longer exports SideSheet. No DB/Auth/schema or PNG changes were made.
