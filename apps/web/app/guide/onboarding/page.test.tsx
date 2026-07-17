import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSpecialistProfileByUserId: vi.fn(),
  getSessionOutcome: vi.fn(),
  isFeatureEnabled: vi.fn(),
  isPersistenceConfigError: vi.fn(() => false),
  isSchemaDriftError: vi.fn(() => false),
  isSessionProviderFailure: vi.fn(() => false),
  loadCurrentAuthorizedActorOutcome: vi.fn(),
  loadSpecialistCapabilities: vi.fn()
}));

vi.mock("@repo/config", () => ({ isFeatureEnabled: mocks.isFeatureEnabled }));
vi.mock("@repo/db", () => ({
  getSpecialistProfileByUserId: mocks.getSpecialistProfileByUserId,
  isPersistenceConfigError: mocks.isPersistenceConfigError,
  isSchemaDriftError: mocks.isSchemaDriftError
}));
vi.mock("@/lib/auth/session-outcome", () => ({
  isSessionProviderFailure: mocks.isSessionProviderFailure,
  loadSessionOutcome: mocks.getSessionOutcome
}));
vi.mock("@/lib/auth/authorization", () => ({
  loadCurrentAuthorizedActorOutcome: mocks.loadCurrentAuthorizedActorOutcome
}));
vi.mock("next/navigation", () => ({
  redirect: (href: string): never => { throw new Error(`REDIRECT:${href}`); }
}));
vi.mock("./actions", () => ({
  loadSpecialistCapabilities: mocks.loadSpecialistCapabilities
}));
vi.mock("./_components/guide-onboarding-form", () => ({
  GuideOnboardingForm: ({ initialProfile, initialCapabilities }: { initialProfile: { id: string } | null; initialCapabilities: { skills: readonly string[] } }) => (
    <div
      data-testid="guide-onboarding-form"
      data-profile={initialProfile ? "saved" : "new"}
      data-skill-count={initialCapabilities.skills.length}
    />
  )
}));
vi.mock("../../_components/beta-unavailable", () => ({
  BetaUnavailablePanel: ({ title }: { title: string }) => <div data-testid="beta-unavailable">{title}</div>
}));
vi.mock("../../_components/route-recovery", () => ({
  RouteRecovery: ({ kind }: { kind: string }) => <div data-testid="route-recovery" data-kind={kind} />
}));

import GuideOnboardingPage from "./page";

const readySession = {
  kind: "ready" as const,
  session: { user: { id: "specialist-1", email: "guide@example.test" }, session: { id: "session-1" } }
};
const readyActor = {
  kind: "ready" as const,
  actor: { userId: "specialist-1", roles: ["specialist"], capabilities: [], reviewerId: null }
};

describe("GuideOnboardingPage states", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isFeatureEnabled.mockReturnValue(true);
    mocks.getSessionOutcome.mockResolvedValue(readySession);
    mocks.loadCurrentAuthorizedActorOutcome.mockResolvedValue(readyActor);
    mocks.getSpecialistProfileByUserId.mockResolvedValue(null);
    mocks.loadSpecialistCapabilities.mockResolvedValue({ skills: [], languages: [] });
    mocks.isPersistenceConfigError.mockReturnValue(false);
    mocks.isSchemaDriftError.mockReturnValue(false);
    mocks.isSessionProviderFailure.mockReturnValue(false);
  });

  it("stops at the private-beta panel before probing auth", async () => {
    mocks.isFeatureEnabled.mockReturnValue(false);

    render(await GuideOnboardingPage());

    expect(screen.getByTestId("beta-unavailable")).toBeInTheDocument();
    expect(mocks.getSessionOutcome).not.toHaveBeenCalled();
  });

  it("preserves the exact signed-out return path", async () => {
    mocks.getSessionOutcome.mockResolvedValue({ kind: "anonymous" });

    await expect(GuideOnboardingPage()).rejects.toThrow("REDIRECT:/sign-in?next=/guide/onboarding");
  });

  it("renders a new specialist candidate without a profile read for capabilities", async () => {
    render(await GuideOnboardingPage());

    expect(screen.getByTestId("guide-onboarding-form")).toHaveAttribute("data-profile", "new");
    expect(screen.getByTestId("guide-onboarding-form")).toHaveAttribute("data-skill-count", "0");
    expect(mocks.loadSpecialistCapabilities).not.toHaveBeenCalled();
  });

  it("seeds a saved specialist candidate with stored capabilities", async () => {
    mocks.getSpecialistProfileByUserId.mockResolvedValue({ id: "profile-1" });
    mocks.loadSpecialistCapabilities.mockResolvedValue({ skills: ["food"], languages: ["pt"] });

    render(await GuideOnboardingPage());

    expect(screen.getByTestId("guide-onboarding-form")).toHaveAttribute("data-profile", "saved");
    expect(screen.getByTestId("guide-onboarding-form")).toHaveAttribute("data-skill-count", "1");
  });

  it("renders typed recovery for unavailable sessions and read errors", async () => {
    mocks.getSessionOutcome.mockResolvedValue({ kind: "unavailable" });
    render(await GuideOnboardingPage());
    expect(screen.getByTestId("route-recovery")).toHaveAttribute("data-kind", "unavailable");

    cleanup();
    mocks.getSessionOutcome.mockResolvedValue(readySession);
    mocks.getSpecialistProfileByUserId.mockRejectedValue(new Error("profile read failed"));
    render(await GuideOnboardingPage());
    expect(screen.getByTestId("route-recovery")).toHaveAttribute("data-kind", "error");
  });
});
