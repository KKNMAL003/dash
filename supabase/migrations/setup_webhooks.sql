-- ============================================================================
-- Database Webhooks Setup for Push Notifications
-- ============================================================================
-- This script sets up database triggers to call Edge Functions when:
-- 1. A new order is created (orders table INSERT)
-- 2. A new message is created (communication_logs table INSERT)
--
-- INSTRUCTIONS:
-- 1. Copy your Service Role Key from: Project Settings → API → Service Role Key
-- 2. Replace YOUR_SERVICE_ROLE_KEY below (line 25) with your actual key
-- 3. Run this entire script in the SQL Editor
-- ============================================================================

-- Enable the pg_net extension if not already enabled
-- This extension allows making HTTP requests from PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================================
-- CONFIGURATION - REPLACE THIS VALUE!
-- ============================================================================
-- Replace the value below with your actual Service Role Key
DO $$
DECLARE
  service_role_key text := 'YOUR_SERVICE_ROLE_KEY'; -- ⚠️ REPLACE THIS!
BEGIN
  -- Store the service role key in a secure way
  -- This will be used by the trigger functions
  PERFORM set_config('app.service_role_key', service_role_key, false);
END $$;

-- ============================================================================
-- WEBHOOK 1: Notify on New Order
-- ============================================================================
-- This webhook triggers when a new row is inserted into the orders table
-- It calls the notify-new-order Edge Function which sends push notifications
-- to all admin users about the new order

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS webhook_notify_new_order ON orders;
DROP FUNCTION IF EXISTS trigger_notify_new_order();

-- Create the trigger function
CREATE OR REPLACE FUNCTION trigger_notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  service_role_key text;
  project_url text := 'https://lnnqoejqgdmwadtzwuix.supabase.co';
BEGIN
  -- Get the service role key from configuration
  service_role_key := current_setting('app.service_role_key', true);

  -- If not set, try to get from environment or use placeholder
  IF service_role_key IS NULL OR service_role_key = 'YOUR_SERVICE_ROLE_KEY' THEN
    RAISE WARNING 'Service role key not configured! Please set it in the configuration section.';
    RETURN NEW;
  END IF;

  -- Make HTTP POST request to the Edge Function
  SELECT INTO request_id net.http_post(
    url := project_url || '/functions/v1/notify-new-order',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'orders',
      'record', row_to_json(NEW),
      'schema', 'public',
      'old_record', NULL
    )
  );

  -- Log the request (optional, for debugging)
  RAISE NOTICE 'Webhook triggered for new order: %, request_id: %', NEW.id, request_id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to trigger webhook for order %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER webhook_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_new_order();

COMMENT ON TRIGGER webhook_notify_new_order ON orders IS 
  'Triggers push notification to admins when a new order is created';

-- ============================================================================
-- WEBHOOK 2: Notify on New Message
-- ============================================================================
-- This webhook triggers when a new row is inserted into the communication_logs table
-- It calls the notify-new-message Edge Function which sends push notifications
-- to all admin users about the new message (only for customer messages)

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS webhook_notify_new_message ON communication_logs;
DROP FUNCTION IF EXISTS trigger_notify_new_message();

-- Create the trigger function
CREATE OR REPLACE FUNCTION trigger_notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  service_role_key text;
  project_url text := 'https://lnnqoejqgdmwadtzwuix.supabase.co';
BEGIN
  -- Get the service role key from configuration
  service_role_key := current_setting('app.service_role_key', true);

  -- If not set, try to get from environment or use placeholder
  IF service_role_key IS NULL OR service_role_key = 'YOUR_SERVICE_ROLE_KEY' THEN
    RAISE WARNING 'Service role key not configured! Please set it in the configuration section.';
    RETURN NEW;
  END IF;

  -- Only trigger for messages from customers (not staff/admin messages)
  IF NEW.sender_type = 'customer' THEN
    -- Make HTTP POST request to the Edge Function
    SELECT INTO request_id net.http_post(
      url := project_url || '/functions/v1/notify-new-message',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'type', 'INSERT',
        'table', 'communication_logs',
        'record', row_to_json(NEW),
        'schema', 'public',
        'old_record', NULL
      )
    );

    -- Log the request (optional, for debugging)
    RAISE NOTICE 'Webhook triggered for new message: %, request_id: %', NEW.id, request_id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to trigger webhook for message %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER webhook_notify_new_message
  AFTER INSERT ON communication_logs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_new_message();

COMMENT ON TRIGGER webhook_notify_new_message ON communication_logs IS 
  'Triggers push notification to admins when a new customer message is created';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the webhooks are set up correctly

-- Check if triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('webhook_notify_new_order', 'webhook_notify_new_message')
ORDER BY event_object_table, trigger_name;

-- Check if functions exist
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name IN ('trigger_notify_new_order', 'trigger_notify_new_message')
ORDER BY routine_name;

-- ============================================================================
-- TESTING
-- ============================================================================
-- After setting up webhooks, you can test them with these queries:

-- Test 1: Create a test order (will trigger notification)
-- Uncomment and modify with real data to test:
/*
INSERT INTO orders (
  customer_id,
  customer_name,
  customer_email,
  delivery_address,
  delivery_phone,
  total_amount,
  payment_method,
  status
) VALUES (
  (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1),
  'Test Customer',
  'test@example.com',
  '123 Test Street',
  '+1234567890',
  100.00,
  'cash_on_delivery',
  'pending'
);
*/

-- Test 2: Create a test message (will trigger notification)
-- Uncomment and modify with real data to test:
/*
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
  'This is a test message from a customer',
  'customer'
);
*/

-- ============================================================================
-- CLEANUP (if needed)
-- ============================================================================
-- Run these commands if you need to remove the webhooks:
/*
DROP TRIGGER IF EXISTS webhook_notify_new_order ON orders;
DROP TRIGGER IF EXISTS webhook_notify_new_message ON communication_logs;
DROP FUNCTION IF EXISTS trigger_notify_new_order();
DROP FUNCTION IF EXISTS trigger_notify_new_message();
*/

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. The pg_net extension is used to make HTTP requests from PostgreSQL
-- 2. Triggers fire AFTER INSERT to ensure the data is committed
-- 3. The service role key is stored in the function (keep it secure!)
-- 4. The Edge Functions handle the actual push notification logic
-- 5. Only customer messages trigger notifications (not staff messages)
-- 6. All admin users receive notifications for new orders and messages
--
-- For more information:
-- - Supabase Webhooks: https://supabase.com/docs/guides/database/webhooks
-- - pg_net Extension: https://github.com/supabase/pg_net
-- ============================================================================

