# Hostinger deployment

Target a Hostinger plan that explicitly supports the selected Node.js version and long-running Next.js server. If managed Node hosting does not support the required runtime/build behavior, use a maintained VPS configuration instead. Verify current plan limits, database versions, process management, and backup features in the Hostinger account before purchase/deployment.

1. Create separate staging and production apps and MySQL databases.
2. Configure environment variables in the hosting panel; never upload `.env` or commit secrets.
3. Build on the target-compatible environment with a pinned lockfile and Node version.
4. Run reviewed migrations using a deployment migration command; do not run development resets.
5. Configure HTTPS, canonical domain, security headers, health checks, log collection, and private object storage.
6. Verify inquiry persistence, email delivery, OAuth callbacks, authorization isolation, and rollback procedure in staging.
7. Promote a reviewed build and verify backups and a restore before accepting client data.

Do not treat these steps as evidence a deployment has happened. No hosting credentials were supplied.
