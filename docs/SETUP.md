# Setup runbook — P01 to P04

## P01 foundation

This repository already contains the P01 Next.js App Router foundation. Use Node.js 22 or newer and pnpm:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm dev
```

The current foundation needs no database, Google, Corsair, or AI credentials. Next.js loads environment files natively. For optional local settings, copy `.env.example` to `.env.local` (PowerShell: `Copy-Item .env.example .env.local`). Git ignores `.env.local` and other `.env*` files while retaining `.env.example`. See `src/env.schema.ts`, `src/env.ts`, and `src/env.client.ts` for the Zod allowlists and server/public boundary. Never put secrets in `NEXT_PUBLIC_*` variables.

## P02 PostgreSQL and Drizzle

P02.1 provides local PostgreSQL in Docker Compose. The project database docs do not specify a Corsair-required PostgreSQL major version. PostgreSQL 16 is used as the baseline; the official image is pinned to `postgres:16.16-bookworm`.

Host port 5432 is already used by another local PostgreSQL container, so this project binds its database to `127.0.0.1:5433` and leaves the existing container untouched. The connection string for later application use is `postgresql://kriyzen:<local-password>@localhost:5433/kriyzen`.

Copy `.env.example` to `.env.local` and replace the password placeholder with a generated local secret. `.env.local` is ignored by Git. Docker Compose does **not** automatically load Next.js `.env.local`; pass it explicitly with `--env-file` on every Compose command:

```bash
docker compose --env-file .env.local config --quiet
docker compose --env-file .env.local up --detach --wait
docker compose --env-file .env.local ps
docker compose --env-file .env.local logs --tail=50 postgres
docker compose --env-file .env.local exec -T postgres psql -U kriyzen -d kriyzen -c "SELECT 1;"
docker compose --env-file .env.local restart postgres
docker compose --env-file .env.local stop
```

`up --detach --wait` starts PostgreSQL and waits for the configured health check. `restart` and `stop` preserve the named `kriyzen-postgres-data` volume. Do not use `down --volumes` for routine development. The volume stores the PostgreSQL cluster, while `DATABASE_URL` is reserved for the future app/Drizzle setup; no Drizzle package, migration, or application table is part of P02.1.

### P02.2 Drizzle ORM foundation

The app uses `drizzle-orm@0.45.4` with `pg@8.23.1` and `drizzle-orm/node-postgres`. Pool creation is lazy and server-only in `src/server/db/index.ts`; the pool is cached across development hot reloads. `DATABASE_URL` is parsed by the shared Zod schema when `getDb()` is called. Pool settings are 10 maximum connections, 5-second connect timeout, and 30-second idle timeout.

`drizzle.config.ts` loads `.env.local` explicitly with `@next/env@15.5.29`, then validates `DATABASE_URL` before passing it to Drizzle Kit. This loader is for the CLI, which runs outside Next.js. It does not connect by itself for config operations such as `db:check`.

Drizzle Kit scripts:

```bash
pnpm db:generate  # generate SQL from a later schema change
pnpm db:migrate   # apply generated migrations
pnpm db:studio    # open Drizzle Studio
pnpm db:check     # check generated migration-history consistency
```

Database integration tests use the built-in Node.js test runner and require the local KriyZen PostgreSQL service and `.env.local`:

```bash
pnpm test:db
```

The suite refuses any target other than loopback port 5433 and database `kriyzen`, rolls back every synthetic fixture, and checks that no marker rows remain. It never resets the schema or removes volumes. See `docs/TESTING.md` for coverage and the distinction between database constraints and application authorization.

`db:check` is the official `drizzle-kit check` command. The other scripts map directly to supported Drizzle Kit commands. There is intentionally no schema-push script. KriyZen Drizzle Kit loads only `src/server/db/schema/index.ts` and applies the secondary `kz_*` table filter; inspect generated SQL rather than relying on the filter alone. Migration history is isolated in `kriyzen_migrations.__drizzle_migrations`, separate from public app tables and future Corsair history. The reviewed initial migration is `drizzle/0000_equal_beast.sql`. P02.4 applied it to the local KriyZen database: six `kz_*` enums and eight `kz_*` tables; no Corsair objects were created. Always review generated SQL and verify the local catalog after applying. Corsair's exact schema and migration behavior must be checked against a pinned SDK before P03. Do not use destructive schema push against production.

P02.6 verified fresh-database reproducibility by applying the committed migration to a randomly named temporary local database, comparing normalized catalog definitions with `kriyzen`, and removing only that temporary database. The KriyZen database was not reset. P02 is complete. P03.1 has since verified the pinned candidate's database ownership and driver compatibility in a separate disposable database; Corsair remains uninstalled in KriyZen pending P03.2 approval.

