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
  it("reserves mobile space for the fixed day tray and restores desktop spacing", () => {
    render(<ActivityExplorer initialIntent={parseActivityIntent({ region: "porto" })} />);

    const shell = screen.getByTestId("activity-explorer");
    expect(shell.className).toContain("pb-[calc(12rem+env(safe-area-inset-bottom))]");
    expect(shell.className).toContain("lg:pb-28");
  });

  it("renders a reviewed verdict and keeps a saved activity reversible", () => {
    render(<ActivityExplorer initialIntent={parseActivityIntent({ region: "porto", mood: "a walk" })} />);

    const save = screen.getAllByRole("button", { name: /Save .* to this day/i })[0]!;
    expect(screen.getAllByText("Rumia verdict").length).toBeGreaterThan(0);
    fireEvent.click(save);
    expect(screen.getByTestId("activity-status").textContent).toMatch(/added to your day/i);
    expect(save.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("region", { name: /Your day/i })).toBeTruthy();
    expect(replace).toHaveBeenCalledWith(expect.stringContaining("saved=porto-ribeira-slow-walk"));
    fireEvent.click(
      screen.getAllByRole("button", { name: /Remove .* from this day/i })[0]!,
    );
    expect(screen.getByTestId("activity-status").textContent).toMatch(/removed from your day/i);
    expect(screen.queryByRole("region", { name: /Your day/i })).toBeNull();
  });

  it("keeps reversed saved IDs in query order when showing and handing off the day", () => {
    render(
      <ActivityExplorer
        initialIntent={parseActivityIntent({ region: "porto", mood: "a walk" })}
        initialSavedIds={["porto-bombarda-art-walk", "porto-ribeira-slow-walk"]}
      />
    );

    const items = screen.getByRole("region", { name: /Your day/i }).querySelectorAll("li");
    expect([...items].map((item) => item.textContent)).toEqual([
      expect.stringContaining("Miguel Bombarda for contemporary art and design"),
      expect.stringContaining("Ribeira and Miragaia at walking pace")
    ]);

    fireEvent.click(screen.getByRole("button", { name: /See this day/i }));
    expect(push).toHaveBeenCalledWith(
      "/explore/workspace?activity=porto-bombarda-art-walk&activity=porto-ribeira-slow-walk"
    );
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
