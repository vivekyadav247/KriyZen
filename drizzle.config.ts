import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

import { parseDatabaseEnv } from "./src/env.schema";

loadEnvConfig(process.cwd());

const { DATABASE_URL } = parseDatabaseEnv(process.env);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema/index.ts",
  tablesFilter: ["kz_*"],
  out: "./drizzle",
  migrations: {
    schema: "kriyzen_migrations",
    table: "__drizzle_migrations",
  },
  dbCredentials: {
    url: DATABASE_URL,
  },
});
