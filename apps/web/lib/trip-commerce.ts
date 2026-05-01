type TripCommerceInput = {
  status?: string;
  isPaid?: boolean;
  hasHumanReview?: boolean;
};

export type TripCommerceState = {
  accessLabel: string;
  canCompleteReview: boolean;
  canExport: boolean;
  canRequestReview: boolean;
  canUnlock: boolean;
  exportLabel: string;
  reviewLabel: string;
  queueLabel: string;
  markers: string[];
};

export function getTripCommerceState({ status, isPaid = false, hasHumanReview = false }: TripCommerceInput = {}): TripCommerceState {
  if (hasHumanReview || status === "reviewed") {
    return {
      accessLabel: "Unlocked paid trip",
      canCompleteReview: false,
      canExport: true,
      canRequestReview: false,
      canUnlock: false,
      exportLabel: "PDF + calendar export ready",
      markers: [
        "Reviewed by a Portugal specialist",
        "Reviewer swaps and pacing notes are visible",
        "Rain-plan and local-food edits are now client-facing"
      ],
      queueLabel: "Completed",
      reviewLabel: "Local expert reviewed"
    };
  }

  if (status === "in_review") {
    return {
      accessLabel: "Unlocked paid trip",
      canCompleteReview: true,
      canExport: true,
      canRequestReview: false,
      canUnlock: false,
      exportLabel: "PDF + calendar export ready",
      markers: [
        "A reviewer is actively polishing the route",
        "Route swaps and pacing edits are being prepared",
        "Client-facing trust markers will update after review completion"
      ],
      queueLabel: "In review queue",
      reviewLabel: "Human review in progress"
    };
  }

  if (isPaid) {
    return {
      accessLabel: "Unlocked paid trip",
      canCompleteReview: false,
      canExport: true,
      canRequestReview: true,
      canUnlock: false,
      exportLabel: "PDF + calendar export ready",
      markers: [
        "Full itinerary and route map are unlocked",
        "Export-ready trip pack can be generated",
        "This trip can now enter the human-review queue"
      ],
      queueLabel: "Needs review",
      reviewLabel: "Ready for human review"
    };
  }

  return {
    accessLabel: "Free preview only",
    canCompleteReview: false,
    canExport: false,
    canRequestReview: false,
    canUnlock: true,
    exportLabel: "PDF + calendar export locked",
    markers: [
      "Route preview stays visible before payment",
      "Export and offline handoff stay locked",
      "Human review becomes available after unlock"
    ],
    queueLabel: "Waiting for unlock",
    reviewLabel: "Human review available after unlock"
  };
}
