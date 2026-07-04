// @vitest-environment jsdom
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, render } from "@testing-library/react";
import { useMapStore } from "@/store/useMapStore";
import { useTargetCoordinatesCameraSync, type CameraFlyToPointHandle } from "@/lib/hooks/useTargetCoordinatesCameraSync";

/**
 * The hook is the source of truth for the
 * `targetCoordinates` → camera fly-to bridge. The
 * production code in `CinematicMapSection` calls it with
 * `() => canvasRef.current`. This test exercises the
 * actual hook (not a clone) so the captured-target race
 * guard and the `[0, 0]` sentinel are pinned against
 * production code.
 */

interface HandleState {
  flights: Array<{ lng: number; lat: number }>;
  flightResolvers: Array<() => void>;
}

function makeHandle() {
  const state: HandleState = { flights: [], flightResolvers: [] };
  const handle: CameraFlyToPointHandle = {
    flyToPoint: (target) =>
      new Promise<void>((resolve) => {
        state.flights.push(target);
        state.flightResolvers.push(resolve);
      })
  };
  return { handle, state };
}

function MountWith({
  getHandle,
  onError
}: {
  getHandle: () => CameraFlyToPointHandle | null;
  onError?: (e: unknown) => void;
}) {
  // The hook reads from Zustand and writes to the
  // supplied handle. We mount it directly so the test
  // exercises the real production code path.
  useTargetCoordinatesCameraSync(getHandle);
  return null;
}

describe("useTargetCoordinatesCameraSync (CinematicMapSection bridge)", () => {
  beforeEach(() => {
    useMapStore.setState({
      activeStopId: null,
      targetCoordinates: null
    });
  });

  afterEach(() => {
    // The hook may have left a pending IIFE; ensure
    // nothing else is in flight by clearing the store.
    useMapStore.setState({
      activeStopId: null,
      targetCoordinates: null
    });
  });

  it("clears the target after the flight resolves (happy path)", async () => {
    const { handle, state } = makeHandle();
    render(<MountWith getHandle={() => handle} />);
    const setTarget = useMapStore.getState().setTargetCoordinates;

    act(() => {
      setTarget([-7.7793, 41.1419]);
    });
    expect(state.flights).toHaveLength(1);

    await act(async () => {
      state.flightResolvers[0]!();
      await Promise.resolve();
    });
    expect(useMapStore.getState().targetCoordinates).toBeNull();
  });

  it("does NOT clear a newer target when an older flight resolves", async () => {
    const { handle, state } = makeHandle();
    render(<MountWith getHandle={() => handle} />);
    const setTarget = useMapStore.getState().setTargetCoordinates;

    // Click A (Douro).
    act(() => {
      setTarget([-7.7793, 41.1419]);
    });
    expect(state.flights).toHaveLength(1);

    // Click B (Lisbon) while A is still in-flight.
    act(() => {
      setTarget([-9.1393, 38.7223]);
    });
    expect(state.flights).toHaveLength(2);
    expect(useMapStore.getState().targetCoordinates).toEqual([
      -9.1393, 38.7223
    ]);

    // Resolve A first — captured-target guard must
    // prevent it from clearing the B target.
    await act(async () => {
      state.flightResolvers[0]!();
      await Promise.resolve();
    });
    expect(useMapStore.getState().targetCoordinates).toEqual([
      -9.1393, 38.7223
    ]);

    // Resolve B — that one SHOULD clear.
    await act(async () => {
      state.flightResolvers[1]!();
      await Promise.resolve();
    });
    expect(useMapStore.getState().targetCoordinates).toBeNull();
  });

  it("drops the [0, 0] sentinel synchronously without firing flyTo", () => {
    const { handle, state } = makeHandle();
    render(<MountWith getHandle={() => handle} />);
    const setTarget = useMapStore.getState().setTargetCoordinates;

    act(() => {
      setTarget([0, 0]);
    });
    expect(state.flights).toHaveLength(0);
    expect(useMapStore.getState().targetCoordinates).toBeNull();
  });

  it("clears the target when the handle is null at effect time", () => {
    // The handle isn't ready yet (e.g. canvas not yet
    // mounted). The hook must NOT loop on the next
    // mount — it should clear the target so the next
    // mount starts fresh.
    render(<MountWith getHandle={() => null} />);
    const setTarget = useMapStore.getState().setTargetCoordinates;

    act(() => {
      setTarget([-9.1393, 38.7223]);
    });
    expect(useMapStore.getState().targetCoordinates).toBeNull();
  });
});
