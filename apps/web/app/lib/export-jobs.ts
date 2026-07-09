import "server-only";

export type ExportJobState = "locked" | "queued" | "ready" | "error" | "retry";

const jobs = new Map<string, ExportJobState>();

export function getExportJobState(tripId: string, canExport: boolean): ExportJobState {
  if (!canExport) return "locked";
  return jobs.get(tripId) ?? "ready";
}

export function queueExportJob(tripId: string): ExportJobState {
  jobs.set(tripId, "queued");
  return "queued";
}

export function retryExportJob(tripId: string): ExportJobState {
  jobs.set(tripId, "retry");
  return "retry";
}

export function markExportJobReady(tripId: string): ExportJobState {
  jobs.set(tripId, "ready");
  return "ready";
}

export function markExportJobError(tripId: string): ExportJobState {
  jobs.set(tripId, "error");
  return "error";
}
