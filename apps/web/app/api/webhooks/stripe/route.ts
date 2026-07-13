import { handleStripeWebhookRequest } from "./handler";

export async function POST(request: Request) {
  return handleStripeWebhookRequest(request);
}
