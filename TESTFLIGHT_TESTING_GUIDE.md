# 📱 TestFlight Testing Guide for Push Notifications

## ✅ Yes, TestFlight is Perfect for Testing!

TestFlight builds work perfectly for testing push notifications because:
- ✅ Real push notifications work (unlike iOS Simulator)
- ✅ Uses production APNs certificates
- ✅ Tests the full notification flow
- ✅ Easy to distribute to your team
- ✅ Approved quickly (usually within minutes)

---

## 🎯 Complete Testing Flow

### **Step 1: Build and Upload to TestFlight**

If you haven't already uploaded your app to TestFlight:

1. **Open Xcode:**
   ```bash
   npx cap open ios
   ```

2. **Select "Any iOS Device (arm64)" as the build target**

3. **Archive the app:**
   - Product → Archive
   - Wait for build to complete
   - Click "Distribute App"
   - Select "App Store Connect"
   - Upload

4. **Wait for processing** (usually 5-15 minutes)

5. **Submit for TestFlight review** (if first time)
   - Usually approved within minutes to a few hours

---

### **Step 2: Install TestFlight Build on iOS Device**

1. **Install TestFlight app** from App Store (if not already installed)

2. **Accept the TestFlight invitation** (sent to your email)

3. **Install your app** from TestFlight

4. **Launch the app**

---

### **Step 3: Enable Push Notifications**

When you first launch the app:

1. **Sign in as an admin user**
   - The app will automatically request notification permissions
   - **Tap "Allow"** when prompted

2. **Verify the device token is registered:**

   The app automatically:
   - Requests notification permissions
   - Registers with Apple Push Notification service (APNs)
   - Gets an FCM token from Firebase
   - Saves the token to Supabase `device_tokens` table

   You can verify this in Supabase:
   - Go to: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/editor
   - Open the `device_tokens` table
   - You should see a new row with:
     - `user_id`: Your admin user ID
     - `token`: The FCM token
     - `platform`: `ios`
     - `created_at`: Current timestamp

---

### **Step 4: Test Push Notifications**

Now that your device is registered, test the notifications:

#### **Option A: Test with Real Order from User App**

1. **Open your live user app** (the customer-facing app)
2. **Place a test order** as a customer
3. **Within 5-10 seconds**, you should receive a push notification on your TestFlight device
4. **Notification should say:** "New Order Received - Order #[number] from [customer name]"
5. **Tap the notification** - should open the orders screen in your admin app

#### **Option B: Test with SQL Insert**

If you want to test without using the user app:

1. **Go to SQL Editor:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/sql/new

2. **Run this SQL:**
   ```sql
   -- Insert a test order
   INSERT INTO orders (
     customer_id,
     customer_name,
     customer_email,
     customer_phone,
     delivery_address,
     delivery_phone,
     total_amount,
     payment_method,
     payment_status,
     status,
     order_number
   ) VALUES (
     (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1),
     'Test Customer',
     'test@example.com',
     '+1234567890',
     '123 Test Street, Test City',
     '+1234567890',
     150.00,
     'cash_on_delivery',
     'pending',
     'pending',
     'ORD-TEST-' || floor(random() * 10000)::text
   );
   ```

3. **Check your iOS device** - notification should appear!

#### **Option C: Test Message Notification**

1. **Go to SQL Editor:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/sql/new

2. **Run this SQL:**
   ```sql
   -- Insert a test customer message
   INSERT INTO communication_logs (
     customer_id,
     log_type,
     subject,
     message,
     sender_type
   ) VALUES (
     (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1),
     'general',
     'Test Message',
     'This is a test message to verify push notifications!',
     'customer'
   );
   ```

3. **Check your iOS device** - notification should appear!

---

## 🔍 Verifying Everything Works

### **Check 1: Device Token is Saved**

1. Go to: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/editor
2. Open `device_tokens` table
3. You should see your device with:
   - ✅ `platform`: `ios`
   - ✅ `token`: Long FCM token string
   - ✅ `user_id`: Your admin user ID

### **Check 2: Webhooks are Configured**

1. Go to: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/integrations/webhooks/webhooks
2. You should see:
   - ✅ `notify-new-order` webhook (enabled)
   - ✅ `notify-new-message` webhook (enabled)

### **Check 3: Firebase Secrets are Set**

1. Go to: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/settings/functions
2. You should see:
   - ✅ `FIREBASE_SERVICE_ACCOUNT_JSON`
   - ✅ `FIREBASE_PROJECT_ID`

### **Check 4: Edge Functions are Deployed**

1. Go to: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions
2. You should see:
   - ✅ `send-push-notification` (deployed)
   - ✅ `notify-new-order` (deployed)
   - ✅ `notify-new-message` (deployed)

---

