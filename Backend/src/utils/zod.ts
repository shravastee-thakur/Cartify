import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(3).max(10),
  email: z.string().email("Email must be valid").trim().lowercase(),
  password: z.string().min(6, "Password must be at least 6 characters").max(14),
});
