import { supabase } from '../../lib/supabase';
import type { 
  Order, 
  OrderItem, 
  Profile, 
  CommunicationLog, 
  OrderFilters, 
  CustomerFilters,
  OrderStatus,
  CommunicationLogType 
} from '../types';

class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private handleError(error: any): never {
    console.error('API Error:', error);
    throw new ApiError(
      error.message || 'An unexpected error occurred',
      error.code,
      error.status
    );
  }

  // Orders API
  orders = {
    async getAll(filters?: OrderFilters): Promise<Order[]> {
      try {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }
        if (filters?.customer_id) {
          query = query.eq('customer_id', filters.customer_id);
        }
        if (filters?.search) {
          query = query.or(`customer_name.ilike.%${filters.search}%,delivery_address.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
        }
        if (filters?.date_from) {
          query = query.gte('created_at', filters.date_from);
        }
        if (filters?.date_to) {
          query = query.lte('created_at', filters.date_to);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (error) {
        return this.handleError(error);
      }
    },

    async getById(id: string): Promise<Order | null> {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        return this.handleError(error);
      }
    },

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ 
            status, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        return this.handleError(error);
      }
    },

    async update(id: string, updates: Partial<Order>): Promise<Order> {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        return this.handleError(error);
      }
    }
  };

  // Order Items API
  orderItems = {
    async getByOrderId(orderId: string): Promise<OrderItem[]> {
      try {
        const { data, error } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);

        if (error) throw error;
        return data || [];
      } catch (error) {
        return this.handleError(error);
      }
    }
  };

  // Customers/Profiles API
  customers = {
    async getAll(filters?: CustomerFilters): Promise<Profile[]> {
      try {
        let query = supabase
          .from('profiles')
          .select('*')
          .eq('role', 'customer')
          .order('created_at', { ascending: false });

        if (filters?.search) {
          query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (error) {
        return this.handleError(error);
      }
    },

    async getById(id: string): Promise<Profile | null> {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        return this.handleError(error);
      }
    },

    async getWithStats(customerId: string) {
      try {
        const [profile, orders] = await Promise.all([
          this.getById(customerId),
          this.apiClient.orders.getAll({ customer_id: customerId })
        ]);

        if (!profile) throw new Error('Customer not found');

        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const activeOrders = orders.filter(order => 
          !['delivered', 'cancelled'].includes(order.status)
        ).length;
        const lastOrderDate = orders.length > 0 
          ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null;

        return {
          ...profile,
          statistics: {
            totalOrders,
            totalSpent,
            activeOrders,
            lastOrderDate,
          }
        };
      } catch (error) {
        return this.handleError(error);
      }
    },

    // Add reference to apiClient for cross-service calls
    apiClient: null as any
  };

  // Communication API
  communications = {
    async getByCustomerId(customerId: string): Promise<CommunicationLog[]> {
      try {
        const { data, error } = await supabase
          .from('communication_logs')
          .select(`
            *,
            staff:profiles!communication_logs_staff_id_fkey(
              first_name,
              last_name
            )
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error) {
        return this.handleError(error);
      }
    },

    async sendMessage(params: {
      customerId: string;
      staffId: string | null;
      message: string;
      logType?: CommunicationLogType;
      subject?: string;
    }): Promise<CommunicationLog> {
      try {
        const { data, error } = await supabase
          .from('communication_logs')
          .insert({
            user_id: params.customerId,
            customer_id: params.customerId,
            staff_id: params.staffId,
            message: params.message,
            log_type: params.logType || 'user_message',
            subject: params.subject,
            sender_type: 'staff',
            is_read: true,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        return this.handleError(error);
      }
    },

    async markAsRead(customerId: string): Promise<void> {
      try {
        const { error } = await supabase
          .from('communication_logs')
          .update({ is_read: true })
          .eq('customer_id', customerId)
          .eq('sender_type', 'customer')
          .eq('is_read', false);

        if (error) throw error;
      } catch (error) {
        return this.handleError(error);
      }
    },

    async getCustomersWithChats(searchTerm?: string): Promise<any[]> {
      try {
        let query = supabase
          .from('profiles')
          .select(`
            *,
            communication_logs!communication_logs_customer_id_fkey(
              id,
              message,
              sender_type,
              is_read,
              created_at
            )
          `)
          .eq('role', 'customer')
          .order('created_at', { ascending: false });

        if (searchTerm) {
          query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Sort customers by most recent message
        return data?.sort((a, b) => {
          const aLastMessage = a.communication_logs?.[0]?.created_at;
          const bLastMessage = b.communication_logs?.[0]?.created_at;
          if (!aLastMessage && !bLastMessage) return 0;
          if (!aLastMessage) return 1;
          if (!bLastMessage) return -1;
          return new Date(bLastMessage).getTime() - new Date(aLastMessage).getTime();
        }) || [];
      } catch (error) {
        return this.handleError(error);
      }
    }
  };

  // Analytics API
  analytics = {
    async getDashboardStats() {
      try {
        const [ordersData, customersData] = await Promise.all([
          supabase.from('orders').select('total_amount, created_at, status'),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer')
        ]);

        const orders = ordersData.data || [];
        const customerCount = customersData.count || 0;

        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
        const totalCustomers = customerCount;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

        return {
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalCustomers,
          totalRevenue,
        };
      } catch (error) {
        return this.handleError(error);
      }
    },

    async getRecentOrders(limit: number = 4): Promise<Order[]> {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data || [];
      } catch (error) {
        return this.handleError(error);
      }
    }
  };
}

// Create singleton instance
export const apiClient = new ApiClient();

// Set up cross-references
apiClient.customers.apiClient = apiClient;