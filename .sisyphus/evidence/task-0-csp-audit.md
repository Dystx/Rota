# T00 CSP audit

Date: 2026-05-05

## Files checked

- `apps/web/next.config.ts`
- `apps/web/middleware.ts`

## Findings

- No `Content-Security-Policy` header is currently configured in `next.config.ts` `headers()`.
- `apps/web/middleware.ts` handles Supabase session refresh and auth routing only; it does not set CSP headers.
- `apps/web/next.config.ts` has `transpilePackages: ["@repo/ai", "@repo/config", "@repo/db", "@repo/routing", "@repo/ui", "@repo/types"]`.
- `mapbox-gl` is **not** in `transpilePackages`; this preserves Mapbox GL worker behavior.

## Mapbox sources to allow when CSP is introduced

- `api.mapbox.com`
- `events.mapbox.com`
- `*.tiles.mapbox.com`
- `a.tiles.mapbox.com`
- `b.tiles.mapbox.com`
- `c.tiles.mapbox.com`
- `d.tiles.mapbox.com`
- `*.mapbox.com`

## Directives likely requiring updates

- `connect-src`: Mapbox APIs, telemetry, style/tile requests.
- `worker-src`: Mapbox GL web workers, typically `blob:` plus same-origin policy as needed.
- `img-src`: Mapbox raster/static assets and tile imagery.

No CSP code was changed in T00.
