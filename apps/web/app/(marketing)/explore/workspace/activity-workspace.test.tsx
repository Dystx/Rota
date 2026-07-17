import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";

import { ActivityWorkspace } from "./activity-workspace";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace })
}));

afterEach(() => {
  cleanup();
  replace.mockClear();
  window.history.replaceState({}, "", "/");
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: undefined
  });
});

describe("ActivityWorkspace", () => {
  it.each([
    [0, "empty"],
    [1, "one"],
    [2, "multiple"]
  ] as const)("renders the %s-selection workspace state", (count, state) => {
    render(<ActivityWorkspace initialActivities={REVIEWED_ACTIVITY_SEED.slice(0, count)} />);

    expect(screen.getByTestId("activity-workspace").getAttribute("data-state")).toBe(state);
  });

  it("makes an empty day recoverable with a useful shape preview", () => {
    render(<ActivityWorkspace initialActivities={[]} />);

    expect(screen.getByRole("heading", { name: /choose again/i })).toBeTruthy();
    expect(screen.getByRole("group", { name: /empty day preview/i })).toBeTruthy();
    expect(screen.getByTestId("workspace-empty-anchor")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Start with an activity" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Keep exploring" })).toBeNull();
    expect(screen.getByTestId("activity-workspace").querySelector(".rumia-workspace-empty")?.className).toContain("!min-h-0");
    expect(screen.getByText("Time")).toBeTruthy();
    expect(screen.getByText("Judgement")).toBeTruthy();
    expect(screen.getByText("Practical space")).toBeTruthy();
  });

  it("keeps a chosen day specific and makes removing an activity reversible", () => {
    render(<ActivityWorkspace initialActivities={REVIEWED_ACTIVITY_SEED.slice(0, 2)} />);

    expect(screen.getByRole("heading", { name: /Your tentative day/i })).toBeTruthy();
    expect(screen.getByText("Ribeira and Miragaia at walking pace")).toBeTruthy();
    expect(screen.getAllByTestId("workspace-activity-card")).toHaveLength(2);
    expect(screen.getAllByTestId("workspace-activity-index")[0]?.textContent).toBe("01");
    expect(screen.getAllByText(/Rumia's judgement/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "View on map" })).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: /Remove Ribeira and Miragaia at walking pace/i })
    );

    expect(screen.queryByText("Ribeira and Miragaia at walking pace")).toBeNull();
    expect(screen.getByTestId("workspace-status").textContent).toMatch(/removed from your day/i);
    expect(screen.getByTestId("workspace-status").getAttribute("aria-atomic")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Undo remove" }));
    expect(screen.getByText("Ribeira and Miragaia at walking pace")).toBeTruthy();
    expect(screen.getByTestId("workspace-status").textContent).toMatch(/restored to your day/i);
    expect(screen.getByText(/Keep exploring/i)).toBeTruthy();
    const shapeLink = screen.getByRole("link", { name: "Shape this day" });
    expect(shapeLink.getAttribute("href")).toContain("activity=porto-bombarda-art-walk");
    expect(screen.getByRole("link", { name: /Give feedback on this day/i }).getAttribute("href")).toContain("activity=porto-bombarda-art-walk");
  });

  it("keeps the ordered sequence editable and makes travel and pause room explicit", () => {
    const [first, second] = REVIEWED_ACTIVITY_SEED.slice(0, 2);
    render(<ActivityWorkspace initialActivities={[first!, second!]} />);

    expect(screen.getByTestId("workspace-day-summary").contains(screen.getByTestId("workspace-total-time"))).toBe(true);
    expect(screen.getByTestId("workspace-travel-caveat").textContent).toMatch(/travel|pause/i);
    expect(screen.getByTestId("workspace-activity-sequence").textContent).toContain(first!.title);

    fireEvent.click(screen.getByRole("button", { name: `Move ${second!.title} earlier` }));

    const indexes = screen.getAllByTestId("workspace-activity-index");
    expect(indexes[0]?.textContent).toBe("01");
    expect(screen.getAllByTestId("workspace-activity-card")[0]?.textContent).toContain(second!.title);
    expect(replace).toHaveBeenCalledWith(
      `/explore/workspace?activity=${second!.id}&activity=${first!.id}`
    );
  });

  it("announces ignored URL ids without changing the chosen sequence", () => {
    render(
      <ActivityWorkspace
        initialActivities={REVIEWED_ACTIVITY_SEED.slice(0, 1)}
        invalidActivityIds={["not-a-reviewed-activity"]}
      />
    );

    expect(screen.getByRole("alert").textContent).toMatch(/not-a-reviewed-activity/i);
    expect(screen.getAllByTestId("workspace-activity-card")).toHaveLength(1);
  });

  it("closes the optional map with Escape and restores focus to its trigger", async () => {
    render(<ActivityWorkspace initialActivities={REVIEWED_ACTIVITY_SEED.slice(0, 2)} mapEnabled />);

    const trigger = screen.getByRole("button", { name: "View on map" });
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
    expect(document.activeElement).toBe(trigger);
    expect(screen.getByTestId("workspace-status").textContent).toMatch(/Map closed/i);
  });

  it("restarts save and status motion when the chosen-day state changes", () => {
    render(<ActivityWorkspace initialActivities={REVIEWED_ACTIVITY_SEED.slice(0, 2)} />);

    const initialListMotionKey = screen.getByRole("list", { name: "Chosen activities" }).getAttribute("data-motion-key");
    const initialStatusMotionKey = screen.getByTestId("workspace-status").parentElement?.getAttribute("data-motion-key");
    fireEvent.click(
      screen.getByRole("button", { name: /Remove Ribeira and Miragaia at walking pace/i })
    );

    const list = screen.getByRole("list", { name: "Chosen activities" });
    expect(list.className).toContain("rumia-save-transition");
    expect(list.getAttribute("data-motion-key")).not.toBe(initialListMotionKey);
    const statusMotion = screen.getByTestId("workspace-status").parentElement;
    expect(statusMotion?.className).toContain("rumia-status-transition");
    expect(statusMotion?.getAttribute("data-motion-key")).not.toBe(initialStatusMotionKey);
  });

  it("shares the current chosen activities through a stable workspace link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });
    render(<ActivityWorkspace initialActivities={REVIEWED_ACTIVITY_SEED.slice(0, 2)} />);

    fireEvent.click(screen.getByRole("button", { name: /Share this day/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining("/explore/workspace?activity=porto-ribeira-slow-walk")));
    expect(screen.getByRole("status").textContent).toMatch(/Share link copied/i);
  });

  it("explains when sharing is unavailable or fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined
    });
    render(<ActivityWorkspace initialActivities={REVIEWED_ACTIVITY_SEED.slice(0, 1)} />);

    fireEvent.click(screen.getByRole("button", { name: /Share this day/i }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/Copying is unavailable/i));
    expect(screen.getByRole("status").getAttribute("aria-live")).toBe("polite");

    const writeTextAfterUndo = vi.fn().mockRejectedValue(new Error("clipboard denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: writeTextAfterUndo }
    });
    fireEvent.click(screen.getByRole("button", { name: /Share this day/i }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/could not copy/i));
  });

  it("keeps the fallback address truthful after removal and restores it on undo", async () => {
    const [first, second] = REVIEWED_ACTIVITY_SEED.slice(0, 2);
    window.history.replaceState(
      {},
      "",
      `/explore/workspace?activity=${first!.id}&activity=${second!.id}`
    );
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined
    });
    render(<ActivityWorkspace initialActivities={[first!, second!]} />);

    fireEvent.click(
      screen.getByRole("button", { name: /Remove Ribeira and Miragaia at walking pace/i })
    );

    expect(replace).toHaveBeenCalledWith("/explore/workspace?activity=porto-bombarda-art-walk");
    expect(window.location.search).toBe("?activity=porto-bombarda-art-walk");

    fireEvent.click(screen.getByRole("button", { name: /Share this day/i }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/copy this page address/i));
    expect(window.location.href).not.toContain(first!.id);

    const writeText = vi.fn().mockRejectedValue(new Error("clipboard denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });
    fireEvent.click(screen.getByRole("button", { name: /Share this day/i }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/could not copy/i));
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("/explore/workspace?activity=porto-bombarda-art-walk")
    );
    expect(window.location.href).not.toContain(first!.id);

    fireEvent.click(screen.getByRole("button", { name: "Undo remove" }));
    expect(replace).toHaveBeenLastCalledWith(
      "/explore/workspace?activity=porto-ribeira-slow-walk&activity=porto-bombarda-art-walk"
    );
    expect(window.location.search).toBe(
      "?activity=porto-ribeira-slow-walk&activity=porto-bombarda-art-walk"
    );

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined
    });
    fireEvent.click(screen.getByRole("button", { name: /Share this day/i }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/copy this page address/i));
    expect(window.location.href).toContain(first!.id);
    expect(window.location.href).toContain(second!.id);

    const writeTextAfterUndo = vi.fn().mockRejectedValue(new Error("clipboard denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: writeTextAfterUndo }
    });
    fireEvent.click(screen.getByRole("button", { name: /Share this day/i }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/could not copy/i));
    expect(writeTextAfterUndo).toHaveBeenCalledWith(
      expect.stringContaining(
        "/explore/workspace?activity=porto-ribeira-slow-walk&activity=porto-bombarda-art-walk"
      )
    );
  });
});
