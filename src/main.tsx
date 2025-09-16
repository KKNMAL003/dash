/// <reference types="vite/client" />
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/notificationTest.ts' // Import test utilities

// Remove initial loading spinner
const removeInitialLoader = () => {
  const loader = document.querySelector('.initial-loading');
  if (loader) {
    loader.remove();
  }
};

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, prompt user to refresh
                if (confirm('New version available! Refresh to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
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
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // Remove initial loader after successful render
  setTimeout(removeInitialLoader, 100);
} catch (error) {
  console.error('Hydration error:', error);
  
  // Fallback: clear the root and re-render
  rootElement.innerHTML = '';
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
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