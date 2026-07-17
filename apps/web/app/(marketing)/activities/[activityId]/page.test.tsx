import * as React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import ActivityDetailPage from "./page";

afterEach(cleanup);

describe("ActivityDetailPage", () => {
  it("composes the judgement before the supporting fact rail", async () => {
    const page = await ActivityDetailPage({
      params: Promise.resolve({ activityId: "porto-ribeira-slow-walk" })
    });
    render(page);

    expect(screen.getByTestId("activity-detail-page")).toBeTruthy();
    expect(screen.getByTestId("activity-detail-judgement")).toBeTruthy();
    expect(screen.getByTestId("activity-detail-fact-rail")).toBeTruthy();
    expect(screen.getByTestId("activity-detail-save-action")).toBeTruthy();
    expect(screen.getByTestId("activity-detail-primary-action")).toBeTruthy();
    expect(screen.getByTestId("activity-detail-hero").getAttribute("data-tone")).toBe("cover");
  });

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
    expect(screen.getByRole("heading", { name: /compare it with Miguel Bombarda/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Read the alternative/i }).getAttribute("href")).toBe(
      "/activities/porto-bombarda-art-walk"
    );
  });

  it("puts the judgement summary inside the activity cover", async () => {
    const page = await ActivityDetailPage({
      params: Promise.resolve({ activityId: "porto-ribeira-slow-walk" })
    });
    render(page);

    const hero = screen.getByTestId("activity-detail-hero");
    expect(within(hero).getByText("Rumia verdict")).toBeTruthy();
    expect(within(hero).getByText("Time to allow")).toBeTruthy();
    expect(within(hero).getByText("Leave room for")).toBeTruthy();
    expect(screen.getByRole("button", { name: /save/i })).toBeTruthy();
    expect(screen.getByTestId("activity-detail-save-bar").className).toContain("md:absolute");
  });

  it("keeps the mobile save bar page-level and leaves document room before evidence", async () => {
    const page = await ActivityDetailPage({
      params: Promise.resolve({ activityId: "porto-ribeira-slow-walk" })
    });
    render(page);

    const article = screen.getByTestId("activity-detail-page");
    const saveBar = screen.getByTestId("activity-detail-save-bar");

    expect(saveBar.className).toContain("fixed");
    expect(saveBar.className).toContain("bottom-0");
    expect(saveBar.className).toContain("safe-area-inset-bottom");
    expect(saveBar.className).toContain("md:absolute");
    expect(article.className).toContain("sm:pb-[calc(8rem+env(safe-area-inset-bottom))]");
    expect(saveBar.compareDocumentPosition(screen.getByRole("link", { name: /Read the editorial evidence/i })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
