import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import WorkspacePage from "./page";

vi.mock("./activity-workspace", () => ({
  ActivityWorkspace: ({
    initialActivities,
    mapProvider,
    mapEnabled
  }: {
    initialActivities: { id: string }[];
    mapProvider?: { style?: { url?: string } };
    mapEnabled?: boolean;
  }) => (
    <output
      data-testid="activity-workspace"
      data-map-style-url={mapProvider?.style?.url ?? ""}
      data-map-enabled={mapEnabled ? "true" : "false"}
    >
      {initialActivities.map((activity) => activity.id).join(",")}
    </output>
  )
}));

afterEach(() => {
  cleanup();
  delete process.env.RUMIA_MAP_STYLE_URL;
  delete process.env.ENABLE_ACTIVITY_MAP;
});

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

  it("passes an explicitly configured public map style to the optional workspace map", async () => {
    process.env.RUMIA_MAP_STYLE_URL = "http://127.0.0.1:3010/portugal-style.json";

    const page = await WorkspacePage({
      searchParams: Promise.resolve({ activity: "porto-ribeira-slow-walk" })
    });

    render(page);

    expect(screen.getByTestId("activity-workspace").getAttribute("data-map-style-url")).toBe(
      "http://127.0.0.1:3010/portugal-style.json"
    );
    expect(screen.getByTestId("activity-workspace").getAttribute("data-map-enabled")).toBe("false");
  });

  it("keeps the map disabled when the feature flag lacks a provider configuration", async () => {
    process.env.ENABLE_ACTIVITY_MAP = "true";

    const page = await WorkspacePage({
      searchParams: Promise.resolve({ activity: "porto-ribeira-slow-walk" })
    });

    render(page);

    expect(screen.getByTestId("activity-workspace").getAttribute("data-map-enabled")).toBe("false");
  });
});
