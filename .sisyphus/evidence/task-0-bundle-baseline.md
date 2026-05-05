# T00 Mapbox bundle baseline

Date: 2026-05-05

## Build commands

- `pnpm -F web build` with a temporary `/mapbox-smoke` route importing `mapbox-gl` dynamically from a client component.
- `find apps/web/.next/static/chunks -name "*.js" | xargs grep -l "mapbox" 2>/dev/null`
- `pnpm -F web build` again after deleting the temporary route.

## Probe-route result

Temporary route build succeeded and produced Mapbox in route/dynamic chunks only:

```txt
apps/web/.next/static/chunks/07ur7kptmibsy.js
apps/web/.next/static/chunks/0f1.1vz3knhsc.js
```

Observed related chunks:

| Chunk | Role | Raw bytes | Gzip bytes |
| --- | --- | ---: | ---: |
| `apps/web/.next/static/chunks/07ur7kptmibsy.js` | route client probe that dynamically imports Mapbox | 459 | 347 |
| `apps/web/.next/static/chunks/0f1.1vz3knhsc.js` | Mapbox GL JS dynamic chunk including worker bundle | 1,745,273 | 469,436 |
| `apps/web/.next/static/chunks/0gkrozca-jc87.js` | existing `@repo/maps` provider-token stub chunk, not `mapbox-gl` | 27,532 | 7,857 |

The Mapbox GL chunk was loaded through the temporary route client probe and was not part of `_app`/framework/shared initial chunks.

## Final build after deleting smoke/probe routes

Final `pnpm -F web build` succeeded with no temporary smoke route in the route table.

Final chunk grep after deleting smoke/probe files:

```txt
# no output
```

This confirms T00 leaves no production route importing `mapbox-gl`; future production map work must continue to use route/client-level dynamic import to avoid initial JS inclusion.
