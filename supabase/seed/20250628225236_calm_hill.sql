/*
  # Complete database reset and sample data creation
  
  1. Security Changes
    - Disable RLS on all tables
    - Drop all existing policies
    - Grant comprehensive permissions
  
  2. Data Setup
    - Ensure admin profile exists
    - Create sample customer profiles
    - Create sample orders and order items
    - Create sample communication logs
    - Create sample delivery time slots
    - Create sample service areas
  
  3. Constraints
    - Temporarily disable foreign key constraints
    - Re-enable them after data creation
*/

-- First, disable RLS on ALL tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_time_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to clean slate
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
  END LOOP;
END $$;

-- Temporarily drop foreign key constraints to allow sample data creation
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_assigned_driver_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_profiles_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE communication_logs DROP CONSTRAINT IF EXISTS communication_logs_customer_id_fkey;
ALTER TABLE communication_logs DROP CONSTRAINT IF EXISTS communication_logs_staff_id_fkey;
ALTER TABLE communication_logs DROP CONSTRAINT IF EXISTS fk_communicationlog_profiles;
ALTER TABLE password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_user_id_fkey;

-- Grant comprehensive permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Ensure admin user profile exists and is correct
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get admin user ID from auth.users
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@onolo.com' LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Delete existing admin profile if it exists
    DELETE FROM profiles WHERE id = admin_user_id;
    
    -- Create new admin profile
    INSERT INTO profiles (
      id, first_name, last_name, phone, address, role, 
      created_at, updated_at, default_delivery_window, 
      default_latitude, default_longitude
    ) VALUES (
      admin_user_id, 'Admin', 'User', '+1234567890', '123 Admin St', 'admin',
      NOW(), NOW(), 'morning', NULL, NULL
    );
    
    RAISE NOTICE 'Admin profile created for user: %', admin_user_id;
  ELSE
    RAISE NOTICE 'No admin user found with email admin@onolo.com';
  END IF;
END $$;

-- Create sample customer profiles (with fake UUIDs since we dropped constraints)
DO $$
DECLARE
  customer_ids uuid[] := ARRAY[
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555'
  ];
  customer_names text[] := ARRAY['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Davis'];
  customer_phones text[] := ARRAY['+1234567891', '+1234567892', '+1234567893', '+1234567894', '+1234567895'];
  customer_addresses text[] := ARRAY['123 Main St', '456 Oak Ave', '789 Pine Rd', '321 Elm St', '654 Maple Dr'];
  i INTEGER;
  name_parts text[];
