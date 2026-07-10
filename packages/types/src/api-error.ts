import { z } from "zod";

export const apiErrorEnvelopeSchema = z.object({
  code: z.string().min(1),
  fieldErrors: z.record(z.array(z.string())).optional(),
  message: z.string().min(1)
});

export type ApiErrorEnvelope = z.infer<typeof apiErrorEnvelopeSchema>;
