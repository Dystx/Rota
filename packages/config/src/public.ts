import { assertNoMissing, environmentModeSchema, type EnvironmentMode } from "./shared";

declare const process: {
  env: Record<string, string | undefined>;
};

export type PublicConfig = {
  appUrl: string;
  environmentMode: EnvironmentMode;
  mapbox: {
    publicToken: string;
  };
  posthog: {
    host: string;
    key: string;
  };
  stripe: {
    publishableKey: string;
  };
  supabase: {
    anonKey: string;
    url: string;
  };
};

export type PublicSupabaseConfig = PublicConfig["supabase"];

export function createPublicSupabaseConfig(): PublicSupabaseConfig {
  const missing: string[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  assertNoMissing("public", missing);

  return {
    anonKey: supabaseAnonKey!,
    url: supabaseUrl!
  };
}

export function createPublicConfig(): PublicConfig {
  const missing: string[] = [];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
  const mapboxPublicToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN?.trim();

  if (!appUrl) missing.push("NEXT_PUBLIC_APP_URL");
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!stripePublishableKey) missing.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  if (!posthogKey) missing.push("NEXT_PUBLIC_POSTHOG_KEY");
  if (!posthogHost) missing.push("NEXT_PUBLIC_POSTHOG_HOST");
  if (!mapboxPublicToken) missing.push("NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN");

  assertNoMissing("public", missing);

  return {
    appUrl: appUrl!,
    environmentMode: environmentModeSchema.catch("development").parse(process.env.NODE_ENV),
    mapbox: {
      publicToken: mapboxPublicToken!
    },
    posthog: {
      host: posthogHost!,
      key: posthogKey!
    },
    stripe: {
      publishableKey: stripePublishableKey!
    },
    supabase: createPublicSupabaseConfig()
  };
}
