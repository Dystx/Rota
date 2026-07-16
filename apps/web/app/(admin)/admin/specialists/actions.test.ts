import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminPageAuthContext: vi.fn(),
  isAdminPageAuthContext: vi.fn(),
  isPersistenceConfigError: vi.fn(() => false),
  isSessionProviderFailure: vi.fn(() => false),
  revalidatePath: vi.fn(),
  setSpecialistVerified: vi.fn()
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@repo/db", () => ({
  isPersistenceConfigError: mocks.isPersistenceConfigError,
  setSpecialistVerified: mocks.setSpecialistVerified
}));
vi.mock("@/lib/auth/admin", () => ({
  getAdminPageAuthContext: mocks.getAdminPageAuthContext,
  isAdminPageAuthContext: mocks.isAdminPageAuthContext
}));
vi.mock("@/lib/auth/session-outcome", () => ({
  isSessionProviderFailure: mocks.isSessionProviderFailure
}));

import { flipVerification } from "./actions";

const actor = {
  capabilities: ["specialists:verify"],
  reviewerId: null,
  roles: ["admin"],
  userId: "admin-user-123"
} as const;
const input = { specialistId: "123e4567-e89b-12d3-a456-426614174000", verified: true };

describe("flipVerification", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.isAdminPageAuthContext.mockImplementation((value: unknown) => Boolean(value && typeof value === "object" && "actor" in value));
  });

  test("returns a retryable 503 when the auth provider is unavailable", async () => {
    mocks.getAdminPageAuthContext.mockResolvedValue({ reason: "unavailable", status: 503 });

    await expect(flipVerification(input)).resolves.toEqual({
      kind: "unavailable",
      message: "This service is temporarily unavailable. Please try again.",
      retryable: true,
      status: 503
    });
    expect(mocks.setSpecialistVerified).not.toHaveBeenCalled();
  });

  test("preserves the admin-only result for an authenticated non-admin", async () => {
    mocks.getAdminPageAuthContext.mockResolvedValue({ reason: "forbidden", status: 403 });

    await expect(flipVerification(input)).resolves.toEqual({ kind: "error", message: "Admin only" });
    expect(mocks.setSpecialistVerified).not.toHaveBeenCalled();
  });

  test("uses the already-authorized actor for the update", async () => {
    mocks.getAdminPageAuthContext.mockResolvedValue({ actor, role: "admin", userId: actor.userId });
    mocks.setSpecialistVerified.mockResolvedValue({ id: input.specialistId });

    await expect(flipVerification(input)).resolves.toEqual({ kind: "ok", id: input.specialistId });
    expect(mocks.setSpecialistVerified).toHaveBeenCalledWith(input.specialistId, true, { actor });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/specialists");
  });
});
