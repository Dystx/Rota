import type { TransportChoice } from "../_components/transport-step";
import type { Vibe } from "../_components/vibe-step";

export type TripChoiceDraft = {
  destination: string;
  days: number;
  travelWindow: string | null;
  transport: TransportChoice;
  vibe: Vibe;
  interests: string[];
};

export type ChoiceOption = {
  value: string;
  label: string;
  description: string;
  consequence: string;
  imageSrc?: string;
};

const DEFAULT_DRAFT: TripChoiceDraft = {
  destination: "Portugal",
  days: 7,
  travelWindow: null,
  transport: "transit",
  vibe: "balanced",
  interests: [],
};

function isTransportChoice(value: unknown): value is TransportChoice {
  return value === "car" || value === "transit";
}

function isVibe(value: unknown): value is Vibe {
  return (
    value === "restorative" ||
    value === "balanced" ||
    value === "high_energy"
  );
}

function normalizeDays(days: unknown): number {
  if (typeof days !== "number" || !Number.isFinite(days)) {
    return DEFAULT_DRAFT.days;
  }

  return Math.min(60, Math.max(1, Math.trunc(days)));
}

function normalizeText(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim() || fallback;
}

function normalizeWindow(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim() || null;
}

function normalizeInterests(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (interest): interest is string => typeof interest === "string",
  );
}

export function normalizeDraft(input: Partial<TripChoiceDraft>): TripChoiceDraft {
  return {
    destination: normalizeText(input.destination, DEFAULT_DRAFT.destination),
    days: normalizeDays(input.days),
    travelWindow: normalizeWindow(input.travelWindow),
    transport: isTransportChoice(input.transport)
      ? input.transport
      : DEFAULT_DRAFT.transport,
    vibe: isVibe(input.vibe) ? input.vibe : DEFAULT_DRAFT.vibe,
    interests: normalizeInterests(input.interests),
  };
}

export function draftToPlannerPrompt(draft: TripChoiceDraft): string {
  const transportPhrase =
    draft.transport === "car" ? "rental car" : "public transit";
  const vibePhrase =
    draft.vibe === "restorative"
      ? "calm, restorative"
      : draft.vibe === "high_energy"
        ? "full, high-energy"
        : "balanced";
  const travelWindowPhrase = draft.travelWindow
    ? ` in ${draft.travelWindow}`
    : "";

  return `A ${draft.days}-day trip to ${draft.destination}${travelWindowPhrase}, ${vibePhrase} pace, ${transportPhrase}.`;
}

export function draftToPlannerUrl(draft: TripChoiceDraft): string {
  const params = new URLSearchParams();

  params.set("destination", draft.destination);
  params.set("days", String(draft.days));

  if (draft.travelWindow) {
    params.set("window", draft.travelWindow);
  }

  params.set("transport", draft.transport);
  params.set("vibe", draft.vibe);

  if (draft.interests.length > 0) {
    params.set("interests", draft.interests.join(","));
  }

  return `/planner?${params.toString()}`;
}
