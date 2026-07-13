import { getRegionById, updateRegion , writeAuditTrail } from "@repo/db";
import { UpdateRegionSchema } from "@repo/types";
import { internalError, isApiResponse, notFoundError, requireApiRole, validationError } from "@/lib/auth/api";

export async function GET(_request: Request, { params }: { params: Promise<{ regionId: string }> }) {
  const auth = await requireApiRole(["admin"]);

  if (isApiResponse(auth)) {
    return auth;
  }

  const { regionId } = await params;

  try {
    const region = await getRegionById(regionId, { actor: auth.actor });

    if (!region) {
      return notFoundError("Region not found.");
    }

    return Response.json({ region });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load region.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to load region.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ regionId: string }> }) {
  const auth = await requireApiRole(["admin"]);

  if (isApiResponse(auth)) {
    return auth;
  }

  const { regionId } = await params;
  const body = await request.json();
  const parsed = UpdateRegionSchema.safeParse(body);

  if (!parsed.success) {
    return validationError("Region update validation failed.", parsed.error.flatten().fieldErrors);
  }

  try {
    const region = await updateRegion(regionId, parsed.data, { actor: auth.actor });
    
    if (region) {
      await writeAuditTrail({
        actorUserId: auth.userId,
        action: "update",
        entityType: "regions",
        entityId: region.id,
        before: null,
        after: region
      }, { actor: auth.actor });
    }

    if (!region) {
      return notFoundError("Region not found.");
    }

    return Response.json({ message: "Region updated.", region });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update region.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to update region.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}
