# Security and privacy baseline

| Risk | Required mitigation |
|---|---|
| Unauthorized data access | server-side session, owner-scoped repositories, tenant binding, verified external IDs; reject browser/model tenant override |
| OAuth attacks | supported state/PKCE where applicable, exact redirect URI, minimal scopes, test users, server-only credentials, reconnect handling |
| OAuth secrets/KEK leak | validated server-only env, no NEXT_PUBLIC_ secrets, gitignore .env, never log tokens, rotate exposed keys; preserve KEK securely across deploys |
| Email prompt injection | treat bodies/attachments/tool results as untrusted, no arbitrary script tool, allowlisted reads, validated proposals, human approval |
| Email XSS/tracking | sanitize HTML with approved library/design, block scripts/forms/remote images by default; render text if no safe sanitizer; safe links |
| Model data disclosure | disclose Groq processing, minimize context, avoid sensitive real mail, confirm applicable Google Workspace API user-data policy and Groq retention/training terms before real accounts/public release |
| Duplicate/incorrect writes | idempotent local claims, exact approved hash, recheck calendar, reconciliation on unknown remote outcome; no exactly-once promise |
| Webhook spoof/replay | use provider-specific signature/token/channel verification, trusted subscription mapping, idempotent receipt, reject unknown tenant and unverified delivery |
| Abuse and quotas | auth, request size limits, bounded pagination/time ranges, per-user throttling, bounded model steps, error/backoff |
| Deployment exposure | no publicProcedure exposing real data, no static dev tenant on public host, no public unrestricted MCP server, TLS, session cookie protections, mutation CSRF/origin checks |

## P02.6 dependency audit

The 2026-11-26 `pnpm audit` reported six advisories in the locked dependency graph (2 high, 4 moderate): PostCSS `8.4.31` under Next.js has four advisories (two high, two moderate; patched in `8.5.23` or later); esbuild `0.18.20` under Drizzle Kit's legacy ESM loader is moderate (patched `0.25.0` or later); and minimatch `10.2.6` under the dev-only shadcn CLI is moderate (patched `11.0.1` or later). The installed Next.js 15 release currently resolves the vulnerable PostCSS. Prefer a compatible Next.js 15 patch that includes a fixed PostCSS when available. The current upstream Next.js canary manifest uses PostCSS `8.5.23`, but P02.6 did not verify a stable Next.js 15 release with that update. A targeted PostCSS override is another option only after review and full verification. Update Drizzle Kit/its loader to a compatible patched dependency rather than forcing an esbuild version under the legacy loader. For minimatch, update shadcn/ts-morph when compatible upstream ranges allow 11.x, or remove the CLI if it is no longer needed; do not force a major override. No audit fix or dependency upgrade was applied in P02.6. Re-run the audit before public deployment.

## P03.2 actual KriyZen dependency audit (2026-11-26)

The full pnpm audit reports six advisories (2 high, 4 moderate), the same vulnerability categories recorded in P02.6. The production-only audit reports four PostCSS advisories (2 high, 2 moderate) through `next@15.5.29` resolving `postcss@8.4.31`; current patched guidance is PostCSS `>=8.5.23`. Dev-only findings are esbuild `0.18.20` through Drizzle Kit’s legacy `@esbuild-kit/esm-loader` (patched `>=0.25.0`) and minimatch `10.2.6` through shadcn → ts-morph (patched `>=11.0.1`). No advisory dependency path includes Corsair, Gmail, Calendar, or the Corsair CLI. No forced fix or override was applied for these vulnerabilities. Track a compatible Next.js 15/PostCSS remediation and re-audit before public deployment.

Disconnect: disable account access immediately, use supported token revocation/disconnect, remove relevant cache according to verified Corsair lifecycle; avoid cross-account deletion. Account deletion: revoke integrations, invalidate sessions, remove owned app data and approved vendor data. Establish explicit retention and redaction rules before production. Activity records use safe summaries, never raw email bodies. Backups are sensitive; restrict access. Use synthetic demo data and never commit private screenshots.
