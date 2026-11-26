# Implementation roadmap — setup to deployment

Planning baseline: seven focused days is a target, not a guarantee. Complete gates in dependency order, not by calendar pressure. P0 design and core integration first; defer P1/P2. Times are rough effort estimates, assuming AI assistance and existing TypeScript/SQL knowledge. Auth and MCP spikes may extend them.

| Phase | Work | Exit gate | Effort |
|---|---|---|---|
| P00 | Review PRD, architecture, database, decisions; watch corsair-setup, corsair-webhooks, corsair-calendar-webhooks in order | owner accepts design and scope; record pending decisions | 2h |
| P01 | Learn Next.js routing/layouts, server/client boundaries, handlers, env; use supplied starter or approved scaffold; pin deps and Git baseline | install/dev/typecheck/build; no secrets; inspect starter | 3–5h |
| P02 | Postgres local, Drizzle migration baseline, app schemas and env validation | fresh database boots; migrations reproducible; schema matches DATABASE | 3–4h |
| P03 | Google credentials and private Corsair connectivity spike | real email read and real event read from test tenant; verify methods, cache, scopes | 3–6h |
| P04 | Choose auth implementation, sign-in, workspace/tenant isolation and supported connection lifecycle | two isolated identities or test fixtures; auth tests; no dev tenant on public routes | 4–7h |
| P05 | Stitch shell, shared components, integration screen | responsive navigation and real connection state; approved mock design separated from live features | 3–5h |
| P06 | Gmail read/search/detail, then draft/send/reply | real email round-trip and error states; scoped data | 6–8h |
| P07 | Calendar week view, events CRUD, attendees, availability | real event round-trip, conflict and timezone tests | 5–7h |
| P08 | Groq AI SDK and safe Corsair MCP compatibility spike; streaming read chat | test model/tool call, authenticated tenant read, no generic script execution; ADR if blocked | 4–7h |
| P09 | Plan persistence, approval cards, executor, combined workflow | actual event then reply; cancel/conflict/partial/unknown tests | 5–8h |
| P10 | Webhooks + refresh (P1) | verified deliveries, repeat safe, account mapping, recovery | 3–6h |
| P11 | Bonus UI and search (P1/P2) | keyboard actions, dashboard or filters verified; no unimplemented claims | 2–5h |
| P12 | Security review, regression, build, clean demo | all P0 gates and TESTING release checks pass | 4–6h |
| P13 | Free deployment evaluation, env, migration, OAuth, smoke tests | gated hosted demo or explicitly local recorded demo | 3–5h |
| P14 | README, demo video, architecture, known limits, final tag | another developer can reproduce demo | 1–2h |

## Suggested seven-day timebox
| Day | Phases and deliverable |
|---|---|
| 1 | P00–P02; review videos and schema; local starter and database |
| 2 | P03–P04; Google and Corsair connectivity; auth decision/isolation |
| 3 | P05–P06; shell plus core Gmail |
| 4 | P07; Calendar + start P08 spike |
| 5 | P08–P09; AI chat and approval workflow |
| 6 | P09, P12; flagship flow and reliability; P10 only if core passes |
| 7 | P12–P14; release/demo; P11 only if spare time |

Full effort range for all phases exceeds a strict 56-hour week at the upper end. For seven days, omit P10/P11 if necessary; do not skip authorization, approval or data safety. If MCP compatibility is blocked, preserve manual MVP and record the blocker; get approval before alternate tools. If OAuth public access is blocked, keep a private local demo with synthetic test data. Do not label a mock as deployed integration.

## Phase completion template
- Phase and scope; docs/decisions read.
- Files changed; commands and test results (actual).
- Manual verification evidence without secrets.
- Remaining risks; gate PASS/BLOCKED; next phase.
