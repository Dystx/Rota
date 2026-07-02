import { createPublicConfig, type PublicConfig } from "./public";
import { assertNoMissing, type EnvironmentMode } from "./shared";

declare const process: {
  env: Record<string, string | undefined>;
};

export type ServerConfig = {
  appUrl: string;
  environmentMode: EnvironmentMode;
  mapbox: {
    publicToken: string;
    secretKey: string;
  };
  posthog: {
    host: string;
    key: string;
  };
  resend: {
    apiKey: string;
  };
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  supabase: {
    anonKey: string;
    serviceRoleKey: string;
    url: string;
  };
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

export function createServerResendConfig(): ServerResendConfig {
  const missing: string[] = [];
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  if (!resendApiKey) missing.push("RESEND_API_KEY");

  assertNoMissing("server", missing);

  return {
    apiKey: resendApiKey!
  };
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
  const missing: string[] = [];

  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const mapboxSecretKey = process.env.MAPBOX_SECRET_KEY?.trim();

  if (!supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeSecretKey) missing.push("STRIPE_SECRET_KEY");
  if (!stripeWebhookSecret) missing.push("STRIPE_WEBHOOK_SECRET");
  if (!resendApiKey) missing.push("RESEND_API_KEY");
  if (!mapboxSecretKey) missing.push("MAPBOX_SECRET_KEY");

  assertNoMissing("server", missing);

  return {
    appUrl: publicConfig.appUrl,
    environmentMode: publicConfig.environmentMode,
    mapbox: {
      publicToken: publicConfig.mapbox.publicToken,
      secretKey: mapboxSecretKey!
    },
    posthog: publicConfig.posthog,
    resend: {
      apiKey: resendApiKey!
    },
    stripe: {
      publishableKey: publicConfig.stripe.publishableKey,
      secretKey: stripeSecretKey!,
      webhookSecret: stripeWebhookSecret!
    },
    supabase: {
      anonKey: publicConfig.supabase.anonKey,
      serviceRoleKey: supabaseServiceRoleKey!,
      url: publicConfig.supabase.url
    }
  };
}
