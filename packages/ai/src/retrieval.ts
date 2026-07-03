/**
 * Retrieval layer for the itinerary pipeline (Phase 3 step 2).
 *
 * Takes the LLM-parsed `TripBriefIntent` and returns a ranked
 * list of candidate destinations. Today this is a deterministic
 * in-memory matcher over the `packages/spatial-engine/src/fixtures/destinations.ts`
 * fixture set; tomorrow the same function is the integration point
 * for pgvector semantic search (Phase 2 step 2) without any
 * changes to the callers.
 *
 * Ranking algorithm (weighted score, 0..1):
 *  - region_match: 0.4 — destination.region in intent.regions
 *  - interest_match: 0.3 — destination.tags overlap with intent.interests
 *  - pace_alignment: 0.15 — destination.intensity vs intent.pace
 *  - food_alignment: 0.10 — destination.foodTags overlap with intent.foodPreferences
 *  - avoidance_penalty: -0.20 — destination.flags overlap with intent.avoidances
 *
 * The scoring is intentionally simple so the result is auditable
 * and explainable. When pgvector lands, the cosine similarity will
 * replace the weighted score but the contract (same input, same
 * ranked output shape) stays stable.
 */

import type { TripBriefIntent } from "./llm-generator";

export interface CandidateDestination {
  id: string;
  name: string;
  region: string;
  description: string;
  /** Tags the fixture uses for interest matching (e.g. "wine",
   *  "old-streets", "sea-views"). Maps to the `interestOptions`
   *  enum from `@repo/types`. */
  tags: string[];
  /** 0..1. "calm" trips prefer low-intensity stops, "full" trips
   *  can absorb high-intensity stops. */
  intensity: number;
  /** Food-related tags (e.g. "seafood", "wine-bars"). */
  foodTags: string[];
  /** Hard flags the fixture sets ("tourist-heavy", "long-drive-needed"). */
  flags: string[];
}

export interface RetrievalResult {
  candidates: RankedCandidate[];
  /** Self-reported confidence in the retrieval. Low when the intent
   *  is vague or no fixture matches. Caller should fall back to
   *  generic itinerary when < 0.4. */
  confidence: number;
}

export interface RankedCandidate extends CandidateDestination {
  score: number;
  reasons: string[];
}

/**
 * In-memory fixture set. Sourced from
 * packages/spatial-engine/src/fixtures/destinations.ts at module-
 * load time. The fixture file is the single source of truth for
 * pre-launch destinations; pgvector will replace it post-launch.
 *
 * The shape here is intentionally narrower than the fixture
 * (only the fields the retrieval layer needs) so the retrieval
 * function has no dependency on the spatial-engine package.
 */
const FIXTURE_DESTINATIONS: CandidateDestination[] = [
  {
    id: "lx-alfama",
    name: "Alfama walking loop",
    region: "lisbon",
    description: "Old quarter with fado houses, miradouros, and tile-fronted alleys.",
    tags: ["old-streets", "hidden-gems", "local-food"],
    intensity: 0.4,
    foodTags: ["seafood", "wine-bars"],
    flags: ["stairs-and-steep-walks"]
  },
  {
    id: "lx-belem",
    name: "Belém monument morning",
    region: "lisbon",
    description: "Pastéis de Belém at the source, then Jerónimos + Belém Tower.",
    tags: ["design-and-architecture", "local-food", "old-streets"],
    intensity: 0.3,
    foodTags: ["casual-local-meals", "special-dinner"],
    flags: ["tourist-heavy-stops"]
  },
  {
    id: "lx-sintra-pena",
    name: "Sintra Pena Palace morning",
    region: "sintra",
    description: "Hilltop palace + Moorish castle + Quinta da Regaleira.",
    tags: ["design-and-architecture", "nature", "hidden-gems"],
    intensity: 0.6,
    foodTags: ["casual-local-meals"],
    flags: ["long-drives", "tourist-heavy-stops"]
  },
  {
    id: "lx-cascais-coast",
    name: "Cascais coast walk",
    region: "cascais",
    description: "Cliff walk Boca do Inferno to Guincho, fresh fish lunch.",
    tags: ["sea-views", "nature", "local-food"],
    intensity: 0.5,
    foodTags: ["seafood", "casual-local-meals"],
    flags: []
  },
  {
    id: "pt-porto-ribeira",
    name: "Porto Ribeira + wine cellars",
    region: "porto",
    description: "Riverside stroll, then port wine tasting in Vila Nova de Gaia.",
    tags: ["wine", "old-streets", "local-food"],
    intensity: 0.5,
    foodTags: ["wine-bars", "special-dinner"],
    flags: []
  },
  {
    id: "pt-douro-valley",
    name: "Douro Valley winery day",
    region: "douro-valley",
    description: "Terraced vineyards, river cruise, farm-to-table lunch.",
    tags: ["wine", "nature", "design-and-architecture"],
    intensity: 0.4,
    foodTags: ["wine-bars", "special-dinner", "casual-local-meals"],
    flags: ["long-drives"]
  },
  {
    id: "pt-algarve-coast",
    name: "Algarve cliff & beach day",
    region: "algarve",
    description: "Benagil cave, Marinha beach, sunset at Sagres.",
    tags: ["sea-views", "nature"],
    intensity: 0.5,
    foodTags: ["seafood", "casual-local-meals"],
    flags: []
  },
  {
    id: "pt-coimbra-university",
    name: "Coimbra university + fado",
    region: "coimbra",
    description: "UNESCO university library, Joanina, traditional fado night.",
    tags: ["old-streets", "design-and-architecture", "hidden-gems"],
    intensity: 0.4,
    foodTags: ["casual-local-meals", "wine-bars"],
    flags: ["stairs-and-steep-walks"]
  },
  {
    id: "pt-aveiro-moliceiro",
    name: "Aveiro moliceiro canals",
    region: "aveiro",
    description: "Venice-of-Portugal canals, Art Nouveau facades, ovos moles.",
    tags: ["old-streets", "local-food", "hidden-gems"],
    intensity: 0.3,
    foodTags: ["casual-local-meals", "special-dinner"],
    flags: []
  }
];