## P03 Google and Corsair connectivity

Use dedicated test accounts. Verify current Google Cloud consent, Gmail/Calendar API setup, exact redirect URIs, and minimum scopes from official Google documentation before creating credentials. Identity sign-in and Gmail/Calendar grants are separate decisions.

P03.1 complete (2026-11-26): exact candidate packages were tested only in a temporary project, not installed in KriyZen. Node `24.13.0`, TypeScript `5.9.3`, and Zod `4.6.7` were used. Imports, plugin registration, TS compile, CLI loading, actual disposable PostgreSQL operations, shared pg.Pool/Drizzle use, official five-table DDL, setup repeatability, and permission lifecycle passed. `npm audit` reported zero advisories across 112 resolved entries. Scripts were disabled after reviewing core's postinstall that fetches optional `frpc` to user cache. See `docs/REFERENCES.md` and ADR-017/018.

The exact candidate adapter accepts the same `pg.Pool` used by Drizzle; disposable PostgreSQL tests confirmed shared-pool operation. The current lazy `getDb()` exposes only Drizzle, so P03.2 may need a small server-only pool accessor. Keep Corsair inside the single Next.js App Router application and use the Node runtime for integration routes.

The official PostgreSQL DDL for all five tables was verified against candidate `corsair@0.2.33` and exercised only in a disposable database. `setupCorsair` checks schema and provisions integration/account records; it does not apply table migrations. Use separately versioned/reviewed vendor SQL with its own migration history. Do not use `drizzle-kit push` or add vendor tables to KriyZen's `kz_*` schema; preserve ADR-016's history.

Hub is optional for the candidate SDK's self-managed OAuth path: exact core exports `generateOAuthUrl` and `processOAuthCallback` using signed state and the same registered redirect URI. Static implementation signs with configured `kek`, validates HMAC-SHA256 and a ten-minute age; runtime rejected malformed unsigned callback state. This does not provide application session binding or visible replay prevention. Hub remains an alternative hosted flow; ADR-018 owner approval and ADR-005 authentication/tenant ownership are required before routes are implemented. Exact Gmail plugin scope is `https://www.googleapis.com/auth/gmail.modify`; exact Calendar scopes are `https://www.googleapis.com/auth/calendar.events` and `https://www.googleapis.com/auth/calendar.freebusy`. Confirm least privilege and Google policy before credentials are created. Candidate `setupCorsair` checks table presence but does not initialize schema. Official five-table DDL was tested only in the disposable spike DB. Keep vendor objects and independently versioned migrations outside KriyZen `kz_*` schema and ADR-016 migration history.

The SDK accepts `kek` as a server-side configuration string; it does not prescribe a particular environment variable name. The SDK documents DEK encryption using AES-256-GCM with a key derived from the KEK, but the reviewed public type does not declare a minimum KEK format/length. KriyZen must generate and protect a high-entropy server-only value if adopted. Google OAuth `client_id` and `client_secret` are integration credentials configured through Corsair; account access/refresh tokens are stored encrypted in Corsair's database. The optional Hub config instead accepts project API key and signing secret values. No real credentials were created in P03.1. The exact Gmail/Calendar source has refresh hooks that retry after an authorization failure; live refresh behavior remains untested. Recommend the SDK's self-managed OAuth for zero-budget development, subject to ADR-018 owner approval and app-owned session binding, CSRF/replay protection, callback authorization, and tenant mapping. Real Google verification belongs to later P03 subphases.

The core and plugin packages are listed under Apache-2.0. The isolated exact candidate dependency audit found zero advisories; re-audit before install/release. Self-hosted SDK use is described as free, but Corsair's current pages disagree about Hub free-plan limits. Do not rely on a hosted tier or enable a paid feature until its current terms and the INR 0 project constraint are confirmed. Use a dedicated Google test account. P03.1 verified package APIs but not real Google connectivity; later phases must validate exact operation schemas and bounded reads, inspect cache contents, and never copy the starter's fixed development tenant/public procedures. Authentication and tenant mapping remain P04 requirements.

## P04 authentication

Authentication library and supported per-user integration grant flow remain pending ADR-005. Obtain the documented decision before installing an auth dependency or finalizing auth environment variables. Implement verified server sessions and tenant isolation before exposing protected data or integration procedures.

## Later AI and webhook phases

Groq, Vercel AI SDK, Corsair MCP, Gmail/Calendar webhooks, and Ngrok are not configured in P01. Verify current provider docs, model availability, data policies, signatures, and supported runtime when their roadmap phases begin. Never expose unrestricted MCP script execution to model-generated code; follow `docs/AI_AGENT.md` and pending ADR-006. Ngrok is a local webhook tunnel only.
