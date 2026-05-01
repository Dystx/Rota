import { buildEmailPreview } from "@repo/emails";
import { getCheckoutPlan } from "@repo/payments";
import { WorkerPlanSchema, type WorkerPlan } from "@repo/types";

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
