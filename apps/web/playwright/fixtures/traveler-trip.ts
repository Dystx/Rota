import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { readReviewerTripFixture } from "./reviewer-trip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.resolve(__dirname, "..", ".auth", "traveler-trip.json");
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const CONTRACT_FIXTURE: TravelerTripFixture = {
  ownerUserId: "00000000-0000-4000-8000-000000000413",
  tripBriefId: "00000000-0000-4000-8000-000000000415",
  tripId: "00000000-0000-4000-8000-000000000416"
};

export type TravelerTripFixture = {
  tripId: string;
  tripBriefId: string;
  ownerUserId: string;
};

/**
 * Reads the trip created by Playwright global setup for the E2E traveler.
 *
 * The fixture is deliberately generated at runtime rather than relying on a
 * well-known database id. This keeps the suite safe against shared hosted
 * data owned by another user and makes route assertions exercise ownership.
 */
export function readTravelerTripFixture(): TravelerTripFixture {
  if (!fs.existsSync(FIXTURE_PATH)) {
    return CONTRACT_FIXTURE;
  }

  const parsed: unknown = JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8"));
  if (!parsed || typeof parsed !== "object") {
    throw new Error("[playwright] Traveler trip fixture is not an object.");
  }

  const fixture = parsed as Partial<TravelerTripFixture>;
  if (
    typeof fixture.tripId !== "string" ||
    typeof fixture.tripBriefId !== "string" ||
    typeof fixture.ownerUserId !== "string" ||
    !UUID_PATTERN.test(fixture.tripId) ||
    !UUID_PATTERN.test(fixture.tripBriefId) ||
    !UUID_PATTERN.test(fixture.ownerUserId)
  ) {
    throw new Error("[playwright] Traveler trip fixture has an invalid shape.");
  }

  return {
    ownerUserId: fixture.ownerUserId,
    tripBriefId: fixture.tripBriefId,
    tripId: fixture.tripId
  };
}

export function getTravelerTripId(): string {
  return readTravelerTripFixture().tripId;
}

export function travelerTripPath(suffix = ""): string {
  return `/trip/${encodeURIComponent(getTravelerTripId())}${suffix}`;
}

export function travelerCheckoutPath(): string {
  return `/checkout?trip=${encodeURIComponent(getTravelerTripId())}`;
}

/** Resolves the stable foreign-resource path used for no-disclosure checks. */
export function foreignTravelerTripPath(suffix = ""): string {
  return `/trip/${encodeURIComponent(readReviewerTripFixture("unassigned").tripId)}${suffix}`;
}
