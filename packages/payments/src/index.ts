export type CheckoutTier = "free-preview" | "paid-trip" | "human-polish";

export type CheckoutPlan = {
  ctaLabel: string;
  deliverables: string[];
  fulfillment: string;
  priceLabel: string;
  tier: CheckoutTier;
};

const plans: Record<CheckoutTier, CheckoutPlan> = {
  "free-preview": {
    ctaLabel: "Start free preview",
    deliverables: ["Basic route preview", "Watermarked itinerary", "No full export"],
    fulfillment: "No checkout required. User stays inside the free planning flow.",
    priceLabel: "€0",
    tier: "free-preview"
  },
  "human-polish": {
    ctaLabel: "Add human review",
    deliverables: ["Local expert review", "Pacing and food upgrades", "Reviewer notes"],
    fulfillment: "Charge after unlock, then enqueue reviewer assignment and delivery email.",
    priceLabel: "€49",
    tier: "human-polish"
  },
  "paid-trip": {
    ctaLabel: "Unlock a trip",
    deliverables: ["Full itinerary", "Full route map", "PDF + calendar export"],
    fulfillment: "Capture payment, mark trip as paid, then queue export generation.",
    priceLabel: "€19",
    tier: "paid-trip"
  }
};

export function getCheckoutPlan(tier: CheckoutTier): CheckoutPlan {
  return plans[tier];
}

export function listCheckoutPlans() {
  return [plans["free-preview"], plans["paid-trip"], plans["human-polish"]];
}
