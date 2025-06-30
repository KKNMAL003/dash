import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Types for our application
export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  role: 'admin' | 'staff' | 'driver' | 'customer';
  created_at: string;
  updated_at: string;
  default_delivery_window: string | null;
  default_latitude: number | null;
  default_longitude: number | null;
}

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type CommunicationLog = Database['public']['Tables']['communication_logs']['Row'];

export type OrderStatus = 
  | 'pending'
  | 'order_received'
  | 'order_confirmed'
  | 'preparing'
  | 'scheduled_for_delivery'
  | 'driver_dispatched'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type UserRole = 'admin' | 'staff' | 'driver' | 'customer';