import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type RotaDataClient = Pick<SupabaseClient, "from" | "rpc">;

export type DataClientOptions = {
  client?: RotaDataClient;
};

type PublicSupabaseEnvName = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY";
type ServerSupabaseEnvName = "SUPABASE_SERVICE_ROLE_KEY";

function requireEnv(name: PublicSupabaseEnvName | ServerSupabaseEnvName) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function createPublicRlsDataClient(): RotaDataClient {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}

export function createAuthenticatedUserDataClient(client: RotaDataClient): RotaDataClient {
  return client;
}

export function createPrivilegedServerDataClient(): RotaDataClient {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}

export function resolveDataClient(options?: DataClientOptions): RotaDataClient {
  return options?.client ?? createPublicRlsDataClient();
}

export function resolvePrivilegedServerDataClient(options?: DataClientOptions): RotaDataClient {
  return options?.client ?? createPrivilegedServerDataClient();
}

export function isPersistenceConfigError(error: unknown) {
  return error instanceof Error && error.message.startsWith("Missing required environment variable");
}

/**
 * Detects PostgREST/Supabase schema-cache drift errors that occur when a
 * referenced table or relation is missing or stale (for example, when a
 * deployment's hosted schema does not yet match local migrations).
 *
 * The check is conservative and string-based because PostgREST surfaces these
 * conditions through `error.message` rather than a typed error code. Matching
 * literals are kept narrow so unrelated runtime errors still propagate.
 */
export function isSchemaDriftError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message;

  return (
    message.includes("schema cache") ||
    message.includes("Could not find the table") ||
    message.includes("Could not find the relation") ||
    message.includes("Could not find the function") ||
    /relation\s+"[^"]+"\s+does not exist/i.test(message) ||
    message.includes("PGRST205") ||
    message.includes("PGRST204") ||
    message.includes("PGRST202")
  );
}
