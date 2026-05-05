# Cinematic Redesign B — Issues

## [2026-05-05] Known Risks (pre-execution)
- mapbox-gl worker bundling: DO NOT add to transpilePackages
- CSP: must add connect-src/worker-src/img-src for Mapbox endpoints
- SSR: provider-map.tsx must be "use client" + dynamic import ssr:false
- Multi-stop same city: offset by ~20m using deterministic stop-index hash

## [2026-05-05] Task: T00
- Initial `pnpm install` failed under CI frozen lockfile; reran with `CI=false pnpm install --no-frozen-lockfile` to update `pnpm-lock.yaml`.
- Existing Next dev server on port 3105 blocked starting a new dev server; used existing server for smoke screenshot.
- Smoke screenshot shows `missing-token` because no public Mapbox token was available in the dev env; import smoke still confirmed SDK loads.
- JSON LSP diagnostics could not run because configured `biome` LSP is not installed; TS vitest config diagnostics were clean.
