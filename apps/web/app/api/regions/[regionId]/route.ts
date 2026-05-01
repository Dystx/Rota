import { getRegionById, updateRegion } from "@repo/db";
import { UpdateRegionSchema } from "@repo/types";

export async function GET(_request: Request, { params }: { params: Promise<{ regionId: string }> }) {
  const { regionId } = await params;

  try {
    const region = await getRegionById(regionId);

    if (!region) {
      return Response.json({ message: "Region not found." }, { status: 404 });
    }

    return Response.json({ region });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load region.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ regionId: string }> }) {
  const { regionId } = await params;
  const body = await request.json();
  const parsed = UpdateRegionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        errors: parsed.error.flatten().fieldErrors,
        message: "Region update validation failed."
      },
      { status: 400 }
    );
  }

  try {
    const region = await updateRegion(regionId, parsed.data);

    if (!region) {
      return Response.json({ message: "Region not found." }, { status: 404 });
    }

    return Response.json({ message: "Region updated.", region });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update region.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}
