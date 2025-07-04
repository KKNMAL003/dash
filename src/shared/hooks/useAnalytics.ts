import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { DateRange } from '../utils/dateRange';
import { queryKeys, backgroundRefetchConfig } from '../config/queryClient';

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => apiClient.analytics.getDashboardStats(),
    ...backgroundRefetchConfig.dashboard,
  });
}

export function useRecentOrders(limit?: number) {
  return useQuery({
    queryKey: queryKeys.dashboard.recentOrders(limit),
    queryFn: () => apiClient.analytics.getRecentOrders(limit),
    ...backgroundRefetchConfig.dashboard,
  });
}

export function useSalesData(months: number = 6, dateRange?: DateRange) {
  return useQuery({
    queryKey: queryKeys.analytics.sales(months, dateRange),
    queryFn: () => apiClient.analytics.getSalesData(months, dateRange),
    ...backgroundRefetchConfig.analytics,
  });
}

export function useOrderStatusData() {
  return useQuery({
    queryKey: queryKeys.analytics.orderStatus(),
    queryFn: () => apiClient.analytics.getOrderStatusData(),
    ...backgroundRefetchConfig.analytics,
  });
}

export function useDeliveryPerformanceData() {
  return useQuery({
    queryKey: queryKeys.analytics.deliveryPerformance(),
    queryFn: () => apiClient.analytics.getDeliveryPerformanceData(),
    ...backgroundRefetchConfig.analytics,
  });
}