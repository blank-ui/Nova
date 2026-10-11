# Nova — Digital Experience & Engineering Studio Platform

Nova is a full-stack digital studio and client management platform built with **Next.js 16 (Turbopack)**, **React 19**, **Better Auth**, and **Prisma ORM (MySQL)**. It combines a public marketing experience with animations, inquiry intake, automated multi-channel lead notifications, and dedicated role-gated portals for clients and studio administrators.

Operating entity: **All Sky Fares LLC** (USA / Global).

---

## 🌟 Key Features

### 1. Studio Experience & Design System
- **Public Portal:** High-conversion landing experience, capabilities showcase, philosophy, case studies, interactive cost estimation calculator, and contact hub.
- **Micro-Interactions & Motion:** Fluid CSS/Tailwind animations, backdrop blur, ambient neon glows, and responsive navigation.
- **Enterprise Inquiry Intake:** Full lead qualification form with budget, scope, timeline, country code selection, and validation.

### 2. Multi-Channel Integrations & Automation
- **Discord Webhook CRM:** Instant dispatch of formatted embeds to internal Discord channels upon inquiry submission (featuring contact details, project scope, budget, and timestamp).
- **Direct Discord Connect:** 1-on-1 direct DM connect (`@superr_nova_`) for seamless client support and account linking.
- **Hostinger Business Email:** Transactional delivery for verification codes, password resets, and administrative alerts (`nova@allskyfares.com`).

### 3. Authentication & Security (Better Auth)
- **Role-Based Access Control (RBAC):** Strict partition between `CLIENT` and `ADMIN` roles.
- **OAuth & Social Providers:** Google OAuth and Discord OAuth sign-in with automatic profile linking.
- **Two-Factor Authentication (MFA / TOTP):** Time-based one-time password protection via authenticator apps (Google Authenticator, 1Password, etc.).
- **Mandatory Admin Protection:** Zero-trust architecture requiring verified email, `ADMIN` role, and active TOTP MFA before granting access to `/admin` workspaces.
- **Security Audit & Rate Limiting:** Persistent sliding-window rate limiters on sensitive endpoints, audit logging, and session revocation.

### 4. Portals & Workspaces
- **Client Workspace (`/portal`):**
  - Project overviews, milestone progress tracking, and deliverable review.
  - Profile customization, Discord handle linking, and security credential management.
- **Admin Control Center (`/admin`):**
  - KPI overview metrics (total inquiries, open leads, pipeline status).
  - CRM Inquiry Manager (`/admin/inquiry` & `/admin/inquiry/[id]`): filter, review, status progression (`NEW`, `CONTACTED`, `QUALIFIED`, `CLOSED`), and internal notes.
  - System Security Center (`/admin/security`): MFA controls and session tracking.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16.4](https://nextjs.org/) (App Router, Server Components, Route Handlers)
- **Runtime:** [Node.js](https://nodejs.org/) (v20+ recommended)
- **Language:** [TypeScript 5.9](https://www.typescriptlang.org/) (strict mode)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with custom design tokens
- **Database & ORM:** [MySQL 8.x](https://www.mysql.com/) via [Prisma ORM 6](https://www.prisma.io/)
- **Authentication:** [Better Auth 1.7](https://www.better-auth.com/) (Prisma Adapter, TOTP MFA, Google & Discord OAuth)
- **Testing:** [Vitest 5](https://vitest.dev/) for unit & integration testing, [Playwright](https://playwright.dev/) for E2E
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.9 or later (recommended: Node.js 22 LTS)
- npm or pnpm
- MySQL 8.x instance running locally or on a remote host

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/blank-ui/Nova.git
cd Nova
npm install
```

### 2. Environment Configuration

Copy the example environment configuration:

```bash
cp .env.example .env
```

Open `.env` and configure your credentials:

```env
# Application Base URL
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Connection (MySQL)
DATABASE_URL="mysql://username:password@localhost:3306/nova"

# Better Auth Secret (Min 32 random characters)
AUTH_SECRET="your-generated-super-secret-auth-key-32-chars-min"

# Social Authentication (Optional for local dev)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""

# Discord Webhook CRM (For instant lead notifications)
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN"

# Transactional Email (Hostinger SMTP or custom provider)
EMAIL_FROM="Nova <nova@allskyfares.com>"
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=465
SMTP_USER="nova@allskyfares.com"
SMTP_PASS=""
```

### 3. Database Initialization

Generate the Prisma client and push the schema to your MySQL database:

```bash
npm run db:generate
npm run db:deploy # or npx prisma db push for development
```

### 4. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Bootstrapping the Initial Administrator

By default, public registration creates `CLIENT` accounts only. To establish the primary root administrator:

1. Register an account at `http://localhost:3000/register` and verify its email.
2. Set a temporary high-entropy secret and the target email in your environment:
   ```bash
   ADMIN_BOOTSTRAP_SECRET="a-very-long-random-bootstrap-token-here"
   BOOTSTRAP_ADMIN_EMAIL="admin@yourdomain.com"
   ```
3. Run the one-time promotion script:
   ```bash
   npm run auth:bootstrap
   ```
4. Remove `ADMIN_BOOTSTRAP_SECRET` from your environment.
5. Log in as the promoted user, navigate to `/admin/security`, and configure TOTP MFA before accessing the admin dashboard at `/admin`.

---

## 📜 Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Builds the production bundle (with route optimization) |
| `npm run start` | Starts the production Next.js server |
| `npm run lint` | Runs ESLint 9 checks across all source code |
| `npm run typecheck` | Runs strict TypeScript verification (`tsc --noEmit`) |
| `npm test` | Runs the test suite via Vitest (80+ unit tests) |
| `npm run test:integration` | Runs database and adapter integration tests |
| `npm run db:generate` | Generates the Prisma Client |
| `npm run db:migrate` | Runs database migrations in development |
| `npm run db:deploy` | Applies pending migrations in production |
| `npm run auth:bootstrap` | One-time root admin promotion CLI |

---

## 📁 Project Architecture

```
Nova/
├── docs/                      # Architectural specs, deployment & security guides
│   ├── AUTHENTICATION.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT-HOSTINGER.md
│   ├── LEGAL-COMPLIANCE.md
│   └── SECURITY.md
├── prisma/
│   ├── schema.prisma          # MySQL schema (Users, Sessions, Inquiries, Projects)
│   └── migrations/            # Version-controlled SQL migrations
├── public/                    # Static assets, branding, and icons
├── scripts/                   # Administrative automation (e.g. bootstrap-admin)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Sign-in, sign-up, verification routes
│   │   ├── admin/             # Admin Control Center (MFA protected)
│   │   ├── api/               # Serverless Route Handlers (Auth, Inquiries, Discord)
│   │   ├── portal/            # Client Portal (Projects, Milestones, Security)
│   │   ├── contact/           # Studio inquiry & booking form
│   │   └── page.tsx           # Studio landing & showcase page
│   ├── components/            # Reusable UI & layout components
│   └── lib/                   # Core business logic, auth config, email, Discord CRM
└── vitest.config.ts           # Vitest testing configuration
```

---

## 🔒 Security & Privacy

- **Data Protection:** Passwords hashed with bcrypt; sessions cryptographically managed by Better Auth.
- **Zero Secrets in Git:** Sensitive keys and production credentials are excluded via `.gitignore`.
- **Operating Compliance:** Designed for US/Global business operations under **All Sky Fares LLC**.

---

## 📄 License

Proprietary © 2026 **All Sky Fares LLC**. All rights reserved.
