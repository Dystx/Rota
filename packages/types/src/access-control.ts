import { z } from "zod";

export const appRoleSchema = z.enum(["traveler", "reviewer", "admin"]);

export const capabilitySchema = z.enum([
  "access:manage",
  "content:manage",
  "operations:manage",
  "analytics:read",
  "configuration:deploy",
  "developer_docs:read",
  "specialists:verify"
]);

export type AppRole = z.infer<typeof appRoleSchema>;
export type Capability = z.infer<typeof capabilitySchema>;

export type AuthorizedActor = {
  userId: string;
  roles: readonly AppRole[];
  capabilities: readonly Capability[];
  reviewerId: string | null;
};
