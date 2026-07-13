import { resolveLegacyDataClient, type DataClientOptions } from "./clients";

export const trustedAppRoles = ["traveler", "reviewer", "admin", "none"] as const;

export type TrustedAppRole = (typeof trustedAppRoles)[number];
export type AuthorizedAppRole = Exclude<TrustedAppRole, "none">;

export type TrustedRoleClaims = {
  app_metadata?: unknown;
};

export type UserRoleProfile = {
  userId: string;
  appRole: TrustedAppRole;
  displayName: string;
  createdAt: string;
  updatedAt: string;
};

type RawUserProfileRow = {
  user_id: string;
  app_role: string;
  display_name: string;
  created_at: string;
  updated_at: string;
};

type RawReviewerAuthLinkRow = {
  reviewer_id: string;
};

export function normalizeTrustedAppRole(value: unknown): TrustedAppRole {
  return value === "traveler" || value === "reviewer" || value === "admin" || value === "none" ? value : "none";
}

export function getTrustedAppRoleFromClaims(claims: TrustedRoleClaims | null | undefined): TrustedAppRole {
  const metadata = claims?.app_metadata;
  const role = metadata && typeof metadata === "object" && "role" in metadata ? metadata.role : null;

  return normalizeTrustedAppRole(role);
}

function parseUserRoleProfile(row: RawUserProfileRow): UserRoleProfile {
  return {
    appRole: normalizeTrustedAppRole(row.app_role),
    createdAt: row.created_at,
    displayName: row.display_name,
    updatedAt: row.updated_at,
    userId: row.user_id
  };
}

export async function getUserRoleProfile(userId: string, options?: DataClientOptions): Promise<UserRoleProfile | null> {
  const { data, error } = await resolveLegacyDataClient(options)
    .from("user_profiles")
    .select("user_id,app_role,display_name,created_at,updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return parseUserRoleProfile(data as RawUserProfileRow);
}

export async function getReviewerIdForUser(userId: string, options?: DataClientOptions): Promise<string | null> {
  const { data, error } = await resolveLegacyDataClient(options)
    .from("reviewer_auth_links")
    .select("reviewer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return (data as RawReviewerAuthLinkRow).reviewer_id;
}
