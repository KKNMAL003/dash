# 🚀 Webhook Setup - Quick Reference Card

## 📋 What You Need

1. **Service Role Key** - Get it from: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/settings/api
2. **Webhook Configuration Page** - Already open in your browser

---

## ⚡ Quick Setup (5 Minutes)

### Webhook 1: New Orders

| Field | Value |
|-------|-------|
| **Name** | `notify-new-order` |
| **Table** | `orders` |
| **Events** | ✅ Insert only |
| **Type** | HTTP Request |
| **Method** | POST |
| **URL** | `https://lnnqoejqgdmwadtzwuix.supabase.co/functions/v1/notify-new-order` |
| **Headers** | See below ⬇️ |

**HTTP Headers:**
```
Authorization: Bearer YOUR_SERVICE_ROLE_KEY
Content-Type: application/json
```

---

### Webhook 2: New Messages

| Field | Value |
|-------|-------|
| **Name** | `notify-new-message` |
| **Table** | `communication_logs` |
| **Events** | ✅ Insert only |
| **Type** | HTTP Request |
| **Method** | POST |
| **URL** | `https://lnnqoejqgdmwadtzwuix.supabase.co/functions/v1/notify-new-message` |
| **Headers** | See below ⬇️ |

**HTTP Headers:**
```
Authorization: Bearer YOUR_SERVICE_ROLE_KEY
Content-Type: application/json
```

---

## ✅ Verification

After creating both webhooks:

1. **Check they appear** in the hooks list
2. **Ensure they're enabled** (toggle ON)
3. **Test with a new order** - should trigger notification
4. **Test with a new message** - should trigger notification

---

## 🔗 Quick Links

- **Database Hooks:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/database/hooks
- **Get Service Role Key:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/settings/api
- **Edge Functions:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions
- **Function Logs (notify-new-order):** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions/notify-new-order/logs
- **Function Logs (notify-new-message):** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions/notify-new-message/logs

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Error | Check Service Role Key is correct |
| 500 Error | Check Edge Function logs for details |
| No notification | Verify Firebase secrets are set |
| Webhook not firing | Ensure "Insert" event is checked |

---

## 📝 Notes

- Replace `YOUR_SERVICE_ROLE_KEY` with your actual key
- Keep the Service Role Key secret!
- Webhooks trigger automatically on INSERT
- Only customer messages trigger notifications (not staff messages)
- All admin users receive notifications

---

**Need detailed instructions?** See `WEBHOOK_SETUP.md`

