// Centralized type definitions
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface User extends BaseEntity {
  email: string;
  email_confirmed_at?: string;
}

export interface Profile extends BaseEntity {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  role: UserRole;
  default_delivery_window: string | null;
  default_latitude: number | null;
  default_longitude: number | null;
}

export interface Order extends BaseEntity {
  user_id: string;
  customer_id: string;
  assigned_driver_id: string | null;
  status: OrderStatus;
  total_amount: number;
  delivery_address: string;
  delivery_phone: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  customer_name: string;
  customer_email: string;
  notes: string | null;
  delivery_date: string | null;
  preferred_delivery_window: string | null;
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
}


export interface OrderItem extends BaseEntity {
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CommunicationLog extends BaseEntity {
  user_id: string;
  customer_id: string;
  staff_id: string | null;
  log_type: CommunicationLogType;
  subject: string | null;
  message: string;
  sender_type: SenderType;
  is_read: boolean;
}

// Enums
export type UserRole = 'admin' | 'staff' | 'driver' | 'customer';

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

export type PaymentMethod = 'eft' | 'card' | 'payfast' | 'paypal' | 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type CommunicationLogType = 'order_status_update' | 'user_message';
export type SenderType = 'customer' | 'staff';

// Filter types
export interface OrderFilters {
  status?: OrderStatus;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface CustomerFilters {
  role?: UserRole;
  search?: string;
  has_orders?: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ModalState {
  isOpen: boolean;
  data?: any;
}

// Permission types
export interface Permission {
  resource: string;
  actions: string[];
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  permissions: Permission[];
  isLoading: boolean;
}