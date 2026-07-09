import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MobilityTiles } from "./mobility-tiles";

vi.mock("next/link", () => ({ default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => <a href={href} {...props}>{children}</a> }));
afterEach(cleanup);

describe("MobilityTiles", () => {
  it("renders the trip's existing transport and consequences", () => {
    render(<MobilityTiles initialChoice="car" />);
    expect(screen.getByRole("radio", { name: /drive between regions/i }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByText(/42 min typical drive/i)).toBeTruthy();
    expect(screen.getByText(/parking and winding roads/i)).toBeTruthy();
  });

  it("selects transit with keyboard and reports the choice", async () => {
    const onChoiceChange = vi.fn().mockResolvedValue(undefined);
    render(<MobilityTiles initialChoice="car" onChoiceChange={onChoiceChange} />);
    const transit = screen.getByRole("radio", { name: /train, transit/i });
    transit.focus();
    fireEvent.keyDown(transit, { key: "Enter" });
    await waitFor(() => expect(onChoiceChange).toHaveBeenCalledWith("transit"));
    expect(transit.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByText(/68 min typical travel/i)).toBeTruthy();
  });

  it("keeps the optimistic selection and offers retry after an update failure", async () => {
    const onChoiceChange = vi.fn().mockRejectedValue(new Error("offline"));
    render(<MobilityTiles initialChoice="transit" onChoiceChange={onChoiceChange} />);
    fireEvent.click(screen.getByRole("radio", { name: /drive between regions/i }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/couldn't update/i);
    expect(screen.getByRole("radio", { name: /drive between regions/i }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onChoiceChange).toHaveBeenCalledTimes(2);
  });
});
