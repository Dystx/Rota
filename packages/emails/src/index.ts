export type EmailTemplateKind =
  | "payment-receipt"
  | "export-ready"
  | "review-complete"
  | "review-requested"
  | "trip-created";

export type EmailPreview = {
  body: string[];
  kind: EmailTemplateKind;
  previewText: string;
  subject: string;
};

export type EmailMessage = {
  from: string;
  html: string;
  idempotencyKey: string;
  kind: EmailTemplateKind;
  subject: string;
  text: string;
  to: string;
};

export type SentEmailRecord = EmailMessage & {
  providerMessageId: string;
  sentAt: string;
};

export type EmailSendResult = {
  providerMessageId: string;
};

export type EmailProvider = {
  mode: "fake" | "resend";
  send: (message: EmailMessage) => Promise<EmailSendResult>;
};

export type ReviewCompleteTemplateInput = {
  reviewerNotes?: string;
  tripId: string;
  tripTitle: string;
};

export type ExportReadyTemplateInput = {
  exportFormat: "markdown" | "pdf" | "ics";
  tripId: string;
  tripTitle: string;
};

export type PaymentReceiptTemplateInput = {
  amountCents: number;
  currency: string;
  tripId: string;
  tripTitle: string;
};

export type TripCreatedTemplateInput = {
  tripId: string;
  tripTitle: string;
};

export type ReviewRequestedTemplateInput = {
  reviewerName?: string;
  tripId: string;
  tripTitle: string;
};

export function buildEmailPreview(kind: EmailTemplateKind, tripTitle: string): EmailPreview {
  if (kind === "payment-receipt") {
    return {
      body: [
        `Your payment for ${tripTitle} was received.`,
        "Rota will now unlock the trip, prepare exports, and keep your planning flow available in your account."
      ],
      kind,
      previewText: "Payment received and trip unlocked.",
      subject: `Payment received for ${tripTitle}`
    };
  }

  if (kind === "export-ready") {
    return {
      body: [
        `${tripTitle} now has an export ready to deliver.`,
        "Send the markdown, PDF, or calendar artifact link once the worker marks the job complete."
      ],
      kind,
      previewText: "Your trip export is ready.",
      subject: `Export ready for ${tripTitle}`
    };
  }

  if (kind === "trip-created") {
    return {
      body: [
        `${tripTitle} has been saved to your Rota account.`,
        "Continue refining the brief, unlock paid features, or invite a reviewer when you are ready."
      ],
      kind,
      previewText: "Trip draft saved.",
      subject: `Trip draft saved: ${tripTitle}`
    };
  }

  if (kind === "review-requested") {
    return {
      body: [
        `${tripTitle} is queued for human review.`,
        "A Portugal specialist will validate the brief and add reviewer notes shortly."
      ],
      kind,
      previewText: "Human review requested.",
      subject: `Human review requested for ${tripTitle}`
    };
  }

  return {
    body: [
      `${tripTitle} has been reviewed by a local specialist.`,
      "Trust markers and reviewer notes are ready to be shown in the trip detail flow."
    ],
    kind,
    previewText: "Human review completed.",
    subject: `Review completed for ${tripTitle}`
  };
}

const DEFAULT_FROM = "Rota <no-reply@rota.local>";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtml(preview: EmailPreview): string {
  const paragraphs = preview.body.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  return `<!doctype html><html><body>${paragraphs}</body></html>`;
}

function renderText(preview: EmailPreview): string {
  return preview.body.join("\n\n");
}

function buildIdempotencyKey(kind: EmailTemplateKind, tripId: string, recipient: string): string {
  return `${kind}:${tripId}:${recipient}`;
}

export function buildReviewCompleteEmail(
  to: string,
  input: ReviewCompleteTemplateInput,
  options?: { from?: string }
): EmailMessage {
  const preview = buildEmailPreview("review-complete", input.tripTitle);
  const body = input.reviewerNotes
    ? [...preview.body, `Reviewer notes: ${input.reviewerNotes}`]
    : preview.body;
  const enrichedPreview: EmailPreview = { ...preview, body };
  return {
    from: options?.from ?? DEFAULT_FROM,
    html: renderHtml(enrichedPreview),
    idempotencyKey: buildIdempotencyKey("review-complete", input.tripId, to),
    kind: "review-complete",
    subject: `Your reviewed itinerary is ready: ${input.tripTitle}`,
    text: renderText(enrichedPreview),
    to
  };
}

