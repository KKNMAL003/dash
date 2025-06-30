/*
  # Fix communication_logs table schema

  1. Changes to communication_logs table
    - Add `customer_id` column (foreign key to profiles)
    - Add `staff_id` column (nullable, foreign key to profiles)
    - Add `sender_type` and `is_read` columns for chat functionality
    - Copy existing `user_id` data to `customer_id`
    - Add proper foreign key constraints with expected names

  2. Security
    - Update RLS policies to work with new column names
*/

-- Add new columns to communication_logs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'communication_logs' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE communication_logs ADD COLUMN customer_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'communication_logs' AND column_name = 'staff_id'
  ) THEN
    ALTER TABLE communication_logs ADD COLUMN staff_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'communication_logs' AND column_name = 'sender_type'
  ) THEN
    ALTER TABLE communication_logs ADD COLUMN sender_type text DEFAULT 'customer';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'communication_logs' AND column_name = 'is_read'
  ) THEN
    ALTER TABLE communication_logs ADD COLUMN is_read boolean DEFAULT false;
  END IF;
END $$;

-- Copy existing user_id data to customer_id
UPDATE communication_logs SET customer_id = user_id WHERE customer_id IS NULL;

-- Make customer_id NOT NULL after copying data
ALTER TABLE communication_logs ALTER COLUMN customer_id SET NOT NULL;

-- Add check constraint for sender_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'communication_logs_sender_type_check'
  ) THEN
    ALTER TABLE communication_logs 
    ADD CONSTRAINT communication_logs_sender_type_check 
    CHECK (sender_type IN ('customer', 'staff'));
  END IF;
END $$;

-- Add foreign key constraints with the expected names
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'communication_logs_customer_id_fkey'
  ) THEN
    ALTER TABLE communication_logs 
    ADD CONSTRAINT communication_logs_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'communication_logs_staff_id_fkey'
  ) THEN
    ALTER TABLE communication_logs 
    ADD CONSTRAINT communication_logs_staff_id_fkey 
    FOREIGN KEY (staff_id) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update RLS policies to work with customer_id and staff_id
DROP POLICY IF EXISTS "Users can insert their own communications" ON communication_logs;
DROP POLICY IF EXISTS "Users can update their own communications" ON communication_logs;
DROP POLICY IF EXISTS "Users can view their own communications" ON communication_logs;
DROP POLICY IF EXISTS "Users can delete their own communications" ON communication_logs;
DROP POLICY IF EXISTS "Users can insert their own messages" ON communication_logs;

CREATE POLICY "Customers can insert their own communications"
  ON communication_logs
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = customer_id AND sender_type = 'customer');

CREATE POLICY "Staff can insert communications"
  ON communication_logs
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = staff_id AND sender_type = 'staff');

CREATE POLICY "Users can view their own communications"
  ON communication_logs
  FOR SELECT
  TO public
  USING (auth.uid() = customer_id OR auth.uid() = staff_id);

CREATE POLICY "Users can update their own communications"
  ON communication_logs
  FOR UPDATE
  TO public
  USING (auth.uid() = customer_id OR auth.uid() = staff_id);

CREATE POLICY "Users can delete their own communications"
  ON communication_logs
  FOR DELETE
  TO public
  USING (auth.uid() = customer_id OR auth.uid() = staff_id);