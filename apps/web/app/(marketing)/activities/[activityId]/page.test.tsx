import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ActivityDetailPage from "./page";

describe("ActivityDetailPage", () => {
  it("shows the evidence and caveat behind a reviewed activity", async () => {
    const page = await ActivityDetailPage({
      params: Promise.resolve({ activityId: "porto-ribeira-slow-walk" })
    });
    render(page);

    expect(screen.getByRole("heading", { name: "Ribeira and Miragaia at walking pace" })).toBeTruthy();
    expect(screen.getByText("Rumia verdict")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Read the editorial evidence/i }).getAttribute("href")).toMatch(
      /visitportugal\.com/
    );
  });
});
