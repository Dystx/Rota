export type ReadinessFailure =
  | "credentials"
  | "migration"
  | "rls"
  | "provider"
  | "capability";

export type FeatureReadiness =
  | { status: "ready" }
  | { status: "disabled"; reason: "flag_off" }
  | { status: "unavailable"; failed: readonly ReadinessFailure[] };

export function resolveFeatureReadiness(input: {
  enabled: boolean;
  credentials: boolean;
  migration: boolean;
  rls: boolean;
  provider: boolean;
  capability?: boolean;
}): FeatureReadiness {
  if (!input.enabled) return { status: "disabled", reason: "flag_off" };

  const failed: ReadinessFailure[] = [];
  if (!input.credentials) failed.push("credentials");
  if (!input.migration) failed.push("migration");
  if (!input.rls) failed.push("rls");
  if (!input.provider) failed.push("provider");
  if (input.capability === false) failed.push("capability");

  return failed.length === 0 ? { status: "ready" } : { status: "unavailable", failed };
}
