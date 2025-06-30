export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          address?: string | null;
          role?: 'admin' | 'staff' | 'driver' | 'customer';
          created_at?: string;
          updated_at?: string;
          default_delivery_window?: string | null;
          default_latitude?: number | null;
          default_longitude?: number | null;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          address?: string | null;
          role?: 'admin' | 'staff' | 'driver' | 'customer';
          updated_at?: string;
          default_delivery_window?: string | null;
          default_latitude?: number | null;
          default_longitude?: number | null;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string;
          assigned_driver_id: string | null;
          status: 'pending' | 'order_received' | 'order_confirmed' | 'preparing' | 'scheduled_for_delivery' | 'driver_dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled';
          total_amount: number;
          delivery_address: string;
          delivery_phone: string;
          payment_method: 'eft' | 'card' | 'payfast' | 'paypal' | 'cash_on_delivery';
          payment_status: 'pending' | 'paid' | 'failed';
          customer_name: string;
          customer_email: string;
          notes: string | null;
          delivery_date: string | null;
          preferred_delivery_window: string | null;
          created_at: string;
          updated_at: string;
          estimated_delivery_start: string | null;
          estimated_delivery_end: string | null;
          driver_id: string | null;
          tracking_notes: string | null;
          delivery_zone: string | null;
          priority_level: string | null;
          payment_confirmation_sent: boolean | null;
          receipt_sent: boolean | null;
          updated_by: string | null;
          delivery_latitude: number | null;
          delivery_longitude: number | null;
          delivery_cost: number | null;
          service_area_validated: boolean | null;
          auto_status_enabled: boolean | null;
        };
        Insert: {
          id?: string;
          user_id?: string;
          customer_id: string;
          assigned_driver_id?: string | null;
          status?: 'pending' | 'order_received' | 'order_confirmed' | 'preparing' | 'scheduled_for_delivery' | 'driver_dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled';
          total_amount: number;
          delivery_address: string;
          delivery_phone: string;
          payment_method: 'eft' | 'card' | 'payfast' | 'paypal' | 'cash_on_delivery';
          payment_status?: 'pending' | 'paid' | 'failed';
          customer_name: string;
          customer_email: string;
          notes?: string | null;
          delivery_date?: string | null;
          preferred_delivery_window?: string | null;
          created_at?: string;
          updated_at?: string;
          estimated_delivery_start?: string | null;
          estimated_delivery_end?: string | null;
          driver_id?: string | null;
          tracking_notes?: string | null;
          delivery_zone?: string | null;
          priority_level?: string | null;
          payment_confirmation_sent?: boolean | null;
          receipt_sent?: boolean | null;
          updated_by?: string | null;
          delivery_latitude?: number | null;
          delivery_longitude?: number | null;
          delivery_cost?: number | null;
          service_area_validated?: boolean | null;
          auto_status_enabled?: boolean | null;
        };
        Update: {
          status?: 'pending' | 'order_received' | 'order_confirmed' | 'preparing' | 'scheduled_for_delivery' | 'driver_dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled';
          assigned_driver_id?: string | null;
          total_amount?: number;
          delivery_address?: string;
          delivery_phone?: string;
          payment_method?: 'eft' | 'card' | 'payfast' | 'paypal' | 'cash_on_delivery';
          payment_status?: 'pending' | 'paid' | 'failed';
          customer_name?: string;
          customer_email?: string;
          notes?: string | null;
          delivery_date?: string | null;
          preferred_delivery_window?: string | null;
          updated_at?: string;
          estimated_delivery_start?: string | null;
          estimated_delivery_end?: string | null;
          driver_id?: string | null;
          tracking_notes?: string | null;
          delivery_zone?: string | null;
          priority_level?: string | null;
          payment_confirmation_sent?: boolean | null;
          receipt_sent?: boolean | null;
          updated_by?: string | null;
          delivery_latitude?: number | null;
          delivery_longitude?: number | null;
          delivery_cost?: number | null;
          service_area_validated?: boolean | null;
          auto_status_enabled?: boolean | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        };
      };
      communication_logs: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string;
          staff_id: string | null;
          log_type: string;
          subject: string | null;
          message: string;
          sender_type: 'customer' | 'staff';
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          customer_id: string;
          staff_id?: string | null;
          log_type: string;
          subject?: string | null;
          message: string;
          sender_type?: 'customer' | 'staff';
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          subject?: string | null;
          message?: string;
          is_read?: boolean;
        };
      };
      delivery_time_slots: {
        Row: {
          id: string;
          date: string;
          time_window: string;
          max_orders: number;
          current_orders: number;
          active: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          time_window: string;
          max_orders?: number;
          current_orders?: number;
          active?: boolean | null;
          created_at?: string;
        };
        Update: {
          date?: string;
          time_window?: string;
          max_orders?: number;
          current_orders?: number;
          active?: boolean | null;
        };
      };
      service_areas: {
        Row: {
          id: string;
          name: string;
          polygon_coordinates: any;
          delivery_cost: number;
          active: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          polygon_coordinates: any;
          delivery_cost?: number;
          active?: boolean | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          polygon_coordinates?: any;
          delivery_cost?: number;
          active?: boolean | null;
        };
      };
      password_reset_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          expires_at: string;
          used: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          expires_at: string;
          used?: boolean | null;
          created_at?: string;
        };
        Update: {
          token?: string;
          expires_at?: string;
          used?: boolean | null;
        };
      };
    };
  };
}