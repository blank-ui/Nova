# Testing

## Commands

- `npm run typecheck` checks TypeScript without emitting files.
- `npm run lint` runs the flat ESLint configuration for TypeScript, React, hooks, and accessibility.
- `npm test` runs deterministic unit tests and authentication flow tests using Better Auth's in-memory adapter.
- `npm run build` creates the production Next.js build.
- `npm run test:e2e` is configured for Playwright, but no browser end-to-end suite has been added yet.

The current automated suite covers role/MFA authorization policy, client project ownership filtering, safe return destinations, inquiry validation/honeypot handling, registration role assignment, password requirements/reset, session revocation, OAuth state rejection, and persistent registration rate limiting.

Email delivery, Google OAuth with Google's servers, live MySQL migrations, database-backed rate limiting under load, and deployment proxy behavior require configured staging services. They are not simulated by the in-memory auth tests.
