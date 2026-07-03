/**
 * Provider-agnostic viewport snapshot the live renderer pushes to the
 * client (e.g. on every `moveend`). Layered on top of `CameraTarget`
 * which is what callers send TO the engine — this is what the engine
 * reports BACK. The two shapes intentionally overlap so a ref like
 * `state.viewport.center` lines up with `initialFocus.center`.
 */
export interface ViewportState {
  /** [longitude, latitude] per MapLibre convention. */
  center: readonly [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}
