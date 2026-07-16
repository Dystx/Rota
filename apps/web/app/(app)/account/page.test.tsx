import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, loadCurrentAuthorizedActorOutcome } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  loadCurrentAuthorizedActorOutcome: vi.fn()
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser }));
vi.mock("@/lib/auth/authorization", () => ({ loadCurrentAuthorizedActorOutcome }));
vi.mock("@repo/db", () => ({
  getTripsForUser: vi.fn(),
  isPersistenceConfigError: vi.fn(() => false)
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
});
