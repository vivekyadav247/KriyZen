# AI assistant and Corsair MCP design

## Runtime architecture
Browser chat → authenticated Next.js `/api/chat` → Vercel AI SDK → Groq tool-capable model. Read tools and plan proposals use a server-controlled capability registry; write execution goes through actions service after approval. Store conversation and plan state in Postgres. Model ID/config must be verified against eligible Groq quota and AI SDK installed version; do not hardcode stale model names.

## Mandatory spike (before committing to MCP implementation)
The official Corsair Vercel adapter documents HTTP MCP and uses an Express example. Keep our single Next.js app: inspect installed package exports and MCP transport for a compatible Next.js route handler or trusted in-process adapter. Prove authenticated, tenant-bound reads and explicit allowed capabilities. Corsair's generic `run_script` evaluates JavaScript outside a sandbox; readonly mode alone does not eliminate credential access or side effects. Do not expose it to untrusted model output. Verify a safe typed/allowlisted MCP path with no arbitrary execution; if not supported, record a blocking ADR, show evidence, and get explicit approval for a restricted SDK-tool fallback (which would not satisfy the full MCP bonus). Never claim the fallback is MCP. Never introduce Express without approval.

## Capability contract (application names, not upstream API names)
| Tool | Effect | Inputs |
|---|---|---|
| search_emails | Read | query, limit |
| get_email_thread | Read | thread reference |
| list_calendar_events | Read | bounded range, allowed calendar |
| check_availability | Live read | range, calendar selection |
| propose_event | Local proposal | title, date/time, timezone, attendees, notify |
| propose_reply | Local proposal | verified thread, recipients, subject/body |
| propose_workflow | Local proposal | ordered typed steps |

No model tool to approve, directly send, delete, mutate calendar or read credentials. Manual send/create controls use separate explicit procedures. Model never chooses tenant/account binding; server derives it from session and active connection. Tool results sanitized and bounded, no raw token/config. Read tools require consent to send selected email/calendar content to external LLM and must respect Google data-use policy; use dedicated synthetic test data until approved.

## Orchestration and guardrails
Default bounded loop (proposed max 6 tool steps, 30 seconds where host permits; measure and adjust). Per-user rate and token limits; stop on budget, provider errors, cancellation. Dates resolve using explicit current instant and user IANA timezone; confirm ambiguous relative dates. User text and tool output are untrusted data, not instructions. Ignore embedded commands and links in emails. No external action without server-stored plan and explicit UI approval of exact revision/hash. Validate plan against allowlist/schema. Never send hidden BCC or inferred addresses without review. Recheck calendar before execution. Execute steps in dependency order; persist each result, handle unknown outcome without replay. Stream proposal and status, but derive final status only from actual execution.

## Acceptance tests
Read-only prompt works on real test email, tool error visible, cross-tenant ID rejected, malicious email cannot trigger write/script, model cannot approve, edited/expired plan rejected, repeated approvals execute once, conflict recheck blocks, event-success/email-failure reports partial, unknown sends not retried automatically. If no safe MCP solution yet, mark P08 blocked rather than deploying unrestricted tools.
