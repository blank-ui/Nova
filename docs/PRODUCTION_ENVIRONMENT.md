# Nova Production Environment Specification

**Domain:** `https://nova.allskyfares.com`  
**Operating Entity:** All Sky Fares LLC (`nova@allskyfares.com`)  
**Target Infrastructure:** Hostinger (KVM VPS or Cloud Managed Node.js + MySQL 8)

---

## 1. Environment Variables Matrix

All production configuration must be set in the hosting environment (e.g., PM2 ecosystem config, systemd service, or Hostinger hPanel Environment Variables). **Never commit a live `.env` file to Git.**

| Variable Name | Required | Default / Target Example | Description |
|---|---|---|---|
| `NODE_ENV` | **Yes** | `production` | Enforces production mode, optimized bundles, and disables dev debugging. |
| `APP_URL` | **Yes** | `https://nova.allskyfares.com` | Canonical public origin. Used for Better Auth baseURL, trusted origins, and OAuth redirects. |
| `DATABASE_URL` | **Yes** | `mysql://user:pass@127.0.0.1:3306/nova_prod?connection_limit=10&pool_timeout=20` | Prisma MySQL 8 connection string with connection pooling. |
| `AUTH_SECRET` | **Yes** | High-entropy 32+ char secret | Better Auth signing and session encryption secret. Server refuses boot if unset in production. |
| `SMTP_HOST` | **Yes** | `smtp.hostinger.com` | Hostinger secure transactional mail server. |
| `SMTP_PORT` | **Yes** | `465` | TLS port for Hostinger SMTP. |
| `SMTP_SECURE` | **Yes** | `true` | Enforces implicit TLS socket connection. |
| `SMTP_USER` | **Yes** | `nova@allskyfares.com` | Hostinger mailbox username. |
| `SMTP_PASS` | **Yes** | `<mailbox_password>` | Hostinger mailbox password. |
| `EMAIL_FROM` | **Yes** | `Nova <nova@allskyfares.com>` | Sender header matching DKIM/SPF domain. |
| `ADMIN_MFA_ISSUER` | Optional | `Nova` | Issuer name displayed in Google Authenticator / 1Password. |
| `ADMIN_BOOTSTRAP_SECRET`| One-Time | High-entropy token | Used strictly during initial operator promotion (`npm run auth:bootstrap`), then cleared. |
| `BOOTSTRAP_ADMIN_EMAIL` | One-Time | `nova@allskyfares.com` | Email of operator account to promote to ADMIN. |
| `GOOGLE_CLIENT_ID` | Optional | `<id>.apps.googleusercontent.com` | Google Cloud OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | Optional | `<secret>` | Google Cloud OAuth client secret. |
| `DISCORD_CLIENT_ID` | Optional | `<client_id>` | Discord OAuth integration. |
| `DISCORD_CLIENT_SECRET` | Optional | `<client_secret>` | Discord OAuth secret. |
| `DISCORD_WEBHOOK_URL` | Optional | `https://discord.com/api/webhooks/...` | Webhook URL for real-time inquiry and CRM alerts. |
| `GITHUB_TOKEN` | Optional | `ghp_...` | GitHub Personal Access Token to avoid IP rate limits on showcase repos. |
| `PRIVATE_STORAGE_BUCKET`| Optional | `<bucket>` | S3-compatible bucket name for project assets. |

---

## 2. Secrets Management & Operational Security

1. **Entropy Requirement:**
   Generate `AUTH_SECRET` using cryptographic randomness:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```
2. **Database Pooling:**
   Hostinger MySQL has connection caps per user. Append connection pool parameters to `DATABASE_URL`:
   `?connection_limit=10&pool_timeout=20`
3. **No Dev Fallbacks in Production:**
   In production (`NODE_ENV=production`), `AUTH_SECRET` does not generate a temporary fallback in memory; it fails safely if missing to protect session continuity across process restarts.
