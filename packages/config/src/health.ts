/**
 * Provider health checks and graceful-degradation status report.
 *
 * Reads only env var presence and shape (e.g. `pk.*` prefix for Mapbox public
 * tokens). Never returns secret values, token fragments, request headers, or
 * provider API responses. Safe to log, surface in admin pages, or persist as
 * evidence.
 *
 * Status semantics:
 * - `configured`: env var present and (where applicable) shape-valid.
 * - `missing`:    env var absent or empty.
 * - `degraded`:   env var present but shape-invalid (e.g. Mapbox `sk.*`,
 *                 publishable key looking like a secret) — provider must not
 *                 be used; UI falls back.
 *
 * Required-for-actions providers (Stripe, Resend, PostgreSQL, worker queue) are
 * marked `missing` when absent; they MUST gate the relevant action paths but
 * MUST NOT block app boot or marketing routes.
 *
 * Optional providers (Mapbox, PostHog) degrade gracefully when missing.
 */

declare const process: {
  env: Record<string, string | undefined>;
};

export type HealthProvider =
  | "openai"
  | "stripe"
  | "resend"
  | "posthog"
  | "mapbox"
  | "postgresql"
  | "worker-queue";

export type HealthStatus = "configured" | "missing" | "degraded";

export type HealthRequirement = "required-for-action" | "optional";

export type ProviderHealth = {
  provider: HealthProvider;
  status: HealthStatus;
  requirement: HealthRequirement;
  /** Short, secret-free, human-readable hint. Never includes env values. */
  hint: string;
};

export type ProviderHealthReport = {
  generatedAt: string;
  providers: ProviderHealth[];
};

/**
 * Names of env vars referenced by the health check. Never their values.
 * Exported so callers (CLI, tests) can describe coverage without hardcoding.
 */
export const HEALTH_ENV_VAR_NAMES = {
  mapboxPublicToken: "NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN",
  openAiApiKey: "OPENAI_API_KEY",
  posthogHost: "NEXT_PUBLIC_POSTHOG_HOST",
  posthogKey: "NEXT_PUBLIC_POSTHOG_KEY",
  resendApiKey: "RESEND_API_KEY",
  stripePublishableKey: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  stripeSecretKey: "STRIPE_SECRET_KEY",
  stripeWebhookSecret: "STRIPE_WEBHOOK_SECRET",
  databaseUrl: "DATABASE_URL",
  betterAuthSecret: "BETTER_AUTH_SECRET"
} as const;

function readEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function checkStripe(): ProviderHealth {
  const secret = readEnv(HEALTH_ENV_VAR_NAMES.stripeSecretKey);
  const webhook = readEnv(HEALTH_ENV_VAR_NAMES.stripeWebhookSecret);
  const publishable = readEnv(HEALTH_ENV_VAR_NAMES.stripePublishableKey);
  const requirement: HealthRequirement = "required-for-action";

  if (!secret || !webhook || !publishable) {
    return {
      provider: "stripe",
      requirement,
      status: "missing",
      hint: "Stripe checkout and webhook handling are gated; set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY."
    };
  }

  // Shape sanity: publishable key must look publishable, not secret.
  // Stripe publishable keys begin with `pk_`; secret keys begin with `sk_`.
  if (publishable.startsWith("sk_")) {
    return {
      provider: "stripe",
      requirement,
      status: "degraded",
      hint: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY appears to be a secret key (sk_ prefix); replace it with a pk_ publishable key."
    };
  }

  return {
    provider: "stripe",
    requirement,
    status: "configured",
    hint: "Stripe secret, webhook, and publishable env vars are present."
  };
}

function checkOpenAi(): ProviderHealth {
  const key = readEnv(HEALTH_ENV_VAR_NAMES.openAiApiKey);
  const requirement: HealthRequirement = "required-for-action";

  if (!key) {
    return {
      provider: "openai",
      requirement,
      status: "missing",
      hint: "Custom phrase interpretation is gated; set OPENAI_API_KEY server-side. Deterministic choices remain available."
    };
  }

  return {
    provider: "openai",
    requirement,
    status: "configured",
    hint: "OPENAI_API_KEY is present."
  };
}

function checkResend(): ProviderHealth {
  const key = readEnv(HEALTH_ENV_VAR_NAMES.resendApiKey);
  const requirement: HealthRequirement = "required-for-action";
  if (!key) {
    return {
      provider: "resend",
      requirement,
      status: "missing",
      hint: "Outbound email is gated; set RESEND_API_KEY (server-only). Email sender falls back to fake mode in tests/dev."
    };
  }
  return {
    provider: "resend",
    requirement,
    status: "configured",
    hint: "RESEND_API_KEY is present."
  };
}

