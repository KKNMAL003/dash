# iOS Build Setup for Onolo Admin

## Problem Summary

We attempted to use **EAS Build** (Expo Application Services) to build the iOS app, but encountered a fundamental incompatibility:

- **EAS Build** is designed exclusively for Expo/React Native projects
- **Onolo Admin** is a Vite/React web app wrapped with Capacitor (not React Native)
- EAS Build requires the `expo` package and tries to run `expo prebuild`, which doesn't work for Capacitor projects

### Failed Attempts:
1. ❌ Adding `expo` as dependency → caused peer dependency conflicts with React Native
2. ❌ Using EAS Generic workflow → still requires `expo` package
3. ❌ Custom prebuild commands → EAS wraps them with `npx expo` which breaks
4. ❌ Generating iOS project locally → Ruby/CocoaPods permission issues on macOS

## Recommended Solution: GitHub Actions

I've created a **GitHub Actions workflow** (`.github/workflows/ios-build.yml`) that will build the iOS app for free using GitHub's macOS runners.

### Setup Steps:

#### 1. Export Your Code Signing Certificate

On your Mac, open **Keychain Access**:

```bash
# Find your certificate: "iPhone Distribution: Malesela Kekana (LUHV7R927U)"
# Right-click → Export → Save as .p12 file with a password

# Convert to base64
base64 -i /path/to/certificate.p12 | pbcopy
```

#### 2. Export Your Provisioning Profile

```bash
# Download from EAS or Apple Developer Portal
# The profile is for: com.onolo.admin (Ad Hoc)
# Convert to base64
base64 -i /path/to/profile.mobileprovision | pbcopy
```

#### 3. Add GitHub Secrets

Go to: https://github.com/KKNMAL003/dash/settings/secrets/actions

Add these secrets:
- `IOS_DIST_CERT_P12_BASE64` - The base64 certificate (from step 1)
- `IOS_DIST_CERT_PASSWORD` - The password you set when exporting the .p12
- `IOS_PROVISIONING_PROFILE_BASE64` - The base64 provisioning profile (from step 2)

#### 4. Trigger the Build

```bash
# Push to the branch
git push origin eas-ios-generic

# Or manually trigger from GitHub Actions tab
```

#### 5. Download the IPA

Once the build completes:
1. Go to: https://github.com/KKNMAL003/dash/actions
2. Click on the latest workflow run
3. Download the `ios-app` artifact
4. Extract the `.ipa` file

### Installing on iPhone XS

#### Option A: Using Apple Configurator (Mac)
1. Install [Apple Configurator](https://apps.apple.com/app/apple-configurator/id1037126344)
2. Connect iPhone via USB
3. Drag the .ipa file onto the device

#### Option B: Using Diawi (Web)
1. Go to https://www.diawi.com/
2. Upload the .ipa file
3. Share the generated link with your iPhone
4. Open the link on iPhone and install

#### Option C: Using TestFlight (Requires App Store Connect)
1. Upload to App Store Connect
2. Add to TestFlight
3. Install via TestFlight app

## Alternative: Codemagic

If GitHub Actions doesn't work, **Codemagic** has excellent Capacitor support:

1. Sign up at https://codemagic.io/
2. Connect your GitHub repo
3. Use their Capacitor template
4. Configure code signing
5. Build and download

## Current Project State

### Files Created:
- `.github/workflows/ios-build.yml` - GitHub Actions workflow
- `scripts/ExportOptions.plist` - iOS export configuration
- `scripts/setup-ios.sh` - iOS project setup script
- `.npmrc` - npm configuration for legacy peer deps

### Configuration:
- **Bundle ID**: `com.onolo.admin`
- **Team ID**: `LUHV7R927U`
- **Distribution**: Ad Hoc (for iPhone XS: `00008020-000178D42686002E`)
- **Scheme**: `App`

### Branch:
- `eas-ios-generic` - Contains all iOS build configuration

## Next Steps

1. **Get code signing files** from EAS or Apple Developer Portal
2. **Add GitHub secrets** as described above
3. **Push to trigger build** or manually run workflow
4. **Download and install** the .ipa on iPhone XS
5. **Test push notifications** end-to-end

## Notes

- The GitHub Actions workflow runs on every push to `eas-ios-generic` or `main`
- You can also trigger it manually from the Actions tab
- Builds are free on GitHub (2,000 minutes/month for private repos, unlimited for public)
- The .ipa artifact is kept for 30 days

## Webhook Setup (After iOS App is Installed)

Once the app is installed and you can receive notifications, set up the database webhooks:

1. Go to: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/integrations/webhooks/webhooks
2. Create two webhooks as documented in `WEBHOOK_SETUP.md`
3. Test by having someone place an order from the live user app

---

**Questions?** Check the GitHub Actions logs for detailed build output.

