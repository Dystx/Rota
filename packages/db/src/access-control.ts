import type { AppRole, AuthorizedActor, Capability } from "@repo/types";

import { resolveLegacyPrivilegedDataClient, type DataClientOptions } from "./clients";
import { getReviewerIdForUser, getUserRoleProfile } from "./roles";

export type CapabilityGrant = {
  capability: Capability;
  expiresAt: string | null;
  revokedAt: string | null;
};

export function selectActiveCapabilities(grants: readonly CapabilityGrant[], now = new Date()): Capability[] {
  return [
    ...new Set(
      grants
        .filter((grant) => !grant.revokedAt && (!grant.expiresAt || new Date(grant.expiresAt) > now))
        .map((grant) => grant.capability)
    )
  ];
}

export type AuthorizationContextLoader = {
  loadProfile: (userId: string) => Promise<{ appRole: AppRole } | null>;
  loadReviewerId: (userId: string) => Promise<string | null>;
  loadCapabilityGrants: (userId: string) => Promise<readonly CapabilityGrant[]>;
  now?: Date;
};

export async function getAuthorizationContext(userId: string, loader: AuthorizationContextLoader): Promise<AuthorizedActor | null> {
  const [profile, reviewerId, grants] = await Promise.all([
    loader.loadProfile(userId),
    loader.loadReviewerId(userId),
    loader.loadCapabilityGrants(userId)
  ]);

  if (!profile) {
    return null;
  }

  return {
    capabilities: selectActiveCapabilities(grants, loader.now),
    reviewerId,
    roles: [profile.appRole],
    userId
  };
}

type RawCapabilityGrant = {
  capability: Capability;
  expires_at: string | null;
  revoked_at: string | null;
};

export async function getCapabilityGrantsForUser(userId: string, options?: DataClientOptions): Promise<CapabilityGrant[]> {
  const { data, error } = await resolveLegacyPrivilegedDataClient(options)
    .from("app_role_capability_grants")
    .select("capability,expires_at,revoked_at")
    .eq("subject_user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as RawCapabilityGrant[]).map((grant) => ({
    capability: grant.capability,
    expiresAt: grant.expires_at,
    revokedAt: grant.revoked_at
  }));
}

export async function getDatabaseAuthorizationContext(userId: string, options?: DataClientOptions): Promise<AuthorizedActor | null> {
  const client = resolveLegacyPrivilegedDataClient(options);

  return getAuthorizationContext(userId, {
    loadCapabilityGrants: (subjectUserId) => getCapabilityGrantsForUser(subjectUserId, { client }),
    loadProfile: async (subjectUserId) => {
      const profile = await getUserRoleProfile(subjectUserId, { client });
      return profile?.appRole === "traveler" || profile?.appRole === "reviewer" || profile?.appRole === "admin"
        ? { appRole: profile.appRole }
        : null;
    },
    loadReviewerId: (subjectUserId) => getReviewerIdForUser(subjectUserId, { client })
  });
}
