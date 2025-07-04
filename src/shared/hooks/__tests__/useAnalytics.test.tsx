import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useDashboardStats, 
  useRecentOrders, 
  useSalesData, 
  useOrderStatusData, 
  useDeliveryPerformanceData 
} from '../useAnalytics';
import { apiClient } from '../../services/api';
// Mock data
const mockDashboardStats = {
  totalRevenue: 125000,
  totalOrders: 1250,
  totalCustomers: 850,
  averageOrderValue: 100,
  revenueGrowth: 12.5,
  ordersGrowth: 8.3,
  customersGrowth: 15.2,
  avgOrderGrowth: 3.7,
};

const mockRecentOrders = [
  {
    id: 'order-1',
    customer_name: 'John Doe',
    total_amount: 125.50,
    status: 'pending',
    created_at: '2024-01-15T10:30:00Z',
  },
];

const mockSalesData = [
  { month: 'Jan', sales: 12000, revenue: 120000, orders: 120, customers: 80 },
  { month: 'Feb', sales: 15000, revenue: 150000, orders: 150, customers: 95 },
];

const mockOrderStatusData = [
  { status: 'pending', count: 45 },
  { status: 'processing', count: 32 },
];

const mockDeliveryData = [
  { day: 'Mon', delivered: 45, pending: 12, failed: 3 },
  { day: 'Tue', delivered: 52, pending: 8, failed: 2 },
];

const mockApiError = new Error('API Error');

// Mock the API client
vi.mock('../../services/api', () => ({
  apiClient: {
    analytics: {
      getDashboardStats: vi.fn(),
      getRecentOrders: vi.fn(),
      getSalesData: vi.fn(),
      getOrderStatusData: vi.fn(),
      getDeliveryPerformanceData: vi.fn(),
    },
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAnalytics hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('useDashboardStats', () => {
    it('fetches dashboard stats successfully', async () => {
      vi.mocked(apiClient.analytics.getDashboardStats).mockResolvedValue(mockDashboardStats);

      const { result } = renderHook(() => useDashboardStats(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockDashboardStats);
      expect(result.current.error).toBeNull();
      expect(apiClient.analytics.getDashboardStats).toHaveBeenCalledTimes(1);
    });

    it('handles dashboard stats error', async () => {
      vi.mocked(apiClient.analytics.getDashboardStats).mockRejectedValue(mockApiError);

      const { result } = renderHook(() => useDashboardStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useRecentOrders', () => {
    it('fetches recent orders successfully', async () => {
      vi.mocked(apiClient.analytics.getRecentOrders).mockResolvedValue(mockRecentOrders);

      const { result } = renderHook(() => useRecentOrders(5), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockRecentOrders);
      expect(apiClient.analytics.getRecentOrders).toHaveBeenCalledWith(5);
    });

    it('uses default limit when not provided', async () => {
      vi.mocked(apiClient.analytics.getRecentOrders).mockResolvedValue(mockRecentOrders);

      renderHook(() => useRecentOrders(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(apiClient.analytics.getRecentOrders).toHaveBeenCalledWith(undefined);
      });
    });

    it('handles recent orders error', async () => {
      vi.mocked(apiClient.analytics.getRecentOrders).mockRejectedValue(mockApiError);

      const { result } = renderHook(() => useRecentOrders(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useSalesData', () => {
    it('fetches sales data successfully', async () => {
      vi.mocked(apiClient.analytics.getSalesData).mockResolvedValue(mockSalesData);

      const { result } = renderHook(() => useSalesData(6), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockSalesData);
      expect(apiClient.analytics.getSalesData).toHaveBeenCalledWith(6, undefined);
    });

    it('fetches sales data with date range', async () => {
      vi.mocked(apiClient.analytics.getSalesData).mockResolvedValue(mockSalesData);
      
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
        preset: '30days' as const,
      };

      const { result } = renderHook(() => useSalesData(6, dateRange), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(apiClient.analytics.getSalesData).toHaveBeenCalledWith(6, dateRange);
    });

    it('uses default months when not provided', async () => {
      vi.mocked(apiClient.analytics.getSalesData).mockResolvedValue(mockSalesData);

      renderHook(() => useSalesData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(apiClient.analytics.getSalesData).toHaveBeenCalledWith(6, undefined);
      });
    });
  });

  describe('useOrderStatusData', () => {
    it('fetches order status data successfully', async () => {
      vi.mocked(apiClient.analytics.getOrderStatusData).mockResolvedValue(mockOrderStatusData);

      const { result } = renderHook(() => useOrderStatusData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockOrderStatusData);
      expect(apiClient.analytics.getOrderStatusData).toHaveBeenCalledTimes(1);
    });

    it('handles order status data error', async () => {
      vi.mocked(apiClient.analytics.getOrderStatusData).mockRejectedValue(mockApiError);

      const { result } = renderHook(() => useOrderStatusData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useDeliveryPerformanceData', () => {
    it('fetches delivery performance data successfully', async () => {
      vi.mocked(apiClient.analytics.getDeliveryPerformanceData).mockResolvedValue(mockDeliveryData);

      const { result } = renderHook(() => useDeliveryPerformanceData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockDeliveryData);
      expect(apiClient.analytics.getDeliveryPerformanceData).toHaveBeenCalledTimes(1);
    });

    it('handles delivery performance data error', async () => {
      vi.mocked(apiClient.analytics.getDeliveryPerformanceData).mockRejectedValue(mockApiError);

      const { result } = renderHook(() => useDeliveryPerformanceData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Query key consistency', () => {
    it('uses consistent query keys for caching', async () => {
      vi.mocked(apiClient.analytics.getSalesData).mockResolvedValue(mockSalesData);

      const { result: result1 } = renderHook(() => useSalesData(6), {
        wrapper: createWrapper(),
      });

      const { result: result2 } = renderHook(() => useSalesData(6), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
        expect(result2.current.isLoading).toBe(false);
      });

      // Should only call API once due to caching
      expect(apiClient.analytics.getSalesData).toHaveBeenCalledTimes(1);
    });
  });
});
