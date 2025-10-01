/*
  # Enable RLS and implement admin-based policies
  
  CRITICAL: This migration re-enables Row Level Security on all tables
  and implements proper policies for admin and customer access control.
  
  This MUST be applied before production deployment to secure the database.
  
  1. Security Changes
    - Re-enable RLS on all tables
    - Revoke overly broad permissions from authenticated/anon roles
    - Create security definer function to check admin role safely
    - Implement granular policies for each table
  
  2. Access Control
    - Admins: Full read/write access to all tables
    - Customers: Can only access their own records
    - Anonymous: No direct table access (API only)
  
  3. Implementation Notes
    - Uses a SECURITY DEFINER function to avoid RLS recursion on profiles table
    - Admin check is safe and efficient
    - Policies are designed for SPA with client-side Supabase access
*/

-- ============================================================================
-- STEP 1: Revoke overly broad permissions
-- ============================================================================

-- Revoke ALL privileges previously granted in 20250628225236_calm_hill.sql
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM authenticated;

-- Grant only necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- ============================================================================
-- STEP 2: Create security definer function to check admin role
-- ============================================================================

-- This function safely checks if the current user is an admin
-- Using SECURITY DEFINER allows it to bypass RLS on profiles table
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role text;
BEGIN
  -- Check if user exists and get their role
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  
  -- Return true if role is admin
  RETURN user_role = 'admin';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- ============================================================================
-- STEP 3: Re-enable RLS on all tables (only if they exist)
-- ============================================================================

DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename IN (
      'profiles', 
      'orders', 
      'order_items', 
      'communication_logs', 
      'delivery_time_slots', 
      'service_areas', 
      'password_reset_tokens'
    )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
    RAISE NOTICE 'Enabled RLS on table: %', table_record.tablename;
  END LOOP;
END $$;

-- ============================================================================
-- STEP 4: Drop all existing policies on all tables
-- ============================================================================

DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    RAISE NOTICE 'Dropped policy: % on %', r.policyname, r.tablename;
  END LOOP;
END $$;

-- ============================================================================
-- STEP 5: Create comprehensive RLS policies
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROFILES TABLE POLICIES
-- ----------------------------------------------------------------------------

-- Admins can view all profiles
CREATE POLICY "profiles_admin_select_all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Users can view their own profile
CREATE POLICY "profiles_user_select_own"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can insert their own profile on signup
CREATE POLICY "profiles_user_insert_own"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Admins can update any profile
CREATE POLICY "profiles_admin_update_all"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Users can update their own profile
CREATE POLICY "profiles_user_update_own"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can delete profiles
CREATE POLICY "profiles_admin_delete_all"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- ORDERS TABLE POLICIES
-- ----------------------------------------------------------------------------

-- Admins can view all orders
CREATE POLICY "orders_admin_select_all"
  ON orders
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Customers can view their own orders
CREATE POLICY "orders_customer_select_own"
  ON orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Admins can insert orders
CREATE POLICY "orders_admin_insert_all"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Customers can create their own orders
CREATE POLICY "orders_customer_insert_own"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Admins can update any order
CREATE POLICY "orders_admin_update_all"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Customers can update their own pending orders
CREATE POLICY "orders_customer_update_own"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid() AND status = 'pending')
  WITH CHECK (customer_id = auth.uid());

-- Admins can delete orders
CREATE POLICY "orders_admin_delete_all"
  ON orders
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- ORDER_ITEMS TABLE POLICIES
-- ----------------------------------------------------------------------------

-- Admins can view all order items
CREATE POLICY "order_items_admin_select_all"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Customers can view their own order items
CREATE POLICY "order_items_customer_select_own"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.customer_id = auth.uid()
  ));

-- Admins can insert order items
CREATE POLICY "order_items_admin_insert_all"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Customers can insert items to their own orders
CREATE POLICY "order_items_customer_insert_own"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.customer_id = auth.uid()
  ));

