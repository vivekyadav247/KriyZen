import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import type { PoolClient } from "pg";

import { sql } from "drizzle-orm";

import { parseDatabaseEnv } from "../../src/env.schema";
import { getDb } from "../../src/server/db";

function assertLocalTestDatabaseUrl(value: string): void {
  const parsed = new URL(value);
  const isLoopback = ["localhost", "127.0.0.1", "[::1]", "::1"].includes(
    parsed.hostname,
  );

  if (!isLoopback || parsed.port !== "5433" || parsed.pathname !== "/kriyzen") {
    throw new Error(
      "Database integration tests require the local KriyZen database at localhost:5433/kriyzen.",
    );
  }
}

assertLocalTestDatabaseUrl(parseDatabaseEnv(process.env).DATABASE_URL);

const database = getDb();
const pool = database.$client;
let savepointCounter = 0;

type Fixture = {
  marker: string;
  userId: string;
  workspaceId: string;
  connectionId: string;
  conversationId: string;
  messageId: string;
  planId: string;
  stepId: string;
  activityId: string;
};

async function transaction<T>(run: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  await client.query("BEGIN");

  try {
    return await run(client);
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }
}

async function expectPgCode(
  client: PoolClient,
  expectedCode: string,
  operation: () => Promise<unknown>,
): Promise<void> {
  const savepoint = `expected_failure_${savepointCounter++}`;
  await client.query(`SAVEPOINT ${savepoint}`);
  let thrown: unknown;

  try {
    await operation();
  } catch (error) {
    thrown = error;
  }

  try {
    assert.ok(thrown instanceof Error, "expected PostgreSQL operation to fail");
    assert.equal(
      "code" in thrown ? thrown.code : undefined,
      expectedCode,
      `expected PostgreSQL SQLSTATE ${expectedCode}`,
    );
  } finally {
    await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
    await client.query(`RELEASE SAVEPOINT ${savepoint}`);
  }
}

async function createUser(client: PoolClient, marker = `p025-${randomUUID()}`) {
  const result = await client.query(
    `INSERT INTO kz_users (google_sub, email) VALUES ($1, $2) RETURNING id`,
    [marker, `${marker}@example.test`],
  );
  return { marker, userId: String(result.rows[0].id) };
}

async function createWorkspace(
  client: PoolClient,
  userId: string,
  marker = `p025-${randomUUID()}`,
) {
  const result = await client.query(
    `INSERT INTO kz_workspaces (owner_user_id, corsair_tenant_id, name)
     VALUES ($1, $2, $3) RETURNING id`,
    [userId, `${marker}-tenant`, "Synthetic P02.5 workspace"],
  );
  return String(result.rows[0].id);
}

async function createConversation(
  client: PoolClient,
  workspaceId: string,
  title = "Synthetic P02.5 conversation",
) {
  const result = await client.query(
    `INSERT INTO kz_conversations (workspace_id, title) VALUES ($1, $2) RETURNING id`,
    [workspaceId, title],
  );
  return String(result.rows[0].id);
}

async function createPlan(
  client: PoolClient,
  workspaceId: string,
  conversationId: string,
  values: { revision?: number; approvedBy?: string | null; approvedAt?: Date | null } = {},
) {
  const result = await client.query(
    `INSERT INTO kz_action_plans
       (workspace_id, conversation_id, revision, payload_hash, expires_at, approved_by, approved_at)
     VALUES ($1, $2, $3, $4, now() + interval '1 day', $5, $6) RETURNING id`,
    [
      workspaceId,
      conversationId,
      values.revision ?? 1,
      `synthetic-hash-${randomUUID()}`,
      values.approvedBy ?? null,
      values.approvedAt ?? null,
    ],
  );
  return String(result.rows[0].id);
}

async function createStep(
  client: PoolClient,
  workspaceId: string,
  planId: string,
  values: { ordinal?: number; idempotencyKey?: string; attemptCount?: number } = {},
) {
  const result = await client.query(
    `INSERT INTO kz_action_steps
       (workspace_id, plan_id, ordinal, kind, input, idempotency_key, attempt_count)
     VALUES ($1, $2, $3, 'synthetic.test', '{}'::jsonb, $4, $5) RETURNING id`,
    [
      workspaceId,
      planId,
      values.ordinal ?? 1,
      values.idempotencyKey ?? `p025-step-${randomUUID()}`,
      values.attemptCount ?? 0,
    ],
  );
  return String(result.rows[0].id);
}

