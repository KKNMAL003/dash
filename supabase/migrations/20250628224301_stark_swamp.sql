/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - Multiple overlapping SELECT policies on profiles table
    - Circular dependencies between profiles and orders tables
    - "profiles_read_authenticated" policy conflicts with other policies

  2. Solution
    - Drop all existing problematic policies
    - Create simple, non-recursive policies
    - Ensure clean separation between user access and admin access

  3. Security
    - Users can only read/update their own profile
    - Admins can read all profiles
    - No circular dependencies
*/

-- Drop all existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_modify_own" ON profiles;
DROP POLICY IF EXISTS "profiles_read_authenticated" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Create clean, simple policies without recursion

-- Allow users to read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to insert their own profile (for new user registration)
CREATE POLICY "profiles_insert_own"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admin users to read all profiles (using a simple role check)
-- This avoids recursion by checking the role directly from auth.jwt()
CREATE POLICY "profiles_admin_select_all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'admin@onolo.com'
    OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@onolo.com'
    )
  );

-- Allow admin users to update all profiles
CREATE POLICY "profiles_admin_update_all"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'admin@onolo.com'
    OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@onolo.com'
    )
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@onolo.com'
    OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@onolo.com'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;