# Rumia map provider and licensing record

**Status:** renderer selected; a self-hosted provider path is recommended, but
production basemap and route providers are not yet owner-approved
**Decision boundary:** no public route geometry, terrain, or Phase 2/3 3D
feature is enabled until this record has an owner-approved provider and quota.

**Research verification:** 2026-07-12, using the current primary provider
documentation linked below. The OpenStreetMap tile policy describes the public
tile service as best-effort with no SLA and warns that commercial access may be
withdrawn; Protomaps documents its basemap archive as an ODbL Produced Work
with OpenStreetMap attribution and recommends copying it to Rumia-owned
storage; Valhalla documents the engine as MIT-licensed while its OSM-derived
data remains subject to the applicable ODbL/source obligations. These facts
support the VPS-native candidate but do not constitute owner/legal approval.

## Current renderer

- **MapLibre GL JS** is the renderer used by `@repo/spatial-engine`.
- The dependency is distributed under its BSD-3-Clause license; retain the
  package license/third-party notices in releases.
- MapLibre does not provide map data or a commercial tile entitlement. A
  style, tile, glyph, sprite, terrain, and route provider must be evaluated
  separately.

## Current style candidate

The code currently points at CARTO's public Dark Matter and Positron styles and
includes the required OpenStreetMap/CARTO attribution in the MapLibre
attribution control. CARTO's documentation says its basemaps are OSM-based and
compatible with MapLibre, but also says commercial use requires an Enterprise
license (or a grant for qualifying non-commercial use).

Therefore CARTO is a **candidate only**, not an approved production license.
Do not treat a public URL resolving in development as permission to serve the
commercial Rumia product.

## Approved fallback position

Until a basemap license is signed, keep the activity map behind its feature
flag and use the semantic list/schematic fallback. The provider decision may
choose either:

1. a written commercial CARTO entitlement with quota/support terms; or
2. a self-hosted OSM-derived vector-tile stack whose data/style/hosting terms
   are recorded and whose tile updates are operationally owned by Rumia.

Do not use `tile.openstreetmap.org` as a commercial production tile backend.
OSM's own policy requires visible attribution and limits the community-funded
tile service; it is not a general commercial SLA.

## Recommended VPS-native default

For Rumia's existing VPS architecture, the preferred production candidate is:

1. **Basemap:** a Portugal-focused Protomaps PMTiles archive derived from
   OpenStreetMap data, copied into Rumia-owned storage and served through the
   VPS with HTTP Range requests. Protomaps documents PMTiles as a self-hosting
   path with no third-party API key and identifies the distributed basemap as
   an ODbL Produced Work with OpenStreetMap attribution required.
2. **Routing:** a Portugal extract served by a self-hosted Valhalla instance,
   initially behind an internal route API. Valhalla is MIT-licensed software;
   the OSM-derived graph and returned geometry still require the applicable
   ODbL/source attribution and a data-refresh record.
3. **Style and glyphs:** Rumia-owned MapLibre style JSON plus locally hosted
   glyph/sprite assets whose licenses and source revisions are recorded with
   each release.

The current VPS preflight now has a loopback-only Python adapter around the
Valhalla graph at `127.0.0.1:3012`. It accepts only a bounded stop contract and
returns Rumia's validated `GeographicRoute` shape; it is not connected to the
public Caddy site or the browser. Transit remains a deliberate capability gap
until a Portugal GTFS source is approved.

### 2026-07-12 preflight evidence

The first two self-hosting checks now have a reversible VPS proof. A Portugal
cutout was extracted from the official Protomaps daily build
`https://build.protomaps.com/20260712.pmtiles` with
`--bbox=-31.3,30.0,-6.0,42.3 --maxzoom=14`.

- OSM replication time in source metadata: `2026-07-12T04:00:00Z`
- Archive: `/opt/rumia-map/archives/20260712/portugal.pmtiles`
- Size: `469224974` bytes
- SHA-256: `8368ff2029904f0228523872e2eab674c0f5730e8623001c38af756583ef06ee`
- Isolated Caddy preflight listener: `127.0.0.1:3010`
- `HEAD`: `200`, `Accept-Ranges: bytes`, `Content-Length: 469224974`
- `Range: bytes=0-63`: `206`, correct `Content-Range`, CORS, and attribution
  headers
- TileJSON: `200`, a single-slash ZXY template, OSM attribution, and vector
  layers including `buildings`.
- ZXY probes: non-empty tiles returned `200` with
  `Content-Type: application/x-protobuf`; empty tiles returned `204` as
  expected. The service remains loopback-only on `127.0.0.1:3010`/`:3011`.
