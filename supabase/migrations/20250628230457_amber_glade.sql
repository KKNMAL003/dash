/*
  # Fix foreign key constraint violation in profiles table

  1. Changes
     - Remove sample customer profile insertions that use random UUIDs
     - Only ensure admin user profile exists if admin user is in auth.users
     - Rely on handle_new_user trigger for creating customer profiles

  2. Security
     - Maintains existing RLS policies
     - Uses proper foreign key relationships
*/

-- Ensure admin user has a profile if they exist in auth.users
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get admin user ID if they exist
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@onolo.com' 
  LIMIT 1;
  
  -- Only create profile if admin user exists in auth.users
  IF admin_user_id IS NOT NULL THEN
    -- Create or update admin profile
    INSERT INTO profiles (
      id,
      first_name,
      last_name,
      role,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'Admin',
      'User',
      'admin',
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      first_name = 'Admin',
      last_name = 'User',
      updated_at = NOW();
    
    RAISE NOTICE 'Admin profile ensured for user: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user not found in auth.users - profile not created';
  END IF;
END $$;

-- Note: Customer profiles will be created automatically by the handle_new_user trigger
-- when users register through the authentication system.
-- This ensures proper foreign key relationships are maintained.