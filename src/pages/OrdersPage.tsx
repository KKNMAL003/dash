import React, { useState } from 'react';
import { Search, Filter, Package } from 'lucide-react';
import { useOrders, useUpdateOrderStatus } from '../shared/hooks/useOrders';
import { OrderCard } from '../features/orders/components/OrderCard';
import { OrderDetailsModal } from '../features/orders/components/OrderDetailsModal';
import { LoadingSpinner, EmptyState } from '../shared/components/ui';
import type { Order, OrderFilters } from '../shared/types';

export default function OrdersPage() {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Update filters when search or status changes
  React.useEffect(() => {
    setFilters({
      ...(statusFilter !== 'all' && { status: statusFilter as any }),
      ...(searchTerm && { search: searchTerm }),
    });
  }, [searchTerm, statusFilter]);

  const { data: orders = [], isLoading, error } = useOrders(filters);
  const updateStatusMutation = useUpdateOrderStatus();

  const handleUpdateStatus = (orderId: string, status: string) => {
    updateStatusMutation.mutate({ orderId, status: status as any });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading orders: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">
            {orders.length} orders found
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="orders-search"
              type="text"
              placeholder="Search orders by customer name, address, or order ID..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              id="status-filter"
              className="input pl-10 pr-8"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="order_received">Order Received</option>
              <option value="order_confirmed">Order Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewDetails={handleViewDetails}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={updateStatusMutation.isPending}
            />
          ))
        ) : (
          <EmptyState
            icon={<Package className="h-12 w-12" />}
            title="No orders found"
            description={
              searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Orders will appear here when customers place them.'
            }
          />
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={handleCloseModal}
      />
    </div>
  );
}