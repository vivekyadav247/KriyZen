# Deployment runbook

No hosting provider finalized. Goal is a free, private demo, not an unverified public production service. Candidate deployment must support Next.js Node runtime, Postgres TLS connections, streaming AI requests, webhook ingress, and the verified Corsair MCP transport. Check free-plan terms, request duration, outbound connections, DB storage/pooling, persistent secret configuration and webhook renewals. Verify current model quota and Google API restrictions. Do not enable billing without explicit approval.

## Pre-deploy
- P0 gates and SECURITY/TESTING pass. Decide hosting, auth, MCP, data-use and connection lifecycle in DECISIONS.
- Public Google app accessing restricted Gmail scopes may require OAuth verification and additional obligations; review Google Workspace API User Data and Developer Policy plus Groq terms. Testing-mode access can be limited to registered test users and refresh credentials may expire. If policy/verification is unresolved, keep private test-account demo; do not send real sensitive mail to the model.
- Create dedicated deployment database and credentials; do not point demo at personal dev database. Keep KEK secure and stable; backup DB, rehearse restore. Apply reviewed migrations before app starts.
- Configure server-only env. Set exact OAuth redirect URLs and allowed origins for selected host. Register webhook endpoints/subscriptions only when handler verification is tested. Never expose a fixed dev tenant or raw MCP endpoint.

## Deployment steps
1. Pin verified build and dependency versions; run production build locally.
2. Create eligible free hosting project and Postgres; configure connection/pooling for chosen runtime; deploy one app.
3. Apply migrations once with appropriate direct connection; do not auto-migrate on every request.
4. Set secrets and integration config through supported mechanisms; configure test user OAuth. Verify health, session, tenant isolation, Gmail and Calendar.
5. Test actual AI read and approved write with dedicated test account. Verify streaming within host time limits and partial/unknown failure states.
6. Configure verified webhook ingress if implemented. Ngrok is for local dev, not a permanent production URL. Monitor subscription expiration and provider quota. Manual refresh remains fallback.
7. Run smoke tests and document deployed URL only if real; capture sanitized demo screenshots and video.

## Rollback and fallback
Use prior working application revision only if schema compatible. Restore tested backup if required; avoid destructive migration rollback. Disable actions/connection if exposed secrets or tenant leak; rotate credentials and assess incident. If hosting or quotas block free deployment, record exact blocker and demonstrate local working app via video. No claim of public deployment unless tested.
