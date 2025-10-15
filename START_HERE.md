# 🚀 START HERE - Onolo Admin Mobile App

## Welcome! 👋

Your Onolo Admin Dashboard has been successfully converted to a native mobile app with push notifications!

This guide will help you get started quickly.

---

## ✅ What's Already Done

Your project now includes:

- ✅ **Capacitor wrapper** - Converts your web app to native iOS/Android
- ✅ **Android platform** - Ready to build and test
- ✅ **Push notification code** - Integrated into your React app
- ✅ **Database schema** - Ready to store device tokens
- ✅ **Edge Functions** - Ready to send notifications
- ✅ **Complete documentation** - Step-by-step guides

**You can now:**
- Build native iOS and Android apps
- Distribute via App Store and Google Play Store
- Send push notifications to admin users
- Keep all your existing web functionality

---

## 📋 What You Need to Do

### Step 1: Choose Your Path

**Option A: Just Android** (Easier, no macOS required)
- Skip iOS setup
- Follow Android steps only
- Deploy to Google Play Store

**Option B: iOS + Android** (Full mobile coverage)
- Requires macOS with Xcode
- Follow both iOS and Android steps
- Deploy to both app stores

**Option C: Test First, Deploy Later**
- Set up Firebase
- Test on one platform
- Add the other platform later

---

## 🎯 Quick Setup (30 Minutes)

### 1. Firebase Setup (15 minutes)

Firebase provides the push notification infrastructure.

**Steps:**
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "Onolo Admin"
4. Create project

**For Android:**
1. Click "Add app" → Android icon
2. Package name: `com.onolo.admin`
3. Download `google-services.json`
4. Place in: `android/app/google-services.json`

