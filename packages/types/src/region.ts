import { z } from "zod";

export const regionLaunchStatuses = ["Research", "Planned", "Active"] as const;

export const RegionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Region name is required."),
  countrySlug: z.string().min(1).default("portugal"),
  bestFor: z.array(z.string()).default([]),
  seasonality: z.string().default(""),
  launchStatus: z.string().min(1).default("Planned"),
  description: z.string().default("")
});

export const CreateRegionSchema = RegionSchema.omit({ id: true }).extend({
  id: z.string().min(1).optional()
});

export const UpdateRegionSchema = CreateRegionSchema.partial().refine(
  (value) => Object.values(value).some((field) => field !== undefined),
  { message: "At least one region field must be updated." }
);

export type Region = z.infer<typeof RegionSchema>;
export type CreateRegionInput = z.infer<typeof CreateRegionSchema>;
export type UpdateRegionInput = z.infer<typeof UpdateRegionSchema>;
