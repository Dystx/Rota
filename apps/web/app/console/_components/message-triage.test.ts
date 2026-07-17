import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  consumePostgresTriageToken: vi.fn(),
  getAdminPageAuthContext: vi.fn(),
  isAdminPageAuthContext: vi.fn(),
  isPersistenceConfigError: vi.fn(() => false),
  isSchemaDriftError: vi.fn(() => false),
  isSessionProviderFailure: vi.fn(() => false),
  keywordTriage: vi.fn(),
  safeParse: vi.fn(),
  triageWithFallback: vi.fn()
}));

vi.mock("@repo/ai", () => ({
  TriageInputSchema: { safeParse: mocks.safeParse },
  consumePostgresTriageToken: mocks.consumePostgresTriageToken,
  keywordTriage: mocks.keywordTriage,
  triageWithFallback: mocks.triageWithFallback
}));
vi.mock("@repo/db", () => ({
  consumePostgresTriageToken: mocks.consumePostgresTriageToken,
  isPersistenceConfigError: mocks.isPersistenceConfigError,
  isSchemaDriftError: mocks.isSchemaDriftError
}));
vi.mock("@/lib/auth/admin", () => ({
  getAdminPageAuthContext: mocks.getAdminPageAuthContext,
  isAdminPageAuthContext: mocks.isAdminPageAuthContext
}));
vi.mock("@/lib/auth/session-outcome", () => ({
  isSessionProviderFailure: mocks.isSessionProviderFailure
}));

import { triageInboundMessage } from "./message-triage";

describe("triageInboundMessage access boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.isPersistenceConfigError.mockReturnValue(false);
    mocks.isSchemaDriftError.mockReturnValue(false);
    mocks.isSessionProviderFailure.mockReturnValue(false);
    mocks.isAdminPageAuthContext.mockReturnValue(true);
    mocks.getAdminPageAuthContext.mockResolvedValue({
      actor: { capabilities: ["operations:manage"], reviewerId: null, roles: ["admin"], userId: "admin-1" },
      role: "admin",
      userId: "admin-1"
    });
    mocks.safeParse.mockReturnValue({ success: true, data: { body: "Need a taxi", conversationId: "conversation-1" } });
    mocks.keywordTriage.mockReturnValue({ confidence: 0.7, rationale: "keyword", tier: "logistical" });
    mocks.consumePostgresTriageToken.mockResolvedValue(false);
  });

  it("denies unauthenticated calls before parsing or AI work", async () => {
    mocks.getAdminPageAuthContext.mockResolvedValue({ reason: "unauthenticated", status: 401 });
    mocks.isAdminPageAuthContext.mockReturnValue(false);

    await expect(triageInboundMessage({ hostile: "payload" })).resolves.toEqual({
      kind: "unauthenticated",
      message: "Authentication required."
    });
    expect(mocks.safeParse).not.toHaveBeenCalled();
    expect(mocks.keywordTriage).not.toHaveBeenCalled();
  });

  it("keeps provider failure distinct", async () => {
    mocks.getAdminPageAuthContext.mockResolvedValue({ reason: "unavailable", status: 503 });
    mocks.isAdminPageAuthContext.mockReturnValue(false);

    await expect(triageInboundMessage({ hostile: "payload" })).resolves.toMatchObject({
      kind: "unavailable",
      retryable: true
    });
    expect(mocks.safeParse).not.toHaveBeenCalled();
  });

  it("returns a typed result for an authorized operator", async () => {
    await expect(triageInboundMessage({ body: "Need a taxi", conversationId: "conversation-1" })).resolves.toEqual({
      kind: "ok",
      result: { confidence: 0.7, rationale: "keyword (LLM path rate-limited; keyword fallback in use)", tier: "logistical" }
    });
    expect(mocks.keywordTriage).toHaveBeenCalledOnce();
  });

  it("sanitizes invalid input after authorization", async () => {
    mocks.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: "secret schema detail" }] } });

    await expect(triageInboundMessage({ body: "not enough" })).resolves.toEqual({
      kind: "error",
      message: "Invalid triage input."
    });
    expect(mocks.keywordTriage).not.toHaveBeenCalled();
  });
});
