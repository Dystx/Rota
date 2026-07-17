import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getOrgBySlug: vi.fn(),
  isFeatureEnabled: vi.fn()
}));

vi.mock("@repo/config", () => ({ isFeatureEnabled: mocks.isFeatureEnabled }));
vi.mock("@repo/db", () => ({ getOrgBySlug: mocks.getOrgBySlug }));
vi.mock("@/app/_components/public-route-layout", () => ({
  PublicRouteLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="public-route-layout">{children}</div>
}));
vi.mock("../_components/public-route-layout", () => ({
  PublicRouteLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="public-route-layout">{children}</div>
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => <a href={href} {...props}>{children}</a>
}));

import B2bIndex from "./page";
import B2BLandingPage from "./[orgSlug]/page";

describe("B2B access boundaries", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isFeatureEnabled.mockReturnValue(true);
  });

  it("keeps the index at a generic eligibility gateway", () => {
    render(B2bIndex());

    expect(screen.getByRole("heading", { name: /partner workspace access/i })).toBeInTheDocument();
    expect(mocks.getOrgBySlug).not.toHaveBeenCalled();
  });

  it("does not resolve or disclose an organization before membership authorization", async () => {
    render(await B2BLandingPage({ params: Promise.resolve({ orgSlug: "secret-org" }) }));

    expect(screen.getByRole("heading", { name: /workspace is not available/i })).toBeInTheDocument();
    expect(screen.queryByText(/secret-org|acme|branding|slug|organization name/i)).not.toBeInTheDocument();
    expect(mocks.getOrgBySlug).not.toHaveBeenCalled();
  });

  it("keeps disabled workspaces generic too", async () => {
    mocks.isFeatureEnabled.mockReturnValue(false);

    render(await B2BLandingPage({ params: Promise.resolve({ orgSlug: "secret-org" }) }));

    expect(screen.getByRole("heading", { name: /partner workspaces are in private beta/i })).toBeInTheDocument();
    expect(mocks.getOrgBySlug).not.toHaveBeenCalled();
  });
});
