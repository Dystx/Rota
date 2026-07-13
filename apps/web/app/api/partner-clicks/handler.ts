import { createBookingClick } from "@repo/db";
import {
  resolveDefaultAnalyticsProvider,
  safeTargetHost,
  tryCapture,
  type AnalyticsProvider
} from "@repo/analytics";
import { validationError } from "@/lib/auth/api";

const allowedProtocols = new Set(["http:", "https:"]);

type PartnerClickDependencies = {
  analytics?: AnalyticsProvider;
  createClick?: typeof createBookingClick;
};

export async function handlePartnerClickRequest(
  request: Request,
  dependencies: PartnerClickDependencies = {}
) {
  const createClick = dependencies.createClick ?? createBookingClick;
  const analytics = dependencies.analytics ?? resolveDefaultAnalyticsProvider();

  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target");
  const partnerId = searchParams.get("partnerId");
  const tripId = searchParams.get("tripId");
  const source = searchParams.get("source");

  if (!target || !partnerId || !tripId || !source) {
    return validationError("Missing partner click parameters.");
  }

  let destination: URL;

  try {
    destination = new URL(target);
  } catch {
    return validationError("Invalid partner link.");
  }

  if (!allowedProtocols.has(destination.protocol)) {
    return validationError("Unsupported partner link protocol.");
  }

  try {
    await createClick({
      partnerId,
      referer: request.headers.get("referer"),
      source,
      target: destination.toString(),
      tripId,
      userAgent: request.headers.get("user-agent")
    });
  } catch {
    // Preserve redirect behavior when best-effort click persistence is unavailable.
  }

  await tryCapture(analytics, {
    name: "partner_clicked",
    distinctId: `trip:${tripId}`,
    properties: {
      partner_id: partnerId,
      trip_id: tripId,
      source,
      target_host: safeTargetHost(destination.toString())
    }
  });

  return Response.redirect(destination, 307);
}
