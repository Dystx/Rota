import type { DatabaseActor } from "./actor";

/** Transitional test seam only. Production callers must use `{ actor }`. */
export type RotaDataClient = {
  from: (table: string) => any;
  rpc: (functionName: string, args?: Record<string, unknown>) => any;
};

export type DataClientOptions = {
  client?: RotaDataClient;
  /** Transitional bridge: new callers use an RLS-bound PostgreSQL actor. */
  actor?: DatabaseActor;
};

export type UserDataOptions = {
  client: RotaDataClient;
  scope: "user";
};

export type SystemDataOptions = {
  client: RotaDataClient;
  scope: "system";
};

export function createUserDataOptions(client: RotaDataClient): UserDataOptions {
  return { client, scope: "user" };
}

export function createSystemDataOptions(client: RotaDataClient): SystemDataOptions {
  return { client, scope: "system" };
}

export function throwLegacyDataClient(): RotaDataClient {
  throw new Error("Legacy hosted data client retired; use an actor-scoped PostgreSQL repository.");
}

export function createAuthenticatedUserDataClient(client: RotaDataClient): RotaDataClient {
  return client;
}

export function throwLegacyPrivilegedDataClient(): RotaDataClient {
  throw new Error("Legacy privileged data client retired; use an actor-scoped PostgreSQL repository.");
}

export function resolveLegacyDataClient(options?: DataClientOptions): RotaDataClient {
  return options?.client ?? throwLegacyDataClient();
}

export function resolveLegacyPrivilegedDataClient(options?: DataClientOptions): RotaDataClient {
  return options?.client ?? throwLegacyPrivilegedDataClient();
}

export function isPersistenceConfigError(error: unknown) {
  return error instanceof Error && error.message.startsWith("Missing required environment variable");
}

/**
 * Detects database schema drift errors while a deployment is being migrated.
 * The legacy structural client seam may still surface text errors in tests,
 * so this helper remains conservative and string-based.
 */
export function isSchemaDriftError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message;

  return (
    message.includes("relation") && message.includes("does not exist") ||
    message.includes("Could not find the table") ||
    message.includes("Could not find the relation") ||
    message.includes("Could not find the function") ||
    /relation\s+"[^"]+"\s+does not exist/i.test(message) ||
    "code" in error && typeof error.code === "string" && error.code === "42P01"
  );
}
