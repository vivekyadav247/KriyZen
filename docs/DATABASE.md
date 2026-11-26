# Database design — PostgreSQL + Drizzle

## Ownership and modeling assumptions
One PostgreSQL database is planned. Corsair owns its vendor objects and KriyZen owns `kz_*` application tables. P03.1 verified the official five-table PostgreSQL DDL against candidate `corsair@0.2.33` and SDK operations in a disposable database; the package has no migration runner/history. Any future vendor DDL must be separately versioned, reviewed and tracked in independent history. This document describes design, not executable migration SQL. Personal workspace, one account per provider, opaque Google/Corsair IDs stored as text. App identifiers are UUID; timestamps are timestamptz except explicitly date-only event fields (held by provider). Use JSONB only for flexible validated payloads, not ownership or statuses.

## Runtime connection foundation (P02.2)

The application uses Drizzle ORM with its `node-postgres` driver and a `pg.Pool`. The pool and Drizzle client are created lazily by `src/server/db/index.ts` on first `getDb()` call, cached on `globalThis` during Next.js development reloads, and marked server-only. Pool defaults are 10 clients, a 5-second connection timeout, and a 30-second idle timeout. Importing the module alone does not validate the URL, create a pool, or connect.

`DATABASE_URL` is validated by the shared Zod environment schema only when `getDb()` is called or Drizzle Kit loads its config. Errors name the variable and safe requirement, never echo its value. Next.js loads `.env.local` in app runtime; `drizzle.config.ts` uses the version-matched `@next/env` loader when Drizzle Kit runs outside Next.js. Production builds and routes that do not call `getDb()` need no database connection.

The Corsair Google Demo package reviewed for P02.2 uses `drizzle-orm@^0.41.0` with the `postgres` (postgres.js) driver, not `pg`. This was a starter choice, not a PostgreSQL or Drizzle requirement. P03.1 exact-release review and disposable runtime testing confirmed `corsair@0.2.33` accepts a shared `pg.Pool` and wraps it with Kysely `PostgresDialect({ pool })`; Drizzle and Corsair operations both succeeded on that pool. P03.2 verified construction/import compatibility in KriyZen, but no Corsair client is configured and the app pool lifecycle integration remains future work.

P02.3 defines only the KriyZen-owned `kz_*` tables below. The Drizzle schema entry point exports no Corsair tables. `drizzle.config.ts` points only to this KriyZen schema and sets `tablesFilter: ["kz_*"]`. These config filters are an additional guard, not proof that generated SQL is safe; inspect every migration before applying it. Drizzle migration history uses the application-owned `kriyzen_migrations.__drizzle_migrations` table, separate from application objects in `public` and future vendor history. P03.1 found no Corsair migrator/history in the exact candidate release and owner approval now requires separately reviewed/versioned vendor SQL with independent history. Independent history does not guarantee future vendor SQL will avoid KriyZen objects; inspect every release and migration before application.

P02.4 generated and applied `drizzle/0000_equal_beast.sql`. The migration creates six `kz_*` PostgreSQL enums and the eight documented `kz_*` tables in `public`; its history row is stored in `kriyzen_migrations.__drizzle_migrations`. Catalog review confirmed the objects and constraints after application. Subsequent migrations still require SQL review before apply; do not use `drizzle-kit push`.

P02.5's `pnpm test:db` integration suite connects through the lazy Drizzle client and checks representative inserts and integrity constraints against PostgreSQL. It uses synthetic rows in rolled-back transactions and makes no schema changes. Verified SQLSTATEs include `23502`, `23503`, `23505`, `22P02`, and `23514`. These database constraints enforce relational integrity, but do not replace server authorization: derive workspace/tenant from a verified session, validate Corsair account ownership, and enforce current approval/hash/expiry and action-step lifecycle rules in server code.

P02.6 applied the committed migration to a uniquely named, empty local verification database and compared normalized enum labels, table columns/defaults, constraints, and indexes against `kriyzen`. Both contained eight application tables, six enums, 33 constraints, 23 indexes, and one application-owned migration-history row, with no Corsair tables. The temporary database was removed; the existing `kriyzen` database and schema were not reset or changed.

