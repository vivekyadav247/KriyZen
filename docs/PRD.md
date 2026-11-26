# Product requirements — Kriyzen v1

## Problem and goal
Email and calendar actions are fragmented: users copy meeting details between tools, repeat searches and send follow-ups manually. Kriyzen brings these actions together in a personal workspace. The project must demonstrate actual Google operations via Corsair, not just mock screens.

## Users and assumptions
Primary user: individual managing a Google inbox and calendar (student, professional or founder). One personal workspace per user; one connected account per integration in v1. Multiple users must be isolated if enabled. Initial demo uses a dedicated test Google account. A public multi-user release is not required until authentication, consent and data policy gates pass.

## Requirements and acceptance criteria
| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| R01 | P0 | Sign-in and session | Protected routes reject unauthenticated access; server resolves owner workspace. |
| R02 | P0 | Connect Gmail and Calendar | Distinct connection statuses; real OAuth grants; reconnect/error displayed; no token in browser. |
| R03 | P0 | Inbox and message/thread view | Real emails, pagination, sender/subject/time/body, loading/empty/error states. |
| R04 | P0 | Search | Keyword + supported Gmail filters; correct results, query scope and stale-data indication. |
| R05 | P0 | Compose, drafts, send, reply | Test email is received; draft can be retrieved; reply preserves thread when supported. |
| R06 | P1 | Labels/star/archive/read state | Changes persist remotely and reflected locally; verify API scopes. |
| R07 | P0 | Calendar week and event detail | Real events in chosen timezone, all-day handling, bounded date query. |
| R08 | P0 | Create/edit/delete event and invitations | Test event changes appear in Google; attendees and notification choice verified. |
| R09 | P0 | External AI chat | Groq-backed chat with streaming, scoped read tools, bounded steps, failure handling. |
| R10 | P0 | Cross-app action plan | From email extract proposed time, check availability, create reviewable event and reply. |
| R11 | P0 | Approve and execute | No AI write before approval; exact payload reviewed; per-action result and retry safety. |
| R12 | P1 | Home, command palette and shortcuts | Upcoming events, unread messages, navigation and quick actions; no mock statistics. |
| R13 | P1 | Webhook synchronization | Verified delivery updates correct account; duplicate-safe; manual refresh fallback. |
| R14 | P1 | Activity and integration settings | See action status, connection status, last successful sync; reconnect/disconnect controls. |
| R15 | P2 | AI priority classifier, local full-text or vector search | Only after core demo and data-policy approval; benchmark before claiming speed. |

P0 = intended demo essentials (auth may be private local demo only if connection flow not ready); P1 = stretch; P2 = later. Do not promise all P1 in seven days.

## Non-goals
Drive, Docs, Sheets, Excel, Outlook, team workspaces, scheduled autonomous agents, attachments editing, custom OAuth server, payment, native mobile apps, vector search, dedicated queue infrastructure. Future integrations visible only as nonfunctional Coming Soon.

## Quality and success
- User can search, draft and send real test emails; view and manage real test events.
- One approved email→calendar→reply workflow completes with separate status per step.
- No tenant leakage, no duplicate actions under repeated approval, no raw credentials in UI/logs.
- Show sync freshness and model errors. Target responsive desktop workflow; mobile basic usability. Performance targets are hypotheses until measured; no sub-second promise.
- Demo includes success, conflict, rejection and partial failure. Release gates in TESTING/DEPLOYMENT.
