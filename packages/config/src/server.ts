import { createPublicConfig, type PublicConfig } from "./public";
import { assertNoMissing, type EnvironmentMode } from "./shared";

declare const process: {
  env: Record<string, string | undefined>;
};

export type ServerConfig = {
  appUrl: string;
  environmentMode: EnvironmentMode;
  mapbox: {
    publicToken: string | undefined;
    secretKey: string | undefined;
  };
  posthog: {
    host: string | undefined;
    key: string | undefined;
  };
  resend: {
    apiKey: string | undefined;
  };
  stripe: {
    publishableKey: string | undefined;
    secretKey: string | undefined;
    webhookSecret: string | undefined;
  };
};

export type ServerDatabaseConfig = {
  databaseUrl: string;
};

export type ServerAuthConfig = {
  betterAuthSecret: string;
};

export type ServerStripeSecretConfig = {
  secretKey: string;
};

export type ServerStripeWebhookSecretConfig = {
  webhookSecret: string;
};

export type ServerResendConfig = {
  apiKey: string;
};

/** Optional server-side style URL for an isolated, reviewed map canary. */
export function getOptionalRumiaMapStyleUrl(): string | undefined {
  return process.env.RUMIA_MAP_STYLE_URL?.trim() || undefined;
}

export function createServerResendConfig(): ServerResendConfig {
  const missing: string[] = [];
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  if (!resendApiKey) missing.push("RESEND_API_KEY");

  assertNoMissing("server", missing);

  return {
    apiKey: resendApiKey!
  };
}

export function createServerDatabaseConfig(): ServerDatabaseConfig {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  assertNoMissing("server", databaseUrl ? [] : ["DATABASE_URL"]);

  return { databaseUrl: databaseUrl! };
}

export function createServerAuthConfig(): ServerAuthConfig {
  const betterAuthSecret = process.env.BETTER_AUTH_SECRET?.trim();

  assertNoMissing("server", betterAuthSecret ? [] : ["BETTER_AUTH_SECRET"]);
  if (betterAuthSecret!.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be at least 32 characters.");
  }

  return { betterAuthSecret: betterAuthSecret! };
}

export function createServerStripeSecretConfig(): ServerStripeSecretConfig {
  const missing: string[] = [];
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!stripeSecretKey) missing.push("STRIPE_SECRET_KEY");

  assertNoMissing("server", missing);

  return {
    secretKey: stripeSecretKey!
  };
}

export function createServerStripeWebhookSecretConfig(): ServerStripeWebhookSecretConfig {
  const missing: string[] = [];
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!stripeWebhookSecret) missing.push("STRIPE_WEBHOOK_SECRET");

  assertNoMissing("server", missing);

  return {
    webhookSecret: stripeWebhookSecret!
  };
}

export function createServerConfig(publicConfig: PublicConfig = createPublicConfig()): ServerConfig {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const mapboxSecretKey = process.env.MAPBOX_SECRET_KEY?.trim();

  return {
    appUrl: publicConfig.appUrl,
    environmentMode: publicConfig.environmentMode,
    mapbox: {
      publicToken: publicConfig.mapbox.publicToken,
      secretKey: mapboxSecretKey
    },
    posthog: publicConfig.posthog,
    resend: {
      apiKey: resendApiKey
    },
    stripe: {
      publishableKey: publicConfig.stripe.publishableKey,
      secretKey: stripeSecretKey,
      webhookSecret: stripeWebhookSecret
    }
  };
}
