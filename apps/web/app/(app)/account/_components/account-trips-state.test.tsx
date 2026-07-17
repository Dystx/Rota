import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AccountTripsState } from "./account-trips-state";

afterEach(cleanup);

describe("AccountTripsState", () => {
  it("gives a first-visit shelf one clear activity action", () => {
    render(<AccountTripsState />);

    expect(screen.getByTestId("account-trips-empty").getAttribute("data-kind")).toBe("empty");
    expect(screen.getByRole("heading", { name: "Your shelf is ready for a first choice" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Explore activities" }).getAttribute("href")).toBe("/explore");
    expect(screen.queryByRole("link", { name: "Open support" })).toBeNull();
  });

  it("does not disguise a persistence failure as an empty shelf", () => {
    render(<AccountTripsState infoMessage="The saved-plan service is unavailable." />);

    expect(screen.getByTestId("account-trips-unavailable").getAttribute("data-kind")).toBe("unavailable");
    expect(screen.getByRole("heading", { name: "Saved plans are unavailable" })).toBeTruthy();
    expect(screen.getByText("The saved-plan service is unavailable.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open support" }).getAttribute("href")).toBe("/support");
    expect(screen.queryByRole("link", { name: "Explore activities" })).toBeNull();
  });
});
