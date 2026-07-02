- RevealSection adoption tests can verify motion config by mocking `motion/react-m` and inspecting the `m.div` call args directly.
- Reduced-motion behavior should be exercised through `window.matchMedia` so the `useReducedMotion` hook stays in play.
- A plain CSF-style story file is sufficient for `packages/ui` even without a local Storybook package in the repo.
- T13 changed only `packages/maps/src/chapter-mapping.ts`, `packages/maps/src/chapter-mapping.test.ts`, and `apps/web/app/(app)/trip/[tripId]/_components/cinematic-map-section.tsx`; `pnpm -F @repo/maps test` and `pnpm -F web typecheck` passed.
- T13 runtime fix: `apps/web` needs a direct `motion` dependency for route-local `motion/*` imports, `useScroll` belongs on the motion-gate-allowed `motion/react` import, and Turbopack needs `motion/react-m` aliased to `motion/react` because installed `motion@12.38.0` exposes `m` from `motion/react` but not from `motion/react-m`.
- T14 implementation details:
  - Extracted `scrollToChapter` from `handleChapterSelect` to allow reusing scroll math for keyboard handling.
  - Set `tabIndex={-1}`, `role="region"`, and `aria-label="Cinematic trip map"` on the `<section>` elements (main + fallback).
  - Wired `onKeyDown` with ArrowDown/Up, Right/Left, Home, End, PageDown/Up mappings and `preventDefault` properly hooked to the scroll helpers.
  - Deep-link triggers focus on `sectionRef.current` without stealing it otherwise.
  - `pnpm qa:motion-gate` and `typecheck` passed.

## T15 — Kill-switch + telemetry (2026-05-05)

- Added pure SSR-safe helper `packages/maps/src/kill-switch.ts` exposing `isKillSwitchActive(env?)` and `getKillSwitchSource(env?)`.
- Strict literal `"1"` match (kept inline comment justifying rejection of `"true"`, `"yes"`, `" 1 "`).
- Server `MAPBOX_KILL_SWITCH` precedes client `NEXT_PUBLIC_MAPBOX_KILL_SWITCH`. Helper never returns or logs raw env values.
- `ProviderMap` now: short-circuits dynamic `import("mapbox-gl")` when active, renders existing static placeholder, and fires `cinematic_kill_switch_triggered` once per mount via `useRef` guard. Added optional `analytics?: AnalyticsProvider` prop matching `CinematicMap` pattern.
- `CinematicMapSection` swapped inline `process.env` check for the helper and wired once-only telemetry through `resolveDefaultAnalyticsProvider()`.
- Telemetry payload for env-driven trigger: `{ reason: "manual", loadCount: 0, threshold: 0 }`.
- T16 hydration fix: added `suppressHydrationWarning` to the static placeholder `<img>` in `packages/maps/src/components/cinematic-map.tsx` to ignore the client/server `src` mismatch from `staticImageUrl()`.
- Root `.env.example` is the single source — added `MAPBOX_KILL_SWITCH=` and `NEXT_PUBLIC_MAPBOX_KILL_SWITCH=` (no app-local example file present).
- Operator playbook header added to `apps/web/scripts/check-mapbox-budget.mjs`: 40k = prepare to flip, 75k = flip immediately.
- T13 `forceMapboxProvider=1` non-prod override preserved; kill switch wins via short-circuit before token resolution path.
- Verification: `pnpm -F @repo/maps test` 35/35, `pnpm -F web typecheck` clean, `pnpm qa:motion-gate` clean (128 files scanned, 0 violations).

## 2026-05-05 — Turbopack chunking vs runtime gating

Runtime-gated dynamic imports (`if (cond) return; await import(X)`) do NOT prevent Next.js/Turbopack from emitting and prefetching the chunk for `X`. The chunker is static; it sees the literal `import("X")` and adds X's chunk to the route graph regardless of guards.

To genuinely prevent a chunk from being fetched on a route:
- Move the `import("X")` literal into a separate module Y.
- Reach Y only via another dynamic `import("./Y")` from a guarded code path.
- Optionally expose Y via a subpath export so it stays out of the package's barrel.

This two-hop pattern means: route → barrel (no `X` literal) → guarded effect → `import("./Y")` → `Y` contains `import("X")`. Next prefetches the wrapper Y chunk only if discoverable, but the heavy `X` chunk requires runtime execution of Y to load.

Applied to T15: `provider-map.tsx` (no `mapbox-gl` literal) → effect `await import("./mount-mapbox")` → `mount-mapbox.ts` contains `import("mapbox-gl")`.

## 2026-05-05 — F3 Manual QA (kill-switch active)
- Target: http://localhost:3100/trip/3?forceMapboxProvider=1&chapter=2 (port 3100 active server, kill-switch on).
- DOM: static-fallback-svg present; provider-map absent; static-map-placeholder absent; .mapboxgl-canvas absent.
- Network filter `mapbox|api.mapbox|mapbox-gl`: zero requests after wrapper rename to mount-provider.
- Console: only known non-blockers (/placeholder-trip.jpg 404, Motion scroll-target non-static warning).
- Limitations: live-map flyTo, chapter scroll/keyboard nav, analytics events, and Memory leak checks not exercised because kill-switch fallback is intentionally rendered — those scenarios require kill-switch off; not within current env scope.


- Research refs for Wave 1/T3: 21st.dev has usable buckets for travel cards, pricing sections, dashboards, and empty states; treat them as component pattern catalogs, not licenses to copy implementation verbatim.
- Geist/Vercel empty-state guidance is strong for no-data/loading/error states: one primary CTA max, real Button/Link, sentence-case description, and `aria-live` after async updates.
- Linear pricing is a good premium-plan reference for sparse typography, clear tier hierarchy, annual billing emphasis, and feature comparison tables.
- Arc and Belmond are good premium travel/editorial references for cinematic hero pacing, whitespace, layered imagery, and story-driven sections.
- Stripe pricing is a good reference for dense-but-readable pricing disclosure, modular sectioning, and trust-first feature breakdowns.
