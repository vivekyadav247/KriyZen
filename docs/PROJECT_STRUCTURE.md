# Proposed project structure

Adapt this to the starter layout; do not reorganize working upstream code for cosmetic reasons. Next.js App Router route groups do not alter URLs.

```text
kriyzen/
  AGENTS.md
  README.md
  .env.example
  docs/
  drizzle/                     # reviewed migration history
  src/
    app/
      (public)/page.tsx
      (public)/sign-in/page.tsx
      (workspace)/layout.tsx
      (workspace)/home/page.tsx
      (workspace)/mail/page.tsx
      (workspace)/calendar/page.tsx
      (workspace)/assistant/page.tsx
      (workspace)/integrations/page.tsx
      (workspace)/settings/page.tsx
      api/trpc/[trpc]/route.ts
      api/chat/route.ts
      api/webhooks/route.ts
    components/ui/             # shadcn primitives
    components/layout/         # sidebar, header, assistant drawer
    features/
      gmail/                   # views, hooks, presentation types
      calendar/
      assistant/
      integrations/
    server/
      api/root.ts
      api/trpc.ts
      api/routers/             # thin protected tRPC routers
      db/index.ts
      db/schema/               # app schema and unchanged vendor schema
      auth/                    # selected solution; server session
      corsair.ts               # singleton configuration, server-only
      integrations/            # verified tenant adapters
      modules/
        workspace/
        gmail/
        calendar/
        assistant/
        actions/
        sync/
        activity/
      lib/                     # errors, validation helpers, safe logging
    lib/                       # browser-safe helpers only
    env.schema.ts              # Zod allowlists and server value validation
    env.ts                     # parsed server-only environment
    env.client.ts              # explicitly public NEXT_PUBLIC_* allowlist
  tests/                       # unit, integration and end-to-end scenarios
```
Each server feature may have service.ts, schema.ts, repository.ts only when needed. Gmail/Calendar services use Corsair rather than app repositories for provider data. Keep Next.js client components small; add `use client` only where interactivity needs it. Shared types must not import server secrets. Do not implement every folder before its phase.
