# ✅ Push Notifications - Final Setup Checklist

## 🎯 Complete These Steps in Order

### ✅ COMPLETED - Edge Functions Deployed
- [x] send-push-notification deployed
- [x] notify-new-order deployed
- [x] notify-new-message deployed
- [x] Supabase CLI linked to project

**Status:** ✅ DONE

---

### ⬜ TODO #1: Configure Firebase Secrets (5 minutes)

**Go to:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/settings/functions

**Add these 2 secrets:**

- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON`
  - Get from: Firebase Console → Project Settings → Service Accounts → Generate new private key
  - Value: Paste the entire JSON file content

- [ ] `FIREBASE_PROJECT_ID`
  - Get from: Same JSON file, copy the `project_id` field
  - Value: Your Firebase project ID (e.g., `onolo-admin-12345`)

**How to add:**
1. Click "Add new secret"
2. Enter secret name
3. Paste secret value
4. Click "Save"
5. Repeat for second secret

---

### ⬜ TODO #2: Create Database Webhooks (5 minutes)

**Go to:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/integrations/webhooks/webhooks

**First, get your Service Role Key:**
- [ ] Go to: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/settings/api
- [ ] Copy the **Service Role Key**

**Create Webhook #1: New Orders**
- [ ] Click "Create a new webhook"
- [ ] Name: `notify-new-order`
- [ ] Table: `orders`
- [ ] Events: ✅ INSERT only
- [ ] Method: POST
- [ ] URL: `https://lnnqoejqgdmwadtzwuix.supabase.co/functions/v1/notify-new-order`
- [ ] Header 1: `Authorization` = `Bearer YOUR_SERVICE_ROLE_KEY`
- [ ] Header 2: `Content-Type` = `application/json`
- [ ] Click "Create"

**Create Webhook #2: New Messages**
- [ ] Click "Create a new webhook"
- [ ] Name: `notify-new-message`
- [ ] Table: `communication_logs`
- [ ] Events: ✅ INSERT only
- [ ] Method: POST
- [ ] URL: `https://lnnqoejqgdmwadtzwuix.supabase.co/functions/v1/notify-new-message`
- [ ] Header 1: `Authorization` = `Bearer YOUR_SERVICE_ROLE_KEY`
- [ ] Header 2: `Content-Type` = `application/json`
- [ ] Click "Create"

**Verify:**
- [ ] Both webhooks appear in the list
- [ ] Both webhooks are enabled (toggle ON)

---

### ⬜ TODO #3: Install TestFlight Build (5 minutes)

**Install on iOS Device:**
- [ ] Install TestFlight app from App Store
- [ ] Accept TestFlight invitation
- [ ] Install your admin app from TestFlight
- [ ] Launch the app
- [ ] Sign in as an admin user
- [ ] **Tap "Allow"** when notification permission prompt appears

**Verify Device Token:**
- [ ] Go to: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/editor
- [ ] Open `device_tokens` table
- [ ] Verify your device appears with `platform: ios`

**See detailed guide:** `TESTFLIGHT_TESTING_GUIDE.md`

---

### ⬜ TODO #4: Test the System (5 minutes)

**Test New Order Notification:**
- [ ] Have someone place an order in the live user app (OR use SQL insert)
- [ ] Wait 5-10 seconds
- [ ] Check if notification appears on your iOS device
- [ ] Notification should say: "New Order Received - Order #[number] from [name]"
- [ ] Tap the notification - should open orders screen
- [ ] If not working, check logs: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions/notify-new-order/logs

**Test New Message Notification:**
- [ ] Create a test message from a customer (use SQL insert)
- [ ] Wait 5-10 seconds
- [ ] Check if notification appears on your iOS device
- [ ] Notification should say: "New Message - [name]: [message preview]"
- [ ] Tap the notification - should open messages screen
- [ ] If not working, check logs: https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions/notify-new-message/logs

