import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createPublicConfig } from "./public";
import { createServerConfig } from "./server";

const names = [
  "MAPBOX_SECRET_KEY",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN",
  "NEXT_PUBLIC_POSTHOG_HOST",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "RESEND_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY"
] as const;

let snapshot: Record<(typeof names)[number], string | undefined>;

beforeEach(() => {
  snapshot = Object.fromEntries(names.map((name) => [name, process.env[name]])) as typeof snapshot;
  for (const name of names) delete process.env[name];
  process.env.NEXT_PUBLIC_APP_URL = "http://127.0.0.1:3105";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
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

  it("requires only Supabase persistence credentials for the shared server client", () => {
    expect(createServerConfig()).toMatchObject({
      resend: { apiKey: undefined },
      stripe: { publishableKey: undefined, secretKey: undefined, webhookSecret: undefined }
    });
  });
});
