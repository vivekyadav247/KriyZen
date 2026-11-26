# API contracts — planned application interface

These are Kriyzen procedure names, not Corsair methods. Confirm upstream operations with CLI schema/source. tRPC protected context resolves workspace/tenant; no input accepts tenant ID. Zod validation at boundaries; return normalized DTOs instead of raw provider records. Paginated results `{items,nextCursor,source,lastSyncedAt}`; cursor opaque, scoped and validated. Limits default 25, max 50. Dates ISO 8601 with offset; IANA timezone where needed. Error shape: code, user-safe message, requestId, retryable; no provider secret or payload.

| Procedure | Kind | Input → result |
|---|---|---|
| workspace.me | query | none → profile, workspace, timezone |
| workspace.updatePreferences | mutation | timezone → updated preference |
| integrations.list | query | none → provider/status/label/lastSync |
| integrations.connect | mutation | provider → approved OAuth initiation URL or supported flow; verify state |
| integrations.disconnect | mutation | provider → status/revoke result |
| gmail.list | query | folder, cursor, limit → page of message summaries |
| gmail.search | query | query, optional supported filters, cursor → page |
| gmail.getThread | query | threadId → ordered messages (normalized/sanitized) |
| gmail.refresh | mutation | none → sync state |
| gmail.saveDraft | mutation | optional draftId, to/cc/bcc, subject, body → draft reference |
| gmail.send | mutation | draftId OR compose payload, clientRequestId → send result |
| gmail.reply | mutation | threadId, messageId, body, clientRequestId → send result |
| gmail.updateLabels | mutation P1 | messageId, add/remove allowed labels → result |
| calendar.list | query | calendarId, start, end, cursor → events |
| calendar.get | query | calendarId,eventId → event |
| calendar.availability | query | start,end,calendarIds → busy intervals + freshness |
| calendar.create | mutation | title, time fields, attendees, calendarId, notify, clientRequestId → event reference |
| calendar.update | mutation | eventId,calendarId,validated patch,notify → event |
| calendar.delete | mutation | eventId,calendarId,notify → deletion result |
| calendar.refresh | mutation | start,end → sync state |
| assistant.listConversations | query | cursor → page |
| assistant.getConversation | query | conversationId → messages and plans |
| assistant.newConversation | mutation | optional title → id |
| actions.get | query | planId → plan, steps |
| actions.edit | mutation | planId, revision, edited allowed fields → new revision and hash |
| actions.approve | mutation | planId, revision, payloadHash → claimed execution/per-step result |
| actions.cancel | mutation | planId, revision → status |
| actions.retry | mutation | planId, stepId, explicit confirmation → safe retry result or reconciliation required |
| activity.list | query P1 | cursor → sanitized events |

## Route handlers
- `/api/trpc/[trpc]`: tRPC adapter, context and errors.
- `POST /api/chat`: authenticated streaming AI SDK endpoint; input conversation ID, user message, optional selected email/event reference; verify ownership, load only needed context, enforce limits. Persist normalized messages and server-validated proposals; do not trust client-supplied role or tool output.
- OAuth callback paths: determined by chosen authentication and Corsair integration flow. Separate app identity from integration grants. Use state and supported redirect validation.
- `POST /api/webhooks`: raw request handling and provider-specific verification; resolve account/tenant from trusted subscription metadata, not request query parameters. Use installed Corsair handler contract; valid duplicates acknowledged safely.
- `/api/health`: optional minimal liveness, no secret/configuration details.

## DTOs and validation
MessageSummary: id, threadId, sender{name,email}, subject, snippet, receivedAt, unread, starred, hasAttachments. Full message adds recipients, sanitized body/text, attachment metadata (download P2). Event: id, calendarId, title, start/end (dateTime+zone OR date-only), attendee emails/status, location, description. Proposal: planId, revision, payloadHash, expiresAt, ordered typed steps, warnings. All external references verified in tenant context; reject end ≤ start, invalid emails, oversized content, unauthorized calendars and ambiguous dates. Invite notification option explicit. Reply preserves Gmail thread headers when supported; verify MIME encoding. Errors: UNAUTHORIZED, FORBIDDEN, NOT_FOUND, BAD_REQUEST, CONFLICT, TOO_MANY_REQUESTS, INTEGRATION_REAUTH_REQUIRED, PROVIDER_UNAVAILABLE, ACTION_UNKNOWN; map app-specific errors through supported tRPC codes/metadata.
