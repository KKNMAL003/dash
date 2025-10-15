# Architecture Overview - Onolo Admin Mobile App

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Devices                             │
│                                                                  │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   iOS Device     │              │  Android Device  │        │
│  │                  │              │                  │        │
│  │  Capacitor App   │              │  Capacitor App   │        │
│  │  (WKWebView)     │              │  (WebView)       │        │
│  │                  │              │                  │        │
│  │  React App       │              │  React App       │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                 │                   │
└───────────┼─────────────────────────────────┼───────────────────┘
            │                                 │
            │         HTTPS/WebSocket         │
            │                                 │
            ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Backend                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ PostgreSQL   │  │ Auth Service │  │ Realtime     │         │
│  │              │  │              │  │ (WebSocket)  │         │
│  │ • orders     │  │ • JWT tokens │  │              │         │
│  │ • messages   │  │ • RLS        │  │ • Live data  │         │
│  │ • profiles   │  │              │  │              │         │
│  │ • device_    │  │              │  │              │         │
│  │   tokens     │  │              │  │              │         │
│  └──────┬───────┘  └──────────────┘  └──────────────┘         │
│         │                                                       │
│         │ Database Webhooks                                    │
│         │                                                       │
│  ┌──────▼──────────────────────────────────────────────────┐  │
│  │           Supabase Edge Functions                        │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  send-push-notification                         │    │  │
│  │  │  • Query device tokens                          │    │  │
│  │  │  • Get FCM access token                         │    │  │
│  │  │  • Send to FCM API                              │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  notify-new-order                               │    │  │
│  │  │  • Triggered by orders INSERT webhook           │    │  │
│  │  │  • Calls send-push-notification                 │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  notify-new-message                             │    │  │
│  │  │  • Triggered by messages INSERT webhook         │    │  │
│  │  │  • Calls send-push-notification                 │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └───────────────────────────┬───────────────────────────────┘  │
└────────────────────────────────┼─────────────────────────────────┘
                                 │
                                 │ HTTPS (FCM HTTP v1 API)
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Firebase Cloud Messaging                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FCM Server                                              │  │
│  │  • Receives notification requests                        │  │
│  │  • Routes to appropriate platform                        │  │
│  │  • Handles delivery and retries                          │  │
│  └──────────────┬───────────────────────────┬───────────────┘  │
└─────────────────┼───────────────────────────┼───────────────────┘
                  │                           │
        ┌─────────▼─────────┐       ┌────────▼────────┐
        │  APNs (Apple)     │       │  FCM (Android)  │
        │  Push Notification│       │  Push Service   │
        │  Service          │       │                 │
        └─────────┬─────────┘       └────────┬────────┘
                  │                           │
                  ▼                           ▼
        ┌──────────────────┐        ┌──────────────────┐
        │  iOS Device      │        │  Android Device  │
        │  Notification    │        │  Notification    │
        └──────────────────┘        └──────────────────┘
```

## Data Flow Diagrams

### 1. User Sign-In Flow

```
┌─────────┐
│  User   │
│ Opens   │
│  App    │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ Enter Email &   │
│ Password        │
└────┬────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Supabase Auth                       │
│ • Verify credentials                │
│ • Generate JWT token                │
│ • Check admin role in profiles      │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ AuthContext.initializeAuth()        │
│ • Set user state                    │
│ • Set profile state                 │
│ • Call initPushNotifications()      │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ initPushNotifications()             │
│ • Check if native platform          │
│ • Request notification permissions  │
│ • Register with FCM                 │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Capacitor Push Plugin               │
│ • Request APNs/FCM token            │
│ • Fire 'registration' event         │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ saveDeviceToken()                   │
│ • Get platform (ios/android)        │
│ • Upsert to device_tokens table     │
└─────────────────────────────────────┘
```

### 2. New Order Notification Flow

```
┌─────────────┐
│ Customer    │
│ Places      │
│ Order       │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────┐
│ User App                         │
│ • Creates order in Supabase      │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Supabase Database                │
│ • INSERT into orders table       │
│ • Trigger webhook                │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Database Webhook                 │
│ • POST to notify-new-order       │
│ • Include order data             │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ notify-new-order Edge Function   │
│ • Extract order info             │
│ • Build notification payload     │
│ • Call send-push-notification    │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ send-push-notification Function  │
│ • Query device_tokens for admins │
│ • Get FCM access token           │
│ • Send to FCM API                │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Firebase Cloud Messaging         │
│ • Route to APNs (iOS)            │
│ • Route to FCM (Android)         │
│ • Deliver notifications          │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Admin Devices                    │
│ • Receive notification           │
│ • Show alert/banner              │
└──────┬───────────────────────────┘
       │
       ▼ (User taps notification)
