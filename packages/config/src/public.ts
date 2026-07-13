import { assertNoMissing, environmentModeSchema, type EnvironmentMode } from "./shared";

declare const process: {
  env: Record<string, string | undefined>;
};

export type PublicConfig = {
  appUrl: string;
  environmentMode: EnvironmentMode;
  mapbox: {
    publicToken: string | undefined;
  };
  posthog: {
    host: string | undefined;
    key: string | undefined;
  };
  stripe: {
    publishableKey: string | undefined;
  };
};

export function createPublicConfig(): PublicConfig {
  const missing: string[] = [];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
  const mapboxPublicToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN?.trim();

  if (!appUrl) missing.push("NEXT_PUBLIC_APP_URL");
  assertNoMissing("public", missing);

  return {
    appUrl: appUrl!,
    environmentMode: environmentModeSchema.catch("development").parse(process.env.NODE_ENV),
    mapbox: {
      publicToken: mapboxPublicToken
    },
    posthog: {
      host: posthogHost,
      key: posthogKey
    },
    stripe: {
      publishableKey: stripePublishableKey
    }
  };
}
