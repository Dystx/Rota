import { describe, expect, test } from "vitest";
import {
  buildEmailPreview,
  buildExportReadyEmail,
  buildPaymentReceiptEmail,
  buildReviewCompleteEmail,
  buildReviewRequestedEmail,
  buildTripCreatedEmail,
  createFakeEmailProvider,
  createResendEmailProvider
} from "./index";

describe("transactional email templates", () => {
  test("review complete email targets traveler with required subject and trip title in body", () => {
    const message = buildReviewCompleteEmail("traveler@example.com", {
      tripId: "trip-42",
      tripTitle: "Lisbon Long Weekend",
      reviewerNotes: "Confirmed Belém timing for sunset."
    });

    expect(message.to).toBe("traveler@example.com");
    expect(message.subject).toContain("Your reviewed itinerary is ready");
    expect(message.subject).toContain("Lisbon Long Weekend");
    expect(message.text).toContain("Lisbon Long Weekend");
    expect(message.text).toContain("Confirmed Belém timing for sunset.");
    expect(message.html).toContain("Lisbon Long Weekend");
    expect(message.idempotencyKey).toBe("review-complete:trip-42:traveler@example.com");
    expect(message.kind).toBe("review-complete");
  });

  test("export ready email tags subject with format and stays deterministic", () => {
    const message = buildExportReadyEmail("traveler@example.com", {
      exportFormat: "pdf",
      tripId: "trip-7",
      tripTitle: "Porto Food Tour"
    });

    expect(message.subject).toBe("Export ready for Porto Food Tour (pdf)");
    expect(message.idempotencyKey).toBe("export-ready:trip-7:traveler@example.com");
    expect(message.from).toMatch(/Rota/);
  });

  test("payment receipt email renders amount and preserves preview body", () => {
    const preview = buildEmailPreview("payment-receipt", "Algarve Coast");
    const message = buildPaymentReceiptEmail("traveler@example.com", {
      amountCents: 1995,
      currency: "eur",
      tripId: "trip-9",
      tripTitle: "Algarve Coast"
    });

    expect(message.subject).toBe(preview.subject);
    expect(message.text).toContain("Amount charged: EUR 19.95.");
    expect(message.idempotencyKey).toBe("payment-receipt:trip-9:traveler@example.com");
  });

  test("buildEmailPreview covers every transactional kind without collision", () => {
    const subjects = new Set(
      (
        ["payment-receipt", "export-ready", "review-complete", "review-requested", "trip-created"] as const
      ).map((kind) => buildEmailPreview(kind, "Trip").subject)
    );

    expect(subjects.size).toBe(5);
  });

  test("html body escapes user-supplied trip titles", () => {
    const message = buildReviewCompleteEmail("traveler@example.com", {
      tripId: "trip-x",
      tripTitle: "<script>alert('x')</script>"
    });

    expect(message.html).not.toContain("<script>");
    expect(message.html).toContain("&lt;script&gt;");
  });

  test("trip created email subject and idempotency key reflect kind and trip", () => {
    const message = buildTripCreatedEmail("traveler@example.com", {
      tripId: "trip-1",
      tripTitle: "Lisbon Long Weekend"
    });

    expect(message.kind).toBe("trip-created");
    expect(message.subject).toBe("Trip draft saved: Lisbon Long Weekend");
    expect(message.text).toContain("Lisbon Long Weekend");
    expect(message.idempotencyKey).toBe("trip-created:trip-1:traveler@example.com");
  });

  test("review requested email includes reviewer name when provided and escapes html", () => {
    const message = buildReviewRequestedEmail("traveler@example.com", {
      reviewerName: "Inês <Specialist>",
      tripId: "trip-3",
      tripTitle: "Porto Food Tour"
    });

    expect(message.kind).toBe("review-requested");
    expect(message.subject).toBe("Human review requested for Porto Food Tour");
    expect(message.text).toContain("Inês <Specialist>");
    expect(message.html).not.toContain("<Specialist>");
    expect(message.html).toContain("&lt;Specialist&gt;");
    expect(message.idempotencyKey).toBe("review-requested:trip-3:traveler@example.com");
  });

  test("review requested email omits reviewer name line when absent", () => {
    const message = buildReviewRequestedEmail("traveler@example.com", {
      tripId: "trip-4",
      tripTitle: "Algarve"
    });

    expect(message.text).not.toContain("Assigned reviewer");
  });
});

