import { describe, expect, it } from "vitest";
import {
  getOrgIdFromSession,
  getOrgIdFromUser
} from "./org-id";
import type { AuthSessionLike, AuthUserLike } from "./org-id";

function makeSession(orgId: string | null): AuthSessionLike {
  return {
    access_token: "test",
    refresh_token: "test",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user: {
      id: "user-1",
      aud: "authenticated",
      role: "authenticated",
      email: "test@example.com",
      app_metadata: { org_id: orgId },
      user_metadata: {},
      created_at: new Date().toISOString()
    }
  };
}

function makeUser(orgId: string | null): AuthUserLike {
  return {
    id: "user-1",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: { org_id: orgId },
    user_metadata: {},
    email: "test@example.com",
    created_at: new Date().toISOString()
  };
}

describe("org-id helpers (Phase 8)", () => {
  it("returns the org_id from a session with a B2B claim", () => {
    expect(getOrgIdFromSession(makeSession("org-abc-123"))).toBe("org-abc-123");
  });

  it("returns null for a consumer session (no org claim)", () => {
    expect(getOrgIdFromSession(makeSession(null))).toBeNull();
  });

  it("returns null when session is missing", () => {
    expect(getOrgIdFromSession(null)).toBeNull();
    expect(getOrgIdFromSession(undefined)).toBeNull();
  });

  it("returns the org_id from a user object", () => {
    expect(getOrgIdFromUser(makeUser("org-xyz-789"))).toBe("org-xyz-789");
  });

  it("returns null for a consumer user", () => {
    expect(getOrgIdFromUser(makeUser(null))).toBeNull();
  });

  it("returns null when user is missing", () => {
    expect(getOrgIdFromUser(null)).toBeNull();
    expect(getOrgIdFromUser(undefined)).toBeNull();
  });
});
