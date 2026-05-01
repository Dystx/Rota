import { createPartner, listPartners } from "@repo/db";
import { CreatePartnerSchema } from "@repo/types";

export async function GET() {
  try {
    const partners = await listPartners();

    return Response.json({ partners });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load partners.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CreatePartnerSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        errors: parsed.error.flatten().fieldErrors,
        message: "Partner validation failed."
      },
      { status: 400 }
    );
  }

  try {
    const partner = await createPartner(parsed.data);

    return Response.json(
      {
        message: "Partner saved.",
        partner
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create partner.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}
