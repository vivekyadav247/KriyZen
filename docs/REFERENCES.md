# References and verification notes

Project assignment sources:
- Setup videos (watch in given order): https://drive.google.com/drive/folders/1grUZ_nYtY-AwXk5iQlOoXAfYMtKDpW39?usp=sharing — not inspected in preparation of this pack.
- Starter: https://github.com/corsairdev/google-demo
- Setup README: https://github.com/corsairdev/google-demo/blob/main/README.md
- Architecture guide: https://github.com/corsairdev/google-demo/blob/main/AGENT_PROMPT.md
- Starter schema: https://github.com/corsairdev/google-demo/blob/main/src/server/db/schema.ts
- Starter package: https://github.com/corsairdev/google-demo/blob/main/package.json
- Thread reference repository: https://github.com/ishaansatapathy/Thread — reference only for product ideas and documented integration concepts. Its README describes a multi-app Next.js + Express architecture, OpenAI usage, and a broad MCP tool surface; those choices do not change KriyZen's locked single-app stack, Groq provider, or MCP safety requirements. No Thread source code has been copied.

Technical sources inspected during planning: starter README/guide/schema/package via GitHub in this conversation; Corsair adapter and security docs via web. Their documented behavior supports CLI discovery, cache and live-write separation, starter table ownership, HTTP MCP and unsafe script warning. The proposed application schema and phase roadmap are original design decisions, not upstream requirements.
- https://docs.corsair.dev/mcp-adapters/vercel-ai
- https://corsair.dev/security
- https://github.com/corsairdev/corsair/tree/main/packages/mcp

Implementation references to consult and verify at each phase:
- https://nextjs.org/docs/app
- https://trpc.io/docs
- https://orm.drizzle.team/docs/overview
- https://orm.drizzle.team/docs/get-started-postgresql
- https://orm.drizzle.team/docs/drizzle-config-file
- https://orm.drizzle.team/docs/drizzle-kit-check
- https://nextjs.org/docs/app/guides/environment-variables
- Corsair Google Demo package metadata (Drizzle and `postgres` driver versions): https://raw.githubusercontent.com/corsairdev/google-demo/main/package.json
- https://ui.shadcn.com/docs
- https://ai-sdk.dev/docs
- https://console.groq.com/docs/rate-limits
- https://console.groq.com/keys
- https://developers.google.com/workspace/gmail/api/guides/push
- https://developers.google.com/workspace/calendar/api/guides/push
- https://developers.google.com/terms/api-services-user-data-policy
- https://developers.google.com/workspace/gmail/api/auth/scopes
- https://stitch.withgoogle.com/

Reverify current versions, quota, scopes, free-plan terms, and exact endpoints during setup; this is a design baseline, not a tested implementation.
