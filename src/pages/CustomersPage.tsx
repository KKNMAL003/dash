import React, { useState } from 'react';
import { Users, Package, Eye, Phone, MapPin, Calendar } from 'lucide-react';
import { useCustomers } from '../shared/hooks/useCustomers';
import { useOrders } from '../shared/hooks/useOrders';
import { DataTable, Modal, Button, LoadingSpinner, StatusBadge } from '../shared/components/ui';
import { formatFullName, formatCurrency, formatDate } from '../shared/utils/formatters';
import type { Profile, Order } from '../shared/types';

interface CustomerWithStats extends Profile {
  statistics: {
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string | null;
    activeOrders: number;
  };
}

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const { data: customers = [], isLoading } = useCustomers();

  // Transform customers data with statistics
  const customersWithStats: CustomerWithStats[] = React.useMemo(() => {
    return customers.map((customer) => ({
      ...customer,
      statistics: {
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        activeOrders: 0,
      },
    }));
  }, [customers]);

  const handleViewDetails = async (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    // In a real implementation, we'd fetch customer orders here
    setCustomerOrders([]);
  };

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      sortable: true,
      render: (_: any, customer: CustomerWithStats) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {customer.first_name?.[0]?.toUpperCase() || 'C'}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {formatFullName(customer.first_name, customer.last_name)}
            </p>
            <p className="text-sm text-gray-500">
              Joined {formatDate(customer.created_at)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (_: any, customer: CustomerWithStats) => (
        <div className="space-y-1">
          {customer.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.address && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="truncate max-w-[200px]">{customer.address}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'orders',
      header: 'Orders',
      sortable: true,
      render: (_: any, customer: CustomerWithStats) => (
        <div className="text-sm">
          <p className="font-medium">{customer.statistics.totalOrders} orders</p>
          <p className="text-gray-500">{formatCurrency(customer.statistics.totalSpent)} total</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, customer: CustomerWithStats) => (
        <div>
          {customer.statistics.activeOrders > 0 ? (
            <StatusBadge status="active" type="custom" />
          ) : (
            <StatusBadge status="inactive" type="custom" />
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, customer: CustomerWithStats) => (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Eye className="w-4 h-4" />}
          onClick={() => handleViewDetails(customer)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage customer profiles and view order history</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">
            {customersWithStats.length} customers
          </span>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={customersWithStats}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search customers by name, phone, or address..."
        emptyState={{
          icon: <Users className="h-12 w-12" />,
          title: 'No customers found',
          description: 'Customer profiles will appear here when they register.',
        }}
        onRowClick={handleViewDetails}
      />

      {/* Customer Details Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={`Customer Details - ${
          selectedCustomer ? formatFullName(selectedCustomer.first_name, selectedCustomer.last_name) : ''
        }`}
        size="xl"
      >
        {selectedCustomer && (
          <div className="px-6 py-4 space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p className="text-sm text-gray-900">
                    {formatFullName(selectedCustomer.first_name, selectedCustomer.last_name)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-sm text-gray-900">{selectedCustomer.phone || 'No phone'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Address</p>
                  <p className="text-sm text-gray-900">{selectedCustomer.address || 'No address'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Member Since</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedCustomer.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Order Statistics */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Order Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedCustomer.statistics.totalOrders}</p>
                  <p className="text-sm text-blue-600">Total Orders</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedCustomer.statistics.totalSpent)}
                  </p>
                  <p className="text-sm text-green-600">Total Spent</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{selectedCustomer.statistics.activeOrders}</p>
                  <p className="text-sm text-orange-600">Active Orders</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedCustomer.statistics.totalOrders > 0
                      ? formatCurrency(selectedCustomer.statistics.totalSpent / selectedCustomer.statistics.totalOrders)
                      : formatCurrency(0)}
                  </p>
                  <p className="text-sm text-purple-600">Avg Order Value</p>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Orders</h3>
              {customerOrders.length > 0 ? (
                <div className="space-y-3">
                  {customerOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</h4>
                        <StatusBadge status={order.status} type="order" size="sm" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No orders found for this customer</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}