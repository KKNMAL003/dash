import React, { useState } from 'react';
import { Truck, MapPin, Clock, User, Phone, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { useOrders } from '../shared/hooks/useOrders';
import { DataTable, StatusBadge, Modal, Card } from '../shared/components/ui';
import { formatCurrency, formatDateTime, formatOrderId, formatFullName } from '../shared/utils/formatters';
import type { Order } from '../shared/types';

export default function DeliveryPage() {
  const [selectedDelivery, setSelectedDelivery] = useState<Order | null>(null);
  
  const { data: deliveries = [], isLoading } = useOrders({
    status: undefined // We'll filter in the component
  });

  // Filter for delivery-related orders
  const deliveryOrders = React.useMemo(() => {
    return deliveries.filter(order => 
      ['preparing', 'scheduled_for_delivery', 'driver_dispatched', 'out_for_delivery'].includes(order.status)
    );
  }, [deliveries]);

  const deliveryStats = React.useMemo(() => {
    const totalDeliveries = deliveryOrders.length;
    const outForDelivery = deliveryOrders.filter(o => o.status === 'out_for_delivery').length;
    const pendingAssignment = deliveryOrders.filter(o => o.status === 'preparing').length;
    
    return { totalDeliveries, outForDelivery, pendingAssignment };
  }, [deliveryOrders]);

  const statCards = [
    {
      name: 'Total Deliveries',
      value: deliveryStats.totalDeliveries,
      icon: Truck,
      color: 'bg-blue-500',
    },
    {
      name: 'Out for Delivery',
      value: deliveryStats.outForDelivery,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      name: 'Being Prepared',
      value: deliveryStats.pendingAssignment,
      icon: Clock,
      color: 'bg-yellow-500',
    },
  ];

  const columns = [
    {
      key: 'id',
      header: 'Order',
      sortable: true,
      render: (_: any, delivery: Order) => (
        <div>
          <p className="font-medium">Order {formatOrderId(delivery.id)}</p>
          <StatusBadge status={delivery.status} type="order" size="sm" />
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (_: any, delivery: Order) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{delivery.customer_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{delivery.delivery_phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Delivery Address',
      render: (_: any, delivery: Order) => (
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
          <span className="text-sm text-gray-600 max-w-[200px] truncate">
            {delivery.delivery_address}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (_: any, delivery: Order) => (
        <div>
          <p className="font-medium">{formatCurrency(delivery.total_amount)}</p>
          <p className="text-xs text-gray-500">{formatDateTime(delivery.created_at)}</p>
        </div>
      ),
    },
    {
      key: 'delivery_date',
      header: 'Scheduled',
      render: (_: any, delivery: Order) => (
        <div>
          {delivery.delivery_date ? (
            <>
              <p className="text-sm">{formatDateTime(delivery.delivery_date)}</p>
              {delivery.preferred_delivery_window && (
                <p className="text-xs text-gray-500">{delivery.preferred_delivery_window}</p>
              )}
            </>
          ) : (
            <span className="text-gray-400">Not scheduled</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
        <p className="text-gray-600">Track and manage all deliveries</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} padding="md">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Deliveries Table */}
      <DataTable
        data={deliveryOrders}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search deliveries by customer or address..."
        emptyState={{
          icon: <Package className="h-12 w-12" />,
          title: 'No active deliveries',
          description: 'Active delivery orders will appear here.',
        }}
        onRowClick={setSelectedDelivery}
      />

      {/* Delivery Details Modal */}
      <Modal
        isOpen={!!selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        title={`Delivery Details - Order ${selectedDelivery ? formatOrderId(selectedDelivery.id) : ''}`}
        size="lg"
      >
        {selectedDelivery && (
          <div className="px-6 py-4 space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p className="text-sm text-gray-900">{selectedDelivery.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-sm text-gray-900">{selectedDelivery.delivery_phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                  <p className="text-sm text-gray-900">{selectedDelivery.delivery_address}</p>
                </div>
              </div>
            </div>
            
            {/* Delivery Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Delivery Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <StatusBadge status={selectedDelivery.status} type="order" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Order Created</p>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedDelivery.created_at)}</p>
                </div>
                {selectedDelivery.delivery_date && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Scheduled Delivery</p>
                    <p className="text-sm text-gray-900">{formatDateTime(selectedDelivery.delivery_date)}</p>
                  </div>
                )}
                {selectedDelivery.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Notes</p>
                    <p className="text-sm text-gray-900">{selectedDelivery.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Amount</p>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedDelivery.total_amount)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}