import { getPlaceById, updatePlace , writeAuditTrail } from "@repo/db";
import { UpdatePlaceSchema } from "@repo/types";
import { internalError, isApiResponse, notFoundError, requireApiRole, validationError } from "@/lib/auth/api";

export async function GET(_request: Request, { params }: { params: Promise<{ placeId: string }> }) {
  const auth = await requireApiRole(["admin"]);

  if (isApiResponse(auth)) {
    return auth;
  }

  const { placeId } = await params;

  try {
    const place = await getPlaceById(placeId, { client: auth.client });

    if (!place) {
      return notFoundError("Place not found.");
    }

    return Response.json({ place });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load place.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to load place.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ placeId: string }> }) {
  const auth = await requireApiRole(["admin"]);

  if (isApiResponse(auth)) {
    return auth;
  }

  const { placeId } = await params;
  const body = await request.json();
  const parsed = UpdatePlaceSchema.safeParse(body);

  if (!parsed.success) {
    return validationError("Place update validation failed.", parsed.error.flatten().fieldErrors);
  }

  try {
    const place = await updatePlace(placeId, parsed.data, { client: auth.client });
    
    if (place) {
      await writeAuditTrail({
        actorUserId: auth.userId,
        action: "update",
        entityType: "places",
        entityId: place.id,
        before: null,
        after: place
      }, { client: auth.client });
    }

    if (!place) {
      return notFoundError("Place not found.");
    }

    return Response.json({ message: "Place updated.", place });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update place.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to update place.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}
