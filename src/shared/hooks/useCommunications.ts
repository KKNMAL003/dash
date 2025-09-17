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
    refetchInterval: 30000, // Refetch every 30 seconds as fallback (reduced frequency)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Set up real-time subscription for communication logs with better error handling
  useEffect(() => {
    let subscription: any = null;
    let retryCount = 0;
    const maxRetries = 5;

    const setupSubscription = () => {
      subscription = supabase
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
            
            // Optimistic updates for better UX
            if (payload.eventType === 'INSERT' && payload.new) {
              const newMessage = payload.new as any;
              if (newMessage.customer_id) {
                // Update customers list optimistically
                queryClient.setQueryData(['customers-with-chats'], (old: any) => {
                  if (!old) return old;
                  
                  return old.map((customer: any) => {
                    if (customer.id === newMessage.customer_id) {
                      return {
                        ...customer,
                        latest_message: newMessage,
                        unread_count: newMessage.sender_type === 'customer' 
                          ? (customer.unread_count || 0) + 1 
                          : customer.unread_count || 0
                      };
                    }
                    return customer;
                  });
                });
              }
            }

            // Invalidate queries for fresh data
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
            retryCount = 0; // Reset retry count on successful subscription
          } else if (status === 'CLOSED') {
            // Attempt to resubscribe when channel closes (e.g., after being away)
            if (retryCount < maxRetries) {
              retryCount++;
              const delay = Math.min(1000 * 2 ** retryCount, 15000);
              console.log(`Channel closed. Retrying subscription in ${delay}ms...`);
              setTimeout(setupSubscription, delay);
            }
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error subscribing to communication logs');
            if (retryCount < maxRetries) {
              retryCount++;
              const delay = Math.min(1000 * 2 ** retryCount, 15000);
              console.log(`Retrying subscription (${retryCount}/${maxRetries}) in ${delay}ms...`);
              setTimeout(setupSubscription, delay); // Exponential backoff with cap
            }
          }
        });
    };

    setupSubscription();

    return () => {
      console.log('Unsubscribing from communication logs');
      if (subscription) {
        subscription.unsubscribe();
      }
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
    refetchInterval: 20000, // Refetch every 20 seconds as fallback (reduced frequency)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Set up real-time subscription for new messages with better error handling
  useEffect(() => {
    if (!customerId) return;

    let subscription: any = null;
    let retryCount = 0;
    const maxRetries = 5;

    const setupSubscription = () => {
      subscription = supabase
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
            
            // Optimistic updates for better UX
            if (payload.eventType === 'INSERT' && payload.new) {
              const newMessage = payload.new as any;
              queryClient.setQueryData(['messages', customerId], (old: any) => {
                if (!old) return [newMessage];
                
                // Check if message already exists to avoid duplicates
                const exists = old.some((msg: any) => msg.id === newMessage.id);
                if (exists) return old;
                
                return [...old, newMessage];
              });
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              const updatedMessage = payload.new as any;
              queryClient.setQueryData(['messages', customerId], (old: any) => {
                if (!old) return old;
                
                return old.map((msg: any) => 
                  msg.id === updatedMessage.id ? updatedMessage : msg
                );
              });
            }

            // Invalidate queries for fresh data
            queryClient.invalidateQueries({ queryKey: ['messages', customerId] });
            queryClient.invalidateQueries({ queryKey: ['customers-with-chats'] });
          }
        )
        .subscribe((status) => {
          console.log(`Message subscription status for customer ${customerId}:`, status);
          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to messages for customer ${customerId}`);
            retryCount = 0; // Reset retry count on successful subscription
          } else if (status === 'CLOSED') {
            if (retryCount < maxRetries) {
              retryCount++;
              const delay = Math.min(1000 * 2 ** retryCount, 15000);
              console.log(`Message channel closed for ${customerId}. Retrying in ${delay}ms...`);
              setTimeout(setupSubscription, delay);
            }
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`Error subscribing to messages for customer ${customerId}`);
            if (retryCount < maxRetries) {
              retryCount++;
              const delay = Math.min(1000 * 2 ** retryCount, 15000);
              console.log(`Retrying message subscription for customer ${customerId} (${retryCount}/${maxRetries}) in ${delay}ms...`);
              setTimeout(setupSubscription, delay); // Exponential backoff with cap
            }
          }
        });
    };

    setupSubscription();

    return () => {
      console.log(`Unsubscribing from messages for customer ${customerId}`);
      if (subscription) {
        subscription.unsubscribe();
      }
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

      // Snapshot the previous values
      const previousMessages = queryClient.getQueryData(['messages', variables.customerId]);
      const previousCustomers = queryClient.getQueryData(['customers-with-chats']);

      // Create optimistic message with better structure
      const optimisticMessage = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        staff: variables.staffId ? { 
          first_name: 'You', 
          last_name: '',
          id: variables.staffId 
        } : null,
        isOptimistic: true // Flag to identify optimistic messages
      };

      // Optimistically update messages
      queryClient.setQueryData(['messages', variables.customerId], (old: any) => {
        if (!old) return [optimisticMessage];
        
        // Check if message already exists to avoid duplicates
        const exists = old.some((msg: any) => 
          msg.id === optimisticMessage.id || 
          (msg.isOptimistic && msg.message === optimisticMessage.message && 
           Math.abs(new Date(msg.created_at).getTime() - new Date(optimisticMessage.created_at).getTime()) < 1000)
        );
        
        if (exists) return old;
        
        return [...old, optimisticMessage];
      });

      // Optimistically update customers list
      queryClient.setQueryData(['customers-with-chats'], (old: any) => {
        if (!old) return old;
        
        return old.map((customer: any) => {
          if (customer.id === variables.customerId) {
            return {
              ...customer,
              latest_message: optimisticMessage,
              // Don't increment unread count for staff messages
              unread_count: customer.unread_count || 0
            };
          }
          return customer;
        });
      });

      // Return a context object with the snapshotted values
      return { previousMessages, previousCustomers, optimisticMessage };
    },
    onSuccess: (data, variables, context) => {
      // Remove the optimistic message and replace with real data
      if (context?.optimisticMessage) {
        queryClient.setQueryData(['messages', variables.customerId], (old: any) => {
          if (!old) return old;
          return old.filter((msg: any) => msg.id !== context.optimisticMessage.id);
        });
      }

      // Invalidate and refetch to get the real data
      queryClient.invalidateQueries({ queryKey: ['messages', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers-with-chats'] });
      
      // Show success message
      toast.success('Message sent successfully');
    },
    onError: (error, variables, context) => {
      // If the mutation fails, roll back to previous state
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', variables.customerId], context.previousMessages);
      }
      if (context?.previousCustomers) {
        queryClient.setQueryData(['customers-with-chats'], context.previousCustomers);
      }
      
      console.error('Send message error:', error);
      
      // Show error message
      toast.error(error.message || 'Failed to send message');
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['messages', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers-with-chats'] });
    },
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors
      if (failureCount < 2 && error.message?.includes('network')) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
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