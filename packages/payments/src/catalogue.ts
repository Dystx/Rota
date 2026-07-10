export const COMMERCE_CATALOGUE_VERSION = "2026-07-10";

export type CommerceProduct = {
  sku: "full_itinerary_v1" | "local_polish_v1";
  unitAmountCents: number;
  currency: "eur";
  requires: "full_itinerary_v1" | null;
  label: string;
  delivery: string;
  limitations: string;
};

export const COMMERCE_PRODUCTS: readonly CommerceProduct[] = [
  {
    sku: "full_itinerary_v1",
    unitAmountCents: 1900,
    currency: "eur",
    requires: null,
    label: "Full itinerary",
    delivery: "Full day-by-day route and export access after payment.",
    limitations: "Does not include bookings or local specialist review."
  },
  {
    sku: "local_polish_v1",
    unitAmountCents: 4900,
    currency: "eur",
    requires: "full_itinerary_v1",
    label: "Local expert polish",
    delivery: "A Portugal specialist reviews the unlocked route within one business day.",
    limitations: "Available only after unlocking the full itinerary; no bookings included."
  }
] as const;

export function listCommerceProducts(): readonly CommerceProduct[] {
  return COMMERCE_PRODUCTS;
}

export function getCommerceProduct(sku: CommerceProduct["sku"]): CommerceProduct {
  const product = COMMERCE_PRODUCTS.find((entry) => entry.sku === sku);
  if (!product) throw new Error(`Unknown commerce product: ${sku}`);
  return product;
}
