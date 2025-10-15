# Onolo Admin Dashboard

Admin dashboard for Onolo Group gas delivery service. Available as a web app and native mobile app (iOS & Android) with push notifications.

## 🚀 Quick Start

### Web Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Mobile Development

```bash
# Build and sync to mobile platforms
npm run cap:sync

# Open in Xcode (iOS)
npm run cap:run:ios

# Open in Android Studio (Android)
npm run cap:run:android
```

## 📱 Mobile App Setup

This project has been converted to a native mobile app using Capacitor with push notifications.

**Start here:**
1. Read [QUICK_START.md](./QUICK_START.md) for an overview
2. Follow [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) step by step
3. Refer to [CAPACITOR_SETUP.md](./CAPACITOR_SETUP.md) for detailed instructions

**Additional Documentation:**
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What was implemented
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and data flow
- [supabase/functions/README.md](./supabase/functions/README.md) - Edge Functions guide

## 🛠️ Tech Stack

### Frontend
- **React** 18.3.1 - UI framework
- **TypeScript** 5.5.3 - Type safety
- **Vite** 5.4.2 - Build tool
- **Tailwind CSS** 3.4.10 - Styling
- **React Router** 6.26.1 - Routing
- **React Query** 5.51.23 - Data fetching

### Mobile
- **Capacitor** 7.4.3 - Native wrapper
- **iOS** - via Capacitor + WKWebView
- **Android** - via Capacitor + WebView

### Backend
- **Supabase** - Database, Auth, Realtime, Edge Functions
- **Firebase Cloud Messaging** - Push notifications

## 📂 Project Structure

```
dash/
├── src/                          # React app source
│   ├── contexts/                 # React contexts (Auth, etc.)
│   ├── pages/                    # Page components
│   ├── shared/                   # Shared components, hooks, services
│   │   └── services/
│   │       └── pushNotifications.ts  # Push notification service
│   └── lib/                      # Utilities and configs
├── public/                       # Static assets
├── android/                      # Android native project
├── ios/                          # iOS native project (needs setup)
├── supabase/                     # Supabase migrations and functions
│   ├── migrations/               # Database migrations
│   └── functions/                # Edge Functions
├── dist/                         # Build output
└── docs/                         # Documentation
```

## 🔧 Available Scripts

### Development
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

### Mobile
- `npm run cap:sync` - Build and sync to all platforms
- `npm run cap:sync:ios` - Build and sync to iOS
- `npm run cap:sync:android` - Build and sync to Android
- `npm run cap:open:ios` - Open in Xcode
- `npm run cap:open:android` - Open in Android Studio
- `npm run cap:run:ios` - Build, sync, and open iOS
- `npm run cap:run:android` - Build, sync, and open Android

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Service Worker (keep false for mobile builds)
VITE_ENABLE_SW=false
VITE_SW_VERSION=1
```

## 🌐 Deployment

### Web (Netlify)
The web app is deployed to Netlify automatically on push to main branch.

### Mobile (App Stores)

**iOS App Store:**
1. Build in Xcode
2. Archive and upload to App Store Connect
3. Submit for review

**Android Play Store:**
1. Build signed bundle in Android Studio
2. Upload to Google Play Console
3. Submit for review

See [CAPACITOR_SETUP.md](./CAPACITOR_SETUP.md) for detailed deployment instructions.

## 📱 Features

### Web & Mobile
- ✅ Dashboard with analytics
- ✅ Order management
- ✅ Customer management
- ✅ Delivery tracking
- ✅ Real-time chat/messaging
- ✅ Settings and preferences
- ✅ Authentication and authorization

### Mobile Only
- ✅ Native iOS and Android apps
- ✅ Push notifications for new orders
- ✅ Push notifications for new messages
- ✅ App Store and Play Store distribution
- ✅ Offline-capable (via Capacitor)

## 🔔 Push Notifications

Push notifications are automatically sent when:
- A new order is placed
- A new message is received from a customer

Notifications are sent to all admin users who have:
- Signed in to the mobile app
- Granted notification permissions
- An active device token in the database

## 🆘 Support

For setup help and troubleshooting:
1. Check the documentation files listed above
2. Review [Capacitor docs](https://capacitorjs.com/docs)
3. Review [Firebase docs](https://firebase.google.com/docs)
4. Review [Supabase docs](https://supabase.com/docs)

## 📄 License

Private - Onolo Group

---

**Ready to get started?** → Read [QUICK_START.md](./QUICK_START.md)
