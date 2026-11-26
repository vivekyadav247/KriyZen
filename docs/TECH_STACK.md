# Locked technology stack

| Layer | Technology | Boundary |
|---|---|---|
| Full-stack framework | Next.js App Router + TypeScript | One app; Next.js uses React internally, no separate frontend |
| UI | Tailwind CSS + shadcn/ui | Reusable accessible primitives |
| Application API | tRPC | Typed procedures, shared context |
| Database | PostgreSQL | One database; app and Corsair ownership separated |
| ORM | Drizzle | Schema and versioned migrations |
| Integration | Corsair SDK | Google operations, connection lifecycle, cache |
| AI provider | Groq | Server-side external LLM; eligible free quota |
| AI framework | Vercel AI SDK | Streaming, bounded tool loop |
| Agent tools | Corsair MCP | Restricted, verified transport and operations |
| Webhooks | Ngrok (local only) | Tunnel to verified webhook endpoint |

Budget target: INR 0. No paid features without consent. Authentication library, package versions, deployment hosting and exact model ID are pending. pnpm is proposed to match the supplied starter; preserve its lockfile and verify compatibility/security before upgrading. Use the Node runtime for server integrations unless compatibility evidence supports another choice. Free quotas can change; verify account-specific availability before depending on them.
