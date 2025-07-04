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

    async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...updates,
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

    async getWithStats(customerId: string) {
      try {
        // Get customer profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .single();

        if (profileError) throw profileError;
        if (!profile) throw new Error('Customer not found');

        // Get customer orders
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', customerId);

        if (ordersError) throw ordersError;

        const ordersList = orders || [];
        const totalOrders = ordersList.length;
        const totalSpent = ordersList.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const activeOrders = ordersList.filter(order =>
          !['delivered', 'cancelled'].includes(order.status)
        ).length;
        const lastOrderDate = ordersList.length > 0
          ? ordersList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
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

    async getAllWithStats(filters?: CustomerFilters) {
      try {
        // Get all customers
        let query = supabase
          .from('profiles')
          .select('*')
          .eq('role', 'customer')
          .order('created_at', { ascending: false });

        if (filters?.search) {
          query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
        }

        const { data: customers, error: customersError } = await query;
        if (customersError) throw customersError;

        if (!customers || customers.length === 0) {
          return [];
        }

        // Get all orders for these customers
        const customerIds = customers.map(c => c.id);
        const { data: allOrders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .in('customer_id', customerIds);

        if (ordersError) throw ordersError;

        // Calculate statistics for each customer
        const customersWithStats = customers.map(customer => {
          const customerOrders = (allOrders || []).filter(order => order.customer_id === customer.id);

          const totalOrders = customerOrders.length;
          const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
          const activeOrders = customerOrders.filter(order =>
            !['delivered', 'cancelled'].includes(order.status)
          ).length;
          const lastOrderDate = customerOrders.length > 0
            ? customerOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
            : null;

          return {
            ...customer,
            statistics: {
              totalOrders,
              totalSpent,
              activeOrders,
              lastOrderDate,
            }
          };
        });

        return customersWithStats;
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
        console.log('Fetching messages for customer:', customerId);

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

        if (error) {
          console.error('Error fetching messages:', error);
          throw error;
        }

        console.log(`Fetched ${data?.length || 0} messages for customer ${customerId}`);
        return data || [];
      } catch (error) {
        console.error('Get messages error:', error);
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
        console.log('Sending message:', params);

        const insertData = {
          user_id: params.customerId,
          customer_id: params.customerId,
          staff_id: params.staffId,
          message: params.message,
          log_type: params.logType || 'user_message',
          subject: params.subject,
          sender_type: 'staff' as const,
          is_read: true,
        };

        console.log('Insert data:', insertData);

        const { data, error } = await supabase
          .from('communication_logs')
          .insert(insertData)
          .select(`
            *,
            staff:profiles!communication_logs_staff_id_fkey(
              first_name,
              last_name
            )
          `)
          .single();

        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }

        console.log('Message sent successfully:', data);
        return data;
      } catch (error) {
        console.error('Send message error:', error);
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

        // Process customers to sort their messages and calculate stats
        const processedCustomers = data?.map(customer => {
          // Sort communication logs by created_at descending (latest first)
          const sortedLogs = customer.communication_logs?.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ) || [];

          return {
            ...customer,
            communication_logs: sortedLogs,
            latest_message: sortedLogs[0] || null,
            unread_count: sortedLogs.filter((log: any) =>
              log.sender_type === 'customer' && !log.is_read
            ).length
          };
        }) || [];

        // Sort customers by most recent message
        return processedCustomers.sort((a, b) => {
          const aLastMessage = a.latest_message?.created_at;
          const bLastMessage = b.latest_message?.created_at;
          if (!aLastMessage && !bLastMessage) return 0;
          if (!aLastMessage) return 1;
          if (!bLastMessage) return -1;
          return new Date(bLastMessage).getTime() - new Date(aLastMessage).getTime();
        });
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

    async getSalesData(months: number = 6, dateRange?: { start: Date; end: Date }) {
      try {
        let startDate: Date;
        let endDate: Date;

        if (dateRange) {
          startDate = dateRange.start;
          endDate = dateRange.end;
        } else {
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - months);
          endDate = new Date();
        }

        const { data, error } = await supabase
          .from('orders')
          .select('total_amount, created_at, status')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Group orders by month
        const monthlyData = new Map();
        const orders = data || [];

        // Initialize months
        for (let i = months - 1; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
          monthlyData.set(monthKey, { month: monthKey, sales: 0, orders: 0, revenue: 0 });
        }

        // Aggregate data by month
        orders.forEach(order => {
          const orderDate = new Date(order.created_at);
          const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short' });

          if (monthlyData.has(monthKey)) {
            const monthData = monthlyData.get(monthKey);
            monthData.orders += 1;
            monthData.sales += 1; // Alias for orders for backward compatibility
            monthData.revenue += order.total_amount || 0;
          }
        });

        return Array.from(monthlyData.values());
      } catch (error) {
        return this.handleError(error);
      }
    },

    async getOrderStatusData() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('status');

        if (error) throw error;

        const statusCounts = {
          pending: 0,
          preparing: 0,
          'out_for_delivery': 0,
          delivered: 0,
        };

        (data || []).forEach(order => {
          if (order.status in statusCounts) {
            statusCounts[order.status as keyof typeof statusCounts]++;
          }
        });

        return [
          { status: 'Pending', count: statusCounts.pending },
          { status: 'Preparing', count: statusCounts.preparing },
          { status: 'Out For Delivery', count: statusCounts.out_for_delivery },
          { status: 'Delivered', count: statusCounts.delivered },
        ];
      } catch (error) {
        return this.handleError(error);
      }
    },

    async getDeliveryPerformanceData() {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); // Last 7 days

        const { data, error } = await supabase
          .from('orders')
          .select('created_at, status, delivery_date')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Group by day of week
        const weeklyData = new Map();
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        // Initialize days
        days.forEach(day => {
          weeklyData.set(day, { day, delivered: 0, pending: 0, failed: 0 });
        });

        (data || []).forEach(order => {
          const orderDate = new Date(order.created_at);
          const dayKey = days[orderDate.getDay() === 0 ? 6 : orderDate.getDay() - 1]; // Adjust for Monday start

          if (weeklyData.has(dayKey)) {
            const dayData = weeklyData.get(dayKey);

            if (order.status === 'delivered') {
              dayData.delivered++;
            } else if (order.status === 'pending' || order.status === 'preparing' || order.status === 'out_for_delivery') {
              dayData.pending++;
            } else {
              dayData.failed++;
            }
          }
        });

        return Array.from(weeklyData.values());
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