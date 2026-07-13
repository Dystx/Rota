import { handleTripReviewRequest } from "./handler";

export async function POST(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return handleTripReviewRequest(request, tripId);
}
