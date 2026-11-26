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

P02.1 provides local PostgreSQL in Docker Compose. The project database docs do not specify a Corsair-required PostgreSQL major version, and Corsair packages are not installed yet. PostgreSQL 16 is used as the baseline; the official image is pinned to `postgres:16.16-bookworm`.

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

`db:check` is the official `drizzle-kit check` command. The other scripts map directly to supported Drizzle Kit commands. There is intentionally no schema-push script. P02.2 does not run `db:generate` or `db:migrate`; there are no application tables or migration files yet. Before P02.3, inspect Corsair's installed schema and migration ownership, then reconcile the baseline. Do not use destructive schema push against production.

## P03 Google and Corsair connectivity

Use dedicated test accounts. Verify current Google Cloud consent, Gmail/Calendar API setup, exact redirect URIs, and minimum scopes from official Google documentation before creating credentials. Identity sign-in and Gmail/Calendar grants are separate decisions.

Corsair packages are not installed in the current P01 foundation. Before adding them, inspect current official package documentation, CLI help, license, versions, and source. Verify exact setup commands and endpoint names/inputs against the installed version; do not copy commands or invent environment variables from another repository. Test real, bounded reads and inspect what data is actually cached. Record verified package versions and operation names without recording credentials or email content. A fixed development tenant is private local-only; production tenant mapping must come from a verified server session.

## P04 authentication

Authentication library and supported per-user integration grant flow remain pending ADR-005. Obtain the documented decision before installing an auth dependency or finalizing auth environment variables. Implement verified server sessions and tenant isolation before exposing protected data or integration procedures.

## Later AI and webhook phases

Groq, Vercel AI SDK, Corsair MCP, Gmail/Calendar webhooks, and Ngrok are not configured in P01. Verify current provider docs, model availability, data policies, signatures, and supported runtime when their roadmap phases begin. Never expose unrestricted MCP script execution to model-generated code; follow `docs/AI_AGENT.md` and pending ADR-006. Ngrok is a local webhook tunnel only.