export function buildExportReadyEmail(
  to: string,
  input: ExportReadyTemplateInput,
  options?: { from?: string }
): EmailMessage {
  const preview = buildEmailPreview("export-ready", input.tripTitle);
  return {
    from: options?.from ?? DEFAULT_FROM,
    html: renderHtml(preview),
    idempotencyKey: buildIdempotencyKey("export-ready", input.tripId, to),
    kind: "export-ready",
    subject: `${preview.subject} (${input.exportFormat})`,
    text: renderText(preview),
    to
  };
}

export function buildPaymentReceiptEmail(
  to: string,
  input: PaymentReceiptTemplateInput,
  options?: { from?: string }
): EmailMessage {
  const preview = buildEmailPreview("payment-receipt", input.tripTitle);
  const amount = (input.amountCents / 100).toFixed(2);
  const currency = input.currency.toUpperCase();
  const body = [...preview.body, `Amount charged: ${currency} ${amount}.`];
  const enrichedPreview: EmailPreview = { ...preview, body };
  return {
    from: options?.from ?? DEFAULT_FROM,
    html: renderHtml(enrichedPreview),
    idempotencyKey: buildIdempotencyKey("payment-receipt", input.tripId, to),
    kind: "payment-receipt",
    subject: preview.subject,
    text: renderText(enrichedPreview),
    to
  };
}

export function buildTripCreatedEmail(
  to: string,
  input: TripCreatedTemplateInput,
  options?: { from?: string }
): EmailMessage {
  const preview = buildEmailPreview("trip-created", input.tripTitle);
  return {
    from: options?.from ?? DEFAULT_FROM,
    html: renderHtml(preview),
    idempotencyKey: buildIdempotencyKey("trip-created", input.tripId, to),
    kind: "trip-created",
    subject: preview.subject,
    text: renderText(preview),
    to
  };
}

export function buildReviewRequestedEmail(
  to: string,
  input: ReviewRequestedTemplateInput,
  options?: { from?: string }
): EmailMessage {
  const preview = buildEmailPreview("review-requested", input.tripTitle);
  const body = input.reviewerName
    ? [...preview.body, `Assigned reviewer: ${input.reviewerName}.`]
    : preview.body;
  const enrichedPreview: EmailPreview = { ...preview, body };
  return {
    from: options?.from ?? DEFAULT_FROM,
    html: renderHtml(enrichedPreview),
    idempotencyKey: buildIdempotencyKey("review-requested", input.tripId, to),
    kind: "review-requested",
    subject: preview.subject,
    text: renderText(enrichedPreview),
    to
  };
}

export type FakeEmailProvider = EmailProvider & {
  mode: "fake";
  outbox: ReadonlyArray<SentEmailRecord>;
  reset: () => void;
};

export function createFakeEmailProvider(options?: { now?: () => Date }): FakeEmailProvider {
  const now = options?.now ?? (() => new Date(0));
  const records: SentEmailRecord[] = [];
  let counter = 0;

  const provider: FakeEmailProvider = {
    mode: "fake",
    get outbox() {
      return records.slice();
    },
    reset() {
      records.length = 0;
      counter = 0;
    },
    async send(message) {
      counter += 1;
      const providerMessageId = `fake_${counter}_${message.idempotencyKey}`;
      records.push({
        ...message,
        providerMessageId,
        sentAt: now().toISOString()
      });
      return { providerMessageId };
    }
  };

  return provider;
}

export type ResendEmailProviderOptions = {
  apiKey: string;
  endpoint?: string;
  fetch?: typeof fetch;
};

type ResendEmailResponse = {
  id?: string;
};

export function createResendEmailProvider(options: ResendEmailProviderOptions): EmailProvider {
  if (!options.apiKey || options.apiKey.trim().length === 0) {
    throw new Error("Resend API key is required to create a Resend email provider.");
  }
  const fetchImpl = options.fetch ?? fetch;
  const endpoint = options.endpoint ?? "https://api.resend.com/emails";

  return {
    mode: "resend",
    async send(message) {
      const response = await fetchImpl(endpoint, {
        body: JSON.stringify({
          from: message.from,
          html: message.html,
          subject: message.subject,
          text: message.text,
          to: message.to
        }),
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": message.idempotencyKey
        },
        method: "POST"
      });

      if (!response.ok) {
        throw new Error(`Resend email send failed with status ${response.status}.`);
      }

      const data = (await response.json()) as ResendEmailResponse;
      if (!data.id || data.id.length === 0) {
        throw new Error("Resend email response missing message id.");
      }

      return { providerMessageId: data.id };
    }
  };
}
