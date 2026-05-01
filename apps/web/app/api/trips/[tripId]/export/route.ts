import { generateItineraryFromBrief } from "@repo/ai";
import { getTripDraftById, isPersistenceConfigError } from "@repo/db";
import {
  buildTripCalendarExport,
  buildTripCalendarFilename,
  buildTripExportFilename,
  buildTripMarkdownExport,
  buildTripPdfExport,
  buildTripPdfFilename
} from "@/lib/trip-export";

export async function GET(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "markdown";

  if (!["markdown", "pdf", "calendar"].includes(format)) {
    return Response.json({ message: "Supported export formats are markdown, pdf, and calendar." }, { status: 400 });
  }

  try {
    const trip = await getTripDraftById(tripId);

    if (!trip) {
      return Response.json({ message: "Trip not found." }, { status: 404 });
    }

    if (!trip.isPaid) {
      return Response.json({ message: "Unlock the trip before exporting it." }, { status: 403 });
    }

    const itinerary = await generateItineraryFromBrief(trip.brief);

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
    return Response.json(
      {
        message: isPersistenceConfigError(error)
          ? "Supabase environment variables are not configured yet, so exports are unavailable."
          : error instanceof Error
            ? error.message
            : "Could not export this trip."
      },
      { status: isPersistenceConfigError(error) ? 503 : 500 }
    );
  }
}
