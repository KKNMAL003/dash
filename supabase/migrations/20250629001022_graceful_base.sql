/*
  # Create customer profiles for existing auth users

  1. New profiles for existing auth users
    - Creates profiles for the 3 customer users visible in the auth table
    - Sets their role to 'customer'
    - Uses email to match auth.users records

  2. Important Notes
    - This migration ensures profiles exist for actual auth users
    - Removes any dummy/test data that doesn't correspond to real users
*/

-- First, let's clean up any existing profiles that don't correspond to real auth users
DELETE FROM profiles WHERE id NOT IN (SELECT id FROM auth.users);

-- Insert profiles for the real auth users with customer role
-- We'll use INSERT ... ON CONFLICT to handle cases where profiles might already exist
INSERT INTO profiles (id, first_name, last_name, role, created_at, updated_at)
SELECT 
  au.id,
  CASE 
    WHEN au.email = 'selakekana@hotmail.com' THEN 'Malesela'
    WHEN au.email = 'sela.kekana@gmail.com' THEN 'Sela'
    WHEN au.email = 'info19music@gmail.com' THEN 'Info'
    ELSE 'Customer'
  END as first_name,
  CASE 
    WHEN au.email = 'selakekana@hotmail.com' THEN 'Kekana'
    WHEN au.email = 'sela.kekana@gmail.com' THEN 'Kekana'
    WHEN au.email = 'info19music@gmail.com' THEN 'Music'
    ELSE 'User'
  END as last_name,
  CASE 
    WHEN au.email = 'admin@onolo.com' THEN 'admin'
    ELSE 'customer'
  END as role,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
WHERE au.email IN ('sela.kekana@gmail.com', 'info19music@gmail.com', 'selakekana@hotmail.com', 'admin@onolo.com')
ON CONFLICT (id) 
DO UPDATE SET 
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();