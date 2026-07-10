import type { ChoiceOption, TripChoiceDraft } from "../../planner/_lib/choice-model";
import { draftToPlannerUrl } from "../../planner/_lib/choice-model";

export const PUBLIC_DESTINATION_CHOICES: readonly ChoiceOption[] = [
  {
    value: "lisbon",
    label: "Lisbon & Surrounds",
    description: "City energy, Sintra hills, and the Atlantic coast.",
    consequence: "A versatile first route."
  },
  {
    value: "porto",
    label: "Porto & the North",
    description: "Riverside culture, cellar doors, and northern character.",
    consequence: "A compact city-and-country escape."
  },
  {
    value: "douro",
    label: "Douro Valley",
    description: "Terraced vineyards and slow river days.",
    consequence: "A river-shaped reset."
  },
  {
    value: "algarve",
    label: "The Algarve",
    description: "Clifftop paths, small towns, and long Atlantic light.",
    consequence: "A slower coastal route."
  },
  {
    value: "azores",
    label: "The Azores",
    description: "Volcanic lakes, thermal water, and open ocean.",
    consequence: "An island reset."
  }
];

/** One source of truth for every public atlas surface. */
export const PUBLIC_DESTINATION_ATLAS = [
  { slug: "lisbon", label: "Lisbon & Surrounds", region: "Capital coast", description: "Hills, Sintra, Cascais, and a generous first route." },
  { slug: "porto", label: "Porto & the North", region: "North", description: "Riverside culture, cellar doors, and northern character." },
  { slug: "douro", label: "Douro Valley", region: "Wine country", description: "Terraced vineyards and slow river days." },
  { slug: "algarve", label: "The Algarve", region: "South coast", description: "Clifftop paths, small towns, and Atlantic light." },
  { slug: "azores", label: "The Azores", region: "Atlantic islands", description: "Volcanic lakes, thermal water, and open ocean." }
] as const;

export type PublicDestinationSlug = (typeof PUBLIC_DESTINATION_ATLAS)[number]["slug"];

export function publicDestination(slug: string) {
  return PUBLIC_DESTINATION_ATLAS.find((option) => option.slug === slug) ?? PUBLIC_DESTINATION_ATLAS[0];
}

export function publicDestinationDraftUrl(slug: string, days = 7, vibe: TripChoiceDraft["vibe"] = "balanced") {
  return publicDraftToPlannerUrl(publicDestination(slug).slug, days, vibe);
}

export const PUBLIC_DURATION_CHOICES: readonly ChoiceOption[] = [3, 5, 7, 10].map((days) => ({
  value: String(days),
  label: `${days} days`,
  description: days <= 5 ? "A focused route" : "Room to wander",
  consequence: ""
}));

export const PUBLIC_STYLE_CHOICES: readonly ChoiceOption[] = [
  {
    value: "restorative",
    label: "Restorative",
    description: "Slow mornings and space to reset.",
    consequence: ""
  },
  {
    value: "balanced",
    label: "Balanced",
    description: "A little structure, plenty of freedom.",
    consequence: ""
  },
  {
    value: "high_energy",
    label: "High energy",
    description: "Full days and more ground covered.",
    consequence: ""
  }
];

export function publicDraft(
  destination: string,
  days = 7,
  vibe: TripChoiceDraft["vibe"] = "balanced"
): TripChoiceDraft {
  return {
    destination,
    days,
    travelWindow: null,
    transport: "transit",
    vibe,
    interests: [],
    activityIds: []
  };
}

export function publicDraftToPlannerUrl(
  destination: string,
  days = 7,
  vibe: TripChoiceDraft["vibe"] = "balanced"
): string {
  return draftToPlannerUrl(publicDraft(destination, days, vibe));
}
