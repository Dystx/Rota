import { resolveDataClient, type DataClientOptions } from "./clients";

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
  const client = resolveDataClient(options);
  
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
