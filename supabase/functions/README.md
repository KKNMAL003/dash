# Supabase Edge Functions - Push Notifications

This directory contains Supabase Edge Functions for sending push notifications to the Onolo Admin mobile app.

## Functions

### 1. send-push-notification

**Purpose**: Main function to send FCM push notifications to device tokens.

**Endpoint**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-push-notification`

**Method**: POST

**Request Body**:
```json
{
  "title": "Notification Title",
  "body": "Notification body text",
  "data": {
    "type": "order_new",
    "order_id": "123"
  },
  "send_to_all_admins": true
}
```

Or send to specific users:
```json
{
  "title": "Notification Title",
  "body": "Notification body text",
  "user_ids": ["user-uuid-1", "user-uuid-2"]
}
```

**Response**:
```json
{
  "message": "Notifications sent",
  "sent": 5,
  "failed": 0,
  "total": 5
}
```

### 2. notify-new-order

**Purpose**: Triggered by database webhook when a new order is inserted.

**Endpoint**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-new-order`

**Trigger**: Database webhook on `orders` table INSERT

**Webhook Payload** (automatically sent by Supabase):
```json
{
  "type": "INSERT",
  "table": "orders",
  "record": {
    "id": "order-uuid",
    "order_number": "ORD-001",
    "customer_name": "John Doe",
    ...
  },
  "schema": "public",
  "old_record": null
}
```

**What it does**:
1. Receives webhook payload
2. Extracts order information
3. Calls `send-push-notification` function
4. Sends notification to all admin users

### 3. notify-new-message

**Purpose**: Triggered by database webhook when a new message is inserted.

**Endpoint**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-new-message`

**Trigger**: Database webhook on `communication_logs` table INSERT

**Webhook Payload** (automatically sent by Supabase):
```json
{
  "type": "INSERT",
  "table": "communication_logs",
  "record": {
    "id": "message-uuid",
    "message": "Hello, I need help",
    "sender_type": "customer",
    "conversation_id": "conv-uuid",
    ...
  },
  "schema": "public",
  "old_record": null
}
```

**What it does**:
1. Receives webhook payload
2. Checks if message is from customer (not admin)
3. Extracts message information
4. Calls `send-push-notification` function
5. Sends notification to all admin users

## Environment Variables

These must be set in Supabase Dashboard → Project Settings → Edge Functions → Secrets:

| Variable | Description | Example |
|----------|-------------|---------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase service account JSON | `{"type":"service_account",...}` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `onolo-admin-12345` |
| `SUPABASE_URL` | Auto-set by Supabase | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set by Supabase | `eyJ...` |

## Deployment

### Deploy All Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy all functions
supabase functions deploy send-push-notification
supabase functions deploy notify-new-order
supabase functions deploy notify-new-message
```

### Deploy Single Function

```bash
supabase functions deploy send-push-notification
```

### View Logs

```bash
# View logs for a specific function
supabase functions logs send-push-notification

# Follow logs in real-time
supabase functions logs send-push-notification --follow
```

## Testing

### Test send-push-notification Locally

```bash
# Start Supabase locally
supabase start

# Serve the function
supabase functions serve send-push-notification

# In another terminal, test it
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-push-notification' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "title": "Test Notification",
    "body": "This is a test",
    "send_to_all_admins": true
  }'
```

### Test in Production

```bash
curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-push-notification' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "title": "Production Test",
    "body": "Testing from production",
    "send_to_all_admins": true
  }'
```

## Database Webhooks Setup

### Webhook for New Orders

1. Go to Supabase Dashboard → Database → Webhooks
2. Click "Create a new hook"
3. Configure:
   - **Name**: `notify-new-order`
   - **Table**: `orders`
   - **Events**: Check "Insert"
   - **Type**: HTTP Request
   - **Method**: POST
   - **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-new-order`
   - **HTTP Headers**:
     ```
     Authorization: Bearer YOUR_SERVICE_ROLE_KEY
     Content-Type: application/json
     ```

### Webhook for New Messages

1. Go to Supabase Dashboard → Database → Webhooks
2. Click "Create a new hook"
3. Configure:
   - **Name**: `notify-new-message`
   - **Table**: `communication_logs` (or your messages table name)
   - **Events**: Check "Insert"
   - **Type**: HTTP Request
   - **Method**: POST
   - **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-new-message`
   - **HTTP Headers**:
     ```
     Authorization: Bearer YOUR_SERVICE_ROLE_KEY
     Content-Type: application/json
     ```

## How It Works

```
┌─────────────────┐
│  New Order      │
│  Created        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Database       │
│  Webhook        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  notify-new-    │
│  order function │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  send-push-     │
│  notification   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Query device_  │
│  tokens table   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Get FCM        │
│  access token   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Send to FCM    │
│  API            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FCM delivers   │
│  to devices     │
└─────────────────┘
```

## Notification Data Structure

### For New Orders

```json
{
  "title": "New Order Received",
  "body": "Order #ORD-001 from John Doe",
  "data": {
    "type": "order_new",
    "order_id": "uuid-here"
  }
}
```

When user taps notification, app navigates to: `/orders?id=uuid-here`

### For New Messages

```json
{
  "title": "New Message",
  "body": "Hello, I need help with my order",
  "data": {
    "type": "message_new",
    "message_id": "uuid-here",
    "conversation_id": "conv-uuid"
  }
}
```

When user taps notification, app navigates to: `/chat?id=uuid-here`

## Troubleshooting

### Function returns 500 error

- Check function logs: `supabase functions logs FUNCTION_NAME`
- Verify environment variables are set correctly
- Check Firebase service account JSON is valid

### Notifications not being sent

- Verify device tokens exist in `device_tokens` table
- Check that FCM API is enabled in Firebase Console
- Verify Firebase project ID is correct
- Check function logs for errors

### Webhook not triggering

- Verify webhook is enabled in Supabase Dashboard
- Check webhook URL is correct
- Verify service role key is correct in webhook headers
- Check database table name matches webhook configuration

### FCM authentication errors

- Verify `FIREBASE_SERVICE_ACCOUNT_JSON` is valid JSON
- Check that service account has FCM permissions
- Verify Firebase Cloud Messaging API is enabled

## Security Notes

- Never expose your service role key in client-side code
- Database webhooks use service role key for authentication
- Edge Functions use RLS policies when querying database
- Device tokens are protected by RLS policies

## Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase Database Webhooks Docs](https://supabase.com/docs/guides/database/webhooks)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [FCM HTTP v1 API Reference](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)

