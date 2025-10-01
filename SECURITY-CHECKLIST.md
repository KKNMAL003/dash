# Production Security Checklist

This document outlines the critical security steps that **MUST** be completed before deploying to production.

## ✅ COMPLETED: Code Security

### 1. Dev-Only Code Protected ✓
- [x] `src/main.tsx`: notificationTest guarded with `if (import.meta.env.DEV)`
- [x] `src/App.tsx`: queryClient exposure guarded with `if (import.meta.env.DEV)`
- [x] Verified no test utilities in production builds

### 2. Service Worker Security ✓
- [x] `public/sw.js`: Supabase API responses are NOT cached (line 78-80)
- [x] Only static assets are cached
- [x] No sensitive data stored in Cache Storage

### 3. Security Headers ✓
- [x] `netlify.toml`: Enhanced security headers added
  - HSTS (Strict-Transport-Security)
  - Referrer-Policy: no-referrer
  - Enhanced Permissions-Policy
  - CSP with WebSocket support for Supabase realtime
  - X-Frame-Options: DENY

### 4. Secrets Management ✓
- [x] `.gitignore`: Already includes `.env*.local`
- [x] No committed secrets found in recent commits

---

## 🚨 CRITICAL: Database Security (MUST DO BEFORE PRODUCTION)

### 1. Apply RLS Migration ⚠️

**FILE:** `supabase/migrations/20251001000000_enable_rls_security.sql`

**ACTION REQUIRED:**
```bash
# Apply the migration to enable RLS and secure all tables
supabase db push

# OR if using Supabase CLI:
supabase migration up
```

**What this does:**
- Revokes overly broad permissions granted to `authenticated` and `anon` roles
- Re-enables Row Level Security (RLS) on ALL tables
- Creates `is_admin()` security definer function to avoid RLS recursion
- Implements granular policies:
  - Admins: Full access to all tables
  - Customers: Can only access their own records
  - Anonymous: No direct table access

### 2. Remove Development Seed Data ⚠️

**FILES TO REVIEW:**
- `supabase/migrations/20250628225236_calm_hill.sql` (disables RLS, creates fake data)
- `supabase/migrations/20250818211815_flat_coast.sql` (contains real credentials!)

**ACTION REQUIRED:**

**Option A (Recommended): Start Fresh Production Database**
```bash
# Do NOT apply the following migrations to production:
# - 20250628225236_calm_hill.sql (disables RLS)
# - 20250628224136_noisy_bird.sql (disables RLS)
# - 20250818211815_flat_coast.sql (contains credentials)

# Only apply migrations up to the security migration
```

**Option B: Create Separate Dev/Prod Migration Paths**
```bash
# Move seed scripts to a separate dev-only directory
mkdir -p supabase/seed
mv supabase/migrations/20250628225236_calm_hill.sql supabase/seed/
mv supabase/migrations/20250818211815_flat_coast.sql supabase/seed/
```

### 3. Rotate Supabase Keys ⚠️

**ACTION REQUIRED:**

1. Go to Supabase Dashboard → Settings → API
2. Generate new `anon` key
3. Update Netlify environment variables:
   ```bash
   # In Netlify Dashboard → Site settings → Environment variables
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=<new-anon-key>
   ```
4. Remove any `.env.local` files from Git history if they were committed:
   ```bash
   # Use git filter-branch or BFG Repo-Cleaner to remove sensitive files
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env.local' \
     --prune-empty --tag-name-filter cat -- --all
   ```

### 4. Create Admin Users Securely ⚠️

**DO NOT** use migrations with hardcoded passwords!

**ACTION REQUIRED:**

**Option A: Use Supabase Dashboard**
1. Go to Authentication → Users
2. Create admin user via UI
3. Manually update `profiles.role = 'admin'` in SQL Editor

**Option B: Use Supabase CLI**
```bash
# Create user via auth API (sends confirmation email)
supabase auth signup --email admin@yourcompany.com

# Then update their role in profiles table
supabase db execute "UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@yourcompany.com');"
```

---

## 📋 RECOMMENDED: Quality & Operations

### 1. Install Linting Dependencies

```bash
npm install -D \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-react-refresh \
  eslint-plugin-jsx-a11y \
  prettier
```

### 2. Enable TypeScript Strict Mode

**FILE:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    // ... other options
  }
}
```

Phase-in by folder if needed to avoid breaking existing code.

### 3. Set Up GitHub Actions Secrets

**Required secrets in GitHub Settings → Secrets and variables → Actions:**
- `NETLIFY_AUTH_TOKEN`: Get from Netlify → User settings → Applications
- `NETLIFY_SITE_ID`: Get from Netlify → Site settings → General

### 4. Add Error Monitoring

**Sentry Integration:**

```bash
npm install @sentry/react @sentry/vite-plugin
```

**Update `src/main.tsx`:**
```typescript
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

### 5. Database Backups

**ACTION:** Set up automated backups in Supabase Dashboard
- Go to Settings → Database → Backup
- Enable Point-in-Time Recovery (PITR) if available
- Set up manual backup schedule (daily recommended)

---

## 🧪 Testing Before Production Deploy

### Pre-Deploy Checklist

- [ ] Apply RLS migration to staging environment first
- [ ] Test admin login and access
- [ ] Test customer login (should NOT see other customers' data)
- [ ] Test that anonymous users cannot access tables directly
- [ ] Verify API calls work correctly through Supabase client
- [ ] Run `npm run build` and check for errors
- [ ] Run `npm run type-check` and fix all TypeScript errors
- [ ] Run `npm audit` and fix critical/high vulnerabilities
- [ ] Test service worker doesn't cache Supabase responses
- [ ] Verify security headers in Network tab (after deploy to Netlify preview)

### Post-Deploy Verification

- [ ] Check browser console for no errors
- [ ] Verify no sensitive data exposed in Network tab
- [ ] Test login/logout flow
- [ ] Verify RLS is working (try accessing other users' data via console - should fail)
- [ ] Check that `window.__queryClient` is NOT exposed in prod build
- [ ] Verify security headers present in Response Headers
- [ ] Test offline mode and service worker updates

---

## 📞 Emergency Rollback Plan

If critical issues are discovered in production:

1. **Immediate:** Revert to previous deployment in Netlify Dashboard
2. **Database:** Restore from backup if data integrity is compromised
3. **Secrets:** Rotate all keys and tokens if exposure is suspected
4. **Communication:** Notify affected users if data breach occurred

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Netlify Security Headers](https://docs.netlify.com/routing/headers/)
- [Sentry React Integration](https://docs.sentry.io/platforms/javascript/guides/react/)

---

## Status Summary

| Category | Status | Blocker |
|----------|--------|---------|
| Code Security | ✅ Complete | No |
| Secret Management | ⚠️ Review Required | **YES** |
| Database RLS | ⚠️ Migration Pending | **YES** |
| Security Headers | ✅ Complete | No |
| CI/CD | ⚠️ Setup Required | No |
| Error Monitoring | ⚠️ Setup Required | No |
| Backups | ⚠️ Setup Required | No |

**PRODUCTION READY: NO**

Critical blockers remaining:
1. Apply RLS migration `20251001000000_enable_rls_security.sql`
2. Remove/isolate dev seed migrations with credentials
3. Rotate Supabase anon key and update Netlify env vars
4. Create admin users securely (not via migration)
