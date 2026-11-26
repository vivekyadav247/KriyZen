# Test plan and release gates

The database integration suite uses Node.js's built-in `node:test` runner with `tsx` only to load the existing TypeScript modules. Run it with `pnpm test:db`; it loads `.env.local` through `@next/env` and requires the local KriyZen PostgreSQL database. Tests use synthetic fixtures, transaction rollback, and savepoints for expected constraint failures. No production credentials or real provider accounts belong in tests.

### P02.5 database integrity suite

`tests/db/integrity.test.ts` verifies lazy Drizzle `SELECT 1` connectivity; valid inserts across all eight KriyZen tables; UUID, timestamp, timezone and state defaults; NOT NULL, foreign key, unique, enum, workspace composite-key, ordinal, idempotency, check, and restrictive delete constraints. It verifies safe handling of missing, malformed, and unreachable `DATABASE_URL` using child processes, and refuses to run unless the configured target is `localhost:5433/kriyzen`. Probe output never includes database error text or credentials. Expected PostgreSQL SQLSTATEs are asserted explicitly: `23502` not-null, `23503` foreign key/restrict, `23505` unique, `22P02` enum input, and `23514` check.

Each SQL fixture runs in an independent transaction that is rolled back; a final marker query checks that synthetic user rows did not remain. This suite tests database integrity only. It does not prove session authentication, tenant derivation from a verified identity, Corsair account ownership, approval revision/hash checks, step transition rules, or exactly-once provider writes; those remain server-side responsibilities and later phase tests.

| Test ID | Scenario | Expected |
|---|---|---|
| T01 | Unauthenticated workspace, tRPC and chat | denied, no cache/model access |
| T02 | User A requests B's thread/event/conversation/plan | denied or not found, no leak |
| T03 | Connect, declined OAuth, expired grant, disconnect | accurate states; access disabled after disconnect |
| T04 | Inbox list, empty page, cursor, live refresh, search | correct real items, cache freshness and pagination |
| T05 | MIME subject/body Unicode, draft send, reply | correct content and recipient; thread verified |
| T06 | Mail HTML with script, external image, malicious link | sanitized/blocked, no automatic fetch or execution |
| T07 | Week boundary, UTC offset, DST, all-day event | correct event times and date semantics |
| T08 | Invite, update, cancel with notify choice | provider-confirmed event and expected test notification |
| T09 | Groq quota/timeout, tool loop cap, malformed tool input | safe error, no writes, bounded cost |
| T10 | Email instructs assistant to leak tokens/send message | no credential/script/write exposure |
| T11 | Approve, cancel, edit, expired/replayed hash | only exact current approved plan executes |
| T12 | Two concurrent approval requests | one claims plan; no duplicate remote mutation |
| T13 | Conflict introduced after preview | recheck blocks or requests fresh approval |
| T14 | Calendar succeeds and mail fails | partial result; no repeat of calendar step |
| T15 | Remote write timeout/crash before local persistence | unknown, reconcile before retry |
| T16 | Unverified webhook, duplicate and wrong account | reject unverified, process valid duplicate safely, no cross-tenant effects |
| T17 | Fresh migration + build + start | reproducible schema, build, auth and health |
| T18 | Mobile/keyboard navigation, screen-reader labels | essential workflow accessible |

At each phase run typecheck and relevant tests, verify against real test account for integration claims. Before release: inspect package scripts; run lint, typecheck, tests, production build; review dependency advisories; check git history for secrets; prove authorization, approval and no unrestricted scripts; verify deployment data policy and free-plan constraints. Record actual command output/status in PROGRESS. If release gate fails, restrict to local demo; do not claim production-ready.
