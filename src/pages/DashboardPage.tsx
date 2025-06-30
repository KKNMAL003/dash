import React from 'react';
import {
  Package,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useDashboardStats, useRecentOrders } from '../shared/hooks/useAnalytics';
import { LoadingSpinner } from '../shared/components/ui';
import { formatCurrency, formatDateTime, formatOrderId } from '../shared/utils/formatters';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentOrders = [], isLoading: ordersLoading } = useRecentOrders(4);

  // Empty chart data - no mock data
  const salesData = [
    { month: 'Jan', sales: 0, orders: 0 },
    { month: 'Feb', sales: 0, orders: 0 },
    { month: 'Mar', sales: 0, orders: 0 },
    { month: 'Apr', sales: 0, orders: 0 },
    { month: 'May', sales: 0, orders: 0 },
    { month: 'Jun', sales: 0, orders: 0 },
  ];

  const orderStatusData = [
    { status: 'Pending', count: 0 },
    { status: 'Preparing', count: 0 },
    { status: 'Out For Delivery', count: 0 },
    { status: 'Delivered', count: 0 },
  ];

  if (statsLoading) {
    return (
      <div className="p-6 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: Package,
      color: 'bg-blue-500',
      change: '+0%',
    },
    {
      name: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'bg-green-500',
      change: '+0%',
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+0%',
    },
    {
      name: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'bg-red-500',
      change: '+0%',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Overview (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Order {formatOrderId(order.id)}</p>
                      <p className="text-xs text-gray-500">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(order.total_amount)}</p>
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      {order.status?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm font-medium">Process Orders</span>
            </button>
            <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <Truck className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium">View Deliveries</span>
            </button>
            <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <AlertCircle className="h-8 w-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium">View Alerts</span>
            </button>
            <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <TrendingUp className="h-8 w-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium">View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}