import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cacheUtils, queryKeys } from '../config/queryClient';

interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: () => void;
  onMaxRetriesReached?: () => void;
}

export function useRetry({
  maxRetries = 3,
  retryDelay = 1000,
  onRetry,
  onMaxRetriesReached,
}: UseRetryOptions = {}) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const queryClient = useQueryClient();

  const retry = useCallback(async (queryKeys?: string[]) => {
    if (retryCount >= maxRetries) {
      onMaxRetriesReached?.();
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      // Wait for retry delay
      await new Promise(resolve => setTimeout(resolve, retryDelay));

      // Invalidate specific queries or all queries
      if (queryKeys && queryKeys.length > 0) {
        await Promise.all(
          queryKeys.map(key => queryClient.invalidateQueries({ queryKey: [key] }))
        );
      } else {
        await queryClient.invalidateQueries();
      }

      onRetry?.();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, maxRetries, retryDelay, onRetry, onMaxRetriesReached, queryClient]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  const canRetry = retryCount < maxRetries;

  return {
    retry,
    reset,
    retryCount,
    isRetrying,
    canRetry,
    maxRetries,
  };
}

// Hook for retrying specific dashboard queries
export function useDashboardRetry() {
  const baseRetry = useRetry({
    maxRetries: 3,
    retryDelay: 2000,
    onRetry: () => {
      console.log('Retrying dashboard data fetch...');
    },
    onMaxRetriesReached: () => {
      console.warn('Max retries reached for dashboard data');
    },
  });

  const retryDashboard = useCallback(async (specificQueries?: string[]) => {
    if (specificQueries) {
      return baseRetry.retry(specificQueries);
    } else {
      await cacheUtils.invalidateDashboard();
    }
  }, [baseRetry]);

  return {
    ...baseRetry,
    retry: retryDashboard,
  };
}

// Hook for retrying analytics queries
export function useAnalyticsRetry() {
  const baseRetry = useRetry({
    maxRetries: 3,
    retryDelay: 2000,
    onRetry: () => {
      console.log('Retrying analytics data fetch...');
    },
    onMaxRetriesReached: () => {
      console.warn('Max retries reached for analytics data');
    },
  });

  const retryAnalytics = useCallback(async (specificQueries?: string[]) => {
    if (specificQueries) {
      return baseRetry.retry(specificQueries);
    } else {
      await cacheUtils.invalidateAnalytics();
    }
  }, [baseRetry]);

  return {
    ...baseRetry,
    retry: retryAnalytics,
  };
}
