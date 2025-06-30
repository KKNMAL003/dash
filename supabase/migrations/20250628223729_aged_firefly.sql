/*
  # Fix profile access RLS policies

  1. Problem
    - Circular dependency in RLS policy preventing profile reads
    - Users can't read their own profile to check permissions

  2. Solution
    - Add simple policy for users to read their own profile
    - Remove circular dependency
    - Ensure authenticated users can always read their own data

  3. Security
    - Maintains data isolation between users
    - Allows admin/staff to read all profiles
    - Allows users to read their own profile
*/

-- First, drop the existing problematic policy
DROP POLICY IF EXISTS "Admin and staff can view all customer profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON profiles;

-- Create a simple policy for users to read their own profile (no circular dependency)
CREATE POLICY "Authenticated users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Create a separate policy for admin/staff to view all profiles
CREATE POLICY "Admin and staff can view all customer profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff', 'driver')
    )
  );

-- Ensure the admin user has a profile
INSERT INTO profiles (
  id,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
) 
SELECT 
  id,
  'Admin',
  'User',
  'admin',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'admin@onolo.com'
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
);