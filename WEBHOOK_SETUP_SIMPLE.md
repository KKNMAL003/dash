# 🚀 Simple Webhook Setup Guide

## 📍 Correct Webhook URL
https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/integrations/webhooks/webhooks

---

## 🔑 Step 1: Get Your Service Role Key (1 minute)

1. Go to: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/settings/api
2. Find **"Service Role Key"** (under "Project API keys")
3. Click the eye icon to reveal it
4. Copy the entire key
5. **Keep it safe!** You'll need it for both webhooks

---

## 🎯 Step 2: Create Webhook #1 - New Orders (2 minutes)

The webhooks page is already open in your browser!

Click **"Create a new webhook"** or **"Enable Webhooks"** button

### Fill in these details:

**Webhook Configuration:**

| Field | Value |
|-------|-------|
| **Name** | `notify-new-order` |
| **Description** | Send push notification when new order is created |
| **Table** | `orders` |
| **Events** | ✅ Check **INSERT** only (uncheck UPDATE, DELETE) |
| **Type** | HTTP Request |
| **HTTP Method** | POST |

**HTTP Request Details:**

| Field | Value |
|-------|-------|
| **URL** | `https://lnnqoejqgdmwadtzwuix.supabase.co/functions/v1/notify-new-order` |

**HTTP Headers:**

Add these two headers:

**Header 1:**
- Key: `Authorization`
- Value: `Bearer YOUR_SERVICE_ROLE_KEY` (replace YOUR_SERVICE_ROLE_KEY with the actual key you copied)

**Header 2:**
- Key: `Content-Type`
- Value: `application/json`

**Example:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
Content-Type: application/json
```

Click **"Create"** or **"Save"**

---

## 🎯 Step 3: Create Webhook #2 - New Messages (2 minutes)

Click **"Create a new webhook"** again

### Fill in these details:

**Webhook Configuration:**

| Field | Value |
|-------|-------|
| **Name** | `notify-new-message` |
| **Description** | Send push notification when customer sends message |
| **Table** | `communication_logs` |
| **Events** | ✅ Check **INSERT** only (uncheck UPDATE, DELETE) |
| **Type** | HTTP Request |
| **HTTP Method** | POST |

**HTTP Request Details:**

| Field | Value |
|-------|-------|
| **URL** | `https://lnnqoejqgdmwadtzwuix.supabase.co/functions/v1/notify-new-message` |

**HTTP Headers:**

Add these two headers (same as before):

**Header 1:**
- Key: `Authorization`
- Value: `Bearer YOUR_SERVICE_ROLE_KEY` (same key as webhook #1)

**Header 2:**
- Key: `Content-Type`
- Value: `application/json`

Click **"Create"** or **"Save"**

---

## ✅ Step 4: Verify Webhooks (1 minute)

You should now see both webhooks in the list:

- ✅ `notify-new-order` - Table: orders - Event: INSERT
- ✅ `notify-new-message` - Table: communication_logs - Event: INSERT

Make sure both are **enabled** (toggle switch should be ON/green)

---

## 🧪 Step 5: Test the Webhooks (2 minutes)

### Test 1: New Order Notification

1. Go to your admin dashboard
2. Create a new test order
3. Wait a few seconds
4. Check if you received a push notification on your mobile device
5. If not, check the logs:
   - Webhook logs: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/integrations/webhooks/webhooks
   - Function logs: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions/notify-new-order/logs

### Test 2: New Message Notification

1. Create a test message from a customer account
2. Wait a few seconds
3. Check if you received a push notification
4. If not, check the logs (same as above)

---

## 🐛 Troubleshooting

### ❌ Webhook shows error in logs

**Check:**
1. Service Role Key is correct (no extra spaces)
2. Authorization header format: `Bearer YOUR_KEY` (note the space after "Bearer")
3. Edge Functions are deployed (check: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions)

### ❌ No notification received

**Check:**
1. Firebase secrets are configured: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/settings/functions
2. Device token is saved in `device_tokens` table
3. User is an admin (only admins receive notifications)
4. Mobile app has notification permissions granted
5. Firebase Cloud Messaging API is enabled

### ❌ Webhook not triggering

**Check:**
1. Webhook is enabled (toggle is ON)
2. Table name is exactly `orders` or `communication_logs`
3. INSERT event is checked
4. Test by creating a new record in the table

---

## 📊 What Should Happen

### When you create a new order:

```
1. Order inserted into database
   ↓
2. Webhook triggers notify-new-order function
   ↓
3. Function calls send-push-notification
   ↓
4. Notification sent to all admin devices
   ↓
5. 🔔 "New Order Received - Order #12345 from John Doe"
```

### When a customer sends a message:

```
1. Message inserted into database
   ↓
2. Webhook triggers notify-new-message function
   ↓
3. Function calls send-push-notification
   ↓
4. Notification sent to all admin devices
   ↓
5. 🔔 "New Message - John Doe: Hello, I need help..."
```

---

## 🔗 Quick Links

- **Webhooks Page:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/integrations/webhooks/webhooks
- **Get Service Role Key:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/settings/api
- **Edge Functions:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions
- **Function Secrets:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/settings/functions
- **notify-new-order Logs:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions/notify-new-order/logs
- **notify-new-message Logs:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions/notify-new-message/logs

---

## ⏱️ Total Time: ~8 minutes

- Get Service Role Key: 1 min
- Create webhook #1: 2 min
- Create webhook #2: 2 min
- Verify: 1 min
- Test: 2 min

---

## 🎉 You're Done!

Once both webhooks are created and tested successfully, your push notification system is fully operational!

**What works now:**
- ✅ New orders automatically notify all admins
- ✅ New customer messages automatically notify all admins
- ✅ Admins can respond immediately
- ✅ Real-time notifications on mobile devices

---

## 📝 Important Notes

1. **Service Role Key** - Keep it secret! Never expose in client-side code
2. **Only INSERT events** - Don't check UPDATE or DELETE unless you want notifications for those too
3. **Customer messages only** - The notify-new-message function filters for sender_type='customer'
4. **Admin users only** - Notifications are only sent to users with role='admin'

---

## 🆘 Need Help?

If something doesn't work:

1. Check webhook execution logs in the webhooks page
2. Check Edge Function logs (links above)
3. Verify Firebase secrets are set
4. Ensure device tokens are in the database
5. Test with a simple order/message first

Good luck! 🚀

