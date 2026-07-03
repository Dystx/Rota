/**
 * Multi-tenant org_id helper (Phase 8 of the roadmap).
 *
 * The Supabase JWT carries the org_id under `app_metadata.org_id`
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

import type { SupabaseClient, Session, User } from "@supabase/supabase-js";

/**
 * Read the org_id from a Supabase session's JWT app_metadata.
 * Returns null for single-tenant consumer users.
 */
export function getOrgIdFromSession(
  session: Session | null | undefined
): string | null {
  if (!session) return null;
  const orgClaim = (
    session.user?.app_metadata as { org_id?: string | null } | undefined
  )?.org_id;
  return orgClaim ?? null;
}

/**
 * Read the org_id from a Supabase user object directly. Useful
 * for server actions that have already extracted the user.
 */
export function getOrgIdFromUser(user: User | null | undefined): string | null {
  if (!user) return null;
  const orgClaim = (user.app_metadata as { org_id?: string | null } | undefined)?.org_id;
  return orgClaim ?? null;
}

/**
 * Server-side helper: ask the Supabase client for the current
 * session and return the org_id in one call. Throws when there's
 * no authenticated user (caller should handle the auth boundary).
 */
export async function requireOrgIdFromClient(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return getOrgIdFromSession(data.session);
}
