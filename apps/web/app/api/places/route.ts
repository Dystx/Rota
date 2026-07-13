import { handlePlacesGetRequest, handlePlacesPostRequest } from "./handler";

export async function GET() {
  return handlePlacesGetRequest();
}

export async function POST(request: Request) {
  return handlePlacesPostRequest(request);
}
