import React from 'react';
import { clsx } from 'clsx';
import type { OrderStatus, PaymentStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | string;
  type?: 'order' | 'payment' | 'custom';
  size?: 'sm' | 'md';
}

const orderStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  order_received: 'bg-orange-100 text-orange-800',
  order_confirmed: 'bg-purple-100 text-purple-800',
  preparing: 'bg-amber-100 text-amber-800',
  scheduled_for_delivery: 'bg-indigo-100 text-indigo-800',
  driver_dispatched: 'bg-cyan-100 text-cyan-800',
  out_for_delivery: 'bg-green-100 text-green-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
};

export function StatusBadge({ status, type = 'order', size = 'md' }: StatusBadgeProps) {
  const getColorClass = () => {
    switch (type) {
      case 'order':
        return orderStatusColors[status as OrderStatus] || 'bg-gray-100 text-gray-800';
      case 'payment':
        return paymentStatusColors[status as PaymentStatus] || 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        getColorClass(),
        sizes[size]
      )}
    >
      {formatStatus(status)}
    </span>
  );
}