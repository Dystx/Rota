import type { CameraController, CameraTarget } from "./types";

/** Minimal renderer-agnostic surface the engine exposes for camera moves. */
export interface CameraExecutor {
  flyTo(options: {
    center?: [number, number];
    zoom?: number;
    pitch?: number;
    bearing?: number;
    duration?: number;
  }): Promise<void>;
  jumpTo(options: {
    center?: [number, number];
    zoom?: number;
    pitch?: number;
    bearing?: number;
  }): void;
  fitBounds(
    bounds: [[number, number], [number, number]],
    options?: { padding?: number; duration?: number }
  ): Promise<void>;
}

export interface CameraControllerOptions {
  reducedMotion?: boolean;
  homeTarget?: CameraTarget;
}

/**
 * Antimeridian is the longitudinal seam at ±180° where the 3D globe wraps.
 * High pitch values (tilted views) at this seam cause sharp edge-cut rendering
 * and frame-rate drops. The lifecycle spec (Phase 6) names this constraint.
 *
 * Threshold: longitude within 1° of the seam. We clamp pitch to 0 (top-down)
 * in that band so the renderer can short-circuit tile frustum culling.
 */
const ANTIMERIDIAN_LON_EPSILON = 1.0;

export function isNearAntimeridian(lng: number): boolean {
  return Math.abs(Math.abs(lng) - 180) < ANTIMERIDIAN_LON_EPSILON;
}

/**
 * Returns a pitch value clamped to 0 when `center` is near the antimeridian;
 * otherwise returns the requested pitch unchanged. Undefined pitch (caller
 * didn't request one) is passed through so the executor's default applies.
 */
export function clampPitchForAntimeridian(
  center: readonly [number, number] | undefined,
  pitch: number | undefined
): number | undefined {
  if (pitch === undefined) return undefined;
  if (center && isNearAntimeridian(center[0])) return 0;
  return pitch;
}

/**
 * Adapter-agnostic CameraController. The renderer-specific code passes a
 * thin `CameraExecutor` that proxies to the underlying map (e.g. MapLibre).
 *
 * Every public method is async to match the underlying renderer's
 * Promise-returning animation primitives.
 */
export class SpatialCameraController implements CameraController {
  private following = false;
  /**
   * Single-flight guard for `focus`. MapLibre's `flyTo` throws
   * "Attempting to run(), but is already running." if a second
   * `flyTo` lands while the previous animation is still
   * settling. The choreography and the projection switch can
   * both trigger `focus` back-to-back (intro choreography lands
   * on `earth` → user clicks "Begin Journey" → focus flies to
   * Portugal). Without this guard the second call lands
   * mid-animation and MapLibre throws.
   *
   * We coalesce: if a `focus` is in flight, the second call's
   * target replaces the first. When the first resolves, we
   * immediately fire the pending target so the user's intent
   * still lands. The "next" target is cleared after firing so
   * a third call doesn't pile up.
   */
  private inflight: Promise<void> | null = null;
  private pendingTarget: CameraTarget | null = null;

  constructor(
    private readonly executor: CameraExecutor,
    private readonly options: CameraControllerOptions = {}
  ) {}

  async focus(target: CameraTarget): Promise<void> {
    if (this.inflight) {
      this.pendingTarget = target;
      return;
    }
    const duration = this.options.reducedMotion ? 0 : (target.duration ?? 1200);
    const animOptions = {
      center: target.center ? ([target.center[0], target.center[1]] as [number, number]) : undefined,
      zoom: target.zoom,
      pitch: clampPitchForAntimeridian(target.center, target.pitch),
      bearing: target.bearing,
      duration
    };

    if (duration === 0) {
      this.executor.jumpTo(animOptions);
      return;
    }
    this.inflight = this.executor.flyTo(animOptions).finally(() => {
      this.inflight = null;
      if (this.pendingTarget) {
        const next = this.pendingTarget;
        this.pendingTarget = null;
        // Fire-and-forget — the caller doesn't await the
        // pending fire, but it will resolve on the next
        // microtask via the same `focus` path.
        void this.focus(next);
      }
    });
    await this.inflight;
  }

  async returnHome(): Promise<void> {
    if (!this.options.homeTarget) return;
    await this.focus(this.options.homeTarget);
  }

  followUser(active: boolean): void {
    this.following = active;
    // Real implementations would subscribe to Geolocation here; phase 1
    // just tracks the intent so future telemetry wiring has a stable hook.
  }

  isFollowing(): boolean {
    return this.following;
  }

  async fitBounds(bounds: [[number, number], [number, number]]): Promise<void> {
    await this.executor.fitBounds(bounds, {
      padding: 80,
      duration: this.options.reducedMotion ? 0 : 1200
    });
  }
}