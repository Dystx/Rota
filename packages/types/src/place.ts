import { z } from "zod";
import { portugalRegions } from "./trip-brief";

export const placeCategories = ["Viewpoint", "Museum", "Wine experience", "Restaurant", "Neighborhood", "Beach", "Hotel", "Uncategorized"] as const;
export const sourceConfidenceLevels = ["Low", "Medium", "High", "Pending"] as const;

export const PlaceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Place name is required."),
  region: z.union([z.enum(portugalRegions), z.string().min(1, "Region is required.")]),
  category: z.string().min(1).default("Uncategorized"),
  quality: z.coerce.number().min(0).max(10).nullable().optional(),
  sourceConfidence: z.string().min(1).default("Pending")
});

export const CreatePlaceSchema = PlaceSchema.omit({ id: true }).extend({
  id: z.string().min(1).optional()
});

export const UpdatePlaceSchema = CreatePlaceSchema.partial().refine(
  (value) => Object.values(value).some((field) => field !== undefined),
  { message: "At least one place field must be updated." }
);

export type Place = z.infer<typeof PlaceSchema>;
export type CreatePlaceInput = z.infer<typeof CreatePlaceSchema>;
export type UpdatePlaceInput = z.infer<typeof UpdatePlaceSchema>;
