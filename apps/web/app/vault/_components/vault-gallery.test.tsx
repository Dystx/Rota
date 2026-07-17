import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { VaultGallery } from "./vault-gallery";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  )
}));

afterEach(cleanup);

describe("VaultGallery", () => {
  it("switches populated saved days between grid and list views", () => {
    render(
      <VaultGallery
        trips={[{
          id: "trip-porto",
          title: "Porto by the river",
          status: "draft",
          brief: {
            destinationCountry: "Portugal",
            regions: ["Porto"],
            tripLengthDays: 2,
            travelersCount: 1
          }
        } as never]}
      />
    );

    const gridView = screen.getByRole("button", { name: "Grid view" });
    const listView = screen.getByRole("button", { name: "List view" });
    const card = screen.getByTestId("vault-card-trip-porto");

    expect(gridView.getAttribute("aria-pressed")).toBe("true");
    expect(listView.getAttribute("aria-pressed")).toBe("false");
    expect(card.className).toContain("grid-cols-1");
    expect(screen.getByText("Open export options")).toBeTruthy();
    expect(screen.getByTestId("vault-next-action")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open saved plan" }).getAttribute("href")).toBe("/trip/trip-porto");
    expect(screen.getByRole("link", { name: "Shape another day" }).getAttribute("href")).toBe("/explore");

    fireEvent.click(listView);

    expect(gridView.getAttribute("aria-pressed")).toBe("false");
    expect(listView.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("vault-card-trip-porto").className).toContain("grid-cols-[8rem_minmax(0,1fr)]");

    fireEvent.click(gridView);
    expect(gridView.getAttribute("aria-pressed")).toBe("true");
    expect(card.className).toContain("grid-cols-1");
  });

  it("uses a shared decision state when no saved day exists", () => {
    render(<VaultGallery trips={[]} />);

    const empty = screen.getByTestId("vault-empty");
    expect(empty.getAttribute("data-kind")).toBe("empty");
    expect(empty.getAttribute("data-tone")).toBe("inverse");
    expect(screen.getByRole("heading", { name: "Your vault is empty" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Shape a day" }).getAttribute("href")).toBe("/planner");
    expect(screen.getByRole("link", { name: "Explore activities" }).getAttribute("href")).toBe("/explore");
  });
});