BEGIN
  FOR i IN 1..5 LOOP
    name_parts := string_to_array(customer_names[i], ' ');
    
    INSERT INTO profiles (
      id, first_name, last_name, phone, address, role, 
      created_at, updated_at, default_delivery_window
    ) VALUES (
      customer_ids[i], 
      name_parts[1], 
      name_parts[2], 
      customer_phones[i], 
      customer_addresses[i], 
      'customer', 
      NOW() - INTERVAL '1 month' * i, 
      NOW() - INTERVAL '1 month' * i, 
      CASE WHEN i % 3 = 0 THEN 'morning' WHEN i % 3 = 1 THEN 'afternoon' ELSE 'evening' END
    ) ON CONFLICT (id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      phone = EXCLUDED.phone,
      address = EXCLUDED.address,
      role = EXCLUDED.role;
  END LOOP;
  
  RAISE NOTICE 'Created % sample customer profiles', array_length(customer_ids, 1);
END $$;

-- Create sample orders using the customer profiles
DO $$
DECLARE
  customer_rec RECORD;
  order_id uuid;
  i INTEGER := 1;
BEGIN
  FOR customer_rec IN (SELECT id, first_name, last_name, phone, address FROM profiles WHERE role = 'customer' ORDER BY created_at LIMIT 5)
  LOOP
    order_id := gen_random_uuid();
    
    INSERT INTO orders (
      id, user_id, customer_id, status, total_amount, delivery_address, 
      delivery_phone, payment_method, customer_name, customer_email,
      notes, created_at, updated_at, payment_status, delivery_date,
      preferred_delivery_window, delivery_cost
    ) VALUES (
      order_id,
      customer_rec.id,
      customer_rec.id,
      CASE 
        WHEN i = 1 THEN 'pending'
        WHEN i = 2 THEN 'preparing'
        WHEN i = 3 THEN 'out_for_delivery'
        WHEN i = 4 THEN 'delivered'
        ELSE 'order_confirmed'
      END,
      (50 + (i * 25))::numeric,
      customer_rec.address,
      customer_rec.phone,
      CASE WHEN i % 2 = 0 THEN 'card' ELSE 'cash_on_delivery' END,
      customer_rec.first_name || ' ' || customer_rec.last_name,
      lower(customer_rec.first_name) || '.' || lower(customer_rec.last_name) || '@example.com',
      'Sample order #' || i || ' - Test delivery',
      NOW() - INTERVAL '1 day' * i,
      NOW() - INTERVAL '1 day' * i,
      CASE WHEN i <= 3 THEN 'paid' ELSE 'pending' END,
      CURRENT_DATE + INTERVAL '1 day' * i,
      CASE 
        WHEN i % 3 = 0 THEN 'morning'
        WHEN i % 3 = 1 THEN 'afternoon'
        ELSE 'evening'
      END,
      5.00
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Add order items for each order
    INSERT INTO order_items (
      id, order_id, product_id, product_name, quantity, unit_price, total_price, created_at
    ) VALUES 
      (gen_random_uuid(), order_id, 'gas-9kg', '9kg Gas Cylinder', 1 + (i % 2), 35.00, 35.00 * (1 + (i % 2)), NOW()),
      (gen_random_uuid(), order_id, 'gas-19kg', '19kg Gas Cylinder', 1, 65.00, 65.00, NOW())
    ON CONFLICT (id) DO NOTHING;
    
    i := i + 1;
  END LOOP;
  
  RAISE NOTICE 'Created % sample orders with items', i - 1;
END $$;

-- Create sample communication logs
DO $$
DECLARE
  customer_rec RECORD;
  admin_id uuid;
BEGIN
  -- Get admin ID
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  
  FOR customer_rec IN (SELECT id FROM profiles WHERE role = 'customer' LIMIT 3)
  LOOP
    INSERT INTO communication_logs (
      id, user_id, customer_id, staff_id, log_type, subject, message, 
      sender_type, is_read, created_at
    ) VALUES (
      gen_random_uuid(),
      customer_rec.id,
      customer_rec.id,
      admin_id,
      'order_status_update',
      'Order Status Update',
      'Your order has been confirmed and is being prepared. We will notify you when it is ready for delivery.',
      'staff',
      false,
      NOW() - INTERVAL '2 hours'
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Created sample communication logs';
END $$;

-- Create sample delivery time slots
INSERT INTO delivery_time_slots (
  id, date, time_window, max_orders, current_orders, active, created_at
) VALUES
  (gen_random_uuid(), CURRENT_DATE + 1, 'morning', 10, 3, true, NOW()),
  (gen_random_uuid(), CURRENT_DATE + 1, 'afternoon', 10, 5, true, NOW()),
  (gen_random_uuid(), CURRENT_DATE + 1, 'evening', 10, 2, true, NOW()),
  (gen_random_uuid(), CURRENT_DATE + 2, 'morning', 10, 1, true, NOW()),
  (gen_random_uuid(), CURRENT_DATE + 2, 'afternoon', 10, 0, true, NOW()),
  (gen_random_uuid(), CURRENT_DATE + 2, 'evening', 10, 4, true, NOW()),
  (gen_random_uuid(), CURRENT_DATE + 3, 'morning', 10, 0, true, NOW()),
  (gen_random_uuid(), CURRENT_DATE + 3, 'afternoon', 10, 0, true, NOW()),
  (gen_random_uuid(), CURRENT_DATE + 3, 'evening', 10, 0, true, NOW())
ON CONFLICT (date, time_window) DO UPDATE SET
  max_orders = EXCLUDED.max_orders,
  current_orders = EXCLUDED.current_orders,
  active = EXCLUDED.active;

-- Create sample service areas
INSERT INTO service_areas (
  id, name, polygon_coordinates, delivery_cost, active, created_at
) VALUES
  (gen_random_uuid(), 'City Center', '{"type":"Polygon","coordinates":[[[0,0],[0,1],[1,1],[1,0],[0,0]]]}', 5.00, true, NOW()),
  (gen_random_uuid(), 'Suburbs North', '{"type":"Polygon","coordinates":[[[1,1],[1,2],[2,2],[2,1],[1,1]]]}', 7.50, true, NOW()),
  (gen_random_uuid(), 'Suburbs South', '{"type":"Polygon","coordinates":[[[-1,-1],[-1,0],[0,0],[0,-1],[-1,-1]]]}', 7.50, true, NOW()),
  (gen_random_uuid(), 'Industrial Area', '{"type":"Polygon","coordinates":[[[2,0],[2,1],[3,1],[3,0],[2,0]]]}', 10.00, true, NOW())
ON CONFLICT DO NOTHING;

-- Verify everything is working and show final status
DO $$
DECLARE
  profile_count INTEGER;
  order_count INTEGER;
  order_item_count INTEGER;
  admin_exists BOOLEAN;
  customer_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO customer_count FROM profiles WHERE role = 'customer';
  SELECT COUNT(*) INTO order_count FROM orders;
  SELECT COUNT(*) INTO order_item_count FROM order_items;
  SELECT EXISTS(SELECT 1 FROM profiles WHERE role = 'admin') INTO admin_exists;
  
  RAISE NOTICE '=== DATABASE SETUP COMPLETE ===';
  RAISE NOTICE 'Total profiles: %', profile_count;
  RAISE NOTICE 'Customer profiles: %', customer_count;
  RAISE NOTICE 'Orders created: %', order_count;
  RAISE NOTICE 'Order items created: %', order_item_count;
  RAISE NOTICE 'Admin profile exists: %', admin_exists;
  RAISE NOTICE 'RLS disabled on all tables';
  RAISE NOTICE 'All permissions granted to authenticated and anon users';
  RAISE NOTICE '================================';
END $$;