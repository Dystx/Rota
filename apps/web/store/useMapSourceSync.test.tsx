// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMapStore } from "./useMapStore";
import { useMapSourceSync } from "./useMapSourceSync";

/**
 * `useMapSourceSync` is the high-frequency bridge between the
 * Zustand store and a MapLibre GeoJSON source. The filmstrip UX
 * (and the home-page bento destination cards) depend on it
 * firing exactly when the subscribed slice changes and never
 * firing on unrelated store updates.
 */
describe("useMapSourceSync", () => {
  beforeEach(() => {
    useMapStore.setState({
      activeStopId: null,
      targetCoordinates: null
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fires onChange once on mount with the initial slice", () => {
    const onChange = vi.fn();
    renderHook(() => useMapSourceSync("alpha", onChange));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("alpha");
  });

  it("fires onChange when the slice changes", () => {
    const onChange = vi.fn();
    const { rerender } = renderHook(
      ({ slice }: { slice: string }) => useMapSourceSync(slice, onChange),
      { initialProps: { slice: "alpha" } }
    );
    expect(onChange).toHaveBeenCalledTimes(1);
    rerender({ slice: "beta" });
    // Rerender re-runs the effect with the new slice; the
    // subscriber fires immediately after re-subscribe, and
    // the closure-captured slice is now "beta".
    expect(onChange).toHaveBeenCalledWith("beta");
    expect(onChange.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("does NOT fire onChange when an unrelated store field changes", () => {
    const onChange = vi.fn();
    renderHook(() => useMapSourceSync("alpha", onChange));
    expect(onChange).toHaveBeenCalledTimes(1);
    // Mutate a store field the hook does NOT subscribe to.
    // (The `viewport` + `activeDay` fields were removed from
    // the store on 2026-07-04; we now flip `targetCoordinates`
    // to itself, which is a store mutation the slice doesn't
    // depend on.)
    useMapStore.setState({ targetCoordinates: null });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("does NOT fire onChange when the same store field is set to its current value", () => {
    const onChange = vi.fn();
    renderHook(() => useMapSourceSync("alpha", onChange));
    expect(onChange).toHaveBeenCalledTimes(1);
    // activeStopId is already null; setting it to null again
    // shouldn't re-fire onChange because the slice (activeStopId)
    // hasn't changed.
    useMapStore.setState({ activeStopId: null });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes on unmount so further store changes do not fire onChange", () => {
    const onChange = vi.fn();
    const { unmount } = renderHook(() => useMapSourceSync("alpha", onChange));
    expect(onChange).toHaveBeenCalledTimes(1);
    unmount();
    // After unmount, even a slice change should not fire onChange.
    useMapStore.setState({ activeStopId: "x" });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("compares the slice by JSON so object-shaped slices work", () => {
    const onChange = vi.fn();
    const initial = { id: "a", coords: [0, 0] as readonly [number, number] };
    const { rerender } = renderHook(
      ({ slice }: { slice: typeof initial }) =>
        useMapSourceSync(slice, onChange),
      { initialProps: { slice: initial } }
    );
    expect(onChange).toHaveBeenCalledTimes(1);
    // Rerender with a structurally-equal but referentially-different
    // object. The hook should NOT re-fire because the JSON
    // serialization is identical.
    rerender({ slice: { id: "a", coords: [0, 0] } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
