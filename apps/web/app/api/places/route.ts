import { createPlace, listPlaces , writeAuditTrail } from "@repo/db";
import { CreatePlaceSchema } from "@repo/types";
import { internalError, isApiResponse, requireApiRole, validationError, type AuthorizedApiContext } from "@/lib/auth/api";

type PlacesRouteDependencies = {
  createPlaceRecord?: typeof createPlace;
  listPlaceRecords?: typeof listPlaces;
  requireAdmin?: () => Promise<AuthorizedApiContext | Response>;
};

export async function handlePlacesGetRequest(dependencies: PlacesRouteDependencies = {}) {
  const requireAdmin = dependencies.requireAdmin ?? (() => requireApiRole(["admin"]));
  const listPlaceRecords = dependencies.listPlaceRecords ?? listPlaces;
  const auth = await requireAdmin();

  if (isApiResponse(auth)) {
    return auth;
  }

  try {
    const places = await listPlaceRecords(100, { client: auth.client });

    return Response.json({ places });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load places.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to load places.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}

export async function handlePlacesPostRequest(request: Request, dependencies: PlacesRouteDependencies = {}) {
  const requireAdmin = dependencies.requireAdmin ?? (() => requireApiRole(["admin"]));
  const createPlaceRecord = dependencies.createPlaceRecord ?? createPlace;
  const auth = await requireAdmin();

  if (isApiResponse(auth)) {
    return auth;
  }

  const body = await request.json();
  const parsed = CreatePlaceSchema.safeParse(body);

  if (!parsed.success) {
    return validationError("Place validation failed.", parsed.error.flatten().fieldErrors);
  }

  try {
    const place = await createPlaceRecord(parsed.data, { client: auth.client });
    
    await writeAuditTrail({
      actorUserId: auth.userId,
      action: "create",
      entityType: "places",
      entityId: place.id,
      after: place
    }, { client: auth.client });

    return Response.json(
      {
        message: "Place saved.",
        place
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create place.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to create place.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}

export async function GET() {
  return handlePlacesGetRequest();
}

export async function POST(request: Request) {
  return handlePlacesPostRequest(request);
}
