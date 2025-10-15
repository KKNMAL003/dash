# Firebase Configuration for Android

## ⚠️ Action Required

You need to add your Firebase configuration file here.

### Steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one)
3. Click on the Android icon to add an Android app
4. Enter package name: `com.onolo.admin`
5. Download the `google-services.json` file
6. Place it in this directory: `android/app/google-services.json`
7. Delete this instruction file

### File Location

The file should be placed at:
```
android/app/google-services.json
```

### Verification

After adding the file, you should see this message when building:
```
> Configure project :app
google-services.json found, applying google-services plugin
```

If you see this message instead, the file is missing:
```
google-services.json not found, google-services plugin not applied. Push Notifications won't work
```

### Security Note

The `google-services.json` file is added to `.gitignore` to prevent committing it to version control. You'll need to add it manually in each environment (development, staging, production).

---

For more details, see [CAPACITOR_SETUP.md](../../CAPACITOR_SETUP.md)

