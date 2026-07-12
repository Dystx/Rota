/**
 * Product capability switches. Features are deliberately opt-in so an
 * incomplete integration is never exposed merely because credentials exist.
 */
export const featureFlagNames = [
  "liveAi",
  "stripe",
  "transactionalEmail",
  "tripMessaging",
  "b2bBeta",
  "guideBeta",
  "operatorConsole",
  "consoleConfig",
  "apiDocs",
  "activityMap",
  "pt"
] as const;

export type FeatureFlag = (typeof featureFlagNames)[number];

const environmentVariableFor: Record<FeatureFlag, string> = {
  liveAi: "ENABLE_LIVE_AI",
  stripe: "ENABLE_STRIPE",
  transactionalEmail: "ENABLE_TRANSACTIONAL_EMAIL",
  tripMessaging: "ENABLE_TRIP_MESSAGING",
  b2bBeta: "ENABLE_B2B_BETA",
  guideBeta: "ENABLE_GUIDE_BETA",
  operatorConsole: "ENABLE_OPERATOR_CONSOLE",
  consoleConfig: "ENABLE_CONSOLE_CONFIG",
  apiDocs: "ENABLE_API_DOCS",
  activityMap: "ENABLE_ACTIVITY_MAP",
  pt: "ENABLE_PT"
};

type Environment = Record<string, string | undefined>;

/** Returns true only for an explicit `true` flag value. */
export function isFeatureEnabled(flag: FeatureFlag, environment: Environment = process.env): boolean {
  return environment[environmentVariableFor[flag]]?.trim().toLowerCase() === "true";
}

export function getFeatureFlagEnvironmentVariable(flag: FeatureFlag): string {
  return environmentVariableFor[flag];
}