function checkPostHog(): ProviderHealth {
  const key = readEnv(HEALTH_ENV_VAR_NAMES.posthogKey);
  const host = readEnv(HEALTH_ENV_VAR_NAMES.posthogHost);
  const requirement: HealthRequirement = "optional";
  if (!key || !host) {
    return {
      provider: "posthog",
      requirement,
      status: "missing",
      hint: "Analytics is optional; set NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST to enable. Falls back to noop provider."
    };
  }
  return {
    provider: "posthog",
    requirement,
    status: "configured",
    hint: "PostHog public key and host are present."
  };
}

function checkMapbox(): ProviderHealth {
  const token = readEnv(HEALTH_ENV_VAR_NAMES.mapboxPublicToken);
  const requirement: HealthRequirement = "optional";
  if (!token) {
    return {
      provider: "mapbox",
      requirement,
      status: "missing",
      hint: "Mapbox is optional; set NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN (must start with pk.) to enable. Falls back to schematic map."
    };
  }
  if (!token.startsWith("pk.")) {
    return {
      provider: "mapbox",
      requirement,
      status: "degraded",
      hint: "NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN does not start with pk.; secret tokens (sk.*) are rejected. Falls back to schematic map."
    };
  }
  return {
    provider: "mapbox",
    requirement,
    status: "configured",
    hint: "Mapbox public token is present and pk.-prefixed."
  };
}

function checkPostgresql(): ProviderHealth {
  const databaseUrl = readEnv(HEALTH_ENV_VAR_NAMES.databaseUrl);
  const authSecret = readEnv(HEALTH_ENV_VAR_NAMES.betterAuthSecret);
  const requirement: HealthRequirement = "required-for-action";
  if (!databaseUrl || !authSecret) {
    return {
      provider: "postgresql",
      requirement,
      status: "missing",
      hint: "Persistence-backed actions are gated; set DATABASE_URL and BETTER_AUTH_SECRET server-side. Marketing routes still render."
    };
  }
  return {
    provider: "postgresql",
    requirement,
    status: "configured",
    hint: "Private PostgreSQL and Better Auth configuration are present."
  };
}

function checkWorkerQueue(): ProviderHealth {
  // The worker queue runs as a bounded local runner with no external broker.
  // Its readiness depends on Resend (for email jobs) and PostgreSQL (for state),
  // but the runner itself is in-process and always present.
  const resend = checkResend();
  const postgresql = checkPostgresql();
  const requirement: HealthRequirement = "required-for-action";

  if (postgresql.status !== "configured" || resend.status !== "configured") {
    return {
      provider: "worker-queue",
      requirement,
      status: "missing",
      hint: "Local worker runner is in-process, but downstream providers are missing; jobs will be skipped until PostgreSQL and Resend are configured."
    };
  }
  return {
    provider: "worker-queue",
    requirement,
    status: "configured",
    hint: "Local worker runner is in-process; downstream PostgreSQL and Resend are configured."
  };
}

export function getProviderHealth(): ProviderHealth[] {
  return [
    checkOpenAi(),
    checkStripe(),
    checkResend(),
    checkPostHog(),
    checkMapbox(),
    checkPostgresql(),
    checkWorkerQueue()
  ];
}

export function getProviderHealthReport(now: Date = new Date()): ProviderHealthReport {
  return {
    generatedAt: now.toISOString(),
    providers: getProviderHealth()
  };
}

export function formatProviderHealthReport(report: ProviderHealthReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Asserts a string contains no obvious secret-shaped substrings.
 * Used by tests to prove redaction. Patterns covered: Stripe (`sk_`,
 * `whsec_`, `pk_live_`, `pk_test_`), JWT-shaped
 * `eyJ`), generic `Bearer ` tokens, and Mapbox secret prefix `sk.`.
 *
 * Mapbox `pk.` is NOT a secret; the redaction policy is to never include
 * any token value, but the assertion intentionally allows the literal
 * substring `pk.` as a shape-rule reference inside hints (we still verify
 * no concrete token follows by checking length).
 */
export function assertNoSecretLeak(text: string): void {
  const banned: ReadonlyArray<{ label: string; pattern: RegExp }> = [
    { label: "stripe-secret", pattern: /\bsk_(live|test)_[A-Za-z0-9]+/ },
    { label: "stripe-webhook", pattern: /\bwhsec_[A-Za-z0-9]+/ },
    { label: "stripe-publishable", pattern: /\bpk_(live|test)_[A-Za-z0-9]+/ },
    { label: "jwt", pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
    { label: "bearer", pattern: /\bBearer\s+[A-Za-z0-9._-]{8,}/ },
    { label: "mapbox-secret", pattern: /\bsk\.[A-Za-z0-9_-]{10,}/ },
    { label: "mapbox-pk-token", pattern: /\bpk\.[A-Za-z0-9_-]{10,}/ }
  ];
  for (const rule of banned) {
    if (rule.pattern.test(text)) {
      throw new Error(`assertNoSecretLeak: matched ${rule.label}`);
    }
  }
}
