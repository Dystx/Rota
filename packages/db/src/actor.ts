import "server-only";

import { appRoleSchema, capabilitySchema, type AppRole, type AuthorizedActor, type Capability } from "@repo/types";
import { eq, sql } from "drizzle-orm";

import { getDatabase } from "./connection";
import { capabilityGrants, userProfiles } from "./schema";

export type DatabaseActor = AuthorizedActor;

type RumiaDatabase = ReturnType<typeof getDatabase>;
type RumiaTransaction = Parameters<Parameters<RumiaDatabase["transaction"]>[0]>[0];

export type ActorDb = {
  actor: DatabaseActor;
  db: RumiaTransaction;
};

function activeCapability(grant: { capability: string; expiresAt: Date | null; revokedAt: Date | null }, now: Date): Capability | null {
  if (grant.revokedAt || (grant.expiresAt && grant.expiresAt <= now)) {
    return null;
  }

  const parsed = capabilitySchema.safeParse(grant.capability);
  return parsed.success ? parsed.data : null;
}

function parseAppRole(value: string): AppRole | null {
  const parsed = appRoleSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

async function setActorContext(db: RumiaTransaction, actor: DatabaseActor) {
  await db.execute(sql`select pg_catalog.set_config('app.actor_id', ${actor.userId}, true)`);
  await db.execute(sql`select pg_catalog.set_config('app.reviewer_id', ${actor.reviewerId ?? ""}, true)`);
}

/**
 * Loads the application authorization context through the RLS-protected
 * application role. Better Auth proves identity; these rows determine the
 * server-owned application role and capabilities.
 */
export async function loadPostgresAuthorizationContext(userId: string): Promise<DatabaseActor | null> {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) {
    return null;
  }

  return getDatabase().transaction(async (tx) => {
    await tx.execute(sql`select pg_catalog.set_config('app.actor_id', ${normalizedUserId}, true)`);

    const [profile] = await tx
      .select({ appRole: userProfiles.appRole, userId: userProfiles.userId })
      .from(userProfiles)
      .where(eq(userProfiles.userId, normalizedUserId))
      .limit(1);

    const role = profile ? parseAppRole(profile.appRole) : null;
    if (!profile || !role) {
      return null;
    }

    const grants = await tx
      .select({ capability: capabilityGrants.capability, expiresAt: capabilityGrants.expiresAt, revokedAt: capabilityGrants.revokedAt })
      .from(capabilityGrants)
      .where(eq(capabilityGrants.subjectUserId, normalizedUserId));

    const now = new Date();
    const capabilities = grants
      .map((grant) => activeCapability(grant, now))
      .filter((capability): capability is Capability => capability !== null);

    return {
      capabilities: [...new Set(capabilities)],
      reviewerId: role === "reviewer" ? normalizedUserId : null,
      roles: [role],
      userId: normalizedUserId
    } satisfies DatabaseActor;
  });
}

export async function requireActor(userId: string): Promise<DatabaseActor> {
  const actor = await loadPostgresAuthorizationContext(userId);
  if (!actor) {
    throw new Error("Application actor profile not found.");
  }

  return actor;
}

/** Creates the default traveler profile for a newly created Better Auth user. */
export async function ensureTravelerProfile(userId: string, displayName = ""): Promise<void> {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) {
    throw new Error("Cannot create an application profile without a user ID.");
  }

  await getDatabase().transaction(async (tx) => {
    await tx.execute(sql`select pg_catalog.set_config('app.actor_id', ${normalizedUserId}, true)`);
    await tx
      .insert(userProfiles)
      .values({ userId: normalizedUserId, displayName: displayName.trim() })
      .onConflictDoNothing({ target: userProfiles.userId });
  });
}

/**
 * Runs application data access with the actor context bound to one database
 * transaction. RLS policies read these LOCAL settings and they disappear on
 * commit or rollback, preventing pooled-connection actor leakage.
 */
export async function withActor<T>(actor: DatabaseActor, work: (context: ActorDb) => Promise<T>): Promise<T> {
  return getDatabase().transaction(async (tx) => {
    await setActorContext(tx, actor);
    return work({ actor, db: tx });
  });
}
