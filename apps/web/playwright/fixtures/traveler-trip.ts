import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.resolve(__dirname, "..", ".auth", "traveler-trip.json");

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
    throw new Error(
      `[playwright] Missing traveler trip fixture at ${FIXTURE_PATH}. ` +
        "Run Playwright through its configured global setup first."
    );
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
    fixture.tripId.length === 0 ||
    fixture.tripBriefId.length === 0 ||
    fixture.ownerUserId.length === 0
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
