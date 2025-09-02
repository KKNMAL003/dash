-- Create Admin User Script for Onolo Group Admin Dashboard
-- Run this in your Supabase SQL Editor

-- Step 1: Create the admin user in auth.users (if not exists)
-- You'll need to do this through the Supabase Auth UI or use the admin API
-- For now, we'll assume you create a user with email: admin@onolo.com

-- Step 2: Insert/Update the admin profile
INSERT INTO profiles (
  id,
  first_name,
  last_name,
  phone,
  address,
  role,
  created_at,
  updated_at,
  default_delivery_window,
  default_latitude,
  default_longitude
) VALUES (
  -- Replace 'YOUR_ADMIN_USER_ID' with the actual UUID from auth.users
  'YOUR_ADMIN_USER_ID',
  'Admin',
  'User',
  '+1234567890',
  '123 Admin Street, City, State',
  'admin',
  NOW(),
  NOW(),
  '9:00 AM - 5:00 PM',
  40.7128,
  -74.0060
)
ON CONFLICT (id) 
DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  role = EXCLUDED.role,
  updated_at = NOW(),
  default_delivery_window = EXCLUDED.default_delivery_window,
  default_latitude = EXCLUDED.default_latitude,
  default_longitude = EXCLUDED.default_longitude;

-- Step 3: Grant necessary permissions (if using custom RLS policies)
-- This ensures the admin user can access all data
-- You may need to adjust these based on your specific RLS setup

-- Step 4: Verify the admin user was created
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.role,
  p.created_at,
  au.email,
  au.confirmed_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.role = 'admin';
