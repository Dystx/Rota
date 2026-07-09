import { generateItineraryFromBrief } from "@repo/ai";
import { isPersistenceConfigError } from "@repo/db";
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
    const access = await getOwnedTrip(tripId);

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
    markExportJobError(tripId);
    return internalError(
      isPersistenceConfigError(error) ? "Supabase environment variables are not configured yet, so exports are unavailable." : "Could not export this trip.",
      isPersistenceConfigError(error) ? 503 : 500
    );
  }
}
