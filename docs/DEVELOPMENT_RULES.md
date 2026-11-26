# Development conventions

- Small vertical slices, typed service boundaries, thin tRPC routers and explicit validators. Avoid unnecessary abstractions or boilerplate layers. Use server components by default where appropriate, client components for interactions only.
- Keep user-facing DTOs separate from provider payloads; use stable external IDs and tenant scope. Centralize safe error mapping and request IDs. No `any` to silence incompatibility; narrow unknown values.
- Use Drizzle versioned migrations; never edit already applied migrations casually. Update schema, migration and docs in the same reviewed change. No vendor schema changes without review.
- Prefer existing UI components and tokens. No fake success, placeholder integrations marked functional, or direct API calls from UI. Keep state predictable, queries invalidated after confirmed writes.
- Git: small focused changes, conventional descriptive commit suggestions, baseline before feature change. No secrets or personal email dumps; `.env.example` contains placeholders. Inspect diff before committing.
- AI: task-specific context, inspect official installed API, no giant rewrite, no surprise dependencies, no unrelated refactors. Follow AGENTS and phase gate. Record blockers instead of inventing endpoints or test results.
- For dependencies: state reason, compatibility, alternatives, licensing/security and cost; get approval if stack/architecture changes. Preserve lockfile.
