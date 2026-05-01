import { createPlace, listPlaces } from "@repo/db";
import { CreatePlaceSchema } from "@repo/types";

export async function GET() {
  try {
    const places = await listPlaces();

    return Response.json({ places });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load places.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CreatePlaceSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        errors: parsed.error.flatten().fieldErrors,
        message: "Place validation failed."
      },
      { status: 400 }
    );
  }

  try {
    const place = await createPlace(parsed.data);

    return Response.json(
      {
        message: "Place saved.",
        place
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create place.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}
