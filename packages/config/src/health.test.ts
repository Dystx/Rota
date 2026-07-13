import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  HEALTH_ENV_VAR_NAMES,
  assertNoSecretLeak,
  formatProviderHealthReport,
  getProviderHealth,
  getProviderHealthReport,
  type ProviderHealth
} from "./health";

const TRACKED = Object.values(HEALTH_ENV_VAR_NAMES);

function snapshotEnv(): Record<string, string | undefined> {
  const snap: Record<string, string | undefined> = {};
  for (const name of TRACKED) snap[name] = process.env[name];
  return snap;
}

function clearTracked(): void {
  for (const name of TRACKED) delete process.env[name];
}

function restoreEnv(snap: Record<string, string | undefined>): void {
  for (const [name, value] of Object.entries(snap)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
}

function setAllConfigured(): void {
  process.env[HEALTH_ENV_VAR_NAMES.openAiApiKey] = "openai-key-placeholder";
  process.env[HEALTH_ENV_VAR_NAMES.stripeSecretKey] = "stripe-secret-placeholder";
  process.env[HEALTH_ENV_VAR_NAMES.stripeWebhookSecret] = "stripe-webhook-placeholder";
  process.env[HEALTH_ENV_VAR_NAMES.stripePublishableKey] = "pk_test_placeholder";
  process.env[HEALTH_ENV_VAR_NAMES.resendApiKey] = "resend-key-placeholder";
  process.env[HEALTH_ENV_VAR_NAMES.posthogKey] = "ph-key-placeholder";
  process.env[HEALTH_ENV_VAR_NAMES.posthogHost] = "https://example.invalid";
  process.env[HEALTH_ENV_VAR_NAMES.mapboxPublicToken] = "pk.placeholder";
  process.env[HEALTH_ENV_VAR_NAMES.databaseUrl] = "postgresql://127.0.0.1/rumia";
  process.env[HEALTH_ENV_VAR_NAMES.betterAuthSecret] = "a-long-placeholder-secret-for-health";
}

function byProvider(list: ProviderHealth[]): (key: ProviderHealth["provider"]) => ProviderHealth {
  const map = new Map<ProviderHealth["provider"], ProviderHealth>();
  for (const entry of list) map.set(entry.provider, entry);
  return (key) => {
    const entry = map.get(key);
    if (!entry) throw new Error(`missing provider in result: ${key}`);
    return entry;
  };
}

describe("getProviderHealth", () => {
  let snap: Record<string, string | undefined>;

  beforeEach(() => {
    snap = snapshotEnv();
    clearTracked();
  });

  afterEach(() => {
    restoreEnv(snap);
  });

  it("reports every provider as missing when no env is set", () => {
    const result = byProvider(getProviderHealth());
    expect(result("stripe").status).toBe("missing");
    expect(result("openai").status).toBe("missing");
    expect(result("resend").status).toBe("missing");
    expect(result("posthog").status).toBe("missing");
    expect(result("mapbox").status).toBe("missing");
    expect(result("postgresql").status).toBe("missing");
    expect(result("worker-queue").status).toBe("missing");
  });

  it("reports every provider as configured when all env is present", () => {
    setAllConfigured();
    const result = byProvider(getProviderHealth());
    expect(result("stripe").status).toBe("configured");
    expect(result("openai").status).toBe("configured");
    expect(result("resend").status).toBe("configured");
    expect(result("posthog").status).toBe("configured");
    expect(result("mapbox").status).toBe("configured");
    expect(result("postgresql").status).toBe("configured");
    expect(result("worker-queue").status).toBe("configured");
  });

  it("marks Mapbox degraded when token does not start with pk.", () => {
    setAllConfigured();
    process.env[HEALTH_ENV_VAR_NAMES.mapboxPublicToken] = "sk.secret_token_placeholder";
    const result = byProvider(getProviderHealth());
    expect(result("mapbox").status).toBe("degraded");
    expect(result("mapbox").hint).not.toContain("sk.secret_token_placeholder");
  });

  it("marks Stripe degraded when publishable key uses sk_ prefix", () => {
    setAllConfigured();
    process.env[HEALTH_ENV_VAR_NAMES.stripePublishableKey] = "sk_test_wrong_prefix";
    const result = byProvider(getProviderHealth());
    expect(result("stripe").status).toBe("degraded");
    expect(result("stripe").hint).not.toContain("sk_test_wrong_prefix");
  });

  it("marks worker-queue missing when PostgreSQL or Resend is missing", () => {
    setAllConfigured();
    delete process.env[HEALTH_ENV_VAR_NAMES.resendApiKey];
    expect(byProvider(getProviderHealth())("worker-queue").status).toBe("missing");
  });

  it("treats whitespace-only env values as missing", () => {
    process.env[HEALTH_ENV_VAR_NAMES.resendApiKey] = "   ";
    expect(byProvider(getProviderHealth())("resend").status).toBe("missing");
  });

  it("requirement field distinguishes required vs optional providers", () => {
    const result = byProvider(getProviderHealth());
    expect(result("stripe").requirement).toBe("required-for-action");
    expect(result("resend").requirement).toBe("required-for-action");
    expect(result("postgresql").requirement).toBe("required-for-action");
    expect(result("worker-queue").requirement).toBe("required-for-action");
    expect(result("mapbox").requirement).toBe("optional");
    expect(result("posthog").requirement).toBe("optional");
  });
});

describe("formatProviderHealthReport redaction", () => {
  let snap: Record<string, string | undefined>;

  beforeEach(() => {
    snap = snapshotEnv();
    clearTracked();
  });

  afterEach(() => {
    restoreEnv(snap);
  });

  it("never leaks secret-shaped values, even when env contains realistic placeholders", () => {
    process.env[HEALTH_ENV_VAR_NAMES.stripeSecretKey] = "sk_test_AAAAAAAAAAAAAAAA";
    process.env[HEALTH_ENV_VAR_NAMES.stripeWebhookSecret] = "whsec_BBBBBBBBBBBBBBBB";
    process.env[HEALTH_ENV_VAR_NAMES.stripePublishableKey] = "pk_test_CCCCCCCCCCCCCCCC";
    process.env[HEALTH_ENV_VAR_NAMES.resendApiKey] = "re_DDDDDDDDDDDDDDDD";
    process.env[HEALTH_ENV_VAR_NAMES.posthogKey] = "phc_EEEEEEEEEEEEEEEE";
    process.env[HEALTH_ENV_VAR_NAMES.posthogHost] = "https://example.invalid";
    process.env[HEALTH_ENV_VAR_NAMES.mapboxPublicToken] = "pk.FFFFFFFFFFFFFFFF";
    process.env[HEALTH_ENV_VAR_NAMES.databaseUrl] = "postgresql://127.0.0.1/rumia";
    process.env[HEALTH_ENV_VAR_NAMES.betterAuthSecret] = "a-long-placeholder-secret-for-health";

    const report = getProviderHealthReport(new Date("2026-05-02T00:00:00.000Z"));
    const text = formatProviderHealthReport(report);

    expect(report.generatedAt).toBe("2026-05-02T00:00:00.000Z");
    expect(() => assertNoSecretLeak(text)).not.toThrow();
    expect(text).not.toContain("sk_test_AAAA");
    expect(text).not.toContain("whsec_BBBB");
    expect(text).not.toContain("postgresql://127.0.0.1");
    expect(text).not.toContain("pk.FFFF");
    expect(text).not.toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
  });

  it("assertNoSecretLeak detects leaked tokens", () => {
    expect(() => assertNoSecretLeak("hello sk_test_AAAAAAAAAAAA world")).toThrow();
    expect(() => assertNoSecretLeak("token: whsec_BBBBBBBBBBBB")).toThrow();
    expect(() => assertNoSecretLeak("Authorization: Bearer abcdefghij")).toThrow();
    expect(() => assertNoSecretLeak("mapbox: sk.DDDDDDDDDDDD")).toThrow();
    expect(() => assertNoSecretLeak("mapbox: pk.EEEEEEEEEEEE")).toThrow();
  });

  it("assertNoSecretLeak passes on hint text that only references env var names and shape rules", () => {
    const safe = "Mapbox is optional; set NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN (must start with pk.) to enable.";
    expect(() => assertNoSecretLeak(safe)).not.toThrow();
  });
});
