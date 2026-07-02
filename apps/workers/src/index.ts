import {
  buildEmailPreview,
  buildReviewCompleteEmail,
  type EmailMessage,
  type EmailProvider
} from "@repo/emails";
import {
  classifyErrorKind,
  tryCapture,
  type MonitoringProvider
} from "@repo/monitoring";
import { getCheckoutPlan } from "@repo/payments";
import { WorkerPlanSchema, type WorkerPlan } from "@repo/types";

export const WORKER_EXECUTION_TARGET = "bounded-node-cron-compatible-local-runner";

type WorkerPlanInput = {
  tripId?: string;
  isPaid?: boolean;
  hasHumanReview?: boolean;
};

export function buildWorkerPlan({ tripId = "1", isPaid = false, hasHumanReview = false }: WorkerPlanInput = {}): WorkerPlan {
  const tripCheckoutPlan = getCheckoutPlan("paid-trip");
  const reviewCheckoutPlan = getCheckoutPlan("human-polish");
  const paymentReceiptPreview = buildEmailPreview("payment-receipt", `Trip ${tripId}`);
  const exportReadyPreview = buildEmailPreview("export-ready", `Trip ${tripId}`);
  const reviewReadyPreview = buildEmailPreview("review-complete", `Trip ${tripId}`);

  return WorkerPlanSchema.parse({
    jobs: [
      {
        id: `export-markdown-${tripId}`,
        nextStep: isPaid ? `${tripCheckoutPlan.fulfillment} Then send \"${exportReadyPreview.subject}\".` : "Wait for trip unlock before queueing export.",
        outputs: ["markdown itinerary", exportReadyPreview.subject],
        owner: "workers/export",
        status: isPaid ? "queued" : "blocked",
        summary: isPaid
          ? `The deterministic markdown export can be queued without extra provider work after the ${tripCheckoutPlan.priceLabel} unlock.`
          : "Markdown export is defined, but still gated behind trip unlock.",
        title: "Prepare markdown trip export",
        tripId,
        type: "trip_export_markdown",
        ...(isPaid ? {} : { blockingReason: "Trip is still in free-preview mode." })
      },
      {
        id: `export-pdf-${tripId}`,
        nextStep: isPaid ? "Generate the PDF itinerary after the unlocked route is finalized for export." : "Wait for trip unlock before queueing PDF generation.",
        outputs: ["pdf itinerary", "print-friendly summary"],
        owner: "workers/export",
        status: isPaid ? "planned" : "blocked",
        summary: isPaid
          ? "PDF export is now part of the deterministic export package and can be queued as a follow-up artifact."
          : "PDF export remains blocked until the trip is unlocked.",
        title: "Prepare PDF itinerary export",
        tripId,
        type: "trip_export_pdf",
        ...(isPaid ? {} : { blockingReason: "Trip must be paid before PDF export generation." })
      },
      {
        id: `review-assignment-${tripId}`,
        nextStep: hasHumanReview
          ? `Publish reviewer trust markers to downstream delivery surfaces and send \"${reviewReadyPreview.subject}\".`
          : isPaid
            ? `${reviewCheckoutPlan.fulfillment} Use \"${paymentReceiptPreview.subject}\" when the add-on is purchased.`
            : "Keep human review unavailable until unlock is complete.",
        outputs: ["review queue item", "trust marker updates", reviewReadyPreview.subject],
        owner: "workers/review",
        status: hasHumanReview ? "completed" : isPaid ? "planned" : "blocked",
        summary: hasHumanReview
          ? `Review completion has already been applied to the trip state and can trigger \"${reviewReadyPreview.subject}\".`
          : isPaid
            ? `A paid trip can move into the reviewer queue with the ${reviewCheckoutPlan.priceLabel} add-on and no schema changes.`
            : "Review assignment remains blocked until the trip is unlocked.",
        title: "Manage reviewer assignment",
        tripId,
        type: hasHumanReview ? "trip_review_completion" : "trip_review_assignment",
        ...(hasHumanReview || isPaid ? {} : { blockingReason: "Trip must be paid before reviewer assignment." })
      },
      {
        id: `validation-refresh-${tripId}`,
        nextStep: "Refresh route validation after any reviewer edit or export-impacting itinerary change.",
        outputs: ["route warnings", "day layer refresh"],
        owner: "workers/routing",
        status: "planned",
        summary: "Route validation should re-run whenever exported or reviewed content changes the itinerary.",
        title: "Refresh route validation",
        tripId,
        type: "route_validation_refresh"
      }
    ],
    summary: isPaid
      ? "Background work is ready to queue for exports and review handling."
      : "Background work is defined, but unlock still gates export and review jobs."
  });
}

