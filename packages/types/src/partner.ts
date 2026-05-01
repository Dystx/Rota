import { z } from "zod";

export const partnerStatuses = ["Draft", "Research", "Candidate", "Active"] as const;

export const PartnerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Partner name is required."),
  type: z.string().min(1).default(""),
  coverageRegions: z.array(z.string()).default([]),
  status: z.string().min(1).default("Draft"),
  notes: z.string().default(""),
  link: z.string().default(""),
  isAffiliate: z.boolean().default(false)
});

export const CreatePartnerSchema = PartnerSchema.omit({ id: true }).extend({
  id: z.string().min(1).optional()
});

export const UpdatePartnerSchema = CreatePartnerSchema.partial().refine(
  (value) => Object.values(value).some((field) => field !== undefined),
  { message: "At least one partner field must be updated." }
);

export type Partner = z.infer<typeof PartnerSchema>;
export type CreatePartnerInput = z.infer<typeof CreatePartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof UpdatePartnerSchema>;
