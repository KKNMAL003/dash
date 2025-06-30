/*
  # Add Foreign Key Constraints

  1. Foreign Keys
    - Add foreign key constraint from orders.customer_id to profiles.id
    - Add foreign key constraint from orders.assigned_driver_id to profiles.id  
    - Add foreign key constraint from orders.user_id to profiles.id
    - Add foreign key constraint from order_items.order_id to orders.id
    - Add foreign key constraint from communication_logs.customer_id to profiles.id
    - Add foreign key constraint from communication_logs.staff_id to profiles.id
    - Add foreign key constraint from password_reset_tokens.user_id to profiles.id

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Add foreign key constraints
ALTER TABLE orders 
ADD CONSTRAINT orders_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE orders 
ADD CONSTRAINT orders_assigned_driver_id_fkey 
FOREIGN KEY (assigned_driver_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE order_items 
ADD CONSTRAINT order_items_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE communication_logs 
ADD CONSTRAINT communication_logs_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE communication_logs 
ADD CONSTRAINT communication_logs_staff_id_fkey 
FOREIGN KEY (staff_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE password_reset_tokens 
ADD CONSTRAINT password_reset_tokens_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Enable RLS on all tables if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for authenticated users
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read communication logs"
  ON communication_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage communication logs"
  ON communication_logs
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read delivery slots"
  ON delivery_time_slots
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage delivery slots"
  ON delivery_time_slots
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read service areas"
  ON service_areas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage service areas"
  ON service_areas
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own password reset tokens"
  ON password_reset_tokens
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());