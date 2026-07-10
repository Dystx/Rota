import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { parseActivityIntent } from "@/lib/content/activities";

import { ActivityExplorer } from "./activity-explorer";

const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace })
}));

afterEach(() => {
  cleanup();
  push.mockReset();
  replace.mockReset();
});

describe("ActivityExplorer", () => {
  it("renders a reviewed verdict and keeps a saved activity reversible", () => {
    render(<ActivityExplorer initialIntent={parseActivityIntent({ region: "porto", mood: "a walk" })} />);

    const save = screen.getAllByRole("button", { name: /Save .* to this day/i })[0]!;
    expect(screen.getAllByText("Rumia verdict").length).toBeGreaterThan(0);
    fireEvent.click(save);
    expect(screen.getByRole("region", { name: /Your day/i })).toBeTruthy();
    expect(replace).toHaveBeenCalledWith(expect.stringContaining("saved=porto-ribeira-slow-walk"));
    fireEvent.click(
      screen.getAllByRole("button", { name: /Remove .* from this day/i })[0]!,
    );
    expect(screen.queryByRole("region", { name: /Your day/i })).toBeNull();
  });

  it("names an uncovered activity situation instead of substituting a fixture", () => {
    render(
      <ActivityExplorer
        initialIntent={{
          ...parseActivityIntent({ region: "porto" }),
          moods: ["nightlife"]
        }}
      />
    );

    expect(screen.getByText(/That combination is still under review/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Save .* to this day/i })).toBeNull();
  });
});
