import { describe, expect, it } from "vitest";
import {
  draftToPlannerPrompt,
  draftToPlannerUrl,
  normalizeDraft,
} from "./choice-model";

describe("normalizeDraft", () => {
  it("applies deterministic defaults", () => {
    expect(normalizeDraft({})).toEqual({
      destination: "Portugal",
      days: 7,
      travelWindow: null,
      transport: "transit",
      vibe: "balanced",
      interests: [],
      activityIds: [],
    });
  });

  it.each([
    { input: 0, expected: 1 },
    { input: -3, expected: 1 },
    { input: 61, expected: 60 },
    { input: 14.8, expected: 14 },
  ])("clamps $input days to $expected", ({ input, expected }) => {
    expect(normalizeDraft({ days: input }).days).toBe(expected);
  });

  it("falls back for unsupported transport and vibe values", () => {
    const input = {
      transport: "plane",
      vibe: "party",
    } as unknown as Parameters<typeof normalizeDraft>[0];

    expect(normalizeDraft(input)).toMatchObject({
      transport: "transit",
      vibe: "balanced",
    });
  });
});

describe("draft adapters", () => {
  const draft = {
    destination: "São Tomé & Príncipe",
    days: 5,
    travelWindow: "May & June",
    transport: "car" as const,
    vibe: "balanced" as const,
    interests: ["food"],
    activityIds: ["porto-ribeira-slow-walk", "porto-bombarda-art-walk"],
  };

  it("encodes destination and travel window in the planner URL", () => {
    expect(draftToPlannerUrl(draft)).toBe(
      "/planner?destination=S%C3%A3o+Tom%C3%A9+%26+Pr%C3%ADncipe&days=5&window=May+%26+June&transport=car&vibe=balanced&interests=food&activity=porto-ribeira-slow-walk&activity=porto-bombarda-art-walk",
    );
  });

  it.each([
    ["car", "restorative", "rental car", "calm, restorative"],
    ["car", "balanced", "rental car", "balanced"],
    ["car", "high_energy", "rental car", "full, high-energy"],
    ["transit", "restorative", "public transit", "calm, restorative"],
    ["transit", "balanced", "public transit", "balanced"],
    ["transit", "high_energy", "public transit", "full, high-energy"],
  ] as const)(
    "uses %s transport and %s vibe phrases",
    (transport, vibe, transportPhrase, vibePhrase) => {
      const prompt = draftToPlannerPrompt({ ...draft, transport, vibe });

      expect(prompt).toContain(transportPhrase);
      expect(prompt).toContain(vibePhrase);
    },
  );
});
