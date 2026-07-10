import { describe, expect, it } from "vitest";

import { listCommerceProducts } from "./catalogue";

describe("commerce catalogue", () => {
  it("locks launch products and prices", () => {
    expect(listCommerceProducts()).toEqual([
      expect.objectContaining({ sku: "full_itinerary_v1", unitAmountCents: 1900, currency: "eur" }),
      expect.objectContaining({ sku: "local_polish_v1", unitAmountCents: 4900, currency: "eur", requires: "full_itinerary_v1" })
    ]);
  });
});
