# Rumia map launch decision record

Date: 2026-07-12  
Status: **decision packet prepared; no production approval granted**

This record converts the remaining Phase 2/3 map gates into explicit owner
decisions. It is not a legal opinion and must not be interpreted as approval.
The feature flags remain disabled until the decisions below are recorded by the
owner or an authorized legal/operations reviewer.

## Technical candidate

The current reversible preflight candidate is:

- Self-hosted Protomaps PMTiles style and Portugal archive on the Rumia VPS.
- Local glyph and sprite assets with visible OpenStreetMap/Protomaps attribution.
- Loopback-only Valhalla 3.8.2 route adapter for walk, drive, and cycle.
- Rumia's validated `GeographicRoute` contract at the application boundary.
- Atomic archive activation and rollback through `rumia-map-release`.

Evidence is recorded in:

- `docs/ops/rumia-map-unblock-preflight.md`
- `docs/ops/map-provider-licensing.md`
- `docs/ops/geographic-route-contract.md`
- `ops/vps/rumia-map-release.sh`

## Required decisions

| Decision | Current candidate | Required owner decision | Status |
| --- | --- | --- | --- |
| Basemap/data | Self-hosted Protomaps + OSM-derived Portugal archive | Approve exact archive/style versions and ODbL/Produced Work duties | **Open** |
| Attribution | OSM and Protomaps attribution in every map surface | Approve copy, placement, and link behavior | **Open** |
| Route provider | Self-hosted Valhalla for walk/drive/cycle | Approve route geometry, attribution, refresh, and provider obligations | **Open** |
| Transit | No GTFS feed provisioned | Approve a Portugal GTFS source, or explicitly keep transit unavailable | **Open** |
| Privacy | Bounded server-side route request; no coordinate payload persistence | Approve retention, access, and privacy language | **Open** |
| Capacity | 7.8 GiB host; bounded service ceilings and rollback tested | Approve monthly bandwidth, tile cache, CPU/memory ceilings, and refresh cadence | **Open** |
| Public origin | No `rumia.pt` decision yet; current preflight is loopback-only | Select same-origin Rumia route or separately approved map hostname | **Open** |
| Feature enablement | All map/story/3D flags default false | Approve staged canary, owner, rollback trigger, and release window | **Open** |

## Non-negotiable release conditions

Before any hosted environment enables map, storytelling, route geometry, or 3D:

1. The owner/legal reviewer records the provider, attribution, data, route,
   privacy, and Produced Work decisions above.
2. A quota/bandwidth budget and refresh schedule are recorded.
3. A same-origin/public hostname is selected and tested without changing Lumes.
4. Transit is either explicitly disabled in product copy or backed by an
   approved Portugal GTFS source.
5. The staged feature-flag and rollback plan is approved.
6. A fresh browser canary proves list/map parity, reduced-motion behavior,
   mobile fallback, attribution, and zero new console errors on the exact
   release artifact.

## Current safe state

- `ENABLE_ACTIVITY_MAP=false`
- `ENABLE_ACTIVITY_MAP_STORYTELLING=false`
- `ENABLE_ACTIVITY_MAP_3D=false`
- Rumia remains loopback-only on `127.0.0.1:3002`.
- Lumes remains on `0.0.0.0:3001`.
- Map assets and route adapter remain isolated to Rumia-owned VPS paths.
- The public activity workspace also requires the server-only
  `RUMIA_MAP_STYLE_URL` provider configuration when the activity-map flag is
  true; without it, the workspace remains list-only rather than selecting the
  unapproved development candidate.

No approval is implied by the existence of this document.
