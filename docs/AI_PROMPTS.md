# AI coding prompts — use one phase at a time

Copy AGENTS.md and docs into repository. Use the following base prompt for each task, then append a phase-specific instruction. Do not paste credentials into chat.

## Base prompt
Read AGENTS.md and docs/PRD.md, TECH_STACK.md, ARCHITECTURE.md, DATABASE.md, API_CONTRACTS.md, SECURITY.md, ROADMAP.md, DECISIONS.md and PROGRESS.md. Inspect repository and dependency versions. Implement only phase [PHASE] and its current acceptance gate. Preserve locked stack and existing patterns. Before edits identify relevant files, risks and unresolved decisions. Verify Corsair methods through installed CLI/schema or package source. Do not invent APIs, expose secrets, use unrestricted MCP script execution, or silently add dependencies. Implement the smallest working vertical slice. Run relevant checks, report actual results and update PROGRESS with blockers. Stop at phase boundary; do not implement the next phase.

## Phase-specific prompts
| Phase | Append to base prompt |
|---|---|
| P00 | Review design only; identify mismatches between PRD, schema, API and assignment; do not write code. |
| P01 | Establish starter baseline and inspect package scripts; teach me App Router and server/client boundary as you implement. |
| P02 | Preserve Corsair schema/migration ownership; propose Drizzle app schema matching DATABASE; review migration before applying locally. |
| P03 | Prove real tenant-scoped email and bounded Calendar reads via Corsair; list verified CLI endpoints; no UI mock claims. |
| P04 | Propose minimal auth implementation for approval; implement owner-scoped context and connect/disconnect only after selection. |
| P05 | Implement shared shell using supplied Stitch screens and existing UI tokens; no unrelated backend changes. |
| P06 | First inbox/read/search, then compose/draft/reply/send; test real test-account round trip. |
| P07 | Implement week view then event mutations, timezone and availability; verify attendee notifications. |
| P08 | Verify Groq and safe Corsair MCP in Next.js; produce compatibility evidence before exposing tools; block unsafe run_script. |
| P09 | Build typed plan proposal and exact approval executor; test race, conflict, partial and ambiguous outcome. |
| P10 | Verify provider webhook setup and tenant routing, duplicates, renewals and refresh fallback; check cost. |
| P11 | Add only approved P1 features with existing schema/architecture. |
| P12 | Audit tenant isolation, XSS, prompt injection, secrets and all release tests; fix reproducible defects only. |
| P13 | Compare free deployment candidates against constraints; request selection, then configure and smoke test. |
| P14 | Write reproducible README, record actual demo instructions and known limits; do not claim untested features. |

## Debugging prompt
Reproduce this error: [paste sanitized stack trace]. Identify root cause using current code, installed versions and official docs. Propose minimal fix; no dependency upgrade or architecture rewrite unless justified. Show verification command and actual result.

## Review prompt
Review only the current git diff against AGENTS, PRD, DATABASE and SECURITY. Prioritize correctness, tenant isolation, schema mismatches, approval bypass, duplicate mutations, unsafe external data and missing tests. Report file/line references and actionable fixes. Do not edit until asked.
