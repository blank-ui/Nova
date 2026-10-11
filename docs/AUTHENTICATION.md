# Authentication

## Implemented foundation

Nova uses Better Auth 1.7.7 with the Prisma adapter and MySQL. Email/password credentials, one-hour email verification, password reset, database-backed sessions (7-day expiry), TOTP MFA with recovery codes, social OAuth, and persistent database rate limits are configured in `src/lib/auth.ts`. Password storage and verification use the library's maintained credential implementation; Nova never handles a raw password outside the auth call.

Public registration cannot set `role`. The Better Auth admin plugin rejects a submitted role field, and a normal registration defaults to `CLIENT`. OAuth accounts with unverified Google email claims are rejected. Implicit same-email linking is disabled; users must be authenticated and explicitly link Google from account security settings. Linking to another email is disabled.

`src/lib/auth-guards.ts` obtains the session on the server. Admin data access requires role `ADMIN` and enabled TOTP. An administrator without MFA can access only the security setup page. Client project reads use `getAuthorizedProject`, which queries by both the requested project ID and authenticated `clientId`. Expand that service-level pattern to every private operation.

## Environment

Set these in `.env` locally or in the deployment secret manager:

- `DATABASE_URL`: MySQL connection string.
- `APP_URL`: exact canonical origin, e.g. `https://your-domain.example` in production.
- `AUTH_SECRET`: random secret of at least 32 characters; rotate using the auth library's supported secret rotation plan.
- `EMAIL_FROM`, `EMAIL_API_KEY`: verified Resend sender and API key. The key is only used server-side.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth Web client. Google button remains visibly unavailable until both exist.
- `ADMIN_BOOTSTRAP_SECRET`: temporary high-entropy value for the operator-run one-time setup command.

When the email key is absent in development, verification/reset links are printed to the local dev server console. In production, missing email configuration fails instead of claiming delivery. Treat local console links as credentials and do not share logs.

## Google Cloud Console setup

1. Create or choose a Google Cloud project and configure the OAuth consent screen with the Nova application name, support contact, authorized domains, and requested identity scopes (`openid`, `email`, `profile`). Complete Google's verification requirements for the intended production audience.
2. Create an OAuth client ID of type **Web application**.
3. Add the exact site origin (for example `https://your-domain.example`) under Authorized JavaScript origins. Add `http://localhost:3000` only to a development client/origin when testing locally.
4. Add the redirect URI `https://your-domain.example/api/auth/callback/google`. For local development add `http://localhost:3000/api/auth/callback/google` to a development client.
5. Store the client ID and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Do not use `NEXT_PUBLIC_` variables for either value.
6. Verify normal sign-in, callback state rejection, verified email claims, unverified claim rejection, same-email unlinked account behavior, explicit account linking, and account unlinking policy in staging.

The app uses the provider callback path `/api/auth/callback/google`. Keep the `APP_URL` origin and registered redirect URI aligned. Real Google callback testing remains pending until real credentials are configured.

## First administrator and MFA

There is no public admin-registration route and no hardcoded initial password. First, create and verify an ordinary account. Then set `BOOTSTRAP_ADMIN_EMAIL` to that email and configure `ADMIN_BOOTSTRAP_SECRET` with at least 32 random bytes in the operator's deployment environment. Run `npm run auth:bootstrap` against the target database. The script requires the verified account, refuses if any admin exists, creates a unique `BootstrapClaim`, and promotes the account inside one transaction. The unique claim makes concurrent attempts single-winner. Remove the secret immediately after use.

The first administrator may sign in but is sent to `/admin/security`; full admin pages and services remain blocked until TOTP setup is confirmed. Later admin sign-ins require a second factor. Recovery codes are shown once during setup; store them in a secure password manager. If the authenticator and recovery codes are lost, recovery must be performed by the deployment operator through a reviewed, audited recovery procedure; no public MFA bypass exists.

## Sessions and account recovery

Sessions are stored in MySQL and use Better Auth secure, same-site cookies. Login/logout and revoke-other-sessions controls are available in account security settings. Password resets use library-issued expiring one-use tokens and revoke existing sessions on completion. The UI returns generic sign-in/recovery messages. The exact callback origin is restricted to `APP_URL`.

## Tests and limits

Automated tests use Better Auth's in-memory adapter for registration, role assignment rejection, password reset replay, sign-in/sign-out revocation, and invalid OAuth state; they do not call Google or send email. Type checking and schema generation validate the adapter model shape. Real MySQL, Resend, Google OAuth, TOTP delivery/use with a device, session revocation against production MySQL, and administrator bootstrap have not been verified in this environment because credentials were not configured.
