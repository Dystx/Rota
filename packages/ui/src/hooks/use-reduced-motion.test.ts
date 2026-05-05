import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useReducedMotion } from "./use-reduced-motion";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useReducedMotion", () => {
  it("returns false when matchMedia matches false", () => {
    const mediaQuery: MediaQueryList = {
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    } satisfies MediaQueryList;

    vi.spyOn(window, "matchMedia").mockReturnValue(mediaQuery);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it("returns true when matchMedia matches true", async () => {
    const mediaQuery: MediaQueryList = {
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    } satisfies MediaQueryList;

    vi.spyOn(window, "matchMedia").mockReturnValue(mediaQuery);

    const { result } = renderHook(() => useReducedMotion());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("reacts to media-query change events", async () => {
    let listener: (() => void) | undefined;
    let matches = false;
    const mediaQuery: MediaQueryList = {
      get matches() {
        return matches;
      },
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn((event: string, callback: () => void) => {
        if (event === "change") {
          listener = callback;
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    } satisfies MediaQueryList;

    vi.spyOn(window, "matchMedia").mockReturnValue(mediaQuery);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);

    matches = true;
    listener?.();

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("returns false during SSR", () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined,
    });

    function Probe(): null {
      const reducedMotion = useReducedMotion();

      expect(reducedMotion).toBe(false);

      return null;
    }

    expect(() => renderToString(React.createElement(Probe))).not.toThrow();

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  });
});
