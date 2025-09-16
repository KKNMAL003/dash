import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Database } from '../../lib/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type Message = Database['public']['Tables']['communication_logs']['Row'];

export interface ClientNotification {
  id: string;
  type: 'order_new' | 'order_status_change' | 'order_cancelled' | 'message_new';
  title: string;
  message: string;
  data: any;
  created_at: string;
  is_read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load notifications from localStorage
  const loadNotifications = useCallback(() => {
    if (!user) return;
    
    const stored = localStorage.getItem(`notifications_${user.id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(parsed);
      setUnreadCount(parsed.filter((n: ClientNotification) => !n.is_read).length);
    }
    setLoading(false);
  }, [user]);

  // Save notifications to localStorage
  const saveNotifications = useCallback((newNotifications: ClientNotification[]) => {
    if (!user) return;
    
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(newNotifications));
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.is_read).length);
  }, [user]);

  // Add a new notification
  const addNotification = useCallback((notification: Omit<ClientNotification, 'id' | 'created_at' | 'is_read'>) => {
    if (!user) return;

    const newNotification: ClientNotification = {
      ...notification,
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    const current = notifications;
    const updated = [newNotification, ...current].slice(0, 100); // Keep only last 100
    saveNotifications(updated);
  }, [user, notifications, saveNotifications]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    );
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // Create notification from order change
  const createOrderNotification = useCallback((order: Order, changeType: 'new' | 'status_change' | 'cancelled') => {
    const title = changeType === 'new' ? 'New Order Received' :
                  changeType === 'cancelled' ? 'Order Cancelled' :
                  'Order Status Updated';
    
    const message = changeType === 'new' ? `New order #${order.id.slice(-8)} from ${order.customer_name}` :
                   changeType === 'cancelled' ? `Order #${order.id.slice(-8)} has been cancelled` :
                   `Order #${order.id.slice(-8)} status changed to ${order.status}`;

    addNotification({
      type: changeType === 'new' ? 'order_new' :
            changeType === 'cancelled' ? 'order_cancelled' : 'order_status_change',
      title,
      message,
      data: {
        order_id: order.id,
        customer_name: order.customer_name,
        status: order.status,
        total_amount: order.total_amount,
      },
    });
  }, [addNotification]);

  // Create notification from new message
  const createMessageNotification = useCallback((message: Message) => {
    if (message.sender_type !== 'customer') return;

    addNotification({
      type: 'message_new',
      title: 'New Message from Customer',
      message: `${message.subject || 'New message'}: ${message.message.substring(0, 100)}${message.message.length > 100 ? '...' : ''}`,
      data: {
        message_id: message.id,
        customer_id: message.customer_id,
        subject: message.subject,
        message: message.message,
      },
    });
  }, [addNotification]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    // Subscribe to order changes
    const orderChannel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            createOrderNotification(payload.new as Order, 'new');
          } else if (payload.eventType === 'UPDATE') {
            const oldOrder = payload.old as Order;
            const newOrder = payload.new as Order;
            
            if (newOrder.status === 'cancelled' && oldOrder.status !== 'cancelled') {
              createOrderNotification(newOrder, 'cancelled');
            } else if (newOrder.status !== oldOrder.status) {
              createOrderNotification(newOrder, 'status_change');
            }
          }
        }
      )
      .subscribe();

    // Subscribe to new messages
    const messageChannel = supabase
      .channel('admin-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'communication_logs',
        },
        (payload) => {
          createMessageNotification(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [user, loadNotifications, createOrderNotification, createMessageNotification]);

  return {
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
