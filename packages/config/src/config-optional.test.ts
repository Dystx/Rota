import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createPublicConfig } from "./public";
import { createServerAuthConfig, createServerConfig, createServerDatabaseConfig, getOptionalRumiaMapStyleUrl } from "./server";

const names = [
  "MAPBOX_SECRET_KEY",
  "BETTER_AUTH_SECRET",
  "DATABASE_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN",
  "RUMIA_MAP_STYLE_URL",
  "NEXT_PUBLIC_POSTHOG_HOST",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "RESEND_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
] as const;

let snapshot: Record<(typeof names)[number], string | undefined>;

beforeEach(() => {
  snapshot = Object.fromEntries(names.map((name) => [name, process.env[name]])) as typeof snapshot;
  for (const name of names) delete process.env[name];
  process.env.NEXT_PUBLIC_APP_URL = "http://127.0.0.1:3105";
});

afterEach(() => {
  for (const name of names) {
    const value = snapshot[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

describe("optional provider configuration", () => {
  it("allows public routes to boot without optional provider credentials", () => {
    expect(createPublicConfig()).toMatchObject({
      mapbox: { publicToken: undefined },
      posthog: { host: undefined, key: undefined },
      stripe: { publishableKey: undefined }
    });
  });

  it("keeps optional providers separate from private PostgreSQL persistence", () => {
    expect(createServerConfig()).toMatchObject({
      resend: { apiKey: undefined },
      stripe: { publishableKey: undefined, secretKey: undefined, webhookSecret: undefined }
    });
  });

  it("reads the optional reviewed map style URL without requiring other providers", () => {
    process.env.RUMIA_MAP_STYLE_URL = "http://127.0.0.1:3010/portugal-style.json";

    expect(getOptionalRumiaMapStyleUrl()).toBe("http://127.0.0.1:3010/portugal-style.json");
  });

  it("boots server configuration without optional provider credentials", () => {
    expect(createServerConfig()).toMatchObject({
      appUrl: "http://127.0.0.1:3105",
      resend: { apiKey: undefined },
      stripe: { publishableKey: undefined, secretKey: undefined, webhookSecret: undefined }
    });
  });

  it("keeps database and Better Auth credentials server-only", () => {
    process.env.DATABASE_URL = "postgresql://rumia_app:test@127.0.0.1:5432/rumia";
    process.env.BETTER_AUTH_SECRET = "a-test-secret-that-is-never-public";

    expect(createServerDatabaseConfig()).toEqual({
      databaseUrl: "postgresql://rumia_app:test@127.0.0.1:5432/rumia"
    });
    expect(createServerAuthConfig()).toEqual({
      betterAuthSecret: "a-test-secret-that-is-never-public"
    });
  });

  it("rejects a Better Auth secret shorter than the adapter minimum", () => {
    process.env.BETTER_AUTH_SECRET = "too-short";

    expect(() => createServerAuthConfig()).toThrow("BETTER_AUTH_SECRET must be at least 32 characters.");
  });
});
