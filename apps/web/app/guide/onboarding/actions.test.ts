import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSpecialistCapabilities: vi.fn(),
  isPersistenceConfigError: vi.fn(() => false),
  isSchemaDriftError: vi.fn(() => false),
  isSessionProviderFailure: vi.fn(() => false),
  loadCurrentAuthorizedActor: vi.fn(),
  loadSessionOutcome: vi.fn(),
  revalidatePath: vi.fn(),
  setSpecialistCapabilities: vi.fn(),
  upsertSpecialistProfile: vi.fn()
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/authorization", () => ({
  loadCurrentAuthorizedActor: mocks.loadCurrentAuthorizedActor
}));
vi.mock("@/lib/auth/session-outcome", () => ({
  isSessionProviderFailure: mocks.isSessionProviderFailure,
  loadSessionOutcome: mocks.loadSessionOutcome
}));
vi.mock("@repo/db", () => ({
  getSpecialistCapabilities: mocks.getSpecialistCapabilities,
  isPersistenceConfigError: mocks.isPersistenceConfigError,
  isSchemaDriftError: mocks.isSchemaDriftError,
  setSpecialistCapabilities: mocks.setSpecialistCapabilities,
  upsertSpecialistProfile: mocks.upsertSpecialistProfile
}));

import { submitSpecialistProfile } from "./actions";

const userId = "11111111-1111-4111-8111-111111111111";
const actor = {
  capabilities: [],
  reviewerId: null,
  roles: ["traveler"],
  userId
} as const;
const input = {
  bio: null,
  fullName: "Ana Silva",
  hourlyRate: 0,
  languages: [],
  photoPath: "",
  regionsCovered: [],
  rnaatLicenseNumber: null,
  skills: [],
  tier3OnCall: false,
  tier4LicensedGuide: false
};

describe("submitSpecialistProfile recovery", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.isPersistenceConfigError.mockReturnValue(false);
    mocks.isSchemaDriftError.mockReturnValue(false);
    mocks.isSessionProviderFailure.mockReturnValue(false);
    mocks.loadSessionOutcome.mockResolvedValue({
      kind: "ready",
      session: { user: { id: userId }, session: { id: "session-1" } }
    });
    mocks.loadCurrentAuthorizedActor.mockResolvedValue({ kind: "ready", actor });
  });

  test("sanitizes hostile persistence/provider errors into a retryable result", async () => {
    const hostile = Object.assign(
      new Error("DATABASE_URL=postgresql://secret ECONNREFUSED SQL stack"),
      { code: "ECONNREFUSED" }
    );
    mocks.upsertSpecialistProfile.mockRejectedValue(hostile);
    mocks.isSessionProviderFailure.mockReturnValue(true);

    const result = await submitSpecialistProfile(input);

    expect(result).toEqual({
      kind: "unavailable",
      message: "This service is temporarily unavailable. Please try again shortly.",
      retryable: true,
      status: 503
    });
    expect(JSON.stringify(result)).not.toMatch(/DATABASE_URL|ECONN|SQL|stack/i);
  });

  test("keeps unknown programming failures on the normal boundary", async () => {
    const failure = new Error("Unexpected onboarding invariant");
    mocks.upsertSpecialistProfile.mockRejectedValue(failure);

    await expect(submitSpecialistProfile(input)).rejects.toThrow("Unexpected onboarding invariant");
  });
});
