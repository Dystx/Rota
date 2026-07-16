import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.resolve(__dirname, "..", ".auth", "specialist-candidate-record.json");
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export type SpecialistCandidateFixture = {
  specialistId: string;
  userId: string;
};

const CONTRACT_FIXTURE: SpecialistCandidateFixture = {
  specialistId: "00000000-0000-4000-8000-000000000408",
  userId: "00000000-0000-4000-8000-000000000414"
};

function parseFixture(value: unknown): SpecialistCandidateFixture {
  if (!value || typeof value !== "object") {
    throw new Error("[playwright] Specialist candidate fixture is not an object.");
  }
  const fixture = value as Partial<SpecialistCandidateFixture>;
  if (
    typeof fixture.specialistId !== "string" ||
    typeof fixture.userId !== "string" ||
    !UUID_PATTERN.test(fixture.specialistId) ||
    !UUID_PATTERN.test(fixture.userId)
  ) {
    throw new Error("[playwright] Specialist candidate fixture has an invalid shape.");
  }
  return { specialistId: fixture.specialistId, userId: fixture.userId };
}

export function readSpecialistCandidateFixture(): SpecialistCandidateFixture {
  if (!fs.existsSync(FIXTURE_PATH)) return CONTRACT_FIXTURE;
  return parseFixture(JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")));
}

export function createSpecialistCandidateStorageState(): string {
  return path.resolve(__dirname, "..", ".auth", "specialist-candidate.json");
}

export function specialistCandidatePath(): string {
  return "/guide/onboarding";
}
