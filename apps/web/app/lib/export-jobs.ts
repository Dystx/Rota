import "server-only";

export type ExportJobState = "locked" | "queued" | "ready" | "error" | "retry" | "unavailable";

/**
 * Durable storage is intentionally an explicit boundary. Until the export
 * jobs table/worker is deployed, production must report unavailable rather
 * than pretending a process-local Map survives restarts.
 */
export interface ExportJobStore {
  get(tripId: string): ExportJobState;
  set(tripId: string, state: Exclude<ExportJobState, "locked" | "unavailable">): ExportJobState;
}

const unavailableStore: ExportJobStore = {
  get: () => "unavailable",
  set: () => "unavailable"
};

let store: ExportJobStore = unavailableStore;

export function setExportJobStore(nextStore: ExportJobStore) {
  store = nextStore;
}

export function resetExportJobStore() {
  store = unavailableStore;
}

export function createMemoryExportJobStore(): ExportJobStore {
  const jobs = new Map<string, Exclude<ExportJobState, "locked" | "unavailable">>();
  return {
    get: (tripId) => jobs.get(tripId) ?? "unavailable",
    set: (tripId, state) => {
      jobs.set(tripId, state);
      return state;
    }
  };
}

export function getExportJobState(tripId: string, canExport: boolean): ExportJobState {
  if (!canExport) return "locked";
  return store.get(tripId);
}

export function queueExportJob(tripId: string): ExportJobState {
  return store.set(tripId, "queued");
}

export function retryExportJob(tripId: string): ExportJobState {
  return store.set(tripId, "retry");
}

export function markExportJobReady(tripId: string): ExportJobState {
  return store.set(tripId, "ready");
}

export function markExportJobError(tripId: string): ExportJobState {
  return store.set(tripId, "error");
}
