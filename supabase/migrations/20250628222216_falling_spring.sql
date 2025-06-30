/*
  # Fix admin dashboard customer visibility
  
  1. Security Updates
    - Add RLS policy for admin/staff to view all customer profiles
    - Add RLS policy for admin/staff to view all orders
    - Ensure proper access control while maintaining security
    
  2. Problem
    - Current RLS policies only allow users to see their own data
    - Admin dashboard needs to see all customer data to function
    
  3. Solution
    - Add policies that allow admin/staff/driver roles to see customer data
    - Maintain security by role-checking
*/

-- Add RLS policy for admin/staff to view all customer profiles
CREATE POLICY "Admin and staff can view all customer profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if the requesting user is admin/staff/driver
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff', 'driver')
    )
    OR 
    -- Or if it's the user's own profile
    id = auth.uid()
  );

-- Add RLS policy for admin/staff to view all orders
CREATE POLICY "Admin and staff can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if the requesting user is admin/staff/driver
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff', 'driver')
    )
    OR 
    -- Or if it's the customer's own order
    customer_id = auth.uid()
  );

-- Add RLS policy for admin/staff to update any order
CREATE POLICY "Admin and staff can update all orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow if the requesting user is admin/staff/driver
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff', 'driver')
    )
    OR 
    -- Or if it's the customer's own order
    customer_id = auth.uid()
  );

-- Add RLS policy for admin/staff to view all communication logs
CREATE POLICY "Admin and staff can view all communications"
  ON communication_logs
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if the requesting user is admin/staff/driver
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff', 'driver')
    )
    OR 
    -- Or if it's the user's own communication
    customer_id = auth.uid() 
    OR 
    staff_id = auth.uid()
  );

-- Add RLS policy for admin/staff to view all order items
CREATE POLICY "Admin and staff can view all order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if the requesting user is admin/staff/driver
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'staff', 'driver')
    )
    OR 
    -- Or if it belongs to the customer's order
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = auth.uid()
    )
  );