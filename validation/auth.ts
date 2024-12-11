import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Invalid Email"),
  password: z.string().trim().min(1, "Password is required"),
});

export const signInSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid Email"),
  password: z.string().trim().min(1, "Password is required"),
});

export type SignUpType = z.infer<typeof signUpSchema>;
export type SignInType = z.infer<typeof signInSchema>;
