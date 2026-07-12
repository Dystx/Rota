# Rumia map Phase 2/3 unblock plan

Date: 2026-07-12
Branch: `codex/rumia-phase0`
Status: implementation and provider preflight in progress; production
enablement remains gated

## Goal

Prepare Rumia for the optional Phase 2 itinerary camera/storytelling surface
and the later Phase 3 3D destination surface without changing the core
activity-list journey, enabling unapproved provider traffic, or disturbing the
co-hosted Lumes deployment.

## Confirmed constraints

- Rumia remains activity-first and Portugal-wide; maps are progressive
  enhancement only.
- The current activity map flag is opt-in and defaults off.
- The VPS keeps Rumia on `127.0.0.1:3002` and Lumes on `0.0.0.0:3001`.
- The current trip source contains stop points but no validated route geometry.
  A straight connector is forbidden.
- Phase 2 requires an explicit user action, typed camera presets, a practical
  list/2D equivalent, and server-supplied route geometry with attribution.
- Phase 3 requires separate 3D and terrain flags, measured device/performance
  evidence, and approved basemap/DEM/building-data licenses.

## Workstreams

## Progress recorded 2026-07-12

- [x] Installed the pinned PMTiles CLI and extracted/checksummed a Portugal
  archive on the isolated Rumia VPS path.
- [x] Verified loopback-only Caddy byte ranges, CORS, TileJSON, attribution,
  vector content type, and Lumes/Rumia listener isolation.
- [x] Generated and served a Protomaps style with local glyphs/sprites,
  validated source-layer coverage, and retained visible attribution; this is a
  preflight candidate, not production approval.
- [x] Built a bounded Portugal Valhalla graph and activated a loopback-only
  route-contract adapter with validated WGS84 geometry for walk, drive, and
  cycle. Transit remains explicitly unavailable pending an approved GTFS feed.
- [x] Added opt-in Phase 2 camera-preset/story controls with unit coverage.
- [x] Added the validated geographic-route adapter; point-only fallback remains
  truthful until server-supplied geometry is present.
- [x] Added an inert, provider-neutral Phase 3 building-extrusion layer and
  separate 3D flag.
- [x] Passed focused tests, repository typecheck, lint, build, and diff checks
  with all new flags disabled.
- [x] Passed the focused desktop trip-map browser regression (2/2) with all
  new flags disabled; the protected-route fixture now explicitly loads the
  traveler storage state.
- [x] Run a bounded Valhalla Portugal canary and record travel-mode, capacity,
  privacy, loopback, and atomic update/rollback evidence. Transit-feed and
  owner/legal approval remain open.
- [x] Serve a self-hosted Protomaps style candidate with local/approved glyphs
  and sprites plus visible attribution. Production provider/legal approval
  remains open.
- [x] Add bounded map telemetry hooks for map intent, camera focus, 3D opt-in,
  tile failure, fallback, and WebGL/device errors without sending raw map or
  provider payloads.
- [x] Wire the separate 3D flag through the Portugal activity-map surface;
  device/reduced-motion policy still controls the final enhancement.
- [x] Add focused feature-enabled unit coverage for story navigation, 3D
  policy reasons, telemetry safety, map fallback, attribution, and list parity.
- [x] Run a feature-enabled public browser canary without database fixture
  writes: desktop reported `data-3d-capability="enabled"`, a mobile-width
  reload reported `fallback`, attribution and the complete semantic list stayed
  visible, and the browser console reported zero errors.
- [x] Add an atomic, loopback-only map release/rollback helper and verify an
  activate → route smoke → rollback cycle on the VPS without touching Lumes or
  a public Caddy site.
- [ ] Complete owner/legal approval and only then enable feature flags in a
  controlled environment.

### A. Provider and VPS acceptance (reversible, opt-in)

1. Install the `pmtiles` CLI under a Rumia-owned tools directory, not a global
   Node or Docker dependency.
2. Extract a Portugal PMTiles archive from an official Protomaps daily build,
   record the OSM data date, source URL, version, file size, and BLAKE3/SHA256
   digest.
