/// <reference types="vite/client" />
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Feature flag for service worker in production
const ENABLE_SW = import.meta.env.VITE_ENABLE_SW === 'true';
const SW_VERSION = import.meta.env.VITE_SW_VERSION || Date.now().toString();
// Dev-only: notification testing utilities
if (import.meta.env.DEV) {
  import('./utils/notificationTest.ts');
}

// Remove initial loading spinner
const removeInitialLoader = () => {
  const loader = document.querySelector('.initial-loading');
  if (loader) {
    loader.remove();
  }
};

// Force cache invalidation in development
if (import.meta.env.DEV) {
  // Force reload if page was restored from cache
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      console.log('Page restored from BFCache, reloading...');
      window.location.reload();
    }
  });
}

// Register/unregister service worker depending on environment
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (import.meta.env.PROD && ENABLE_SW) {
      navigator.serviceWorker.register(`/sw.js?v=${SW_VERSION}`)
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates every 30 seconds in production
          setInterval(() => {
            registration.update();
          }, 30000);
          
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Auto-reload for critical updates
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    } else {
      // In dev or when disabled: ensure no service workers control the page and clear app caches to avoid interference
      navigator.serviceWorker.getRegistrations?.().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys
            .filter((k) => k.startsWith('onolo-admin-'))
            .forEach((k) => caches.delete(k));
        });
      }
    }
  });
}

// Hydration optimization
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Create root with hydration optimization
const root = ReactDOM.createRoot(rootElement);

// Render with error boundary for hydration
try {
  root.render(
    import.meta.env.PROD ? (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    ) : (
      <App />
    )
  );
  
  // Remove initial loader after successful render
  setTimeout(removeInitialLoader, 100);
} catch (error) {
  console.error('Hydration error:', error);
  
  // Fallback: clear the root and re-render
  rootElement.innerHTML = '';
  root.render(
    import.meta.env.PROD ? (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    ) : (
      <App />
    )
  );
  
  removeInitialLoader();
}

// Handle chunk loading errors
window.addEventListener('error', (event) => {
  if (event.error?.message?.includes('ChunkLoadError') ||
      event.error?.message?.includes('Loading chunk')) {
    console.log('Chunk loading error detected, reloading...');
    window.location.reload();
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('ChunkLoadError') ||
      event.reason?.message?.includes('Loading chunk')) {
    console.log('Chunk loading error in promise, reloading...');
    window.location.reload();
  }
});

// BFCache safeguard: Force reload when page is restored from BFCache
// This prevents stale auth tokens and hung network connections
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    console.log('Page restored from BFCache, reloading to ensure fresh state...');
    window.location.reload();
  }
});