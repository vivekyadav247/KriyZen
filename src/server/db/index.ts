import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { parseDatabaseEnv } from "../../env.schema";
import { schema } from "./schema";

function createDatabase(connectionString: string) {
  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  return { connectionString, pool, db: drizzle(pool, { schema }) };
}

type DatabaseClient = ReturnType<typeof createDatabase>;

const globalForDatabase = globalThis as typeof globalThis & {
  __kriyzenDatabase?: DatabaseClient;
};

/** Lazily create the PostgreSQL pool and Drizzle client on first database use. */
export function getDb() {
  const { DATABASE_URL } = parseDatabaseEnv(process.env);
  let database = globalForDatabase.__kriyzenDatabase;

  if (database && database.connectionString !== DATABASE_URL) {
    throw new Error(
      "DATABASE_URL changed after the PostgreSQL pool was created; restart the Node.js process.",
    );
  }

  if (!database) {
    database = createDatabase(DATABASE_URL);
    globalForDatabase.__kriyzenDatabase = database;
  }

  return database.db;
}
