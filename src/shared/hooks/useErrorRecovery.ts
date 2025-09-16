import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: () => void;
  onMaxRetriesReached?: () => void;
}

export function useErrorRecovery(options: ErrorRecoveryOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetry,
    onMaxRetriesReached
  } = options;

  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const queryClient = useQueryClient();

  const retry = useCallback(async () => {
    if (isRetrying || retryCount >= maxRetries) {
      if (retryCount >= maxRetries) {
        onMaxRetriesReached?.();
        toast.error('Maximum retry attempts reached. Please refresh the page.');
      }
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      // Wait for the specified delay
      await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
      
      // Retry all failed queries
      await queryClient.refetchQueries({
        type: 'all',
        stale: true,
      });

      onRetry?.();
      toast.success('Connection restored!');
    } catch (error) {
      console.error('Retry failed:', error);
      toast.error('Retry failed. Please check your connection.');
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, retryCount, maxRetries, retryDelay, queryClient, onRetry, onMaxRetriesReached]);

  const resetRetryCount = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      resetRetryCount();
      toast.success('You are back online!');
      // Automatically retry when coming back online
      queryClient.refetchQueries({
        type: 'all',
        stale: true,
      });
    };

    const handleOffline = () => {
      toast.error('You are offline. Some features may not work.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient, resetRetryCount]);

  return {
    retry,
    retryCount,
    isRetrying,
    resetRetryCount,
    canRetry: retryCount < maxRetries && !isRetrying
  };
}

// Global error boundary hook
export function useGlobalErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Check if it's a network error
      if (event.reason?.message?.includes('fetch') || 
          event.reason?.message?.includes('network') ||
          event.reason?.code === 'NETWORK_ERROR') {
        toast.error('Network error. Retrying...');
        
        // Retry failed queries after a short delay (only if QueryClient is available)
        setTimeout(() => {
          // Check if we're in a QueryClient context
          const queryClient = (window as any).__queryClient;
          if (queryClient) {
            queryClient.refetchQueries({
              type: 'all',
              stale: true,
            });
          }
        }, 2000);
      }
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      
      // Don't show toast for script errors that might be expected
      if (event.error?.message?.includes('ChunkLoadError') ||
          event.error?.message?.includes('Loading chunk')) {
        // This is likely a chunk loading error, try to reload
        toast.error('New version available. Reloading...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        toast.success('Connection restored!');
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast.error('You are offline. Some features may not work.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}
