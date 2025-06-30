import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Package, Users, Download, Calendar } from 'lucide-react';
import { useDashboardStats } from '../shared/hooks/useAnalytics';
import { Card, CardHeader, CardTitle, CardContent, Button, LoadingSpinner } from '../shared/components/ui';
import { formatCurrency } from '../shared/utils/formatters';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const { data: stats, isLoading } = useDashboardStats();

  // Empty chart data - will be populated with real data in future updates
  const salesData = [
    { month: 'Jan', revenue: 0, orders: 0, customers: 0 },
    { month: 'Feb', revenue: 0, orders: 0, customers: 0 },
    { month: 'Mar', revenue: 0, orders: 0, customers: 0 },
    { month: 'Apr', revenue: 0, orders: 0, customers: 0 },
    { month: 'May', revenue: 0, orders: 0, customers: 0 },
    { month: 'Jun', revenue: 0, orders: 0, customers: 0 },
  ];

  const deliveryData = [
    { day: 'Mon', delivered: 0, failed: 0, pending: 0 },
    { day: 'Tue', delivered: 0, failed: 0, pending: 0 },
    { day: 'Wed', delivered: 0, failed: 0, pending: 0 },
    { day: 'Thu', delivered: 0, failed: 0, pending: 0 },
    { day: 'Fri', delivered: 0, failed: 0, pending: 0 },
    { day: 'Sat', delivered: 0, failed: 0, pending: 0 },
    { day: 'Sun', delivered: 0, failed: 0, pending: 0 },
  ];

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+0%',
    },
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
      color: 'bg-purple-500',
      change: '+0%',
    },
    {
      name: 'Avg Order Value',
      value: formatCurrency(
        stats?.totalOrders && stats?.totalRevenue
          ? stats.totalRevenue / stats.totalOrders
          : 0
      ),
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+0%',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <Button leftIcon={<Download className="w-4 h-4" />}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} padding="md" hover>
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
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Trend</CardTitle>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="revenue">Revenue</option>
                <option value="orders">Orders</option>
                <option value="customers">Customers</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Delivery Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Delivery Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deliveryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="delivered" fill="#10b981" name="Delivered" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Retention Rate</span>
                <span className="font-bold text-gray-600">0%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Order Fulfillment Rate</span>
                <span className="font-bold text-gray-600">0%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Delivery Time</span>
                <span className="font-bold text-gray-600">0 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Satisfaction</span>
                <span className="font-bold text-gray-600">0/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Growth Rate</span>
                <span className="font-bold text-gray-600">+0%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-500">
                Advanced analytics and reporting features will be available once more data is collected.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}