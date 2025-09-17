import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, Check, Trash2, Package, MessageSquare, AlertCircle, Clock } from 'lucide-react';
import { useNotifications, ClientNotification } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order_new':
    case 'order_status_change':
    case 'order_cancelled':
      return <Package className="h-4 w-4 text-blue-500" />;
    case 'message_new':
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    case 'system':
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'order_new':
      return 'bg-blue-50 border-blue-200';
    case 'order_status_change':
      return 'bg-yellow-50 border-yellow-200';
    case 'order_cancelled':
      return 'bg-red-50 border-red-200';
    case 'message_new':
      return 'bg-green-50 border-green-200';
    case 'system':
      return 'bg-orange-50 border-orange-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  const handleSelectNotification = (id: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => markAsRead(id));
    setSelectedNotifications(new Set());
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => deleteNotification(id));
    setSelectedNotifications(new Set());
  };

  // Close on Escape and lock background scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = original;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const panel = (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-25" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="border-b border-gray-200 px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center space-x-1 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
                  >
                    <Check className="h-3 w-3" />
                    <span>Mark all read</span>
                  </button>
                  {selectedNotifications.size > 0 && (
                    <>
                      <button
                        onClick={handleBulkMarkAsRead}
                        className="flex items-center space-x-1 rounded-md bg-green-50 px-2 py-1 text-xs text-green-600 hover:bg-green-100"
                      >
                        <Check className="h-3 w-3" />
                        <span>Mark selected read</span>
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="flex items-center space-x-1 rounded-md bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete selected</span>
                      </button>
                    </>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {selectedNotifications.size} selected
                </span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You're all caught up! New notifications will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {getNotificationIcon(notification.type)}
                          <h4 className={`text-sm font-medium ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="rounded-md p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render in a portal to avoid stacking context issues
  return createPortal(panel, document.body);
}
