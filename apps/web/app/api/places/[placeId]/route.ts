import { getPlaceById, updatePlace } from "@repo/db";
import { UpdatePlaceSchema } from "@repo/types";

export async function GET(_request: Request, { params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;

  try {
    const place = await getPlaceById(placeId);

    if (!place) {
      return Response.json({ message: "Place not found." }, { status: 404 });
    }

    return Response.json({ place });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load place.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  const body = await request.json();
  const parsed = UpdatePlaceSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        errors: parsed.error.flatten().fieldErrors,
        message: "Place update validation failed."
      },
      { status: 400 }
    );
  }

  try {
    const place = await updatePlace(placeId, parsed.data);

    if (!place) {
      return Response.json({ message: "Place not found." }, { status: 404 });
    }

    return Response.json({ message: "Place updated.", place });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update place.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}
