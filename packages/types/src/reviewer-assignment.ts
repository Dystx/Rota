import { z } from "zod";

export const reviewerAssignmentStatuses = ["assigned", "submitted", "completed", "returned"] as const;

export const ReviewerAssignmentSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  reviewerId: z.string(),
  reviewerName: z.string().optional(),
  status: z.string().min(1).default("assigned"),
  notes: z.string().default(""),
  createdAt: z.string(),
  completedAt: z.string().nullable().optional()
});

export const CreateReviewerAssignmentSchema = z.object({
  tripId: z.string().min(1),
  reviewerId: z.string().min(1),
  notes: z.string().default(""),
  status: z.string().min(1).default("assigned")
});

export const UpdateReviewerAssignmentSchema = z.object({
  notes: z.string().optional(),
  status: z.string().min(1).optional(),
  completedAt: z.string().nullable().optional()
}).refine(
  (value) => Object.values(value).some((field) => field !== undefined),
  { message: "At least one assignment field must be updated." }
);

export type ReviewerAssignment = z.infer<typeof ReviewerAssignmentSchema>;
export type CreateReviewerAssignmentInput = z.infer<typeof CreateReviewerAssignmentSchema>;
export type UpdateReviewerAssignmentInput = z.infer<typeof UpdateReviewerAssignmentSchema>;
