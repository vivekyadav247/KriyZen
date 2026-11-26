import { z } from "zod";

/**
 * Only deliberately public NEXT_PUBLIC_* settings belong here.
 * There are no public environment variables in the current implementation.
 */
export const clientEnvSchema = z.object({}).strict();

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export const clientEnv: ClientEnv = clientEnvSchema.parse({});