**For iOS (if needed):**
1. Click "Add app" → iOS icon
2. Bundle ID: `com.onolo.admin`
3. Download `GoogleService-Info.plist`
4. Save for later (you'll add to Xcode)

**Enable FCM:**
1. Project Settings → Cloud Messaging
2. Click "Manage API in Google Cloud Console"
3. Click "Enable"

**Get Service Account:**
1. Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download JSON file
4. Save it (you'll need it for Supabase)

### 2. Supabase Setup (10 minutes)

**Run Database Migration:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `supabase/migrations/device_tokens.sql`
4. Paste and run

**Deploy Edge Functions:**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy send-push-notification
supabase functions deploy notify-new-order
supabase functions deploy notify-new-message
```

**Set Secrets:**
1. Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. Add `FIREBASE_SERVICE_ACCOUNT_JSON` (paste the JSON from Firebase)
3. Add `FIREBASE_PROJECT_ID` (your Firebase project ID)

**Configure Webhooks:**
1. Supabase Dashboard → Database → Webhooks
2. Create webhook for `orders` table:
   - Events: INSERT
   - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-new-order`
   - Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`
3. Create webhook for `communication_logs` table:
   - Events: INSERT
   - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-new-message`
   - Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`

### 3. Test on Android (5 minutes)

```bash
# Open in Android Studio
npm run cap:open:android

# Click "Run" button
# Sign in with admin account
# Grant notification permissions
# Create a test order
# You should receive a notification!
```

---

## 📚 Detailed Documentation

Once you've completed the quick setup, refer to these guides for more details:

### For Setup
- **[QUICK_START.md](./QUICK_START.md)** - Overview and next steps
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Step-by-step checklist
- **[CAPACITOR_SETUP.md](./CAPACITOR_SETUP.md)** - Comprehensive setup guide

### For Understanding
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was implemented
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
- **[supabase/functions/README.md](./supabase/functions/README.md)** - Edge Functions guide

---

## 🔧 Common Commands

```bash
# Build web assets
npm run build

# Sync to all platforms
npm run cap:sync

# Open in Xcode (iOS)
npm run cap:run:ios

# Open in Android Studio
npm run cap:run:android

# Deploy Edge Functions
supabase functions deploy send-push-notification
```

---

## 🆘 Need Help?

### iOS Won't Add?
If `npx cap add ios` fails with Ruby errors:
```bash
brew install ruby
gem install cocoapods
npx cap add ios
```
See [CAPACITOR_SETUP.md](./CAPACITOR_SETUP.md) for details.

### Build Errors?
```bash
# Clean and rebuild
npm run build
npx cap sync
```

### Push Notifications Not Working?
1. Check `google-services.json` is in `android/app/`
2. Verify Firebase Cloud Messaging API is enabled
3. Check Supabase Edge Function logs
4. Verify device token is saved in database

---

## 🎉 What's Next?

After completing the setup:

1. **Test thoroughly**
   - Sign in on mobile
   - Create test orders
   - Verify notifications arrive
   - Test notification tap navigation

2. **Customize (optional)**
   - Add app icons
   - Add splash screens
   - Customize notification sounds
   - Add more notification types

3. **Deploy to stores**
   - Create app store listings
   - Take screenshots
   - Submit for review
   - Wait for approval

---

## 📊 Project Status

| Component | Status | Action Required |
|-----------|--------|-----------------|
| Web App | ✅ Working | None |
| Capacitor | ✅ Installed | None |
| Android Platform | ✅ Ready | Add `google-services.json` |
| iOS Platform | ⚠️ Needs Setup | Fix Ruby, run `npx cap add ios` |
| Push Service | ✅ Coded | None |
| Database Schema | ✅ Created | Run migration |
| Edge Functions | ✅ Created | Deploy to Supabase |
| Firebase | ⬜ Not Set Up | Create project |
| Webhooks | ⬜ Not Set Up | Configure in Supabase |

---

## 🚦 Quick Decision Tree

**Do you have macOS?**
- ✅ Yes → Set up both iOS and Android
- ❌ No → Set up Android only

**Do you have Firebase account?**
- ✅ Yes → Use existing project or create new
- ❌ No → Create free account at firebase.google.com

**Do you have Apple Developer account?**
- ✅ Yes → You can deploy to App Store
- ❌ No → Sign up ($99/year) or skip iOS

**Do you have Google Play Developer account?**
- ✅ Yes → You can deploy to Play Store
- ❌ No → Sign up ($25 one-time) or skip Android

---

## 💡 Pro Tips

1. **Start with Android** - It's easier and doesn't require macOS
2. **Test on real devices** - Push notifications don't work on iOS simulator
3. **Use the checklist** - [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) helps track progress
4. **Read the logs** - Edge Function logs show what's happening
5. **Ask for help** - Check the documentation files for troubleshooting

---

## 🎯 Success Criteria

You'll know everything is working when:

1. ✅ App builds and runs on device
2. ✅ You can sign in
3. ✅ Notification permission is granted
4. ✅ Device token appears in `device_tokens` table
5. ✅ Creating an order triggers a notification
6. ✅ Tapping notification opens the app to the right screen

---

## 📞 Support Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **This Project's Docs**: See files listed above

---

## ⏱️ Time Estimates

- **Firebase Setup**: 15-30 minutes
- **Supabase Setup**: 10-20 minutes
- **Android Setup**: 15-30 minutes
- **iOS Setup**: 1-2 hours (first time)
- **Testing**: 30-60 minutes
- **App Store Submission**: 1-2 hours (per platform)

**Total**: 3-6 hours for complete setup and testing

---

## 🚀 Ready to Start?

1. ✅ Read this file (you're here!)
2. ⬜ Set up Firebase (15 minutes)
3. ⬜ Set up Supabase (10 minutes)
4. ⬜ Test on Android (5 minutes)
5. ⬜ (Optional) Set up iOS (1-2 hours)
6. ⬜ Deploy to app stores

**Let's go!** 🎉

Start with Firebase setup, then move to Supabase, then test on Android.

For detailed instructions, see [CAPACITOR_SETUP.md](./CAPACITOR_SETUP.md)

---

Good luck! You've got this! 💪

