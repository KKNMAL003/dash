// Performance optimization utilities

export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, Promise<any>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const promise = fn(...args);
    cache.set(key, promise);

    // Clean up on rejection
    promise.catch(() => {
      cache.delete(key);
    });

    return promise;
  }) as T;
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Lazy loading utility for components
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return React.lazy(importFn);
}

// Image optimization utility
export function optimizeImageUrl(url: string, width?: number, height?: number, quality = 80): string {
  // This is a placeholder - in a real app you'd integrate with a service like Cloudinary
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  
  return url.includes('?') 
    ? `${url}&${params.toString()}`
    : `${url}?${params.toString()}`;
}

// Bundle splitting utility
export function preloadRoute(routeComponent: () => Promise<any>) {
  const componentImport = routeComponent();
  // Preload the component
  return componentImport;
}

// Memory management
export function createCleanupManager() {
  const cleanupFunctions = new Set<() => void>();

  return {
    add: (cleanup: () => void) => {
      cleanupFunctions.add(cleanup);
    },
    remove: (cleanup: () => void) => {
      cleanupFunctions.delete(cleanup);
    },
    cleanup: () => {
      cleanupFunctions.forEach(fn => fn());
      cleanupFunctions.clear();
    }
  };
}