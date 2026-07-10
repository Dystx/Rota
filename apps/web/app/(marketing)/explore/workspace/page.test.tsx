import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import WorkspacePage from "./page";

vi.mock("./activity-workspace", () => ({
  ActivityWorkspace: ({ initialActivities }: { initialActivities: { id: string }[] }) => (
    <output data-testid="activity-workspace">{initialActivities.map((activity) => activity.id).join(",")}</output>
  )
}));

describe("WorkspacePage", () => {
  it("only renders the reviewed activities explicitly chosen from the explorer", async () => {
    const page = await WorkspacePage({
      searchParams: Promise.resolve({
        activity: ["porto-bombarda-art-walk", "not-a-reviewed-activity", "porto-ribeira-slow-walk"]
      })
    });

    render(page);

    expect(screen.getByTestId("activity-workspace").textContent).toBe(
      "porto-bombarda-art-walk,porto-ribeira-slow-walk"
    );
  });
});
