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

Before implementation, review `docs/DATABASE.md` and choose a disposable local PostgreSQL instance (existing local service or Docker). Add database environment variables only when their exact names and usage are implemented. Inspect Corsair's installed schema and migration ownership before choosing a migration baseline. Review generated SQL and test a clean local migration. Do not use destructive schema push against production.

## P03 Google and Corsair connectivity

Use dedicated test accounts. Verify current Google Cloud consent, Gmail/Calendar API setup, exact redirect URIs, and minimum scopes from official Google documentation before creating credentials. Identity sign-in and Gmail/Calendar grants are separate decisions.

Corsair packages are not installed in the current P01 foundation. Before adding them, inspect current official package documentation, CLI help, license, versions, and source. Verify exact setup commands and endpoint names/inputs against the installed version; do not copy commands or invent environment variables from another repository. Test real, bounded reads and inspect what data is actually cached. Record verified package versions and operation names without recording credentials or email content. A fixed development tenant is private local-only; production tenant mapping must come from a verified server session.

## P04 authentication

Authentication library and supported per-user integration grant flow remain pending ADR-005. Obtain the documented decision before installing an auth dependency or finalizing auth environment variables. Implement verified server sessions and tenant isolation before exposing protected data or integration procedures.

## Later AI and webhook phases

Groq, Vercel AI SDK, Corsair MCP, Gmail/Calendar webhooks, and Ngrok are not configured in P01. Verify current provider docs, model availability, data policies, signatures, and supported runtime when their roadmap phases begin. Never expose unrestricted MCP script execution to model-generated code; follow `docs/AI_AGENT.md` and pending ADR-006. Ngrok is a local webhook tunnel only.
