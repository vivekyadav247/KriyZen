import { sql } from "drizzle-orm";

import { getDb } from "../../src/server/db";

function hasErrorCode(error: unknown, code: string): boolean {
  if (error === null || typeof error !== "object") return false;
  if ("code" in error && error.code === code) return true;
  if ("cause" in error && hasErrorCode(error.cause, code)) return true;
  return (
    "errors" in error &&
    Array.isArray(error.errors) &&
    error.errors.some((nestedError) => hasErrorCode(nestedError, code))
  );
}

async function main() {
  let database: ReturnType<typeof getDb> | undefined;

  try {
    database = getDb();
    await database.execute(sql`SELECT 1`);
    process.stdout.write("DATABASE_CONNECTED");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Invalid database environment configuration:") &&
      !error.message.includes(process.env.DATABASE_URL ?? "\u0000")
    ) {
      process.stdout.write("SAFE_CONFIG_ERROR");
      process.exitCode = 2;
    } else if (hasErrorCode(error, "ECONNREFUSED")) {
      process.stdout.write("CONNECTION_REFUSED");
      process.exitCode = 3;
    } else {
      const code =
        error !== null && typeof error === "object" && "code" in error
          ? String(error.code)
          : error instanceof Error
            ? error.name
            : "unknown";
      process.stdout.write(`UNEXPECTED_DATABASE_ERROR:${code}`);
      process.exitCode = 4;
    }
  } finally {
    await database?.$client.end();
  }
}

void main();
