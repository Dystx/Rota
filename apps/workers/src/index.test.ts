import { createFakeEmailProvider, type EmailMessage, type EmailProvider, type EmailSendResult } from "@repo/emails";
import { createFakeMonitoringProvider } from "@repo/monitoring";
import { describe, expect, test } from "vitest";

import {
  LocalWorkerState,
  WORKER_EXECUTION_TARGET,
  buildWorkerPlan,
  enqueueReviewCompletedEmailJob,
  runLocalWorker,
  seedCleanupSafetyState,
  summarizeWorkerRun,
  type CompletedEmailDelivery
} from "./index";

type FlakyEmailProvider = EmailProvider & {
  attempts: ReadonlyArray<EmailMessage>;
  successfulIdempotencyKeys: ReadonlyArray<string>;
};

function createFailOnceEmailProvider(): FlakyEmailProvider {
  const fake = createFakeEmailProvider({ now: () => new Date("2026-05-02T00:00:02.000Z") });
  const attempts: EmailMessage[] = [];
  let shouldFail = true;

  return {
    mode: "fake",
    get attempts() {
      return attempts.slice();
    },
    get successfulIdempotencyKeys() {
      return fake.outbox.map((record) => record.idempotencyKey);
    },
    async send(message): Promise<EmailSendResult> {
      attempts.push(message);
      if (shouldFail) {
        shouldFail = false;
        throw new Error("transient fake email failure");
      }

      return fake.send(message);
    }
  };
}

describe("worker plan compatibility", () => {
  test("preserves existing buildWorkerPlan export behavior", () => {
    const plan = buildWorkerPlan({ tripId: "3", isPaid: true, hasHumanReview: true });

    expect(plan.jobs).toHaveLength(4);
    expect(plan.jobs.some((job) => job.id === "export-markdown-3" && job.status === "queued")).toBe(true);
    expect(plan.summary).toContain("ready to queue");
  });
});

