import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  drainBehaviorBuffer,
  getBehaviorConsent,
  makeExtendHandler,
  makeReplaceHandler,
  makeSkipHandler,
  peekBehaviorBuffer,
  recordBehavior,
  setBehaviorConsent,
  setBehaviorTestMode
} from "./behavioral-profiler";

describe("behavioral-profiler", () => {
  beforeEach(() => {
    // Vitest runs in node env (no `window`), so force the profiler
    // into the recording path explicitly. This avoids depending on
    // jsdom just for a 6-test unit suite.
    setBehaviorTestMode(true);
    drainBehaviorBuffer();
  });

  afterEach(() => {
    setBehaviorTestMode(false);
  });

  it("records a skip event with a timestamp", () => {
    const before = Date.now();
    recordBehavior({ type: "skip", tripId: "trip-1", targetId: "stop-a" });
    const events = peekBehaviorBuffer();
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("skip");
    expect(events[0]?.tripId).toBe("trip-1");
    expect(events[0]?.targetId).toBe("stop-a");
    expect(events[0]?.timestamp).toBeGreaterThanOrEqual(before);
  });

  it("makeSkipHandler returns a function that records a skip", () => {
    const handler = makeSkipHandler("trip-1", "stop-a");
    handler();
    expect(peekBehaviorBuffer()[0]?.type).toBe("skip");
  });

  it("makeExtendHandler records the extra minutes in metadata", () => {
    const handler = makeExtendHandler("trip-1", "stop-a", 45);
    handler();
    const event = peekBehaviorBuffer()[0];
    expect(event?.type).toBe("extend");
    expect(event?.metadata?.extraMinutes).toBe(45);
  });

  it("makeReplaceHandler records the replacement stop id", () => {
    const handler = makeReplaceHandler("trip-1", "stop-a", "stop-b");
    handler();
    const event = peekBehaviorBuffer()[0];
    expect(event?.type).toBe("replace");
    expect(event?.metadata?.replacementStopId).toBe("stop-b");
  });

  it("drain returns all events and clears the buffer", () => {
    recordBehavior({ type: "skip", tripId: "t", targetId: "s1" });
    recordBehavior({ type: "extend", tripId: "t", targetId: "s2" });
    const drained = drainBehaviorBuffer();
    expect(drained).toHaveLength(2);
    expect(peekBehaviorBuffer()).toHaveLength(0);
  });

  it("ring buffer caps at 100 events", () => {
    for (let i = 0; i < 120; i++) {
      recordBehavior({ type: "skip", tripId: "t", targetId: `s${i}` });
    }
    expect(peekBehaviorBuffer().length).toBe(100);
    // Oldest 20 events were dropped; first surviving event is s20
    expect(peekBehaviorBuffer()[0]?.targetId).toBe("s20");
  });
});

describe("behavioral-profiler — consent gate", () => {
  // These tests run in production mode (testMode = false) so the
  // consent gate is actually enforced. `window` is stubbed to a
  // localStorage shim so `getBehaviorConsent` has a storage layer
  // to read from.
  const store: Record<string, string> = {};

  beforeEach(() => {
    drainBehaviorBuffer();
    setBehaviorTestMode(false);
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => (key in store ? store[key]! : null),
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          for (const key of Object.keys(store)) delete store[key];
        }
      }
    });
    for (const key of Object.keys(store)) delete store[key];
    setBehaviorConsent(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setBehaviorConsent(false);
    setBehaviorTestMode(false);
  });

  it("getBehaviorConsent returns false by default (opt-in)", () => {
    expect(getBehaviorConsent()).toBe(false);
  });

  it("setBehaviorConsent(true) flips the cached flag", () => {
    setBehaviorConsent(true);
    expect(getBehaviorConsent()).toBe(true);
  });

  it("setBehaviorConsent persists the choice in localStorage", () => {
    setBehaviorConsent(true);
    expect(store["rota.behavioral-profiler.consent"]).toBe("true");
    setBehaviorConsent(false);
    expect(store["rota.behavioral-profiler.consent"]).toBe("false");
  });

  it("recordBehavior is a no-op when consent is false", () => {
    setBehaviorConsent(false);
    recordBehavior({ type: "skip", tripId: "t", targetId: "s" });
    expect(peekBehaviorBuffer()).toHaveLength(0);
  });

  it("recordBehavior records when consent is true", () => {
    setBehaviorConsent(true);
    recordBehavior({ type: "skip", tripId: "t", targetId: "s" });
    expect(peekBehaviorBuffer()).toHaveLength(1);
  });
});
