# Geographic route contract

Rumia has two different spatial representations and they must not be merged:

1. `@repo/routing`'s `RouteStopPoint` uses percentage `x`/`y` positions for a
   deterministic schematic preview and validation UI.
2. `@repo/types`'s `GeographicRoute` uses WGS84 `[longitude, latitude]`
   coordinates and only validated route geometry for a live map.

The second contract is defined in `packages/types/src/geographic-route.ts`.
It is intentionally strict so passing schematic coordinates into MapLibre
cannot silently produce a false geographic route.

## Contract rules

- Coordinates are `[lng, lat]`, not `[lat, lng]`.
- Longitudes are `-180..180`; latitudes are `-90..90`.
- A segment with `source: "provider"` or `"editorial"` must contain a
  validated GeoJSON `LineString` with at least two coordinates.
- A segment with `source: "none"` must have `geometry: null`; the UI shows a
  list/proximity explanation instead of drawing a connector.
- `checkedAt` and `attribution` are required for sourced geometry.
- Schematic `x`/`y` points never satisfy this contract and are never converted
  by guessing.

The existing trip adapter remains the boundary for DB/itinerary rows. When a
real route provider is approved, its response must be normalized into
`GeographicRoute` before it reaches the MapLibre route layer.
