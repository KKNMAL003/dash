# Production Deployment Guide

This guide walks you through deploying the Onolo Admin Dashboard to production safely and securely.

## Prerequisites

- [ ] Supabase project (separate production instance recommended)
- [ ] Netlify account with site created
- [ ] GitHub repository connected to Netlify
- [ ] Admin email address for initial admin user

---

## Step 1: Install Development Dependencies

First, install the required linting and code quality tools:

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

Verify installation:
```bash
npm run lint
npm run type-check
npm run format:check
```

---

## Step 2: Database Security Setup

### 2.1 Isolate Development Seeds

**Move development-only migrations** that contain test data and disabled RLS:

```bash
# Create seed directory
mkdir -p supabase/seed

# Move dev-only migrations
mv supabase/migrations/20250628225236_calm_hill.sql supabase/seed/
mv supabase/migrations/20250628224136_noisy_bird.sql supabase/seed/
mv supabase/migrations/20250818211815_flat_coast.sql supabase/seed/
```

⚠️ **CRITICAL:** The `20250818211815_flat_coast.sql` file contains a real password hash. Do NOT apply to production.

### 2.2 Apply RLS Security Migration

Apply only the secure migrations to production:

```bash
# Connect to production database
supabase link --project-ref your-production-ref

# Review migrations that will be applied
supabase db diff

# Apply all remaining migrations (including RLS security)
supabase db push
```

Verify RLS is enabled:
```sql
-- Run in Supabase SQL Editor
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All tables should show rowsecurity = true
```

### 2.3 Create Production Admin User

**Do NOT use the seed migration!** Create admin securely:

```bash
# Option 1: Via Supabase Dashboard
# 1. Go to Authentication → Users
# 2. Click "Invite user" or "Add user"
# 3. Enter admin email
# 4. Go to SQL Editor and run:

UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-admin@email.com'
);
```

Or via CLI:
```bash
# Create user (sends confirmation email)
supabase auth signup --email your-admin@email.com

# Then update role in SQL Editor as shown above
```

---

## Step 3: Secrets Management

### 3.1 Rotate Supabase Keys

1. **Go to Supabase Dashboard** → Settings → API
2. **Rotate the `anon` key** (optional but recommended for fresh deployment)
3. **Copy the keys:**
   - `VITE_SUPABASE_URL`: Your project URL
   - `VITE_SUPABASE_ANON_KEY`: Public anon key

### 3.2 Configure Netlify Environment Variables

In Netlify Dashboard → Site settings → Environment variables → Add variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
NODE_VERSION=20
```

⚠️ **Never commit `.env.local` files!** The `.gitignore` is already configured.

### 3.3 Clean Git History (If Keys Were Committed)

If you accidentally committed sensitive files:

```bash
# Check if .env.local was committed
git log --all --full-history -- .env.local

# If found, remove from history (DANGEROUS - coordinate with team)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.local' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (requires team coordination)
git push origin --force --all
```

---

## Step 4: CI/CD Setup

### 4.1 Configure GitHub Secrets

Go to GitHub Repository → Settings → Secrets and variables → Actions:

Add these secrets:
- `NETLIFY_AUTH_TOKEN`: Get from Netlify → User settings → Applications → Personal access tokens
- `NETLIFY_SITE_ID`: Get from Netlify → Site settings → General → Site details → API ID

### 4.2 Verify CI Pipeline

Push a commit and verify the workflow runs:

```bash
git add .
git commit -m "feat: add security hardening and CI/CD"
git push origin main
```

Check GitHub Actions tab for pipeline status.

---

## Step 5: Pre-Deployment Testing

### 5.1 Run Local Checks

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Test (if tests exist)
npm run test:run

# Security audit
npm audit --audit-level=moderate
```

### 5.2 Test Production Build Locally

```bash
npm run preview
```

**Verify in browser:**
- [ ] No console errors
- [ ] Login works
- [ ] Admin dashboard loads
- [ ] Network tab shows no Supabase responses cached
- [ ] `window.__queryClient` is undefined (DevTools console)

---

## Step 6: Deploy to Production

### 6.1 Deploy via Netlify

**Option A: Push to main branch** (if CI/CD connected)
```bash
git push origin main
```

