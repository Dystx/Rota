import type { SpatialFeature, SpatialFeatureCollection, TelemetryChannel, TelemetryService } from "./types";

/**
 * Deterministic in-memory telemetry fixture.
 *
 * Phase 1 ships a stub so the SpatialEngine wiring can be verified
 * without a database-backed SSE stream. Phase 2 will swap
 * this for a real adapter behind the same TelemetryService interface.
 */
export class InMemoryTelemetryService implements TelemetryService {
  private readonly listeners = new Map<TelemetryChannel, Set<(collection: SpatialFeatureCollection) => void>>();
  private readonly latest = new Map<TelemetryChannel, SpatialFeatureCollection>();
  private rafHandle: ReturnType<typeof setTimeout> | null = null;
  private readonly pending = new Map<TelemetryChannel, SpatialFeature[]>();
  private readonly bufferWindowMs = 80;
  private shutdownRequested = false;

  seed(channel: TelemetryChannel, collection: SpatialFeatureCollection): void {
    this.latest.set(channel, collection);
    this.flush(channel, collection.features);
  }

  subscribe(channel: TelemetryChannel, listener: (collection: SpatialFeatureCollection) => void): () => void {
    const set = this.listeners.get(channel) ?? new Set();
    set.add(listener);
    this.listeners.set(channel, set);

    const seed = this.latest.get(channel);
    if (seed) {
      // Replay latest snapshot so new subscribers don't have to wait for the next tick.
      queueMicrotask(() => listener(seed));
    }

    return () => {
      set.delete(listener);
      if (set.size === 0) this.listeners.delete(channel);
    };
  }

  publish(channel: TelemetryChannel, features: readonly SpatialFeature[]): void {
    if (this.shutdownRequested) return;

    const buffered = this.pending.get(channel) ?? [];
    buffered.push(...features);
    this.pending.set(channel, buffered);

    if (this.rafHandle === null) {
      this.rafHandle = setTimeout(() => this.drain(), this.bufferWindowMs);
    }
  }

  shutdown(): void {
    this.shutdownRequested = true;
    if (this.rafHandle !== null) {
      clearTimeout(this.rafHandle);
      this.rafHandle = null;
    }
    this.listeners.clear();
    this.latest.clear();
    this.pending.clear();
  }

  private drain(): void {
    this.rafHandle = null;
    if (this.shutdownRequested) return;

    for (const [channel, features] of this.pending.entries()) {
      this.flush(channel, features);
    }
    this.pending.clear();
  }

  private flush(channel: TelemetryChannel, features: readonly SpatialFeature[]): void {
    const collection: SpatialFeatureCollection = {
      type: "FeatureCollection",
      features: [...features]
    };
    this.latest.set(channel, collection);
    const set = this.listeners.get(channel);
    if (!set) return;
    for (const listener of set) listener(collection);
  }
}
