import { handleReviewerAssignmentsGetRequest, handleReviewerAssignmentsPostRequest } from "./handler";

export async function GET(request: Request) {
  return handleReviewerAssignmentsGetRequest(request);
}

export async function POST(request: Request) {
  return handleReviewerAssignmentsPostRequest(request);
}
