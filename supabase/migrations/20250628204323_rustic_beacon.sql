/*
  # Add payment_status column to orders table

  1. Changes
     - Add `payment_status` column to `orders` table
     - Set default value to 'pending'
     - Add check constraint for valid payment status values
     - Update existing records to have 'pending' status

  2. Security
     - No RLS changes needed (orders table already has RLS enabled)
*/

-- Add payment_status column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';

-- Add check constraint for valid payment status values
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text]));

-- Update any existing records to have 'pending' status (in case column already existed without constraint)
UPDATE orders SET payment_status = 'pending' WHERE payment_status IS NULL;