# Architecture

Nova uses one Next.js application: server-rendered public pages, React client components only for interactive forms, and Route Handlers for server-side operations. The modular monolith keeps deployment simple for Hostinger while keeping domain code in `src/lib` and `src/app/api`.

Prisma maps the MySQL schema. The initial domain includes users, database sessions, inquiries, projects, tasks, milestones, project messages/files, and audit events. Files are represented by private storage keys; public URLs must be short-lived signed URLs issued only after server authorization.

## Decisions

- TypeScript strict mode and Zod validation at untrusted input boundaries.
- MySQL for Hostinger compatibility; Prisma migrations are the schema source of truth.
- No client-only authorization. Admin and portal data handlers must validate a server session and ownership on every operation.
- Auth.js or another maintained solution will be selected after validating email/password, OAuth, MFA, and adapter support against pinned current versions.
- Do not introduce Redis, a separate API service, or a payment gateway until measured needs justify them.

## Implementation sequence

1. Foundation and visual system; public inquiry slice (current).
2. Complete public content and portfolio CMS.
3. Authentication, verification, recovery, session revocation, admin MFA.
4. Admin CRM and client portal with ownership checks.
5. Proposals, invoices, payments, private files, notifications.
6. Rate limits, monitoring, backups/restore, accessibility/security review, staging and production.
