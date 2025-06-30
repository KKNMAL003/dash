/*
  # Add Foreign Key Relationship Between Orders and Profiles

  1. Database Changes
    - Add foreign key constraint from orders.user_id to profiles.id
    - This enables direct joins between orders and profiles tables

  2. Security
    - No RLS changes needed as this is just adding a foreign key constraint

  3. Notes
    - This constraint is safe to add since profiles.id references users.id 
    - and orders.user_id also references users.id, ensuring data integrity
*/

-- Add foreign key constraint between orders and profiles
-- This allows direct joins between orders and customer profiles
ALTER TABLE orders 
ADD CONSTRAINT orders_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;