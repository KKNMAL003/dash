import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './shared/config/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { ErrorBoundary } from './shared/components/ui';
import { useGlobalErrorHandler, useNetworkStatus } from './shared/hooks/useErrorRecovery';
import { LoadingSpinner } from './shared/components/ui';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';

// Lazy load all pages for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const DeliveryPage = lazy(() => import('./pages/DeliveryPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);



function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={
                    <Suspense fallback={<PageLoader />}>
                      <DashboardPage />
                    </Suspense>
                  } />
                  <Route path="/orders" element={
                    <Suspense fallback={<PageLoader />}>
                      <OrdersPage />
                    </Suspense>
                  } />
                  <Route path="/customers" element={
                    <Suspense fallback={<PageLoader />}>
                      <CustomersPage />
                    </Suspense>
                  } />
                  <Route path="/chat" element={
                    <Suspense fallback={<PageLoader />}>
                      <ChatPage />
                    </Suspense>
                  } />

                  <Route path="/delivery" element={
                    <Suspense fallback={<PageLoader />}>
                      <DeliveryPage />
                    </Suspense>
                  } />
                  <Route path="/analytics" element={
                    <Suspense fallback={<PageLoader />}>
                      <AnalyticsPage />
                    </Suspense>
                  } />
                  <Route path="/settings" element={
                    <Suspense fallback={<PageLoader />}>
                      <SettingsPage />
                    </Suspense>
                  } />
                </Routes>
              </ErrorBoundary>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  // Initialize global error handling
  useGlobalErrorHandler();
  const { isOnline } = useNetworkStatus();
  const [showIdleBanner, setShowIdleBanner] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const idleCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inactivity tracking (15 minutes)
  const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

  useEffect(() => {
    // Activity event handlers
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      if (showIdleBanner) {
        setShowIdleBanner(false);
      }
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for inactivity every 30 seconds
    idleCheckIntervalRef.current = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime >= IDLE_TIMEOUT && !showIdleBanner) {
        setShowIdleBanner(true);
      }
    }, 30000);

    // Visibility change handler
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const idleTime = Date.now() - lastActivityRef.current;
        
        // If idle timeout exceeded when tab becomes visible, show banner
        if (idleTime >= IDLE_TIMEOUT) {
          setShowIdleBanner(true);
        }
        
        // Proactively refresh session and queries
        try {
          // Refresh Supabase session
          await supabase.auth.getSession();
          
          // Refetch all stale queries
          queryClient.refetchQueries({ type: 'all', stale: true });
        } catch (error) {
          console.error('Error refreshing session on visibility change:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showIdleBanner]);

  const handleRefreshNow = () => {
    window.location.reload();
  };

  const handleContinue = () => {
    lastActivityRef.current = Date.now();
    setShowIdleBanner(false);
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {(() => {
          // Expose queryClient for global error recovery and visibility refetch (dev only)
          if (import.meta.env.DEV) {
            (window as any).__queryClient = queryClient;
          }
          return null;
        })()}
        <AuthProvider>
          <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
              containerStyle={{
                left: 'auto',
                bottom: 'auto',
                pointerEvents: 'none',
              }}
            />
            {/* Network status indicator */}
            {!isOnline && (
              <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50 pointer-events-none">
                You are offline. Some features may not work.
              </div>
            )}
            {/* Inactivity banner */}
            {showIdleBanner && (
              <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-gray-900 px-4 py-3 shadow-lg z-50 pointer-events-auto">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">
                      Session inactive. Please refresh to resume or continue working.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleContinue}
                      className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-white hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Continue
                    </button>
                    <button
                      onClick={handleRefreshNow}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
                    >
                      Refresh Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;