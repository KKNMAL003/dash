# Quick Start Guide - Capacitor Mobile App

## 🎯 What's Been Done

Your Onolo Admin Dashboard has been converted to a **Progressive Web App (PWA)** wrapped with **Capacitor** for native iOS and Android deployment with **push notifications**.

### ✅ Completed Setup

1. **Capacitor Initialized**
   - Android platform added and ready
   - iOS platform ready (needs Ruby/CocoaPods fix - see below)
   - Configuration file created: `capacitor.config.ts`

2. **Push Notifications Plugin Installed**
   - `@capacitor/push-notifications` installed
   - Service created: `src/shared/services/pushNotifications.ts`
   - Integrated with AuthContext for automatic initialization

3. **Database Schema Created**
   - Migration file: `supabase/migrations/device_tokens.sql`
   - Table to store device tokens for push notifications
   - Row Level Security (RLS) policies configured

4. **Supabase Edge Functions Created**
   - `send-push-notification`: Main function to send FCM notifications
   - `notify-new-order`: Triggered by new order webhooks
   - `notify-new-message`: Triggered by new message webhooks

5. **NPM Scripts Added**
   - `npm run cap:sync` - Build and sync to all platforms
   - `npm run cap:run:ios` - Build, sync, and open in Xcode
   - `npm run cap:run:android` - Build, sync, and open in Android Studio

---

## 🚀 Next Steps (In Order)

### Step 1: Fix iOS Platform (macOS only)

If you're on macOS and want to build for iOS:

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Ruby via Homebrew
brew install ruby

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
echo 'export PATH="/usr/local/opt/ruby/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Install CocoaPods
gem install cocoapods

# Now add iOS platform
npx cap add ios
```

### Step 2: Firebase Setup

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Create a new project named "Onolo Admin"

2. **Add Android App**
   - Package name: `com.onolo.admin`
   - Download `google-services.json`
   - Place in: `android/app/google-services.json`

3. **Add iOS App** (if building for iOS)
   - Bundle ID: `com.onolo.admin`
   - Download `GoogleService-Info.plist`
   - You'll add this to Xcode later

4. **Get Service Account Key**
   - Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Save for Supabase Edge Functions setup

5. **Enable FCM API**
   - Firebase Console → Project Settings → Cloud Messaging
   - Click "Manage API in Google Cloud Console"
   - Enable "Firebase Cloud Messaging API"

### Step 3: Supabase Setup

1. **Run Database Migration**
   ```bash
   # In Supabase Dashboard → SQL Editor
   # Copy and paste contents of: supabase/migrations/device_tokens.sql
   ```

2. **Deploy Edge Functions**
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

3. **Set Edge Function Secrets**
   - Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Add: `FIREBASE_SERVICE_ACCOUNT_JSON` (paste the JSON from Firebase)
   - Add: `FIREBASE_PROJECT_ID` (your Firebase project ID)

4. **Configure Database Webhooks**
   - Supabase Dashboard → Database → Webhooks
   - Create webhook for `orders` table → INSERT → calls `notify-new-order`
   - Create webhook for `communication_logs` table → INSERT → calls `notify-new-message`

### Step 4: iOS Configuration (if building for iOS)

See detailed instructions in `CAPACITOR_SETUP.md` section "iOS Setup"

Key steps:
1. Open project: `npm run cap:open:ios`
2. Add `GoogleService-Info.plist` to Xcode
3. Enable Push Notifications capability
4. Add Firebase pod to Podfile
5. Update AppDelegate.swift
6. Upload APNs key to Firebase

### Step 5: Android Configuration

See detailed instructions in `CAPACITOR_SETUP.md` section "Android Setup"

Key steps:
1. Verify `google-services.json` is in `android/app/`
2. Open project: `npm run cap:open:android`
3. Build and test

---

## 🧪 Testing

### Test on Android

```bash
# Build, sync, and open in Android Studio
npm run cap:run:android

# Then click "Run" in Android Studio
```

### Test on iOS

```bash
# Build, sync, and open in Xcode
npm run cap:run:ios

# Then click "Play" in Xcode
# Note: Push notifications only work on real devices, not simulators
```

### Test Push Notifications

1. Sign in to the app with an admin account
2. Grant notification permissions
3. Check Supabase → device_tokens table for your token
4. Create a test order or message
5. You should receive a push notification!

---

## 📁 Important Files

### Configuration
- `capacitor.config.ts` - Capacitor configuration
- `android/app/google-services.json` - Firebase config for Android (you need to add this)
- `ios/App/App/GoogleService-Info.plist` - Firebase config for iOS (you need to add this)

### Code
- `src/shared/services/pushNotifications.ts` - Push notification service
- `src/contexts/AuthContext.tsx` - Updated to initialize push on login

### Database
- `supabase/migrations/device_tokens.sql` - Database schema for device tokens

### Edge Functions
- `supabase/functions/send-push-notification/index.ts` - Main notification sender
- `supabase/functions/notify-new-order/index.ts` - New order webhook handler
- `supabase/functions/notify-new-message/index.ts` - New message webhook handler

### Documentation
- `CAPACITOR_SETUP.md` - Detailed setup guide (READ THIS!)
- `QUICK_START.md` - This file

---

## 🔑 Key Concepts

### How It Works

1. **User signs in** → Push notifications initialized automatically
2. **Device token generated** → Saved to Supabase `device_tokens` table
3. **New order/message created** → Database webhook triggers Edge Function
4. **Edge Function** → Looks up admin device tokens → Sends FCM notification
5. **FCM** → Delivers to iOS (via APNs) and Android devices
6. **User taps notification** → App opens to relevant screen

### What Stays Unchanged

- ✅ Your React app code (no changes to components)
- ✅ Your Supabase realtime notifications (still work for in-app)
- ✅ Your web deployment (Netlify still works)
- ✅ Service worker (disabled for native builds, works for web PWA)

### What's New

- ✅ Native iOS and Android apps
- ✅ Push notifications when app is closed/backgrounded
- ✅ App Store and Play Store distribution capability

---

## 🆘 Need Help?

1. **Read the detailed guide**: `CAPACITOR_SETUP.md`
2. **Check Capacitor docs**: https://capacitorjs.com/docs
3. **Check Firebase docs**: https://firebase.google.com/docs/cloud-messaging
4. **Check Supabase docs**: https://supabase.com/docs

---

## 📝 Environment Variables

Make sure these are set in your `.env` file:

```bash
# Supabase (already configured)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Service Worker (keep disabled for native builds)
VITE_ENABLE_SW=false
```

---

## 🎉 Summary

You now have:
- ✅ A native mobile app wrapper (Capacitor)
- ✅ Push notification infrastructure (FCM + Supabase)
- ✅ Automatic notifications for new orders and messages
- ✅ Ready for App Store and Play Store submission

**Next**: Follow the steps above to complete Firebase and iOS/Android setup, then build and test!

