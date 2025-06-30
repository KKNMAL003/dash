/*
  # Fix order status update and communication logs

  1. Changes
     - Update order status constraints to match workflow
     - Fix log_order_status_change function to prevent null customer_id errors
     - Recreate trigger for order status changes
     - Ensure policy exists for system order status updates

  2. Security
     - Add policy for system to insert order status updates
*/

-- First, let's update the allowed order statuses to match the workflow
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status = ANY (ARRAY[
    'pending'::text, 
    'order_received'::text, 
    'order_confirmed'::text, 
    'preparing'::text, 
    'scheduled_for_delivery'::text, 
    'driver_dispatched'::text, 
    'out_for_delivery'::text, 
    'delivered'::text, 
    'cancelled'::text
  ]));

-- Create or replace the log_order_status_change function
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Insert communication log entry with proper customer_id
    INSERT INTO communication_logs (
      user_id,
      customer_id,
      staff_id,
      log_type,
      subject,
      message,
      sender_type,
      is_read
    ) VALUES (
      NEW.customer_id,  -- user_id should match customer_id
      NEW.customer_id,  -- customer_id from the order
      NULL,             -- staff_id is null for system messages
      'order_status_update',
      'Order Status Update',
      'Your order #' || LEFT(NEW.id::text, 8) || ' status has been updated to: ' || REPLACE(INITCAP(REPLACE(NEW.status, '_', ' ')), '_', ' '),
      'staff',          -- sender_type as staff (system)
      false             -- is_read set to false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders;
CREATE TRIGGER trigger_log_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Handle policy creation safely
DROP POLICY IF EXISTS "System can insert order status updates" ON communication_logs;
CREATE POLICY "System can insert order status updates"
  ON communication_logs
  FOR INSERT
  TO public
  WITH CHECK (log_type = 'order_status_update');