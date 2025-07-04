import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponsiveTable, OrderTable } from '../ResponsiveTable';

const mockRecentOrders = [
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

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe('ResponsiveTable', () => {
  const mockColumns = [
    { key: 'name' as const, header: 'Name', className: 'font-medium' },
    { key: 'email' as const, header: 'Email' },
    { key: 'role' as const, header: 'Role' },
  ];

  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ];

  beforeEach(() => {
    mockMatchMedia(false); // Desktop by default
  });

  it('renders table on desktop', () => {
    render(
      <ResponsiveTable
        columns={mockColumns}
        data={mockData}
      />
    );

    // Should render as table
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    
    // Should show data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('renders cards on mobile', () => {
    mockMatchMedia(true); // Mobile
    
    render(
      <ResponsiveTable
        columns={mockColumns}
        data={mockData}
      />
    );

    // Should not render table
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    
    // Should render cards
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <ResponsiveTable
        columns={mockColumns}
        data={[]}
        loading={true}
      />
    );

    // Should show skeleton loading
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3); // 3 skeleton rows
  });

  it('shows empty state', () => {
    render(
      <ResponsiveTable
        columns={mockColumns}
        data={[]}
        emptyMessage="No data found"
      />
    );

    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ResponsiveTable
        columns={mockColumns}
        data={mockData}
        className="custom-table"
      />
    );

    expect(container.firstChild).toHaveClass('custom-table');
  });

  it('applies column className', () => {
    render(
      <ResponsiveTable
        columns={mockColumns}
        data={mockData}
      />
    );

    const nameCell = screen.getByText('John Doe');
    expect(nameCell).toHaveClass('font-medium');
  });
});

describe('OrderTable', () => {
  beforeEach(() => {
    mockMatchMedia(false); // Desktop by default
  });

  it('renders order data correctly', () => {
    render(<OrderTable orders={mockRecentOrders} />);

    // Check headers
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();

    // Check data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('R125.50')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('R89.99')).toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    render(<OrderTable orders={mockRecentOrders} />);

    expect(screen.getByText('R125.50')).toBeInTheDocument();
    expect(screen.getByText('R89.99')).toBeInTheDocument();
    expect(screen.getByText('R234.75')).toBeInTheDocument();
  });

  it('displays status badges with correct styling', () => {
    render(<OrderTable orders={mockRecentOrders} />);

    const pendingBadge = screen.getByText('pending');
    const processingBadge = screen.getByText('processing');
    const shippedBadge = screen.getByText('shipped');

    expect(pendingBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    expect(processingBadge).toHaveClass('bg-gray-100', 'text-gray-800');
    expect(shippedBadge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('formats dates correctly', () => {
    render(<OrderTable orders={mockRecentOrders} />);

    // Should format dates in a readable format
    expect(screen.getByText(/Jan 15/)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<OrderTable orders={[]} loading={true} />);

    expect(screen.getAllByTestId('skeleton')).toHaveLength(5); // 5 skeleton rows
  });

  it('shows empty state', () => {
    render(<OrderTable orders={[]} />);

    expect(screen.getByText('No orders found')).toBeInTheDocument();
  });

  it('renders mobile cards correctly', () => {
    mockMatchMedia(true); // Mobile
    
    render(<OrderTable orders={mockRecentOrders} />);

    // Should not render table
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    
    // Should render order data in cards
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('R125.50')).toBeInTheDocument();
  });

  it('handles click events on orders', () => {
    const handleOrderClick = vi.fn();
    render(
      <OrderTable 
        orders={mockRecentOrders} 
        onOrderClick={handleOrderClick}
      />
    );

    const firstOrderRow = screen.getByText('John Doe').closest('tr');
    expect(firstOrderRow).toHaveClass('cursor-pointer', 'hover:bg-gray-50');

    firstOrderRow?.click();
    expect(handleOrderClick).toHaveBeenCalledWith(mockRecentOrders[0]);
  });

  it('applies accessibility attributes', () => {
    render(<OrderTable orders={mockRecentOrders} />);

    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-label', 'Recent orders');

    // Check for proper table structure
    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders).toHaveLength(4);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4); // 1 header + 3 data rows
  });

  it('supports keyboard navigation when clickable', () => {
    const handleOrderClick = vi.fn();
    render(
      <OrderTable 
        orders={mockRecentOrders} 
        onOrderClick={handleOrderClick}
      />
    );

    const firstOrderRow = screen.getByText('John Doe').closest('tr');
    expect(firstOrderRow).toHaveAttribute('tabIndex', '0');
    expect(firstOrderRow).toHaveAttribute('role', 'button');

    // Simulate Enter key press
    firstOrderRow?.focus();
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    firstOrderRow?.dispatchEvent(enterEvent);

    expect(handleOrderClick).toHaveBeenCalledWith(mockRecentOrders[0]);
  });
});
