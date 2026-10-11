# Security

## Implemented controls

- Better Auth owns password hashing, email verification, password-reset tokens, OAuth state/PKCE, database-backed sessions, cookie settings, and callback origin checks.
- Email/password auth requires verified email and passwords of 12–128 characters. User-facing login and recovery errors are generic.
- Google profile email must have `email_verified: true`. Credentials stay server-side. Implicit matching-email account linking is disabled; explicit linking requires an authenticated session and same-email ownership.
- Public sign-up cannot set a role. The admin plugin rejects client-supplied role assignment; administrator promotion is a one-time server/operator transaction.
- Admin route and data guards check `ADMIN`; full admin access additionally requires enabled TOTP. MFA setup is the only admin route available before MFA is active.
- Client project reads are owner-scoped in the service layer, not merely hidden in the UI.
- Auth rate limits are stored in MySQL. TOTP attempts are locked after five consecutive failures for 15 minutes.
- Inquiry input remains server-validated and database failure returns a non-success status instead of a false receipt.
- `.gitignore` excludes `.env*` except `.env.example`, dependency folders, local cache, and build output.

## Remaining production requirements

- Configure and stage-test the actual MySQL database, Resend sender, Google OAuth app, and secure deployment origin.
- Configure Hostinger's trusted reverse proxy and ensure client-supplied forwarding headers cannot spoof the IP used by database-backed rate limiting.
- Add durable abuse throttling for the public inquiry route and spam monitoring; current inquiry form has validation and honeypot only.
- Complete private file storage, virus scanning, signed-download authorization, audit coverage for every admin operation, and per-resource checks for messages/invoices/files as those modules are built.
- Add deployment-specific CSP/headers, secret rotation and key recovery, monitoring/alert ownership, dependency scanning, backup restore validation, and incident drills.
- Review MFA recovery and bootstrap operations with the deployment team. Never create a public MFA bypass or store real secrets in repository files.

## Dependency security status

At the final `npm audit`, no advisories remained (0 critical, high, moderate, or low). Re-run the audit when dependencies change and before deployment. See `docs/IMPLEMENTATION-STATUS.md` for the audit run and versions.

The Next.js 15 line and the original test/lint dependencies had advisories with no compatible patch in their current major ranges. Next was moved to 16.4.0 for the current security fixes; Vitest was moved to 5.0.3; the vulnerable Next ESLint config tree was removed and replaced with flat TypeScript/React/hooks/accessibility rules. Prisma 6 remains on its current patch and uses a tested `deepmerge-ts` 8 override to address its vulnerable config transitive dependency; Prisma schema validation/generation were run after that override.
