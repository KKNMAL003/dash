import type { OrderStatus } from '../types';

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  pending: 'order_received',
  order_received: 'order_confirmed',
  order_confirmed: 'preparing',
  preparing: 'out_for_delivery',
  scheduled_for_delivery: 'driver_dispatched',
  driver_dispatched: 'out_for_delivery',
  out_for_delivery: 'delivered',
  delivered: null,
  cancelled: null,
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  order_received: 'Order Received',
  order_confirmed: 'Order Confirmed',
  preparing: 'Preparing',
  scheduled_for_delivery: 'Scheduled for Delivery',
  driver_dispatched: 'Driver Dispatched',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const DELIVERY_WINDOWS = [
  { value: 'morning', label: 'Morning (8AM - 12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
  { value: 'evening', label: 'Evening (5PM - 8PM)' },
];

export const PAYMENT_METHODS = [
  { value: 'eft', label: 'EFT' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'payfast', label: 'PayFast' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'cash_on_delivery', label: 'Cash on Delivery' },
];

export const USER_ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'staff', label: 'Staff Member' },
  { value: 'driver', label: 'Delivery Driver' },
  { value: 'customer', label: 'Customer' },
];