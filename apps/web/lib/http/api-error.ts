import type { ApiErrorEnvelope } from "@repo/types";

export function createApiErrorEnvelope(
  code: string,
  message: string,
  fieldErrors?: Record<string, readonly string[]>
): ApiErrorEnvelope {
  return fieldErrors && Object.keys(fieldErrors).length > 0
    ? { code, fieldErrors: Object.fromEntries(Object.entries(fieldErrors).map(([field, errors]) => [field, [...errors]])), message }
    : { code, message };
}
