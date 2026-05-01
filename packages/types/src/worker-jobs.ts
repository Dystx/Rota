import { z } from "zod";

export const WorkerJobTypeSchema = z.enum([
  "trip_export_markdown",
  "trip_export_pdf",
  "trip_review_assignment",
  "trip_review_completion",
  "route_validation_refresh"
]);

export const WorkerJobStatusSchema = z.enum(["planned", "queued", "running", "completed", "blocked"]);

export const WorkerJobSchema = z.object({
  id: z.string(),
  type: WorkerJobTypeSchema,
  status: WorkerJobStatusSchema,
  title: z.string(),
  summary: z.string(),
  tripId: z.string().optional(),
  owner: z.string(),
  blockingReason: z.string().optional(),
  outputs: z.array(z.string()),
  nextStep: z.string()
});

export const WorkerPlanSchema = z.object({
  summary: z.string(),
  jobs: z.array(WorkerJobSchema).min(1)
});

export type WorkerJobType = z.infer<typeof WorkerJobTypeSchema>;
export type WorkerJobStatus = z.infer<typeof WorkerJobStatusSchema>;
export type WorkerJob = z.infer<typeof WorkerJobSchema>;
export type WorkerPlan = z.infer<typeof WorkerPlanSchema>;
