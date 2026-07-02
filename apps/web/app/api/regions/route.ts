import { createRegion, listRegions , writeAuditTrail } from "@repo/db";
import { CreateRegionSchema } from "@repo/types";
import { internalError, isApiResponse, requireApiRole, validationError } from "@/lib/auth/api";

export async function GET() {
  const auth = await requireApiRole(["admin"]);

  if (isApiResponse(auth)) {
    return auth;
  }

  try {
    const regions = await listRegions(100, { client: auth.client });

    return Response.json({ regions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load regions.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to load regions.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireApiRole(["admin"]);

  if (isApiResponse(auth)) {
    return auth;
  }

  const body = await request.json();
  const parsed = CreateRegionSchema.safeParse(body);

  if (!parsed.success) {
    return validationError("Region validation failed.", parsed.error.flatten().fieldErrors);
  }

  try {
    const region = await createRegion(parsed.data, { client: auth.client });
    
    await writeAuditTrail({
      actorUserId: auth.userId,
      action: "create",
      entityType: "regions",
      entityId: region.id,
      after: region
    }, { client: auth.client });

    return Response.json(
      {
        message: "Region saved.",
        region
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create region.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to create region.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}