┌──────────────────────────────────┐
│ handleNotificationTap()          │
│ • Extract order_id from data     │
│ • Navigate to /orders?id=xxx     │
└──────────────────────────────────┘
```

### 3. Device Token Management

```
┌─────────────────────────────────────────────────────────┐
│                    device_tokens Table                   │
│                                                          │
│  ┌────────┬──────────┬────────────┬──────────┬────────┐ │
│  │   id   │ user_id  │   token    │ platform │ dates  │ │
│  ├────────┼──────────┼────────────┼──────────┼────────┤ │
│  │ uuid-1 │ admin-1  │ fcm-tok-1  │   ios    │ ...    │ │
│  │ uuid-2 │ admin-1  │ fcm-tok-2  │ android  │ ...    │ │
│  │ uuid-3 │ admin-2  │ fcm-tok-3  │   ios    │ ...    │ │
│  └────────┴──────────┴────────────┴──────────┴────────┘ │
│                                                          │
│  RLS Policies:                                           │
│  • Users can INSERT/UPDATE/DELETE their own tokens      │
│  • Admins can SELECT all tokens                         │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### React App Structure

```
src/
├── main.tsx                          # Entry point
├── App.tsx                           # Root component
├── contexts/
│   └── AuthContext.tsx              # ✏️ Modified - Added push init
├── shared/
│   ├── services/
│   │   └── pushNotifications.ts     # ✨ New - Push service
│   ├── hooks/
│   │   ├── useNotifications.ts      # Unchanged - In-app notifications
│   │   └── useSettings.ts           # Unchanged
│   └── components/
│       └── ...                       # Unchanged
├── pages/
│   ├── DashboardPage.tsx            # Unchanged
│   ├── OrdersPage.tsx               # Unchanged
│   ├── ChatPage.tsx                 # Unchanged
│   └── ...                          # Unchanged
└── lib/
    └── supabase.ts                  # Unchanged
```

### Supabase Structure

```
supabase/
├── migrations/
│   └── device_tokens.sql            # ✨ New - Device tokens table
└── functions/
    ├── send-push-notification/
    │   └── index.ts                 # ✨ New - Main sender
    ├── notify-new-order/
    │   └── index.ts                 # ✨ New - Order webhook
    ├── notify-new-message/
    │   └── index.ts                 # ✨ New - Message webhook
    └── README.md                    # ✨ New - Documentation
```

### Native Platform Structure

```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       └── assets/
│   │           └── public/          # Web assets copied here
│   ├── build.gradle                 # ✅ Firebase plugin configured
│   └── google-services.json         # ⚠️ User needs to add
└── build.gradle                     # ✅ Firebase classpath added

ios/                                  # ⚠️ Needs to be created
└── App/
    ├── App/
    │   ├── public/                  # Web assets copied here
    │   ├── AppDelegate.swift        # Needs Firebase code
    │   └── GoogleService-Info.plist # User needs to add
    └── Podfile                      # Needs FirebaseMessaging pod
```

## Security Architecture

### Authentication Flow