async function createFixture(client: PoolClient): Promise<Fixture> {
  const { marker, userId } = await createUser(client);
  const workspaceId = await createWorkspace(client, userId, marker);
  const connection = await client.query(
    `INSERT INTO kz_connections (workspace_id, provider, account_label)
     VALUES ($1, 'gmail', 'synthetic@example.test') RETURNING id`,
    [workspaceId],
  );
  const conversationId = await createConversation(client, workspaceId);
  const message = await client.query(
    `INSERT INTO kz_chat_messages (workspace_id, conversation_id, role, parts)
     VALUES ($1, $2, 'user', '[]'::jsonb) RETURNING id`,
    [workspaceId, conversationId],
  );
  const planId = await createPlan(client, workspaceId, conversationId);
  const stepId = await createStep(client, workspaceId, planId);
  const activity = await client.query(
    `INSERT INTO kz_activity (workspace_id, actor_type, operation, status, safe_summary)
     VALUES ($1, 'system', 'synthetic_test', 'succeeded', 'Synthetic test event') RETURNING id`,
    [workspaceId],
  );

  return {
    marker,
    userId,
    workspaceId,
    connectionId: String(connection.rows[0].id),
    conversationId,
    messageId: String(message.rows[0].id),
    planId,
    stepId,
    activityId: String(activity.rows[0].id),
  };
}

function probeDatabase(environment: NodeJS.ProcessEnv) {
  return spawnSync(
    process.execPath,
    ["--import=tsx", "--conditions=react-server", "./tests/db/probe.ts"],
    { cwd: process.cwd(), env: environment, encoding: "utf8", timeout: 10_000 },
  );
}

before(async () => {
  const result = await database.execute(sql`SELECT 1 AS value`);
  assert.equal(Number(result.rows[0].value), 1);
});

after(async () => {
  await pool.end();
});

test("inserts synthetic records in all eight tables with PostgreSQL defaults", async () => {
  await transaction(async (client) => {
    const fixture = await createFixture(client);
    const rows = await client.query(
      `SELECT
         (SELECT count(*) FROM kz_users WHERE id = $1) AS users,
         (SELECT count(*) FROM kz_workspaces WHERE id = $2) AS workspaces,
         (SELECT count(*) FROM kz_connections WHERE id = $3) AS connections,
         (SELECT count(*) FROM kz_conversations WHERE id = $4) AS conversations,
         (SELECT count(*) FROM kz_chat_messages WHERE id = $5) AS messages,
         (SELECT count(*) FROM kz_action_plans WHERE id = $6) AS plans,
         (SELECT count(*) FROM kz_action_steps WHERE id = $7) AS steps,
         (SELECT count(*) FROM kz_activity WHERE id = $8) AS activity`,
      [
        fixture.userId,
        fixture.workspaceId,
        fixture.connectionId,
        fixture.conversationId,
        fixture.messageId,
        fixture.planId,
        fixture.stepId,
        fixture.activityId,
      ],
    );
    assert.deepEqual(Object.values(rows.rows[0]).map(Number), [1, 1, 1, 1, 1, 1, 1, 1]);

    const defaults = await client.query(
      `SELECT u.timezone, u.created_at, u.updated_at,
              c.status AS connection_status, c.created_at AS connection_created,
              p.status AS plan_status, p.revision, p.created_at AS plan_created,
              s.status AS step_status, s.attempt_count, s.created_at AS step_created,
              a.created_at AS activity_created,
              pg_typeof(u.created_at)::text AS timestamp_type
       FROM kz_users u
       JOIN kz_workspaces w ON w.owner_user_id = u.id
       JOIN kz_connections c ON c.workspace_id = w.id
       JOIN kz_conversations v ON v.workspace_id = w.id
       JOIN kz_action_plans p ON p.workspace_id = w.id
       JOIN kz_action_steps s ON s.plan_id = p.id
       JOIN kz_activity a ON a.workspace_id = w.id
       WHERE u.id = $1`,
      [fixture.userId],
    );
    const row = defaults.rows[0];
    assert.equal(row.timezone, "Asia/Kolkata");
    assert.equal(row.connection_status, "disconnected");
    assert.equal(row.plan_status, "proposed");
    assert.equal(Number(row.revision), 1);
    assert.equal(row.step_status, "pending");
    assert.equal(Number(row.attempt_count), 0);
    assert.equal(row.timestamp_type, "timestamp with time zone");
    for (const field of [
      "created_at",
      "updated_at",
      "connection_created",
      "plan_created",
      "step_created",
      "activity_created",
    ]) {
      assert.ok(row[field] instanceof Date, `${field} should use the database timestamp default`);
    }
  });
});