describe("fake email provider outbox", () => {
  test("captures sent messages in order without network access", async () => {
    const provider = createFakeEmailProvider({ now: () => new Date("2026-01-01T00:00:00.000Z") });
    const review = buildReviewCompleteEmail("traveler@example.com", {
      tripId: "trip-42",
      tripTitle: "Lisbon Long Weekend"
    });
    const exportReady = buildExportReadyEmail("traveler@example.com", {
      exportFormat: "markdown",
      tripId: "trip-42",
      tripTitle: "Lisbon Long Weekend"
    });

    const result1 = await provider.send(review);
    const result2 = await provider.send(exportReady);

    expect(provider.mode).toBe("fake");
    expect(provider.outbox).toHaveLength(2);
    expect(provider.outbox[0]?.kind).toBe("review-complete");
    expect(provider.outbox[0]?.to).toBe("traveler@example.com");
    expect(provider.outbox[0]?.sentAt).toBe("2026-01-01T00:00:00.000Z");
    expect(provider.outbox[1]?.kind).toBe("export-ready");
    expect(result1.providerMessageId).toContain("review-complete:trip-42:traveler@example.com");
    expect(result2.providerMessageId).not.toBe(result1.providerMessageId);
  });

  test("reset clears the outbox between scenarios", async () => {
    const provider = createFakeEmailProvider();
    await provider.send(
      buildReviewCompleteEmail("traveler@example.com", {
        tripId: "trip-1",
        tripTitle: "Trip"
      })
    );
    expect(provider.outbox).toHaveLength(1);
    provider.reset();
    expect(provider.outbox).toHaveLength(0);
  });
});

describe("resend email provider", () => {
  test("sends Bearer-authorized JSON with idempotency header and never returns the secret", async () => {
    let capturedAuth = "";
    let capturedIdempotency = "";
    let capturedBody = "";

    const provider = createResendEmailProvider({
      apiKey: "unit-test-secret-should-not-leak",
      fetch: async (_url, init) => {
        const headers = new Headers(init?.headers);
        capturedAuth = headers.get("Authorization") ?? "";
        capturedIdempotency = headers.get("Idempotency-Key") ?? "";
        capturedBody = String(init?.body);
        return Response.json({ id: "msg_resend_123" });
      }
    });

    const message = buildReviewCompleteEmail("traveler@example.com", {
      tripId: "trip-42",
      tripTitle: "Lisbon Long Weekend"
    });

    const result = await provider.send(message);

    expect(provider.mode).toBe("resend");
    expect(result.providerMessageId).toBe("msg_resend_123");
    expect(capturedAuth).toBe("Bearer unit-test-secret-should-not-leak");
    expect(capturedIdempotency).toBe(message.idempotencyKey);
    expect(capturedBody).toContain("traveler@example.com");
    expect(capturedBody).toContain("Lisbon Long Weekend");
    expect(JSON.stringify(result)).not.toContain("unit-test-secret-should-not-leak");
  });

  test("rejects empty api keys at construction time", () => {
    expect(() => createResendEmailProvider({ apiKey: "" })).toThrow(/api key/i);
    expect(() => createResendEmailProvider({ apiKey: "   " })).toThrow(/api key/i);
  });

  test("throws sanitized error on non-2xx response without leaking provider body", async () => {
    const provider = createResendEmailProvider({
      apiKey: "unit-test-secret",
      fetch: async () =>
        new Response(JSON.stringify({ message: "internal upstream detail" }), {
          status: 500
        })
    });

    const message = buildReviewCompleteEmail("traveler@example.com", {
      tripId: "trip-x",
      tripTitle: "Trip"
    });

    await expect(provider.send(message)).rejects.toThrow(/status 500/);
    await expect(provider.send(message)).rejects.not.toThrow(/internal upstream detail/);
  });
});
