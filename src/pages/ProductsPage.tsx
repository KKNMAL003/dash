import React from 'react';
import { ShoppingCart, Plus, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { useOrderItems } from '../shared/hooks/useOrders';
import { Card, CardHeader, CardTitle, CardContent, Button, EmptyState } from '../shared/components/ui';

export default function ProductsPage() {
  // Since we don't have a products table yet, we'll show product data from order items
  const productStats = {
    totalProducts: 0,
    activeProducts: 0,
    lowStockItems: 0,
    outOfStock: 0,
    productSales: {},
  };

  const statCards = [
    {
      name: 'Total Products',
      value: productStats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Products',
      value: productStats.activeProducts,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      name: 'Low Stock Items',
      value: productStats.lowStockItems,
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
    {
      name: 'Out of Stock',
      value: productStats.outOfStock,
      icon: Package,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog and inventory</p>
          <p className="text-sm text-yellow-600 mt-1">
            Note: Products management will be available once the products table is implemented.
          </p>
        </div>
        <Button
          disabled
          leftIcon={<Plus className="w-4 h-4" />}
          className="mt-4 sm:mt-0 opacity-50 cursor-not-allowed"
        >
          Add Product (Coming Soon)
        </Button>
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Package className="h-12 w-12" />}
            title="Products Management Coming Soon"
            description="Complete product catalog management with inventory tracking, pricing, and analytics will be available once the products table is implemented."
            action={
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Features will include:</p>
                <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                  <li>Product catalog management</li>
                  <li>Inventory tracking</li>
                  <li>Price management</li>
                  <li>Sales analytics</li>
                  <li>Stock alerts</li>
                </ul>
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}