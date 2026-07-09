import { afterEach, describe, expect, it } from "vitest";
import {
  createMemoryExportJobStore,
  getExportJobState,
  markExportJobError,
  markExportJobReady,
  queueExportJob,
  resetExportJobStore,
  retryExportJob,
  setExportJobStore
} from "./export-jobs";

describe("export job persistence boundary", () => {
  afterEach(resetExportJobStore);

  it("reports unavailable until a durable adapter is configured", () => {
    expect(getExportJobState("trip-1", true)).toBe("unavailable");
  });

  it("preserves queued, ready, error, and retry transitions through the adapter", () => {
    setExportJobStore(createMemoryExportJobStore());

    expect(queueExportJob("trip-1")).toBe("queued");
    expect(getExportJobState("trip-1", true)).toBe("queued");
    expect(markExportJobReady("trip-1")).toBe("ready");
    expect(markExportJobError("trip-1")).toBe("error");
    expect(retryExportJob("trip-1")).toBe("retry");
    expect(getExportJobState("trip-1", false)).toBe("locked");
  });
});