test("enforces required fields and ordinary foreign keys with expected SQLSTATEs", async () => {
  await transaction(async (client) => {
    await createFixture(client);
    await expectPgCode(client, "23502", () =>
      client.query(`INSERT INTO kz_users (google_sub, email) VALUES ('p025-null-email', NULL)`),
    );
    await expectPgCode(client, "23503", () =>
      client.query(
        `INSERT INTO kz_connections (workspace_id, provider) VALUES ($1, 'gmail')`,
        [randomUUID()],
      ),
    );
  });
});

test("enforces unique Google subject and one workspace per owner", async () => {
  await transaction(async (client) => {
    const fixture = await createFixture(client);
    await expectPgCode(client, "23505", () =>
      client.query(
        `INSERT INTO kz_users (google_sub, email) VALUES ($1, 'duplicate@example.test')`,
        [fixture.marker],
      ),
    );
    await expectPgCode(client, "23505", () => createWorkspace(client, fixture.userId));
  });
});

test("enforces provider uniqueness and rejects invalid enum values", async () => {
  await transaction(async (client) => {
    const fixture = await createFixture(client);
    await expectPgCode(client, "23505", () =>
      client.query(
        `INSERT INTO kz_connections (workspace_id, provider) VALUES ($1, 'gmail')`,
        [fixture.workspaceId],
      ),
    );
    await expectPgCode(client, "22P02", () =>
      client.query(
        `INSERT INTO kz_connections (workspace_id, provider) VALUES ($1, 'not_a_provider')`,
        [fixture.workspaceId],
      ),
    );
  });
});

test("rejects cross-workspace conversation references in messages and plans", async () => {
  await transaction(async (client) => {
    const first = await createFixture(client);
    const otherUser = await createUser(client);
    const otherWorkspace = await createWorkspace(client, otherUser.userId, otherUser.marker);
    await expectPgCode(client, "23503", () =>
      client.query(
        `INSERT INTO kz_chat_messages (workspace_id, conversation_id, role, parts)
         VALUES ($1, $2, 'user', '[]'::jsonb)`,
        [otherWorkspace, first.conversationId],
      ),
    );
    await expectPgCode(client, "23503", () =>
      createPlan(client, otherWorkspace, first.conversationId),
    );
  });
});

test("rejects cross-workspace action plan references in steps", async () => {
  await transaction(async (client) => {
    const first = await createFixture(client);
    const otherUser = await createUser(client);
    const otherWorkspace = await createWorkspace(client, otherUser.userId, otherUser.marker);
    await expectPgCode(client, "23503", () =>
      createStep(client, otherWorkspace, first.planId, { ordinal: 2 }),
    );
  });
});

test("enforces duplicate step ordinal and workspace idempotency key constraints", async () => {
  await transaction(async (client) => {
    const fixture = await createFixture(client);
    const duplicateKey = `p025-key-${randomUUID()}`;
    await createStep(client, fixture.workspaceId, fixture.planId, {
      ordinal: 2,
      idempotencyKey: duplicateKey,
    });
    await expectPgCode(client, "23505", () =>
      createStep(client, fixture.workspaceId, fixture.planId, {
        ordinal: 1,
        idempotencyKey: `p025-other-${randomUUID()}`,
      }),
    );
    const otherPlan = await createPlan(client, fixture.workspaceId, fixture.conversationId);
    await expectPgCode(client, "23505", () =>
      createStep(client, fixture.workspaceId, otherPlan, {
        idempotencyKey: duplicateKey,
      }),
    );
  });
});

