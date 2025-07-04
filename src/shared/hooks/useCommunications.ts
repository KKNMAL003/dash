import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiClient } from '../services/api';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export function useCustomersWithChats(searchTerm?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customers-with-chats', searchTerm],
    queryFn: () => apiClient.communications.getCustomersWithChats(searchTerm),
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchInterval: 15000, // Refetch every 15 seconds as fallback
  });

  // Set up real-time subscription for communication logs
  useEffect(() => {
    const subscription = supabase
      .channel('communication-logs-global')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communication_logs',
        },
        (payload) => {
          console.log('Communication log update received:', payload);
          // Invalidate customers with chats when any communication log changes
          queryClient.invalidateQueries({ queryKey: ['customers-with-chats'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return query;
}

export function useCustomerMessages(customerId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', customerId],
    queryFn: () => apiClient.communications.getByCustomerId(customerId),
    enabled: !!customerId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchInterval: 10000, // Refetch every 10 seconds as fallback
  });

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!customerId) return;

    const subscription = supabase
      .channel(`messages-${customerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communication_logs',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          console.log('Message update received:', payload);
          // Invalidate and refetch messages when changes occur
          queryClient.invalidateQueries({ queryKey: ['messages', customerId] });
          queryClient.invalidateQueries({ queryKey: ['customers-with-chats'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [customerId, queryClient]);

  return query;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.communications.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['customers-with-chats'] });
      toast.success('Message sent successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.communications.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers-with-chats'] });
    },
  });
}