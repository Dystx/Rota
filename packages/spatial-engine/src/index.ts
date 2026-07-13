/**
 * @repo/spatial-engine — provider-agnostic map and globe foundation for Rumia.
 *
 * Phase 1 ships:
 *  - Core abstractions: SpatialEngine, SpatialLayer, CameraController,
 *    TelemetryService, MapStyleProvider (see ./core/types)
 *  - MapLibre GL JS adapter with globe projection + soft fog
 *  - CartoBasemapStyleProvider as a development/provider-candidate adapter
 *  - ProtomapsBasemapStyleProvider as an explicitly injected self-hosted candidate
 *  - InMemoryTelemetryService for deterministic fixtures
 *  - Two reference layers: AmbientPulseLayer, SymbolBadgesLayer
 *  - GlobeWorkspace React component for the Discovery Hub
 *
 * Phase 1e (complete): the legacy `@repo/maps` package
 * (`CinematicMap`, `ProviderMap`) was absorbed into the spatial
 * engine via the `WorkspaceCanvas` 2D variant and the
 * `WorkspaceTripCanvas` wrapper in `apps/web`.
 */

import { AMBIENT_PULSE_LAYER_ID } from "./adapters/maplibre/layers/ambient-pulse";
import { SYMBOL_BADGES_LAYER_ID } from "./adapters/maplibre/layers/symbol-badges";
import { ROUTE_STOPS_LAYER_ID } from "./adapters/maplibre/layers/route-layer";
import { ACTIVITY_POINTS_LAYER_ID, ACTIVITY_POINTS_LABEL_LAYER_ID } from "./adapters/maplibre/layers/activity-points";

export * from "./core/types";
export * from "./core/map-style-provider";
export * from "./core/camera-controller";
export * from "./core/camera-presets";
export * from "./core/map-telemetry";
export * from "./core/three-d-capability";
export * from "./core/telemetry-service";
export { setupMapLibreErrorSuppression } from "./core/maplibre-error-suppression";

export {
  createDiscoveryEngine,
  createWorkspaceEngine,
  MapLibreSpatialEngine,
  type CameraTarget,
  type SpatialEngineOptions,
  type SpatialPalette,
  type WorkspaceEngineFeatures
} from "./adapters/maplibre/spatial-engine";
export { mountMapLibreInstance, type MapLibreInstanceOptions } from "./adapters/maplibre/map-instance";
export { AmbientPulseLayer, AMBIENT_PULSE_LAYER_ID, type AmbientPulseLayerOptions } from "./adapters/maplibre/layers/ambient-pulse";
export { SymbolBadgesLayer, SYMBOL_BADGES_LAYER_ID, type SymbolBadgesLayerOptions } from "./adapters/maplibre/layers/symbol-badges";
export { RouteLayer, ROUTE_LINE_LAYER_ID, ROUTE_STOPS_LAYER_ID, type RouteLayerOptions } from "./adapters/maplibre/layers/route-layer";
export {
  ActivityPointsLayer,
  ACTIVITY_POINTS_LAYER_ID,
  ACTIVITY_POINTS_LABEL_LAYER_ID,
  ACTIVITY_POINTS_SOURCE_ID,
  type ActivityPointsLayerOptions
} from "./adapters/maplibre/layers/activity-points";
export {
  BuildingExtrusionLayer,
  BUILDING_EXTRUSION_LAYER_ID,
  type BuildingExtrusionLayerOptions
} from "./adapters/maplibre/layers/building-extrusions";
export {
  RadialGradientAtmosphereLayer,
  RADIAL_GRADIENT_ATMOSPHERE_LAYER_ID,
  type RadialGradientAtmosphereOptions
} from "./adapters/maplibre/layers/radial-gradient-atmosphere";
export {
  StarfieldLayer,
  STARFIELD_LAYER_ID,
  type StarfieldOptions
} from "./adapters/maplibre/layers/starfield";

/**
 * Layer IDs that participate in the click → `onStopClick` forwarding.
 * Workspace / globe consumers query this set to filter `queryRenderedFeatures`.
 */
export const CLICKABLE_LAYER_IDS: readonly string[] = [
  AMBIENT_PULSE_LAYER_ID,
  SYMBOL_BADGES_LAYER_ID,
  ROUTE_STOPS_LAYER_ID,
  ACTIVITY_POINTS_LAYER_ID,
  ACTIVITY_POINTS_LABEL_LAYER_ID
] as const;

export { GlobeWorkspace, DEFAULT_ATMOSPHERE, type GlobeWorkspaceProps } from "./components/globe-workspace";
export {
  WorkspaceCanvas,
  type WorkspaceCanvasHandle,
  type WorkspaceCanvasProps
} from "./components/workspace-canvas";
export {
  fixtureTravelerCollection,
  fixtureSpecialistCollection,
  fixtureAllCollections
} from "./fixtures/travelers";
export { fixtureRouteCollection, fixtureRouteSummary } from "./fixtures/routes";
export {
  DESTINATION_PRESETS,
  getDestinationPreset,
  type DestinationPreset
} from "./fixtures/destinations";

export { LayerRegistry } from "./core/layer-registry";
export {
  CameraChoreography,
  singleBeat,
  type CameraChoreographyBeat
} from "./core/camera-choreography";
