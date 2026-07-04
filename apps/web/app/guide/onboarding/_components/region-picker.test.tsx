import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  regionIdsBySlug,
  regionIdsToSlugs,
  slugsToRegionIds
} from "@repo/types";
import { RegionPicker } from "./region-picker";

// jsdom is provided by the workspace root test config (project: jsdom).
// `cleanup` between tests is required because the root vitest config
// does not set `globals: true` (so testing-library's auto-cleanup
// does not register an `afterEach`). The pattern mirrors
// `packages/ui/src/components/form-primitives.test.tsx`.

afterEach(() => {
  cleanup();
});

describe("RegionPicker", () => {
  it("renders all 9 Portugal region checkboxes", () => {
    render(<RegionPicker value={[]} onChange={() => {}} />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(9);
    expect(screen.getByTestId("region-picker-lisbon")).toBeDefined();
    expect(screen.getByTestId("region-picker-porto")).toBeDefined();
    expect(screen.getByTestId("region-picker-algarve")).toBeDefined();
  });

  it("checks the boxes whose slugs match the input synthetic region UUIDs", () => {
    const value = slugsToRegionIds(["lisbon", "porto"]);
    render(<RegionPicker value={value} onChange={() => {}} />);
    expect(
      (screen.getByTestId("region-picker-lisbon") as HTMLInputElement).checked
    ).toBe(true);
    expect(
      (screen.getByTestId("region-picker-porto") as HTMLInputElement).checked
    ).toBe(true);
    expect(
      (screen.getByTestId("region-picker-algarve") as HTMLInputElement)
        .checked
    ).toBe(false);
  });

  it("fires onChange with the full new set of synthetic UUIDs", () => {
    const onChange = vi.fn();
    render(<RegionPicker value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("region-picker-lisbon"));
    expect(onChange).toHaveBeenCalledWith([regionIdsBySlug.lisbon]);
  });

  it("toggles a previously-checked region off", () => {
    const onChange = vi.fn();
    const value = slugsToRegionIds(["lisbon", "porto"]);
    render(<RegionPicker value={value} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("region-picker-lisbon"));
    expect(onChange).toHaveBeenCalledWith([regionIdsBySlug.porto]);
  });

  it("ignores unknown region ids in the input value", () => {
    const value = [
      regionIdsBySlug.lisbon,
      "00000000-0000-0000-0000-000000000000"
    ];
    render(<RegionPicker value={value} onChange={() => {}} />);
    expect(
      (screen.getByTestId("region-picker-lisbon") as HTMLInputElement).checked
    ).toBe(true);
    // The unknown id must not check any box.
    expect(screen.getAllByRole("checkbox")).toHaveLength(9);
    expect(
      Array.from(screen.getAllByRole("checkbox") as HTMLInputElement[]).filter(
        (c) => c.checked
      )
    ).toHaveLength(1);
  });

  it("supports being seeded from a round-tripped value (real flow)", () => {
    // Real flow: form receives initialProfile.regionsCovered (UUIDs),
    // converts to slugs for the picker, the user adds "sintra", the
    // picker emits UUIDs again, the form submits those.
    const initialFromDb = slugsToRegionIds(["lisbon"]);
    const onChange = vi.fn();
    render(<RegionPicker value={initialFromDb} onChange={onChange} />);

    fireEvent.click(screen.getByTestId("region-picker-sintra"));
    const next = onChange.mock.calls[0]?.[0] as string[] | undefined;
    expect(next).toBeDefined();
    expect(regionIdsToSlugs(next ?? []).sort()).toEqual(["lisbon", "sintra"]);
  });
});
