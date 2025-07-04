import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Package, Users, Download, Calendar, AlertCircle } from 'lucide-react';
import {
  useDashboardStats,
  useSalesData,
  useDeliveryPerformanceData
} from '../shared/hooks/useAnalytics';
import { Card, CardHeader, CardTitle, CardContent, Button, LoadingSpinner, StatCardGrid, ErrorState, ChartErrorState, DateRangePicker, ResponsiveChart, ChartGrid, MetricChart } from '../shared/components/ui';
import { useAnalyticsRetry } from '../shared/hooks/useRetry';
import { DateRange, getDateRangeFromPreset } from '../shared/utils/dateRange';
import { formatCurrency } from '../shared/utils/formatters';

function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('6months'));
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: salesData = [], isLoading: salesLoading, error: salesError } = useSalesData(6, dateRange);
  const { data: deliveryData = [], isLoading: deliveryLoading, error: deliveryError } = useDeliveryPerformanceData();

  const { retry, isRetrying, canRetry } = useAnalyticsRetry();

  // All hooks must be called before any early returns
  const handleDateRangeChange = useCallback((newDateRange: DateRange) => {
    setDateRange(newDateRange);
  }, []);

  const handleMetricChange = useCallback((metric: string) => {
    setSelectedMetric(metric);
  }, []);

  const handleRetry = useCallback(() => {
    retry(['dashboard-stats', 'sales-data', 'delivery-performance-data']);
  }, [retry]);

  // All useMemo hooks must be called before any early returns
  const statCards = useMemo(() => [
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
  ], [stats]);

  const isLoading = statsLoading || salesLoading || deliveryLoading;
  const hasError = statsError || salesError || deliveryError;

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load analytics data"
          message="Unable to fetch analytics information. Please check your connection and try again."
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
          />
          <Button leftIcon={<Download className="w-4 h-4" />}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <StatCardGrid stats={statCards} />

      {/* Charts Grid */}
      <ChartGrid>
        {/* Revenue Trend */}
        <MetricChart
          title="Revenue Trend"
          height={300}
          mobileHeight={250}
          metric={selectedMetric}
          onMetricChange={handleMetricChange}
          metricOptions={[
            { value: 'revenue', label: 'Revenue' },
            { value: 'orders', label: 'Orders' },
            { value: 'customers', label: 'Customers' },
          ]}
        >
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
        </MetricChart>

        {/* Delivery Performance */}
        <ResponsiveChart
          title="Weekly Delivery Performance"
          height={300}
          mobileHeight={250}
        >
          <BarChart data={deliveryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="delivered" fill="#10b981" name="Delivered" />
            <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
            <Bar dataKey="failed" fill="#ef4444" name="Failed" />
          </BarChart>
        </ResponsiveChart>

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
      </ChartGrid>
    </div>
  );
}

export default React.memo(AnalyticsPage);