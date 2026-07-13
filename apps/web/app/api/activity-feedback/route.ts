import { handleActivityFeedbackPost } from "./handler";

export async function POST(request: Request) {
  return handleActivityFeedbackPost(request);
}
