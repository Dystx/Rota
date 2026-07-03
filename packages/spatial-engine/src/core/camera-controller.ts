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
 * Adapter-agnostic CameraController. The renderer-specific code passes a
 * thin `CameraExecutor` that proxies to the underlying map (e.g. MapLibre).
 *
 * Every public method is async to match the underlying renderer's
 * Promise-returning animation primitives.
 */
export class SpatialCameraController implements CameraController {
  private following = false;

  constructor(
    private readonly executor: CameraExecutor,
    private readonly options: CameraControllerOptions = {}
  ) {}

  async focus(target: CameraTarget): Promise<void> {
    const duration = this.options.reducedMotion ? 0 : (target.duration ?? 1200);
    const animOptions = {
      center: target.center ? ([target.center[0], target.center[1]] as [number, number]) : undefined,
      zoom: target.zoom,
      pitch: target.pitch,
      bearing: target.bearing,
      duration
    };

    if (duration === 0) {
      this.executor.jumpTo(animOptions);
      return;
    }
    await this.executor.flyTo(animOptions);
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