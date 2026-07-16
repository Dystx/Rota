import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.resolve(__dirname, "..", ".auth", "reviewer-trip.json");
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export type ReviewerTripVariant = "assigned" | "completed" | "unassigned";

type ReviewerTripFixtureRecord = {
  reviewerUserId: string;
  assignedTripId: string;
  completedTripId: string;
  unassignedTripId: string;
};

export type ReviewerTripFixture = {
  reviewerUserId: string;
  tripId: string;
  variant: ReviewerTripVariant;
};

const CONTRACT_FIXTURE: ReviewerTripFixtureRecord = {
  reviewerUserId: "00000000-0000-4000-8000-000000000412",
  assignedTripId: "00000000-0000-4000-8000-000000000401",
  completedTripId: "00000000-0000-4000-8000-000000000404",
  unassignedTripId: "00000000-0000-4000-8000-000000000407"
};

function parseFixture(value: unknown): ReviewerTripFixtureRecord {
  if (!value || typeof value !== "object") {
    throw new Error("[playwright] Reviewer trip fixture is not an object.");
  }
  const fixture = value as Partial<ReviewerTripFixtureRecord>;
  if (
    typeof fixture.reviewerUserId !== "string" ||
    typeof fixture.assignedTripId !== "string" ||
    typeof fixture.completedTripId !== "string" ||
    typeof fixture.unassignedTripId !== "string" ||
    !UUID_PATTERN.test(fixture.reviewerUserId) ||
    !UUID_PATTERN.test(fixture.assignedTripId) ||
    !UUID_PATTERN.test(fixture.completedTripId) ||
    !UUID_PATTERN.test(fixture.unassignedTripId)
  ) {
    throw new Error("[playwright] Reviewer trip fixture has an invalid shape.");
  }
  return {
    assignedTripId: fixture.assignedTripId,
    completedTripId: fixture.completedTripId,
    reviewerUserId: fixture.reviewerUserId,
    unassignedTripId: fixture.unassignedTripId
  };
}

function readRecord(): ReviewerTripFixtureRecord {
  if (!fs.existsSync(FIXTURE_PATH)) return CONTRACT_FIXTURE;
  return parseFixture(JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")));
}

export function readReviewerTripFixture(variant: ReviewerTripVariant = "assigned"): ReviewerTripFixture {
  const fixture = readRecord();
  const tripId = variant === "assigned" ? fixture.assignedTripId : variant === "completed" ? fixture.completedTripId : fixture.unassignedTripId;
  return { reviewerUserId: fixture.reviewerUserId, tripId, variant };
}

export function reviewerTripPath(variant: ReviewerTripVariant = "assigned"): string {
  return `/reviewer/trips/${encodeURIComponent(readReviewerTripFixture(variant).tripId)}`;
}
