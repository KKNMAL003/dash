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

          // Also invalidate specific customer messages if we know the customer_id
          if (payload.new && (payload.new as any).customer_id) {
            queryClient.invalidateQueries({ queryKey: ['messages', (payload.new as any).customer_id] });
          }
          if (payload.old && (payload.old as any).customer_id) {
            queryClient.invalidateQueries({ queryKey: ['messages', (payload.old as any).customer_id] });
          }
        }
      )
      .subscribe((status) => {
        console.log('Communication subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to communication logs');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to communication logs');
        }
      });

    return () => {
      console.log('Unsubscribing from communication logs');
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
          console.log('Message update received for customer:', customerId, payload);
          // Invalidate and refetch messages when changes occur
          queryClient.invalidateQueries({ queryKey: ['messages', customerId] });
          queryClient.invalidateQueries({ queryKey: ['customers-with-chats'] });
        }
      )
      .subscribe((status) => {
        console.log(`Message subscription status for customer ${customerId}:`, status);
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to messages for customer ${customerId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to messages for customer ${customerId}`);
        }
      });

    return () => {
      console.log(`Unsubscribing from messages for customer ${customerId}`);
      subscription.unsubscribe();
    };
  }, [customerId, queryClient]);

  return query;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.communications.sendMessage,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages', variables.customerId] });
      await queryClient.cancelQueries({ queryKey: ['customers-with-chats'] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['messages', variables.customerId]);

      // Optimistically update the messages
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        customer_id: variables.customerId,
        staff_id: variables.staffId,
        message: variables.message,
        sender_type: 'staff' as const,
        is_read: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        log_type: variables.logType || 'user_message',
        subject: variables.subject || null,
        user_id: variables.customerId,
        staff: variables.staffId ? { first_name: 'You', last_name: '' } : null
      };

      queryClient.setQueryData(['messages', variables.customerId], (old: any) => {
        return old ? [...old, optimisticMessage] : [optimisticMessage];
      });

      // Return a context object with the snapshotted value
      return { previousMessages, optimisticMessage };
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch to get the real data
      queryClient.invalidateQueries({ queryKey: ['messages', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers-with-chats'] });
      toast.success('Message sent successfully');
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', variables.customerId], context.previousMessages);
      }
      console.error('Send message error:', error);
      toast.error(error.message || 'Failed to send message');
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['messages', variables.customerId] });
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