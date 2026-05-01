import { createRegion, listRegions } from "@repo/db";
import { CreateRegionSchema } from "@repo/types";

export async function GET() {
  try {
    const regions = await listRegions();

    return Response.json({ regions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load regions.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CreateRegionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        errors: parsed.error.flatten().fieldErrors,
        message: "Region validation failed."
      },
      { status: 400 }
    );
  }

  try {
    const region = await createRegion(parsed.data);

    return Response.json(
      {
        message: "Region saved.",
        region
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create region.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}