- Preflight style: `/portugal-style.json`, generated from
  `@protomaps/basemaps@5.7.2` (style SHA-256
  `7854a42ee2462a04f13b4735d8654bfeea1f1583f94502620e75ff1f765ed4a9`),
  references the local TileJSON, local Noto Sans glyph ranges, and local light
  sprites. All 71 style source-layers are present in the 9-layer TileJSON,
  including `buildings`; the style and representative glyph/sprite requests
  returned `200` with visible OSM/Protomaps attribution.
- Asset provenance: `protomaps/basemaps-assets` font commit
  `83bc11ea49e5c024df51979d5953ee841fd06584`; OFL text SHA-256
  `7713cfc8e3c36d5ec4aa3d6cffe7500a1b3310f8a86d914b8ea09c2a9dee7c2d`;
  light sprite JSON/PNG SHA-256 values are
  `bfac76cf7ed5c2aa2992695904056a1c6b07785b7fd20e6c640cb44fd6244a2e` and
  `b6a34640917bdc57d0bd080836db33376371a3312ebe7b849045268015de3481`.

This is a provider acceptance candidate, not production approval. The
loopback Caddy fragment is stored at `ops/vps/rumia-map-preflight.caddy` and
does not change the public Lumes site.

This removes a per-tile commercial API dependency, but it does not remove
operations or legal responsibility. The provider gate remains open until the
owner accepts the data license, attribution, update schedule, VPS storage and
bandwidth budget, route privacy policy, and rollback plan.

OpenFreeMap is useful for a disposable prototype, but its public terms provide
the service as-is without an availability warranty. It should not become the
only production dependency for a paid Rumia route surface.

### Self-hosted acceptance checks

- [x] Build and checksum a Portugal PMTiles snapshot; record its OSM data date.
- [x] Confirm Caddy serves byte ranges and returns the expected content type.
- [x] Serve one MapLibre style with visible OSM/Protomaps attribution at every
  zoom and in the compact map fallback. **Preflight only; production approval
  remains open.**
- [x] Run Valhalla with a Portugal extract and verify walk/drive/cycle request
  modes, timeout behavior, loopback isolation, and no raw provider error leaks.
  Transit requests return a controlled `transit_unavailable` response until an
  approved GTFS feed is provisioned.
- [ ] Approve and provision a Portugal transit/GTFS source before claiming
  transit routing support.
- [x] Record current storage, memory, CPU ceilings, and an activate/rollback
  canary on the VPS. The loopback evidence is recorded in the unblock
  preflight.
- [ ] Approve a production bandwidth/quota budget and refresh schedule before
  enabling the feature flag.
- [ ] Complete owner/legal approval for ODbL attribution and any produced-work
  obligations.

## Required record before enablement

- [ ] basemap provider and exact style URL/version;
- [ ] tile, glyph, sprite, and data license terms;
- [ ] visible attribution copy and link on every map surface;
- [ ] provider quota, rate limits, cache rules, and outage fallback;
- [ ] route provider, travel modes, geometry license, quota, and attribution;
- [ ] terrain DEM provider/license, if terrain is ever enabled;
- [ ] privacy review for any coordinate or route request sent to a provider;
- [ ] owner-approved feature-flag and rollback plan.

## Current implementation guardrails

- `GlobeWorkspace` terrain is opt-in and disabled by default.
- `WorkspaceCanvas` is flat Mercator and terrain-free by default.
- The route layer draws only geometry supplied by the application; it does not
  invent road or walking lines from schematic points.
- Missing provider geometry yields a list/proximity explanation and keeps the
  map fallback available.
- Attribution must remain visible; it cannot be hidden under a sheet or removed
  from a shared/saved route preview.
- The activity workspace refuses to expose its optional map when
  `ENABLE_ACTIVITY_MAP=true` but `RUMIA_MAP_STYLE_URL` is absent. This prevents
  an accidental flag flip from selecting the unapproved CARTO development
  candidate; the provider URL and paired attribution must be supplied together
  by an approved release configuration.

## Primary references

- CARTO basemap FAQ: <https://docs.carto.com/faqs/carto-basemaps>
- OSM attribution guide: <https://www.openstreetmap.org/copyright/attribution-guide/>
- OSM tile usage policy: <https://operations.osmfoundation.org/policies/tiles/>
- MapLibre GL JS license: <https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt>
- Protomaps self-hosting and licensing: <https://protomaps.com/about>
- Protomaps basemap downloads and ODbL attribution: <https://docs.protomaps.com/basemaps/downloads>
- Valhalla license and OSM data notes: <https://github.com/valhalla/valhalla>
- OpenFreeMap terms: <https://openfreemap.org/tos/>
