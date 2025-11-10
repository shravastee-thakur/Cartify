import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(3).max(10),
  email: z.string().email("Email must be valid").trim().lowercase(),
  password: z.string().min(6, "Password must be at least 6 characters").max(14),
});

export const loginSchema = z.object({
  email: z.string().email("Email must be valid").trim().lowercase(),
  password: z.string().min(6, "Password must be at least 6 characters").max(14),
});

export const otpVerificationSchema = z.object({
  userId: z.string(),
  otp: z.string().length(6),
});
