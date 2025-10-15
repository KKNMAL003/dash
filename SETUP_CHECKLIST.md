# Setup Checklist - Capacitor Mobile App with Push Notifications

Use this checklist to track your progress setting up the mobile app.

## ✅ Phase 1: Initial Setup (Already Done)

- [x] Capacitor installed and initialized
- [x] Android platform added
- [x] Push Notifications plugin installed
- [x] React app integrated with push service
- [x] Database schema created
- [x] Edge Functions created
- [x] NPM scripts added

## 📱 Phase 2: iOS Setup (macOS Required)

- [ ] Install Homebrew (if not installed)
- [ ] Install Ruby via Homebrew
- [ ] Install CocoaPods
- [ ] Run `npx cap add ios`
- [ ] Open project in Xcode: `npm run cap:open:ios`
- [ ] Add `GoogleService-Info.plist` to Xcode project
- [ ] Enable "Push Notifications" capability
- [ ] Enable "Background Modes" → "Remote notifications"
- [ ] Configure signing with Apple Developer account
- [ ] Add `pod 'FirebaseMessaging'` to Podfile
- [ ] Run `pod install` in `ios/App` directory
- [ ] Update `AppDelegate.swift` with Firebase code
- [ ] Create APNs Auth Key in Apple Developer Portal
- [ ] Upload APNs Auth Key to Firebase Console

## 🤖 Phase 3: Android Setup

- [ ] Verify `google-services.json` is in `android/app/`
- [ ] Open project in Android Studio: `npm run cap:open:android`
- [ ] Verify Firebase plugin is applied in build.gradle
- [ ] Configure notification channel (optional)
- [ ] Add notification icon (optional)
- [ ] Build and test on device/emulator

## 🔥 Phase 4: Firebase Setup

- [ ] Create Firebase project at https://console.firebase.google.com/
- [ ] Add Android app (package: `com.onolo.admin`)
- [ ] Download `google-services.json` for Android
- [ ] Add iOS app (bundle: `com.onolo.admin`)
- [ ] Download `GoogleService-Info.plist` for iOS
- [ ] Enable Firebase Cloud Messaging API
- [ ] Generate Firebase service account key
- [ ] Save service account JSON for Supabase

## 📊 Phase 5: Supabase Setup

- [ ] Run database migration (`device_tokens.sql`)
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Login to Supabase: `supabase login`
- [ ] Link to project: `supabase link --project-ref YOUR_REF`
- [ ] Deploy Edge Function: `send-push-notification`
- [ ] Deploy Edge Function: `notify-new-order`
- [ ] Deploy Edge Function: `notify-new-message`
- [ ] Set secret: `FIREBASE_SERVICE_ACCOUNT_JSON`
- [ ] Set secret: `FIREBASE_PROJECT_ID`
- [ ] Create webhook for `orders` table
- [ ] Create webhook for `communication_logs` table

## 🧪 Phase 6: Testing

- [ ] Build web assets: `npm run build`
- [ ] Sync to platforms: `npm run cap:sync`
- [ ] Test on Android device
- [ ] Test on iOS device (real device, not simulator)
- [ ] Sign in with admin account
- [ ] Grant notification permissions
- [ ] Verify device token saved in Supabase
- [ ] Create test order
- [ ] Receive push notification for new order
- [ ] Create test message
- [ ] Receive push notification for new message
- [ ] Test notification tap navigation

## 🚀 Phase 7: Deployment

### iOS App Store
- [ ] Configure app in App Store Connect
- [ ] Create app screenshots
- [ ] Write app description
- [ ] Archive app in Xcode
- [ ] Upload to App Store Connect
- [ ] Submit for review
- [ ] Wait for approval
- [ ] Release to App Store

### Android Play Store
- [ ] Create app in Google Play Console
- [ ] Create app screenshots
- [ ] Write app description
- [ ] Generate signed bundle in Android Studio
- [ ] Upload AAB to Play Console
- [ ] Submit for review
- [ ] Wait for approval
- [ ] Release to Play Store

## 📝 Notes

### Important Commands

```bash
# Build and sync to all platforms
npm run cap:sync

# Build and open iOS in Xcode
npm run cap:run:ios

# Build and open Android in Android Studio
npm run cap:run:android

# Deploy Supabase Edge Functions
supabase functions deploy send-push-notification
supabase functions deploy notify-new-order
supabase functions deploy notify-new-message
```

### Important Files to Add (Not in Git)

- `android/app/google-services.json` - Firebase config for Android
- `ios/App/App/GoogleService-Info.plist` - Firebase config for iOS

### Environment Variables

Make sure these are set in Supabase Edge Functions:
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_PROJECT_ID`

### Troubleshooting

If you encounter issues:
1. Check `CAPACITOR_SETUP.md` for detailed instructions
2. Check console logs in Xcode/Android Studio
3. Check Supabase Edge Function logs
4. Verify Firebase configuration
5. Verify device tokens are being saved

---

## 🎯 Current Status

**What's Working:**
- ✅ Capacitor wrapper initialized
- ✅ Android platform ready
- ✅ Push notification code integrated
- ✅ Database schema ready
- ✅ Edge Functions ready

**What You Need to Do:**
1. Set up Firebase project
2. Configure iOS (if building for iOS)
3. Configure Android
4. Deploy Supabase Edge Functions
5. Test and deploy

---

## 📚 Resources

- [QUICK_START.md](./QUICK_START.md) - Quick overview
- [CAPACITOR_SETUP.md](./CAPACITOR_SETUP.md) - Detailed setup guide
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Supabase Docs](https://supabase.com/docs)

