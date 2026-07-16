import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, loadCurrentAuthorizedActorOutcome, getTripsForUser } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  loadCurrentAuthorizedActorOutcome: vi.fn(),
  getTripsForUser: vi.fn()
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser }));
vi.mock("@/lib/auth/authorization", () => ({ loadCurrentAuthorizedActorOutcome }));
vi.mock("@repo/db", () => ({
  getTripsForUser
}));
vi.mock("./_actions/sign-out", () => ({ signOutAction: vi.fn() }));
vi.mock("./_components/trip-card", () => ({ AccountTripCard: () => null }));
vi.mock("./_components/behavior-consent-toggle", () => ({ BehaviorConsentToggle: () => null }));
vi.mock("./_components/sign-out-button", () => ({ SignOutButton: () => null }));
vi.mock("next/navigation", () => ({
  redirect: (href: string): never => { throw new Error(`REDIRECT:${href}`); }
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => <a href={href} {...props}>{children}</a>
}));

import AccountPage from "./page";

describe("AccountPage recovery", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders content recovery when persistence is unavailable", async () => {
    getCurrentUser.mockResolvedValue({ outcome: "unavailable", user: null, session: null });

    render(await AccountPage());

    expect(screen.getByRole("heading", { level: 1, name: "This part of Rumia is temporarily unavailable" })).toBeInTheDocument();
    expect(loadCurrentAuthorizedActorOutcome).not.toHaveBeenCalled();
  });

  it("keeps anonymous account access as an auth redirect", async () => {
    getCurrentUser.mockResolvedValue({ outcome: "anonymous", user: null, session: null });

    await expect(AccountPage()).rejects.toThrow("REDIRECT:/sign-in?next=%2Faccount");
  });

  it("reuses the ready session probe for authorization", async () => {
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

    await AccountPage();

    expect(loadCurrentAuthorizedActorOutcome).toHaveBeenCalledOnce();
    expect(loadCurrentAuthorizedActorOutcome).toHaveBeenCalledWith(sessionOutcome);
  });

  it("sanitizes hostile saved-trip failures into typed recovery", async () => {
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
    loadCurrentAuthorizedActorOutcome.mockResolvedValue({
      kind: "ready",
      actor: { userId: "traveler-1", roles: ["traveler"], capabilities: [], reviewerId: null }
    });
    getTripsForUser.mockRejectedValue(new Error("DATABASE_URL=postgresql://secret ECONNREFUSED stack SQL"));

    render(await AccountPage());

    expect(screen.getByRole("heading", { level: 1, name: "This part of Rumia is temporarily unavailable" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.queryByText(/DATABASE_URL|ECONNREFUSED|stack|SQL/i)).not.toBeInTheDocument();
  });
});
