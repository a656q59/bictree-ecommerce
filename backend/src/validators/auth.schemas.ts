import { z } from "zod";

// Shared by register and login so email normalization lives in one place.
// trim/lowercase happen before the format check so " User@Example.com " is valid.
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Email must be valid"));

// bcrypt only uses the first 72 bytes. Reject longer values instead of silently truncating.
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

// Create account collects email, password, and confirm password. Name is not on the form.
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .strict()
  .superRefine((input, ctx) => {
    if (input.password !== input.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export const loginSchema = z.object({
  email: emailSchema,
  // Login does not restate the register length rules. A wrong password is an auth failure,
  // not a validation error, as long as the field is present.
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
