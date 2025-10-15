# 🔔 Database Webhooks Setup Guide

This guide will help you configure database webhooks to automatically trigger push notifications when new orders or messages are created.

## 📋 Prerequisites

Before setting up webhooks, ensure:
- ✅ Edge Functions are deployed (send-push-notification, notify-new-order, notify-new-message)
- ✅ Firebase secrets are configured in Supabase (FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_PROJECT_ID)
- ✅ You have your Supabase Service Role Key

---

## 🔑 Step 1: Get Your Service Role Key

1. Go to: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/settings/api
2. Find **Service Role Key** (under "Project API keys")
3. Click to reveal and copy it
4. **⚠️ IMPORTANT:** Keep this key secret! Never expose it in client-side code.

---

## 🎯 Step 2: Configure Webhooks in Supabase Dashboard

### Option A: Using the Supabase Dashboard (Recommended)

#### Webhook 1: New Order Notifications

1. Go to: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/database/hooks
2. Click **"Create a new hook"** or **"Enable Webhooks"**
3. Configure the webhook:

   **Basic Settings:**
   - **Name:** `notify-new-order`
   - **Table:** `orders`
   - **Events:** Check ✅ **Insert** only
   - **Type:** HTTP Request
   - **Method:** POST

   **HTTP Request Settings:**
   - **URL:** `https://lnnqoejqgdmwadtzwuix.supabase.co/functions/v1/notify-new-order`
   
   **HTTP Headers:**
   ```
   Authorization: Bearer YOUR_SERVICE_ROLE_KEY
   Content-Type: application/json
   ```
   
   Replace `YOUR_SERVICE_ROLE_KEY` with the actual key from Step 1.

4. Click **"Create webhook"** or **"Confirm"**

---

#### Webhook 2: New Message Notifications

1. Still in: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/database/hooks
2. Click **"Create a new hook"** again
3. Configure the webhook:

   **Basic Settings:**
   - **Name:** `notify-new-message`
   - **Table:** `communication_logs`
   - **Events:** Check ✅ **Insert** only
   - **Type:** HTTP Request
   - **Method:** POST

   **HTTP Request Settings:**
   - **URL:** `https://lnnqoejqgdmwadtzwuix.supabase.co/functions/v1/notify-new-message`
   
   **HTTP Headers:**
   ```
   Authorization: Bearer YOUR_SERVICE_ROLE_KEY
   Content-Type: application/json
   ```
   
   Replace `YOUR_SERVICE_ROLE_KEY` with the actual key from Step 1.

4. Click **"Create webhook"** or **"Confirm"**

---

### Option B: Using SQL (Alternative Method)

If you prefer to set up webhooks using SQL, you can use the `pg_net` extension:

1. Go to: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/sql/new
2. Copy and paste the SQL from `supabase/migrations/setup_webhooks.sql` (see below)
3. Replace `YOUR_SERVICE_ROLE_KEY` with your actual service role key
4. Click **"Run"**

---

## 🧪 Step 3: Test Your Webhooks

### Test 1: New Order Notification

1. Go to your admin dashboard
2. Create a new test order
3. Check:
   - ✅ Edge Function logs: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions/notify-new-order/logs
   - ✅ Your mobile device should receive a push notification
   - ✅ Notification should say "New Order Received"

### Test 2: New Message Notification

1. Create a new message in the communication logs (from a customer)
2. Check:
   - ✅ Edge Function logs: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions/notify-new-message/logs
   - ✅ Your mobile device should receive a push notification
   - ✅ Notification should say "New Message"

---

## 📊 Monitoring & Debugging

### View Webhook Logs

1. Go to: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/database/hooks
2. Click on a webhook name
3. View the execution history and any errors

### View Edge Function Logs

**For notify-new-order:**
```bash
supabase functions logs notify-new-order --follow
```

**For notify-new-message:**
```bash
supabase functions logs notify-new-message --follow
```

**For send-push-notification:**
```bash
supabase functions logs send-push-notification --follow
```

### Common Issues

#### ❌ Webhook not triggering
- Check that the webhook is enabled
- Verify the table name is correct (`orders` or `communication_logs`)
- Ensure "Insert" event is checked

#### ❌ 401 Unauthorized Error
- Verify your Service Role Key is correct
- Check the Authorization header format: `Bearer YOUR_KEY`

#### ❌ 500 Internal Server Error
- Check Edge Function logs for detailed error messages
- Verify Firebase secrets are set correctly
- Ensure `FIREBASE_SERVICE_ACCOUNT_JSON` is valid JSON

#### ❌ Notifications not received
- Check that device tokens are saved in `device_tokens` table
- Verify Firebase Cloud Messaging API is enabled
- Check that the user is an admin (notifications only sent to admins)
- Verify the mobile app has notification permissions granted

---

## 🔄 Webhook Payload Structure

### What the webhook sends to your Edge Function:

```json
{
  "type": "INSERT",
  "table": "orders",
  "record": {
    "id": "order-uuid",
    "customer_name": "John Doe",
    "order_number": "ORD-12345",
    "total_amount": 150.00,
    ...
  },
  "schema": "public",
  "old_record": null
}
```

Your Edge Functions (`notify-new-order` and `notify-new-message`) parse this payload and call `send-push-notification` with the appropriate notification data.

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Both webhooks appear in the Database Hooks page
- [ ] Webhooks are enabled (toggle switch is ON)
- [ ] Service Role Key is correctly configured in headers
- [ ] Edge Functions are deployed and showing in Functions page
- [ ] Firebase secrets are set in Edge Functions settings
- [ ] Test order creates a notification
- [ ] Test message creates a notification
- [ ] Notifications appear on mobile device
- [ ] Tapping notification opens the correct screen in the app

---

## 🎉 Success!

Once all checks pass, your push notification system is fully operational!

**What happens now:**
1. 📱 New order created → Webhook triggers → All admin devices get notified
2. 💬 New customer message → Webhook triggers → All admin devices get notified
3. 🔔 Admins can respond immediately to orders and messages

---

## 📚 Additional Resources

- **Supabase Webhooks Docs:** https://supabase.com/docs/guides/database/webhooks
- **Edge Functions Docs:** https://supabase.com/docs/guides/functions
- **Firebase Cloud Messaging:** https://firebase.google.com/docs/cloud-messaging

---

## 🆘 Need Help?

If you encounter issues:

1. Check the Edge Function logs (most detailed error info)
2. Check the webhook execution history
3. Verify all secrets and keys are correct
4. Ensure Firebase Cloud Messaging API is enabled
5. Test with a simple notification first using the Supabase dashboard

---

**Quick Links:**
- [Database Hooks](https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/database/hooks)
- [Edge Functions](https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions)
- [API Settings](https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/settings/api)
- [Edge Function Secrets](https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/settings/functions)

