import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

// Custom error handler for queries
const handleQueryError = (error: unknown) => {
  console.error('Query error:', error);
  // You could integrate with error reporting service here
  // e.g., Sentry.captureException(error);
};

// Custom error handler for mutations
const handleMutationError = (error: unknown) => {
  console.error('Mutation error:', error);
  // You could show toast notifications here
  // e.g., toast.error('Something went wrong');
};

// Create query cache with error handling
const queryCache = new QueryCache({
  onError: handleQueryError,
});

// Create mutation cache with error handling
const mutationCache = new MutationCache({
  onError: handleMutationError,
});

// Create and configure the query client
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      
      // Keep data in cache for 10 minutes after component unmounts
      gcTime: 10 * 60 * 1000,
      
      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Don't retry on chunk loading errors
        if (error?.message?.includes('ChunkLoadError') ||
            error?.message?.includes('Loading chunk')) {
          return false;
        }
        return failureCount < 3;
      },
      
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus for critical data
      refetchOnWindowFocus: true,
      
      // Refetch when network reconnects
      refetchOnReconnect: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      
      // Shorter retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Query key factories for consistent cache management
export const queryKeys = {
  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    recentOrders: (limit?: number) => [...queryKeys.dashboard.all, 'recent-orders', limit] as const,
  },
  
  // Analytics queries
  analytics: {
    all: ['analytics'] as const,
    sales: (months?: number, dateRange?: any) => [...queryKeys.analytics.all, 'sales', months, dateRange] as const,
    orderStatus: () => [...queryKeys.analytics.all, 'order-status'] as const,
    deliveryPerformance: () => [...queryKeys.analytics.all, 'delivery-performance'] as const,
  },
  
  // Orders queries
  orders: {
    all: ['orders'] as const,
    list: (filters?: any) => [...queryKeys.orders.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
  },
  
  // Customers queries
  customers: {
    all: ['customers'] as const,
    list: (filters?: any) => [...queryKeys.customers.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.customers.all, 'detail', id] as const,
  },
} as const;

// Cache invalidation helpers
export const cacheUtils = {
  // Invalidate all dashboard data
  invalidateDashboard: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  },
  
  // Invalidate all analytics data
  invalidateAnalytics: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
  },
  
  // Invalidate specific data types
  invalidateOrders: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
  },
  
  invalidateCustomers: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
  },
  
  // Clear all cache
  clearAll: () => {
    return queryClient.clear();
  },
  
  // Remove specific queries from cache
  removeQueries: (queryKey: readonly unknown[]) => {
    return queryClient.removeQueries({ queryKey });
  },
  
  // Prefetch data
  prefetchDashboardStats: () => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.stats(),
      queryFn: () => import('../services/api').then(({ apiClient }) => apiClient.analytics.getDashboardStats()),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  },
};

// Background refetch configuration
export const backgroundRefetchConfig = {
  // Refetch dashboard data every 30 seconds when tab is active
  dashboard: {
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
  },
  
  // Refetch analytics data every 5 minutes
  analytics: {
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
  },
  
  // Don't auto-refetch static data
  static: {
    refetchInterval: false,
    refetchIntervalInBackground: false,
  },
};

// Development tools
if (process.env.NODE_ENV === 'development') {
  // Add query client to window for debugging
  (window as any).__queryClient = queryClient;
}
