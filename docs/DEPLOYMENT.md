# Nova Production Deployment Guide

**Target Domain:** `https://nova.allskyfares.com`  
**Host:** Hostinger (KVM VPS or Cloud Managed Node.js)  
**Operating Entity:** All Sky Fares LLC

---

## 1. Hosting Architecture & Prerequisites

Next.js 16 (App Router) with Better Auth, server actions, and relational MySQL 8 requires a **persistent Node.js runtime** (Node 20+ LTS).

### Recommended: Hostinger KVM VPS (Ubuntu 22.04 / 24.04 LTS)
- **Runtime:** Node.js v20.x or v22.x LTS, npm 10+, PM2 process manager
- **Database:** Local MySQL 8.0 server (`127.0.0.1:3306`) or Hostinger Managed Cloud MySQL
- **Reverse Proxy:** Nginx with Let's Encrypt SSL (Certbot)
- **Process Manager:** PM2 with cluster mode or single instance + restart on failure

### Alternative: Hostinger Cloud Hosting (hPanel Node.js Application)
- **Node.js Selector:** Select Node.js 20.x or 22.x
- **Application Startup File:** Set to `server.js` (generated via `output: "standalone"` in `.next/standalone/server.js`)
- **Build Mode:** Because hPanel shared environments have memory caps that may terminate Turbopack builds, perform `npm run build` in CI/CD (GitHub Actions) or locally and transfer the build artifact (`.next/standalone`, `.next/static`, `public`).

---

## 2. DNS & Domain Configuration

Set DNS records in the DNS Zone for `allskyfares.com`:

| Type | Host / Name | Value / Points To | TTL | Note |
|---|---|---|---|---|
| `A` | `nova` | `<HOSTINGER_SERVER_IP>` | 300 (or Auto) | Points `nova.allskyfares.com` to the server |
| `CNAME` | `www.nova` | `nova.allskyfares.com` | 300 | (Optional redirect) |
| `TXT` | `@` / `nova` | `v=spf1 include:_spf.mail.hostinger.com ~all` | 3600 | SPF record for Hostinger mail delivery |

---

## 3. Database Deployment Procedure

> [!IMPORTANT]
> **Data Preservation Rule:** Never execute `prisma migrate reset` or `prisma db push` on a production database. Always use `prisma migrate deploy`.

### Step 1: Pre-Deployment Backup
Before running any migrations or updating code, create a point-in-time snapshot:
```bash
mysqldump -u <db_user> -p --single-transaction --quick --routines --triggers nova_prod > backup_pre_release_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Run Reviewed Version-Controlled Migrations
Execute pending migrations safely using:
```bash
npx prisma migrate deploy
```
This safely applies:
- `20261009000000_baseline`
- `20261009010000_authentication`
- `20261011081800_add_inquiry_phone`
- `20261012150000_add_studio_showcase`

---

## 4. Application Build & Startup

### Option A: Standard Deployment (On VPS)
```bash
# 1. Pull latest code
git pull origin main

# 2. Install production dependencies with strict lockfile
npm ci

# 3. Generate Prisma client
npx prisma generate

# 4. Apply migrations
npx prisma migrate deploy

# 5. Build optimized Next.js bundle
npm run build

# 6. Start / Reload with PM2
pm2 reload nova-app || pm2 start npm --name "nova-app" -- start
```

### Option B: Standalone Mode (High-Performance VPS / Docker)
With `output: "standalone"` enabled:
```bash
# 1. Build creates .next/standalone
npm run build

# 2. Copy static assets into standalone bundle
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# 3. Run standalone server via PM2
cd .next/standalone
PORT=3000 pm2 start server.js --name "nova-app"
```

---

## 5. Nginx Reverse Proxy Configuration (VPS)

Create `/etc/nginx/sites-available/nova.allskyfares.com`:
```nginx
server {
    listen 80;
    server_name nova.allskyfares.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nova.allskyfares.com;

    ssl_certificate /etc/letsencrypt/live/nova.allskyfares.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nova.allskyfares.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 16M;
    }
}
```
Obtain SSL certificate via Certbot:
```bash
certbot --nginx -d nova.allskyfares.com
```

---

## 6. Post-Deployment Verification & Smoke Testing

1. **Root page response:**
   `curl -I https://nova.allskyfares.com` $\rightarrow$ Expect `HTTP/2 200` with security headers.
2. **Protected portal redirect:**
   `curl -I https://nova.allskyfares.com/admin` $\rightarrow$ Expect `307 Redirect` to `/login?callbackURL=%2Fadmin`.
3. **Inquiry endpoint verification:**
   Submit a test project inquiry at `https://nova.allskyfares.com/contact`. Verify:
   - Persistence in `Inquiry` table
   - Phone and email required validation
   - Immediate notification dispatch
4. **Initial Operator Bootstrap (First Deploy Only):**
   Register an account for `nova@allskyfares.com`, then run:
   ```bash
   node --env-file=.env scripts/bootstrap-admin.mjs
   ```
   Verify role promotion to `ADMIN`, setup TOTP MFA in the security portal, and remove `ADMIN_BOOTSTRAP_SECRET` from environment.
