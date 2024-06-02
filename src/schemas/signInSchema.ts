import { z } from "zod";

export const signInSchema = z.object({
  // identifier: z.string().email(),
  identifier: z.string(),
  password:z.string(),
});
