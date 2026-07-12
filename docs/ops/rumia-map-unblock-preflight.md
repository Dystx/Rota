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
The archive SHA-256 is
`8368ff2029904f0228523872e2eab674c0f5730e8623001c38af756583ef06ee` and its
source OSM replication time is `2026-07-12T04:00:00Z`.

This does not prove that the host can safely run a Valhalla Portugal graph
alongside the application. Valhalla must therefore remain a separate capacity
and routing canary before any route geometry is enabled.

No public provider was enabled and no Rumia release was changed. The only host
changes are the Rumia-owned PMTiles tool/archive and the loopback-only Caddy
preflight fragment; Lumes remains untouched.

## Acceptance work still required

1. Select and record the exact Protomaps build and OSM data date. **Done for
   the current preflight snapshot.**
2. Download/extract the Portugal archive and record checksums. **Done for the
   current preflight snapshot.**
3. Verify byte ranges, content type, cache headers, and CORS on an isolated
   loopback endpoint. **Byte range, tile content type, and CORS checks passed;
   cache policy remains a production acceptance item.**
4. Decide whether the archive is served through a same-origin Rumia route or a
   separately approved map hostname before browser enablement.
5. Run a Valhalla Portugal extract in a bounded test environment and record
   memory/CPU/storage before considering a systemd service.
6. Complete owner/legal approval for ODbL attribution, produced-work duties,
   route geometry, privacy, refresh, quota, and rollback.

## Source policy

The provider decision is based on official documentation only. Protomaps
documents PMTiles as an HTTP Range-readable, ODbL Produced Work with required
OpenStreetMap attribution; MapLibre documents terrain and `fill-extrusion`
separately; Valhalla documents MIT software licensing but keeps OSM-derived
data obligations; and OSM's public tile service is explicitly best-effort and
not a commercial production backend.