export type JobStatus = "queued" | "running" | "succeeded" | "retry_scheduled" | "dead_lettered" | "skipped";

export type WorkerJobKind = "abandoned_checkout_cleanup" | "review_completed_email";

export type ReviewCompletedEmailPayload = {
  recipient: string;
  reviewerNotes?: string;
  tripId: string;
  tripTitle: string;
};

export type AbandonedCheckoutCleanupPayload = {
  cutoffIso: string;
};

export type WorkerJobPayloadMap = {
  abandoned_checkout_cleanup: AbandonedCheckoutCleanupPayload;
  review_completed_email: ReviewCompletedEmailPayload;
};

export type WorkerJobEnvelope<TKind extends WorkerJobKind = WorkerJobKind> = {
  attempts: number;
  id: string;
  idempotencyKey: string;
  kind: TKind;
  maxAttempts: number;
  nextRunAt: string;
  payload: WorkerJobPayloadMap[TKind];
  status: JobStatus;
};

export type AnyWorkerJobEnvelope = {
  [K in WorkerJobKind]: WorkerJobEnvelope<K>;
}[WorkerJobKind];

export type JobAttemptRecord = {
  attempt: number;
  error?: string;
  idempotencyKey: string;
  jobId: string;
  nextRunAt?: string;
  providerMessageId?: string;
  status: JobStatus;
};

export type WorkerRunResult = {
  attempts: JobAttemptRecord[];
  completedDeliveries: ReadonlyArray<CompletedEmailDelivery>;
  jobs: ReadonlyArray<AnyWorkerJobEnvelope>;
  trips: ReadonlyArray<LocalTripRecord>;
};

export type CompletedEmailDelivery = {
  idempotencyKey: string;
  jobId: string;
  providerMessageId: string;
  sentAt: string;
};

export type LocalTripRecord = {
  checkoutCreatedAt: string | null;
  checkoutExpiredAt: string | null;
  checkoutStatus: "expired" | "open" | "paid" | "none";
  id: string;
  paidAt: string | null;
  status: "draft" | "expired" | "paid";
  title: string;
};

export type WorkerStateSeed = {
  completedDeliveries?: CompletedEmailDelivery[];
  jobs?: AnyWorkerJobEnvelope[];
  trips?: LocalTripRecord[];
};

type WorkerClock = {
  now: () => Date;
};

export type WorkerRuntime = WorkerClock & {
  emailProvider: EmailProvider;
  monitor?: MonitoringProvider;
};

export class LocalWorkerState {
  readonly attempts: JobAttemptRecord[] = [];
  readonly completedDeliveries: CompletedEmailDelivery[] = [];
  readonly jobs: AnyWorkerJobEnvelope[] = [];
  readonly trips: LocalTripRecord[] = [];

  constructor(seed: WorkerStateSeed = {}) {
    this.jobs = (seed.jobs ?? []).map(cloneAnyJob);
    this.trips = (seed.trips ?? []).map((trip) => ({ ...trip }));
    this.completedDeliveries = (seed.completedDeliveries ?? []).map((delivery) => ({ ...delivery }));
  }
}

export function enqueueReviewCompletedEmailJob(
  input: ReviewCompletedEmailPayload,
  options: { maxAttempts?: number; now?: Date } = {}
): WorkerJobEnvelope<"review_completed_email"> {
  const message = buildReviewCompleteEmail(input.recipient, {
    reviewerNotes: input.reviewerNotes,
    tripId: input.tripId,
    tripTitle: input.tripTitle
  });

  return {
    attempts: 0,
    id: `email-review-complete-${input.tripId}`,
    idempotencyKey: message.idempotencyKey,
    kind: "review_completed_email",
    maxAttempts: options.maxAttempts ?? 3,
    nextRunAt: (options.now ?? new Date(0)).toISOString(),
    payload: input,
    status: "queued"
  };
}

