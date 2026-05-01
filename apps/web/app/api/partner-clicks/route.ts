import { createBookingClick } from "@repo/db";

const allowedProtocols = new Set(["http:", "https:"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target");
  const partnerId = searchParams.get("partnerId");
  const tripId = searchParams.get("tripId");
  const source = searchParams.get("source");

  if (!target || !partnerId || !tripId || !source) {
    return Response.json({ message: "Missing partner click parameters." }, { status: 400 });
  }

  let destination: URL;

  try {
    destination = new URL(target);
  } catch {
    return Response.json({ message: "Invalid partner link." }, { status: 400 });
  }

  if (!allowedProtocols.has(destination.protocol)) {
    return Response.json({ message: "Unsupported partner link protocol." }, { status: 400 });
  }

  try {
    await createBookingClick({
      partnerId,
      referer: request.headers.get("referer"),
      source,
      target: destination.toString(),
      tripId,
      userAgent: request.headers.get("user-agent")
    });
  } catch (error) {
    console.error("Failed to persist partner click", error);
  }

  return Response.redirect(destination, 307);
}