**Option B: Manual deploy**
```bash
npm run build
netlify deploy --prod --dir=dist
```

### 6.2 Verify Deployment

Once deployed, open your production URL and check:

1. **Security Headers** (Network tab → Response Headers):
   - `Strict-Transport-Security` present
   - `X-Frame-Options: DENY`
   - `Content-Security-Policy` present
   - `Referrer-Policy: no-referrer`

2. **Authentication:**
   - [ ] Login with admin credentials
   - [ ] Dashboard loads correctly
   - [ ] All routes accessible

3. **RLS Verification:**
   - Open browser DevTools → Console
   - Try to query data directly:
   ```javascript
   // Should fail or return only user's own data
   const { data, error } = await supabase
     .from('profiles')
     .select('*');
   console.log(data, error);
   ```

4. **Service Worker:**
   - Check Application → Service Workers
   - Verify it's registered
   - Check Cache Storage - should NOT contain Supabase responses

---

## Step 7: Post-Deployment Setup

### 7.1 Set Up Monitoring

**Option 1: Sentry (Recommended)**
```bash
npm install @sentry/react @sentry/vite-plugin
```

Add to `src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "your-sentry-dsn",
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0,
  });
}
```

Add environment variable in Netlify:
```env
VITE_SENTRY_DSN=your-sentry-dsn
```

**Option 2: Netlify Analytics**
- Enable in Netlify Dashboard → Analytics

### 7.2 Set Up Database Backups

In Supabase Dashboard:
1. Go to Settings → Database → Backups
2. Enable daily backups
3. Set retention period (7-30 days recommended)
4. Enable Point-in-Time Recovery if on Pro plan

### 7.3 Set Up Monitoring Alerts

In Supabase Dashboard → Settings → Database:
- Set up connection pool alerts
- Enable slow query logging
- Set up email alerts for errors

---

## Step 8: Create Disaster Recovery Plan

Document the following:

### Rollback Procedure
```bash
# In Netlify Dashboard:
# 1. Go to Deploys
# 2. Find last working deploy
# 3. Click "Publish deploy"

# Or via CLI:
netlify rollback
```

### Database Restore
```bash
# Via Supabase Dashboard:
# Settings → Database → Backups → Restore
```

### Secret Rotation
```bash
# If keys are compromised:
# 1. Rotate in Supabase Dashboard → Settings → API
# 2. Update Netlify environment variables
# 3. Redeploy site
```

---

## Maintenance Checklist

### Weekly
- [ ] Check Dependabot PRs and update dependencies
- [ ] Review error logs in Sentry/Netlify
- [ ] Check database usage and performance

### Monthly
- [ ] Review and rotate API keys (optional)
- [ ] Test backup restoration process
- [ ] Run security audit: `npm audit`
- [ ] Review and update dependencies

### Quarterly
- [ ] Review RLS policies for new features
- [ ] Update documentation
- [ ] Review and update security headers
- [ ] Penetration testing (if applicable)

---

## Troubleshooting

### Issue: RLS Policies Too Restrictive

**Symptom:** Admin can't access data
**Solution:** Check admin role is set correctly
```sql
SELECT id, email, role FROM auth.users u 
JOIN public.profiles p ON u.id = p.id 
WHERE u.email = 'admin@email.com';
```

### Issue: "Failed to fetch" errors

**Symptom:** All API calls fail
**Solution:** Check environment variables in Netlify
```bash
# Verify variables are set
netlify env:list
```

### Issue: Service Worker Caching Issues

**Symptom:** Old content shows after deploy
**Solution:** Clear cache and hard reload
- Chrome: DevTools → Application → Clear storage
- Or increment `CACHE_NAME` in `public/sw.js`

### Issue: TypeScript Build Errors

**Symptom:** Build fails on TypeScript errors
**Solution:** Run type-check locally and fix
```bash
npm run type-check
```

---

## Security Contacts

- **Supabase Security:** security@supabase.io
- **Netlify Security:** security@netlify.com
- **Report vulnerabilities:** [Your security email]

---

## Additional Resources

- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security#best-practices)
- [Netlify Deploy Contexts](https://docs.netlify.com/site-deploys/overview/)
- [React Security Best Practices](https://react.dev/learn/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Last Updated:** 2025-10-01  
**Status:** Ready for production deployment after completing all steps
