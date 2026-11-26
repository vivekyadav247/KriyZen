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

Disconnect: disable account access immediately, use supported token revocation/disconnect, remove relevant cache according to verified Corsair lifecycle; avoid cross-account deletion. Account deletion: revoke integrations, invalidate sessions, remove owned app data and approved vendor data. Establish explicit retention and redaction rules before production. Activity records use safe summaries, never raw email bodies. Backups are sensitive; restrict access. Use synthetic demo data and never commit private screenshots.
