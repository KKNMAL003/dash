/*
  # Fix orders table schema

  1. Changes to orders table
    - Add `customer_id` column (foreign key to profiles)
    - Add `assigned_driver_id` column (nullable, foreign key to profiles)
    - Copy existing `user_id` data to `customer_id`
    - Add proper foreign key constraints with expected names

  2. Security
    - Update RLS policies to work with new column names
*/

-- Add new columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'assigned_driver_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN assigned_driver_id uuid;
  END IF;
END $$;

-- Copy existing user_id data to customer_id
UPDATE orders SET customer_id = user_id WHERE customer_id IS NULL;

-- Make customer_id NOT NULL after copying data
ALTER TABLE orders ALTER COLUMN customer_id SET NOT NULL;

-- Add foreign key constraints with the expected names
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_customer_id_fkey'
  ) THEN
    ALTER TABLE orders 
    ADD CONSTRAINT orders_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_assigned_driver_id_fkey'
  ) THEN
    ALTER TABLE orders 
    ADD CONSTRAINT orders_assigned_driver_id_fkey 
    FOREIGN KEY (assigned_driver_id) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update RLS policies to work with customer_id
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

CREATE POLICY "Users can create their own orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own orders"
  ON orders
  FOR UPDATE
  TO public
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO public
  USING (auth.uid() = customer_id);