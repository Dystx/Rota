import { handleUnlockCheckoutRequest } from "./handler";

export async function POST(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return handleUnlockCheckoutRequest(request, tripId);
}
