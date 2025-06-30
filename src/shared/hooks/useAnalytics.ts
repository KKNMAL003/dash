import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.analytics.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useRecentOrders(limit?: number) {
  return useQuery({
    queryKey: ['recent-orders', limit],
    queryFn: () => apiClient.analytics.getRecentOrders(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}