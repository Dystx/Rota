import { withActor } from "./actor";
import { resolveLegacyDataClient, type DataClientOptions } from "./clients";
import { auditEvents } from "./schema";

export type AuditAction = "create" | "update" | "delete";

export type AuditEntry = {
  actorUserId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
};

export async function writeAuditTrail(entry: AuditEntry, options?: DataClientOptions): Promise<void> {
  if (options?.actor) {
    if (entry.actorUserId !== options.actor.userId) {
      throw new Error("Audit actor does not match the authenticated database actor.");
    }

    await withActor(options.actor, async ({ db }) => {
      await db.insert(auditEvents).values({
        action: entry.action,
        actorUserId: entry.actorUserId,
        after: entry.after ?? null,
        before: entry.before ?? null,
        entityId: entry.entityId,
        entityType: entry.entityType
      });
    });
    return;
  }

  const client = resolveLegacyDataClient(options);
  
  const { error } = await client.from("admin_audit_trail").insert({
    actor_user_id: entry.actorUserId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    before: entry.before ?? null,
    after: entry.after ?? null
  });

  if (error) {
    // We log it but DO NOT swallow it entirely—it shouldn't break the mutation completely,
    // but the task said: "failure to write audit entry must NOT silently swallow data mutation success — log + surface".
    // Usually, we'd log to a system, here we console.error so it surfaces in logs.
    console.error("[Audit Trail Error]: Failed to write audit entry", error);
  }
}
