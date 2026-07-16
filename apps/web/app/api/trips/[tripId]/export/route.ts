import { generateItineraryFromBrief } from "@repo/ai";
import { isPersistenceConfigError, isSchemaDriftError } from "@repo/db";
import {
  buildTripCalendarExport,
  buildTripCalendarFilename,
  buildTripExportFilename,
  buildTripMarkdownExport,
  buildTripPdfExport,
  buildTripPdfFilename
} from "@/lib/trip-export";
import { internalError, isApiResponse, notFoundError, requireApiRole, validationError, forbiddenError } from "@/lib/auth/api";
import { getOwnedTrip } from "@/app/lib/trip-access";
import { markExportJobError, markExportJobReady, queueExportJob } from "@/app/lib/export-jobs";
import { isSessionProviderFailure } from "@/lib/auth/session-outcome";

export async function GET(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const auth = await requireApiRole(["traveler"]);

  if (isApiResponse(auth)) {
    return auth;
  }

  const { tripId } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "markdown";

  if (!["markdown", "pdf", "calendar"].includes(format)) {
    return validationError("Supported export formats are markdown, pdf, and calendar.");
  }

  try {
    const access = await getOwnedTrip(tripId, { actor: auth.actor });

    if (access.kind === "unavailable") {
      return internalError("Trip access is temporarily unavailable.", 503);
    }

    if (access.kind !== "ok") {
      return notFoundError("Trip not found.");
    }

    const trip = access.trip;

    if (!trip.isPaid) {
      return forbiddenError("Unlock the trip before exporting it.");
    }

    queueExportJob(tripId);
    const itinerary = await generateItineraryFromBrief(trip.brief);
    markExportJobReady(tripId);

    if (format === "pdf") {
      const pdf = buildTripPdfExport(trip, itinerary);

      return new Response(pdf, {
        headers: {
          "Content-Disposition": `attachment; filename="${buildTripPdfFilename(trip.title)}"`,
          "Content-Type": "application/pdf"
        }
      });
    }

    if (format === "calendar") {
      const calendar = buildTripCalendarExport(trip, itinerary);

      return new Response(calendar, {
        headers: {
          "Content-Disposition": `attachment; filename="${buildTripCalendarFilename(trip.title)}"`,
          "Content-Type": "text/calendar; charset=utf-8"
        }
      });
    }

    const markdown = buildTripMarkdownExport(trip, itinerary);

    return new Response(markdown, {
      headers: {
        "Content-Disposition": `attachment; filename="${buildTripExportFilename(trip.title)}"`,
        "Content-Type": "text/markdown; charset=utf-8"
      }
    });
  } catch (error) {
    // Export-state persistence is best effort here: a failing error marker
    // must not replace the safe API response with a provider exception.
    try {
      markExportJobError(tripId);
    } catch {
      // Keep the route boundary deterministic even when the job store is down.
    }
    const unavailable = isPersistenceConfigError(error) || isSchemaDriftError(error) || isSessionProviderFailure(error);

    return internalError(
      unavailable ? "Trip export is temporarily unavailable. Please try again shortly." : "Could not export this trip.",
      unavailable ? 503 : 500
    );
  }
}
