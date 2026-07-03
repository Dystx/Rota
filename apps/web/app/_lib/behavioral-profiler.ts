"use client";

/**
 * Behavioral profiler scaffold (Phase 6 of the roadmap).
 *
 * Captures client-side signals that the platform uses to refine
 * each traveler's preference profile. Today this writes to an
 * in-memory ring buffer; tomorrow it POSTs to a Supabase
 * `user_behavior_events` table and the offline IndexedDB cache
 * (from Phase 5) flushes the buffer on reconnect.
 *
 * The signals captured:
 *  - skip: user dragged past a suggested stop without viewing
 *  - extend: user extended the duration of a stop
 *  - replace: user swapped a stop for a different one
 *  - pin: user pinned a stop to a specific day
 *  - mute: user muted a category of suggestions
 *
 * None of these fire network requests in this scaffold. Callers
 * wire them via `onSkip`, `onExtend`, etc. on the relevant UI
 * components. The next Phase 6 commit will add the POST handler
 * and the Supabase table.
 */

export type BehaviorEventType =
  | "skip"
  | "extend"
  | "replace"
  | "pin"
  | "mute";

export interface BehaviorEvent {
  type: BehaviorEventType;
  tripId: string;
  /** Stable id of the stop / destination / category the event applies to. */
  targetId: string;
  /** Optional context — e.g. the replacement stop id for "replace". */
  metadata?: Record<string, string | number | boolean>;
  /** ms since epoch */
  timestamp: number;
}

const RING_BUFFER_LIMIT = 100;

class BehaviorBuffer {
  private events: BehaviorEvent[] = [];

  push(event: BehaviorEvent): void {
    this.events.push(event);
    if (this.events.length > RING_BUFFER_LIMIT) {
      this.events.shift();
    }
  }

  drain(): readonly BehaviorEvent[] {
    const copy = this.events.slice();
    this.events.length = 0;
    return copy;
  }

  peek(): readonly BehaviorEvent[] {
    return this.events.slice();
  }
}

const buffer = new BehaviorBuffer();

/**
 * SSR guard. The behavioral profiler only runs in the browser
 * (where `window` exists) or in jsdom test envs. In pure Node
 * (e.g. vitest with the `node` environment) we skip recording
 * so the test can opt into the real path via `setBehaviorTestMode`.
 */
let testMode = false;

/** Test-only escape hatch: force the profiler to record even when
 *  `window` is undefined. Not exported from the package barrel. */
export function setBehaviorTestMode(enabled: boolean): void {
  testMode = enabled;
}

/**
 * Record a behavioral event. Safe to call from any client
 * component; the profiler is a no-op on the server (in Node
 * without testMode set).
 */
export function recordBehavior(event: Omit<BehaviorEvent, "timestamp">): void {
  if (typeof window === "undefined" && !testMode) return;
  buffer.push({ ...event, timestamp: Date.now() });
}

/**
 * Read the current buffer (does not drain). Used by debug surfaces
 * and the future Settings → Privacy → "Clear my profile data" flow.
 */
export function peekBehaviorBuffer(): readonly BehaviorEvent[] {
  return buffer.peek();
}

/**
 * Drain and return all pending events. The future POST handler
 * calls this, sends the batch, and re-pushes any events that
 * arrived during the in-flight request so nothing is lost.
 */
export function drainBehaviorBuffer(): readonly BehaviorEvent[] {
  return buffer.drain();
}

/**
 * Convenience helpers for common signal shapes. Each returns a
 * pre-bound function so the call site stays terse.
 */
export function makeSkipHandler(tripId: string, stopId: string) {
  return () => recordBehavior({ type: "skip", tripId, targetId: stopId });
}

export function makeExtendHandler(tripId: string, stopId: string, extraMinutes: number) {
  return () =>
    recordBehavior({
      type: "extend",
      tripId,
      targetId: stopId,
      metadata: { extraMinutes }
    });
}

export function makeReplaceHandler(
  tripId: string,
  originalStopId: string,
  replacementStopId: string
) {
  return () =>
    recordBehavior({
      type: "replace",
      tripId,
      targetId: originalStopId,
      metadata: { replacementStopId }
    });
}
