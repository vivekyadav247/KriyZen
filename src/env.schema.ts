import { z } from "zod";

const portSchema = z
  .string()
  .regex(/^\d+$/, "must be a whole-number port")
  .transform(Number)
  .pipe(z.number().int().min(1).max(65_535));

/** Environment variables used by the current app foundation. */
export const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: portSchema.optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Parse allowlisted variables and report only variable names and safe rules. */
export function parseServerEnv(source: NodeJS.ProcessEnv): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid server environment configuration: ${details}`);
  }

  return parsed.data;
}
