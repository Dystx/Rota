import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, loadCurrentAuthorizedActorOutcome, getTripsForUser } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  loadCurrentAuthorizedActorOutcome: vi.fn(),
  getTripsForUser: vi.fn()
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser }));
vi.mock("@/lib/auth/authorization", () => ({ loadCurrentAuthorizedActorOutcome }));
vi.mock("@repo/db", () => ({ getTripsForUser }));
vi.mock("../_components/public-route-layout", () => ({
  PublicRouteLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="public-shell">{children}</div>
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => <a href={href} {...props}>{children}</a>
}));
vi.mock("next/navigation", () => ({
  redirect: (href: string): never => { throw new Error(`REDIRECT:${href}`); }
}));

import ItinerariesPage from "./page";

describe("ItinerariesPage recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadCurrentAuthorizedActorOutcome.mockResolvedValue({ kind: "anonymous" });
    getTripsForUser.mockResolvedValue([]);
  });

  it("renders authored recovery when the session provider is unavailable", async () => {
    getCurrentUser.mockResolvedValue({ outcome: "unavailable", user: null, session: null });

    render(await ItinerariesPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { level: 1, name: "This part of Rumia is temporarily unavailable" })).toBeInTheDocument();
    expect(getTripsForUser).not.toHaveBeenCalled();
  });

  it("passes the ready probe to authorization instead of probing session twice", async () => {
    const sessionOutcome = {
      kind: "ready",
      session: { user: { id: "traveler-1", email: "traveler@example.test" }, session: { id: "session-1" } }
    } as const;
    getCurrentUser.mockResolvedValue({
      outcome: "ready",
      sessionOutcome,
      user: sessionOutcome.session.user,
      session: sessionOutcome.session.session
    });
    loadCurrentAuthorizedActorOutcome.mockResolvedValue({ kind: "anonymous" });

    await ItinerariesPage({ searchParams: Promise.resolve({}) });

    expect(loadCurrentAuthorizedActorOutcome).toHaveBeenCalledOnce();
    expect(loadCurrentAuthorizedActorOutcome).toHaveBeenCalledWith(sessionOutcome);
  });

  it("marks the route as the traveler archive", async () => {
    getCurrentUser.mockResolvedValue({
      outcome: "ready",
      sessionOutcome: { kind: "ready", session: { user: { id: "traveler-1" }, session: { id: "session-1" } } },
      user: { id: "traveler-1", email: "traveler@example.test" },
      session: { id: "session-1" }
    });

    render(await ItinerariesPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByTestId("itineraries-archive")).toBeInTheDocument();
  });

  it("keeps anonymous access as a redirect rather than an outage", async () => {
    getCurrentUser.mockResolvedValue({ outcome: "anonymous", user: null, session: null });

    await expect(ItinerariesPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("REDIRECT:/sign-in?next=%2Fitineraries");
  });
});
