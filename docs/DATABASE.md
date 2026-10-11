# Database and migrations

## Schema

MySQL is accessed through Prisma 6.19.3. Better Auth's `User` fields are integrated with the existing user model; auth-owned sessions, linked accounts, verification tokens, TOTP records, rate-limit buckets, and the one-time bootstrap claim use separate tables. The legacy `Session` table (hashed tokens from initial schema) is retained; Better Auth writes to `AuthSession`. Inquiry, project, task, milestone, message, file, and audit data models are fully defined.

The auth migration changes `User.role` from the previous `Role` enum to a string so Better Auth can represent `CLIENT` and `ADMIN`. The former `emailVerified` timestamp is renamed to `emailVerifiedAt` and retained; the boolean `emailVerified` is maintained by Better Auth. Credentials use `AuthAccount.password`.

## Migration history and local deployment status

Two migrations are checked in and recorded as applied in the dedicated local development database:

1. `20261009000000_baseline`: Sets up the core schema (User, Session, Project, Task, Milestone, Inquiry, Message, ProjectFile, AuditLog).
2. `20261009010000_authentication`: Adds Better Auth tables (`AuthSession`, `AuthAccount`, `AuthVerification`, `AuthTwoFactor`, `AuthRateLimit`, `BootstrapClaim`) and adapts User fields.

### Live database verification (Phase 3C)
- **Target**: Dedicated local development database `nova` on `localhost:3306`.
- **Status**: Both migrations (`20261009000000_baseline` and `20261009010000_authentication`) are confirmed applied in `_prisma_migrations`.
- **Tables verified (16 tables)**:
  `_prisma_migrations`, `auditlog`, `authaccount`, `authratelimit`, `authsession`, `authtwofactor`, `authverification`, `bootstrapclaim`, `inquiry`, `message`, `milestone`, `project`, `projectfile`, `session`, `task`, `user`.
- Zero migration drift detected.

### Deployment commands
- Deploy migrations to a new environment: `npm run db:deploy`
- Generate Prisma Client: `npm run db:generate`
- Validate schema: `npx prisma validate`
- Run live MySQL integration tests: `$env:RUN_DB_INTEGRATION_TESTS="true"; npm run test:integration`

### Safety rules
- Never run `prisma migrate reset` or `db push` against existing databases.
- Integration tests refuse execution unless `RUN_DB_INTEGRATION_TESTS=true` is explicitly set and the database URL host is strictly local (`localhost`, `127.0.0.1`, `::1`) with database name containing `nova`.
- Disposable test records are created with unique IDs and cleaned up in `afterAll`.