describe("local worker runner", () => {
  test("documents the bounded Node/Vercel cron compatible execution target", () => {
    expect(WORKER_EXECUTION_TARGET).toBe("bounded-node-cron-compatible-local-runner");
  });

  test("retries a failed review-complete email once and completes without duplicate logical delivery", async () => {
    const now = new Date("2026-05-02T00:00:00.000Z");
    const emailProvider = createFailOnceEmailProvider();
    const state = new LocalWorkerState({
      jobs: [
        enqueueReviewCompletedEmailJob(
          {
            recipient: "traveler@example.com",
            reviewerNotes: "Validated pacing without exposing notes to analytics.",
            tripId: "3",
            tripTitle: "Lisbon Long Weekend"
          },
          { now }
        )
      ]
    });

    const firstRun = await runLocalWorker(state, {
      emailProvider,
      now: () => now
    });

    expect(firstRun.attempts).toHaveLength(1);
    expect(firstRun.attempts[0]).toMatchObject({
      attempt: 1,
      status: "retry_scheduled",
      error: "transient fake email failure"
    });
    expect(firstRun.completedDeliveries).toHaveLength(0);

    const secondRun = await runLocalWorker(state, {
      emailProvider,
      now: () => new Date("2026-05-02T00:00:01.000Z")
    });

    expect(secondRun.attempts).toHaveLength(2);
    expect(secondRun.attempts[1]).toMatchObject({ attempt: 2, status: "succeeded" });
    expect(secondRun.completedDeliveries).toHaveLength(1);
    expect(emailProvider.attempts).toHaveLength(2);
    expect(new Set(emailProvider.attempts.map((message) => message.idempotencyKey)).size).toBe(1);
    expect(emailProvider.successfulIdempotencyKeys).toStrictEqual([
      "review-complete:3:traveler@example.com"
    ]);

    const completed = secondRun.completedDeliveries[0] as CompletedEmailDelivery | undefined;
    const duplicateState = new LocalWorkerState({
      completedDeliveries: completed ? [completed] : [],
      jobs: [
        enqueueReviewCompletedEmailJob(
          {
            recipient: "traveler@example.com",
            tripId: "3",
            tripTitle: "Lisbon Long Weekend"
          },
          { now: new Date("2026-05-02T00:00:02.000Z") }
        )
      ]
    });

    const duplicateRun = await runLocalWorker(duplicateState, {
      emailProvider,
      now: () => new Date("2026-05-02T00:00:02.000Z")
    });

    expect(duplicateRun.attempts).toStrictEqual([
      {
        attempt: 0,
        idempotencyKey: "review-complete:3:traveler@example.com",
        jobId: "email-review-complete-3",
        status: "skipped"
      }
    ]);
    expect(emailProvider.successfulIdempotencyKeys).toStrictEqual([
      "review-complete:3:traveler@example.com"
    ]);
    expect(summarizeWorkerRun(secondRun)).toContain("status=succeeded");
  });

  test("marks abandoned checkout artifacts expired while leaving an active paid trip unchanged", async () => {
    const now = new Date("2026-05-02T00:00:00.000Z");
    const state = seedCleanupSafetyState(now);
    const result = await runLocalWorker(state, {
      emailProvider: createFakeEmailProvider(),
      now: () => now
    });
    const abandoned = result.trips.find((trip) => trip.id === "trip-abandoned");
    const paid = result.trips.find((trip) => trip.id === "trip-paid");

    expect(result.attempts).toStrictEqual([
      {
        attempt: 1,
        idempotencyKey: "cleanup:abandoned-checkouts:2026-05-01T23:00:00.000Z",
        jobId: "cleanup-abandoned-checkouts-2026-05-01T23:00:00.000Z",
        status: "succeeded"
      }
    ]);
    expect(abandoned).toMatchObject({
      checkoutExpiredAt: "2026-05-02T00:00:00.000Z",
      checkoutStatus: "expired",
      id: "trip-abandoned",
      paidAt: null,
      status: "expired"
    });
    expect(paid).toStrictEqual({
      checkoutCreatedAt: "2026-05-01T20:00:00.000Z",
      checkoutExpiredAt: null,
      checkoutStatus: "paid",
      id: "trip-paid",
      paidAt: "2026-05-01T23:30:00.000Z",
      status: "paid",
      title: "Active paid trip"
    });
    expect(summarizeWorkerRun(result)).toContain("trip-paid status=paid checkoutStatus=paid");
  });

  test("captures a redacted worker_dead_letter monitoring event after exhausting retries", async () => {
    const now = new Date("2026-05-02T00:00:00.000Z");
    const monitor = createFakeMonitoringProvider();
    const alwaysFailingProvider: EmailProvider = {
      mode: "fake",
      async send() {
        throw new Error("smtp permanently broken: Bearer eyJabc.def.ghi user@example.com");
      }
    };

    const state = new LocalWorkerState({
      jobs: [
        enqueueReviewCompletedEmailJob(
          {
            recipient: "traveler@example.com",
            tripId: "9",
            tripTitle: "Lisbon Long Weekend"
          },
          { now }
        )
      ]
    });

    for (let runIndex = 0; runIndex < 3; runIndex += 1) {
      await runLocalWorker(state, {
        emailProvider: alwaysFailingProvider,
        monitor,
        now: () => new Date(now.getTime() + runIndex * 60_000)
      });
    }

    const lastAttempt = state.attempts[state.attempts.length - 1];
    expect(lastAttempt?.status).toBe("dead_lettered");
    expect(monitor.outbox).toHaveLength(1);

    const captured = monitor.outbox[0];
    expect(captured?.name).toBe("worker_dead_letter");
    expect(captured?.severity).toBe("error");
    expect(captured?.surface).toBe("worker");
    expect(captured?.properties).toEqual({
      jobKind: "review_completed_email",
      jobId: "email-review-complete-9",
      attempts: 3,
      maxAttempts: 3,
      errorKind: "unknown"
    });

    const stringified = JSON.stringify(captured);
    expect(stringified).not.toContain("Bearer");
    expect(stringified).not.toContain("user@example.com");
    expect(stringified).not.toContain("smtp permanently broken");
  });
});