test("enforces revision, approval-pair, and attempt-count checks", async () => {
  await transaction(async (client) => {
    const fixture = await createFixture(client);
    await expectPgCode(client, "23514", () =>
      createPlan(client, fixture.workspaceId, fixture.conversationId, { revision: 0 }),
    );
    await expectPgCode(client, "23514", () =>
      createPlan(client, fixture.workspaceId, fixture.conversationId, {
        approvedBy: fixture.userId,
      }),
    );
    await expectPgCode(client, "23514", () =>
      createStep(client, fixture.workspaceId, fixture.planId, { attemptCount: -1 }),
    );
  });
});

test("uses restrictive deletion for owned parent records", async () => {
  await transaction(async (client) => {
    const fixture = await createFixture(client);
    await expectPgCode(client, "23503", () =>
      client.query(`DELETE FROM kz_workspaces WHERE id = $1`, [fixture.workspaceId]),
    );
    await expectPgCode(client, "23503", () =>
      client.query(`DELETE FROM kz_conversations WHERE id = $1`, [fixture.conversationId]),
    );
    await expectPgCode(client, "23503", () =>
      client.query(`DELETE FROM kz_action_plans WHERE id = $1`, [fixture.planId]),
    );
    await expectPgCode(client, "23503", () =>
      client.query(`DELETE FROM kz_users WHERE id = $1`, [fixture.userId]),
    );
  });
});

test("reports missing and malformed DATABASE_URL safely through the lazy client", () => {
  const missingEnvironment = { ...process.env };
  delete missingEnvironment.DATABASE_URL;
  const missing = probeDatabase(missingEnvironment);
  assert.equal(missing.status, 2, missing.stderr);
  assert.equal(missing.stdout, "SAFE_CONFIG_ERROR");

  const invalidValue = "sentinel-invalid-db-url";
  const invalid = probeDatabase({ ...process.env, DATABASE_URL: invalidValue });
  assert.equal(invalid.status, 2, invalid.stderr);
  assert.equal(invalid.stdout, "SAFE_CONFIG_ERROR");
  assert.ok(!invalid.stdout.includes(invalidValue));

  assert.throws(
    () => parseDatabaseEnv({ NODE_ENV: "test" }),
    /DATABASE_URL: is required/,
  );
  assert.throws(
    () => parseDatabaseEnv({ NODE_ENV: "test", DATABASE_URL: invalidValue }),
    (error: unknown) =>
      error instanceof Error &&
      error.message.includes("must be a valid URL") &&
      !error.message.includes(invalidValue),
  );
});

test("refuses non-local database targets before running fixtures", () => {
  assert.throws(
    () => assertLocalTestDatabaseUrl("postgresql://user:secret@db.example.test:5433/kriyzen"),
    (error: unknown) =>
      error instanceof Error &&
      error.message.includes("require the local KriyZen database") &&
      !error.message.includes("secret") &&
      !error.message.includes("db.example.test"),
  );
  assert.throws(
    () => assertLocalTestDatabaseUrl("postgresql://user:secret@127.0.0.1:5433/anotherdb"),
    /require the local KriyZen database/,
  );
});

test("reports unreachable database connections safely through the lazy client", () => {
  const unreachable = new URL(process.env.DATABASE_URL ?? "");
  unreachable.hostname = "127.0.0.1";
  unreachable.port = "1";
  const result = probeDatabase({ ...process.env, DATABASE_URL: unreachable.toString() });

  assert.equal(result.status, 3, `${result.stdout} ${result.stderr}`);
  assert.equal(result.stdout, "CONNECTION_REFUSED");
  assert.ok(!result.stdout.includes(unreachable.password));
});

test("leaves no synthetic fixture rows after rollback", async () => {
  const result = await pool.query(
    `SELECT count(*)::int AS count FROM kz_users WHERE google_sub LIKE 'p025-%'`,
  );
  assert.equal(result.rows[0].count, 0);
});
