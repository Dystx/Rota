import { createTripDraft } from "@repo/db";
import { TripBriefSchema, type TripBriefValidationErrors } from "@repo/types";
import {
  resolveDefaultAnalyticsProvider,
  tryCapture,
  type AnalyticsProvider
} from "@repo/analytics";
import {
  classifyErrorKind,
  resolveDefaultMonitoringProvider,
  safeMonitoringRoute,
  tryCapture as tryCaptureMonitoring,
  type MonitoringProvider
} from "@repo/monitoring";
import { internalError, isApiResponse, requireApiRole, validationError, type AuthorizedApiContext } from "@/lib/auth/api";

const invalidJsonErrors = {
  rawBrief: ["Request body must be valid JSON."]
} satisfies TripBriefValidationErrors;

type TripCreateDependencies = {
  analytics?: AnalyticsProvider;
  createDraft?: typeof createTripDraft;
  monitor?: MonitoringProvider;
  requireTraveler?: () => Promise<AuthorizedApiContext | Response>;
};

export async function handleTripCreateRequest(request: Request, dependencies: TripCreateDependencies = {}) {
  const requireTraveler = dependencies.requireTraveler ?? (() => requireApiRole(["traveler"]));
  const createDraft = dependencies.createDraft ?? createTripDraft;
  const analytics = dependencies.analytics ?? resolveDefaultAnalyticsProvider();
  const monitor = dependencies.monitor ?? resolveDefaultMonitoringProvider();
  const auth = await requireTraveler();

  if (isApiResponse(auth)) {
    return auth;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return validationError("Trip brief validation failed.", invalidJsonErrors);
  }

  const parsed = TripBriefSchema.safeParse(body);

  if (!parsed.success) {
    return validationError("Trip brief validation failed.", parsed.error.flatten().fieldErrors);
  }

  try {
    const result = await createDraft(parsed.data, { ownerUserId: auth.userId });

    await tryCapture(analytics, {
      name: "trip_created",
      distinctId: auth.userId,
      properties: {
        trip_id: String(result.tripId),
        trip_brief_id: String(result.tripBriefId),
        country: parsed.data.destinationCountry,
        days: parsed.data.tripLengthDays,
        traveler_type: parsed.data.travelerType,
        transport_mode: parsed.data.transportMode,
        budget_level: parsed.data.budgetLevel,
        pace: parsed.data.pace,
        travelers_count: parsed.data.travelersCount,
        interests_count: parsed.data.interests.length,
        regions_count: parsed.data.regions.length
      }
    });

    return Response.json(
      {
        message: "Trip brief saved.",
        ...result
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create draft trip.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;
    const errorCode = status === 503 ? "service_unavailable" : "internal_error";

    await tryCaptureMonitoring(monitor, {
      name: "api_error",
      severity: "error",
      surface: "api",
      properties: {
        route: safeMonitoringRoute("/api/trips"),
        method: "POST",
        status,
        errorCode,
        errorKind: classifyErrorKind(error)
      }
    });

    return internalError(status === 503 ? "Persistence is not configured." : "Failed to create draft trip.", status);
  }
}

export async function POST(request: Request) {
  return handleTripCreateRequest(request);
}
