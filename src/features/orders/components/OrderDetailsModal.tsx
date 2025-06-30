import React from 'react';
import { User, MapPin, Phone, Calendar, CreditCard, Package } from 'lucide-react';
import { Modal, Button, StatusBadge, LoadingSpinner, EmptyState } from '../../../shared/components/ui';
import { useOrderItems, useUpdateOrderStatus } from '../../../shared/hooks/useOrders';
import { formatCurrency, formatDateTime, formatOrderId } from '../../../shared/utils/formatters';
import { ORDER_STATUS_FLOW } from '../../../shared/utils/constants';
import type { Order } from '../../../shared/types';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  const { data: orderItems, isLoading: itemsLoading } = useOrderItems(order?.id || '');
  const updateStatusMutation = useUpdateOrderStatus();

  if (!order) return null;

  const nextStatus = ORDER_STATUS_FLOW[order.status];

  const handleUpdateStatus = () => {
    if (nextStatus) {
      updateStatusMutation.mutate({ orderId: order.id, status: nextStatus });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details - ${formatOrderId(order.id)}`}
      size="xl"
    >
      <div className="px-6 py-4 space-y-6">
        {/* Order Status */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Order Status</h3>
          <div className="flex items-center justify-between">
            <StatusBadge status={order.status} type="order" />
            {nextStatus && (
              <Button
                onClick={handleUpdateStatus}
                isLoading={updateStatusMutation.isPending}
                size="sm"
              >
                Progress to {nextStatus.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Button>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Customer</p>
                <p className="text-sm text-gray-900">{order.customer_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-sm text-gray-900">{order.delivery_phone}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2 md:col-span-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                <p className="text-sm text-gray-900">{order.delivery_address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
          {itemsLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : orderItems && orderItems.length > 0 ? (
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">{formatCurrency(item.total_price)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Package className="h-8 w-8" />}
              title="No items found"
              description="No items found for this order"
            />
          )}
        </div>

        {/* Payment & Delivery Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Information</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Payment Method</p>
                  <p className="text-sm text-gray-900">
                    {order.payment_method?.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Payment Status</p>
                <StatusBadge status={order.payment_status} type="payment" size="sm" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Total Amount</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Delivery Information</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Order Date</p>
                  <p className="text-sm text-gray-900">{formatDateTime(order.created_at)}</p>
                </div>
              </div>
              {order.delivery_date && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Scheduled Delivery</p>
                  <p className="text-sm text-gray-900">{formatDateTime(order.delivery_date)}</p>
                </div>
              )}
              {order.preferred_delivery_window && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Preferred Time</p>
                  <p className="text-sm text-gray-900">{order.preferred_delivery_window}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Delivery Notes</h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}