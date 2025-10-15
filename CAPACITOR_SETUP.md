# Capacitor Mobile App Setup Guide

This guide will help you complete the setup of the Onolo Admin Dashboard as a native mobile app for iOS and Android with push notifications.

## ✅ What's Already Done

- ✅ Capacitor initialized with iOS and Android platforms
- ✅ Push Notifications plugin installed and synced
- ✅ React app integrated with push notification service
- ✅ Database schema created for device tokens
- ✅ Supabase Edge Functions created for sending notifications
- ✅ Auth context updated to initialize push on login

## 📋 Prerequisites

### For iOS Development
- macOS with Xcode installed
- Apple Developer Account ($99/year)
- CocoaPods installed (`sudo gem install cocoapods`)

### For Android Development
- Android Studio installed
- Java Development Kit (JDK) 11 or higher

### For Both Platforms
- Firebase project (free)
- Supabase project (already configured)

---

## 🔥 Firebase Setup (Required for Both Platforms)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it "Onolo Admin" (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Add Android App to Firebase

1. In Firebase Console, click "Add app" → Android icon
2. **Android package name**: `com.onolo.admin` (must match `capacitor.config.ts`)
3. Download `google-services.json`
4. Place it in: `android/app/google-services.json`

### 3. Add iOS App to Firebase

1. In Firebase Console, click "Add app" → iOS icon
2. **iOS bundle ID**: `com.onolo.admin` (must match `capacitor.config.ts`)
3. Download `GoogleService-Info.plist`
4. You'll add this to Xcode later (see iOS setup below)

### 4. Get Firebase Service Account for Edge Functions

1. In Firebase Console, go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the entire JSON content
5. In Supabase Dashboard → Project Settings → Edge Functions → Secrets:
   - Add secret: `FIREBASE_SERVICE_ACCOUNT_JSON` = (paste the JSON content)
   - Add secret: `FIREBASE_PROJECT_ID` = (your Firebase project ID, e.g., "onolo-admin-12345")

### 5. Enable Firebase Cloud Messaging API

1. In Firebase Console, go to Project Settings → Cloud Messaging
2. Under "Cloud Messaging API (V1)", click "Manage API in Google Cloud Console"
3. Click "Enable" if not already enabled

---

## 🍎 iOS Setup

### 1. Fix Ruby/CocoaPods Issue (if needed)

If you got a Ruby permission error when running `npx cap add ios`, fix it:

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Ruby via Homebrew
brew install ruby

# Add to your PATH (add to ~/.zshrc or ~/.bash_profile)
export PATH="/usr/local/opt/ruby/bin:$PATH"

# Install CocoaPods
gem install cocoapods
```

### 2. Add iOS Platform

```bash
npx cap add ios
```

### 3. Open iOS Project in Xcode

```bash
npx cap open ios
```

### 4. Configure iOS Project in Xcode

#### A. Add GoogleService-Info.plist
1. In Xcode, right-click on "App" folder
2. Select "Add Files to 'App'..."
3. Select the `GoogleService-Info.plist` you downloaded from Firebase
4. Check "Copy items if needed"
5. Click "Add"

#### B. Enable Push Notifications Capability
1. Select the "App" target
2. Go to "Signing & Capabilities" tab
3. Click "+ Capability"
4. Add "Push Notifications"
5. Add "Background Modes" and check "Remote notifications"

#### C. Configure Signing
1. In "Signing & Capabilities" tab
2. Select your Team (Apple Developer Account)
3. Xcode will automatically create a provisioning profile

### 5. Install Firebase Messaging Pod

1. Open `ios/App/Podfile` in a text editor
2. Add this line inside the `target 'App' do` block:

```ruby
target 'App' do
  capacitor_pods
  # Add pods for desired Firebase products
  # https://firebase.google.com/docs/ios/setup#available-pods
  pod 'FirebaseMessaging'
end
```

3. Install the pod:

```bash
cd ios/App
pod install
cd ../..
```

### 6. Update AppDelegate.swift

1. Open `ios/App/App/AppDelegate.swift` in Xcode
2. Add Firebase import at the top:

```swift
import FirebaseCore
import FirebaseMessaging
```

3. Add Firebase configuration in `application(_:didFinishLaunchingWithOptions:)`:

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Configure Firebase
    FirebaseApp.configure()
    
    return true
}
```

4. Add these methods to handle push notifications:

```swift
func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Messaging.messaging().apnsToken = deviceToken
    Messaging.messaging().token { token, error in
        if let error = error {
            NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
        } else if let token = token {
            NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: token)
        }
    }
}

func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
}
```

### 7. Get APNs Auth Key and Upload to Firebase

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list)
2. Click "+" to create a new key
3. Name it "APNs Key" and check "Apple Push Notifications service (APNs)"
4. Click "Continue" → "Register" → "Download"
5. Save the `.p8` file securely
6. Note the Key ID

7. In Firebase Console → Project Settings → Cloud Messaging → Apple app configuration:
   - Upload the `.p8` file
   - Enter the Key ID
   - Enter your Team ID (found in Apple Developer Portal)

