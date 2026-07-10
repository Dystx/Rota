import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";

import { ActivityResultCard } from "./activity-result-card";

describe("ActivityResultCard", () => {
  it("shows an explicit alternative alongside the editorial verdict", () => {
    render(
      <ActivityResultCard
        activity={REVIEWED_ACTIVITY_SEED[0]!}
        alternativeTitle="Miguel Bombarda for contemporary art and design"
        saved={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText("Rumia verdict")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ribeira and Miragaia at walking pace" }).getAttribute("href")).toBe(
      "/activities/porto-ribeira-slow-walk"
    );
    expect(screen.getByText("Choose instead")).toBeTruthy();
    expect(screen.getByText("Miguel Bombarda for contemporary art and design")).toBeTruthy();
  });
});
