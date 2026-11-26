# Kriyzen coding agent instructions

Read this file before edits. Read docs/PRD.md, docs/TECH_STACK.md, docs/ARCHITECTURE.md, docs/DATABASE.md, docs/SECURITY.md, docs/DECISIONS.md, docs/ROADMAP.md and docs/PROGRESS.md. For the current phase, read the corresponding feature documents.

## Non-negotiable rules
- Single Next.js App Router application, TypeScript, Tailwind, shadcn/ui, tRPC, PostgreSQL, Drizzle, Corsair, Groq, Vercel AI SDK and Corsair MCP. Ngrok is only a local webhook tunnel. Do not introduce Express, a separate React app, Prisma, Redis, another LLM provider or paid infrastructure without an approved decision.
- Implement only the requested phase. Do not change architecture, routes, schema or dependencies casually. Propose changes in DECISIONS before implementing them.
- All Google Gmail/Calendar data access goes through Corsair. Discover real endpoints and inputs using installed Corsair CLI and source; no invented methods. Prefer cache for display, live reads when correctness/freshness requires it, live writes for mutations.
- All protected data access derives tenant identity from a verified server session. Never trust browser or model supplied tenant IDs. Never expose the demo's fixed dev tenant or public procedures in a public deployment.
- Never expose unrestricted MCP script execution to model-generated code. No arbitrary eval, secrets, shell access or credential tools. Safe MCP compatibility spike is mandatory; do not silently substitute a different architecture. Never let the model send mail or write calendar data directly. Server validates and executes the exact approved proposal.
- Do not log secrets or email bodies. Sanitize email HTML, treat email content as untrusted, minimize information sent to Groq. Use test accounts.
- Keep server-only dependencies out of client bundles. Validate inputs and errors. Use explicit types, small modules, existing patterns and accessible components.

## Workflow for each task
1. Read phase gate and inspect current code, git diff and installed dependency versions.
2. State intended changes, files and uncertainties. Ask for approval for architecture changes or destructive actions; do not stall ordinary implementation.
3. Implement the smallest vertical slice with actual tests. Never report mock data as a working integration.
4. Run relevant checks (inspect package.json for exact scripts), including typecheck, lint, tests and build at release gates. State commands/results honestly; never claim unrun checks passed.
5. Summarize changed files, manual verification, known issues and next step. Update PROGRESS and decision log only with verified facts. Suggest a focused commit; do not commit/push unless authorized.

If docs conflict: stop the conflicting change, explain, and request a decision. User-approved changes in DECISIONS supersede older prose; update related docs together.