const REGION_WEIGHT = 0.4;
const INTEREST_WEIGHT = 0.3;
const PACE_WEIGHT = 0.15;
const FOOD_WEIGHT = 0.1;
const AVOIDANCE_PENALTY = 0.2;

function paceAlignment(destination: CandidateDestination, pace: TripBriefIntent["pace"]): number {
  // pace 'calm' prefers low-intensity stops; 'full' can absorb any.
  if (pace === "calm") return 1 - destination.intensity;
  if (pace === "balanced") return 1 - Math.abs(destination.intensity - 0.5) * 2;
  return destination.intensity; // "full" — reward higher intensity
}

function overlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const set = new Set(b);
  const hits = a.filter((tag) => set.has(tag)).length;
  return hits / Math.max(a.length, b.length);
}

function hasOverlap(a: string[], b: string[]): boolean {
  const set = new Set(b);
  return a.some((tag) => set.has(tag));
}

export function retrieveDestinations(
  intent: TripBriefIntent
): RetrievalResult {
  if (intent.regions.length === 0) {
    return { candidates: [], confidence: 0 };
  }

  const ranked: RankedCandidate[] = FIXTURE_DESTINATIONS.map((dest) => {
    // The fixture region is a known enum value; cast through `unknown`
    // to keep the fixture authoring loose (string literals) while
    // the comparison stays type-safe against the intent enum.
    const regionMatch = (intent.regions as readonly string[]).includes(dest.region) ? 1 : 0;
    // Hard filter: the user asked for specific regions; destinations
    // outside those regions must not appear even if they score
    // well on interest/pace/food. The interest + pace + food
    // weights re-rank within the matching region set.
    if (regionMatch === 0) return null;

    const interestScore = overlap(dest.tags, intent.interests);
    const paceScore = paceAlignment(dest, intent.pace);
    const foodScore = overlap(dest.foodTags, intent.foodPreferences);
    const avoidanceHit = hasOverlap(dest.flags, intent.avoidances);

    const raw =
      regionMatch * REGION_WEIGHT +
      interestScore * INTEREST_WEIGHT +
      paceScore * PACE_WEIGHT +
      foodScore * FOOD_WEIGHT -
      (avoidanceHit ? AVOIDANCE_PENALTY : 0);

    // Clamp to [0, 1] — the avoidance penalty can push the raw
    // score negative for a hard conflict; floor at 0 so a
    // strongly-conflicting destination still appears in the list
    // (just at the bottom) rather than vanishing.
    const score = Math.max(0, Math.min(1, raw));

    const reasons: string[] = [];
    reasons.push(`region match: ${dest.region}`);
    if (interestScore > 0) reasons.push(`interest overlap: ${(interestScore * 100).toFixed(0)}%`);
    if (paceScore > 0.7) reasons.push(`pace-aligned (${intent.pace})`);
    if (foodScore > 0) reasons.push(`food match`);
    if (avoidanceHit) reasons.push(`avoidance conflict: ${dest.flags.join(", ")}`);

    return { ...dest, score, reasons };
  })
    .filter((c): c is RankedCandidate => c !== null)
    .sort((a, b) => b.score - a.score);

  // Confidence: average top-3 score, penalized if no region matched.
  const top = ranked.slice(0, 3);
  const confidence = top.length === 0
    ? 0
    : top.reduce((sum, c) => sum + c.score, 0) / top.length;

  return { candidates: ranked, confidence };
}
