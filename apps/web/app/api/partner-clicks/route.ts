import { handlePartnerClickRequest } from "./handler";

export async function GET(request: Request) {
  return handlePartnerClickRequest(request);
}
