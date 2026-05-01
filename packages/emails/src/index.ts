export type EmailTemplateKind = "payment-receipt" | "export-ready" | "review-complete";

export type EmailPreview = {
  body: string[];
  kind: EmailTemplateKind;
  previewText: string;
  subject: string;
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