-- Admins can update order items
CREATE POLICY "order_items_admin_update_all"
  ON order_items
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Admins can delete order items
CREATE POLICY "order_items_admin_delete_all"
  ON order_items
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- COMMUNICATION_LOGS TABLE POLICIES
-- ----------------------------------------------------------------------------

-- Admins can view all communications
CREATE POLICY "communication_logs_admin_select_all"
  ON communication_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Users can view communications where they are customer or staff
CREATE POLICY "communication_logs_user_select_own"
  ON communication_logs
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid() OR staff_id = auth.uid());

-- Admins can insert communications
CREATE POLICY "communication_logs_admin_insert_all"
  ON communication_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Customers can insert their own communications
CREATE POLICY "communication_logs_customer_insert_own"
  ON communication_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid() AND sender_type = 'customer');

-- Admins can update communications
CREATE POLICY "communication_logs_admin_update_all"
  ON communication_logs
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Users can update their own communications (mark as read)
CREATE POLICY "communication_logs_user_update_own"
  ON communication_logs
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid() OR staff_id = auth.uid());

-- Admins can delete communications
CREATE POLICY "communication_logs_admin_delete_all"
  ON communication_logs
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- DELIVERY_TIME_SLOTS TABLE POLICIES (if table exists)
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'delivery_time_slots') THEN
    -- Admins can do everything with delivery time slots
    EXECUTE 'CREATE POLICY "delivery_time_slots_admin_all"
      ON delivery_time_slots
      FOR ALL
      TO authenticated
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()))';

    -- Customers can view active time slots
    EXECUTE 'CREATE POLICY "delivery_time_slots_customer_select_active"
      ON delivery_time_slots
      FOR SELECT
      TO authenticated
      USING (active = true)';
    
    RAISE NOTICE 'Created policies for delivery_time_slots';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- SERVICE_AREAS TABLE POLICIES (if table exists)
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'service_areas') THEN
    -- Admins can do everything with service areas
    EXECUTE 'CREATE POLICY "service_areas_admin_all"
      ON service_areas
      FOR ALL
      TO authenticated
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()))';

    -- Customers can view active service areas
    EXECUTE 'CREATE POLICY "service_areas_customer_select_active"
      ON service_areas
      FOR SELECT
      TO authenticated
      USING (active = true)';
    
    RAISE NOTICE 'Created policies for service_areas';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- PASSWORD_RESET_TOKENS TABLE POLICIES (if table exists)
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'password_reset_tokens') THEN
    -- Only admins can manage password reset tokens
    EXECUTE 'CREATE POLICY "password_reset_tokens_admin_all"
      ON password_reset_tokens
      FOR ALL
      TO authenticated
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()))';

    -- Users can view their own password reset tokens
    EXECUTE 'CREATE POLICY "password_reset_tokens_user_select_own"
      ON password_reset_tokens
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid())';
    
    RAISE NOTICE 'Created policies for password_reset_tokens';
  END IF;
END $$;

-- ============================================================================
-- STEP 6: Grant necessary table permissions
-- ============================================================================

-- Grant SELECT on all tables to authenticated users (RLS will filter)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant INSERT, UPDATE, DELETE to authenticated (RLS will filter) - only for existing tables
DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename IN (
      'profiles', 
      'orders', 
      'order_items', 
      'communication_logs', 
      'delivery_time_slots', 
      'service_areas', 
      'password_reset_tokens'
    )
  LOOP
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON %I TO authenticated', table_record.tablename);
    RAISE NOTICE 'Granted permissions on table: %', table_record.tablename;
  END LOOP;
END $$;

-- Grant USAGE on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- STEP 7: Verify setup
-- ============================================================================

DO $$
DECLARE
  rls_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Count tables with RLS enabled
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables t
  JOIN pg_class c ON c.relname = t.tablename
  WHERE t.schemaname = 'public'
  AND c.relrowsecurity = true;
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE '=== RLS SECURITY ENABLED ===';
  RAISE NOTICE 'Tables with RLS enabled: %', rls_count;
  RAISE NOTICE 'Total policies created: %', policy_count;
  RAISE NOTICE 'Security definer function created: is_admin()';
  RAISE NOTICE '============================';
END $$;
