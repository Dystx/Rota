import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BetaUnavailablePanel } from "./beta-unavailable";

afterEach(cleanup);

describe("BetaUnavailablePanel", () => {
  it("is chrome-agnostic and uses one light recovery action", () => {
    render(
      <BetaUnavailablePanel
        title="Partner workspaces are in private beta"
        description="Only approved partners can enter this workspace."
        returnHref="/b2b"
      />
    );

    expect(screen.getByTestId("beta-unavailable")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1, name: "Partner workspaces are in private beta" })).toBeTruthy();
    expect(screen.getByTestId("decision-state-panel").getAttribute("data-kind")).toBe("unavailable");
    expect(screen.getByTestId("decision-state-panel").getAttribute("data-tone")).toBe("light");
    expect(screen.getByRole("link", { name: "Return to Rumia" }).getAttribute("href")).toBe("/b2b");
    expect(screen.queryByRole("main")).toBeNull();
    expect(screen.queryByTestId("site-footer")).toBeNull();
  });
});