## 🐛 Troubleshooting TestFlight Issues

### ❌ No notification permission prompt

**Possible causes:**
- You previously denied permissions
- App was already installed before

**Solution:**
1. Delete the app from your device
2. Go to Settings → Notifications → [Your App] → Delete
3. Reinstall from TestFlight
4. Launch and allow permissions

### ❌ Device token not saved to database

**Check the logs:**
1. Open Safari on your Mac
2. Connect your iOS device via USB
3. In Safari: Develop → [Your Device] → [Your App]
4. Check console for errors

**Common issues:**
- User is not signed in as admin
- Network connection issue
- RLS policy blocking insert

**Solution:**
```sql
-- Check if device token exists
SELECT * FROM device_tokens WHERE user_id = 'YOUR_USER_ID';

-- If not, check RLS policies
SELECT * FROM device_tokens; -- Should work if you're admin
```

### ❌ Notification not received

**Check in order:**

1. **Device token exists?**
   - Check `device_tokens` table

2. **Webhook triggered?**
   - Check: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/integrations/webhooks/webhooks
   - Click on webhook → View execution history

3. **Edge Function executed?**
   - Check: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions/notify-new-order/logs
   - Look for errors

4. **Firebase secrets configured?**
   - Check: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/settings/functions

5. **APNs key uploaded to Firebase?**
   - Go to Firebase Console → Project Settings → Cloud Messaging
   - Check if APNs Authentication Key is uploaded

### ❌ Notification received but app doesn't open correct screen

**Check the notification tap handler:**

The app should navigate based on notification data:
- Order notifications → `/orders?id={order_id}`
- Message notifications → `/chat?id={message_id}`

**Debug:**
1. Check console logs when tapping notification
2. Verify `data` field in notification payload
3. Check `handleNotificationTap()` function in `src/shared/services/pushNotifications.ts`

---

## 📊 What Should Happen (Complete Flow)

### **When a new order is created:**

```
1. Customer places order in user app
   ↓
2. Order inserted into Supabase `orders` table
   ↓
3. Database webhook triggers `notify-new-order` Edge Function
   ↓
4. Edge Function queries `device_tokens` for all admin users
   ↓
5. Edge Function calls `send-push-notification` with order details
   ↓
6. `send-push-notification` gets FCM access token
   ↓
7. Sends notification to Firebase Cloud Messaging
   ↓
8. FCM sends to Apple Push Notification service (APNs)
   ↓
9. APNs delivers to your iOS device
   ↓
10. 🔔 Notification appears on your TestFlight device!
   ↓
11. You tap the notification
   ↓
12. App opens to orders screen with the new order
```

---

## ✅ Success Checklist

After testing with TestFlight, verify:

- [ ] TestFlight app installed and working
- [ ] Admin app installed from TestFlight
- [ ] Signed in as admin user
- [ ] Notification permissions granted
- [ ] Device token saved in `device_tokens` table
- [ ] Platform shows as `ios`
- [ ] Test order triggers notification
- [ ] Notification shows correct order details
- [ ] Tapping notification opens orders screen
- [ ] Test message triggers notification
- [ ] Message notification shows correct content
- [ ] No errors in Edge Function logs
- [ ] No errors in webhook execution logs

---

## 🎯 Testing Multiple Devices

You can test with multiple iOS devices:

1. **Invite multiple testers** to TestFlight
2. **Each tester installs** the app
3. **Each tester signs in** as an admin
4. **Each device registers** its own token
5. **When order is created**, all admin devices get notified!

This tests the real-world scenario where multiple admins receive notifications.

---

## 📝 Important Notes

### **TestFlight vs Production**

- TestFlight uses the **same APNs certificates** as production
- Notifications work **exactly the same** as production
- Perfect for testing before App Store release

### **Token Expiration**

- FCM tokens can expire or change
- The app automatically updates tokens when they change
- Old tokens are replaced in the database (upsert on conflict)

### **Background Notifications**

- iOS delivers notifications even when app is closed
- Tapping notification launches the app
- App navigates to the correct screen based on notification data

---

## 🔗 Quick Links

- **TestFlight:** https://apps.apple.com/app/testflight/id899247664
- **Device Tokens Table:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/editor
- **Webhooks:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/integrations/webhooks/webhooks
- **Edge Functions:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions
- **Firebase Console:** https://console.firebase.google.com/
- **SQL Editor:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/sql/new

---

## 🎉 You're Ready!

TestFlight is the **perfect way** to test push notifications on iOS. Once you:

1. ✅ Upload build to TestFlight
2. ✅ Install on your device
3. ✅ Grant notification permissions
4. ✅ Configure webhooks and Firebase secrets

You'll have a **fully functional push notification system** that you can test with real orders from your live user app!

Good luck! 🚀

