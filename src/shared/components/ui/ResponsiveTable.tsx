import React from 'react';
import { ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
  mobileLabel?: string;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  className,
  emptyMessage = 'No data available',
  loading = false,
}: ResponsiveTableProps<T>) {
  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`card p-8 text-center ${className}`}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`card overflow-hidden ${className}`}>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
              {onRowClick && <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr
                key={index}
                className={onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || ''}`}
                  >
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </td>
                ))}
                {onRowClick && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {data.map((item, index) => (
          <div
            key={index}
            className={`p-4 border-b border-gray-200 last:border-b-0 ${
              onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
            }`}
            onClick={() => onRowClick?.(item)}
          >
            <div className="space-y-2">
              {columns
                .filter(column => !column.hideOnMobile)
                .map((column) => (
                  <div key={String(column.key)} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500 min-w-0 flex-1">
                      {column.mobileLabel || column.header}:
                    </span>
                    <span className="text-sm text-gray-900 ml-2 text-right">
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </span>
                  </div>
                ))}
            </div>
            {onRowClick && (
              <div className="mt-3 flex justify-end">
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Specialized component for order tables
interface OrderTableProps {
  orders: any[];
  onOrderClick?: (order: any) => void;
  loading?: boolean;
  className?: string;
}

export function OrderTable({ orders, onOrderClick, loading, className }: OrderTableProps) {
  const columns: Column<any>[] = [
    {
      key: 'id',
      header: 'Order ID',
      render: (id) => `#${String(id).slice(-6)}`,
      mobileLabel: 'Order',
    },
    {
      key: 'customer_name',
      header: 'Customer',
      mobileLabel: 'Customer',
    },
    {
      key: 'total_amount',
      header: 'Amount',
      render: (amount) => formatCurrency(Number(amount)),
      className: 'text-right',
      mobileLabel: 'Amount',
    },
    {
      key: 'status',
      header: 'Status',
      render: (status) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          status === 'completed' ? 'bg-green-100 text-green-800' :
          status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
        </span>
      ),
      mobileLabel: 'Status',
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (date) => new Date(date).toLocaleDateString(),
      hideOnMobile: true,
    },
  ];

  return (
    <ResponsiveTable
      data={orders}
      columns={columns}
      onRowClick={onOrderClick}
      loading={loading}
      emptyMessage="No orders found"
      className={className}
    />
  );
}
