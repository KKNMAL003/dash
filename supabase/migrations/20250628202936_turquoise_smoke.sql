/*
  # Add role column to profiles table

  1. New Column
    - `role` (text) - User role with constraint for valid values
  
  2. Changes
    - Add role column with default value 'customer'
    - Add check constraint for valid role values
    - Update existing records to have default role
  
  3. Security
    - Maintains existing RLS policies
*/

-- Add role column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'customer';
  END IF;
END $$;

-- Add check constraint for role values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role = ANY (ARRAY['admin'::text, 'staff'::text, 'driver'::text, 'customer'::text]));
  END IF;
END $$;

-- Update any existing NULL roles to 'customer'
UPDATE profiles SET role = 'customer' WHERE role IS NULL;