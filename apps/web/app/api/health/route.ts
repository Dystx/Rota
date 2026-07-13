import { handleHealthRequest } from "./handler";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleHealthRequest();
}
