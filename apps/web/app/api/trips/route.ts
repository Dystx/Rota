import { createTripDraft } from "@repo/db";
import { TripBriefSchema } from "@repo/types";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = TripBriefSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        errors: parsed.error.flatten().fieldErrors,
        message: "Trip brief validation failed."
      },
      { status: 400 }
    );
  }

  try {
    const result = await createTripDraft(parsed.data);

    return Response.json(
      {
        message: "Trip brief saved.",
        ...result
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create draft trip.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}
