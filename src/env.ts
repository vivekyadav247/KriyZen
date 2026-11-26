import "server-only";

import { parseServerEnv } from "@/env.schema";

/** Server-only, parsed allowlist. Never import this module into Client Components. */
export const env = parseServerEnv(process.env);
