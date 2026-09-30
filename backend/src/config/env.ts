import dotenv from "dotenv";
import { z } from "zod";

// Load backend/.env into process.env before any other module reads configuration.
// Missing file is allowed so tests can inject variables themselves.
dotenv.config();

// PORT is optional and falls back to 5000. The other two values are required
// because the server cannot authenticate users or reach MongoDB without them.
const portSchema = z.coerce.number().int().positive();

const envSchema = z.object({
  PORT: z
    .string()
    .optional()
    .transform((value, ctx) => {
      const raw = value === undefined || value === "" ? "5000" : value;
      const parsedPort = portSchema.safeParse(raw);
      if (!parsedPort.success) {
        ctx.addIssue({ code: "custom", message: "PORT must be a positive integer" });
        return z.NEVER;
      }
      return parsedPort.data;
    }),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration. ${details}`);
}

// Frozen so route handlers cannot mutate shared configuration at runtime.
export const env = Object.freeze(parsed.data);
