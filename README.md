# KriyZen — Your work, connected.

KriyZen is planned as a personal productivity workspace that brings Gmail and Google Calendar together, with an assistant that proposes cross-app actions for explicit user approval. Google integrations, authentication, database access, and AI are not implemented yet.

## Current project state

The P01 foundation is in place: a single Next.js 15 App Router application with TypeScript, Tailwind CSS v4, Radix-based shadcn/ui, the approved coral visual foundation, tRPC v11, TanStack Query, SuperJSON, and Zod environment validation. The app currently has a minimal home page and a public tRPC health procedure. The final landing page and workspace are not implemented.

P01.6 is the final foundation audit and is awaiting the initial Git commit. P02 (PostgreSQL and Drizzle) has not started. See [PROGRESS](docs/PROGRESS.md) and [DECISIONS](docs/DECISIONS.md) for verified status and unresolved choices.

## Local setup

Use Node.js 22 or newer and pnpm. Install from the lockfile and start the app:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

No external-service credentials are needed for the current foundation. For local environment settings, optionally copy `.env.example` to `.env.local`; never commit `.env.local` or place secrets in `NEXT_PUBLIC_*` variables. See [SETUP](docs/SETUP.md) for phase-gated setup notes.

## Architecture and safety

KriyZen remains one Next.js application. Future Gmail and Calendar access must use the approved Corsair integration, and protected data must be scoped from a verified server session. The AI may propose actions; server validation and explicit user approval must gate writes. Authentication, database, Corsair/MCP compatibility, model, and hosting decisions remain phase-gated. No live integrations or migrations are claimed as working.

Hallmark Coral is visual inspiration only. KriyZen retains its own identity and workflows; no theme source was copied. See [UI Design](docs/UI_DESIGN.md) and locked ADR-014.

## Project documents

- Product: [PRD](docs/PRD.md), [User Workflows](docs/USER_WORKFLOWS.md), [UI Design](docs/UI_DESIGN.md)
- Engineering: [Tech Stack](docs/TECH_STACK.md), [Architecture](docs/ARCHITECTURE.md), [Database](docs/DATABASE.md), [API Contracts](docs/API_CONTRACTS.md), [Security](docs/SECURITY.md)
- Delivery: [Roadmap](docs/ROADMAP.md), [Setup](docs/SETUP.md), [Testing](docs/TESTING.md), [Deployment](docs/DEPLOYMENT.md), [Decisions](docs/DECISIONS.md), [Progress](docs/PROGRESS.md), [References](docs/REFERENCES.md)
