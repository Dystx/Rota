/**
 * @repo/spatial-engine — provider-agnostic map and globe foundation for Rumia.
 *
 * Phase 1 ships:
 *  - Core abstractions: SpatialEngine, SpatialLayer, CameraController,
 *    TelemetryService, MapStyleProvider (see ./core/types)
 *  - MapLibre GL JS adapter with globe projection + soft fog
 *  - CartoBasemapStyleProvider for open-source vector tiles
 *  - InMemoryTelemetryService for deterministic fixtures
 *  - Two reference layers: AmbientPulseLayer, SymbolBadgesLayer
 *  - GlobeWorkspace React component for the Discovery Hub
 *
 * Phase 2 (separate commit shape, requires sign-off) will:
 *  - Migrate @repo/maps consumers (CinematicMap, ProviderMap) into the
 *    SpatialEngine via a 2D WorkspaceCanvas variant
 *  - Replace InMemoryTelemetryService with a Supabase Realtime adapter
 *  - Promote the LayerRegistry + GeoJSON batched updates + camera
 *    choreography hooks
 */

export * from "./core/types";
export * from "./core/map-style-provider";
export * from "./core/camera-controller";
export * from "./core/telemetry-service";

export {
  createDiscoveryEngine,
  MapLibreSpatialEngine,
  type CameraTarget,
  type SpatialEngineOptions,
  type SpatialPalette
} from "./adapters/maplibre/spatial-engine";
export { mountMapLibreInstance, type MapLibreInstanceOptions } from "./adapters/maplibre/map-instance";
export { AmbientPulseLayer, type AmbientPulseLayerOptions } from "./adapters/maplibre/layers/ambient-pulse";
export { SymbolBadgesLayer, type SymbolBadgesLayerOptions } from "./adapters/maplibre/layers/symbol-badges";
export { RouteLayer, type RouteLayerOptions } from "./adapters/maplibre/layers/route-layer";

export { GlobeWorkspace, type GlobeWorkspaceProps } from "./components/globe-workspace";
export { WorkspaceCanvas, type WorkspaceCanvasProps } from "./components/workspace-canvas";
export {
  fixtureTravelerCollection,
  fixtureSpecialistCollection,
  fixtureAllCollections
} from "./fixtures/travelers";
export { fixtureRouteCollection, fixtureRouteSummary } from "./fixtures/routes";

export { LayerRegistry } from "./core/layer-registry";
export {
  CameraChoreography,
  singleBeat,
  type CameraChoreographyBeat
} from "./core/camera-choreography";