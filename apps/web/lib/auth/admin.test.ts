import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadCurrentAuthorizedActor: vi.fn()
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => unknown>(fn: T) => {
      const results = new Map<string, unknown>();
      return ((...args: Parameters<T>) => {
        const key = JSON.stringify(args);
        if (!results.has(key)) results.set(key, fn(...args));
        return results.get(key);
      }) as T;
    }
  };
});
vi.mock("./authorization", () => ({
  loadCurrentAuthorizedActor: mocks.loadCurrentAuthorizedActor
}));

import { getAdminPageAuthContext } from "./admin";

describe("admin page access context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires a matching capability in addition to the admin role", async () => {
    mocks.loadCurrentAuthorizedActor.mockResolvedValue({
      kind: "ready",
      actor: {
        userId: "admin-1",
        roles: ["admin"],
        capabilities: [],
        reviewerId: null
      }
    });

    await expect(getAdminPageAuthContext({ allCapabilities: ["analytics:read"] })).resolves.toEqual({
      reason: "forbidden",
      status: 403
    });
  });

  it("preserves unavailable as a retryable provider state", async () => {
    mocks.loadCurrentAuthorizedActor.mockResolvedValue({ kind: "unavailable" });

    await expect(getAdminPageAuthContext()).resolves.toEqual({
      reason: "unavailable",
      status: 503
    });
  });
});
