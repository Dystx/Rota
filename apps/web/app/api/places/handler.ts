import { createPlace, listPlaces, writeAuditTrail } from "@repo/db";
import { CreatePlaceSchema } from "@repo/types";
import { internalError, isApiResponse, requireApiRole, validationError, type AuthorizedApiContext } from "@/lib/auth/api";

export type PlacesRouteDependencies = {
  createPlaceRecord?: typeof createPlace;
  listPlaceRecords?: typeof listPlaces;
  writeAuditTrailRecord?: typeof writeAuditTrail;
  requireAdmin?: () => Promise<AuthorizedApiContext | Response>;
};

export async function handlePlacesGetRequest(dependencies: PlacesRouteDependencies = {}) {
  const requireAdmin = dependencies.requireAdmin ?? (() => requireApiRole(["admin"], ["content:manage"]));
  const listPlaceRecords = dependencies.listPlaceRecords ?? listPlaces;
  const auth = await requireAdmin();
  if (isApiResponse(auth)) return auth;

  try {
    const places = await listPlaceRecords(100, { actor: auth.actor });
    return Response.json({ places });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load places.";
    const unavailable = message.startsWith("Missing required environment variable");
    return internalError(unavailable ? "Persistence is not configured." : "Failed to load places.", unavailable ? 503 : 500);
  }
}

export async function handlePlacesPostRequest(request: Request, dependencies: PlacesRouteDependencies = {}) {
  const requireAdmin = dependencies.requireAdmin ?? (() => requireApiRole(["admin"], ["content:manage"]));
  const createPlaceRecord = dependencies.createPlaceRecord ?? createPlace;
  const writeAuditTrailRecord = dependencies.writeAuditTrailRecord ?? writeAuditTrail;
  const auth = await requireAdmin();
  if (isApiResponse(auth)) return auth;

  const parsed = CreatePlaceSchema.safeParse(await request.json());
  if (!parsed.success) return validationError("Place validation failed.", parsed.error.flatten().fieldErrors);

  try {
    const options = { actor: auth.actor };
    const place = await createPlaceRecord(parsed.data, options);
    await writeAuditTrailRecord({ actorUserId: auth.userId, action: "create", entityType: "places", entityId: place.id, after: place }, options);
    return Response.json({ message: "Place saved.", place }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create place.";
    const unavailable = message.startsWith("Missing required environment variable");
    return internalError(unavailable ? "Persistence is not configured." : "Failed to create place.", unavailable ? 503 : 500);
  }
}