## Entity relationship diagram
```mermaid
erDiagram
 KZ_USERS ||--|| KZ_WORKSPACES : owns
 KZ_USERS ||--o{ KZ_SESSIONS : authenticates
 KZ_WORKSPACES ||--o{ KZ_CONNECTIONS : connects
 KZ_WORKSPACES ||--o{ KZ_CONVERSATIONS : owns
 KZ_CONVERSATIONS ||--o{ KZ_CHAT_MESSAGES : contains
 KZ_WORKSPACES ||--o{ KZ_ACTION_PLANS : approves
 KZ_CONVERSATIONS ||--o{ KZ_ACTION_PLANS : originates
 KZ_ACTION_PLANS ||--|{ KZ_ACTION_STEPS : contains
 KZ_WORKSPACES ||--o{ KZ_ACTIVITY : records
 KZ_CONNECTIONS ||--o{ KZ_WEBHOOK_RECEIPTS : receives
 CORSAIR_INTEGRATIONS ||--o{ CORSAIR_ACCOUNTS : provides
 CORSAIR_ACCOUNTS ||--o{ CORSAIR_ENTITIES : caches
 CORSAIR_ACCOUNTS ||--o{ CORSAIR_EVENTS : records
 KZ_CONNECTIONS o|--o| CORSAIR_ACCOUNTS : logical_mapping
```
Logical mapping is not an imposed FK across ownership boundaries. Validate tenant + integration + account on every use. Session table is conditional on selected auth mechanism; do not create duplicate library-owned auth storage.

## Corsair-owned objects (research only; no vendor objects applied)

Current official Corsair database docs and the inspected repository source enumerate five tables. The current documentation provides PostgreSQL/Drizzle schema examples, but the retrieved material does not provide a complete, candidate-version-pinned definition for all five objects:

| Table | Purpose documented by Corsair |
|---|---|
| `corsair_integrations` | Enabled plugin/integration configuration and integration DEK |
| `corsair_accounts` | Tenant integration/account configuration and account DEK |
| `corsair_entities` | Cached provider entities scoped through an account |
| `corsair_events` | API/webhook event records |
| `corsair_permissions` | Permission approval queue |

The exact `corsair@0.2.33` package exports `CORSAIR_CORE_TABLE_NAMES` with these five names and row schemas for integrations, accounts, entities, events, and permissions. This confirms the candidate release's table inventory, not future releases; the documentation's conflicting “six” count remains a vendor-doc inconsistency. Do not write vendor credential/cache rows directly, duplicate provider tokens, or alter Corsair constraints.

The exact package's `setupCorsair` introspects configured Corsair tables, warns with missing table/schema details, and provisions integration/account rows and DEKs when possible. It does not issue `CREATE TABLE` or run migrations. Its bundled `createTestDatabase()` creates integrations, accounts, entities, and events for in-memory SQLite tests; it omits `corsair_permissions` and is not a production initializer. No vendor migration runner or history namespace appears in the package artifacts. The official PostgreSQL DDL covers all five tables and was applied only to the disposable P03.1 database; catalog definitions and SDK insert/query/setup tests passed. A separately versioned and reviewed vendor SQL migration with an independent history record is recommended; it must remain outside KriyZen's Drizzle schema and `kriyzen_migrations`. Preserve ADR-016 and do not run `drizzle-kit push` for vendor schema.

Exact-release declarations and runtime adapter accept `pg.Pool` and wrap it with Kysely's `PostgresDialect({ pool })`. An isolated runtime test passed one real Pool to both Corsair and Drizzle, using KriyZen's pool limits (max 10, 5-second connection timeout, 30-second idle timeout). `SELECT 1`, Corsair integration/account/entity/event writes, plugin cache upsert/read, permission lookups/status transitions, and Drizzle queries after Corsair calls all passed. Pool metrics showed one total/idle connection and no waiting clients; Corsair did not create a separate Pool or close the shared pool during operations. The test explicitly ended the Pool. All of this used a disposable DB; original KriyZen remained unchanged.

