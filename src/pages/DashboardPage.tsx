import React, { useMemo, memo } from 'react';
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
import {
  useDashboardStats,
  useRecentOrders,
  useSalesData,
  useOrderStatusData
} from '../shared/hooks/useAnalytics';
import { LoadingSpinner, DashboardSkeleton, StatCardGrid, ChartErrorState, ErrorState, ResponsiveChart, ChartGrid, OrderTable } from '../shared/components/ui';
import { useDashboardRetry } from '../shared/hooks/useRetry';
import { formatCurrency, formatDateTime, formatOrderId } from '../shared/utils/formatters';

const DashboardPage = memo(() => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: recentOrders = [], isLoading: ordersLoading, error: ordersError } = useRecentOrders(4);
  const { data: salesData = [], isLoading: salesLoading, error: salesError } = useSalesData(6);
  const { data: orderStatusData = [], isLoading: statusLoading, error: statusError } = useOrderStatusData();

  const { retry, isRetrying, canRetry } = useDashboardRetry();

  // Memoize expensive stat card calculations
  const statCards = useMemo(() => [
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
  ], [stats]);

  // Memoize processed sales data for charts
  const processedSalesData = useMemo(() => {
    return salesData?.map(item => ({
      ...item,
      formattedRevenue: formatCurrency(item.revenue || 0)
    }));
  }, [salesData]);

  // Memoize processed order status data
  const processedOrderStatusData = useMemo(() => {
    return orderStatusData?.map(item => ({
      ...item,
      formattedValue: (item.value || 0).toLocaleString()
    }));
  }, [orderStatusData]);

  const isLoading = statsLoading || salesLoading || statusLoading;
  const hasError = statsError || salesError || statusError;

  const handleRetry = () => {
    retry(['dashboard-stats', 'recent-orders', 'sales-data', 'order-status-data']);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (hasError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load dashboard data"
          message="Unable to fetch dashboard information. Please check your connection and try again."
          onRetry={canRetry ? handleRetry : undefined}
          showRetry={canRetry}
          type="network"
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Statistics Cards */}
      <StatCardGrid stats={statCards} />

      {/* Charts */}
      <ChartGrid>
        {/* Sales Chart */}
        {salesError ? (
          <ChartErrorState onRetry={() => retry(['sales-data'])} />
        ) : (
          <ResponsiveChart
            title="Sales Overview"
            subtitle="Last 6 Months"
            height={300}
            mobileHeight={250}
          >
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveChart>
        )}

        {/* Order Status Chart */}
        {statusError ? (
          <ChartErrorState onRetry={() => retry(['order-status-data'])} />
        ) : (
          <ResponsiveChart
            title="Order Status Distribution"
            height={300}
            mobileHeight={250}
          >
            <BarChart data={processedOrderStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveChart>
        )}
      </ChartGrid>

      {/* Recent Orders */}
      <div className="card p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all
          </button>
        </div>
        <OrderTable
          orders={recentOrders}
          loading={ordersLoading}
          onOrderClick={(order) => console.log('Order clicked:', order)}
        />
      </div>
    </div>
  );
});

export default DashboardPage;