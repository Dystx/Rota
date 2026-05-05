# Cinematic Redesign B — Learnings

## [2026-05-05] Session Start
- Plan is Momus-approved (v5 OKAY); 0/24 tasks started
- Critical path: T00 → T01 → T02 → T03 → T12 → T13 → T15 → F1–F4
- Wave 0 (T00) gates everything; must pass before any other task starts
- `generateItineraryFromBrief` lives at `packages/ai/src/index.ts:146`
- `orchestrator.ts` does NOT exist and must NOT be created
- `briefCacheKey(brief)` = sha1 over canonicalized TripBrief (no id/version fields)
- Analytics canonical: `tryCapture` at `packages/analytics/src/index.ts`
- DO NOT transpile mapbox-gl (breaks workers)
- DO NOT install react-map-gl
- Smoke page must be deleted before commit

## [2026-05-05] Task: T00
- Installed mapbox-gl v3.23.1 via `mapbox-gl@^3`; v3 package includes TypeScript declarations, so no `@types/mapbox-gl` was added.
- `mapbox-gl` remains absent from `apps/web/next.config.ts` `transpilePackages`; do not transpile it because Mapbox workers can break.
- Temporary smoke/probe routes were deleted before commit; final web build has no `mapbox` chunk output.
- Bundle probe showed Mapbox GL dynamic chunk at 1,745,273 raw bytes / 469,436 gzip bytes when imported from a route client chunk.