export function enqueueAbandonedCheckoutCleanupJob(
  input: AbandonedCheckoutCleanupPayload,
  options: { now?: Date } = {}
): WorkerJobEnvelope<"abandoned_checkout_cleanup"> {
  return {
    attempts: 0,
    id: `cleanup-abandoned-checkouts-${input.cutoffIso}`,
    idempotencyKey: `cleanup:abandoned-checkouts:${input.cutoffIso}`,
    kind: "abandoned_checkout_cleanup",
    maxAttempts: 1,
    nextRunAt: (options.now ?? new Date(0)).toISOString(),
    payload: input,
    status: "queued"
  };
}

export async function runLocalWorker(state: LocalWorkerState, runtime: WorkerRuntime): Promise<WorkerRunResult> {
  let runnableJob = findNextRunnableJob(state.jobs, runtime.now());

  while (runnableJob) {
    await runJob(state, runnableJob, runtime);
    runnableJob = findNextRunnableJob(state.jobs, runtime.now());
  }

  return snapshotState(state);
}

export function seedCleanupSafetyState(now: Date = new Date("2026-05-02T00:00:00.000Z")): LocalWorkerState {
  return new LocalWorkerState({
    jobs: [
      enqueueAbandonedCheckoutCleanupJob(
        { cutoffIso: new Date(now.getTime() - 60 * 60 * 1000).toISOString() },
        { now }
      )
    ],
    trips: [
      {
        checkoutCreatedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        checkoutExpiredAt: null,
        checkoutStatus: "open",
        id: "trip-abandoned",
        paidAt: null,
        status: "draft",
        title: "Abandoned checkout"
      },
      {
        checkoutCreatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        checkoutExpiredAt: null,
        checkoutStatus: "paid",
        id: "trip-paid",
        paidAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        status: "paid",
        title: "Active paid trip"
      }
    ]
  });
}

export function summarizeWorkerRun(result: WorkerRunResult): string {
  const lines = [
    `jobs=${result.jobs.length}`,
    `attempts=${result.attempts.length}`,
    `completedDeliveries=${result.completedDeliveries.length}`,
    ...result.attempts.map((attempt) => {
      const provider = attempt.providerMessageId ? ` providerMessageId=${attempt.providerMessageId}` : "";
      const error = attempt.error ? ` error=${attempt.error}` : "";
      return `${attempt.jobId} attempt=${attempt.attempt} status=${attempt.status}${provider}${error}`;
    }),
    ...result.trips.map(
      (trip) =>
        `${trip.id} status=${trip.status} checkoutStatus=${trip.checkoutStatus} paidAt=${trip.paidAt ?? "null"} checkoutExpiredAt=${trip.checkoutExpiredAt ?? "null"}`
    )
  ];

  return `${lines.join("\n")}\n`;
}

async function runJob(state: LocalWorkerState, job: AnyWorkerJobEnvelope, runtime: WorkerRuntime): Promise<void> {
  if (state.completedDeliveries.some((delivery) => delivery.idempotencyKey === job.idempotencyKey)) {
    job.status = "skipped";
    state.attempts.push({
      attempt: job.attempts,
      idempotencyKey: job.idempotencyKey,
      jobId: job.id,
      status: "skipped"
    });
    return;
  }

  job.status = "running";
  job.attempts += 1;

  try {
    if (job.kind === "review_completed_email") {
      await runReviewCompletedEmailJob(state, job, runtime);
      return;
    }

    runAbandonedCheckoutCleanupJob(state, job, runtime);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown worker job failure.";
    if (job.attempts < job.maxAttempts) {
      job.status = "retry_scheduled";
      job.nextRunAt = nextRetryAt(runtime.now(), job.attempts).toISOString();
      state.attempts.push({
        attempt: job.attempts,
        error: message,
        idempotencyKey: job.idempotencyKey,
        jobId: job.id,
        nextRunAt: job.nextRunAt,
        status: "retry_scheduled"
      });
      return;
    }

    job.status = "dead_lettered";
    state.attempts.push({
      attempt: job.attempts,
      error: message,
      idempotencyKey: job.idempotencyKey,
      jobId: job.id,
      status: "dead_lettered"
    });

    if (runtime.monitor) {
      await tryCapture(runtime.monitor, {
        name: "worker_dead_letter",
        severity: "error",
        surface: "worker",
        properties: {
          jobKind: job.kind,
          jobId: job.id,
          attempts: job.attempts,
          maxAttempts: job.maxAttempts,
          errorKind: classifyErrorKind(error)
        }
      });
    }
  }
}

