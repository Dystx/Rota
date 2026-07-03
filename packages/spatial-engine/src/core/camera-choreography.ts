import type { CameraController, CameraTarget } from "./types";

/**
 * A single beat in a camera sequence. Each beat has an optional delay
 * before it starts and an optional duration that overrides the target's
 * own duration. Beats run sequentially; failures abort the sequence.
 */
export interface CameraChoreographyBeat {
  label: string;
  target: CameraTarget;
  /** Override the target's duration (ms). */
  duration?: number;
  /** Delay (ms) after the previous beat completes. */
  delay?: number;
}

/**
 * CameraChoreography — a fluent builder for sequences of camera moves.
 * Resolves when every beat has finished (or aborted on error). Phase 2
 * supports serial sequencing; phase 3 can add parallelism, looping,
 * and "wait for telemetry" beats.
 */
export class CameraChoreography {
  private readonly beats: CameraChoreographyBeat[] = [];

  /** Append a beat. Returns this for chaining. */
  beat(label: string, target: CameraTarget, options?: { duration?: number; delay?: number }): this {
    this.beats.push({ label, target, duration: options?.duration, delay: options?.delay });
    return this;
  }

  /** Number of beats registered so far. */
  get size(): number {
    return this.beats.length;
  }

  /** Snapshot the beats for inspection / persistence. */
  list(): readonly CameraChoreographyBeat[] {
    return [...this.beats];
  }

  /**
   * Play every beat in order against the supplied camera. Resolves when
   * the last beat settles. Aborts silently if any beat throws.
   */
  async play(camera: CameraController): Promise<void> {
    for (const beat of this.beats) {
      if (beat.delay && beat.delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, beat.delay));
      }
      const effectiveTarget: CameraTarget = beat.duration !== undefined
        ? { ...beat.target, duration: beat.duration }
        : beat.target;
      try {
        await camera.focus(effectiveTarget);
      } catch {
        // Choreography must never break the page; future phases can
        // surface beat-level failures via analytics.
        return;
      }
    }
  }
}

/** Sugar: build a one-shot choreography with a single beat. */
export function singleBeat(target: CameraTarget, options?: { duration?: number; delay?: number; label?: string }): CameraChoreography {
  return new CameraChoreography().beat(options?.label ?? "focus", target, { duration: options?.duration, delay: options?.delay });
}