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
  it("makes a saved activity visible in every decision surface", () => {
    render(<ActivityExplorer initialIntent={parseActivityIntent({ region: "porto", mood: "a walk" })} />);

    const save = screen.getAllByRole("button", { name: /save .* to this day/i })[0]!;
    fireEvent.click(save);

    expect(save).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByTestId("activity-result-card")[0]).toHaveAttribute("data-saved", "true");
    expect(screen.getByRole("status")).toHaveTextContent(/added to your day/i);
    expect(screen.getByTestId("activity-day-tray")).toHaveTextContent("1 activity");
    expect(replace).toHaveBeenCalledWith(expect.stringContaining("saved="));
  });

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
    expect(screen.getByTestId("activity-status").getAttribute("aria-atomic")).toBe("true");
    expect(save.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("region", { name: /Your day/i })).toBeTruthy();
    expect(replace).toHaveBeenCalledWith(expect.stringContaining("saved=porto-ribeira-slow-walk"));
    fireEvent.click(
      screen.getAllByRole("button", { name: /Remove .* from this day/i })[0]!,
    );
    expect(screen.getByTestId("activity-status").textContent).toMatch(/removed from your day/i);
    expect(screen.queryByRole("region", { name: /Your day/i })).toBeNull();
  });

  it("announces a phrase replacement through the authoritative status region", () => {
    render(<ActivityExplorer initialIntent={parseActivityIntent({ region: "porto" })} />);

    const initialPhraseMotionKey = screen.getByTestId("activity-phrase-motion").getAttribute("data-motion-key");
    const regionPhrase = screen.getByRole("button", { name: /Region, Porto/i });
    fireEvent.click(regionPhrase);
    fireEvent.click(screen.getByRole("button", { name: "Lisbon" }));
    fireEvent.click(screen.getByRole("button", { name: /Show me what is worth doing/i }));

    const status = screen.getByTestId("activity-status");
    expect(status.getAttribute("role")).toBe("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.textContent).toMatch(/updated/i);
    expect(status.textContent).toMatch(/Lisbon/i);
    expect(status.textContent).not.toMatch(/saved day was cleared/i);
    expect(screen.getByTestId("activity-phrase-motion").getAttribute("data-motion-key")).not.toBe(initialPhraseMotionKey);
  });

  it("restarts status and tray motion contracts after a saved-day update", () => {
    render(<ActivityExplorer initialIntent={parseActivityIntent({ region: "porto", mood: "a walk" })} />);

    const initialStatusMotionKey = screen.getByTestId("activity-status-motion").getAttribute("data-motion-key");
    const save = screen.getAllByRole("button", { name: /Save .* to this day/i })[0]!;
    fireEvent.click(save);

    const statusMotion = screen.getByTestId("activity-status-motion");
    const tray = screen.getByRole("region", { name: /Your day/i });
    expect(statusMotion.className).toContain("rumia-status-transition");
    expect(statusMotion.getAttribute("data-motion-key")).not.toBe(initialStatusMotionKey);
    expect(tray.className).toContain("rumia-save-transition");
    expect(tray.getAttribute("data-motion-key")).toBe("porto-ribeira-slow-walk");
  });

  it("only reports clearing the saved day when the replacement starts with saved activities", () => {
    render(
      <ActivityExplorer
        initialIntent={parseActivityIntent({ region: "porto" })}
        initialSavedIds={["porto-ribeira-slow-walk"]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Region, Porto/i }));
    fireEvent.click(screen.getByRole("button", { name: "Lisbon" }));
    fireEvent.click(screen.getByRole("button", { name: /Show me what is worth doing/i }));

    expect(screen.getByTestId("activity-status").textContent).toMatch(/updated for Lisbon/i);
    expect(screen.getByTestId("activity-status").textContent).toMatch(/saved day was cleared/i);
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

  it("keeps a saved activity visible when a new lens filters it out of the results", () => {
    render(
      <ActivityExplorer
        initialIntent={parseActivityIntent({ region: "porto", mood: "culture" })}
        initialSavedIds={["porto-ribeira-slow-walk"]}
      />
    );

    expect(screen.getByRole("region", { name: /Your day/i })).toHaveTextContent(
      "Ribeira and Miragaia at walking pace"
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
