import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("Better Auth PostgreSQL adapter", () => {
  let auth: typeof import("./server").auth;
  let closePool: (() => Promise<void>) | null = null;
  let ownerPool: import("pg").Pool | null = null;

  beforeAll(async () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://127.0.0.1:3105";
    process.env.DATABASE_URL = "postgresql:///rumia?user=rumia_app";
    process.env.BETTER_AUTH_SECRET = "local-test-secret-that-is-at-least-32-characters";

    ({ auth } = await import("./server"));
    const { getDatabasePool } = await import("@repo/db/connection");
    closePool = () => getDatabasePool().end();
    const { Pool } = await import("pg");
    ownerPool = new Pool({ connectionString: "postgresql:///rumia?user=rumia_owner", max: 1 });
  });

  afterAll(async () => {
    await ownerPool?.query("delete from authn.user where email = $1", ["better-auth-hook@example.test"]);
    await ownerPool?.end();
    await closePool?.();
  });

  it("returns null for a request without a session", async () => {
    await expect(auth.api.getSession({ headers: new Headers() })).resolves.toBeNull();
  });

  it("rejects a forged session cookie", async () => {
    await expect(
      auth.api.getSession({ headers: new Headers({ cookie: "better-auth.session_token=forged-token" }) })
    ).resolves.toBeNull();
  });

  it("creates a default traveler profile after signup", async () => {
    const result = await auth.api.signUpEmail({
      body: {
        email: "better-auth-hook@example.test",
        name: "Hook Traveler",
        password: "a-valid-password-123"
      },
      headers: new Headers({ origin: "http://127.0.0.1:3105" })
    });

    expect(result.user.email).toBe("better-auth-hook@example.test");
    const profile = await ownerPool?.query<{ app_role: string }>("select app_role from app.user_profiles where user_id = $1", [result.user.id]);
    expect(profile?.rows).toEqual([{ app_role: "traveler" }]);
  });
});