**SQL for Testing (if needed):**
```sql
-- Test order notification
INSERT INTO orders (customer_id, customer_name, customer_email, customer_phone, delivery_address, delivery_phone, total_amount, payment_method, payment_status, status, order_number)
VALUES ((SELECT id FROM profiles WHERE role = 'customer' LIMIT 1), 'Test Customer', 'test@example.com', '+1234567890', '123 Test St', '+1234567890', 150.00, 'cash_on_delivery', 'pending', 'pending', 'ORD-TEST-' || floor(random() * 10000)::text);

-- Test message notification
INSERT INTO communication_logs (customer_id, log_type, subject, message, sender_type)
VALUES ((SELECT id FROM profiles WHERE role = 'customer' LIMIT 1), 'general', 'Test Message', 'This is a test!', 'customer');
```

---

## 📊 Progress Tracker

```
[████████████████████████████░░░░░░░░░░░░] 60% Complete

✅ Edge Functions Deployed
⬜ Firebase Secrets Configured
⬜ Database Webhooks Created
⬜ TestFlight Build Installed
⬜ System Tested
```

---

## 🔗 All Important Links

### Configuration Pages
- **Firebase Secrets:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/settings/functions
- **Webhooks:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/integrations/webhooks/webhooks
- **Service Role Key:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/settings/api

### Monitoring Pages
- **Edge Functions:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions
- **notify-new-order Logs:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions/notify-new-order/logs
- **notify-new-message Logs:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions/notify-new-message/logs
- **send-push-notification Logs:** https://supabase.com/dashboard/project/lnnqoejqgdmwadtzwuix/functions/send-push-notification/logs

### External Services
- **Firebase Console:** https://console.firebase.google.com/

---

## 📚 Documentation Files

- **Simple Setup Guide:** `WEBHOOK_SETUP_SIMPLE.md` ⭐ START HERE
- **TestFlight Testing:** `TESTFLIGHT_TESTING_GUIDE.md` ⭐ FOR iOS TESTING
- **Detailed Setup Guide:** `WEBHOOK_SETUP.md`
- **Quick Reference:** `WEBHOOK_QUICK_REFERENCE.md`
- **Deployment Summary:** `DEPLOYMENT_COMPLETE.md`
- **Main Guide:** `START_HERE.md`

---

## ⏱️ Time Estimate

- **Firebase Secrets:** 5 minutes
- **Database Webhooks:** 5 minutes
- **TestFlight Install:** 5 minutes (if already uploaded)
- **Testing:** 5 minutes

**Total remaining:** ~20 minutes

---

## 🎯 Success Criteria

You'll know everything is working when:

- ✅ Firebase secrets show in Edge Functions settings
- ✅ Two webhooks appear in webhooks list
- ✅ Both webhooks are enabled
- ✅ Test order triggers notification on mobile
- ✅ Test message triggers notification on mobile
- ✅ Notifications show correct content
- ✅ Tapping notification navigates to correct screen

---

## 🐛 Common Issues

### Issue: Webhook returns 401 error
**Fix:** Check Service Role Key is correct (no extra spaces)

### Issue: Webhook returns 500 error
**Fix:** Check Edge Function logs for detailed error message

### Issue: No notification received
**Fix:** 
1. Verify Firebase secrets are set
2. Check device token exists in `device_tokens` table
3. Ensure user is admin
4. Verify Firebase Cloud Messaging API is enabled

### Issue: Webhook not triggering
**Fix:**
1. Ensure webhook is enabled
2. Check table name is correct
3. Verify INSERT event is checked

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs first** - Most errors show detailed messages
2. **Verify all secrets** - Make sure Firebase secrets and Service Role Key are correct
3. **Test incrementally** - Set up one webhook at a time
4. **Use the simple guide** - Follow `WEBHOOK_SETUP_SIMPLE.md` step by step

---

## 🎉 Next Steps After Completion

Once all checkboxes are ticked:

1. **Monitor for a few days** - Watch for any errors in logs
2. **Train your team** - Show admins how notifications work
3. **Customize notifications** - Modify Edge Functions for custom messages
4. **Add more triggers** - Create webhooks for other events if needed
5. **Deploy to production** - Build and release your mobile app

---

## 📝 Notes

- Keep your Service Role Key secret
- Only INSERT events trigger notifications
- Only customer messages trigger notifications (not staff messages)
- Only admin users receive notifications
- Webhooks fire automatically - no manual intervention needed

---

**Ready to start?** Open `WEBHOOK_SETUP_SIMPLE.md` and follow the steps! 🚀

