# Nova Production Rollback Procedure

**Domain:** `https://nova.allskyfares.com`  
**Operating Entity:** All Sky Fares LLC

This runbook defines practical, step-by-step procedures to revert a production release safely if a critical regression or service degradation is detected.

---

## 1. Rollback Decision Matrix

| Symptom | Primary Cause | Immediate Action |
|---|---|---|
| Application fails to boot (Exit 1 / CrashLoop) | Missing environment variable, runtime mismatch | Check PM2 logs (`pm2 logs nova-app`), fix environment or revert code |
| 500 errors on database queries | Schema mismatch, missing migration table | Verify `prisma migrate status` or restore DB snapshot |
| Unresponsive server / high memory leak | Node runtime memory issue | `pm2 restart nova-app` followed by code rollback |
| Route regression / UI defect | Code bug introduced in latest release | Code-only rollback |

---

## 2. Fast Application Code Rollback (No Schema Changes)

If the database schema has not been modified destructively:

```bash
# 1. Inspect recent commits and identify the known-good commit hash
git log -n 5 --oneline

# 2. Revert to previous release tag or commit hash (e.g., <PREVIOUS_COMMIT>)
git checkout <PREVIOUS_COMMIT>

# 3. Reinstall dependencies and rebuild
npm ci
npm run build

# 4. Restart process manager
pm2 reload nova-app

# 5. Verify service health
curl -I https://nova.allskyfares.com
```

---

## 3. Database Rollback Procedure

> [!CAUTION]
> Reverting application code in Git **never** reverses database migrations or restores modified rows. Do not run `prisma migrate reset` in production under any circumstances.

### Scenario A: Reverting Additive Migrations (`StudioSettings` / `GalleryItem`)
Because the migrations are strictly additive (adding new tables with no dropped columns or foreign key constraints), rolling back the application code to an earlier version that does not query these tables is **fully backward compatible** without altering the database. The extra tables remain benign.

### Scenario B: Restoring from Point-in-Time Snapshot
If corrupted data or irreversible schema corruption occurred:

1. **Stop the Application** to prevent new writes:
   ```bash
   pm2 stop nova-app
   ```
2. **Restore the Pre-Release Backup**:
   ```bash
   mysql -u <db_user> -p nova_prod < backup_pre_release_YYYYMMDD_HHMMSS.sql
   ```
3. **Verify Database Integrity**:
   ```bash
   mysql -u <db_user> -p -e "SHOW TABLES; SELECT COUNT(*) FROM User; SELECT COUNT(*) FROM Inquiry;" nova_prod
   ```
4. **Checkout Corresponding Code Commit & Restart**:
   ```bash
   git checkout <PREVIOUS_COMMIT>
   pm2 restart nova-app
   ```

---

## 4. Post-Rollback Verification Checklist

- [ ] `curl -I https://nova.allskyfares.com` returns HTTP 200 with security headers.
- [ ] `/admin` redirects unauthenticated traffic to `/login`.
- [ ] Test inquiry submission succeeds at `/contact`.
- [ ] PM2 error log shows 0 uncaught exceptions: `pm2 logs nova-app --lines 50`.
- [ ] Notify project stakeholders of rollback completion and begin post-mortem review.
