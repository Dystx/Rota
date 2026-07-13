/**
 * Multi-tenant org_id helper (Phase 8 of the roadmap).
 *
 * The authenticated session carries the org_id under `app_metadata.org_id`
 * for B2B partner users. For consumer users (single-tenant) the
 * claim is absent and we return null — which the RLS policy
 * treats as "always readable" (see migration
 * 202607031800_phase8_multi_tenant_org_id.sql).
 *
 * This module is the TypeScript mirror of the SQL `auth_org_id()`
 * function: anywhere server code needs to filter rows by tenant,
 * it reads the org claim via `getOrgIdFromSession()` and passes
 * the value into the query.
 */

type AuthMetadataCarrier = {
  app_metadata?: unknown;
  [key: string]: unknown;
};
export type AuthSessionLike = {
  user?: AuthMetadataCarrier | null;
  [key: string]: unknown;
} | null | undefined;
export type AuthUserLike = AuthMetadataCarrier | null | undefined;

function readOrgId(value: AuthMetadataCarrier | null | undefined): string | null {
  const metadata = value?.app_metadata;
  if (!metadata || typeof metadata !== "object") return null;
  const orgId = (metadata as { org_id?: unknown }).org_id;
  return typeof orgId === "string" && orgId.trim() ? orgId : null;
}

/**
 * Read the org_id from a session's app_metadata.
 * Returns null for single-tenant consumer users.
 */
export function getOrgIdFromSession(
  session: AuthSessionLike
): string | null {
  return readOrgId(session?.user);
}

/**
 * Read the org_id from an authenticated user object directly. Useful
 * for server actions that have already extracted the user.
 */
export function getOrgIdFromUser(user: AuthUserLike): string | null {
  return readOrgId(user);
}

/**
 * Adapter helper: ask an auth client for the current
 * session and return the org_id in one call. Returns null when
 * there's no authenticated user or no org claim (caller should
 * handle the auth + tenancy boundary).
 *
 * Note: the previous name `requireOrgIdFromClient` implied
 * throw-on-missing semantics, but the implementation only
 * threw on `getSession` errors and returned null for missing
 * sessions. Renamed to `getOrgIdFromClient` to match the
 * other helpers (and to stop the lie about the contract).
 */
export async function getOrgIdFromClient(
  client: { auth: { getSession: () => Promise<{ data: { session: AuthSessionLike }; error?: Error | null }> } }
): Promise<string | null> {
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return getOrgIdFromSession(data.session);
}
