import { createPartner, listPartners , writeAuditTrail } from "@repo/db";
import { CreatePartnerSchema } from "@repo/types";
import { internalError, isApiResponse, requireApiRole, validationError } from "@/lib/auth/api";

export async function GET() {
  const auth = await requireApiRole(["admin"]);

  if (isApiResponse(auth)) {
    return auth;
  }

  try {
    const partners = await listPartners(100, { actor: auth.actor });

    return Response.json({ partners });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load partners.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to load partners.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireApiRole(["admin"]);

  if (isApiResponse(auth)) {
    return auth;
  }

  const body = await request.json();
  const parsed = CreatePartnerSchema.safeParse(body);

  if (!parsed.success) {
    return validationError("Partner validation failed.", parsed.error.flatten().fieldErrors);
  }

  try {
    const partner = await createPartner(parsed.data, { actor: auth.actor });
    
    await writeAuditTrail({
      actorUserId: auth.userId,
      action: "create",
      entityType: "partners",
      entityId: partner.id,
      after: partner
    }, { actor: auth.actor });

    return Response.json(
      {
        message: "Partner saved.",
        partner
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create partner.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to create partner.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}
