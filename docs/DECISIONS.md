# Architectural decision records

Status: locked = explicit agreement; proposed = design choice for review; pending = unresolved gate. Owner must approve changes affecting locked stack. Do not label proposals as approved.

| ID | Status | Decision and rationale |
|---|---|---|
| ADR-001 | Locked | Single full-stack Next.js App Router app + TypeScript, Tailwind/shadcn, tRPC, Postgres/Drizzle, Corsair, Groq, Vercel AI SDK, Corsair MCP, Ngrok local, â‚¹0 target. No separate React app or Express backend. |
| ADR-002 | Proposed | Modular monolith, feature services, one DB; avoid microservices/queues until measured need. |
| ADR-003 | Proposed | Use official starter if assignment permits reuse; preserve compatible dependencies, migration history and attribution. pnpm matches starter. |
| ADR-004 | Proposed | One personal workspace and one account per provider; Corsair owns integration/cache tables, Kriyzen owns kz_ state. |
| ADR-005 | Pending P04 | Auth/session library and supported per-user Google OAuth integration flow; avoid fixed dev tenant public routes. |
| ADR-006 | Pending P08 | Safe Corsair MCP path in Next.js. Upstream HTTP example uses Express; generic script is unsandboxed. Prove compatible typed/allowlisted implementation or obtain approval for explicit fallback. |
| ADR-007 | Proposed | AI proposes only; exact user approval gates server writes, bounded reads, per-step persistence. |
| ADR-008 | Pending P08 | Groq model ID and account-specific free quota, data retention/Google API data-use policy. |
| ADR-009 | Pending P13 | Hosting, managed Postgres, runtime/time limits, free plan and OAuth verification. |
| ADR-010 | Proposed | Cache-first UI, live availability, explicit sync freshness, manual refresh even if webhooks enabled. |
| ADR-011 | Pending P10 | Gmail Pub/Sub/Calendar notification setup, verification, channel renewal and deduplication; verify costs before enabling. |
| ADR-012 | Superseded by ADR-014 | Earlier dark-first/violet visual proposal replaced by the approved warm editorial direction. |
| ADR-013 | Locked | P01.2 uses the owner-provided fresh vanilla Next.js scaffold (Next.js 15.5.29, React 19.1.0, TypeScript 5.9.3, Tailwind CSS 4.3.5, pnpm 12.23.0) as the configuration baseline. Merge only scaffold configuration and minimal foundation UI into the existing KriyZen structure; preserve docs and placeholders, and do not copy Corsair demo application source whose license was not verified. No architecture or locked-stack change. |
| ADR-014 | Locked | P01.3 adopts a warm, minimal editorial visual direction for KriyZen: ivory/off-white surfaces, muted coral accents, serif public-page headings, sans-serif workspace typography, generous whitespace, restrained borders/shadows, original product demonstrations, purposeful motion, and accessible light/dark themes. Hallmark Coral is visual inspiration only; preserve KriyZen branding, layouts, content, workflows, and implementation stack (Next.js, Tailwind CSS, shadcn/ui, Radix, Lucide). Do not purchase or copy the theme or add another UI framework. |
| ADR-015 | Locked | P02.3 defines `kz_activity.status` as `succeeded`, `failed`, or `unknown`: these mean definite success, definite failure, or an uncertain external outcome requiring reconciliation. `operation` remains separate (for example, `plan_approved` with `succeeded`). Activity is an outcome log and has no running state; action plan and step states represent ongoing execution. |
| ADR-016 | Locked | P02.4 keeps KriyZen migration history in `kriyzen_migrations.__drizzle_migrations`, separate from KriyZen application objects and any Corsair-owned migration history. KriyZen Drizzle config loads only the KriyZen schema; `kz_*` filters are a secondary guard and generated SQL must still be reviewed. Corsair SDK setup and migration ownership remain version-specific and must be verified before P03. |

## New ADR template
Date / ID / status / context / options / decision / rationale / consequences / validation / owner approval. Update affected docs once approved. No changes to locked decisions without user agreement.






