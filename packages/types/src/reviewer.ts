import { z } from "zod";

export const reviewerStatuses = ["Onboarding", "Active", "Inactive"] as const;

export const ReviewerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Reviewer name is required."),
  country: z.string().min(1).default("Portugal"),
  regions: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
  status: z.string().min(1).default("Onboarding"),
  rating: z.coerce.number().min(0).max(5).nullable().optional(),
  bio: z.string().default(""),
  responsePromise: z.string().default("")
});

export const CreateReviewerSchema = ReviewerSchema.omit({ id: true }).extend({
  id: z.string().min(1).optional()
});

export const UpdateReviewerSchema = CreateReviewerSchema.partial().refine(
  (value) => Object.values(value).some((field) => field !== undefined),
  { message: "At least one reviewer field must be updated." }
);

export type Reviewer = z.infer<typeof ReviewerSchema>;
export type CreateReviewerInput = z.infer<typeof CreateReviewerSchema>;
export type UpdateReviewerInput = z.infer<typeof UpdateReviewerSchema>;
