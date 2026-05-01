import type { TripDraftDetail } from "@repo/db";
import { buildRouteValidation } from "@repo/routing";
import type { Itinerary } from "@repo/types";
import { getTripCommerceState } from "@/lib/trip-commerce";

type ExportOption = {
  description: string;
  href: string;
  label: string;
};

function buildTripExportLines(trip: TripDraftDetail, itinerary: Itinerary) {
  const tripCommerceState = getTripCommerceState({
    hasHumanReview: trip.hasHumanReview,
    isPaid: trip.isPaid
  });
  const routeValidation = buildRouteValidation(itinerary);
  const lines = [
    `# ${trip.title}`,
    "",
    `Access: ${tripCommerceState.accessLabel}`,
    `Export: ${tripCommerceState.exportLabel}`,
    `Human review: ${tripCommerceState.reviewLabel}`,
    `Regions: ${trip.brief.regions.join(", ")}`,
    `Travelers: ${trip.brief.travelersCount}`,
    `Transport: ${trip.brief.transportMode}`,
    "",
    "Route overview",
    itinerary.routeOverview,
    "",
    "Route validation",
    routeValidation.summary,
    ""
  ];

  if (routeValidation.warnings.length > 0) {
    lines.push("Validation warnings", "");

    for (const warning of routeValidation.warnings) {
      lines.push(`- ${warning.title}: ${warning.detail}`);
    }

    lines.push("");
  }

  for (const day of itinerary.days) {
    lines.push(`Day ${day.dayIndex} · ${day.theme}`, "", day.summary, "", `Transport: ${day.transportAssumption}`, "");

    for (const stop of day.stops) {
      lines.push(`- ${stop.startTime}–${stop.endTime} · ${stop.placeName}`, `  Why: ${stop.reason}`, `  Tip: ${stop.localTip}`);

      if (stop.warning) {
        lines.push(`  Warning: ${stop.warning}`);
      }
    }

    if (day.warnings.length > 0) {
      lines.push("", "Warnings:");

      for (const warning of day.warnings) {
        lines.push(`- ${warning}`);
      }
    }

    lines.push("");
  }

  if (itinerary.missingInfo.length > 0) {
    lines.push("Follow-up questions", "");

    for (const question of itinerary.missingInfo) {
      lines.push(`- ${question.title}: ${question.question}`);
    }

    lines.push("");
  }

  return lines;
}

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "rota-trip";
}

function sanitizePdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildPdfStream(lines: string[]) {
  const content = ["BT", "/F1 12 Tf", "14 TL", "50 760 Td"];

  for (const line of lines) {
    if (line.length === 0) {
      content.push("T*");
      continue;
    }

    content.push(`(${sanitizePdfText(line)}) Tj`, "T*");
  }

  content.push("ET");

  return content.join("\n");
}

function paginateLines(lines: string[], pageSize: number) {
  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += pageSize) {
    pages.push(lines.slice(index, index + pageSize));
  }

  return pages;
}

function formatCalendarDate(date: Date, time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const calendarDate = new Date(date);

  calendarDate.setHours(hours, minutes, 0, 0);

  const year = calendarDate.getFullYear();
  const month = String(calendarDate.getMonth() + 1).padStart(2, "0");
  const day = String(calendarDate.getDate()).padStart(2, "0");
  const hour = String(calendarDate.getHours()).padStart(2, "0");
  const minute = String(calendarDate.getMinutes()).padStart(2, "0");

  return `${year}${month}${day}T${hour}${minute}00`;
}