---

## 🤖 Android Setup

### 1. Open Android Project in Android Studio

```bash
npx cap open android
```

### 2. Verify google-services.json

Make sure `google-services.json` is in `android/app/` directory.

### 3. Update build.gradle Files (if needed)

The Capacitor setup should have already configured Firebase, but verify:

**android/build.gradle** should have:
```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.3.15'
}
```

**android/app/build.gradle** should have at the bottom:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### 4. Configure Notification Channel (Optional but Recommended)

Create `android/app/src/main/res/values/strings.xml` (if it doesn't exist):

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Onolo Admin</string>
    <string name="default_notification_channel_id">default</string>
    <string name="default_notification_channel_name">Default</string>
</resources>
```

### 5. Set Notification Icon (Optional)

Place your notification icon in:
- `android/app/src/main/res/drawable/ic_notification.png`

---

## 📊 Supabase Setup

### 1. Run Database Migration

Run the SQL migration to create the `device_tokens` table:

```bash
# If using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard → SQL Editor:
# Copy and paste the contents of supabase/migrations/device_tokens.sql
```

### 2. Deploy Edge Functions

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the functions
supabase functions deploy send-push-notification
supabase functions deploy notify-new-order
supabase functions deploy notify-new-message
```

### 3. Set Edge Function Secrets

In Supabase Dashboard → Project Settings → Edge Functions → Secrets, add:

- `FIREBASE_SERVICE_ACCOUNT_JSON`: Your Firebase service account JSON (from step 4 of Firebase setup)
- `FIREBASE_PROJECT_ID`: Your Firebase project ID

### 4. Configure Database Webhooks

In Supabase Dashboard → Database → Webhooks:

#### Webhook for New Orders
- **Name**: notify-new-order
- **Table**: orders
- **Events**: INSERT
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-new-order`
- **HTTP Headers**:
  - `Authorization`: `Bearer YOUR_SERVICE_ROLE_KEY`
  - `Content-Type`: `application/json`

#### Webhook for New Messages
- **Name**: notify-new-message
- **Table**: communication_logs (or your messages table)
- **Events**: INSERT
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-new-message`
- **HTTP Headers**:
  - `Authorization`: `Bearer YOUR_SERVICE_ROLE_KEY`
  - `Content-Type`: `application/json`

---

## 🏗️ Build and Test

### Build Web Assets

```bash
npm run build
```

### Sync to Native Platforms

```bash
npx cap sync
```

### Test on iOS

```bash
npx cap open ios
```

Then in Xcode:
1. Select a device or simulator
2. Click the "Play" button to build and run
3. Test push notifications on a **real device** (push doesn't work on simulator)

### Test on Android

```bash
npx cap open android
```

Then in Android Studio:
1. Select a device or emulator
2. Click the "Run" button
3. Test push notifications

---

## 📱 Testing Push Notifications

### 1. Test Device Registration

1. Build and run the app
2. Sign in with an admin account
3. Grant notification permissions when prompted
4. Check Supabase Dashboard → Table Editor → device_tokens
5. You should see a new row with your device token

### 2. Test Manual Notification

Use the Supabase SQL Editor or a REST client:

```sql
-- Call the Edge Function via SQL
SELECT
  net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-push-notification',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{"title": "Test", "body": "This is a test notification", "send_to_all_admins": true}'::jsonb
  );
```

### 3. Test Automatic Notifications

1. Create a new order in your system (from the user app)
2. The webhook should trigger automatically
3. All admin devices should receive a push notification

---

## 🚀 Deployment

### iOS App Store

1. In Xcode, select "Any iOS Device (arm64)"
2. Product → Archive
3. Once archived, click "Distribute App"
4. Follow the wizard to upload to App Store Connect
5. Submit for review in App Store Connect

### Android Play Store

1. In Android Studio, Build → Generate Signed Bundle / APK
2. Select "Android App Bundle"
3. Create or select a keystore
4. Build the release bundle
5. Upload the `.aab` file to Google Play Console
6. Submit for review

---

## 🔧 Troubleshooting

### iOS: "No valid 'aps-environment' entitlement"
- Make sure you've enabled Push Notifications capability in Xcode
- Rebuild the app

### Android: Notifications not received
- Check that google-services.json is in the correct location
- Verify Firebase Cloud Messaging API is enabled
- Check Android notification permissions are granted

### Token not saved to database
- Check browser/device console for errors
- Verify RLS policies on device_tokens table
- Ensure user is authenticated

### Edge Function errors
- Check Supabase Edge Function logs
- Verify environment variables are set correctly
- Test the function manually first

---

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Push Notifications Plugin](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Database Webhooks](https://supabase.com/docs/guides/database/webhooks)

---

## 🎉 You're Done!

Your admin dashboard is now a native mobile app with push notifications! Users will receive notifications when:
- New orders are placed
- New messages are received

The app can be installed from the App Store and Google Play Store.