### Candidate Corsair PostgreSQL schema verification (P03.1)

The official [Corsair database guide](https://docs.corsair.dev/concepts/database) PostgreSQL DDL was compared field by field with `corsair@0.2.33` `db.d.ts` schemas and runtime operations. All five tables, 39 columns, JSONB fields, timestamptz timestamps/defaults, primary keys, and three account/integration foreign keys matched. `corsair_permissions` has 11 columns; token is not unique, `tenant_id` is required text without a KriyZen FK, `args` and ISO `expires_at` are text, and `status` is text with default `pending`. SDK validation defines status values, but PostgreSQL DDL does not enforce a CHECK or token uniqueness. The SDK creates random tokens and performs status transitions using these fields. Preserve the upstream DDL exactly; add application protections only in separately reviewed design work.

Corsair setup on the disposable schema provisioned Gmail and Calendar integration/account rows. Repeating `setupCorsair` left counts unchanged and produced no missing-table warnings. The KriyZen catalog, including normalized definitions, six enums, 33 constraints, 23 indexes, one migration-history row, and all zero application row counts, was identical before and after Corsair schema/setup. The disposable database was removed. A final read-only comparison confirmed the real `kriyzen` database remains unchanged with zero Corsair tables.

## KriyZen-owned tables (implemented schema, P02.3)
Notation: `!` required; otherwise nullable. Every id PK UUID, every created_at ! defaults now; updated_at ! where mutable, maintained by application/ORM. All status values constrained via enum/check. Tables below are logical columns; auth library choice can change only identity/session implementation via ADR.

| Table | Columns and constraints |
|---|---|
| kz_users | id, google_sub text ! unique (stable OIDC subject, not email), email text !, display_name text, avatar_url text, timezone text ! default Asia/Kolkata (user-editable), created_at, updated_at |
| kz_workspaces | id, owner_user_id UUID ! FK users unique, corsair_tenant_id text ! unique (server-generated), name text !, created_at, updated_at |
| kz_sessions (conditional) | id, user_id UUID ! FK users, token_hash text ! unique, expires_at timestamptz !, revoked_at timestamptz, created_at; replace with approved library/session design if applicable |
| kz_connections | id, workspace_id UUID ! FK workspaces, provider enum ! (`gmail`, `googlecalendar`), corsair_account_id text unique nullable until verified, account_label text, status enum !, last_synced_at timestamptz, last_error_code text, created_at, updated_at; unique(workspace_id,provider) |
| kz_conversations | id, workspace_id UUID ! FK workspaces, title text !, created_at, updated_at |
| kz_chat_messages | id, workspace_id UUID !, conversation_id UUID !, role enum ! (user/assistant/tool), parts JSONB ! (validated, bounded), created_at; composite FK to conversation workspace/id |
| kz_action_plans | id, workspace_id UUID !, conversation_id UUID !, revision int ! default 1, status enum !, payload_hash text !, expires_at timestamptz !, approved_by UUID FK users, approved_at timestamptz, created_at, updated_at; composite FK conversation; approver must be workspace owner |
| kz_action_steps | id, workspace_id UUID !, plan_id UUID !, ordinal int !, kind text !, input JSONB !, status enum !, idempotency_key text !, provider_reference text, error_code text, attempt_count int ! default 0, started_at timestamptz, finished_at timestamptz, created_at, updated_at; unique(plan_id,ordinal), unique(workspace_id,idempotency_key), composite FK plan |
| kz_activity | id, workspace_id UUID ! FK workspaces, actor_type text !, operation text !, status enum ! (`succeeded`, `failed`, `unknown`), reference_id text, safe_summary text, created_at |
| kz_webhook_receipts (P1, only if Corsair does not already deduplicate sufficiently) | id, workspace_id UUID !, connection_id UUID !, delivery_key text !, status text !, attempts int ! default 0, created_at, updated_at; unique(connection_id,delivery_key); composite FK connection |

Every composite parent referenced above has unique(workspace_id,id). Non-composite child workspace FK implied for all workspace-owned rows. Validate approved_by is owner server-side, or enforce additional composite relationship. Plan/step input cannot mutate after approval: edit creates a new revision with new hash (same plan may be updated only while proposed; old approval rejected). Hash covers ordered steps, validated inputs, workspace and revision; canonical server serialization. Use explicit version checks in transactions. Cascade dependent app data only through deliberate workspace/account deletion procedures; never cascade into Corsair by guesswork.

The schema enforces the workspace and parent-row relationships, single owner per user/workspace, and plan approver equals workspace owner. Server authorization must still derive the active workspace and Corsair tenant from the verified session for every read and write; never trust client/model-supplied IDs. Before using `corsair_account_id`, server code must verify the referenced Corsair account belongs to that workspace's tenant and expected integration. The database cannot verify that vendor ownership because it intentionally has no cross-vendor FK.

Database uniqueness on `(workspace_id, idempotency_key)` prevents duplicate step keys within a workspace, but does not make a remote provider write exactly-once. The server must atomically claim the current plan revision/hash, persist step state before and after remote calls, and reconcile `unknown` outcomes before retry. It must reject stale approvals, changed payload hashes, expired plans, and replay of succeeded steps.

## State machines
Connection: disconnected → connecting → connected; errors → needs_reauth/error; disconnect invalidates tools immediately. Plan: proposed → approved → executing → succeeded/partial_failed/failed/needs_reconciliation; proposed → cancelled/expired. Steps: pending → running → succeeded/failed/unknown; downstream → skipped if dependency fails. Reconcile unknown before any replay. A partial plan may resume only independently verified safe failed steps after explicit retry approval; never replay succeeded steps.

Activity records are append-only outcomes, not an execution state machine. `succeeded` means the recorded operation definitely succeeded, `failed` means it definitely failed, and `unknown` means the external outcome is uncertain and needs reconciliation. Store the operation separately (for example, `plan_approved` with status `succeeded`). Do not store a running activity status; active work is represented by action-plan and action-step states.

## Indexes
- users(google_sub), workspaces(owner_user_id), workspaces(corsair_tenant_id) unique.
- connections(workspace_id,provider) unique; activity(workspace_id,created_at DESC).
- conversations(workspace_id,updated_at DESC); messages(conversation_id,created_at,id).
- plans(workspace_id,status,expires_at); steps(plan_id,ordinal) unique; idempotency uniqueness above.
- Index all frequently joined foreign keys not covered by existing indexes. Inspect Corsair cache query plans before proposing indexes; do not modify vendor tables casually.

The application schema sets restrictive foreign-key deletion behavior rather than cascading dependent rows. Workspace/account deletion remains a deliberate server-side procedure that handles app data, sessions, Corsair grants, and vendor cache according to the pinned SDK's verified lifecycle. No retention or automatic purge job is implemented here.

## Transaction and retry strategy
Atomically claim plan with status/revision/hash/expiry and owner checks; record each step running before live call, then persist result immediately after. A crash after a remote effect but before local commit is ambiguous; inspect remote state. Event client-generated ID may help if the installed endpoint supports it; Gmail send has no assumed idempotency guarantee. Unknown sends require reconciliation or manual resolution; never automatically retry them. No distributed exactly-once claim.

## Privacy, retention, migrations
Store minimal chat/tool context, not duplicated inbox content. Suggested demo retention: 30 days chat/activity, 7 days webhook receipts if needed; actual retention policy requires owner approval and a deletion procedure. Keep credentials exclusively in approved credential/session storage. Encrypt KEK and secrets operationally; use test accounts. On disconnect, verify revocation and vendor-cache deletion behavior. KriyZen migration sequence: generate from the KriyZen-only schema, review SQL and migration metadata, apply using `drizzle-kit migrate`, then verify in a local database. Corsair uses its own pinned-version setup and migration lifecycle; do not combine its migration history or manage its objects with KriyZen's Drizzle config. Do not use destructive schema push on production.
