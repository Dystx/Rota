# Rumia map unblock preflight

Date: 2026-07-12
Host: `152.53.145.9` (`lumes-1`)
Mode: bounded, reversible provider preflight; no public routing performed

## Host and isolation evidence

- Debian 13, x86_64
- Memory: 7.8 GiB total, 6.7 GiB available at inspection time
- Swap: 2.0 GiB, unused at inspection time
- Root filesystem: 251 GiB total, 232 GiB available
- PostgreSQL: loopback-only `127.0.0.1:5432`
- Lumes: `0.0.0.0:3001` (unchanged)
- Rumia: `127.0.0.1:3002` through `rumia-web.service` (unchanged)
- Caddy: active; current public include contains only the existing Lumes site
- Rumia map assets: loopback-only `current` symlink to an immutable dated
  archive; PMTiles runs as the unprivileged `rumia` service account
- PMTiles CLI `1.31.0` installed at `/opt/rumia-map/tools/pmtiles`; SHA-256
  `beb6478dc2b194ea62e5691ac8d026b98855662f065997ab7b6af992af517d7b`
- No Docker/Podman runtime installed
- Caddy has the standard `file_server` handler; no PMTiles proxy plugin installed

## Current decision

The host can support a bounded Portugal PMTiles trial. The 469224974-byte
Portugal archive is served by an isolated loopback Caddy listener at
`127.0.0.1:3010`; a `HEAD` request returns `200` with `Accept-Ranges: bytes`
and a `bytes=0-63` request returns `206` with the correct `Content-Range`.
TileJSON returns a single-slash ZXY template, preserves OSM attribution, and
advertises the expected vector layers, including `buildings`. Non-empty ZXY
probes return `200` with `application/x-protobuf`; empty tiles return `204` as
expected. Both map listeners remain loopback-only.
A generated Protomaps light style returns `200`, references local glyph and
sprite assets, has 71 source-layers that all exist in the Portugal TileJSON,
and includes a `buildings` source-layer for the inert extrusion contract.
The activity-map and trip-map hosts now expose bounded telemetry hooks for
intent, camera focus, 3D opt-in, tile/style failures, fallback reasons, and
WebGL/device policy failures; the analytics projection excludes raw provider
errors, coordinates, URLs, and request bodies.
The feature-enabled public browser canary also passed without the auth fixture
or database write path: desktop activity-map rendering reported 3D enabled,
the same page at a 390px viewport reported the conservative 3D fallback, both
states retained attribution and the complete list-equivalent surface, and no
browser console errors were recorded.
The archive SHA-256 is
`8368ff2029904f0228523872e2eab674c0f5730e8623001c38af756583ef06ee` and its
source OSM replication time is `2026-07-12T04:00:00Z`.

The bounded Valhalla canary also completed without exposing a public listener.
Geofabrik Portugal extract `portugal-260711.osm.pbf` was stored under the
Rumia map archive (399 MiB; SHA-256
`fc70a6cc7af01f0a8abcf8d2073ade3f571997648961e6c5aae7153234e2c4b3`). The
Valhalla 3.8.2 graph build used two threads, completed in about 145 seconds,
produced 275 graph files / 540 MiB, and peaked at approximately 645 MiB RSS
on a 7.8 GiB host. A loopback-only contract adapter on `127.0.0.1:3012`
returned validated WGS84 LineStrings for walk, drive, and cycle. Transit is
intentionally rejected with the stable `transit_unavailable` error until an
approved Portugal GTFS feed is available; no raw provider error is returned.
The adapter runs as the unprivileged `rumia` service account, does not persist
request coordinates, and does not expose a public Caddy route.
Map assets are selected through `/opt/rumia-map/current`, an atomic symlink to
an immutable dated archive. The Rumia-only release helper was canaried by
activating a same-bytes rollback-test archive, confirming the loopback tile
endpoint and service health, then rolling back to `20260712`; Lumes and the
public Caddy site were not reloaded or changed.

This does not prove that the host can safely run a Valhalla Portugal graph
alongside the application. Valhalla must therefore remain a separate capacity
and routing canary before any route geometry is enabled.

No public provider was enabled and no Rumia release was changed. Host changes
are confined to the Rumia-owned PMTiles/style assets, the loopback-only Caddy
preflight fragment, and the loopback-only Valhalla contract adapter; Lumes
remains untouched.

## Acceptance work still required

1. Select and record the exact Protomaps build and OSM data date. **Done for
   the current preflight snapshot.**
2. Download/extract the Portugal archive and record checksums. **Done for the
   current preflight snapshot.**
3. Verify byte ranges, content type, cache headers, and CORS on an isolated
   loopback endpoint. **Byte range, tile content type, and CORS checks passed;
   cache policy remains a production acceptance item.**
4. Serve and structurally validate a self-hosted style with local glyphs,
   sprites, source-layer coverage, and attribution. **Done for the current
   preflight snapshot; production provider approval remains open.**
5. Decide whether the archive is served through a same-origin Rumia route or a
   separately approved map hostname before browser enablement.
6. Run a Valhalla Portugal extract in a bounded test environment and record
   memory/CPU/storage before considering a systemd service. **Done for walk,
   drive, and cycle; the loopback adapter is active. Transit remains explicitly
   unavailable pending an approved GTFS feed.**
7. Complete owner/legal approval for ODbL attribution, produced-work duties,
   route geometry, privacy, refresh, quota, and rollback.

The loopback release/rollback procedure in `ops/vps/rumia-map-release.sh` is
validated for archive selection and service recovery. Provider quota,
bandwidth budget, same-origin/public hostname selection, and owner/legal sign-
off remain launch decisions.

## Source policy

The provider decision is based on official documentation only. Protomaps
documents PMTiles as an HTTP Range-readable, ODbL Produced Work with required
OpenStreetMap attribution; MapLibre documents terrain and `fill-extrusion`
separately; Valhalla documents MIT software licensing but keeps OSM-derived
data obligations; and OSM's public tile service is explicitly best-effort and
not a commercial production backend.
