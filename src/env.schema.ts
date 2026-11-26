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

const postgresUrlSchema = z
  .string({ error: "is required" })
  .url("must be a valid URL")
  .refine((value) => {
    if (!URL.canParse(value)) {
      return false;
    }

    const parsed = new URL(value);
    const isPostgres =
      parsed.protocol === "postgres:" || parsed.protocol === "postgresql:";

    return isPostgres && parsed.hostname.length > 0 && parsed.pathname.length > 1;
  }, "must use a PostgreSQL URL with a host and database name");

/** Parsed only by database tooling or when a database connection is requested. */
export const databaseEnvSchema = z.object({
  DATABASE_URL: postgresUrlSchema,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

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

/** Validate database credentials without including their values in errors. */
export function parseDatabaseEnv(source: NodeJS.ProcessEnv): DatabaseEnv {
  const parsed = databaseEnvSchema.safeParse(source);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "DATABASE_URL"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid database environment configuration: ${details}`);
  }

  return parsed.data;
}