3. Serve the archive from a Rumia-only loopback endpoint with HTTP Range,
   `Content-Type`, cache, and CORS behavior verified. Do not alter the Lumes
   listener or public Caddy site.
4. Evaluate Valhalla separately. Do not install or expose it until the VPS
   memory budget, Portugal extract, travel-mode canaries, route privacy, and
   update/rollback procedure are recorded.
5. Keep the production flag disabled until the owner/legal approval checklist
   in `docs/ops/map-provider-licensing.md` is signed off.

### B. Phase 2 contract and UI preparation

1. Add separate feature switches for camera storytelling and 3D enhancement;
   both default to false and never imply provider approval.
2. Add a pure, tested `CameraPreset` projection from saved-day stops. Presets
   are data (`stopId`, camera target, label, day-part) and do not mutate list
   order or saved-day state.
3. Add an explicit “Explore your plan” controller with previous/next,
   pause/stop, reduced-motion jumps, live status, and immediate exit to the
   list/2D map. No autoplay, scrolljacking, or AI narration.
4. Extend the spatial route adapter to consume the existing validated
   `GeographicRoute` contract. Render segments only when `source`, geometry,
   checked timestamp, and attribution are present; otherwise retain truthful
   point-only fallback copy.
5. Keep route generation server-side and owner-scoped. The browser receives a
   validated projection only; it never contacts PostgreSQL or Valhalla directly.

### C. Phase 3 3D preparation (no production enablement yet)

1. Add an explicit 3D capability switch and a device/reduced-motion guard.
2. Add a provider-neutral building-extrusion layer contract that is inert when
   the style has no approved building source-layer.
3. Keep terrain and extrusion opt-in, capped to dense urban views, and paired
   with a top-down/list fallback.
4. Add telemetry and browser gates for map intent, camera focus, 3D opt-in,
   tile failure, fallback, and WebGL/device errors before considering a launch.

## Files likely to change

- `packages/config/src/features.ts` and feature tests
- `packages/types/src/geographic-route.ts` and exports/tests
- `apps/web/app/(app)/trip/[tripId]/_lib/*` route/camera adapters
- `apps/web/app/(app)/trip/[tripId]/map/*` explicit story controls
- `packages/spatial-engine/src/core/*` camera and route contracts
- `packages/spatial-engine/src/adapters/maplibre/layers/*`
- `apps/web/playwright/tests/*` focused map/story/performance/a11y coverage
- `ops/vps/*` only for isolated map-provider assets
- `docs/ops/map-provider-licensing.md` and the preflight record

## Quality gates

- Typecheck, lint, build, focused unit tests, and full browser gates remain
  green with all new flags false.
- Feature-enabled Phase 2 tests cover explicit start/stop, previous/next,
  reduced motion, missing geometry, attribution, and list parity.
- Feature-enabled Phase 3 tests cover 3D opt-in, mobile/list fallback,
  provider absence, WebGL failure, and no homepage/map-free regression.
- VPS checks prove isolation from Lumes, byte-range serving, checksum and
  rollback before any flag is enabled.

## Rollback

- Revert the feature-gate and UI commits; the default path remains list-first.
- Remove only Rumia map units/files and reload Caddy after validating the
  configuration. Do not stop or reload Lumes.
- Switch the map provider/style back to the semantic fallback and set all map
  flags to false.
- Restore the previous `/opt/apps/rumia/current` release with the existing
  deployment wrapper if a hosted smoke check fails.

## External references

- Protomaps basemap downloads and ODbL attribution:
  https://docs.protomaps.com/basemaps/downloads
- Protomaps PMTiles + MapLibre integration:
  https://docs.protomaps.com/pmtiles/maplibre
- Protomaps HTTP Range/Caddy guidance:
  https://docs.protomaps.com/pmtiles/cloud-storage
- MapLibre terrain and extrusion specifications:
  https://maplibre.org/maplibre-style-spec/terrain/
  https://maplibre.org/maplibre-style-spec/layers/
- Valhalla license and OSM data notes:
  https://github.com/valhalla/valhalla
- OSM public tile policy:
  https://operations.osmfoundation.org/policies/tiles/
