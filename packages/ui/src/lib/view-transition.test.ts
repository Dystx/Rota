import { afterEach, describe, expect, it, vi } from "vitest";
import {
  runViewTransition,
  setTransitionName,
  supportsViewTransitions,
} from "./view-transition";

function stubMotionPreference(reducedMotion: boolean): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({ matches: reducedMotion } satisfies Pick<MediaQueryList, "matches">),
  );
}

function stubViewTransition(
  startViewTransition: (update: () => void) => unknown,
): void {
  Object.defineProperty(document, "startViewTransition", {
    configurable: true,
    value: startViewTransition,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Reflect.deleteProperty(document, "startViewTransition");
});

describe("view transitions", () => {
  it("uses the browser API when supported and motion is allowed", () => {
    const update = vi.fn();
    const startViewTransition = vi.fn((callback: () => void) => callback());
    stubMotionPreference(false);
    stubViewTransition(startViewTransition);

    expect(supportsViewTransitions()).toBe(true);

    runViewTransition(update);

    expect(startViewTransition).toHaveBeenCalledWith(update);
    expect(update).toHaveBeenCalledOnce();
  });

  it("runs the update synchronously when view transitions are unsupported", () => {
    const update = vi.fn();
    stubMotionPreference(false);

    expect(supportsViewTransitions()).toBe(false);

    runViewTransition(update);

    expect(update).toHaveBeenCalledOnce();
  });

  it("skips the browser API when reduced motion is preferred", () => {
    const update = vi.fn();
    const startViewTransition = vi.fn((callback: () => void) => callback());
    stubMotionPreference(true);
    stubViewTransition(startViewTransition);

    expect(supportsViewTransitions()).toBe(false);

    runViewTransition(update);

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledOnce();
  });

  it("sets and clears an element transition name", () => {
    const element = document.createElement("div");

    setTransitionName(element, "destination-card");
    expect(element.style.viewTransitionName).toBe("destination-card");

    setTransitionName(element, null);
    expect(element.style.viewTransitionName).toBe("");
  });
});
