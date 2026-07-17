/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  loadSessionOutcome: vi.fn(),
  requirePageAccess: vi.fn(),
  requirementForHttpRoute: vi.fn()
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@repo/ui", async () => {
  const React = await import("react");
  return {
    DecisionStatePanel: ({ title }: { title: string }) => React.createElement("h1", null, title),
    OperatorShell: ({ children }: { children: ReactNode }) => React.createElement("main", { id: "main-content" }, children)
  };
});
vi.mock("@/lib/auth/page-access", () => ({
  requirePageAccess: mocks.requirePageAccess,
  requirementForHttpRoute: mocks.requirementForHttpRoute
}));
vi.mock("@/lib/auth/session-outcome", () => ({ loadSessionOutcome: mocks.loadSessionOutcome }));
vi.mock("@/app/_components/route-recovery", () => ({
  RouteRecovery: ({ kind }: { kind: string }) => <div data-testid="route-recovery" data-kind={kind} />
}));

import DeveloperDocsPage from "./page";

afterEach(() => {
  cleanup();
  delete process.env.ENABLE_API_DOCS;
});

const actor = {
  capabilities: ["developer_docs:read"],
  reviewerId: null,
  roles: ["admin"],
  userId: "admin-1"
};

describe("developer docs access boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.ENABLE_API_DOCS = "true";
    mocks.headers.mockResolvedValue({ get: () => "/api/v1/docs" });
    mocks.requirementForHttpRoute.mockReturnValue({ anyRole: ["admin"], allCapabilities: ["developer_docs:read"] });
    mocks.requirePageAccess.mockResolvedValue({ kind: "ready", actor });
    mocks.loadSessionOutcome.mockResolvedValue({
      kind: "ready",
      session: { user: { email: "dev@example.com", id: "admin-1", image: null, name: "Developer" } }
    });
  });

  it("renders documentation inside the shared developer shell", async () => {
    const { container } = render(await DeveloperDocsPage());

    expect(screen.getByTestId("developer-api-docs")).toBeInTheDocument();
    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(mocks.requirePageAccess).toHaveBeenCalledWith({ anyRole: ["admin"], allCapabilities: ["developer_docs:read"] });
  });

  it("does not disclose documentation to a limited operator", async () => {
    mocks.requirePageAccess.mockResolvedValue({ kind: "forbidden" });

    render(await DeveloperDocsPage());

    expect(screen.getByRole("heading", { name: /developer documentation is restricted/i })).toBeInTheDocument();
    expect(screen.queryByTestId("developer-api-docs")).not.toBeInTheDocument();
  });

  it("renders a paused state when the API docs flag is disabled", async () => {
    delete process.env.ENABLE_API_DOCS;

    render(await DeveloperDocsPage());

    expect(screen.getByRole("heading", { name: /api docs are paused/i })).toBeInTheDocument();
    expect(screen.queryByTestId("developer-api-docs")).not.toBeInTheDocument();
  });
});
