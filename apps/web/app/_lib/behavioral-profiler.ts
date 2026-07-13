"use client";

/**
 * Behavioral profiler scaffold (Phase 6 of the roadmap).
 *
 * Captures client-side signals that the platform uses to refine
 * each traveler's preference profile. Today this writes to an
 * in-memory ring buffer; tomorrow it POSTs to a PostgreSQL
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
 * **Consent gate (privacy).** Recording is OFF by default. The
 * traveler must opt in via the Preferences card on the account
 * page (`setBehaviorConsent(true)`); the toggle persists in
 * `localStorage["rota.behavioral-profiler.consent"]`. Until they
 * opt in, `recordBehavior()` is a no-op. The test mode escape
 * hatch bypasses the consent check so unit tests can verify the
 * recording path without touching localStorage.
 *
 * None of these fire network requests in this scaffold. Callers
 * wire them via `onSkip`, `onExtend`, etc. on the relevant UI
 * components. The next Phase 6 commit will add the POST handler
 * and the PostgreSQL table.
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
const CONSENT_STORAGE_KEY = "rota.behavioral-profiler.consent";

class BehaviorBuffer {
  private readonly capacity = RING_BUFFER_LIMIT;
  // Preallocated fixed-size backing store. Replaces the previous
  // Array.push + Array.shift() implementation: `shift()` is O(n) and
  // trashed GC whenever the buffer wrapped. The ring overwrites the
  // oldest slot in O(1).
  private readonly slots: (BehaviorEvent | undefined)[] = new Array(this.capacity);
  /** Index of the next slot to write to. */
  private head = 0;
  /** Number of populated slots; never exceeds `capacity`. */
  private count = 0;

  push(event: BehaviorEvent): void {
    this.slots[this.head] = event;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) {
      this.count++;
    }
  }

  /** Return events in insertion order (oldest first). */
  private toArray(): BehaviorEvent[] {
    const out: BehaviorEvent[] = [];
    if (this.count < this.capacity) {
      // Buffer not yet wrapped — slots 0..count-1 are in order.
      for (let i = 0; i < this.count; i++) {
        const event = this.slots[i];
        if (event !== undefined) {
          out.push(event);
        }
      }
    } else {
      // Buffer is full — start at `head` (oldest surviving slot)
      // and walk `capacity` positions.
      for (let i = 0; i < this.capacity; i++) {
        const idx = (this.head + i) % this.capacity;
        const event = this.slots[idx];
        if (event !== undefined) {
          out.push(event);
        }
      }
    }
    return out;
  }

  drain(): readonly BehaviorEvent[] {
    const copy = this.toArray();
    this.slots.fill(undefined);
    this.head = 0;
    this.count = 0;
    return copy;
  }

  peek(): readonly BehaviorEvent[] {
    return this.toArray();
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

/** Module-level cache of the consent flag. Avoids a localStorage
 *  hit on every `recordBehavior` call. */
let consentCache: boolean | null = null;

/**
 * Read the opt-in flag from localStorage. Returns `false` in SSR
 * (no `window`) and when the key is unset — opt-in, not opt-out.
 */
export function getBehaviorConsent(): boolean {
  if (typeof window === "undefined") return false;
  if (consentCache !== null) return consentCache;
  try {
    consentCache = window.localStorage.getItem(CONSENT_STORAGE_KEY) === "true";
  } catch {
    // Private mode / disabled storage → treat as no consent.
    consentCache = false;
  }
  return consentCache;
}

/**
 * Persist the opt-in flag. Called by the Preferences card on the
 * account page when the traveler toggles the "Personalize my route
 * suggestions" switch. The change takes effect immediately for
 * any in-flight components.
 */
export function setBehaviorConsent(enabled: boolean): void {
  consentCache = enabled;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // Swallow — the in-memory flag is still set for the current
    // session. The next page load will fall back to the default.
  }
}

/**
 * Record a behavioral event. Safe to call from any client
 * component; the profiler is a no-op on the server (in Node
 * without testMode set) and when the traveler has not opted in
 * (unless the test mode is forcing the recording path).
 */
export function recordBehavior(event: Omit<BehaviorEvent, "timestamp">): void {
  if (typeof window === "undefined" && !testMode) return;
  if (!testMode && !getBehaviorConsent()) return;
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
 *
 * TODO(LOW-11 / P6-1): the PostgreSQL `user_behavior_events` table
 * doesn't exist yet. The flush path is wired for when it does
 * (P6-1 in docs/engineering-lifecycle.md). Until then, the
 * drain helper is exported for tests + the future Settings →
 * "Clear my profile data" button.
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
