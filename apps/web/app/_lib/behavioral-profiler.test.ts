import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  drainBehaviorBuffer,
  makeExtendHandler,
  makeReplaceHandler,
  makeSkipHandler,
  peekBehaviorBuffer,
  recordBehavior,
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
