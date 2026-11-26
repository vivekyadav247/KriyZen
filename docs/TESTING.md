# Test plan and release gates

Test runner/library not locked; use starter scripts first, select minimal test tooling with approval. Keep test fixtures synthetic. Run unit, integration and browser/manual tests in separate disposable DB/test Google tenant. No live writes outside intended test recipients. Do not use production credentials in CI.

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
