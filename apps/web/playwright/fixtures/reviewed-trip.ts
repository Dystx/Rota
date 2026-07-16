import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.resolve(__dirname, "..", ".auth", "reviewed-trip.json");
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export type ReviewedTripFixture = {
  ownerUserId: string;
  tripBriefId: string;
  tripId: string;
};

const CONTRACT_FIXTURE: ReviewedTripFixture = {
  ownerUserId: "00000000-0000-4000-8000-000000000413",
  tripBriefId: "00000000-0000-4000-8000-000000000403",
  tripId: "00000000-0000-4000-8000-000000000404"
};

function parseFixture(value: unknown): ReviewedTripFixture {
  if (!value || typeof value !== "object") {
    throw new Error("[playwright] Reviewed trip fixture is not an object.");
  }
  const fixture = value as Partial<ReviewedTripFixture>;
  if (
    typeof fixture.ownerUserId !== "string" ||
    typeof fixture.tripBriefId !== "string" ||
    typeof fixture.tripId !== "string" ||
    !UUID_PATTERN.test(fixture.ownerUserId) ||
    !UUID_PATTERN.test(fixture.tripBriefId) ||
    !UUID_PATTERN.test(fixture.tripId)
  ) {
    throw new Error("[playwright] Reviewed trip fixture has an invalid shape.");
  }
  return {
    ownerUserId: fixture.ownerUserId,
    tripBriefId: fixture.tripBriefId,
    tripId: fixture.tripId
  };
}

export function readReviewedTripFixture(): ReviewedTripFixture {
  if (!fs.existsSync(FIXTURE_PATH)) return CONTRACT_FIXTURE;
  return parseFixture(JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")));
}

export function reviewedTripPath(suffix = ""): string {
  return `/trip/${encodeURIComponent(readReviewedTripFixture().tripId)}${suffix}`;
}
