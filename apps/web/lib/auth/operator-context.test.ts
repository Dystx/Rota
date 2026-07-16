import { describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadCurrentAuthorizedActor: vi.fn()
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => unknown>(fn: T) => {
      let initialized = false;
      let result: unknown;
      return ((...args: Parameters<T>) => {
        if (!initialized) {
          initialized = true;
          result = fn(...args);
        }
        return result;
      }) as T;
    }
  };
});
vi.mock("./authorization", () => ({ loadCurrentAuthorizedActor: mocks.loadCurrentAuthorizedActor }));

import { getAdminPageAuthContext } from "./admin";
import { getReviewerPageAuthContext } from "./reviewer";

describe("operator auth contexts", () => {
  test("share one cached provider result within each admin/reviewer context", async () => {
    mocks.loadCurrentAuthorizedActor.mockResolvedValue({
      kind: "ready",
      actor: {
        capabilities: ["content:manage"],
        reviewerId: "reviewer-123",
        roles: ["admin", "reviewer"],
        userId: "operator-123"
      }
    });

    const adminFirst = await getAdminPageAuthContext();
    const adminSecond = await getAdminPageAuthContext();
    const reviewerFirst = await getReviewerPageAuthContext();
    const reviewerSecond = await getReviewerPageAuthContext();

    expect(adminFirst).toEqual(adminSecond);
    expect(reviewerFirst).toEqual(reviewerSecond);
    expect(mocks.loadCurrentAuthorizedActor).toHaveBeenCalledTimes(2);
  });
});
