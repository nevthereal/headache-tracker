import { z } from "zod";

export const zNewEntry = z.object({
  rating: z.number().min(0).max(5),
  notes: z.string().optional(),
});
