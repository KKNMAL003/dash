import React from 'react';
import { Eye, CheckCircle, Clock, User, MapPin, Phone, Calendar, CreditCard } from 'lucide-react';
import { Button, StatusBadge } from '../../../shared/components/ui';
import { formatCurrency, formatDateTime, formatOrderId } from '../../../shared/utils/formatters';
import { ORDER_STATUS_FLOW } from '../../../shared/utils/constants';
import type { Order } from '../../../shared/types';

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
  isUpdating?: boolean;
}

export function OrderCard({ order, onViewDetails, onUpdateStatus, isUpdating }: OrderCardProps) {
  const nextStatus = ORDER_STATUS_FLOW[order.status];

  return (
    <div className="card p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Order {formatOrderId(order.id)}
            </h3>
            <StatusBadge status={order.status} type="order" />
            {order.payment_status === 'paid' && (
              <StatusBadge status={order.payment_status} type="payment" size="sm" />
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">{order.customer_name}</span>
              </div>
              <div className="flex items-center space-x-2 mb-1">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{order.delivery_phone || 'No phone'}</span>
              </div>
            </div>
            <div>
              <div className="flex items-start space-x-2 mb-1">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <span>{order.delivery_address}</span>
              </div>
              {order.delivery_date && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs">
                    Scheduled: {formatDateTime(order.delivery_date)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">{formatCurrency(order.total_amount)}</span>
              </div>
              <p className="text-xs">
                {formatDateTime(order.created_at)} • {order.payment_method?.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
          
          {order.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700">Delivery Notes:</p>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={() => onViewDetails(order)}
          >
            View Details
          </Button>
          
          {nextStatus && (
            <Button
              size="sm"
              leftIcon={<CheckCircle className="w-4 h-4" />}
              onClick={() => onUpdateStatus(order.id, nextStatus)}
              isLoading={isUpdating}
            >
              Mark as {nextStatus.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}