function escapeCalendarText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildTripMarkdownExport(trip: TripDraftDetail, itinerary: Itinerary) {
  return buildTripExportLines(trip, itinerary)
    .map((line) => {
      if (line === "Route overview") {
        return "## Route overview";
      }

      if (line === "Route validation") {
        return "## Route validation";
      }

      if (line === "Validation warnings") {
        return "### Validation warnings";
      }

      if (line === "Follow-up questions") {
        return "## Follow-up questions";
      }

      if (line.startsWith("Day ")) {
        return `## ${line}`;
      }

      if (line.startsWith("  Why:")) {
        return line.replace("  Why:", "  - Why:");
      }

      if (line.startsWith("  Tip:")) {
        return line.replace("  Tip:", "  - Tip:");
      }

      if (line.startsWith("  Warning:")) {
        return line.replace("  Warning:", "  - Warning:");
      }

      if (
        line.startsWith("Access:") ||
        line.startsWith("Export:") ||
        line.startsWith("Human review:") ||
        line.startsWith("Regions:") ||
        line.startsWith("Travelers:") ||
        line.startsWith("Transport:")
      ) {
        return `- ${line}`;
      }

      return line;
    })
    .join("\n");
}

export function buildTripPdfExport(trip: TripDraftDetail, itinerary: Itinerary) {
  const pages = paginateLines(buildTripExportLines(trip, itinerary), 42);
  const objects: string[] = [];
  const pageObjectIds = pages.map((_, index) => 4 + index * 2);
  const contentObjectIds = pages.map((_, index) => 5 + index * 2);

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Count ${pages.length} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  pages.forEach((pageLines, index) => {
    const pageId = 4 + index * 2;
    const contentId = 5 + index * 2;
    const stream = buildPdfStream(pageLines);

    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    offsets[objectId] = Buffer.byteLength(pdf, "utf8");
    pdf += `${objectId} 0 obj\n${objects[objectId]}\nendobj\n`;
  }

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    pdf += `${String(offsets[objectId]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

export function buildTripCalendarExport(trip: TripDraftDetail, itinerary: Itinerary) {
  const tripStartDate = new Date(trip.brief.startDate ?? new Date().toISOString());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Rota//Trip Export//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  for (const day of itinerary.days) {
    const dayDate = new Date(tripStartDate);
    dayDate.setDate(tripStartDate.getDate() + day.dayIndex - 1);

    for (const stop of day.stops) {
      lines.push(
        "BEGIN:VEVENT",
        `UID:${trip.id}-${day.dayIndex}-${stop.placeName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}@rota`,
        `DTSTAMP:${formatCalendarDate(new Date(), "00:00")}`,
        `DTSTART:${formatCalendarDate(dayDate, stop.startTime)}`,
        `DTEND:${formatCalendarDate(dayDate, stop.endTime)}`,
        `SUMMARY:${escapeCalendarText(`${trip.title} — ${stop.placeName}`)}`,
        `DESCRIPTION:${escapeCalendarText(`${stop.reason}\n${stop.localTip}`)}`,
        "END:VEVENT"
      );
    }
  }

  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

export function buildTripExportFilename(title: string) {
  return `${slugifyTitle(title)}.md`;
}

export function buildTripPdfFilename(title: string) {
  return `${slugifyTitle(title)}.pdf`;
}

export function buildTripCalendarFilename(title: string) {
  return `${slugifyTitle(title)}.ics`;
}

export function buildTripSharePath(tripId: string) {
  return `/trip/${tripId}`;
}

export function listTripExportOptions(tripId: string): ExportOption[] {
  return [
    {
      description: "Download a simple itinerary PDF with route summary, day plans, warnings, and reviewer markers.",
      href: `/api/trips/${tripId}/export?format=pdf`,
      label: "PDF itinerary"
    },
    {
      description: "Add itinerary stops to a calendar app as timed events.",
      href: `/api/trips/${tripId}/export?format=calendar`,
      label: "Calendar export"
    },
    {
      description: "Download the raw structured itinerary as markdown.",
      href: `/api/trips/${tripId}/export?format=markdown`,
      label: "Markdown export"
    },
    {
      description: "Open a print-focused version of the itinerary in the browser.",
      href: `/trip/${tripId}/export?view=print`,
      label: "Print-friendly itinerary"
    }
  ];
}
