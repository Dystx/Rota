import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ActivityDetailSaveAction } from "./activity-detail-save-action";

afterEach(cleanup);

describe("ActivityDetailSaveAction", () => {
  it("adds an activity to the day with an explicit handoff", () => {
    render(
      <ActivityDetailSaveAction
        activityId="porto-ribeira-slow-walk"
        activityTitle="Ribeira and Miragaia at walking pace"
        region="porto"
        moods={["a walk", "good food"]}
      />
    );

    const save = screen.getByRole("button", { name: /Save to my day/i });
    fireEvent.click(save);

    expect(save.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("activity-detail-save-status").textContent).toMatch(
      /added to your day/i
    );
    expect(screen.getByRole("link", { name: /See this day/i }).getAttribute("href")).toContain(
      "saved=porto-ribeira-slow-walk"
    );
  });

  it("keeps the removal path reversible on the detail page", () => {
    render(
      <ActivityDetailSaveAction
        activityId="porto-ribeira-slow-walk"
        activityTitle="Ribeira and Miragaia at walking pace"
        region="porto"
        moods={["a walk"]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Save to my day/i }));
    fireEvent.click(screen.getByRole("button", { name: /Remove from my day/i }));

    expect(screen.getByRole("button", { name: /Save to my day/i }).getAttribute("aria-pressed")).toBe(
      "false"
    );
    expect(screen.getByTestId("activity-detail-save-status").textContent).toMatch(
      /removed from your day/i
    );
    expect(screen.queryByRole("link", { name: /See this day/i })).toBeNull();
  });

  it("keeps save as the primary action and announces the chosen-day transition", () => {
    render(
      <ActivityDetailSaveAction
        activityId="porto-ribeira-slow-walk"
        activityTitle="Ribeira and Miragaia at walking pace"
        region="porto"
        moods={["a walk"]}
      />
    );

    const save = screen.getByRole("button", { name: /save to my day/i });
    expect(save.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(save);

    expect(screen.getByRole("button", { name: /remove from my day/i }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("status").textContent).toMatch(/added to your day/i);
    expect(screen.getByRole("link", { name: /see this day/i }).getAttribute("href")).toContain(
      "saved=porto-ribeira-slow-walk"
    );
  });
});
