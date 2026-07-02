import { z } from "zod";

export const environmentModeSchema = z.enum(["development", "test", "production"]);

export type EnvironmentMode = z.infer<typeof environmentModeSchema>;

export type ConfigScope = "public" | "server";

export type ConfigDiagnostics = {
  missing: string[];
  scope: ConfigScope;
};

export class ConfigValidationError extends Error {
  readonly diagnostics: ConfigDiagnostics;

  constructor(scope: ConfigScope, missing: string[]) {
    super(`Missing required ${scope} env`);
    this.name = "ConfigValidationError";
    this.diagnostics = {
      missing: [...missing],
      scope
    };
  }
}

export function assertNoMissing(scope: ConfigScope, missing: string[]) {
  if (missing.length > 0) {
    throw new ConfigValidationError(scope, missing);
  }
}