```
┌──────────────┐
│   Client     │
│   (Mobile)   │
└──────┬───────┘
       │
       │ 1. Sign in with email/password
       │
       ▼
┌──────────────────────┐
│  Supabase Auth       │
│  • Verify password   │
│  • Generate JWT      │
└──────┬───────────────┘
       │
       │ 2. Return JWT token
       │
       ▼
┌──────────────────────┐
│  Client stores JWT   │
│  in secure storage   │
└──────┬───────────────┘
       │
       │ 3. All requests include JWT in Authorization header
       │
       ▼
┌──────────────────────┐
│  Supabase            │
│  • Verify JWT        │
│  • Apply RLS         │
│  • Return data       │
└──────────────────────┘
```

### Row Level Security (RLS)

```
device_tokens table:

Policy 1: "Users can manage their own device tokens"
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id)
  
  → Users can only INSERT/UPDATE/DELETE their own tokens

Policy 2: "Admins can read all device tokens"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  
  → Admin users can SELECT all tokens (needed for sending notifications)
```

## Notification Payload Structure

### FCM Message Format

```json
{
  "message": {
    "token": "device-fcm-token-here",
    "notification": {
      "title": "New Order Received",
      "body": "Order #ORD-001 from John Doe"
    },
    "data": {
      "type": "order_new",
      "order_id": "uuid-here"
    },
    "android": {
      "priority": "high",
      "notification": {
        "sound": "default",
        "channel_id": "default"
      }
    },
    "apns": {
      "payload": {
        "aps": {
          "sound": "default",
          "badge": 1
        }
      }
    }
  }
}
```

### Notification Types

| Type | Title | Body | Data | Navigation |
|------|-------|------|------|------------|
| `order_new` | "New Order Received" | "Order #XXX from {customer}" | `{type, order_id}` | `/orders?id={order_id}` |
| `message_new` | "New Message" | "{message preview}" | `{type, message_id, conversation_id}` | `/chat?id={message_id}` |

## Performance Considerations

### Optimization Strategies

1. **Device Token Caching**
   - Tokens stored in Supabase with `updated_at` timestamp
   - Only re-register if token changes
   - Upsert prevents duplicates

2. **Edge Function Efficiency**
   - Query only admin device tokens
   - Batch send to FCM (Promise.allSettled)
   - Return early if no tokens found

3. **Database Webhooks**
   - Async execution (doesn't block INSERT)
   - Retry logic built into Supabase
   - Timeout protection

4. **Mobile App**
   - Push service only initializes on native platforms
   - Listeners added once per session
   - Cleanup on sign out

## Scalability

### Current Limits

- **Supabase Edge Functions**: 500,000 invocations/month (free tier)
- **FCM**: Unlimited messages (free)
- **Database**: 500 MB (free tier)

### Scaling Strategy

1. **More Admins**
   - Current: O(n) where n = number of admin devices
   - Solution: Batch FCM sends (up to 500 tokens per request)

2. **More Notifications**
   - Current: One Edge Function call per order/message
   - Solution: Batch notifications (e.g., digest every 5 minutes)

3. **More Data**
   - Current: All device tokens queried on each send
   - Solution: Add indexes (already done), consider caching

## Monitoring and Logging

### What to Monitor

1. **Edge Function Logs**
   ```bash
   supabase functions logs send-push-notification --follow
   ```

2. **Database Webhook Status**
   - Check Supabase Dashboard → Database → Webhooks
   - View success/failure counts

3. **FCM Delivery Reports**
   - Firebase Console → Cloud Messaging → Reports
   - Track delivery rates

4. **Device Token Table**
   - Monitor growth
   - Clean up stale tokens (optional)

### Error Handling

```
Edge Function Error → Logged to Supabase
                   → Webhook retries (up to 3 times)
                   → Manual retry if needed

FCM Error → Logged to Edge Function
         → Invalid token → Remove from database
         → Temporary error → Retry
         → Permanent error → Log and skip
```

---

## Summary

This architecture provides:

✅ **Scalable** - Handles multiple admins and devices
✅ **Secure** - RLS policies, JWT auth, secret management
✅ **Reliable** - Webhook retries, error handling
✅ **Maintainable** - Clear separation of concerns
✅ **Extensible** - Easy to add new notification types
✅ **Cost-effective** - Uses free tiers of Supabase and FCM

The system is production-ready and follows best practices for mobile push notifications.