async function runReviewCompletedEmailJob(
  state: LocalWorkerState,
  job: WorkerJobEnvelope<"review_completed_email">,
  runtime: WorkerRuntime
): Promise<void> {
  const message = buildMessageForEmailJob(job.payload);
  const result = await runtime.emailProvider.send(message);
  const delivery = {
    idempotencyKey: message.idempotencyKey,
    jobId: job.id,
    providerMessageId: result.providerMessageId,
    sentAt: runtime.now().toISOString()
  };

  state.completedDeliveries.push(delivery);
  job.status = "succeeded";
  state.attempts.push({
    attempt: job.attempts,
    idempotencyKey: job.idempotencyKey,
    jobId: job.id,
    providerMessageId: result.providerMessageId,
    status: "succeeded"
  });
}

function runAbandonedCheckoutCleanupJob(
  state: LocalWorkerState,
  job: WorkerJobEnvelope<"abandoned_checkout_cleanup">,
  runtime: WorkerRuntime
): void {
  const cutoff = Date.parse(job.payload.cutoffIso);

  for (const trip of state.trips) {
    const createdAt = trip.checkoutCreatedAt ? Date.parse(trip.checkoutCreatedAt) : null;
    const isAbandoned =
      trip.status === "draft" &&
      trip.checkoutStatus === "open" &&
      trip.paidAt === null &&
      createdAt !== null &&
      createdAt <= cutoff;

    if (isAbandoned) {
      trip.status = "expired";
      trip.checkoutStatus = "expired";
      trip.checkoutExpiredAt = runtime.now().toISOString();
    }
  }

  job.status = "succeeded";
  state.attempts.push({
    attempt: job.attempts,
    idempotencyKey: job.idempotencyKey,
    jobId: job.id,
    status: "succeeded"
  });
}

function buildMessageForEmailJob(payload: ReviewCompletedEmailPayload): EmailMessage {
  return buildReviewCompleteEmail(payload.recipient, {
    reviewerNotes: payload.reviewerNotes,
    tripId: payload.tripId,
    tripTitle: payload.tripTitle
  });
}

function findNextRunnableJob(jobs: AnyWorkerJobEnvelope[], now: Date): AnyWorkerJobEnvelope | null {
  return jobs.find((job) => {
    if (job.status !== "queued" && job.status !== "retry_scheduled") return false;
    return Date.parse(job.nextRunAt) <= now.getTime();
  }) ?? null;
}

function nextRetryAt(now: Date, failedAttempt: number): Date {
  return new Date(now.getTime() + failedAttempt * 1000);
}

function cloneJob<TKind extends WorkerJobKind>(job: WorkerJobEnvelope<TKind>): WorkerJobEnvelope<TKind> {
  return {
    ...job,
    payload: { ...job.payload } as WorkerJobPayloadMap[TKind]
  };
}

function cloneAnyJob(job: AnyWorkerJobEnvelope): AnyWorkerJobEnvelope {
  if (job.kind === "review_completed_email") {
    return cloneJob(job);
  }

  return cloneJob(job);
}

function snapshotState(state: LocalWorkerState): WorkerRunResult {
  return {
    attempts: state.attempts.map((attempt) => ({ ...attempt })),
    completedDeliveries: state.completedDeliveries.map((delivery) => ({ ...delivery })),
    jobs: state.jobs.map(cloneAnyJob),
    trips: state.trips.map((trip) => ({ ...trip }))
  };
}
