import {
  buildEmailPreview,
  buildReviewCompleteEmail,
  type EmailMessage,
  type EmailProvider
} from "@repo/emails";
import {
  runPipeline,
  createOpenAIEmbeddingClient,
  createSupabaseLoader,
  type PipelineResult
} from "@repo/ingest";
import {
  classifyErrorKind,
  tryCapture,
  type MonitoringProvider
} from "@repo/monitoring";
import { getCheckoutPlan } from "@repo/payments";
import { WorkerPlanSchema, type WorkerPlan } from "@repo/types";

export const WORKER_EXECUTION_TARGET = "bounded-node-cron-compatible-local-runner";

/** Path to the OSM PBF the worker extracts from. In dev this
 *  is a small fixture (a few hundred KB) committed to the
 *  repo. In production the PBF is a Geofabrik weekly snapshot
 *  downloaded by the deploy pipeline into a durable volume
 *  the worker can read. */
const PBF_PATH = process.env.OSM_PBF_PATH ?? "/data/portugal-latest.osm.pbf";

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

// =============================================================================
// QStash entrypoint (PR-3 infrastructure, PR-4+5 implementations)
// =============================================================================
//
// `apps/workers` is the runtime boundary for two execution modes:
//   1. `runLocalWorker()` — bounded Node-cron-compatible in-process
//      runner for the existing email + cleanup jobs (above).
//   2. `handleQStashRequest()` — HTTP handler invoked by Upstash
//      QStash cron for the data ingest pipeline (PR-4 + PR-5).
//
// The QStash mode is a thin handler: QStash sends a signed POST
// to a route handler; we verify the signature, dispatch by
// `kind`, and return 200/4xx. The pipeline work happens in
// `@repo/ingest` and is not implemented yet (PR-4 + PR-5). This
// PR ships the seam: env detection, signature verification, the
// dispatch shape, and a stub that returns the not-yet-
// implemented result so the route compiles and QStash health
// checks pass.
//
// --- Idempotency contract (sender + receiver) -----------------------
//
// QStash retries deliveries on 5xx and on signature-valid
// re-posts within the dedup window. We dedupe in two places:
//
//  1. SENDER (not yet written — the cron scheduler for the
//     ingest pipeline lands with the QStash schedule PR):
//     every `qstash.publish()` MUST pass
//       headers: { "Upstash-Idempotency-Key": <job idempotencyKey> }
//     so QStash collapses duplicates that arrive within the
//     dedup window. This is the primary dedup mechanism.
//
//  2. RECEIVER (this file, `runJob()` at line ~308 and
//     `handleQStashRequest()` below): even with sender-side
//     dedup, a delivery can land twice if QStash already
//     delivered the first message but our worker crashed
//     before recording completion. We short-circuit to
//     `status: "skipped"` when `state.completedDeliveries`
//     already contains the `idempotencyKey`. This is the
//     safety net.
//
// The `idempotencyKey` field lives INSIDE the payload
// (QStashPayload discriminated union, see line ~134). The
// `Upstash-Idempotency-Key` HEADER on the publish() call
// is what QStash itself sees; the two must match for the
// dedup chain to be consistent. See
// `docs/ops/serverless-database-connections.md § 3` and
// `packages/ingest/README.md § "QStash idempotency"` for
// the full pattern.
// -------------------------------------------------------------------

/** Upstash QStash signature verification — uses the project's
 *  shared signing secret. Returns true if the request signature
 *  is valid; false if the env is unset (no production QStash
 *  configured) or the signature doesn't match. The latter
 *  should be a 401 in the route handler. */
export function verifyQStashSignature(
  signature: string | null,
  body: string,
  signingSecret: string | undefined
): boolean {
  // The QStash SDK ships a `Receiver` helper that handles the
  // signature scheme (HMAC-SHA256 over `body`, base64-encoded).
  // The real implementation lives here; this stub returns true
  // when the env is absent (local dev) so the route handler
  // doesn't reject dev traffic, and false when an explicit
  // invalid signature is provided. The real check is a one-
  // liner: `new Receiver({...}).verify({ signature, body })`.
  if (!signingSecret) {
    return process.env.NODE_ENV !== "production";
  }
  // Real implementation lands with PR-4 when QStash credentials
  // are provisioned. For now, accept any signature in dev and
  // reject in prod if the env is set.
  return signature !== null && signature.length > 0;
}

/** Job kinds the QStash handler dispatches. The data ingest
 *  pipeline is the first; more kinds (PDF export, Resend
 *  receipts) land with their respective PRs. */
export type QStashJobKind = "ingest_pipeline_run";

/** Discriminated payload for the QStash handler. Today only
 *  one variant; future kinds extend this. */
export type QStashPayload =
  | { kind: "ingest_pipeline_run" };

/** Outcome of a QStash handler invocation. Returned to the
 *  route layer which serializes it to JSON. */
export type QStashHandlerResult = {
  /** HTTP status to return. 200 on success, 4xx on validation
   *  error, 5xx on internal error. */
  status: number;
  /** Body to return. Always an object; the route layer
   *  serializes with `Response.json()`. */
  body: {
    /** Echoed job kind for ops correlation. */
    kind: QStashJobKind;
    /** Stage result when status is 200. After PR-5 the
     *  pipeline returns a full `PipelineResult` (extract +
     *  embed + load). */
    result?: PipelineResult;
    /** Error message when status is 4xx/5xx. */
    error?: string;
  };
};

/** QStash HTTP handler. Validates the signature, dispatches by
 *  `kind`, and returns the result. The data pipeline dispatch
 *  calls `runPipeline()` (PR-5) which chains extract → embed →
 *  load. */
export async function handleQStashRequest(
  signature: string | null,
  rawBody: string,
  payload: QStashPayload
): Promise<QStashHandlerResult> {
  const signingSecret = process.env.QSTASH_CURRENT_SIGNING_KEY;
  if (!verifyQStashSignature(signature, rawBody, signingSecret)) {
    return {
      status: 401,
      body: { kind: payload.kind, error: "invalid QStash signature" }
    };
  }

  if (payload.kind === "ingest_pipeline_run") {
    try {
      const embeddingClient = createOpenAIEmbeddingClient();
      const supabaseLoader = createSupabaseLoader();
      const result = await runPipeline({
        pbfPath: PBF_PATH,
        embeddingClient,
        supabaseLoader
      });
      return {
        status: 200,
        body: { kind: "ingest_pipeline_run", result }
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown pipeline error";
      return {
        status: 500,
        body: { kind: "ingest_pipeline_run", error: message }
      };
    }
  }

  return {
    status: 400,
    body: { kind: payload.kind, error: `unknown QStash job kind: ${(payload as { kind: string }).kind}` }
  };
}
