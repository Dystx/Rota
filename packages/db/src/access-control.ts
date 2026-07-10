import type { AppRole, AuthorizedActor, Capability } from "@repo/types";

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
