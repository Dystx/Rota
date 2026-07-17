import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";

import { ActivityResultCard } from "./activity-result-card";

afterEach(cleanup);

describe("ActivityResultCard", () => {
  it("renders an editorial dossier hierarchy with a visible sequence marker and trade-off block", () => {
    render(
      <ActivityResultCard
        activity={REVIEWED_ACTIVITY_SEED[0]!}
        index={0}
        saved={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByTestId("activity-result-card")).toBeTruthy();
    expect(screen.getByTestId("activity-result-index").textContent).toBe("01");
    expect(screen.getByText("The trade-off")).toBeTruthy();
  });

  it("shows an explicit alternative alongside the editorial verdict", () => {
    render(
      <ActivityResultCard
        activity={REVIEWED_ACTIVITY_SEED[0]!}
        alternativeTitle="Miguel Bombarda for contemporary art and design"
        saved={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getAllByText("Rumia verdict").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Ribeira and Miragaia at walking pace" }).getAttribute("href")).toBe(
      "/activities/porto-ribeira-slow-walk"
    );
    expect(screen.getByText("Choose instead")).toBeTruthy();
    expect(screen.getByText("Miguel Bombarda for contemporary art and design")).toBeTruthy();
  });

  it("exposes the saved marker and reversible pressed state", () => {
    render(
      <ActivityResultCard
        activity={REVIEWED_ACTIVITY_SEED[0]!}
        saved
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByTestId("activity-result-card")).toHaveAttribute("data-saved", "true");
    const saveToggle = screen.getByRole("button", { name: /Remove Ribeira and Miragaia.*from this day/i });
    expect(saveToggle).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(saveToggle.className).toContain("min-h-11");
    expect(saveToggle.className).toContain("min-w-11");
    expect(saveToggle.className).toContain("scroll-mb-[calc(8rem+env(safe-area-inset-bottom))]");
  });
});
