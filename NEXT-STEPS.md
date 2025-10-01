# Immediate Next Steps

## 🚨 Before You Deploy to Production

You **MUST** complete these critical security steps first. Do not skip any of these.

---

## 1. Install Linting Dependencies (5 minutes)

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

Verify:
```bash
npm run lint
npm run type-check
```

---

## 2. Move Dev Seeds (2 minutes)

```bash
# Create seed directory for dev-only data
mkdir -p supabase/seed

# Move dangerous migrations
mv supabase/migrations/20250628225236_calm_hill.sql supabase/seed/
mv supabase/migrations/20250628224136_noisy_bird.sql supabase/seed/
mv supabase/migrations/20250818211815_flat_coast.sql supabase/seed/
```

⚠️ **Why:** These files disable RLS and contain hardcoded credentials.

---

## 3. Apply Security Migration (3 minutes)

```bash
# Connect to your PRODUCTION Supabase project
supabase link --project-ref <your-prod-project-ref>

# Apply the RLS security migration
supabase db push
```

**Verify it worked:**
```bash
# In Supabase SQL Editor, run:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

# All tables should show rowsecurity = true
```

---

## 4. Create Admin User Securely (3 minutes)

**Via Supabase Dashboard:**

1. Go to **Authentication → Users**
2. Click **"Invite user"** or **"Add user"**
3. Enter your admin email
4. Go to **SQL Editor** and run:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-admin-email@example.com'
);
```

---

## 5. Rotate Supabase Keys (5 minutes)

**In Supabase Dashboard:**

1. Go to **Settings → API**
2. (Optional) Click **"Rotate key"** next to anon key
3. Copy both values:
   - Project URL
   - anon (public) key

**In Netlify Dashboard:**

1. Go to **Site settings → Environment variables**
2. Add these variables:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   NODE_VERSION=20
   ```

---

## 6. Remove Secrets from Git History (If Needed)

**Check if secrets were committed:**
```bash
git log --all --full-history -- .env.local
```

**If found (and you need to remove them):**
```bash
# ⚠️ WARNING: This rewrites history - coordinate with your team first!
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.local' \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all
```

---

## 7. Set Up GitHub Actions (Optional, 5 minutes)

**In GitHub Repository → Settings → Secrets:**

Add these secrets:
- `NETLIFY_AUTH_TOKEN`: From Netlify → User settings → Personal access tokens
- `NETLIFY_SITE_ID`: From Netlify → Site settings → General → API ID

---

## 8. Test Before Deploy (5 minutes)

```bash
# Type check
npm run type-check

# Build production bundle
npm run build

# Preview production build
npm run preview
```

**Open http://localhost:4173 and verify:**
- [ ] No console errors
- [ ] Login works
- [ ] Open DevTools Console and type: `window.__queryClient`
  - Should be `undefined` in production build
- [ ] Check Network tab - Supabase responses should NOT be cached

---

## 9. Deploy to Production

```bash
# If GitHub Actions is set up:
git add .
git commit -m "feat: security hardening for production"
git push origin main

# Or manual deploy:
npm run build
netlify deploy --prod --dir=dist
```

---

## 10. Post-Deploy Verification (5 minutes)

**After deployment, verify:**

1. **Login** with your admin credentials
2. **Check Security Headers** (Network tab → any request → Response Headers):
   - `Strict-Transport-Security` present
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: no-referrer`
3. **Test RLS** (DevTools Console):
   ```javascript
   // Import your supabase client and try to access all profiles
   // Should only return your own profile or nothing
   ```

---

## ✅ Checklist

Before marking as complete, ensure:

- [ ] Linting dependencies installed
- [ ] Dev seed migrations moved to `supabase/seed/`
- [ ] RLS migration applied to production database
- [ ] Admin user created securely (NOT via migration)
- [ ] Supabase keys rotated and set in Netlify
- [ ] No `.env.local` in git history
- [ ] GitHub Actions secrets configured (optional)
- [ ] Production build tested locally
- [ ] Deployed to production
- [ ] Post-deploy verification passed

---

## 📚 Full Documentation

- **SECURITY-CHECKLIST.md** - Complete security review and checklist
- **DEPLOYMENT.md** - Comprehensive deployment guide with troubleshooting
- **README.md** - Project overview and local development setup

---

## Need Help?

If you encounter issues:
1. Check **DEPLOYMENT.md** troubleshooting section
2. Review Supabase logs in Dashboard → Logs
3. Check Netlify deploy logs in Dashboard → Deploys
4. Verify RLS policies in Supabase SQL Editor

---

**Estimated Time:** 30-40 minutes for all steps

**Status:** 🔴 **NOT PRODUCTION READY** until all steps completed
