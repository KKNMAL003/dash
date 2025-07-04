import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import type { Profile } from '../../lib/supabase';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!profile?.id) {
        throw new Error('No profile ID available');
      }
      return apiClient.customers.updateProfile(profile.id, updates);
    },
    onSuccess: (data) => {
      // Update the profile in the auth context cache
      queryClient.setQueryData(['profile', data.id], data);
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

// For business settings, we'll use localStorage since there's no backend table
export function useBusinessSettings() {
  const getBusinessSettings = () => {
    const stored = localStorage.getItem('businessSettings');
    return stored ? JSON.parse(stored) : {
      business_name: 'Onolo Group',
      business_address: '123 Business St, City, State 12345',
      business_phone: '+1234567890',
      business_email: 'info@onolo.com',
      operating_hours_start: '08:00',
      operating_hours_end: '18:00',
    };
  };

  const saveBusinessSettings = (settings: any) => {
    localStorage.setItem('businessSettings', JSON.stringify(settings));
    toast.success('Business settings saved successfully');
  };

  return {
    getBusinessSettings,
    saveBusinessSettings,
  };
}

// For notification settings, we'll use localStorage since there's no backend table
export function useNotificationSettings() {
  const getNotificationSettings = () => {
    const stored = localStorage.getItem('notificationSettings');
    return stored ? JSON.parse(stored) : {
      email_new_orders: true,
      email_order_updates: true,
      email_customer_messages: true,
      sms_urgent_notifications: true,
      push_new_orders: true,
      push_delivery_updates: true,
    };
  };

  const saveNotificationSettings = (settings: any) => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    toast.success('Notification settings saved successfully');
  };

  return {
    getNotificationSettings,
    saveNotificationSettings,
  };
}
