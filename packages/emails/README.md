# packages/emails

Deterministic transactional email contracts for Rota.

## Surfaces

- Preview builders for marketing-style copy (delivery-free).
- Typed message builders with idempotency keys for the full transactional
  taxonomy: `trip-created`, `review-requested`, `review-complete`,
  `export-ready`, and `payment-receipt`.
- Provider abstraction with a fake in-memory outbox for tests and a
  `fetch`-based Resend provider for production.

## Templates

```ts
import { buildReviewCompleteEmail } from "@repo/emails";

const message = buildReviewCompleteEmail("traveler@example.com", {
  tripId: "trip-42",
  tripTitle: "Lisbon Long Weekend"
});
// message.subject -> "Your reviewed itinerary is ready: Lisbon Long Weekend"
```

The package also exports `buildTripCreatedEmail`,
`buildReviewRequestedEmail`, `buildExportReadyEmail`, and
`buildPaymentReceiptEmail` with matching `<Kind>TemplateInput` types.

All HTML bodies escape interpolated user content. Idempotency keys follow
`<kind>:<tripId>:<recipient>` so retries de-duplicate at the provider edge.

## Providers

```ts
import { createFakeEmailProvider, createResendEmailProvider } from "@repo/emails";

// Tests / local dev
const fake = createFakeEmailProvider();
await fake.send(message);
fake.outbox; // captured records

// Production (server-only)
const resend = createResendEmailProvider({ apiKey: process.env.RESEND_API_KEY! });
await resend.send(message);
```

The Resend API key is server-only and must come from
`@repo/config/server` (`createServerResendConfig`). It must never be
imported from a client component or bundled with `NEXT_PUBLIC_*`.
