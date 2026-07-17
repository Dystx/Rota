import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { MapLibreErrorSuppressor } from "./maplibre-error-suppressor";

const suppressionMocks = vi.hoisted(() => ({
  leaf: vi.fn(),
  packageRoot: vi.fn()
}));

vi.mock("@repo/spatial-engine/error-suppression", () => ({
  setupMapLibreErrorSuppression: suppressionMocks.leaf
}));

vi.mock("@repo/spatial-engine", () => ({
  setupMapLibreErrorSuppression: suppressionMocks.packageRoot
}));

afterEach(() => {
  cleanup();
  suppressionMocks.leaf.mockReset();
  suppressionMocks.packageRoot.mockReset();
});

describe("MapLibreErrorSuppressor", () => {
  it("loads only the dependency-light suppression entry when a map is present", async () => {
    render(
      <>
        <div data-map-capable />
        <MapLibreErrorSuppressor />
      </>
    );

    await waitFor(() => expect(suppressionMocks.leaf).toHaveBeenCalledOnce());
    expect(suppressionMocks.packageRoot).not.toHaveBeenCalled();
  });
});
