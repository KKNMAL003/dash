import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialEntries?: string[];
}

function customRender(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    initialEntries = ['/'],
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock data generators
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
};

export const mockDashboardStats = {
  totalRevenue: 125000,
  totalOrders: 1250,
  totalCustomers: 850,
  averageOrderValue: 100,
  revenueGrowth: 12.5,
  ordersGrowth: 8.3,
  customersGrowth: 15.2,
  avgOrderGrowth: 3.7,
};

export const mockSalesData = [
  { month: 'Jan', sales: 12000, revenue: 120000, orders: 120, customers: 80 },
  { month: 'Feb', sales: 15000, revenue: 150000, orders: 150, customers: 95 },
  { month: 'Mar', sales: 18000, revenue: 180000, orders: 180, customers: 110 },
  { month: 'Apr', sales: 22000, revenue: 220000, orders: 220, customers: 125 },
  { month: 'May', sales: 25000, revenue: 250000, orders: 250, customers: 140 },
  { month: 'Jun', sales: 28000, revenue: 280000, orders: 280, customers: 155 },
];

export const mockOrderStatusData = [
  { status: 'pending', count: 45 },
  { status: 'processing', count: 32 },
  { status: 'shipped', count: 28 },
  { status: 'delivered', count: 156 },
  { status: 'cancelled', count: 12 },
];

export const mockDeliveryData = [
  { day: 'Mon', delivered: 45, pending: 12, failed: 3 },
  { day: 'Tue', delivered: 52, pending: 8, failed: 2 },
  { day: 'Wed', delivered: 48, pending: 15, failed: 4 },
  { day: 'Thu', delivered: 61, pending: 9, failed: 1 },
  { day: 'Fri', delivered: 55, pending: 18, failed: 5 },
  { day: 'Sat', delivered: 38, pending: 22, failed: 7 },
  { day: 'Sun', delivered: 42, pending: 16, failed: 3 },
];

export const mockRecentOrders = [
  {
    id: 'order-1',
    customer_name: 'John Doe',
    total_amount: 125.50,
    status: 'pending',
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 'order-2',
    customer_name: 'Jane Smith',
    total_amount: 89.99,
    status: 'processing',
    created_at: '2024-01-15T09:15:00Z',
  },
  {
    id: 'order-3',
    customer_name: 'Bob Johnson',
    total_amount: 234.75,
    status: 'shipped',
    created_at: '2024-01-15T08:45:00Z',
  },
];

// Mock API responses
export const mockApiResponses = {
  getDashboardStats: () => Promise.resolve(mockDashboardStats),
  getSalesData: () => Promise.resolve(mockSalesData),
  getOrderStatusData: () => Promise.resolve(mockOrderStatusData),
  getDeliveryPerformanceData: () => Promise.resolve(mockDeliveryData),
  getRecentOrders: () => Promise.resolve(mockRecentOrders),
};

// Error mock
export const mockApiError = new Error('API Error');

// Utility to wait for async operations
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Mock intersection observer for charts
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };
